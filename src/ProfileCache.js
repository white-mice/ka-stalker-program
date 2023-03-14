import * as API from "./API.js";
import Store from "./Store.js";
import secrets from "../secrets.json" assert {type: "json"}

import chalk from "chalk";
import { EmbedBuilder } from "discord.js";
import { createHash } from "crypto";

const dataRoot = Store.dataRoot;

export default class ProfileCache {

  static #hash(s) {
    return createHash("sha256").update(JSON.stringify(s)).digest("hex");
  }

  static #arrObjEq(a1, a2) {
    return JSON.stringify(a1) == JSON.stringify(a2);
  }

  #client;

  constructor(username, client) {
    return (async () => {
      let p = await API.getUserProfile(username);

      this.username = username;
      this.bio = p.bio;
      this.kaid = p.kaid;
      this.projects = await API.projectsAuthoredBy(this.kaid);
      this.feedback = await API.feedbackByAuthor(this.kaid);

      this.#client = client;
      return this;
    })()
  }

  log(msg) {
    let c = this.#client.channels.cache.get(secrets.CHANNEL_ID);
    c.send(msg);
  }

  async checkProjects() {
    let p = await API.projectsAuthoredBy(this.kaid);
    let curTime = new Date().toLocaleString();

    if (ProfileCache.#arrObjEq(this.projects, p)) { return; }

    let genMsg = (d) => {
      // return "[" + chalk.blue(curTime) + "] " +
      //     chalk.green(this.username) + " " +
      //     d.t + " " +
      //     d.reprNum + ": " +
      //     d.projectIds;
      return new EmbedBuilder()
        .setColor(d.color)
        .setTitle("Activity monitor")
        .setAuthor({ name: this.username })
        .setDescription(`${d.action} ${d.reprNum} - ${d.projectIds}`)
        .setTimestamp()
    }

    let cacheDiff = (action) => {
      let cachedKaids = this.projects.map(x => x.id);
      let updatedKaids = p.map(x => x.id);
      let diff;
      let color;
      if (action == "created") {
        // When new project(s) are made, they won't be in the cache
        diff = updatedKaids.filter(x => !cachedKaids.includes(x));
        color = 0x11d610;
      } else if (action == "deleted") {
        // ...but vice versa for deleted ones
        diff = cachedKaids.filter(x => !updatedKaids.includes(x));
        color = 0xcc0000;
      } else {
        this.log("ERROR: " + JSON.stringify({ cachedKaids, updatedKaids, t }));
        process.exit(1);
      }
      let reprNum = (diff.length == 1) ? "1 program" : diff.length + " programs";
      let projectIds = diff.join(", ");
      let msg = genMsg({ reprNum, projectIds, color, action });
      return { diff, reprNum, projectIds, msg };
    }

    if (this.projects.length < p.length) {
      // new project
      let diff = cacheDiff("created");

      // Save new projects
      let newScratchpads = await Promise.all(diff.diff.map(v => API.scratchpad(v)));
      newScratchpads.forEach(el => {
        // Create a new directory to store programs
        // I'm aware this is the worst way to do this
        try {
          Store.newDir(`${dataRoot}${this.username}/${el.id}`);
        } catch { }
        Store.save(`${Date.now()}.json`, JSON.stringify(el), `${dataRoot}${this.username}/${el.id}/`);
      });
      this.log({ embeds: [diff.msg] });

    } else if (this.projects.length == p.length) {
      // a project got updated
      let cachedHashes = this.projects.map(ProfileCache.#hash);
      let newHashes = p.map(ProfileCache.#hash);
      let changedHashes = newHashes.filter(x => !cachedHashes.includes(x));

      let reprNum = (changedHashes.length == 1) ? "1 program" : changedHashes.length + " programs";
      let projectIds = changedHashes.map((_, i) => p[i].id).join(", ");
      this.log({ embeds: [genMsg({ reprNum, projectIds, color: 0xf1c232, action: "updated" })] })

      let changedScratchpads = await Promise.all(changedHashes.map((_, i) => API.scratchpad(p[i].id)));
      changedScratchpads.forEach(el => {
        try {
          Store.save(`${Date.now()}.json`, JSON.stringify(el), `${dataRoot}${this.username}/${el.id}/`);
        } catch (e) {
          this.log(`No previous backups found for ${el.id}. creating one...`);
          Store.newDir(`${dataRoot}${this.username}/${el.id}`);
          Store.save(`${Date.now()}.json`, JSON.stringify(el), `${dataRoot}${this.username}/${el.id}/`);
        }
      });


    } else if (this.projects.length > p.length) {
      // a project(s) got deleted
      let diff = cacheDiff("deleted");
      this.log({ embeds: [diff.msg] });

      // check if we have backup program(s) in archive
      diff.diff.forEach(k => {
        let savedPrograms = Store.ls(dataRoot + this.username);
        if (!savedPrograms.includes(k)) {
          this.log(`No backup was found for ${k}`);
          return;
        }
        let backups = Store.ls(`${dataRoot}${this.username}/${k}`);
        let latestTimestamp = [...backups.map(v => Number(v.slice(0, -5)))].sort().at(-1);
        this.log(`Backup found from ${new Date(latestTimestamp).toLocaleString()}.`);
        this.log(`You can access it at ${dataRoot}${this.username}/${k}/${latestTimestamp}.json`);
      });


    } else {
      this.log("This is not supposed to happen: " + this.projects + " \np:", p);
    }
    this.projects = p;
  }

  async checkBio() {
    let b = (await API.getUserProfile(this.username)).bio;
    if (this.bio !== b) {
      let curTime = new Date().toLocaleString();
      this.log({
        embeds: [
          new EmbedBuilder()
            .setTitle("Activity monitor: Bio change")
            .setColor(0x0099FF)
            .setAuthor({ name: this.username })
            .setDescription(`${b}`)
            .setTimestamp()

        ]
      });
      Store.save("bio-history.json", JSON.stringify([{ timestamp: curTime, from: this.bio, to: b }]), `${dataRoot}${this.username}/`);
      this.bio = b;
    }
  }

  async checkFeedbackByAuthor() {
    // Get list of all comments made by author
    // If they're the same as the ones in the cache,
    // don't bother checking for specific changes
    let f = await API.feedbackByAuthor(this.kaid);
    if (ProfileCache.#arrObjEq(this.feedback, f)) return;

    // let curTime = new Date().toLocaleString();

    // Create two lists of strings
    // These strings are hex-digests of SHA256 hashes of
    // comments in the cache and in the profile currently
    let A = f.map(ProfileCache.#hash);
    let B = this.feedback.map(ProfileCache.#hash);

    // Check for new comments that won't be in the cache
    let diff1 = A.filter(v => !B.includes(v));

    // Check for comments in our cache that aren't the
    // profile currently (i.e. deleted)
    let diff2 = B.filter(v => !A.includes(v));

    if (diff1.length > 0) {
      let data = diff1.map(v => f[A.indexOf(v)])[0];
      console.log("Comment data", data);
      Store.save("comment-history.json", JSON.stringify([{ type: "new", timestamp: data.date, data: data }]), `${dataRoot}${this.username}/`);
      this.log({
        embeds: [
          new EmbedBuilder()
            .setTitle("Activity monitor: New comment")
            .setColor(0x4169e1)
            .setAuthor({ name: this.username })
            .setDescription(`\`\`\`${data.content}\`\`\``)
            .setTimestamp()
        ]
      });
    }

    if (diff2.length > 0) {
      let data = diff2.map(v => f[B.indexOf(v)])[0];
      console.log("Comments data", diff2.map(v => f[B.indexOf(v)]));
      Store.save("comment-history.json", JSON.stringify([{ type: "delete", timestamp: data.date, data: data }]), `${dataRoot}${this.username}/`);
      this.log({
        embeds: [
          new EmbedBuilder()
            .setTitle("Activity monitor: Comment deleted")
            .setColor(0xff0000)
            .setAuthor({ name: this.username })
            .setDescription(`\`\`\`${data.content}\`\`\``)
            .setTimestamp()
        ]
      });
    }
    this.feedback = f;
  }

  async updateLoop() {
    return Promise.all([this.checkBio(), this.checkProjects(), this.checkFeedbackByAuthor()]);
  }
}	
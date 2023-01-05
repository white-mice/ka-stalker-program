import * as API from "./API.js";
import Store from "./Store.js";

import chalk from "chalk";
import { createHash } from "crypto";

const dataRoot = Store.dataRoot;

export default class ProfileCache {

	static #hash(s) {
		return createHash("sha256").update(JSON.stringify(s)).digest("hex");
	}

	static #arrObjEq(a1, a2) {
		return JSON.stringify(a1) == JSON.stringify(a2);
	}

	constructor(username) {
		return (async () => {
			let p = await API.getUserProfile(username);

			this.username = username;
			this.bio = p.bio;
			this.kaid = p.kaid;
			this.projects = await API.projectsAuthoredBy(this.kaid);
			this.feedback = await API.feedbackByAuthor(this.kaid);
			return this;
		})()
	}

	async checkProjects() {
		let p = await API.projectsAuthoredBy(this.kaid);
	    let curTime = new Date().toLocaleString();

	    if (ProfileCache.#arrObjEq(this.projects, p)) { return; }

	    let genMsg = (d) => {
	        return "[" + chalk.blue(curTime) + "] " +
	            chalk.green(this.username) + " " +
	            d.t + " " +
	            d.reprNum + ": " +
	            d.projectIds;
	    }
	    
	    let cacheDiff = (t) => {
	        let cachedKaids = this.projects.map(x => x.id);
	        let updatedKaids = p.map(x => x.id);
	        let diff;
	        if (t.includes("created")) {
	            // When new project(s) are made, they won't be in the cache
	            diff = updatedKaids.filter(x => !cachedKaids.includes(x));
	        } else if (t.includes("deleted")) {
	            // ...but vice versa for deleted ones
	            diff = cachedKaids.filter(x => !updatedKaids.includes(x));
	        } else {
	            console.log("ERROR:", JSON.stringify({cachedKaids, updatedKaids, t}));
	            process.exit(1);
	        }
	        let reprNum = (diff.length == 1) ? "1 program" : diff.length + " programs";
	        let projectIds = diff.join(", ");
	        let msg = genMsg({ t, reprNum, projectIds });
	        return { diff, reprNum, projectIds, msg };
	    }

	    if (this.projects.length < p.length) {
	        // new project
	        let diff = cacheDiff(chalk.magenta.italic("created"));

	        // Save new projects
	        let newScratchpads = await Promise.all(diff.diff.map(v => API.scratchpad(v)));
	        newScratchpads.forEach(el => {
	            // Create a new directory to store programs
	            // I'm aware this is the worst way to do this
	            try {
	                Store.newDir(`${dataRoot}${this.username}/${el.id}`);
	            } catch {}
	            Store.save(`${Date.now()}.json`, JSON.stringify(el), `${dataRoot}${this.username}/${el.id}/`);
	        });
	        console.log(diff.msg);

	    } else if (this.projects.length == p.length) {
	        // a project got updated
	        let cachedHashes = this.projects.map(ProfileCache.#qHash);
	        let newHashes = p.map(ProfileCache.#qHash);
	        let changedHashes = newHashes.filter(x => !cachedHashes.includes(x));
	        
	        let reprNum = (changedHashes.length == 1) ? "1 program" : changedHashes.length + " programs";
	        let projectIds = changedHashes.map((_, i) => p[i].id).join(", ");
	        console.log(genMsg({ reprNum, projectIds, t: chalk.yellow.italic("updated") }))

	        let changedScratchpads = await Promise.all(changedHashes.map((_,i)=>API.scratchpad(p[i].id)));
	        changedScratchpads.forEach(el => {
	            try {
	                Store.save(`${Date.now()}.json`, JSON.stringify(el), `${dataRoot}${this.username}/${el.id}/`);
	            } catch (e) {
	                console.log(`[${chalk.blue(curTime)}] No previous backups found for ${el.id}. creating one...`);
	                Store.newDir(`${dataRoot}${this.username}/${el.id}`);
	                Store.save(`${Date.now()}.json`, JSON.stringify(el), `${dataRoot}${this.username}/${el.id}/`);
	            }
	        });


	    } else if (this.projects.length > p.length) {
	        // a project(s) got deleted
	        let diff = cacheDiff(chalk.red.italic("deleted"));
	        console.log(diff.msg);

	        // check if we have backup program(s) in archive
	        diff.diff.forEach(k => {
	            let savedPrograms = Store.ls(dataRoot + this.username);
	            if (!savedPrograms.includes(k)) {
	                console.log(`[${chalk.blue(curTime)}] No backup was found for ${k}`);
	                // console.log(`Store output: ${Store.ls(dataRoot + this.username)}`);
	                return;
	            }
	            let backups = Store.ls(`${dataRoot}${this.username}/${k}`);
	            let latestTimestamp = [...backups.map(v => Number(v.slice(0, -5)))].sort().at(-1);
	            console.log(`[${chalk.blue(curTime)}] Backup found from ${new Date(latestTimestamp).toLocaleString()}.`);
	            console.log(`[${chalk.blue(curTime)}] You can access it at ${dataRoot}${this.username}/${k}/${latestTimestamp}.json`);
	        });


	    } else {
	        console.log("This is not supposed to happen:", this.projects, "\np:", p);
	    }
	    this.projects = p;
	}

	async checkBio() {
	    let b = (await API.getUserProfile(this.username)).bio;
	    if (this.bio !== b) {
	        let curTime = new Date().toLocaleString();
	        console.log(`[${chalk.blue(curTime)}] ${chalk.green(this.username)} ${chalk.gray.italic("changed his bio")}: '${b}'`);
	        Store.save("bio-history.json", JSON.stringify([{ timestamp: curTime, from: this.bio, to: b }]), `${dataRoot}${this.username}/`);
	        this.bio = b;
	    }
	}

	async checkFeedbackByAuthor() {
	    let f = await API.feedbackByAuthor(this.kaid);
	    if (ProfileCache.#arrObjEq(this.feedback, f)) return;

	    let curTime = new Date().toLocaleString();
	    
	    let A = f.map(ProfileCache.#qHash);
	    let B = this.feedback.map(ProfileCache.#qHash);
	    let diff1 = A.filter(v => !B.includes(v));
	    let diff2 = B.filter(v => !A.includes(v));

	    if (diff1.length > 0) {
	        let data = diff1.map(v => f[A.indexOf(v)]);
	        Store.save("comment-history.json", JSON.stringify([{ type: "new", timestamp: curTime, data: data}]), `${dataRoot}${this.username}/`)
	        console.log(`${chalk.blue(curTime)} ${chalk.green(this.username)} ${chalk.gray.italic("made comment(s)")}`);
	    }

	    if (diff2.length > 0) {
	        let data = diff2.map(v => f[B.indexOf(v)]);
	        Store.save("comment-history.json", JSON.stringify([{ type: "delete", timestamp: curTime, data: data}]), `${dataRoot}${this.username}/`)
	        console.log(`${chalk.blue(curTime)} ${chalk.green(this.username)} ${chalk.gray.italic("deleted comment(s)")}`);
	    }
	    
	    this.feedback = f;
	}

	async updateLoop() {
		return Promise.all([this.checkBio(), this.checkProjects(), this.checkFeedbackByAuthor()]);
	}
}
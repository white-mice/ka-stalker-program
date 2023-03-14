import ProfileCache from "./src/ProfileCache.js";
import Store from "./src/Store.js";
import * as Bot from "./src/Bot.js";
import stalkList from "./user-watchlist.json" assert {type: "json"}
import KeywordWatcher from "./src/KeywordWatcher.js";

// import chalk from "chalk";
import express from "express";

// Tick rate in milliseconds
// this is the delay between sending fetches to KA
const tickRate = 2000;

// Create a webserver
// so that Replit won't kill my program right after I exit
const app = express();

// Discord client
const dc = await Bot.login();

// Keyword watcher
const keywordWatcher = KeywordWatcher(dc);

const createdFolders = Store.ls(Store.dataRoot);
let cache = [];

for (const v of stalkList) {
  cache.push(new ProfileCache(v, dc));
  if (!createdFolders.includes(v)) {
    Store.newDir(Store.dataRoot + v);
  }
}

cache = await Promise.all(cache);

// Initializing
app.get("/", (req, res) => { res.send("Hello, world!") });
app.listen(3000, () => console.log("Starting project stalker..."));
setInterval(
  async () => {
    await Promise.all(cache.map(v => v.updateLoop()));
    await keywordWatcher();
  }, tickRate);
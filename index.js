import ProfileCache from "./src/ProfileCache.js";
import Store from "./src/Store.js";
import * as Bot from "./src/bot.js";
import stalkList from "./stalkList.json" assert {type:"json"}

import chalk from "chalk";
import express from "express";

// Tick rate in milliseconds
// this is the delay between sending fetches to KA
const tickRate = 2000;

// Create a webserver
// so that Replit won't kill my program right after I exit
const app = express();

// Discord client
const dc = await Bot.login();

const createdFolders = Store.ls(Store.dataRoot);
let cache = [];

for (const v of stalkList) {
    cache.push((await new ProfileCache(v, dc)));
    if (!createdFolders.includes(v)) {
        Store.newDir(Store.dataRoot + v);
    }
}


// Initializing
app.get("/", (req, res) => {res.send("Hello, world!")});
app.listen(3000, () => console.log(chalk.blue("Starting project stalker...")));
setInterval(async() => Promise.all(cache.map(v => v.updateLoop())), tickRate);
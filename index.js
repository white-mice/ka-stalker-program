import ProfileCache from "src/ProfileCache.js";
import Store from "src/Store.js";
import stalkList from "./stalkList.json" assert {type:"json"}

import chalk from "chalk";
import express from "express";

// Tick rate in milliseconds
// this is the delay between sending fetches to KA
const tickRate = 2000;
const app = express();
const createdFolders = Store.ls(Store.dataRoot);
let cache = [];

for (const v of stalkList) {
    cache.push((await new ProfileCache(v)));
    if (!createdFolders.includes(v)) {
        Store.newDir(Store.dataRoot + v);
    }
}


// Initializing
app.get("/", (req, res) => {res.send("Hello, world!")});
app.listen(3000, () => console.log(chalk.blue("Starting project stalker...")));

setInterval(async() => Promise.all(cache.map(v => v.updateLoop())), tickRate);
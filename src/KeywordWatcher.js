import * as API from "./API.js";
import {createHash} from "crypto";

const feedback = async() => (await Promise.all([
  API.allFeedback("COMMENT"),
  // API.allFeedback("REPLY"),
  // API.allFeedback("ANSWER"),
  // API.allFeedback("QUESTION")
])).flat();

const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = s => createHash("sha256").update(JSON.stringify(s)).digest("hex");
const cache = [];

// thanks wkoa
function extract(txt, word) {
  var rx = new RegExp(String.raw`(?:[a-z\d][^=!?,.]*?|)\b${word}\b[^=!?,.]*`, 'gi');
  var arr = rx.exec(txt);
  return (!!arr);
}

async function log(msg) {

}

async function mainLoop() {
  (await feedback()).forEach(v => {
    if (extract(v.content, "Taco Bell") && !cache.includes(hash(v))) {
      cache.push(hash(v))
      console.log("detected:", `https://khanacademy.org${v.permalink}?qa_expand_key=${v.expandKey}`);
    }
  });
}

while (true) { await mainLoop(); await sleep(1000); }
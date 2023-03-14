import * as API from "./API.js";
import { createHash } from "crypto";
import secrets from "../secrets.json" assert {type: "json"}
import keywords from "../keyword-watchlist.json" assert {type: "json"}

const feedback = async () => (await Promise.all([
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

export default function KeywordWatcher(client) {
  let log = (msg) => {
    let c = client.channels.cache.get(secrets.CHANNEL_ID);
    c.send(msg);
  }
  return async () => {
    (await feedback()).forEach(comment => {
      keywords.forEach(keyword => {
        if (extract(comment.content, keyword) && !cache.includes(hash(comment))) {
          cache.push(hash(comment))
          log(`Keyword detected ${keyword}: https://khanacademy.org${comment.permalink}?qa_expand_key=${comment.expandKey}`);
        }
      });
    })
  };
}

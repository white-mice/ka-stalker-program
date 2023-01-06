import { SlashCommandBuilder } from 'discord.js';
import * as API from "../API.js";
import fetch from "node-fetch";

async function comment(msg, prog) {
    try {
        let f = await fetch("https://www.khanacademy.org/api/internal/graphql/AddFeedbackToDiscussion?curriculum=in-in&lang=en&_=221116-1540-9d048a107402_1668693673747", {
          "headers": API.HEADERS,
          "body": "{\"operationName\":\"AddFeedbackToDiscussion\",\"variables\":{\"focusKind\":\"scratchpad\",\"focusId\":\""+prog+"\",\"feedbackType\":\"COMMENT\",\"textContent\":\""+msg+"\"},\"query\":\"mutation AddFeedbackToDiscussion($focusKind: String, $focusId: String, $parentKey: String, $textContent: String!, $feedbackType: FeedbackType!, $fromVideoAuthor: Boolean, $shownLowQualityNotice: Boolean) {\\n  addFeedbackToDiscussion(focusKind: $focusKind, focusId: $focusId, parentKey: $parentKey, textContent: $textContent, feedbackType: $feedbackType, fromVideoAuthor: $fromVideoAuthor, shownLowQualityNotice: $shownLowQualityNotice) {\\n    feedback {\\n      appearsAsDeleted\\n      author {\\n        id\\n        kaid\\n        nickname\\n        avatar {\\n          name\\n          imageSrc\\n          __typename\\n        }\\n        __typename\\n      }\\n      content\\n      date\\n      definitelyNotSpam\\n      deleted\\n      downVoted\\n      expandKey\\n      feedbackType\\n      flaggedBy\\n      flags\\n      focusUrl\\n      focus {\\n        kind\\n        id\\n        translatedTitle\\n        relativeUrl\\n        __typename\\n      }\\n      fromVideoAuthor\\n      key\\n      lowQualityScore\\n      notifyOnAnswer\\n      permalink\\n      qualityKind\\n      replyCount\\n      replyExpandKeys\\n      showLowQualityNotice\\n      sumVotesIncremented\\n      upVoted\\n      ... on LowQualityFeedback {\\n        feedbackCode\\n        feedbackChar\\n        __typename\\n      }\\n      __typename\\n    }\\n    error {\\n      code\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
          "method": "POST"
        });
        console.log(f);
    } catch(e) {
        console.log("[comment]", e);
        return false;
    }
  return true;
}
export const data = new SlashCommandBuilder()
    .setName('comment')
    .setDescription('Comments on a KA program.')
    .addStringOption(option => option.setName('message')
        .setDescription('The message to comment.')
        .setRequired(true))
    .addStringOption(option => option.setName('kaid')
        .setDescription('The KAID of program to comment on.')
        .setRequired(true));

export async function execute(interaction) {
    let msg = interaction.options.getString("message");
    let kaid = interaction.options.getString("kaid");
    if (!(await comment(msg, kaid))) {
        await interaction.reply('Did not go according to plan. Check logs.');
    } else {
        await interaction.reply('Done.');
    }
}
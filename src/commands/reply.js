import fetch from "node-fetch";
import { SlashCommandBuilder } from 'discord.js'

function reply(msg, comment) {
    fetch("https://www.khanacademy.org/api/internal/graphql/AddFeedbackToDiscussion?curriculum=in-in&lang=en&_=221116-1540-9d048a107402_1668694381628", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "x-ka-fkey": "1.0_4snqpt1fq49ns28pqvf125jgrvv51fo55sk51uh3o1q3l42ov4pil3eiog3h2jrodt5_1668691174412",
      "cookie": "_gcl_au=1.1.892465613.1668172909; G_ENABLED_IDPS=google; KAAS=nkOmbyGldGzUrJKteZ9sVA; GOOGAPPUID=x; fkey=1.0_4snqpt1fq49ns28pqvf125jgrvv51fo55sk51uh3o1q3l42ov4pil3eiog3h2jrodt5_1668691174412; _gid=GA1.2.1399470195.1668691177; KAAL=$lYjUnk1jnsS7r67EtwnMCnEjjgb76oOeiQy3VOnXkmg.~rlhwqu$a2FpZF80MjE3MDc0OTg3NjM3MTIwMzkyMTg5MjA*; KAAC=$TlShQfSP2mcBRmMYejW0O5j3VgHrkOOx-7dkx1tb0_A.~rlhwqu$a2FpZF80MjE3MDc0OTg3NjM3MTIwMzkyMTg5MjA*$a2FpZF80MjE3MDc0OTg3NjM3MTIwMzkyMTg5MjA!0!0!0~2; _ga_19G17DJYEE=GS1.1.1668691178.16.1.1668694281.0.0.0; _ga=GA1.1.65318654.1668172910",
      "Referer": "https://www.khanacademy.org/computer-programming/new-webpage/6234604991725568",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "{\"operationName\":\"AddFeedbackToDiscussion\",\"variables\":{\"parentKey\":\"kaencrypted_911bcc70c632b402fceb168fba3f1770_0f21cd6962e94ef4af6af451ba356095203038469f2d4d0bcec0184c1e539158641815331dc8a76f04dabfce7041147bd7d52b04bb7a8c2f4cd285d46aa19ae151a632e8a3c592ba35acaecd3759c9b5c5338ed0fcd6e2e80633d667e905f25d351b13fa6941ef71370d30364a4e133cbd59c139a6204ff45855cbdc42187dd4\",\"textContent\":\""+msg+"\",\"feedbackType\":\"REPLY\"},\"query\":\"mutation AddFeedbackToDiscussion($focusKind: String, $focusId: String, $parentKey: String, $textContent: String!, $feedbackType: FeedbackType!, $fromVideoAuthor: Boolean, $shownLowQualityNotice: Boolean) {\\n  addFeedbackToDiscussion(focusKind: $focusKind, focusId: $focusId, parentKey: $parentKey, textContent: $textContent, feedbackType: $feedbackType, fromVideoAuthor: $fromVideoAuthor, shownLowQualityNotice: $shownLowQualityNotice) {\\n    feedback {\\n      appearsAsDeleted\\n      author {\\n        id\\n        kaid\\n        nickname\\n        avatar {\\n          name\\n          imageSrc\\n          __typename\\n        }\\n        __typename\\n      }\\n      content\\n      date\\n      definitelyNotSpam\\n      deleted\\n      downVoted\\n      expandKey\\n      feedbackType\\n      flaggedBy\\n      flags\\n      focusUrl\\n      focus {\\n        kind\\n        id\\n        translatedTitle\\n        relativeUrl\\n        __typename\\n      }\\n      fromVideoAuthor\\n      key\\n      lowQualityScore\\n      notifyOnAnswer\\n      permalink\\n      qualityKind\\n      replyCount\\n      replyExpandKeys\\n      showLowQualityNotice\\n      sumVotesIncremented\\n      upVoted\\n      ... on LowQualityFeedback {\\n        feedbackCode\\n        feedbackChar\\n        __typename\\n      }\\n      __typename\\n    }\\n    error {\\n      code\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
    "method": "POST"
  });
  }
export const data = new SlashCommandBuilder()
                        .setName("reply")
                        .setDescription("Reply to comment (WIP)");

export async function execute(interaction) {
    await interaction.reply("WIP");
}
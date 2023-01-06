import fetch from "node-fetch"
import url from "url"
import { createInboxAsync, checkInboxAsync } from "tempmail.lol"
import { SlashCommandBuilder } from 'discord.js'

function newAcc(firstname, lastname,email, password) {
    return fetch("https://www.khanacademy.org/api/internal/graphql/signupLearnerWithPasswordMutation?curriculum=in-in&lang=en&", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "x-ka-fkey": "0",
            "cookie": "fkey=0;",
            "Referer": "https://www.khanacademy.org/signup?continue=%2Fprofile%2Fme%2Fcourses",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"operationName\":\"signupLearnerWithPasswordMutation\",\"variables\":{\"password\":\""+password+"\",\"email\":\""+email+"\",\"firstname\":\""+firstname+"\",\"lastname\":\""+lastname+"\",\"birthdate\":\"1997-05-04\"},\"query\":\"mutation signupLearnerWithPasswordMutation($email: String!, $password: String!, $firstname: String!, $lastname: String!, $birthdate: Date!) {\\n  signupLearnerWithPassword(email: $email, password: $password, firstname: $firstname, lastname: $lastname, birthdate: $birthdate) {\\n    user {\\n      id\\n      kaid\\n      canAccessDistrictsHomepage\\n      isTeacher\\n      hasUnresolvedInvitations\\n      transferAuthToken\\n      preferredKaLocale {\\n        id\\n        kaLocale\\n        status\\n        __typename\\n      }\\n      __typename\\n    }\\n    error {\\n      code\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST"
    });
}
function verifyEmailAcc(verifyToken) {
    return fetch("https://www.khanacademy.org/api/internal/graphql/populateCompleteSignup?curriculum=in-in&lang=en&", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "x-ka-fkey": "0",
            "cookie": "fkey=0;",
            "Referer": "https://www.khanacademy.org/completesignup?token=" + verifyToken,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"operationName\":\"populateCompleteSignup\",\"variables\":{\"token\":\""+verifyToken+"\",\"parent\":false},\"query\":\"mutation populateCompleteSignup($token: String, $inviteId: String, $parent: Boolean) {\\n  populateCompleteSignup(token: $token, inviteId: $inviteId, parent: $parent) {\\n    token\\n    inviteId\\n    hideGender\\n    isParent\\n    isTeacher\\n    isStudentInvite\\n    unverifiedUser {\\n      email\\n      nickname\\n      gender\\n      username\\n      __typename\\n    }\\n    error {\\n      code\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST"
    });
}

export const data = new SlashCommandBuilder()
    .setName('account')
    .setDescription('Creates a KA account.')
    .addStringOption(option => option.setName('name')
        .setDescription('The name of the account.')
        .setRequired(true))
    .addStringOption(option => option.setName('password')
        .setDescription('The password of the account.')
        .setRequired(true));

export async function execute(interaction) {
    let name = interaction.options.getString("name");
    let password = interaction.options.getString("password");
    // let name = "Vincent Smith";
    // let password = "testpassword";
    let firstname = name.split(" ")[0];
    let lastname = name.split(" ")[1];
    let inbox = await createInboxAsync(true);
    try {
        console.log("[new] Created new mail:", inbox.address, "with token:", inbox.token);
        let acc = await newAcc(firstname, lastname, inbox.address, password); 
        console.log("[new] Errors creating account:", (await acc.json()));
        let kaToken = url.parse((await checkInboxAsync(inbox))[0].body.split("\n")[2], true).query.token;
        console.log("[new] KA Auth token:", kaToken);
        console.log("[new] Errors verifying acc:", (await (await verifyEmailAcc(kaToken)).text()));
    } catch (e) {
        await interaction.reply('Did not go according to plan. Check logs.');
        console.log("Error:", e);
        return;
    }
    await interaction.reply('Done.');
}
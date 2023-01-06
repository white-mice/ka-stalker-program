import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "node:fs";
import secrets from "../secrets.json" assert { type: "json" }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const commandFiles = readdirSync("./src/commands").filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    // const filePath = join(commandsPath, file);
    const filePath = "./commands/" + file;
    const command = await import(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[loadCommands] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
// client.on("ready", c => {
// 	console.log(`[bot] Ready! Logged in as ${c.user.tag}`);
//     general = c.channels.cache.get(secrets.CHANNEL_ID);
//     general.send("Up and running.");
// });

client.on("interactionCreate", async interaction => {
	
	if (!interaction.isChatInputCommand()) return;

	// Give a reply and then edit it later so we have extra time
    await interaction.reply("Thinking..");
	
	const command = interaction.client.commands.get(interaction.commandName);

    // Fail if it isn't me :)
	if (interaction.user.id !== "703823803989360710") {
		interaction.editReply("You are not authorized to use this command!");
		return;
	}
	
	if (!command) {
		console.error(`[bot] No command matching ${interaction.commandName} was found.`);
		return;
	}
	
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error("[bot]", error);
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
export function login() {
	return new Promise((res, rej) => {
	    client.login(secrets.DISCORD_API_TOKEN);
		client.on("ready", c => {
			console.log(`[bot] Ready! Logged in as ${c.user.tag}`);
		    let general = c.channels.cache.get(secrets.CHANNEL_ID);
		    general.send("Up and running.");
		    res(client);
		});
	});
}
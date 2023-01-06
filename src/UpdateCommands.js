import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import secrets from "../secrets.json" assert {type: 'json'};

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = readdirSync('./src/commands/').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const { data } = await import(`./commands/${file}`);
    // console.log("data:", data);
	commands.push(data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(secrets.DISCORD_API_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(secrets.CLIENT_ID, secrets.SERVER_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
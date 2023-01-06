import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check ping.");
    
export async function execute(interaction) {
    await interaction.editReply(`Ping: ${Math.abs(Date.now() - interaction.createdTimestamp)}ms`);
}
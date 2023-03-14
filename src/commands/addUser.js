import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from "node:fs";
import watchlist from "../../user-watchlist.json" assert {type: "json"}

export const data = new SlashCommandBuilder()
  .setName("add-user")
  .setDescription("Add user to watchlist.")
  .addStringOption(o => o.setName('username')
    .setDescription('The KA username to add to the watchlist.')
    .setRequired(true));

export async function execute(interaction) {
  let username = interaction.options.getString("username");
  let r = watchlist;
  r.push(username);
  writeFileSync("../user-watchlist.json", JSON.stringify(r));
  await interaction.editReply(`Added user ${username} to watchlist.`);
}
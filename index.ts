import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";
import setCommands from "./handlers/commands";
import handleInteractions from "./handlers/interactions";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
  ],
});

client.on("ready", () => {
  console.log("The bot is ready!");
  setCommands(client);
});

client.on("interactionCreate", async (interaction) => {
  await handleInteractions(interaction);
});

client.login(process.env.LOOKING_BOT_TEAM_TOKEN);

import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";
import setCommands from "./handlers/commands";
import handleInteractions from "./handlers/interactions";
import handleMessage from "./handlers/messages";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("The bot is ready!");
  const guildId = "923701565158744155";
  setCommands(client, guildId);
});

client.on("interactionCreate", async (interaction) => {
  await handleInteractions(interaction);
});

client.on("messageCreate", async (message) => {
  let prefix = "!";
  await handleMessage(prefix, message, client);
});

client.login(process.env.LOOKING_BOT_TEAM_TOKEN);

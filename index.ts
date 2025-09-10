import {
  Client,
  GatewayIntentBits,
  IntentsBitField,
  REST,
  Routes,
} from "discord.js";
import setCommands from "./handlers/commands";
import handleInteractions from "./handlers/interactions";

const rest = new REST({ version: "10" }).setToken(
  process.env.LOOKING_FOR_TEAM_BOT_TOKEN!
);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("clientReady", () => {
  console.log("The bot is ready!");
  setCommands(client);
});

client.on("interactionCreate", async (interaction) => {
  await handleInteractions(interaction);
});

client.login(process.env.LOOKING_FOR_TEAM_BOT_TOKEN);
// client.login(process.env.TEST_BOT_TOKEN);

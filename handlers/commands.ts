import { Client, ApplicationCommandOptionType } from "discord.js";
import { AppSettings } from "../utils/settings";

function setCommands(client: Client) {
  if (client.application == null) {
    console.error("ClientApplication null, client: ", client);
    return;
  }

  let commands = client.application.commands;

  if (commands == null) {
    console.error(
      "Application Commands null, application: ",
      client.application
    );
    return;
  }

  commands.create({
    name: AppSettings.BOT_WING_COMMAND_NAME,
    description: "Looking For Team Commands",
    options: [
      {
        name: "duration",
        description: "How long would you play (hours or minutes) numbers only?",
        required: true,
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: "activity",
        description: "What are you planning to do in Game?",
        required: false,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "location",
        description: "Where are you (System Name)?",
        required: false,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "spots",
        description: "How much space you have in your Team",
        required: false,
        type: ApplicationCommandOptionType.Number,
      },
    ],
  });
  commands.create({
    name: AppSettings.BOT_HELP_COMMAND_NAME,
    description: "Need help to use this BOT",
  });

  commands.create({
    name: AppSettings.BOT_PING_COMMAND_NAME,
    description: "Check if the Bot is up and Running",
  });
}

export default setCommands;

import { Client, ApplicationCommandOptionType } from "discord.js";

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
    name: "wing",
    description: "Looking For Team Commands",
    options: [
      {
        name: "version",
        description: "What version of game you're using",
        required: false,
        type: ApplicationCommandOptionType.String,
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
      {
        name: "duration",
        description: "How long would you play (hours or minutes) numbers only?",
        required: false,
        type: ApplicationCommandOptionType.Number,
      },
    ],
  });
  commands.create({
    name: "winghelp",
    description: "Need help to use this BOT",
  });

  commands.create({
    name: "ping",
    description: "Check if the Bot is up and Running",
  });
}

export default setCommands;

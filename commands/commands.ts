import {
  Client,
  ApplicationCommandManager,
  GuildApplicationCommandManager,
  ApplicationCommandOptionType,
} from "discord.js";

function setCommands(client: Client, guildId: string = "") {
  let commands:
    | GuildApplicationCommandManager
    | ApplicationCommandManager
    | undefined;
  if (guildId.length > 0) {
    const guild = client.guilds.cache.get(guildId);
    commands = guild?.commands;
  } else {
    commands = client.application?.commands;
  }

  commands?.create({
    name: "lookingforteam",
    description: "Looking For Wing Command",
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
        description:
          "How long are you planning to wing up (Hours) numbers only?",
        required: false,
        type: ApplicationCommandOptionType.Number,
      },
    ],
  });
}

export default setCommands;

import { Client, ApplicationCommandOptionType } from "discord.js";
import CommandLocalizations from "../utils/localization";
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
    description_localizations:
      CommandLocalizations.LOOKING_FOR_TEAM_DESCRIPTION,
    options: [
      {
        name: "duration",
        description: "How long would you play (hours or minutes) numbers only?",
        description_localizations:
          CommandLocalizations.LOOKING_FOR_TEAM_DURATION_DESCRIPTION,
        required: true,
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: "activity",
        description: "What are you planning to do in Game?",
        description_localizations:
          CommandLocalizations.LOOKING_FOR_TEAM_ACTIVITY_DESCRIPTION,
        required: false,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "location",
        description: "Where are you (System Name)?",
        description_localizations:
          CommandLocalizations.LOOKING_FOR_TEAM_LOCATION_DESCRIPTION,
        required: false,
        type: ApplicationCommandOptionType.String,
      },
      {
        name: "spots",
        description: "How much space you have in your Team?",
        description_localizations:
          CommandLocalizations.LOOKING_FOR_TEAM_SPOTS_DESCRIPTION,
        required: false,
        type: ApplicationCommandOptionType.Number,
      },
      {
        name: "when",
        description:
          "In how many hours from you want to play leave blank or 0 for now?",
        description_localizations:
          CommandLocalizations.LOOKING_FOR_TEAM_WHEN_DESCRIPTION,
        required: false,
        type: ApplicationCommandOptionType.Number,
      },
    ],
  });

  commands.create({
    name: AppSettings.BOT_REGISTER_CHANNEL_COMMAND_NAME,
    description: "Register Channel as per Platform",
    options: [
      {
        name: "channel_platform",
        description: "Specify Channel as PC, XBOX or PS",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  });

  commands.create({
    name: AppSettings.BOT_DEREGISTER_CHANNEL_COMMAND_NAME,
    description: "Deregister Channel as per Platform",
    options: [
      {
        name: "channel_platform",
        description: "Specify Channel as PC, XBOX or PS",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  });

  commands.create({
    name: AppSettings.BOT_SYSTEM_INFO_COMMAND_NAME,
    description: "Get Systems Factions Info",
    options: [
      {
        name: "system_name",
        description: "Elite Dangerous system name",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  });

  commands.create({
    name: AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME,
    description: "Get System Traffic Info",
    options: [
      {
        name: "system_name",
        description: "Elite Dangerous System Name",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  });

  commands.create({
    name: AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME,
    description: "Get System Death Info",
    options: [
      {
        name: "system_name",
        description: "Elite Dangerous System Name",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  });

  commands.create({
    name: AppSettings.BOT_HELP_COMMAND_NAME,
    description: "Need help to use this BOT?",
    description_localizations:
      CommandLocalizations.LOOKING_FOR_TEAM_HELP_DESCRIPTION,
  });

  commands.create({
    name: AppSettings.BOT_PING_COMMAND_NAME,
    description: "Check if the Bot is up and Running",
    description_localizations:
      CommandLocalizations.LOOKING_FOR_TEAM_PING_DESCRIPTION,
  });
}

export default setCommands;

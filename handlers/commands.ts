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

  commands
    .create({
      name: AppSettings.BOT_WING_COMMAND_NAME,
      description: CommandLocalizations.LOOKING_FOR_TEAM_DESCRIPTION["en-US"],
      description_localizations:
        CommandLocalizations.LOOKING_FOR_TEAM_DESCRIPTION,
      options: [
        {
          name: AppSettings.INTERACTION_DURATION_ID,
          description:
            CommandLocalizations.LOOKING_FOR_TEAM_DURATION_DESCRIPTION["en-US"],
          description_localizations:
            CommandLocalizations.LOOKING_FOR_TEAM_DURATION_DESCRIPTION,
          required: true,
          type: ApplicationCommandOptionType.Number,
        },
        {
          name: AppSettings.INTERACTION_ACTIVITY_ID,
          description:
            CommandLocalizations.LOOKING_FOR_TEAM_ACTIVITY_DESCRIPTION["en-US"],
          description_localizations:
            CommandLocalizations.LOOKING_FOR_TEAM_ACTIVITY_DESCRIPTION,
          required: false,
          type: ApplicationCommandOptionType.String,
        },
        {
          name: AppSettings.INTERACTION_LOCATION_ID,
          description:
            CommandLocalizations.LOOKING_FOR_TEAM_LOCATION_DESCRIPTION["en-US"],
          description_localizations:
            CommandLocalizations.LOOKING_FOR_TEAM_LOCATION_DESCRIPTION,
          required: false,
          type: ApplicationCommandOptionType.String,
        },
        {
          name: AppSettings.INTERACTION_SPOTS_ID,
          description:
            CommandLocalizations.LOOKING_FOR_TEAM_SPOTS_DESCRIPTION["en-US"],
          description_localizations:
            CommandLocalizations.LOOKING_FOR_TEAM_SPOTS_DESCRIPTION,
          required: false,
          type: ApplicationCommandOptionType.Number,
        },
        {
          name: AppSettings.INTERACTION_WHEN_ID,
          description:
            CommandLocalizations.LOOKING_FOR_TEAM_WHEN_DESCRIPTION["en-US"],
          description_localizations:
            CommandLocalizations.LOOKING_FOR_TEAM_WHEN_DESCRIPTION,
          required: false,
          type: ApplicationCommandOptionType.Number,
        },
      ],
    })
    .catch((error) => console.error("Error creating command: ", error));

  commands
    .create({
      name: AppSettings.BOT_SYSTEM_FACTION_INFO_COMMAND_NAME,
      description: CommandLocalizations.SYTEM_FACTION_INFO_DESCRIPTION["en-US"],
      description_localizations:
        CommandLocalizations.SYTEM_FACTION_INFO_DESCRIPTION,
      options: [
        {
          name: AppSettings.INTERACTION_SYSTEM_NAME_ID,
          description: AppSettings.INTERACTION_SYSTEM_NAME_DESC,
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    })
    .catch((error) =>
      console.error("Error Get Systems Factions Info: ", error)
    );

  commands
    .create({
      name: AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME,
      description:
        CommandLocalizations.SYSTEM_TRAFFIC_INFO_DESCRIPTION["en-US"],
      description_localizations:
        CommandLocalizations.SYSTEM_TRAFFIC_INFO_DESCRIPTION,
      options: [
        {
          name: AppSettings.INTERACTION_SYSTEM_NAME_ID,
          description: AppSettings.INTERACTION_SYSTEM_NAME_DESC,
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    })
    .catch((error) => console.error("Error Get System Traffic Info: ", error));

  commands
    .create({
      name: AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME,
      description: CommandLocalizations.SYSTEM_DEATH_INFO_DESCRIPTION["en-US"],
      description_localizations:
        CommandLocalizations.SYSTEM_DEATH_INFO_DESCRIPTION,
      options: [
        {
          name: AppSettings.INTERACTION_SYSTEM_NAME_ID,
          description: AppSettings.INTERACTION_SYSTEM_NAME_DESC,
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    })
    .catch((error) => console.error("Error Get System Death Info: ", error));

  commands
    .create({
      name: AppSettings.BOT_HELP_COMMAND_NAME,
      description: AppSettings.INTERACTION_HELP_DESC,
      description_localizations:
        CommandLocalizations.LOOKING_FOR_TEAM_HELP_DESCRIPTION,
    })
    .catch((error) => console.error("Error Get Help Info: ", error));

  commands
    .create({
      name: AppSettings.BOT_PING_COMMAND_NAME,
      description: AppSettings.INTERACTION_PING_DESC,
      description_localizations:
        CommandLocalizations.LOOKING_FOR_TEAM_PING_DESCRIPTION,
    })
    .catch((error) => console.error("Error Get Ping Info: ", error));
}

export default setCommands;

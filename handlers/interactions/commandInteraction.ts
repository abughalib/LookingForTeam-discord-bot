import {
  CommandInteraction,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import EDSM from "../../utils/edsm";
import BGSInfo from "../../utils/eliteBgs";
import {
  checkDurationValidation,
  DurationValidation,
  getEliteShipAndCount,
} from "../../utils/helpers";
import { TickInfo } from "../../utils/models";
import { AppSettings } from "../../utils/settings";
import SystemFactionInfo from "../../utils/systemInfoModel";
import getEpochTimeAfterHours from "../../utils/timestamp";
import embedMessage from "../embeded_message";
import systemEmbedMessage from "../systemInfoEmbed";
import deleteInteraction from "./deleteInteractions";

/*
  Args:
    interaction: CommandInteraction.
    Menu: Menu Available for selection.
    buttons: Buttons to be added to the message.
  Returns:
    void
*/
async function interactionCommandHandler(
  interaction: CommandInteraction,
  menus: ActionRowBuilder<SelectMenuBuilder>,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  // CommandName and options
  const { commandName, options } = interaction;

  // Check if the interaction.guild is null
  if (interaction.guild == null) {
    // Log Error interaction
    console.error("interaction guild null: " + interaction);
    // Reply to the interaction
    // Show internal error message
    await interaction
      .reply({
        ephemeral: true,
        content: "Some internal error occured. Please try again later.",
      })
      .catch((err) => {
        console.error(err);
      });
    return;
  }

  // fetch interacted user from the interaction.guild members
  // To get the nick name of the user
  const userInterected = await interaction.guild.members.fetch(
    interaction.user.id
  );

  // Get the name of the user which is used in the channel
  // User can have different name in different channels
  const nickName = userInterected?.nickname || interaction.user.username;

  // Heading for the embed message
  const listFieldheading = AppSettings.BOT_WING_FIELDS;

  // For EDSM API
  const edsm = new EDSM();

  // BOT command Names
  // Defined in [BOT_COMMANDS]
  if (commandName === AppSettings.BOT_WING_COMMAND_NAME) {
    // Get specific option from the command
    const activity =
      options.get(AppSettings.INTERACTION_ACTIVITY_ID)?.value ||
      AppSettings.DEFAULT_TEAM_ACTIVITY;
    const location =
      options.get(AppSettings.INTERACTION_LOCATION_ID)?.value ||
      AppSettings.DEFAULT_TEAM_LOCATION;
    let spots =
      options.get(AppSettings.INTERACTION_SPOTS_ID)?.value ||
      AppSettings.MAXIMUM_TEAM_SPOT;

    // How long the team will be active
    let duration: number = Number(
      (
        (options.get(AppSettings.INTERACTION_DURATION_ID)?.value as number) ||
        AppSettings.DEFAULT_TEAM_DURATION
      ).toFixed(2)
    );
    // When the Team creator is looking for Team
    let when: number = Number(
      (
        (options.get(AppSettings.INTERACTION_WHEN_ID)?.value as number) || 0
      ).toFixed(2)
    );

    // Check if the duration and when is valid
    if (
      !(await isValidDuration(interaction, duration)) ||
      !(await isValidDuration(interaction, when)) ||
      !(await isValidDuration(interaction, duration + when))
    ) {
      return;
    }

    // Defer the reply
    await interaction.deferReply();

    // If timer is more then [MAXIMUM_HOURS_TEAM] hours convert it into Minutes
    if (when > AppSettings.MAXIMUM_HOURS_TEAM) {
      when = when / 60;
    }

    // If Duration is more then [MAXIMUM_HOURS_TEAM] hours convert it into Minutes
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
      duration = duration / 60;
    }

    // Maximum spot in wing is [MAXIMUM_TEAM_SPOT] which is 3 as of now
    if (spots > AppSettings.MAXIMUM_TEAM_SPOT) {
      spots = AppSettings.MAXIMUM_TEAM_SPOT;
    }

    /*
      If when is 0 then it means the user is looking for team now
      else it will be the time when the user is looking for team
    */
    const listFieldValue = [
      activity,
      location,
      parseInt(spots.toString()),
      when === 0
        ? AppSettings.DEFAULT_WHEN_VALUE
        : `<t:${getEpochTimeAfterHours(when)}:T>`,
      `${interaction.user}`,
    ];

    // Title for the embed message
    let title: string = AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;

    // Channel name for the embed message
    if (interaction.channelId === AppSettings.XBOX_CHANNEL_ID) {
      title = AppSettings.XBOX_WING_REQUEST_INTERACTION_TITLE;
    } else if (interaction.channelId === AppSettings.PS_CHANNEL_ID) {
      title = AppSettings.PS_WING_REQUEST_INTERACTION_TITLE;
    } else {
      title = AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;
    }

    // Create the embed message
    let embeded_message = embedMessage(
      title,
      listFieldheading,
      listFieldValue,
      nickName
    );

    // Adding time
    embeded_message.addFields({
      name: AppSettings.BOT_WING_DURATION_FIELD_NAME,
      value: `<t:${getEpochTimeAfterHours(duration + when).toString()}:T>`,
    });

    console.log(duration + when);

    // Set footer for the embed message
    embeded_message.setFooter({
      text: `Posted at`,
    });

    // Defer message reply
    await interaction
      .deferReply({
        ephemeral: false,
      })
      .catch((err) => {
        console.error(`Error in deferReply: ${err}`);
      });

    // Send the embed message specific for the channel [PC, XBOX, PS]
    if (interaction.channelId === AppSettings.PC_CHANNEL_ID) {
      // Pretty Looking reply
      // Send the embed message
      // Add the buttons and menu to the message
      await interaction
        .editReply({
          embeds: [embeded_message],
          components: [buttons, menus],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
    } else {
      // Pretty Looking reply
      await interaction
        .editReply({
          embeds: [embeded_message],
          components: [buttons],
        })
        .catch((err) => {
          console.error(`Error in deferReply: ${err}`);
        });
    }
    // Auto Delete message after certain time.
    deleteInteraction(
      interaction,
      AppSettings.HOURS_TO_MILISEC * (duration + when)
    );
  } else if (commandName == AppSettings.BOT_SYSTEM_FACTION_INFO_COMMAND_NAME) {
    /*
      System faction info command [BOT_SYSTEM_FACTION_INFO_COMMAND_NAME]
    */

    // Get the system name from the command
    const systemName: string =
      options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
      AppSettings.DEFAULT_SYSTEM_NAME;

    // Defer message reply
    // as API call may take more than 3 seconds
    await interaction.deferReply().catch((err) => {
      console.error(`Error in deferReply: ${err}`);
    });

    // Get the system info from EDSM API
    let systemFactionInfo: SystemFactionInfo | null =
      await edsm.getSystemFactionInfo(systemName);

    // Create a dismiss button for the replies
    let dismissButton = createDismissButton();

    // If API call returns null
    // That means the system is not found
    if (!systemFactionInfo || !systemFactionInfo.id) {
      await interaction
        .editReply({
          content: "No System found with Name: " + systemName,
          components: [dismissButton],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
      deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
    } else if (
      !systemFactionInfo.controllingFaction ||
      systemFactionInfo.factions.length === 0
    ) {
      /*
        If the system is found but there is no controlling faction
        Send a message saying that Inhabitated system.
        Create a embed message
        With System URL
      */
      await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Inhabitated System: ${systemFactionInfo.name}`)
              .setURL(systemFactionInfo.url),
          ],
          components: [dismissButton],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
      deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
    } else {
      // Create embed message for the system faction info
      // Reply embed message
      // With dismiss button
      let embeded_message = systemEmbedMessage(systemFactionInfo);
      await interaction
        .editReply({
          embeds: [embeded_message],
          components: [dismissButton],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
    }

    // Delete the message after [HELP_MESSAGE_DISMISS_TIMEOUT]
    deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
  } else if (commandName === AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME) {
    // Title for the embed message
    const title: string = "System Traffic Info";

    // Get system name from the command
    const systemName: string =
      options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
      "SOL";

    // Get NickName for that specific server
    const nickName = userInterected?.nickname || interaction.user.username;

    // Defer message reply
    // Ephermal true so that only the user can see the message
    await interaction
      .deferReply({
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in System Traffic Info: ${err}`);
      });

    // Get the system Traffic info from EDSM API
    const systemTrafficInfo = await edsm.getSystemTrafficInfo(systemName);

    // If API call returns null
    // That means the system is not found
    if (systemTrafficInfo === null) {
      await interaction
        .editReply({
          content: "Cannot find Traffic Info",
        })
        .catch((err) => {
          console.error(
            `Error in System Traffic Info__ Cannot find Traffic Info: ${err}`
          );
        });
      return;
    }

    // If the breakdown is null or underfined
    // That means there is no traffic info for that system
    if (!systemTrafficInfo.breakdown || !systemTrafficInfo.traffic) {
      await interaction
        .editReply({
          content: "No ship info is in EDSM for this system",
        })
        .catch((err) => {
          console.error(
            `Error in System Traffic Info__ No ship info is in EDSM for this system: ${err}`
          );
        });
      return;
    }

    // Breakdown of the traffic info
    // Ship name and count
    const shipsAndCount = getEliteShipAndCount(systemTrafficInfo);

    // Embed message heading
    const listFieldheading: string[] = [
      "System Name",
      ...AppSettings.SYSTEM_TIMELINE,
      ...shipsAndCount.shipNames,
    ];

    // Embed message Values
    const listFieldValue: string[] = [
      systemTrafficInfo.name,
      systemTrafficInfo.traffic.day.toString(),
      systemTrafficInfo.traffic.week.toString(),
      systemTrafficInfo.traffic.total.toString(),
      ...shipsAndCount.shipCount,
    ];

    // Create the embed message
    const embeded_message = embedMessage(
      title,
      listFieldheading,
      listFieldValue,
      nickName,
      true
    );

    // Reply embed message
    interaction.editReply({
      embeds: [embeded_message],
    });
  } else if (commandName === AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME) {
    // Get system name from the command
    const systemName: string =
      options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
      AppSettings.DEFAULT_STAR_SYSTEM_NAME;

    // Get NickName for that specific server of that user
    const nickName = userInterected?.nickname || interaction.user.username;

    // The title for the embed message
    const title: string = "System Death Info";

    // Defer message reply
    await interaction
      .deferReply({
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in System Death Info: ${err}`);
      });

    // Get the system Death from EDSM API
    const systemDeath = await edsm.getSystemDeath(systemName);

    // System Death info is not found
    // or System Death death is undefined
    if (systemDeath === null || systemDeath.deaths === undefined) {
      // Reply with a message
      // Saying that there is no death info for that system
      await interaction
        .editReply({
          content: "Cannot find system Death Info!",
        })
        .catch((err) => {
          console.error(`Error in System Death Info: ${err}`);
        });
      return;
    }

    // Breakdown of the death info
    const listFieldheading = ["System Name", ...AppSettings.SYSTEM_TIMELINE];

    // Breakdown of the death info
    // By Time
    const listFieldValues = [
      systemDeath.name,
      systemDeath.deaths.day,
      systemDeath.deaths.week,
      systemDeath.deaths.total,
    ];

    // Create the embed message
    const embeded_message = embedMessage(
      title,
      listFieldheading,
      listFieldValues,
      nickName
    );

    // Reply embed message
    await interaction
      .editReply({
        embeds: [embeded_message],
      })
      .catch((err) => {
        console.error(`Error in System Death Info: ${err}`);
      });
  } else if (commandName === AppSettings.BOT_ELITE_SERVER_TICK_INFO) {
    // Defer interaction reply
    await interaction.deferReply({
      ephemeral: false,
    });

    // Initialize the Elite BGS Info Class
    const eliteBGS = new BGSInfo();

    // Title for the embed message
    const title: string = AppSettings.BOT_ELITE_SERVER_TICK_INFO_TITLE;

    // Get Tick Info from Elite BGS API
    const tickInfo: TickInfo | null = await eliteBGS.getLastTick();

    // If tick info is null
    // That means there is no tick info or the API is down
    if (!tickInfo) {
      // Reply with a message
      await interaction.editReply({
        content: "Cannot find Tick Info!",
      });
      deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
      return;
    }

    let embeded_message = new EmbedBuilder()
      .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
      .setTitle(title)
      .addFields([
        {
          name: "Tick Time",
          value: `<t:${Date.parse(tickInfo.time) / 1000}:F>`,
        },
      ])
      .setTimestamp(Date.parse(tickInfo.updated_at))
      .setFooter({
        text: "Last Updated",
      });

    // Create dismiss button
    let dismissButton = createDismissButton();

    // Reply embed message
    await interaction
      .editReply({
        embeds: [embeded_message],
        components: [dismissButton],
      })
      .catch((error) => {
        console.error(`Error in Elite Server Tick Info: ${error}`);
      });
    deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
  } else if (commandName === AppSettings.BOT_HELP_COMMAND_NAME) {
    // Title for the embed message
    const title: string = AppSettings.BOT_HELP_REPLY_TITLE;

    // List of the fields for the embed message
    const listFieldheading = [
      ...AppSettings.BOT_HELP_FIELD_TITLE,
      ...AppSettings.BOT_WING_FIELDS,
      ...AppSettings.BOT_HELP_EXTRA_FIELDS,
    ];

    // List of the values for the embed message
    const listFieldValue = AppSettings.BOT_HELP_COMMAND_REPLY_FIELD_VALUES;

    // Create the embed message
    const embeded_message = embedMessage(
      title,
      listFieldheading,
      listFieldValue,
      interaction.user.username
    );

    // set Message footer
    embeded_message.setFooter({
      text: AppSettings.BOT_HELP_REPLY_FOOTER_NOTE,
    });

    // Defer message reply
    await interaction
      .deferReply({
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in Help: ${err}`);
      });

    // Edit Reply of interaction with embed message
    await interaction
      .editReply({
        embeds: [embeded_message],
      })
      .catch((err) => {
        console.error(`Error in Help: ${err}`);
      });
  } else if (commandName === AppSettings.BOT_PING_COMMAND_NAME) {
    // Reply with a message
    await interaction
      .reply({
        content: AppSettings.BOT_PING_REPLY,
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in Ping: ${err}`);
      });
  }
}

/*
  Args:
    None
  Returns:
    Buttons
*/

// To be removed in the future.
function createDismissButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(AppSettings.BUTTON_DISMISS_ID)
      .setLabel(AppSettings.BUTTON_DISMISS_LABEL)
      .setStyle(ButtonStyle.Danger)
  );
}

/*
  Args:
    interaction: CommandInteraction
  Returns:
    boolean

  Description:
    Check if the duration is Valid.
    If the duration is valid, then return true.
    else send a ephemeral message to the user and return false.
*/
async function isValidDuration(
  interaction: CommandInteraction,
  timer: number
): Promise<boolean> {
  // Check if the timer is valid

  // If the duration is more than 10 hours consider it minutes
  if (timer > 10) {
    timer = timer / 60;
  }

  switch (checkDurationValidation(timer)) {
    case DurationValidation.INVALID:
      await interaction
        .reply({
          content: "Please enter a valid hour",
          ephemeral: true,
        })
        .catch((err) => {
          console.error(err);
        });
      return false;
    // In case if the Duration is more then allowd time [MAXIMUM_HOURS_TEAM]
    case DurationValidation.LIMIT_EXCEEDED:
      await interaction
        .reply({
          ephemeral: true,
          content: "You cannnot request for more then 10 hours",
        })
        .catch((err) => {
          console.error(
            `Error If Duration/Timer is more then 10 hours dismiss it: ${err}`
          );
        });
      return false;
    case DurationValidation.VALID:
      break;
    default:
      break;
  }
  return true;
}

export default interactionCommandHandler;

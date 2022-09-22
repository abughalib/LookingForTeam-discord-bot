import {
  CommandInteraction,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import EDSM from "../../utils/edsm";
import {
  checkDurationValidation,
  DurationValidation,
  formatTime,
  getEliteShipAndCount,
} from "../../utils/helpers";
import { AppSettings } from "../../utils/settings";
import SystemInfo from "../../utils/systemInfoModel";
import getEpochTimeAfterHours from "../../utils/timestamp";
import embedMessage from "../embeded_message";
import systemEmbedMessage from "../systemInfoEmbed";
import deleteInteraction from "./deleteInteractions";

async function interactionCommandHandler(
  interaction: CommandInteraction,
  menus: ActionRowBuilder<SelectMenuBuilder>,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  const { commandName, options } = interaction;

  if (interaction.guild == null) {
    console.error("interaction guild null: ");
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

  const userInterected = await interaction.guild.members.fetch(
    interaction.user.id
  );
  const nickName = userInterected?.nickname || interaction.user.username;

  const options_list = AppSettings.BOT_WING_FIELDS;

  const edsm = new EDSM();

  if (commandName === AppSettings.BOT_WING_COMMAND_NAME) {
    const activity =
      options.get(AppSettings.INTERACTION_ACTIVITY_ID)?.value ||
      AppSettings.DEFAULT_TEAM_ACTIVITY;
    const location =
      options.get(AppSettings.INTERACTION_LOCATION_ID)?.value ||
      AppSettings.DEFAULT_TEAM_LOCATION;
    let spots =
      options.get(AppSettings.INTERACTION_SPOTS_ID)?.value ||
      AppSettings.MAXIMUM_TEAM_SPOT;
    let duration: number = Number(
      (
        (options.get(AppSettings.INTERACTION_DURATION_ID)?.value as number) ||
        AppSettings.DEFAULT_TEAM_DURATION
      ).toFixed(2)
    );
    let when: number = Number(
      (
        (options.get(AppSettings.INTERACTION_WHEN_ID)?.value as number) || 0
      ).toFixed(2)
    );

    if (
      !(await isValidDuration(interaction, duration)) ||
      !(await isValidDuration(interaction, when))
    ) {
      return;
    }

    await interaction.deferReply();

    // If timer is more then MAXIMUM_HOURS_TEAM hours convert it into Minutes
    if (when > AppSettings.MAXIMUM_HOURS_TEAM) {
      when = when / 60;
    }

    // If Duration is more then MAXIMUM_HOURS_TEAM hours convert it into Minutes
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
      duration = duration / 60;
    }

    // Maximum spot in wing is MAXIMUM_TEAM_SPOT which is 3 as of now
    if (spots > AppSettings.MAXIMUM_TEAM_SPOT) {
      spots = AppSettings.MAXIMUM_TEAM_SPOT;
    }

    const options_values = [
      activity,
      location,
      parseInt(spots.toString()),
      when === 0
        ? AppSettings.DEFAULT_WHEN_VALUE
        : `<t:${getEpochTimeAfterHours(when)}:T>`,
      `${interaction.user}`,
    ];

    let title: string = AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;

    if (interaction.channelId === AppSettings.XBOX_CHANNEL_ID) {
      title = AppSettings.XBOX_WING_REQUEST_INTERACTION_TITLE;
    } else if (interaction.channelId === AppSettings.PS_CHANNEL_ID) {
      title = AppSettings.PS_WING_REQUEST_INTERACTION_TITLE;
    } else {
      title = AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;
    }

    let embeded_message = embedMessage(
      title,
      options_list,
      options_values,
      nickName
    );

    // Adding time
    embeded_message.addFields({
      name: AppSettings.BOT_WING_DURATION_FIELD_NAME,
      value: `${formatTime(duration)}`,
    });

    // Time can't be negative;
    if (duration < 0) {
      duration = AppSettings.DEFAULT_TEAM_DURATION;
    }

    embeded_message.setFooter({
      text: `Expires in ${formatTime(duration + when)}`,
    });

    if (interaction.channelId === AppSettings.PC_CHANNEL_ID) {
      await interaction
        .deferReply({
          ephemeral: false,
        })
        .catch((err) => {
          console.error(`Error in deferReply: ${err}`);
        });

      // Pretty Looking reply
      await interaction
        .editReply({
          embeds: [embeded_message],
          components: [buttons, menus],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
    } else {
      await interaction
        .deferReply({
          ephemeral: false,
        })
        .catch((err) => {
          console.error(`Error in deferReply: ${err}`);
        });

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
    const systemName: string =
      options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
      AppSettings.DEFAULT_SYSTEM_NAME;
    await interaction.deferReply().catch((err) => {
      console.error(`Error in deferReply: ${err}`);
    });

    let systemInfo: SystemInfo | null = await edsm.getSystemInfo(systemName);

    let dismissButton = createDismissButton();

    if (!systemInfo || !systemInfo.id) {
      await interaction
        .editReply({
          content: "No System found with Name: " + systemName,
          components: [dismissButton],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
    } else if (
      !systemInfo.controllingFaction ||
      systemInfo.factions.length === 0
    ) {
      await interaction
        .editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Inhabitated System: ${systemInfo.name}`)
              .setURL(systemInfo.url),
          ],
          components: [dismissButton],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
    } else {
      let embeded_message = systemEmbedMessage(systemInfo);
      await interaction
        .editReply({
          embeds: [embeded_message],
          components: [dismissButton],
        })
        .catch((err) => {
          console.error(`Error in editReply: ${err}`);
        });
    }

    deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
  } else if (commandName === AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME) {
    const title: string = "System Traffic Info";
    const systemName: string =
      options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
      "SOL";
    const nickName = userInterected?.nickname || interaction.user.username;

    interaction
      .deferReply({
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in System Traffic Info: ${err}`);
      });

    const systemTrafficInfo = await edsm.getSystemTrafficInfo(systemName);

    if (systemTrafficInfo === null) {
      interaction
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

    if (
      systemTrafficInfo.breakdown === null ||
      systemTrafficInfo.breakdown === undefined ||
      systemTrafficInfo.traffic == null
    ) {
      interaction
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

    const shipsAndCount = getEliteShipAndCount(systemTrafficInfo);

    const options_list: string[] = [
      "System Name",
      ...AppSettings.SYSTEM_TIMELINE,
      ...shipsAndCount.shipNames,
    ];
    const values: string[] = [
      systemTrafficInfo.name,
      systemTrafficInfo.traffic.day.toString(),
      systemTrafficInfo.traffic.week.toString(),
      systemTrafficInfo.traffic.total.toString(),
      ...shipsAndCount.shipCount,
    ];

    const embeded_message = embedMessage(
      title,
      options_list,
      values,
      nickName,
      true
    );

    interaction.editReply({
      embeds: [embeded_message],
    });
  } else if (commandName === AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME) {
    const systemName: string =
      options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
      AppSettings.DEFAULT_STAR_SYSTEM_NAME;
    const nickName = userInterected?.nickname || interaction.user.username;

    const title: string = "System Death Info";
    interaction
      .deferReply({
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in System Death Info: ${err}`);
      });
    const systemDeath = await edsm.getSystemDeath(systemName);

    if (systemDeath === null || systemDeath.deaths === undefined) {
      interaction
        .editReply({
          content: "Cannot find system Death Info!",
        })
        .catch((err) => {
          console.error(`Error in System Death Info: ${err}`);
        });
      return;
    }

    const listFieldheading = ["System Name", ...AppSettings.SYSTEM_TIMELINE];

    const listFieldValues = [
      systemDeath.name,
      systemDeath.deaths.day,
      systemDeath.deaths.week,
      systemDeath.deaths.total,
    ];

    const embeded_message = embedMessage(
      title,
      listFieldheading,
      listFieldValues,
      nickName
    );

    interaction
      .editReply({
        embeds: [embeded_message],
      })
      .catch((err) => {
        console.error(`Error in System Death Info: ${err}`);
      });
  } else if (commandName === AppSettings.BOT_HELP_COMMAND_NAME) {
    const title: string = AppSettings.BOT_HELP_REPLY_TITLE;
    const listFieldheading = [
      ...AppSettings.BOT_HELP_FIELD_TITLE,
      ...AppSettings.BOT_WING_FIELDS,
      ...AppSettings.BOT_HELP_EXTRA_FIELDS,
    ];
    const listFieldValue = AppSettings.BOT_HELP_COMMAND_REPLY_FIELD_VALUES;

    const embeded_message = embedMessage(
      title,
      listFieldheading,
      listFieldValue,
      interaction.user.username
    );

    embeded_message.setFooter({
      text: AppSettings.BOT_HELP_REPLY_FOOTER_NOTE,
    });

    await interaction
      .deferReply({
        ephemeral: true,
      })
      .catch((err) => {
        console.error(`Error in Help: ${err}`);
      });

    await interaction
      .editReply({
        embeds: [embeded_message],
      })
      .catch((err) => {
        console.error(`Error in Help: ${err}`);
      });
  } else if (commandName === AppSettings.BOT_PING_COMMAND_NAME) {
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

function createDismissButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(AppSettings.BUTTON_DISMISS_ID)
      .setLabel(AppSettings.BUTTON_DISMISS_LABEL)
      .setStyle(ButtonStyle.Danger)
  );
}

async function isValidDuration(
  interaction: CommandInteraction,
  timer: number
): Promise<boolean> {
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
    case DurationValidation.LIMIT_EXCEEDED:
      interaction
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

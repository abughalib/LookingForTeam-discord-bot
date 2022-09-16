import {
  CommandInteraction,
  ActionRowBuilder,
  SelectMenuBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import EDSM from "../../utils/edsm";
import formatTime from "../../utils/helpers";
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
    interaction.reply({
      content: "Some internal error occured. Please try again later.",
    });
    return;
  }

  const userInterected = await interaction.guild.members.fetch(
    interaction.user.id
  );
  const nickName = userInterected?.nickname || interaction.user.username;

  const options_list = [
    "What kind of mission/gameplay?",
    "Star System/Location",
    "Number of Space in Wing/Team Available",
    "When to join?",
  ];

  const edsm = new EDSM();

  if (commandName === AppSettings.BOT_WING_COMMAND_NAME) {
    const activity =
      options.get("activity")?.value || AppSettings.DEFAULT_TEAM_ACTIVITY;
    const location =
      options.get("location")?.value || AppSettings.DEFAULT_TEAM_LOCATION;
    let spots = options.get("spots")?.value || AppSettings.MAXIMUM_TEAM_SPOT;
    let duration: number = Number(
      (
        (options.get("duration")?.value as number) ||
        AppSettings.DEFAULT_TEAM_DURATION
      ).toFixed(2)
    );
    let when: number = Number(
      ((options.get("when")?.value as number) || 0).toFixed(2)
    );

    if (when < 0) {
      interaction.reply({
        content: "Please enter a valid hour",
        ephemeral: true,
      });
      return;
    }

    if (when > AppSettings.MAXIMUM_HOURS_TEAM) {
      when = when / 60;
    }

    if (when > AppSettings.MAXIMUM_HOURS_TEAM * 60) {
      interaction.reply({
        ephemeral: true,
        content: "You cannot set a time more than 10 hours",
      });
      return;
    }

    // Maximum spot in wing is MAXIMUM_TEAM_SPOT which is 3 as of now
    if (spots > AppSettings.MAXIMUM_TEAM_SPOT) {
      spots = AppSettings.MAXIMUM_TEAM_SPOT;
    }
    // If Duration is more then MAXIMUM_HOURS_TEAM hours convert it into Minutes
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
      duration = duration / 60;
    }

    // If Duration is more then 10 hours dismiss it.
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM * 60) {
      interaction.reply({
        ephemeral: true,
        content: "You cannnot request for more then 10 hours",
      });
      return;
    }

    const options_values = [
      activity,
      location,
      parseInt(spots.toString()),
      when === 0 ? "Now" : `<t:${getEpochTimeAfterHours(when)}:T>`,
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
      name: "Duration",
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
      await interaction.deferReply({
        ephemeral: false,
      });

      // Pretty Looking reply
      await interaction.editReply({
        embeds: [embeded_message],
        components: [buttons, menus],
      });
    } else {
      await interaction.deferReply({
        ephemeral: false,
      });

      // Pretty Looking reply
      await interaction.editReply({
        embeds: [embeded_message],
        components: [buttons],
      });
    }
    // Auto Delete message after certain time.
    deleteInteraction(
      interaction,
      AppSettings.HOURS_TO_MILISEC * (duration + when)
    );
  } else if (commandName == AppSettings.BOT_SYSTEM_INFO_COMMAND_NAME) {
    const systemName: string =
      options.get("system_name")?.value?.toString() ||
      AppSettings.DEFAULT_SYSTEM_NAME;
    await interaction.deferReply();

    let systemInfo: SystemInfo | null = await edsm.getSystemInfo(systemName);

    let dismissButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("command_dismiss")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger)
    );

    if (!systemInfo || !systemInfo.id) {
      await interaction.editReply({
        content: "No System found with Name: " + systemName,
        components: [dismissButton],
      });
    } else if (
      !systemInfo.controllingFaction ||
      systemInfo.factions.length === 0
    ) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Inhabitated System: ${systemInfo.name}`)
            .setURL(systemInfo.url),
        ],
        components: [dismissButton],
      });
    } else {
      let embeded_message = systemEmbedMessage(systemInfo);
      await interaction.editReply({
        embeds: [embeded_message],
        components: [dismissButton],
      });
    }

    deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
  } else if (commandName === AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME) {
    const systemName: string =
      options.get("system_name")?.value?.toString() || "SOL";
    const nickName = userInterected?.nickname || interaction.user.username;

    const title: string = "System Death Info";

    const systemDeath = (await edsm.getSystemDeath(systemName)) || {
      id: 0,
      id64: 0,
      name: "",
      deaths: {
        day: "",
        week: "",
        total: "",
      },
    };

    const options_list = ["System Name", "Day", "Week", "Total"];

    const values = [
      systemDeath.name,
      systemDeath.deaths.day,
      systemDeath.deaths.week,
      systemDeath.deaths.total,
    ];

    const embeded_message = embedMessage(title, options_list, values, nickName);

    interaction.reply({
      embeds: [embeded_message],
      ephemeral: true,
    });
  } else if (commandName === AppSettings.BOT_HELP_COMMAND_NAME) {
    const title: string = "How to use, Check example.";
    const list_options = [
      "Command",
      "Game Version",
      "What kind of mission/gameplay?",
      "Star System/Location",
      "Number of Space in Wing/Team Available",
      "When to join?",
      "Duration",
    ];
    const list_options_values = [
      "Use `/wing`",
      "Odyssey, Horizon 4.0, Horizon 3.8, ED Beyond",
      "Mining, Bounty Hunting, etc...",
      "SOL",
      "2 Spots",
      "25 (25 minutes from now)",
      "1.5 (1 hours and 30 minutes)",
    ];

    let embeded_message = embedMessage(
      title,
      list_options,
      list_options_values,
      interaction.user.username || "Unknown"
    );

    embeded_message.setFooter({
      text: `Note: Messages may get delete by dyno`,
    });

    await interaction.deferReply({
      ephemeral: true,
    });

    await interaction.editReply({
      embeds: [embeded_message],
    });
  } else if (commandName === AppSettings.BOT_PING_COMMAND_NAME) {
    await interaction.reply({
      content: "Bots never sleeps",
      ephemeral: true,
    });
  }
}

export default interactionCommandHandler;

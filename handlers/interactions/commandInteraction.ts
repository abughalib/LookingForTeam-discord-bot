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
import { SystemTrafficInfo } from "../../utils/models";
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
    "Players Joined",
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
  } else if (commandName === AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME) {
    const title: string = "System Traffic Info";
    const systemName: string =
      options.get("system_name")?.value?.toString() || "SOL";
    const nickName = userInterected?.nickname || interaction.user.username;

    interaction.deferReply({
      ephemeral: true,
    });

    const systemTrafficInfo = await edsm.getSystemTrafficInfo(systemName);

    if (systemTrafficInfo === null) {
      interaction.editReply({
        content: "Cannot find Traffic Info",
      });
      return;
    }

    if (
      systemTrafficInfo.breakdown === null ||
      systemTrafficInfo.breakdown === undefined ||
      systemTrafficInfo.traffic == null
    ) {
      interaction.editReply({
        content: "No ship info is in EDSM for this system",
      });
      return;
    }

    const shipsAndCount = getShipAndCount(systemTrafficInfo);

    let options_list: string[] = [
      "System Name",
      "Today",
      "This Week",
      "All Time",
      ...shipsAndCount.shipNames,
    ];
    let values: string[] = [
      systemTrafficInfo.name,
      systemTrafficInfo.traffic.day.toString(),
      systemTrafficInfo.traffic.week.toString(),
      systemTrafficInfo.traffic.total.toString(),
      ...shipsAndCount.shipCount,
    ];

    let embeded_message = embedMessage(
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
      options.get("system_name")?.value?.toString() || "SOL";
    const nickName = userInterected?.nickname || interaction.user.username;

    const title: string = "System Death Info";
    interaction.deferReply({
      ephemeral: true,
    });
    const systemDeath = await edsm.getSystemDeath(systemName);

    if (systemDeath === null || systemDeath.deaths === undefined) {
      interaction.editReply({
        content: "Cannot find system Death Info!",
      });
      return;
    }

    const options_list = ["System Name", "Today", "This Week", "All Time"];

    const values = [
      systemDeath.name,
      systemDeath.deaths.day,
      systemDeath.deaths.week,
      systemDeath.deaths.total,
    ];

    const embeded_message = embedMessage(title, options_list, values, nickName);

    interaction.editReply({
      embeds: [embeded_message],
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

interface ShipsInfo {
  shipNames: Array<string>;
  shipCount: Array<string>;
}

function getShipAndCount(systemTrafficInfo: SystemTrafficInfo): ShipsInfo {
  let shipNames: string[] = [];
  let shipCount: string[] = [];

  if (systemTrafficInfo.breakdown !== null) {
    if (
      systemTrafficInfo.breakdown.Addar !== null &&
      systemTrafficInfo.breakdown.Addar > 0
    ) {
      shipNames.push("Addar");
      shipCount.push(systemTrafficInfo.breakdown.Addar.toString());
    }
    if (
      systemTrafficInfo.breakdown.Anaconda !== null &&
      systemTrafficInfo.breakdown.Anaconda > 0
    ) {
      shipNames.push("Anaconda");
      shipCount.push(systemTrafficInfo.breakdown.Anaconda.toString());
    }
    if (
      systemTrafficInfo.breakdown["Asp Explorer"] !== null &&
      systemTrafficInfo.breakdown["Asp Explorer"] > 0
    ) {
      shipNames.push("Asp Explorer");
      shipCount.push(systemTrafficInfo.breakdown["Asp Explorer"].toString());
    }

    if (
      systemTrafficInfo.breakdown["Beluga Liner"] !== null &&
      systemTrafficInfo.breakdown["Beluga Liner"] > 0
    ) {
      shipNames.push("Beluga Liner");
      shipCount.push(systemTrafficInfo.breakdown["Beluga Liner"].toString());
    }

    if (
      systemTrafficInfo.breakdown["Cobra MkIII"] !== null &&
      systemTrafficInfo.breakdown["Cobra MkIII"] > 0
    ) {
      shipNames.push("Cobra MkIII");
      shipCount.push(systemTrafficInfo.breakdown["Cobra MkIII"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Diamondback Explorer"] !== null &&
      systemTrafficInfo.breakdown["Diamondback Explorer"] > 0
    ) {
      shipNames.push("Diamondback Explorer");
      shipCount.push(
        systemTrafficInfo.breakdown["Diamondback Explorer"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown.Dolphin !== null &&
      systemTrafficInfo.breakdown.Dolphin > 0
    ) {
      shipNames.push("Dolphin");
      shipCount.push(systemTrafficInfo.breakdown.Dolphin.toString());
    }
    if (
      systemTrafficInfo.breakdown["Federal Assault Ship"] !== null &&
      systemTrafficInfo.breakdown["Federal Assault Ship"] > 0
    ) {
      shipNames.push("Federal Assault Ship");
      shipCount.push(
        systemTrafficInfo.breakdown["Federal Assault Ship"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Federal Corvette"] !== null &&
      systemTrafficInfo.breakdown["Federal Corvette"] > 0
    ) {
      shipNames.push("Federal Corvette");
      shipCount.push(
        systemTrafficInfo.breakdown["Federal Corvette"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Federal Gunship"] !== null &&
      systemTrafficInfo.breakdown["Federal Gunship"] > 0
    ) {
      shipNames.push("Federal Gunship");
      shipCount.push(systemTrafficInfo.breakdown["Federal Gunship"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Fer-de-Lance"] !== null &&
      systemTrafficInfo.breakdown["Fer-de-Lance"] > 0
    ) {
      shipNames.push("Fer-de-Lance");
      shipCount.push(systemTrafficInfo.breakdown["Fer-de-Lance"].toString());
    }
    if (
      systemTrafficInfo.breakdown.Hauler !== null &&
      systemTrafficInfo.breakdown.Hauler > 0
    ) {
      shipNames.push("Hauler");
      shipCount.push(systemTrafficInfo.breakdown.Hauler.toString());
    }
    if (
      systemTrafficInfo.breakdown["Imperial Clipper"] !== null &&
      systemTrafficInfo.breakdown["Imperial Clipper"] > 0
    ) {
      shipNames.push("Imperial Clipper");
      shipCount.push(
        systemTrafficInfo.breakdown["Imperial Clipper"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Imperial Courier"] !== null &&
      systemTrafficInfo.breakdown["Imperial Courier"] > 0
    ) {
      shipNames.push("Imperial Courier");
      shipCount.push(
        systemTrafficInfo.breakdown["Imperial Courier"].toString()
      );
    }
    if (
      systemTrafficInfo.breakdown["Imperial Cutter"] !== null &&
      systemTrafficInfo.breakdown["Imperial Cutter"] > 0
    ) {
      shipNames.push("Imperial Cutter");
      shipCount.push(systemTrafficInfo.breakdown["Imperial Cutter"].toString());
    }
    if (
      systemTrafficInfo.breakdown.Orca !== null &&
      systemTrafficInfo.breakdown.Orca > 0
    ) {
      shipNames.push("Orca");
      shipCount.push(systemTrafficInfo.breakdown.Orca.toString());
    }
    if (
      systemTrafficInfo.breakdown.Python !== null &&
      systemTrafficInfo.breakdown.Python > 0
    ) {
      shipNames.push("Python");
      shipCount.push(systemTrafficInfo.breakdown.Python.toString());
    }
    if (
      systemTrafficInfo.breakdown["Type-9 Heavy"] !== null &&
      systemTrafficInfo.breakdown["Type-9 Heavy"] > 0
    ) {
      shipNames.push("Type-9 Heavy");
      shipCount.push(systemTrafficInfo.breakdown["Type-9 Heavy"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Viper MkIII"] !== null &&
      systemTrafficInfo.breakdown["Viper MkIII"] > 0
    ) {
      shipNames.push("Viper MkIII");
      shipCount.push(systemTrafficInfo.breakdown["Viper MkIII"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Viper MkIV"] !== null &&
      systemTrafficInfo.breakdown["Viper MkIV"] > 0
    ) {
      shipNames.push("Viper MkIV");
      shipCount.push(systemTrafficInfo.breakdown["Viper MkIV"].toString());
    }
    if (
      systemTrafficInfo.breakdown["Vulture"] !== null &&
      systemTrafficInfo.breakdown["Vulture"] > 0
    ) {
      shipNames.push("Vulture");
      shipCount.push(systemTrafficInfo.breakdown["Vulture"].toString());
    }
  }

  return {
    shipNames,
    shipCount,
  };
}

export default interactionCommandHandler;

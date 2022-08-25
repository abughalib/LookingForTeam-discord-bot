import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { AppSettings } from "../utils/settings";
import formatTime from "../utils/helpers";
import embedMessage from "./embeded_message";

async function handleInteractions(interaction: Interaction) {
  if (interaction.isCommand()) {
    interactionCommandHandler(interaction);
  } else if (interaction.isButton()) {
    interactionButtonHandler(interaction);
  } else {
    // To be Implemented in Future if needed
    return;
  }
}

async function interactionCommandHandler(interaction: CommandInteraction) {
  const { commandName, options } = interaction;

  if (interaction.guild == null) {
    console.error("interaction guild null: ");
    return;
  }

  const userInterected = await interaction.guild.members.fetch(
    interaction.user.id
  );
  const nickName = userInterected?.nickname || interaction.user.username;

  if (commandName === "lookingforteam") {
    const version =
      options.get("version")?.value || AppSettings.DEFAULT_GAME_VERSION;
    const activity =
      options.get("activity")?.value || AppSettings.DEFAULT_TEAM_ACTIVITY;
    const location =
      options.get("location")?.value || AppSettings.DEFAULT_TEAM_LOCATION;
    let spots = options.get("spots")?.value || AppSettings.MAXIMUM_TEAM_SPOT;
    let duration: number =
      (options.get("duration")?.value as number) ||
      AppSettings.DEFAULT_TEAM_DURATION;

    // Maximum spot in wing is MAXIMUM_TEAM_SPOT which is 3 as of now
    if (spots > AppSettings.MAXIMUM_TEAM_SPOT) {
      spots = AppSettings.MAXIMUM_TEAM_SPOT;
    }
    // If Duration is more then MAXIMUM_HOURS_TEAM hours convert it into Minutes
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
      duration = duration / 60;
    }

    // If Duration is more then 18 hours dismiss it.
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM * 60) {
      return;
    }

    const list_headers = [
      "Game Version",
      "What kind of mission/gameplay?",
      "Star System/Location",
      "Number of Space in Wing/Team Available",
    ];
    const list_headers_values = [version, activity, location, spots];
    const title: string = "PC Team + Wing Request";

    let embeded_message = embedMessage(
      title,
      list_headers,
      list_headers_values,
      nickName
    );

    // Adding time
    embeded_message.addFields({
      name: "Duration/TimeFrame",
      value: `${formatTime(duration)}`,
    });

    // Time can't be negative;
    if (duration < 0) {
      duration = AppSettings.DEFAULT_TEAM_DURATION;
    }

    embeded_message.setFooter({
      text: `Auto delete in ${duration * 60} minutes`,
    });

    //Adding Button
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("command_join")
        .setLabel("Request Team Invite")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("command_dismiss")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.deferReply({
      ephemeral: false,
    });

    // Pretty Looking reply
    await interaction.editReply({
      embeds: [embeded_message],
      components: [buttons],
    });

    // Auto Delete message after certain time.
    setTimeout(async () => {
      await interaction.deleteReply().catch((error) => {
        // Message Deletion failed and its unknown Error.
        if (error.code !== 10008) {
          console.error(`Failed to to delete the message: ${error}`);
        } else {
          console.info("Message Already Deleted");
        }
      });
    }, AppSettings.HOURS_TO_MILISEC * duration);
  }
}

async function interactionButtonHandler(interaction: ButtonInteraction) {
  if (interaction.customId === "command_join") {
    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction == null) {
      interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
      return;
    }

    if (interaction.message.interaction.user === interaction.user) {
      interaction.reply({
        content: "You want to invite yourself in?",
        ephemeral: true,
      });
      return;
    }

    let originalUserInteraction = interaction.message.interaction.user;
    let currentUserInteraction = interaction.user;

    interaction.reply({
      content: `Hey ${originalUserInteraction}, ${currentUserInteraction} is looking for Team Invite`,
    });

    setTimeout(async () => {
      await interaction.deleteReply().catch((error) => {
        if (error.code !== 10008) {
          console.error(`Failed to to delete the message: ${error}`);
        } else {
          console.info("Message Already Deleted");
        }
      });
    }, AppSettings.DEFAULT_REQUEST_TEAM_TIMEOUT);
  }

  if (interaction.customId === "command_dismiss") {
    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction == null) {
      interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
      return;
    }

    // If the Original Author of interaction clicks on dismiss
    if (interaction.message.interaction.user === interaction.user) {
      interaction.message.delete().catch((error) => {
        if (error.code !== 10008) {
          console.error(`Failed to to delete the message: ${error}`);
        } else {
          console.info("Message Already Deleted");
        }
        return;
      });
      interaction.reply({
        content: "Your message is deleted",
        ephemeral: true,
      });
      return;
    }

    interaction.reply({
      content: "You can't use this button to dismiss",
      ephemeral: true,
    });
  }
}

export default handleInteractions;

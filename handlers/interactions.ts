import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Interaction,
  SelectMenuBuilder,
  SelectMenuInteraction,
  EmbedBuilder,
  Embed,
} from "discord.js";
import { AppSettings } from "../utils/settings";
import formatTime from "../utils/helpers";
import embedMessage from "./embeded_message";

async function handleInteractions(interaction: Interaction) {
  const menus = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder()
      .setCustomId("select_game_version")
      .setPlaceholder("Game Version")
      .addOptions(
        {
          label: "Odyssey",
          description: "Elite Dangerous Odyssey 4.0",
          value: "odyssey",
        },
        {
          label: "Horizon 4.0",
          description: "Elite Dangerous Horizon 4.0",
          value: "horizon_four_zero",
        },
        {
          label: "Horizon 3.8",
          description: "Elite Dangerous Horizon 3.8",
          value: "horizon_three_eight",
        },
        {
          label: "Beyond",
          description: "Elite Dangerous Beyond",
          value: "beyond",
        }
      )
  );

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

  if (interaction.isCommand()) {
    interactionCommandHandler(interaction, menus, buttons);
  } else if (interaction.isButton()) {
    interactionButtonHandler(interaction);
  } else if (interaction.isSelectMenu()) {
    interactionMenuHandler(interaction, buttons);
  } else {
    // To be Implemented in Future if needed
    return;
  }
}

async function interactionCommandHandler(
  interaction: CommandInteraction,
  menus: ActionRowBuilder<SelectMenuBuilder>,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  const { commandName, options } = interaction;

  if (interaction.guild == null) {
    console.error("interaction guild null: ");
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
  ];

  if (commandName === "wing") {
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

    const options_values = [activity, location, spots];

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
    setTimeout(async () => {
      await interaction.deleteReply().catch((error) => {
        // Message Already Deleted
        if (error.code === 10008) {
          console.info("Message Already Deleted");
        } else if (error.code === 50027) {
          // Discord API Error, Invalid Webhook Token
          // Retry
          retryDeletingMessage(interaction);
        } else {
          // Message Deletion failed and its unknown Error.
          console.error(`Failed to to delete the message: ${error}`);
        }
      });
    }, AppSettings.HOURS_TO_MILISEC * duration);
  } else if (commandName === "winghelp") {
    const title: string = "How to use, Check example.";
    const list_options = [
      "Command",
      "Game Version",
      "What kind of mission/gameplay?",
      "Star System/Location",
      "Number of Space in Wing/Team Available",
      "Duration/TimeFrame",
    ];
    const list_options_values = [
      "Use `/wing`",
      "Odyssey, Horizon 4.0, Horizon 3.8, ED Beyond",
      "Mining, Bounty Hunting, etc...",
      "SOL",
      "2 Spots",
      "1.5 (1 hours and 30 minutes)",
    ];

    let embeded_message = embedMessage(
      title,
      list_options,
      list_options_values,
      interaction.user.username || "Unknown"
    );

    embeded_message.setFooter({
      text: `Auto delete in ${
        AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT / 1000
      } seconds`,
    });

    await interaction.deferReply({
      ephemeral: true,
    });

    await interaction.editReply({
      embeds: [embeded_message],
    });
  } else if (commandName === "ping") {
    await interaction.reply({
      content: "Bots never sleeps",
      ephemeral: true,
    });
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
        // Message Already Deleted
        if (error.code === 10008) {
          console.info("Message Already Deleted");
        } else if (error.code === 50027) {
          // Discord API Error, Invalid Webhook Token
          // Retry
          retryDeletingMessage(interaction);
        } else {
          // Message Deletion failed and its unknown Error.
          console.error(`Failed to to delete the message: ${error}`);
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
      content: "Cannot perform this action",
      ephemeral: true,
    });
  }
}

/// Function to handle Discord API Error [50027]
/// Its discord's error, this function would be removed when Discord fixes it.
async function retryDeletingMessage(
  interaction: CommandInteraction | ButtonInteraction
) {
  let tries: number = 0;
  const MAX_TRIES = 10;
  const RETRY_MESSAGE_DELETION = 1000 * 15 * 60; // 15 Minutes

  setInterval(async () => {
    await interaction.deleteReply().catch((error) => {
      if (error.code === 10008) {
        return;
      } else if (error.code === 50027) {
        console.error(
          `Trying to Delete got APIError[50027], retrying: ${tries} `
        );
      } else {
        // Some Other error.
        console.error(`Failed to to delete the message: ${error}`);
        return;
      }
    });
    tries += 1;
    if (tries > MAX_TRIES) {
      console.error(
        `Failed to Delete the message after ${MAX_TRIES}, DiscordAPIError[50027]`
      );
      return;
    }
  }, RETRY_MESSAGE_DELETION);
}

async function interactionMenuHandler(
  interaction: SelectMenuInteraction,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  if (interaction.user !== interaction.message.interaction?.user) {
    interaction.reply({
      content: "You cannot perform this action",
      ephemeral: true,
    });
    return;
  }

  let original_message: Embed = interaction.message.embeds[0];
  let title = original_message.data.title;
  let fields = original_message.data.fields;

  let new_embeded_message = new EmbedBuilder();
  new_embeded_message.setTitle(title || "");
  new_embeded_message.addFields(fields || [{ name: "", value: "" }]);

  if (interaction.customId === "select_game_version") {
    await interaction.deferUpdate();
    if (interaction.values[0] === "odyssey") {
      new_embeded_message.addFields({
        name: "Elite Dangerous Version",
        value: "Elite Dangerous Odyssey",
      });
      await interaction.editReply({
        components: [buttons],
        embeds: [new_embeded_message],
      });
    } else if (interaction.values[0] === "horizon_four_zero") {
      new_embeded_message.addFields({
        name: "Elite Dangerous Version",
        value: "Elite Dangerous Horizon 4.0",
      });
      await interaction.editReply({
        components: [buttons],
        embeds: [new_embeded_message],
      });
    } else if (interaction.values[0] === "horizon_three_eight") {
      new_embeded_message.addFields({
        name: "Elite Dangerous Version",
        value: "Elite Dangerous Horizon 3.8",
      });
      await interaction.editReply({
        components: [buttons],
        embeds: [new_embeded_message],
      });
    } else if (interaction.values[0] === "beyond") {
      new_embeded_message.addFields({
        name: "Elite Dangerous Version",
        value: "Elite Dangerous Beyond",
      });
      await interaction.editReply({
        components: [buttons],
        embeds: [new_embeded_message],
      });
    }
  }
}

export default handleInteractions;

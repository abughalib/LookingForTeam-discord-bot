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
  Message,
  APIEmbedField,
  CacheType,
} from "discord.js";
import { AppSettings } from "../utils/settings";
import formatTime from "../utils/helpers";
import embedMessage from "./embeded_message";

async function handleInteractions(interaction: Interaction) {
  const menus = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder()
      .setCustomId("select_game_version")
      .setPlaceholder("Game Version")
      .addOptions(AppSettings.AVAILABLE_GAME_VERSIONS)
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

  if (commandName === AppSettings.BOT_WING_COMMAND_NAME) {
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

    // If Duration is more then 10 hours dismiss it.
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM * 60) {
      return;
    }

    const options_values = [activity, location, parseInt(spots.toString())];

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
      text: `Auto delete in ${Math.ceil(duration * 60)} minutes`,
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

    let sent_message = await interaction.fetchReply();

    // Auto Delete message after certain time.
    setTimeout(async () => {
      await interaction.deleteReply().catch((error) => {
        // Message Already Deleted
        if (error.code === 10008) {
          console.info("Message Already Deleted");
        } else if (error.code === 50027) {
          // Discord API Error, Invalid Webhook Token
          deleteMessage(sent_message);
        } else {
          // Message Deletion failed and its unknown Error.
          console.error(`Failed to to delete the message: ${error}`);
        }
      });
    }, AppSettings.HOURS_TO_MILISEC * duration);
  } else if (commandName === AppSettings.BOT_HELP_COMMAND_NAME) {
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
  } else if (commandName === AppSettings.BOT_PING_COMMAND_NAME) {
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

    if (interaction.message.embeds[0].data.fields === undefined) {
      return;
    }

    let originalUserInteraction = interaction.message.interaction.user;
    let currentUserInteraction = interaction.user;

    let originalFields: APIEmbedField[] =
      interaction.message.embeds[0].data.fields;

    let spots: number = 0;

    originalFields.forEach((field) => {
      if (field.name === "Number of Space in Wing/Team Available") {
        spots = parseInt(field.value);
      }
    });

    if (spots <= 0) {
      interaction.reply({
        ephemeral: true,
        content: "Sorry, but the team is already full.",
      });
      return;
    }

    let buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("accept_request")
        .setLabel("Accept Request")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("reject_request")
        .setLabel("Decline/Cancel Request")
        .setStyle(ButtonStyle.Danger)
    );

    interaction.reply({
      content: `Hey ${originalUserInteraction}, ${currentUserInteraction} is looking for Team Invite`,
      components: [buttons],
    });
    deleteInteractionButton(
      interaction,
      AppSettings.DEFAULT_REQUEST_TEAM_TIMEOUT
    );
  } else if (interaction.customId === "command_dismiss") {
    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction === null) {
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
    } else {
      interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
    }
  } else if (
    interaction.customId === "accept_request" ||
    interaction.customId === "reject_request"
  ) {
    if (interaction.message.reference === null) {
      console.error("Interaction is null: " + interaction.message);
      return;
    }
    if (interaction.message.reference.messageId === undefined) {
      console.error(
        "Interaction Reference MessageId undefined: " +
          interaction.message.reference
      );
      return;
    }
    if (interaction.channel === null) {
      console.error("Interaction Channel is null: " + interaction);
      return;
    }

    let messageId: string = interaction.message.reference.messageId;
    let message: Message | null = await interaction.channel.messages
      .fetch(messageId)
      .catch((error) => {
        console.log("Cannot find message: " + error);
        return null;
      });
    if (message === null || message.interaction == null) {
      return;
    }

    if (interaction.customId === "accept_request") {
      if (interaction.user === message.interaction.user) {
        // Edit the interection
        // and delete the reply

        let original_message: Embed = message.embeds[0];
        let title = original_message.data.title;
        let author = original_message.data.author?.name || "";
        let fields = original_message.data.fields;
        let timestamp = original_message.timestamp;

        if (!title || !author || !fields || !timestamp) {
          console.error("Cannot find original interaction embed fields");
          return;
        }

        if (fields === undefined) {
          return;
        }

        let spots_count: number = 0;
        let new_fields: APIEmbedField[] = [];

        fields.forEach((field) => {
          if (field.name === "Number of Space in Wing/Team Available") {
            new_fields.push({
              name: "Number of Space in Wing/Team Available",
              value: (parseInt(field.value) - 1).toString(),
            });
          } else {
            new_fields.push(field);
          }
        });

        let footer = original_message.data.footer?.text || "";

        let new_embeded_message = new EmbedBuilder();
        new_embeded_message.setTitle(title || "");
        new_embeded_message.setAuthor({ name: author });
        new_embeded_message.addFields(new_fields || [{ name: "", value: "" }]);
        new_embeded_message.setFooter({ text: footer });
        new_embeded_message.setTimestamp(Date.parse(timestamp));

        if (fields === undefined) {
          return;
        }

        await message.edit({
          embeds: [new_embeded_message],
        });

        await interaction.reply({
          ephemeral: false,
          content: `${interaction.message.author}, Your request is accepted`,
        });
        deleteInteractionButton(
          interaction,
          AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT
        );
        deleteMessage(interaction.message);
      } else {
        await interaction.reply({
          ephemeral: true,
          content: `You Cannot Perform this action`,
        });
      }
    } else if (interaction.customId === "reject_request") {
      // Reject request
      // It should be done by either original author or the one requested.
      if (interaction.message.mentions.users.has(interaction.user.id)) {
        interaction.reply({
          ephemeral: true,
          content: "Request Cancelled",
        });
        deleteMessage(interaction.message);
      } else {
        interaction.reply({
          ephemeral: true,
          content: "You cannot perform this action",
        });
      }
    }
  } else {
    // If More features are required
    // Would be Implemented later...
  }
}

async function interactionMenuHandler(
  interaction: SelectMenuInteraction,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  if (interaction.message.interaction === null) {
    return;
  }
  if (interaction.user !== interaction.message.interaction.user) {
    interaction.reply({
      content: "You cannot perform this action",
      ephemeral: true,
    });
    return;
  }

  let original_message: Embed = interaction.message.embeds[0];
  let title = original_message.data.title;
  let author = original_message.data.author?.name || "";
  let fields = original_message.data.fields;
  let footer = original_message.data.footer?.text || "";
  let timestamp = original_message.data.timestamp;

  if (!title || !author || !fields || !footer || !timestamp) {
    console.error("Cannot find original interaction message");
    return;
  }

  let new_embeded_message = new EmbedBuilder();
  new_embeded_message.setTitle(title);
  new_embeded_message.setAuthor({ name: author });
  new_embeded_message.addFields(fields);
  new_embeded_message.setFooter({ text: footer });
  new_embeded_message.setTimestamp(Date.parse(timestamp) || Date.now());

  if (interaction.customId === "select_game_version") {
    await interaction.deferUpdate();

    AppSettings.AVAILABLE_GAME_VERSIONS.forEach(async (version) => {
      if (version.value === interaction.values[0]) {
        new_embeded_message.addFields({
          name: AppSettings.GAME_NAME + " Version",
          value: version.description,
        });
        await interaction.editReply({
          components: [buttons],
          embeds: [new_embeded_message],
        });
      }
    });
  }
}

async function deleteInteractionButton(
  interaction: ButtonInteraction<CacheType>,
  timeout: number
) {
  let message = await interaction.fetchReply();
  setTimeout(async () => {
    await interaction.deleteReply().catch((error) => {
      // Message Already Deleted
      if (error.code === 10008) {
        console.info("Message Already Deleted");
      } else if (error.code === 50027) {
        // Discord API Error, Invalid Webhook Token
        deleteMessage(message);
      } else {
        // Message Deletion failed and its unknown Error.
        console.error(`Failed to to delete the message: ${error}`);
      }
    });
  }, timeout);
}

async function deleteMessage(message: Message | null | undefined) {
  if (message === null || message === undefined) {
    return;
  }
  await message.delete().catch((error) => {
    if (error.code === 10008) {
      console.info("Message Already Deleted");
    } else if (error.code === 50027) {
      // This is a known error
      console.error("Failed to delete message 50027 error");
    } else {
      console.log("Unknown Error: ", error);
    }
  });
}

export default handleInteractions;

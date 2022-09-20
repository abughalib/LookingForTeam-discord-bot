import {
  ButtonInteraction,
  APIEmbedField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  Embed,
  EmbedBuilder,
  User,
  Collection,
} from "discord.js";
import { removeEntry } from "../../utils/helpers";
import { AppSettings } from "../../utils/settings";
import deleteInteractionButton from "./deleteInteractions";
import deleteMessage from "./deleteMessage";

async function interactionButtonHandler(interaction: ButtonInteraction) {
  if (interaction.customId === AppSettings.BUTTON_JOIN_ID) {
    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction == null) {
      await interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
      return;
    }

    if (interaction.message.interaction.user === interaction.user) {
      await interaction.reply({
        content: "You want to invite yourself in?",
        ephemeral: true,
      });
      return;
    }

    if (interaction.message.embeds[0].data.fields === undefined) {
      await interaction.reply({
        content: "Undefined Team Invite",
        ephemeral: true,
      });
      return;
    }

    const originalUserInteraction = interaction.message.interaction.user;
    const currentUserInteraction = interaction.user;

    let joined_user = "";

    let spots: number = 0;

    for (const field of interaction.message.embeds[0].data.fields) {
      if (field.name === "Number of Space in Wing/Team Available") {
        spots = parseInt(field.value);
      } else if (field.name === "Players Joined") {
        joined_user = field.value;
      }
    }

    if (joined_user.includes(interaction.user.toString())) {
      await interaction.reply({
        content: "You're already in the Team",
        ephemeral: true,
      });
      return;
    }

    if (spots <= 0) {
      await interaction.reply({
        ephemeral: true,
        content: "Sorry, but the team is already full.",
      });
      return;
    }

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(AppSettings.BUTTON_ACCEPT_REQUEST_ID)
        .setLabel(AppSettings.BUTTON_ACCEPT_REQUEST_LABEL)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(AppSettings.BUTTON_REJECT_REQUEST_ID)
        .setLabel(AppSettings.BUTTON_REQUEST_REQUEST_LABEL)
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `Hey ${originalUserInteraction}, ${currentUserInteraction} is looking for Team Invite`,
      components: [buttons],
    });
    deleteInteractionButton(
      interaction,
      AppSettings.DEFAULT_REQUEST_TEAM_TIMEOUT
    );
  } else if (interaction.customId === AppSettings.BUTTON_DISMISS_ID) {
    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction === null) {
      await interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
      return;
    }

    // If the Original Author of interaction clicks on dismiss
    if (interaction.message.interaction.user === interaction.user) {
      await deleteMessage(interaction.message);
      await interaction.reply({
        content: "Your message is deleted",
        ephemeral: true,
      });
      return;
    } else {
      await interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
    }
  } else if (
    interaction.customId === AppSettings.BUTTON_ACCEPT_REQUEST_ID ||
    interaction.customId === AppSettings.BUTTON_REJECT_REQUEST_ID
  ) {
    if (interaction.message.reference === null) {
      console.error("Interaction is null: " + interaction.message);
      await interaction.reply({
        content: "Original Message not Found",
        ephemeral: true,
      });
      return;
    }
    if (interaction.message.reference.messageId === undefined) {
      console.error(
        "Interaction Reference MessageId undefined: " +
          interaction.message.reference
      );
      await interaction.reply({
        content: "Original Message not Found",
        ephemeral: true,
      });
      return;
    }

    const messageId: string = interaction.message.reference.messageId;
    const message: Message | null = await getMessageByID(
      interaction,
      messageId
    );
    if (message === null || message.interaction == null) {
      await interaction.reply({
        content: "Original Message not Found",
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId === AppSettings.BUTTON_ACCEPT_REQUEST_ID) {
      if (interaction.user === message.interaction.user) {
        // Edit the interection
        // and delete the reply

        const original_message: Embed = message.embeds[0];
        const title = original_message.data.title;
        const author = original_message.data.author?.name || "";
        const fields = original_message.data.fields;
        const timestamp = original_message.timestamp;

        if (!title || !author || !fields || !timestamp) {
          console.error("Cannot find original interaction embed fields");
          return;
        }

        let new_fields: APIEmbedField[] = [];
        let mentionedUser: Collection<string, User>;

        for (const field of fields) {
          if (field.name === "Number of Space in Wing/Team Available") {
            new_fields.push({
              name: "Number of Space in Wing/Team Available",
              value: (parseInt(field.value) - 1).toString(),
            });
          } else if (field.name === "Players Joined") {
            mentionedUser = interaction.message.mentions.users;
            new_fields.push({
              name: field.name,
              value: `${field.value}\n${
                mentionedUser.first() === interaction.user
                  ? mentionedUser.last()
                  : mentionedUser.first()
              }`,
            });
          } else {
            new_fields.push(field);
          }
        }

        const footer = original_message.data.footer?.text || "";

        let new_embeded_message = new EmbedBuilder();
        new_embeded_message.setTitle(title || "");
        new_embeded_message.setAuthor({ name: author });
        new_embeded_message.addFields(new_fields || [{ name: "", value: "" }]);
        new_embeded_message.setFooter({ text: footer });
        new_embeded_message.setTimestamp(Date.parse(timestamp));

        await message.edit({
          embeds: [new_embeded_message],
        });

        await interaction.reply({
          ephemeral: false,
          content:
            `${interaction.message.mentions.users.last()}, Your request is accepted` +
            `\nMake sure you have ${interaction.message.mentions.users.first()} as your in-game friend`,
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
    } else if (interaction.customId === AppSettings.BUTTON_REJECT_REQUEST_ID) {
      // Reject request
      // It should be done by either original author or the one requested.
      if (interaction.message.mentions.users.has(interaction.user.id)) {
        await interaction.reply({
          ephemeral: true,
          content: "Request Cancelled",
        });
        deleteMessage(interaction.message);
      } else {
        await interaction.reply({
          ephemeral: true,
          content: "You cannot perform this action",
        });
      }
    }
  } else if (interaction.customId === AppSettings.BUTTON_LEAVE_TEAM_ID) {
    await interaction.deferReply({
      ephemeral: true,
    });
    if (interaction.message.interaction === null) {
      console.error("Interaction is null: " + interaction.message);
      await interaction.editReply({
        content: "Interaction null",
      });
      return;
    }
    if (interaction.message.interaction.id === undefined) {
      console.error(
        "Interaction Reference MessageId undefined: " +
          interaction.message.reference
      );
      await interaction.editReply({
        content: "Original Message reference not Found",
      });
      return;
    }
    if (interaction.channel === null) {
      console.error("Interaction Channel is null: " + interaction);
      await interaction.editReply({
        content: "Original Channel not Found",
      });
      return;
    }

    let messageId: string = interaction.message.id;
    let message: Message | null = await getMessageByID(interaction, messageId);
    if (message === null || message.interaction == null) {
      await interaction.editReply({
        content: "Original Message null",
      });
      return;
    }

    // Edit the interection
    // and delete the reply

    const original_message: Embed = message.embeds[0];
    const title = original_message.data.title;
    const author = original_message.data.author?.name || "";
    const fields = original_message.data.fields;
    const timestamp = original_message.timestamp;

    if (!title || !author || !fields || !timestamp) {
      console.error("Cannot find original interaction embed fields");
      await interaction.editReply({
        content: "Original Message Fields not Found",
      });
      return;
    }

    if (fields === undefined) {
      await interaction.editReply({
        content: "Original Message field not Defined",
      });
      return;
    }

    let new_fields: APIEmbedField[] = [];
    let team_players: string[] = [];
    let players: string = "";

    for (const field of fields) {
      if (field.name === "Number of Space in Wing/Team Available") {
        new_fields.push({
          name: "Number of Space in Wing/Team Available",
          value: (parseInt(field.value) + 1).toString(),
        });
      } else if (field.name === "Players Joined") {
        players = field.value;
        new_fields.push(field);
      } else {
        new_fields.push(field);
      }
    }

    team_players = players.split("\n");

    if (team_players.indexOf(interaction.user.toString()) === 0) {
      await interaction.editReply({
        content:
          "You're the one created it, To leave please use `Delete` button",
      });
      return;
    }

    if (!players.includes(interaction.user.toString())) {
      await interaction.editReply({
        content: "You're not in the Team",
      });
      return;
    }

    team_players = removeEntry(team_players, interaction.user.toString());

    for (const field of new_fields) {
      if (field.name === "Players Joined") {
        field.value = team_players.join("\n") || "";
      }
    }

    const footer = original_message.data.footer?.text || "";

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

    await interaction.editReply({
      content: `You left the Team`,
    });
  } else {
    // If More features are required
    // Would be Implemented later...
  }
}

/*
  Args:
    ButtonInteraction
  Returns:
    Message if found or null
*/
async function getMessageByID(
  interaction: ButtonInteraction,
  messageId: string
): Promise<Message | null> {
  if (interaction.channel === null) {
    console.error("Interaction Channel is null: " + interaction);
    await interaction.reply({
      content: "Original Channel not Found",
      ephemeral: true,
    });
    return null;
  }

  const message = await interaction.channel.messages
    .fetch(messageId)
    .catch((error) => {
      console.log("Cannot find message: " + error);
      return null;
    });
  return message;
}

export default interactionButtonHandler;

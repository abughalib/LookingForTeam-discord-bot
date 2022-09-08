import {
  ButtonInteraction,
  APIEmbedField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  Embed,
  EmbedBuilder,
} from "discord.js";
import { AppSettings } from "../../utils/settings";
import deleteInteractionButton from "./deleteInteractions";
import deleteMessage from "./deleteMessage";

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
          content: `${interaction.message.mentions.users.last()}, Your request is accepted`,
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

export default interactionButtonHandler;

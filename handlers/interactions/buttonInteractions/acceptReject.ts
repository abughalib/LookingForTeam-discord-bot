import {
  APIEmbedField,
  ButtonInteraction,
  Collection,
  Embed,
  EmbedBuilder,
  Message,
  MessageFlags,
  User,
} from "discord.js";
import { AppSettings } from "../../../utils/settings";
import deleteInteraction from "../utils/deleteInteractions";
import deleteMessage from "../utils/deleteMessage";
import getMessageByID from "./manageMessages";
import CreateButtons from "../utils/createButtons";

/**
 * To accept or reject a user's Team Request.
 * It will delete the message and the interaction.
 * Accept is only accessible to the Team Leader.
 * Reject/Cancel is accessible to the Team Leader and the user who sent the request.
 * @param interaction Button Interaction
 */

async function acceptOrReject(interaction: ButtonInteraction) {
  /*
    * Reason for using common function for both accept and reject button.*
    - Some of checks still needs to be done.
      - If the message.reference deleted my admin.
      - If the message.reference.messageId is undefined.
  */

  if (interaction.message.reference === null) {
    // Log the interaction.message
    // Send ephemeral message to the interaction user notifying the message is deleted.
    console.error("Interaction is null: " + interaction.message);
    await interaction
      .reply({
        content: "Original Message not Found",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("When original message is not found: ", error);
      });
    return;
  }
  // If the message.reference.messageId is undefined.
  if (interaction.message.reference.messageId === undefined) {
    // Log the interaction.message.reference
    console.error(
      "Interaction Reference MessageId undefined: " +
        interaction.message.reference
    );
    // Send ephemeral message to the interaction user notifying the message is deleted.
    await interaction
      .reply({
        content: "Original Message not Found",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("When message reference is null: " + error);
      });
    return;
  }

  // Get this interaction message reference id to fetch the original message.
  const messageId: string = interaction.message.reference.messageId;
  // Get the original message from message Id.
  const message: Message | null = await getMessageByID(interaction, messageId);

  // If the message is null or message.interaction is null
  // i.e message is deleted by admin or message interaction not found.
  if (message === null || message.interactionMetadata == null) {
    // Notify the interaction user that the message is deleted.
    await interaction
      .reply({
        content: "Original Message not Found",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("Message not found: " + error);
      });
    return;
  }

  if (interaction.customId === AppSettings.BUTTON_ACCEPT_REQUEST_ID) {
    // If the button id is BUTTON_ACCEPT_REQUEST_ID

    // In case the interaction user is not the one who created the Team.
    if (interaction.user !== message.interactionMetadata.user) {
      await interaction
        .reply({
          flags: MessageFlags.Ephemeral,
          content: `You Cannot Perform this action`,
        })
        .catch((error) => {
          console.error("When non author accept request: ", error);
        });
    } else {
      // If the interaction user is the one who created the Team.

      // Edit the interection
      // and delete the reply

      // Get origin message embed fields.
      const original_message: Embed = message.embeds[0];
      const title = original_message.data.title;
      const author = original_message.data.author?.name || "";
      const fields = original_message.data.fields;
      const timestamp = original_message.timestamp;

      // If Any of these fields are null or undefined.
      // Log the errors and send ephemeral message to the interaction user.
      if (!title || !fields || !timestamp) {
        console.error("Cannot find original interaction embed fields");
        await interaction
          .reply({
            content: "Cannot find original message content",
            flags: MessageFlags.Ephemeral,
          })
          .catch((error) => {
            console.error(
              "Cannot find original interaction embed fields: ",
              error
            );
          });
        return;
      }

      // Defer interaction reply.
      // This is to prevent the interaction being failed.
      await interaction.deferReply().catch((error) => {
        console.error(error);
      });

      // Create new embed with the original message embed fields.
      // Add the user name in embed message who got accepted to the Team.
      // Edit the interaction message with the new embed.
      // Decrement the spots by 1.
      let new_fields: APIEmbedField[] = [];
      let mentionedUser: Collection<string, User>;

      // Loop through the fields
      /*
              Can be done in better way.
              - Breaking the loop when the field is found.
              - Using Array.find() to find the field.
            */

      for (let i = 0; i < fields.length; i += 1) {
        // TODO - Change check with constants for fields name.
        // Check if the field name refers to the "Team Available Spots"
        if (fields[i].name === "Number of Space in Wing/Team Available") {
          new_fields.push({
            name: "Number of Space in Wing/Team Available",
            value: (parseInt(fields[i].value) - 1).toString(),
          });
        } else if (fields[i].name === "Players Joined") {
          // If the field name is 'Players Joined' field from embed message sent.
          // Adding the users to users to the mentionedUser collection.
          mentionedUser = interaction.message.mentions.users;
          new_fields.push({
            name: fields[i].name,
            value: `${fields[i].value}\n${
              // Mentioned User can get messed up
              // i.e There position can differ from actual mention position.
              // So, it needs to be checked, the mentioned user being added
              // is not the one created the Team/Accepting it.
              mentionedUser.first() === interaction.user
                ? mentionedUser.last()
                : mentionedUser.first()
            }`,
          });
        } else {
          // For other fields simply add them to new_fields.
          new_fields.push(fields[i]);
        }
      }

      // Get origin message embed footer.
      const footer = original_message.data.footer?.text || "";

      // Create new embed with the modified message embed fields.
      // Edit the original message with the new embed.
      // The original message referes to the message sent by
      // the user who created the Team at the first place.
      let new_embeded_message = new EmbedBuilder();
      new_embeded_message.setTitle(title || "");
      new_embeded_message.setAuthor({ name: author });
      new_embeded_message.addFields(new_fields || [{ name: "", value: "" }]);
      new_embeded_message.setFooter({ text: footer });
      new_embeded_message.setTimestamp(Date.parse(timestamp));

      // Edit the original message with the new embed.
      await message.edit({
        embeds: [new_embeded_message],
      });

      // Notify the interaction user that their request is accepted to the Team.
      // And add extra instructions to the user.

      // Dismiss the message.
      // It should only be possible by either of the users mentioned
      const createButton: CreateButtons = new CreateButtons();
      const dismissButton = createButton.createDismissButton(
        AppSettings.BUTTON_DELETE_ACCEPT_MESSAGE
      );

      await interaction
        .editReply({
          content:
            `${interaction.message.mentions.users.last()}, Your request is accepted` +
            `\nMake sure you have ${interaction.message.mentions.users.first()} as your in-game friend`,
          components: [dismissButton],
        })
        .catch((error) => {
          console.error("Team request failed: " + error);
        });
      // Delete the interaction message that the button responds to.
      deleteMessage(interaction.message);
      // Delete the interaction.
      deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
    }
  } else if (interaction.customId === AppSettings.BUTTON_REJECT_REQUEST_ID) {
    // Defer interaction reply.
    await interaction
      .deferReply({
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error(error);
      });
    // If the Reject Team invite is clicked.

    // It should be done by either original author or the one requested.
    if (interaction.message.mentions.users.has(interaction.user.id)) {
      // It would only notify the user who rejected it.

      //Don't know if it would be good to notify the user requested to know
      //if their request is rejected.
      await interaction
        .editReply({
          content: "Request Cancelled",
        })
        .catch((error) => {
          console.error("Reject Request listed user: " + error);
        });
      // Delete the interaction message.
      deleteMessage(interaction.message);
      deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
    } else {
      // If any other user tries to reject the request.
      // Notify the interaction user that they cannot perform this action.
      await interaction
        .editReply({
          content: "You cannot perform this action",
        })
        .catch((error) => {
          console.error("Reject Request by non listed user: " + error);
        });
    }
  }
}

export default acceptOrReject;

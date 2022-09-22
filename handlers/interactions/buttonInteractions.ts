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

/*
  Args:
    ButtonInteraction handler
  Returns:
    void
*/
async function interactionButtonHandler(interaction: ButtonInteraction) {
  // Check button custom id
  if (interaction.customId === AppSettings.BUTTON_JOIN_ID) {
    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction == null) {
      // In case of message interaction null or deleted by admin or bot.
      // sends ephemeral message to the interaction user.
      await interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
      return;
    }

    // Check if the original interaction user is the same as the user who clicked the button.
    // The one who crated is already in the Team and should not be able to join again.
    if (interaction.message.interaction.user === interaction.user) {
      // Sends ephemeral message to the interaction user.
      await interaction.reply({
        content: "You want to invite yourself in?",
        ephemeral: true,
      });
      return;
    }

    // Get the original interaction messages embed message fields.
    // Refer to this BOT_WING_COMMAND_NAME's Embed Message in Command Interaction Handler.
    // Why this check if data.fileds is not null? Refer to My github Repo.
    if (interaction.message.embeds[0].data.fields === undefined) {
      // If fields is undefined, send ephemeral message to the interaction user.
      await interaction.reply({
        content: "Undefined Team Invite",
        ephemeral: true,
      });
      return;
    }

    // Get the original interaction messages user
    const originalUserInteraction = interaction.message.interaction.user;
    // Get original interaction messages embed message fields.
    const fields = interaction.message.embeds[0].data.fields;
    // Get current interaction user.
    const currentUserInteraction = interaction.user;

    // Joined User from the original interaction message embed field value.
    // It is stored as a string.
    let joined_user = "";

    // The number of spots/space in a Team is stored in the embed field value.
    let spots: number = 0;

    // Loop through the embed fields.
    for (let i = 0; i < fields.length; i += 1) {
      // Get the embed field value where the key is "Team space".
      // TODO - Change this to a constant.
      if (fields[i].name === "Number of Space in Wing/Team Available") {
        // Get the number of spots/space in a Team.
        spots = parseInt(fields[i].value);
      } else if (fields[i].name === "Players Joined") {
        // Get the joined user from the embed field value.
        // Player joined refers to the users already on the Team.
        joined_user = fields[i].value;
      }
    }

    // Check if this user is already in the Team.
    // One user should be only onces in the Team.
    // If the user is already in the Team, send ephemeral message to the interaction user.
    if (joined_user.includes(interaction.user.toString())) {
      await interaction.reply({
        content: "You're already in the Team",
        ephemeral: true,
      });
      return;
    }

    // Check if the Team is Already full.
    // If the Team is full, send ephemeral message to the interaction user.
    if (spots <= 0) {
      await interaction.reply({
        ephemeral: true,
        content: "Sorry, but the team is already full.",
      });
      return;
    }

    // Create buttons for users to interact with Embed Message
    // Accept Button should add the user to the Team if its approved
    // By the one who created the Team.

    // Decline Button would give message to the user the request is declined.
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
    // In case of Requesting for Invite.
    // The user who request and the user who created the Team will be notified.
    await interaction.reply({
      content: `Hey ${originalUserInteraction}, ${currentUserInteraction} is looking for Team Invite`,
      components: [buttons],
    });
    // Delete the interaction after a certain Time.
    deleteInteractionButton(
      interaction,
      AppSettings.DEFAULT_REQUEST_TEAM_TIMEOUT
    );
  } else if (interaction.customId === AppSettings.BUTTON_DISMISS_ID) {
    // If the user who created or the user who request the Team declines the invite.

    // If Interaction message is null or delete by admin.
    if (interaction.message.interaction === null) {
      await interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
      return;
    }

    // If the one who requested the Team declines invite.
    // This should delete the message;
    // Should send ephemeral message to the user who requested the Team notifying message is deleted.
    if (interaction.message.interaction.user === interaction.user) {
      // Delete the request message.
      await deleteMessage(interaction.message);
      // Send ephemeral message to the user who requested the Team.
      await interaction.reply({
        content: "Your message is deleted",
        ephemeral: true,
      });
      return;
    } else {
      // If the anyone except the user who requested the Team
      // or the one created the Team declines the invite.
      await interaction.reply({
        content: "Cannot perform this action",
        ephemeral: true,
      });
    }
  } else if (
    interaction.customId === AppSettings.BUTTON_ACCEPT_REQUEST_ID ||
    interaction.customId === AppSettings.BUTTON_REJECT_REQUEST_ID
  ) {
    /*
      * Reason for using common function for both accept and reject button.
      - Some of checks still needs to be done.
        - If the message.reference deleted my admin.
        - If the message.reference.messageId is undefined.
    */

    if (interaction.message.reference === null) {
      // Log the interaction.message
      // Send ephemeral message to the interaction user notifying the message is deleted.
      console.error("Interaction is null: " + interaction.message);
      await interaction.reply({
        content: "Original Message not Found",
        ephemeral: true,
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
      await interaction.reply({
        content: "Original Message not Found",
        ephemeral: true,
      });
      return;
    }

    // Get this interaction message reference id to fetch the original message.
    const messageId: string = interaction.message.reference.messageId;
    // Get the original message from message Id.
    const message: Message | null = await getMessageByID(
      interaction,
      messageId
    );

    // If the message is null or message.interaction is null
    // i.e message is deleted by admin or message interaction not found.
    if (message === null || message.interaction == null) {
      // Notify the interaction user that the message is deleted.
      await interaction.reply({
        content: "Original Message not Found",
        ephemeral: true,
      });
      return;
    }

    if (interaction.customId === AppSettings.BUTTON_ACCEPT_REQUEST_ID) {
      // If the button id is BUTTON_ACCEPT_REQUEST_ID

      // In case the interaction user is not the one who created the Team.
      if (interaction.user !== message.interaction.user) {
        await interaction.reply({
          ephemeral: true,
          content: `You Cannot Perform this action`,
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
          await interaction.reply({
            content: "Cannot find original message content",
            ephemeral: true,
          });
          return;
        }

        // Defer interaction reply.
        // This is to prevent the interaction being failed.
        await interaction.deferReply();

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
        await interaction.editReply({
          content:
            `${interaction.message.mentions.users.last()}, Your request is accepted` +
            `\nMake sure you have ${interaction.message.mentions.users.first()} as your in-game friend`,
        });
        // Delete the interaction.
        deleteInteractionButton(
          interaction,
          AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT
        );
      }
    } else if (interaction.customId === AppSettings.BUTTON_REJECT_REQUEST_ID) {
      // Defer interaction reply.
      await interaction.deferReply();
      // If the Reject Team invite is clicked.

      // It should be done by either original author or the one requested.
      if (interaction.message.mentions.users.has(interaction.user.id)) {
        // It would only notify the user who rejected it.
        /*
          Don't know if it would be good to notify the user requested to know
          if their request is rejected.
        */
        await interaction.editReply({
          content: "Request Cancelled",
        });
        // Delete the interaction message.
        await deleteMessage(interaction.message);
      } else {
        // If any other user tries to reject the request.
        // Notify the interaction user that they cannot perform this action.
        await interaction.editReply({
          content: "You cannot perform this action",
        });
      }
    }
  } else if (interaction.customId === AppSettings.BUTTON_LEAVE_TEAM_ID) {
    // If the Leave Team button is clicked.
    // Defer interaction reply.

    await interaction.deferReply({
      ephemeral: true,
    });

    // interaction.message.interaction is null.
    if (interaction.message.interaction === null) {
      // Log the error and send ephemeral message to the interaction user.
      console.error("Interaction is null: " + interaction.message);
      await interaction.editReply({
        content: "Interaction null",
      });
      return;
    }

    // Interaction of the interaction message is undefined.
    // Interaction of interaction message here refers to the
    // message created at the first place by the user who created the Team.
    /*
      This can be null if the message is deleted either by the one who created the Team
      or Admin user.
    */
    if (interaction.message.interaction.id === undefined) {
      // Log the error and interaction.message.references.
      console.error(
        "Interaction Reference MessageId undefined: " +
          interaction.message.reference
      );
      // Send ephemeral message to the interaction user.
      await interaction.editReply({
        content: "Original Message reference not Found",
      });
      return;
    }

    // Check if the interaction channel is defined.
    if (interaction.channel === null) {
      // Log the error and send ephemeral message to the interaction user.
      console.error("Interaction Channel is null: " + interaction);
      await interaction.editReply({
        content: "Original Channel not Found",
      });
      return;
    }

    // Get messageID of the message created at the first place by the user who created the Team.
    let messageId: string = interaction.message.id;

    // Fetch the original message by message ID.

    let message: Message | null = await getMessageByID(interaction, messageId);

    // If the message is null.
    // It is possible deleted.
    if (message === null || message.interaction == null) {
      // Send ephemeral message to the interaction user.
      // Notify the user that the message is deleted.
      await interaction.editReply({
        content: "Original Message Not Found",
      });
      return;
    }

    // Edit the interection
    // and delete the reply

    // Get the original message embed fields.
    // These fields are the fields of the message
    // sent by the user who created the Team.
    const original_message: Embed = message.embeds[0];
    const title = original_message.data.title;
    const author = original_message.data.author?.name || "";
    const fields = original_message.data.fields;
    const timestamp = original_message.timestamp;

    // If any the field is not defined.
    if (!title || !fields || !timestamp) {
      // Log the error and send ephemeral message to the interaction user.
      console.error("Cannot find original interaction embed fields");
      await interaction.editReply({
        content: "Original Message Fields not Found",
      });
      return;
    }

    // If the field of the original message is not defined.
    if (fields === undefined) {
      await interaction.editReply({
        content: "Original Message field not Defined",
      });
      return;
    }

    // Create new fields array.
    let new_fields: APIEmbedField[] = [];
    // The player already joined in the Team.
    let team_players: string[] = [];

    // Loop through the fields of the original message.
    for (let i = 0; i < fields.length; i += 1) {
      // TODO - Change this to a constant.
      if (fields[i].name === "Number of Space in Wing/Team Available") {
        // push the field to the new fields array.
        // with increment value of the spots by one.
        new_fields.push({
          name: "Number of Space in Wing/Team Available",
          value: (parseInt(fields[i].value) + 1).toString(),
        });
      } else if (fields[i].name === "Players Joined") {
        // If the field name is 'Players Joined' field from embed message sent.
        // Adding the users to users to the mentionedUser collection.
        team_players = fields[i].value.split("\n");
        new_fields.push(fields[i]);
      } else {
        // push the field to the new fields array.
        new_fields.push(fields[i]);
      }
    }

    // Check if the interaction user is the the one who created the Team.
    // The first user in team_players should be the one who created the Team.
    if (team_players.indexOf(interaction.user.toString()) === 0) {
      // If the interaction user is the one who created the Team.
      // Send ephemeral message to the interaction user.
      // Notify the user that they cannot leave the Team.
      // They have to delete it.
      await interaction.editReply({
        content:
          "You're the one created it, To leave please use `Delete` button",
      });
      return;
    }

    // Check if the interaction user is in the team_players.
    if (!team_players.includes(interaction.user.toString())) {
      // If the interaction user is not in the team_players.
      // Send ephemeral message to the interaction user.
      // Notify the user that they are not in the Team.
      await interaction.editReply({
        content: "You're not in the Team",
      });
      return;
    }

    // Remove the interaction user from the team_players.
    team_players = removeEntry(team_players, interaction.user.toString());

    // Loop through the team_players.
    // Replace the previous "Players" joined value to to the new one.
    // Join the team_players with new line.
    for (let i = 0; i < new_fields.length; i += 1) {
      if (fields[i].name === "Players Joined") {
        fields[i].value = team_players.join("\n") || "";
      }
    }

    // get original message embed footer, if any.
    // For now it contains the message delete time.
    const footer = original_message.data.footer?.text || "";

    let new_embeded_message = new EmbedBuilder();
    new_embeded_message.setTitle(title || "");
    new_embeded_message.setAuthor({ name: author });
    new_embeded_message.addFields(new_fields || [{ name: "", value: "" }]);
    new_embeded_message.setFooter({ text: footer });
    new_embeded_message.setTimestamp(Date.parse(timestamp));

    // Edit the original message with the new embeded message.
    await message.edit({
      embeds: [new_embeded_message],
    });

    // Notify the user that they have left the Team.
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
    Message if the message is found.
    null if the message is not found.
*/
async function getMessageByID(
  interaction: ButtonInteraction,
  messageId: string
): Promise<Message | null> {
  // Get the channel of the interaction.
  // If the channel is null.
  if (interaction.channel === null) {
    // Log the error and interaction.
    // Notify the user that the channel is not found.
    // return null.
    console.error("Interaction Channel is null: " + interaction);
    await interaction.reply({
      content: "Original Channel not Found",
      ephemeral: true,
    });
    return null;
  }

  // Get the message by message ID.
  // If the message is null.
  const message = await interaction.channel.messages
    .fetch(messageId)
    .catch((error) => {
      console.log("Cannot find message: " + error);
      return null;
    });
  return message;
}

export default interactionButtonHandler;

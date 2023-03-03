import {
  APIEmbedField,
  ButtonInteraction,
  Embed,
  EmbedBuilder,
  Message,
} from "discord.js";
import { removeEntry } from "../../../utils/helpers";
import getMessageByID from "./manageMessages";

/**
 * If the user is the Team Leader, it won't work, they have to use deleteTeam
 * If the user is not the Team Leader, it will remove the user from the Team
 * and update the Team invite message.
 */

async function leaveTeam(interaction: ButtonInteraction) {
  // If the Leave Team button is clicked.
  // Defer interaction reply.

  await interaction
    .deferReply({
      ephemeral: true,
    })
    .catch((error) => {
      console.error(error);
    });

  // interaction.message.interaction is null.
  if (interaction.message.interaction === null) {
    // Log the error and send ephemeral message to the interaction user.
    console.error("Interaction is null: " + interaction.message);
    await interaction
      .editReply({
        content: "Interaction null",
      })
      .catch((error) => {
        console.error("When interaction is null: " + error);
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
    await interaction
      .editReply({
        content: "Original Message reference not Found",
      })
      .catch((error) => {
        console.error("When interaction reference is undefined: " + error);
      });
    return;
  }

  // Check if the interaction channel is defined.
  if (interaction.channel === null) {
    // Log the error and send ephemeral message to the interaction user.
    console.error("Interaction Channel is null: " + interaction);
    await interaction
      .editReply({
        content: "Original Channel not Found",
      })
      .catch((error) => {
        console.error("When interaction channel is null: " + error);
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
    await interaction
      .editReply({
        content: "Original Message Not Found",
      })
      .catch((error) => {
        console.error("When message is null: " + error);
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
    await interaction
      .editReply({
        content: "Original Message Fields not Found",
      })
      .catch((error) => {
        console.error("When original message fields are undefined: " + error);
      });
    return;
  }

  // If the field of the original message is not defined.
  if (fields === undefined) {
    await interaction
      .editReply({
        content: "Original Message field not Defined",
      })
      .catch((error) => {
        console.error("When original message fields are undefined: " + error);
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
    await interaction
      .editReply({
        content:
          "You're the one created it, To leave please use `Delete` button",
      })
      .catch((error) => {
        console.error(
          "When interaction user is the one who created the Team: " + error
        );
      });
    return;
  }

  // Check if the interaction user is in the team_players.
  if (!team_players.includes(interaction.user.toString())) {
    // If the interaction user is not in the team_players.
    // Send ephemeral message to the interaction user.
    // Notify the user that they are not in the Team.
    await interaction
      .editReply({
        content: "You're not in the Team",
      })
      .catch((error) => {
        console.error(
          "When interaction user is not in the team_players: " + error
        );
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
  await message
    .edit({
      embeds: [new_embeded_message],
    })
    .catch((error) => {
      console.error("When editing the original message: " + error);
    });

  // Notify the user that they have left the Team.
  await interaction
    .editReply({
      content: `You left the Team`,
    })
    .catch((error) => {
      console.error("When editing the interaction reply: " + error);
    });
}

export default leaveTeam;

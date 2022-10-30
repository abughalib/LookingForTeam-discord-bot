import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
} from "discord.js";
import { AppSettings } from "../../../utils/settings";
import deleteInteraction from "../deleteInteractions";

async function joinButton(interaction: ButtonInteraction) {
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
  deleteInteraction(interaction, AppSettings.DEFAULT_REQUEST_TEAM_TIMEOUT);
}

export default joinButton;

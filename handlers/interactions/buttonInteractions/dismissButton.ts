import { ButtonInteraction, MessageFlags } from "discord.js";
import deleteMessage from "../utils/deleteMessage";

/**
 * To Delete the message by the user who created the message.
 */

async function dismissButton(interaction: ButtonInteraction) {
  // If the user who created or the user who request the Team declines the invite.

  // If Interaction message is null or delete by admin.
  if (interaction.message.interactionMetadata === null) {
    await interaction
      .reply({
        content: "Cannot perform this action",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("Message deletion when interaction is null: " + error);
      });
    return;
  }

  // If the one who requested the Team declines invite.
  // This should delete the message;
  // Should send ephemeral message to the user who requested the Team notifying message is deleted.
  if (interaction.message.interactionMetadata?.user === interaction.user) {
    // Delete the request message.
    await deleteMessage(interaction.message);
    // Send ephemeral message to the user who requested the Team.
    await interaction
      .reply({
        content: "Your message is deleted",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("When author deleting message: ", error);
      });
    return;
  } else {
    // If the anyone except the user who requested the Team
    // or the one created the Team declines the invite.
    await interaction
      .reply({
        content: "Cannot perform this action",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("When non author deleting message: ", error);
      });
  }
}

export default dismissButton;

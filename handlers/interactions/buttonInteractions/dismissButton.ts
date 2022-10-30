import { ButtonInteraction } from "discord.js";
import deleteMessage from "../deleteMessage";

async function dismissButton(interaction: ButtonInteraction) {
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
}

export default dismissButton;

import { ButtonInteraction } from "discord.js";

/** Delete accept message
 * Only the using which are mentioned in the message should be able to delete the message.
 * @param interaction Button Interaction
 */
function deleteAcceptMessage(interaction: ButtonInteraction) {
  const message = interaction.message;
  if (message) {
    const mentionedUsers = message.mentions.users;
    const user = interaction.user;
    if (mentionedUsers.has(user.id)) {
      message.delete();
      interaction.reply({
        ephemeral: true,
        content: "Message deleted",
      });
    } else {
      interaction.reply({
        ephemeral: true,
        content: "You are not allowed to delete this message",
      });
    }
  } else {
    interaction.reply({
      ephemeral: true,
      content: "Message not found",
    });
    console.error("Message is null: " + message);
  }
}

export default deleteAcceptMessage;

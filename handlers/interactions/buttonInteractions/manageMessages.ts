import { ButtonInteraction, Message } from "discord.js";

/*
  This function is used to get the message by message Id from the interaction channel.
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

export default getMessageByID;

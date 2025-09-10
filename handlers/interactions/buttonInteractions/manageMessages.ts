import { ButtonInteraction, Message, MessageFlags } from "discord.js";

/**
 * Get the message by message Id from the interaction channel.
 * @param interaction Button Interaction
 * @param messageId Message Id to fetch the message.
 */
async function getMessageByID(
  interaction: ButtonInteraction,
  messageId: string,
): Promise<Message | null> {
  // Get the channel of the interaction.
  // If the channel is null.
  if (interaction.channel === null) {
    // Log the error and interaction.
    // Notify the user that the channel is not found.
    // return null.
    console.error("Interaction Channel is null: " + interaction);
    await interaction
      .reply({
        content: "Original Channel not Found",
        flags: MessageFlags.Ephemeral,
      })
      .catch((error) => {
        console.error("When interaction channel is null: " + error);
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

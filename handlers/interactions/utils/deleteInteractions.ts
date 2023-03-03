import { ButtonInteraction, CacheType, CommandInteraction } from "discord.js";
import deleteMessage from "./deleteMessage";

/**
 *  Deletes the interaction reply after the timeout.
 *  If the interaction deletion fails, it will try to delete the message.
 *  If the deletion of the message fails, it will log the error.
 *  @param interaction Button Interaction
 *  @param timeout Time in milliseconds to delete the interaction.
 */

async function deleteInteraction(
  interaction: ButtonInteraction<CacheType> | CommandInteraction<CacheType>,
  timeout: number
) {
  const message = await interaction.fetchReply();
  setTimeout(async () => {
    await interaction.deleteReply().catch((error) => {
      // Message Already Deleted
      if (error.code === 10008) {
        console.info("Message Already Deleted");
      } else if (error.code === 50027) {
        // Discord API Error, Invalid Webhook Token
        deleteMessage(message);
      } else {
        // Message Deletion failed and its unknown Error.
        console.error(`Failed to to delete the message: ${error}`);
      }
    });
  }, timeout);
}

export default deleteInteraction;

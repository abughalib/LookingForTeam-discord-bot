import { ButtonInteraction, CacheType, CommandInteraction } from "discord.js";
import deleteMessage from "./deleteMessage";

/*
  Args:
    interaction: ButtonInteraction | CommandInteraction
    timeout: number
  Returns:
    void
  Description:
    Deletes the interaction reply after the timeout.
    if the interaction deletion fails, it will try to delete the message.
    if the deletion of the message fails, it will log the error.
    
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

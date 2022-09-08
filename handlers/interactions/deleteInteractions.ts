import { ButtonInteraction, CacheType } from "discord.js";
import deleteMessage from "./deleteMessage";

async function deleteInteractionButton(
  interaction: ButtonInteraction<CacheType>,
  timeout: number
) {
  let message = await interaction.fetchReply();
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

export default deleteInteractionButton;

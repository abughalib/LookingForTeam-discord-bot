import { CommandInteraction, MessageFlags } from "discord.js";
import { AppSettings } from "../../../utils/settings";

/**
 * Classic Bot Ping Reply.
 */

async function pingReply(interaction: CommandInteraction) {
  // Reply with a message
  await interaction
    .reply({
      content: AppSettings.BOT_PING_REPLY,
      flags: MessageFlags.Ephemeral,
    })
    .catch((err) => {
      console.error(`Error in Ping: ${err}`);
    });
}

export default pingReply;

import { CommandInteraction } from "discord.js";
import { AppSettings } from "../../../utils/settings";

async function pingReply(interaction: CommandInteraction) {
  // Reply with a message
  await interaction
    .reply({
      content: AppSettings.BOT_PING_REPLY,
      ephemeral: true,
    })
    .catch((err) => {
      console.error(`Error in Ping: ${err}`);
    });
}

export default pingReply;

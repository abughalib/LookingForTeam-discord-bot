import { CommandInteraction } from "discord.js";

/**
 *  Default Bot Reply
 *  If the command is not found, this function will be called.
 */

async function defaultReply(interaction: CommandInteraction) {
  // Reply with default message
  await interaction
    .reply({
      content: "Command Not Found",
      ephemeral: true,
    })
    .catch((err) => {
      console.error(`Error in default reply: ${err}`);
    });
}

export default defaultReply;

import { CommandInteraction } from "discord.js";
import { AppSettings } from "../../../utils/settings";
import embedMessage from "../../embeded_message";

async function helpReply(interaction: CommandInteraction) {
  // Title for the embed message
  const title: string = AppSettings.BOT_HELP_REPLY_TITLE;

  // List of the fields for the embed message
  const listFieldheading = [
    ...AppSettings.BOT_HELP_FIELD_TITLE,
    ...AppSettings.BOT_WING_FIELDS,
    ...AppSettings.BOT_HELP_EXTRA_FIELDS,
  ];

  // List of the values for the embed message
  const listFieldValue = AppSettings.BOT_HELP_COMMAND_REPLY_FIELD_VALUES;

  // Create the embed message
  const embeded_message = embedMessage(
    title,
    listFieldheading,
    listFieldValue,
    interaction.user.username
  );

  // set Message footer
  embeded_message.setFooter({
    text: AppSettings.BOT_HELP_REPLY_FOOTER_NOTE,
  });

  // Defer message reply
  await interaction
    .deferReply({
      ephemeral: true,
    })
    .catch((err) => {
      console.error(`Error in Help: ${err}`);
    });

  // Edit Reply of interaction with embed message
  await interaction
    .editReply({
      embeds: [embeded_message],
    })
    .catch((err) => {
      console.error(`Error in Help: ${err}`);
    });
}

export default helpReply;

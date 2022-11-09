import {
  ActionRowBuilder,
  ButtonBuilder,
  Embed,
  EmbedBuilder,
  SelectMenuInteraction,
} from "discord.js";
import { AppSettings } from "../../utils/settings";

/*
  Handles all the menu interactions.
  Args:
    interaction: SelectMenuInteraction,
    button: ButtonBuilder,
  Returns:
    void
  Description:
    Creates a new button and adds it to the interaction.
    Creates a new embed and adds it to the interaction.

*/
async function interactionMenuHandler(
  interaction: SelectMenuInteraction,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  // If interaction's message interaction is null, return.
  if (interaction.message.interaction === null) {
    await interaction
      .reply({
        ephemeral: true,
        content: "Something went wrong, please try again.",
      })
      .catch((error) => {
        console.error(error);
      });
    return;
  }

  // If current user is not the one created the message, return.
  // Reply the user with a ephemeral message that cannot perform this action.
  if (interaction.user !== interaction.message.interaction.user) {
    await interaction
      .reply({
        content: "You cannot perform this action",
        ephemeral: true,
      })
      .catch(console.error);
    return;
  }

  // Get the original message
  const original_message: Embed = interaction.message.embeds[0];
  const title = original_message.data.title;
  const author = original_message.data.author?.name || "";
  const fields = original_message.data.fields;
  const footer = original_message.data.footer?.text || "";
  const timestamp = original_message.data.timestamp;

  // If any of the above is null, return.
  if (!title || !author || !fields || !footer || !timestamp) {
    await interaction
      .reply({
        ephemeral: true,
        content: "Original message is missing data, please try again.",
      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });
    console.error("Cannot find original interaction message");
    return;
  }

  // Create a new embed with the original message data.
  let new_embeded_message = new EmbedBuilder();
  new_embeded_message.setTitle(title);
  new_embeded_message.setAuthor({ name: author });
  new_embeded_message.addFields(fields);
  new_embeded_message.setFooter({ text: footer });
  new_embeded_message.setTimestamp(Date.parse(timestamp) || Date.now());

  // Create interaction menu for game version.
  if (interaction.customId === AppSettings.SELECT_GAME_VERSION_ID) {
    await interaction.deferUpdate();

    // Create a new embed with the original message data.
    AppSettings.AVAILABLE_GAME_VERSIONS.forEach(async (version) => {
      // Game version is selected.
      if (version.value === interaction.values[0]) {
        new_embeded_message.addFields({
          name: AppSettings.GAME_NAME + " Version",
          value: version.description,
        });
        // Reply empty message with the new embeded message.
        // This will update the original message.
        // Add the buttons to the message.
        await interaction
          .editReply({
            components: [buttons],
            embeds: [new_embeded_message],
          })
          .catch(console.error);
      }
    });
  }
}

export default interactionMenuHandler;

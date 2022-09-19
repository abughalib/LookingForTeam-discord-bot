import {
  ActionRowBuilder,
  ButtonBuilder,
  Embed,
  EmbedBuilder,
  SelectMenuInteraction,
} from "discord.js";
import { AppSettings } from "../../utils/settings";

async function interactionMenuHandler(
  interaction: SelectMenuInteraction,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  if (interaction.message.interaction === null) {
    return;
  }
  if (interaction.user !== interaction.message.interaction.user) {
    interaction
      .reply({
        content: "You cannot perform this action",
        ephemeral: true,
      })
      .catch(console.error);
    return;
  }

  let original_message: Embed = interaction.message.embeds[0];
  let title = original_message.data.title;
  let author = original_message.data.author?.name || "";
  let fields = original_message.data.fields;
  let footer = original_message.data.footer?.text || "";
  let timestamp = original_message.data.timestamp;

  if (!title || !author || !fields || !footer || !timestamp) {
    console.error("Cannot find original interaction message");
    return;
  }

  let new_embeded_message = new EmbedBuilder();
  new_embeded_message.setTitle(title);
  new_embeded_message.setAuthor({ name: author });
  new_embeded_message.addFields(fields);
  new_embeded_message.setFooter({ text: footer });
  new_embeded_message.setTimestamp(Date.parse(timestamp) || Date.now());

  if (interaction.customId === "select_game_version") {
    await interaction.deferUpdate();

    AppSettings.AVAILABLE_GAME_VERSIONS.forEach(async (version) => {
      if (version.value === interaction.values[0]) {
        new_embeded_message.addFields({
          name: AppSettings.GAME_NAME + " Version",
          value: version.description,
        });
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

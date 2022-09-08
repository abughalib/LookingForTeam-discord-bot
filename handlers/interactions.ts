import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  SelectMenuBuilder,
} from "discord.js";
import { AppSettings } from "../utils/settings";
import interactionMenuHandler from "./interactions/MenuInteractions";
import interactionButtonHandler from "./interactions/ButtonInteractions";
import interactionCommandHandler from "./interactions/commandInteraction";

async function handleInteractions(interaction: Interaction) {
  const menus = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder()
      .setCustomId("select_game_version")
      .setPlaceholder("Game Version")
      .addOptions(AppSettings.AVAILABLE_GAME_VERSIONS)
  );

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("command_join")
      .setLabel("Request Team Invite")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("command_dismiss")
      .setLabel("Delete")
      .setStyle(ButtonStyle.Danger)
  );

  if (interaction.isCommand()) {
    interactionCommandHandler(interaction, menus, buttons);
  } else if (interaction.isButton()) {
    interactionButtonHandler(interaction);
  } else if (interaction.isSelectMenu()) {
    interactionMenuHandler(interaction, buttons);
  } else {
    // To be Implemented in Future if needed
    return;
  }
}

export default handleInteractions;

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  SelectMenuBuilder,
} from "discord.js";
import { AppSettings } from "../utils/settings";
import interactionMenuHandler from "./interactions/menuInteractions";
import interactionButtonHandler from "./interactions/buttonInteractions";
import interactionCommandHandler from "./interactions/commandInteraction";

async function handleInteractions(interaction: Interaction) {
  const menus = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder()
      .setCustomId(AppSettings.SELECT_GAME_VERSION_ID)
      .setPlaceholder(AppSettings.SELECT_GAME_VERSION_PLACEHOLDER)
      .addOptions(AppSettings.AVAILABLE_GAME_VERSIONS)
  );

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(AppSettings.BUTTON_JOIN_ID)
      .setLabel(AppSettings.BUTTON_JOIN_LABEL)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(AppSettings.BUTTON_DISMISS_ID)
      .setLabel(AppSettings.BUTTON_DISMISS_LABEL)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(AppSettings.BUTTON_LEAVE_TEAM_ID)
      .setLabel(AppSettings.BUTTON_LEAVE_TEAM_LABEL)
      .setStyle(ButtonStyle.Secondary)
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

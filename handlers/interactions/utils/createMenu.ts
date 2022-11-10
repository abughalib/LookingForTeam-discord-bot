import { ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { AppSettings } from "../../../utils/settings";

// Create Select Menu for the Game version
export const menus = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
  new SelectMenuBuilder()
    .setCustomId(AppSettings.SELECT_GAME_VERSION_ID)
    .setPlaceholder(AppSettings.SELECT_GAME_VERSION_PLACEHOLDER)
    .addOptions(AppSettings.AVAILABLE_GAME_VERSIONS)
);

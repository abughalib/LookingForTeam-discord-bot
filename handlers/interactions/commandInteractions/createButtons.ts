import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AppSettings } from "../../../utils/settings";

class CreateButtons {
  /*
  Args:
    None
  Returns:
    Buttons
  */
  // To be removed in the future.
  createDismissButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(AppSettings.BUTTON_DISMISS_ID)
        .setLabel(AppSettings.BUTTON_DISMISS_LABEL)
        .setStyle(ButtonStyle.Danger)
    );
  }
}

export default CreateButtons;

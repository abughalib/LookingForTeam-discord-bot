import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AppSettings } from "../../../utils/settings";

/*
  A class to create buttons, which can use used everywhere.
*/

class CreateButtons {
  /*
    Create a button to dissmiss the message.
  */
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

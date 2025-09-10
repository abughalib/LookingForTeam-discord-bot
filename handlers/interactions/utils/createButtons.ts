import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AppSettings } from "../../../utils/settings";

/*
  A class to create buttons, which can use used everywhere.
*/

class CreateButtons {
  /*
    Create a button to dissmiss the message.
  */
  createDismissButton(
    customId: string = AppSettings.BUTTON_DISMISS_ID,
    customLabel: string = AppSettings.BUTTON_DISMISS_LABEL,
  ): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(customLabel)
        .setStyle(ButtonStyle.Danger),
    );
  }

  createInteractionButtons() {
    // Create Buttons for the interaction message
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
        .setStyle(ButtonStyle.Secondary),
    );
  }
}

export default CreateButtons;

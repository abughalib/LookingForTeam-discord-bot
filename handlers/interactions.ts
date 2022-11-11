import { Interaction } from "discord.js";
import interactionMenuHandler from "./interactions/menuInteractions";
import interactionButtonHandler from "./interactions/buttonInteractions";
import interactionCommandHandler from "./interactions/commandInteraction";
import { menus } from "./interactions/utils/createMenu";
import CreateButtons from "./interactions/utils/createButtons";

/*
  Handles all the interactions.
  Args:
    interaction: The interaction object
  Returns:
    void
  Description:
    This function handles all interactions
*/
async function handleInteractions(interaction: Interaction) {
  const buttons: CreateButtons = new CreateButtons();

  const interactionButtons = buttons.createInteractionButtons();

  // Handle the different interaction types
  if (interaction.isCommand()) {
    interactionCommandHandler(interaction, menus, interactionButtons);
  } else if (interaction.isButton()) {
    interactionButtonHandler(interaction);
  } else if (interaction.isSelectMenu()) {
    interactionMenuHandler(interaction, interactionButtons);
  } else {
    // To be Implemented in Future if needed
    return;
  }
}

export default handleInteractions;

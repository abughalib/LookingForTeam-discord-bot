import { Interaction } from "discord.js";
import interactionButtonHandler from "./interactions/buttonInteractions";
import interactionCommandHandler from "./interactions/commandInteraction";
import CreateButtons from "./interactions/utils/createButtons";

/**
 * Handles all the interactions.
 * @param interaction
 */
async function handleInteractions(interaction: Interaction) {
  const buttons: CreateButtons = new CreateButtons();

  const interactionButtons = buttons.createInteractionButtons();

  // Handle the different interaction types
  if (interaction.isCommand()) {
    interactionCommandHandler(interaction, interactionButtons);
  } else if (interaction.isButton()) {
    interactionButtonHandler(interaction);
  } else {
    // To be Implemented in Future if needed
    return;
  }
}

export default handleInteractions;

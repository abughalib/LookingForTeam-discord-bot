import { ButtonInteraction, MessageFlags } from "discord.js";
import { AppSettings } from "../../utils/settings";
import acceptOrReject from "./buttonInteractions/acceptReject";
import dismissButton from "./buttonInteractions/dismissButton";
import joinButton from "./buttonInteractions/joinTeam";
import leaveTeam from "./buttonInteractions/leaveTeam";
import deleteAcceptMessage from "./buttonInteractions/dismiss_accept_msg";
import nextColonizationList from "./buttonInteractions/nextColonizationList";
import selectColonizationProject from "./buttonInteractions/selectColonizationProject";

/**
 * Handles all button interactions.*
 * @param interaction Button Interaction
 */
async function interactionButtonHandler(interaction: ButtonInteraction) {
  // Check button custom id

  switch (interaction.customId) {
    case AppSettings.BUTTON_JOIN_ID:
      joinButton(interaction);
      break;
    case AppSettings.BUTTON_ACCEPT_REQUEST_ID:
      acceptOrReject(interaction);
      break;
    case AppSettings.BUTTON_REJECT_REQUEST_ID:
      acceptOrReject(interaction);
      break;
    case AppSettings.BUTTON_LEAVE_TEAM_ID:
      leaveTeam(interaction);
      break;
    case AppSettings.BUTTON_DISMISS_ID:
      dismissButton(interaction);
      break;
    case AppSettings.BUTTON_DELETE_ACCEPT_MESSAGE:
      deleteAcceptMessage(interaction);
      break;
    case AppSettings.BUTTON_NEXT_COLONIZATION_LIST_ID:
      nextColonizationList(interaction);
      break;
    default:
      // Handle colonization project selection buttons (colonization_list_select_1, colonization_list_select_2, etc.)
      if (interaction.customId.startsWith("colonization_list_select_")) {
        selectColonizationProject(interaction);
        break;
      }

      // Handle next colonization list pagination buttons (next_colonization_list_2_{"filters"}, etc.)
      if (
        interaction.customId.startsWith(
          AppSettings.BUTTON_NEXT_COLONIZATION_LIST_ID + "_",
        )
      ) {
        nextColonizationList(interaction);
        break;
      }

      // Handle previous colonization list pagination buttons (prev_colonization_list_1_{"filters"}, etc.)
      if (interaction.customId.startsWith("prev_colonization_list_")) {
        nextColonizationList(interaction); // Same handler can handle both next and previous
        break;
      }

      // If More features are required
      // Would be Implemented later...
      if (interaction.replied || interaction.deferred) {
        await interaction
          .editReply({
            content: "This feature is not implemented yet",
          })
          .catch((err) => {
            console.error("When button interaction is not implemented: " + err);
          });
      } else {
        await interaction
          .reply({
            content: "This feature is not implemented yet",
            flags: MessageFlags.Ephemeral,
          })
          .catch((err) => {
            console.error("When button interaction is not implemented: " + err);
          });
      }
      break;
  }
}

export default interactionButtonHandler;

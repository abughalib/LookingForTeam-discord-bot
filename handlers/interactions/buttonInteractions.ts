import { ButtonInteraction } from "discord.js";
import { AppSettings } from "../../utils/settings";
import acceptOrReject from "./buttonInteractions/acceptReject";
import dismissButton from "./buttonInteractions/dismissButton";
import joinButton from "./buttonInteractions/joinTeam";
import leaveTeam from "./buttonInteractions/leaveTeam";
import deleteAcceptMessage from "./buttonInteractions/dismiss_accept_msg";

/*
  Handles all button interactions.
  Args:
    ButtonInteraction
  Returns:
    void
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
    default:
      // If More features are required
      // Would be Implemented later...
      await interaction
        .reply({
          content: "This feature is not implemented yet",
        })
        .catch((err) => {
          console.error("When button interaction is not implemented: " + err);
        });
      break;
  }
}

export default interactionButtonHandler;

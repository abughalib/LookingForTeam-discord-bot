import { CommandInteraction, EmbedBuilder } from "discord.js";
import EDSM from "../../../utils/edsm";
import { AppSettings } from "../../../utils/settings";
import { SystemFactionInfo } from "../../../utils/systemInfoModel";
import systemEmbedMessage from "../../systemInfoEmbed";
import deleteInteraction from "../utils/deleteInteractions";
import CreateButtons from "../utils/createButtons";

/**
 * Shows influence of all the factions in the system
 */

async function systemFactionInfo(interaction: CommandInteraction) {
  // CommandName and options
  const { options } = interaction;

  /*
    System faction info command [BOT_SYSTEM_FACTION_INFO_COMMAND_NAME]
  */

  // Get the system name from the command
  const systemName: string =
    options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
    AppSettings.DEFAULT_SYSTEM_NAME;

  // Defer message reply
  // as API call may take more than 3 seconds
  await interaction.deferReply().catch((err) => {
    console.error(`Error in System Faction deferReply: ${err}`);
  });

  // Initialization of create Button class
  const createButton = new CreateButtons();

  // Initialize the EDSM
  const edsm = new EDSM();

  // Get the system info from EDSM API
  let systemFactionInfo: SystemFactionInfo | null =
    await edsm.getSystemFactionInfo(systemName);

  // Create a dismiss button for the replies
  let dismissButton = createButton.createDismissButton();

  // If API call returns null
  // That means the system is not found
  if (!systemFactionInfo || !systemFactionInfo.id) {
    await interaction
      .editReply({
        content: "No System found with Name: " + systemName,
        components: [dismissButton],
      })
      .catch((err) => {
        console.error(`Error in editReply: ${err}`);
      });
    deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
  } else if (
    !systemFactionInfo.controllingFaction ||
    systemFactionInfo.factions.length === 0
  ) {
    /*
        If the system is found but there is no controlling faction
        Send a message saying that Inhabitated system.
        Create a embed message
        With System URL
      */
    await interaction
      .editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Inhabitated System: ${systemFactionInfo.name}`)
            .setURL(systemFactionInfo.url),
        ],
        components: [dismissButton],
      })
      .catch((err) => {
        console.error(`Error in editReply: ${err}`);
      });
    deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
  } else {
    // Create embed message for the system faction info
    // Reply embed message
    // With dismiss button
    let embeded_message = systemEmbedMessage(systemFactionInfo);
    await interaction
      .editReply({
        embeds: [embeded_message],
        components: [dismissButton],
      })
      .catch((err) => {
        console.error(`Error in editReply: ${err}`);
      });
  }

  // Delete the message after [HELP_MESSAGE_DISMISS_TIMEOUT]
  // deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
}

export default systemFactionInfo;

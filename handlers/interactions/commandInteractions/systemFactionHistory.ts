import { CommandInteraction } from "discord.js";
import EDSM from "../../../utils/edsm";
import createInfluenceChart from "../../../utils/influenceChart";
import { AppSettings } from "../../../utils/settings";
import { SystemFactionInfo } from "../../../utils/systemInfoModel";
import systemEmbedMessage from "../../systemInfoEmbed";
import deleteInteraction from "../deleteInteractions";
import CreateButtons from "./createButtons";

async function systemfactionHistory(interaction: CommandInteraction) {
  // CommandName and options
  const { options } = interaction;

  // Get the system name from the command
  const systemName: string =
    options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
    AppSettings.DEFAULT_SYSTEM_NAME;

  // Get days for which the history is required
  const days: number =
    Number(options.get(AppSettings.INTERACTION_DAY_NAME_ID)?.value as number) ||
    10;

  // 100 is kept maximum to avoid timeout
  if (days > 100) {
    // Send the error message
    await interaction
      .reply({
        ephemeral: true,
        content: `Days should not be more than 100`,
      })
      .catch((err) => {
        console.error(`Error in reply: ${err}`);
      });
    return;
  }

  // Defer message reply
  await interaction.deferReply().catch((err) => {
    console.error(`Error in deferReply: ${err}`);
  });

  // Initialization of create Button class
  const createButton = new CreateButtons();

  // Initialize the EDSM
  const edsm = new EDSM();

  // Create dismiss button
  let dismissButton = createButton.createDismissButton();

  // Get the history of the system
  let systemFactioninfo: SystemFactionInfo | null =
    await edsm.getSystemFactionInfo(systemName, 1);

  // If the system is not found
  if (!systemFactioninfo || !systemFactioninfo.factions) {
    await interaction.editReply({
      content: `System ${systemName} not found`,
      components: [dismissButton],
    });
    deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
    return;
  }

  const faction = systemFactioninfo.factions;

  // If there is no faction present in the system
  if (faction.length === 0) {
    await interaction.editReply({
      content: `System Unhabitated ${systemName}`,
      components: [dismissButton],
    });
    deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
    return;
  }

  // Get the faction history chart
  let chartUrl = await createInfluenceChart(faction, days);

  // Create the embed message
  let embeded_message = systemEmbedMessage(systemFactioninfo);
  embeded_message.setTitle(`Faction History for ${systemName}`);
  embeded_message.setURL(chartUrl).setImage(chartUrl);

  // Send embed message
  await interaction
    .editReply({
      embeds: [embeded_message],
      components: [dismissButton],
    })
    .catch((err) => {
      console.error(`Error in editReply: ${err}`);
    });
}

export default systemfactionHistory;

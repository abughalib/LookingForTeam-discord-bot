import { CommandInteraction, EmbedBuilder } from "discord.js";
import BGSInfo from "../../../utils/eliteBgs";
import { TickInfo } from "../../../utils/models";
import { AppSettings } from "../../../utils/settings";
import deleteInteraction from "../deleteInteractions";
import CreateButtons from "./createButtons";

async function eliteServerTickInfo(interaction: CommandInteraction) {
  // Defer interaction reply
  await interaction.deferReply({
    ephemeral: false,
  });

  // Initialize the Elite BGS Info Class
  const eliteBGS = new BGSInfo();

  // Title for the embed message
  const title: string = AppSettings.BOT_ELITE_SERVER_TICK_INFO_TITLE;

  // Get Tick Info from Elite BGS API
  const tickInfo: TickInfo | null = await eliteBGS.getLastTick();

  // If tick info is null
  // That means there is no tick info or the API is down
  if (!tickInfo) {
    // Reply with a message
    await interaction.editReply({
      content: "Cannot find Tick Info!",
    });
    deleteInteraction(interaction, AppSettings.ERROR_MESSAGE_DIMISS_TIMEOUT);
    return;
  }

  let embeded_message = new EmbedBuilder()
    .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
    .setTitle(title)
    .addFields([
      {
        name: "Tick Time",
        value: `<t:${Date.parse(tickInfo.time) / 1000}:F>`,
      },
    ])
    .setTimestamp(Date.parse(tickInfo.updated_at))
    .setFooter({
      text: "Last Updated",
    });

  // Initialization of create Button class
  const createButton = new CreateButtons();

  // Create dismiss button
  let dismissButton = createButton.createDismissButton();

  // Reply embed message
  await interaction
    .editReply({
      embeds: [embeded_message],
      components: [dismissButton],
    })
    .catch((error) => {
      console.error(`Error in Elite Server Tick Info: ${error}`);
    });
  deleteInteraction(interaction, AppSettings.HELP_MESSAGE_DISMISS_TIMEOUT);
}

export default eliteServerTickInfo;

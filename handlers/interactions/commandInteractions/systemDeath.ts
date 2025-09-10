import {
  ChatInputCommandInteraction,
  CommandInteraction,
  GuildMember,
  MessageFlags,
} from "discord.js";
import EDSM from "../../../utils/edsm";
import { AppSettings } from "../../../utils/settings";
import embedMessage from "../../embeded_message";
import CreateButtons from "../utils/createButtons";

/**
 * No of death in a particular system, these included PVP interactions
 * Data is fetched from EDSM.
 * Timeline: Day, Week, Total
 */
async function systemDeath(
  interaction: CommandInteraction,
  userInterected: GuildMember
) {
  let chatInputInteraction = interaction as ChatInputCommandInteraction;

  // CommandName and options
  const options = chatInputInteraction.options;

  // Get system name from the command
  const systemName: string =
    options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
    AppSettings.DEFAULT_STAR_SYSTEM_NAME;

  // Get NickName for that specific server of that user
  const nickName = userInterected?.nickname || interaction.user.username;

  // The title for the embed message
  const title: string = "System Death Info";

  // Defer message reply
  await interaction.deferReply().catch((err) => {
    console.error(`Error in System Death Info: ${err}`);
  });

  // Initialize the EDSM
  const edsm = new EDSM();

  // Get the system Death from EDSM API
  const systemDeath = await edsm.getSystemDeath(systemName);

  // System Death info is not found
  // or System Death death is undefined
  if (systemDeath === null || systemDeath.deaths === undefined) {
    // Reply with a message
    // Saying that there is no death info for that system
    await interaction
      .editReply({
        content: "Cannot find system Death Info!",
      })
      .catch((err) => {
        console.error(`Error in System Death Info: ${err}`);
      });
    return;
  }

  // Breakdown of the death info
  const listFieldheading = ["System Name", ...AppSettings.SYSTEM_TIMELINE];

  // Breakdown of the death info
  // By Time
  const listFieldValues = [
    systemDeath.name,
    systemDeath.deaths.day,
    systemDeath.deaths.week,
    systemDeath.deaths.total,
  ];

  // Initialization of create Button class
  const createButton = new CreateButtons();

  // Create dismiss button
  let dismissButton = createButton.createDismissButton();

  // Create the embed message
  const embeded_message = embedMessage(
    title,
    listFieldheading,
    listFieldValues,
    nickName
  );

  // Reply embed message
  await interaction
    .editReply({
      embeds: [embeded_message],
      components: [dismissButton],
    })
    .catch((err) => {
      console.error(`Error in System Death Info: ${err}`);
    });
}

export default systemDeath;

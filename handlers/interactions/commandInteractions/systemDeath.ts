import { CommandInteraction, GuildMember } from "discord.js";
import EDSM from "../../../utils/edsm";
import { AppSettings } from "../../../utils/settings";
import embedMessage from "../../embeded_message";

/*
  No of death in a particular system, these included PVP interactions
  Data is fetched from EDSM.
  Timeline: Day, Week, Total
 */
async function systemDeath(
  interaction: CommandInteraction,
  userInterected: GuildMember
) {
  // CommandName and options
  const { options } = interaction;

  // Get system name from the command
  const systemName: string =
    options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
    AppSettings.DEFAULT_STAR_SYSTEM_NAME;

  // Get NickName for that specific server of that user
  const nickName = userInterected?.nickname || interaction.user.username;

  // The title for the embed message
  const title: string = "System Death Info";

  // Defer message reply
  await interaction
    .deferReply({
      ephemeral: true,
    })
    .catch((err) => {
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
    })
    .catch((err) => {
      console.error(`Error in System Death Info: ${err}`);
    });
}

export default systemDeath;

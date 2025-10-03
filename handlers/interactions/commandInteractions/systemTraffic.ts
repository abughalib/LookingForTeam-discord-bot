import {
  ChatInputCommandInteraction,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import EDSM from "../../../utils/edsm";
import { getEliteShipAndCount } from "../../../utils/helpers";
import { AppSettings } from "../../../utils/settings";
import embedMessage from "../../embeded_message";
import {
  cacheSystemTraffic,
  getSystemTrafficFromCache,
} from "../../../utils/database";
import { SystemTrafficInfo } from "../../../utils/models";

/**
 * No of ships passed through the system, breakdown by ships.
 * Timeline: Day, Week, Total
 */

async function systemTraffic(
  interaction: CommandInteraction,
  userInterected: GuildMember,
) {
  const chatInputInteraction = interaction as ChatInputCommandInteraction;

  // CommandName and options
  const options = chatInputInteraction.options;

  // Title for the embed message
  const title: string = "System Traffic Info";

  // Get system name from the command
  const systemName: string =
    options.get(AppSettings.INTERACTION_SYSTEM_NAME_ID)?.value?.toString() ||
    "SOL";

  // Get NickName for that specific server
  const nickName = userInterected?.nickname || interaction.user.username;

  // Defer message reply
  // Ephermal true so that only the user can see the message
  await interaction.deferReply().catch((err) => {
    console.error(`Error in System Traffic Info: ${err}`);
  });

  // Get the system Traffic info
  const systemTrafficInfo = await getSystemTrafficInfo(systemName);

  // If API call returns null
  // That means the system is not found
  if (systemTrafficInfo === null) {
    await interaction
      .editReply({
        content: "Cannot find Traffic Info",
      })
      .catch((err) => {
        console.error(
          `Error in System Traffic Info__ Cannot find Traffic Info: ${err}`,
        );
      });
    return;
  }

  // If the breakdown is null or underfined
  // That means there is no traffic info for that system
  if (!systemTrafficInfo.breakdown || !systemTrafficInfo.traffic) {
    await interaction
      .editReply({
        content: "No ship info is in EDSM for this system",
      })
      .catch((err) => {
        console.error(
          `Error in System Traffic Info__ No ship info is in EDSM for this system: ${err}`,
        );
      });
    return;
  }

  // Breakdown of the traffic info
  // Ship name and count
  const shipsAndCount = getEliteShipAndCount(systemTrafficInfo);

  // Embed message heading
  const listFieldheading: string[] = [
    "System Name",
    ...AppSettings.SYSTEM_TIMELINE,
    ...shipsAndCount.shipNames,
  ];

  // Embed message Values
  const listFieldValue: string[] = [
    systemTrafficInfo.name,
    systemTrafficInfo.traffic.day.toString(),
    systemTrafficInfo.traffic.week.toString(),
    systemTrafficInfo.traffic.total.toString(),
    ...shipsAndCount.shipCount,
  ];

  // Create the embed message
  const embeded_message = embedMessage(
    title,
    listFieldheading,
    listFieldValue,
    nickName,
  );

  // Reply embed message
  interaction
    .editReply({
      embeds: [embeded_message],
    })
    .catch((error) => {
      console.error(`Error in System Traffic Info: ${error}`);
    });
}

async function getSystemTrafficInfo(
  systemName: string,
): Promise<SystemTrafficInfo | null> {
  const edsm = new EDSM();

  const systemTrafficInfoCache = await getSystemTrafficFromCache(systemName);

  if (!systemTrafficInfoCache) {
    // Fetch from EDSM API
    const systemTrafficInfo = await edsm.getSystemTrafficInfo(systemName);

    if (!systemTrafficInfo) {
      console.error("EDSM not responding: ", systemTrafficInfo);
      return null;
    }

    // Cache the system info
    await cacheSystemTraffic(systemName, systemTrafficInfo);

    return systemTrafficInfo;
  }

  if (systemTrafficInfoCache) {
    return JSON.parse(systemTrafficInfoCache.data) as SystemTrafficInfo;
  }

  return null;
}

export default systemTraffic;

import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import { AppSettings } from "../utils/settings";
import { SystemFactionInfo } from "../utils/systemInfoModel";

/**
 *  Creates an array of APIEmbedField from the options and values
 *  @param Options are the names of the fields
 *  @param Values are the values of the fields
 */

function getFields(
  options: string[],
  values: string[]
): RestOrArray<APIEmbedField> {
  /*
    Example:
      options = ["A", "B", "C"]
      values = [1, 2, 3]
    Should Create a Map {values[i]: options[i]} => { A: 1, B: 2, C: 3 }
  */

  let fields: RestOrArray<APIEmbedField> = Array.from(
    Array(Math.max(options.length, values.length)),
    (_, i): APIEmbedField => {
      return { name: options[i], value: `${values[i]}` };
    }
  );

  return fields;
}

/**
 *  Creates an embeded message from the systemInfo
 *  @param systemInfo is the systemInfo object
 */

function systemEmbedMessage(systemInfo: SystemFactionInfo): EmbedBuilder {
  // Last Time the EDSM was updated
  let lastUpdated: number = 0;
  // Field Heading for the embeded message
  let options: string[] = [];
  // Field Values for the embeded message
  let values: string[] = [];

  // Looping through the systemInfo
  for (let i = 0; i < systemInfo.factions.length; i += 1) {
    // If the factions influence is less then 1% then skip it
    if (systemInfo.factions[i].influence * 100 < 1) {
      continue;
    }
    options.push(
      `${systemInfo.factions[i].name} (${systemInfo.factions[i].allegiance}-${systemInfo.factions[i].government})`
    );

    // Add faction influence in percentage
    values.push(
      `${(systemInfo.factions[i].influence * 100).toPrecision(4)} (${
        systemInfo.factions[i].state
      })`
    );
    // global LastUpdate should be least of all the factions
    lastUpdated = Math.max(lastUpdated, systemInfo.factions[i].lastUpdate);
  }

  // Create the embeded message
  const embeded_message = new EmbedBuilder()
    .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
    .setTitle(systemInfo.name)
    .setAuthor({ name: `System Info` })
    .addFields(...getFields(options, values))
    .setFooter({ text: "Last Updated: " })
    .setTimestamp(lastUpdated * 1000);

  return embeded_message;
}

export default systemEmbedMessage;

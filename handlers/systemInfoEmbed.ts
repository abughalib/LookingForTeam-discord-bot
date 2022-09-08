import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import { AppSettings } from "../utils/settings";
import SystemInfo from "../utils/systemInfoMode";

function getFields(
  options: string[],
  values: string[]
): RestOrArray<APIEmbedField> {
  let fields: RestOrArray<APIEmbedField> = Array.from(
    Array(Math.max(options.length, values.length)),
    (_, i): APIEmbedField => {
      return { name: options[i], value: `${values[i]}` };
    }
  );

  return fields;
}

function systemEmbedMessage(systemInfo: SystemInfo): EmbedBuilder {
  let lastUpdated: number = 0;
  let options: string[] = [];
  let values: string[] = [];

  systemInfo.factions.forEach((faction) => {
    if (faction.influence * 100 < 1) {
      return;
    }
    options.push(
      `${faction.name} (${faction.allegiance}-${faction.government})`
    );
    values.push(
      `${(faction.influence * 100).toPrecision(4)} (${faction.state})`
    );
    lastUpdated = Math.max(lastUpdated, faction.lastUpdate);
  });

  let embeded_message = new EmbedBuilder()
    .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
    .setTitle(systemInfo.name)
    .setAuthor({ name: `System Info` })
    .addFields(...getFields(options, values))
    .setFooter({ text: "Last Updated: " })
    .setTimestamp(lastUpdated * 1000);

  return embeded_message;
}

export default systemEmbedMessage;

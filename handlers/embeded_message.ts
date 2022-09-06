import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import { AppSettings } from "../utils/settings";

function getFields(
  options: string[],
  values: (string | number | boolean)[]
): RestOrArray<APIEmbedField> {
  let fields: RestOrArray<APIEmbedField> = Array.from(
    Array(Math.max(options.length, values.length)),
    (_, i): APIEmbedField => {
      return { name: options[i], value: `${values[i]}` };
    }
  );

  return fields;
}

function embedMessage(
  title: string,
  options: string[],
  values: (string | number | boolean)[],
  nickName: string
): EmbedBuilder {
  let embeded_message = new EmbedBuilder()
    .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
    .setTitle(title)
    .setAuthor({ name: `Created by: ${nickName}` })
    .addFields(...getFields(options, values))
    .setTimestamp(Date.now());

  return embeded_message;
}

export default embedMessage;

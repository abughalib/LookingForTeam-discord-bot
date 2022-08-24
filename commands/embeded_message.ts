import {
  APIEmbedField,
  EmbedBuilder,
  Interaction,
  RestOrArray,
} from "discord.js";
import { AppSettings } from "../utils/settings";

function getFields(
  list_headers: string[],
  list_headers_values: (string | number | boolean)[]
): RestOrArray<APIEmbedField> {
  let fields: RestOrArray<APIEmbedField> = Array.from(
    Array(Math.max(list_headers.length, list_headers_values.length)),
    (_, i): APIEmbedField => {
      return { name: list_headers[i], value: `${list_headers_values[i]}` };
    }
  );

  return fields;
}

function embedMessage(
  title: string,
  list_headers: string[],
  list_headers_values: (string | number | boolean)[],
  nickName: string
): EmbedBuilder {
  let embeded_message = new EmbedBuilder()
    .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
    .setTitle(title)
    .setAuthor({ name: `${nickName}` })
    .addFields(...getFields(list_headers, list_headers_values))
    .setTimestamp();

  return embeded_message;
}

export default embedMessage;

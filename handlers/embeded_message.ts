import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import { AppSettings } from "../utils/settings";

/**
 *  Creates an array of APIEmbedField from the options and values
 *  @param Options are the names of the fields
 *  @param Values are the values of the fields
 *  @param Inline is a boolean to set the fields inline or not
 */

function getFields(
  options: string[],
  values: (string | number | boolean)[],
  inline: boolean = false
): RestOrArray<APIEmbedField> {
  const fields: RestOrArray<APIEmbedField> = Array.from(
    Array(Math.max(options.length, values.length)),
    (_, i): APIEmbedField => {
      return { name: options[i], value: `${values[i]}`, inline: inline };
    }
  );

  return fields;
}

/**
 * Creates an embeded message from the given options and values
 * @param Title is the title of the embeded message
 * @param Options are the names of the fields
 * @param Values are the values of the fields
 * @param NickName is the name of the user who created the embeded message
 * @param Inline is a boolean to set the fields inline or not
 */

function embedMessage(
  title: string,
  options: string[],
  values: (string | number | boolean)[],
  nickName: string,
  inline: boolean = false
): EmbedBuilder {
  // Creating the embeded message
  const embeded_message = new EmbedBuilder()
    .setColor(AppSettings.EMBEDED_MESSAGE_COLOR)
    .setTitle(title)
    .setAuthor({ name: `Created by: ${nickName}` })
    .addFields(...getFields(options, values, inline))
    .setTimestamp(Date.now());

  return embeded_message;
}

export default embedMessage;

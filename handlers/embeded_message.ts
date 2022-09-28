import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import { AppSettings } from "../utils/settings";

/*
  Args:
    options: Array of strings
    values: Array of strings
  Returns:
    Array of APIEmbedField
  Description:
    Creates an array of APIEmbedField from the options and values
    Options are the names of the fields
    Values are the values of the fields
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

/*
  Args:
    Title of the embeded message
    Options for the embeded message
    Values for the embeded message
    Nickname of the user who created the embeded message
    inline (optional): If the fields should be inline
  Returns:
    EmbedBuilder
  Description:
    Creates an embeded message from the given options and values
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

import { CommandInteraction } from "discord.js";
import MockDiscord from "./mockDiscord";

export const defaultConfig = {
  id: "1",
  lang: "en",
  prefix: ".",
  channel: "channel",
  partyChannel: "party-channel",
  buildPreview: "enabled",
};

export const optionType: any = {
  // 0: null,
  // 1: subCommand,
  // 2: subCommandGroup,
  3: String,
  4: Number,
  5: Boolean,
  // 6: user,
  // 7: channel,
  // 8: role,
  // 9: mentionable,
  10: Number,
};

function getNestedOptions(options: any) {
  return options.reduce((allOptions: any, option: any) => {
    if (!option.options) return [...allOptions, option];
    const nestedOptions = getNestedOptions(option.options);
    return [option, ...allOptions, ...nestedOptions];
  }, []);
}

function castToType(value: string, typeId: number) {
  const type = optionType[typeId];
  return type ? type(value) : value;
}

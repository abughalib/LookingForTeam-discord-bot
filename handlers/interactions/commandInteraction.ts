import {
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
} from "discord.js";
import { AppSettings } from "../../utils/settings";
import defaultReply from "./commandInteractions/defaultReply";
import eliteServerTickInfo from "./commandInteractions/eliteServerTick";
import helpReply from "./commandInteractions/helpReply";
import pingReply from "./commandInteractions/ping";
import systemDeath from "./commandInteractions/systemDeath";
import systemfactionHistory from "./commandInteractions/systemFactionHistory";
import systemFactionInfo from "./commandInteractions/systemFactionInfo";
import systemTraffic from "./commandInteractions/systemTraffic";
import wingInteraction from "./commandInteractions/wingInteraction";

/**
 * Handles all the command interactions.
 * @param interaction Command Interaction
 * @param buttons Buttons used in the message
 */
async function interactionCommandHandler(
  interaction: CommandInteraction,
  buttons: ActionRowBuilder<ButtonBuilder>,
) {
  // CommandName and options
  const { commandName } = interaction;

  // Check if the interaction.guild is null
  if (interaction.guild == null) {
    // Log Error interaction
    console.error("interaction guild null: " + interaction);
    // Reply to the interaction
    // Show internal error message
    await interaction
      .reply({
        flags: MessageFlags.Ephemeral,
        content: "Some internal error occured. Please try again later.",
      })
      .catch((err) => {
        console.error(err);
      });
    return;
  }

  // fetch interacted user from the interaction.guild members
  // To get the nick name of the user
  const userInterected = await interaction.guild.members.fetch(
    interaction.user.id,
  );

  // Get the name of the user which is used in the channel
  // User can have different name in different channels
  const nickName = userInterected?.nickname || interaction.user.username;

  // Heading for the embed message
  const listFieldheading = AppSettings.BOT_WING_FIELDS;

  // BOT command Names
  // Defined in [BOT_COMMANDS]

  switch (commandName) {
    case AppSettings.BOT_WING_COMMAND_NAME:
      wingInteraction(interaction, listFieldheading, nickName, buttons);
      break;
    case AppSettings.BOT_SYSTEM_FACTION_HISTORY_COMMAND_NAME:
      systemfactionHistory(interaction);
      break;
    case AppSettings.BOT_SYSTEM_FACTION_INFO_COMMAND_NAME:
      systemFactionInfo(interaction);
      break;
    case AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME:
      systemTraffic(interaction, userInterected);
      break;
    case AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME:
      systemDeath(interaction, userInterected);
      break;
    case AppSettings.BOT_ELITE_SERVER_TICK_INFO:
      eliteServerTickInfo(interaction);
      break;
    case AppSettings.BOT_HELP_COMMAND_NAME:
      helpReply(interaction);
      break;
    case AppSettings.BOT_PING_COMMAND_NAME:
      pingReply(interaction);
      break;
    default:
      defaultReply(interaction);
      break;
  }
}

export default interactionCommandHandler;

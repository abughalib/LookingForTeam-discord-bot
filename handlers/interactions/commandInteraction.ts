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
import { Colonization } from "./commandInteractions/colonization";
import { ChatInputCommandInteraction } from "discord.js";

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

  // Colonization command handlers
  const colonization = new Colonization(
    interaction,
    interaction as ChatInputCommandInteraction,
  );

  // BOT command Names
  // Defined in [BOT_COMMANDS]

  switch (commandName) {
    case AppSettings.BOT_WING_COMMAND_NAME:
      await wingInteraction(interaction, listFieldheading, nickName, buttons);
      break;
    case AppSettings.BOT_SYSTEM_FACTION_HISTORY_COMMAND_NAME:
      await systemfactionHistory(interaction);
      break;
    case AppSettings.BOT_SYSTEM_FACTION_INFO_COMMAND_NAME:
      await systemFactionInfo(interaction);
      break;
    case AppSettings.BOT_SYSTEM_TRAFFIC_COMMAND_NAME:
      await systemTraffic(interaction, userInterected);
      break;
    case AppSettings.BOT_SYSTEM_DEATH_COMMAND_NAME:
      await systemDeath(interaction, userInterected);
      break;
    case AppSettings.BOT_COLONIZATION_ADD_COMMAND_NAME:
      await colonization.add();
      break;
    case AppSettings.BOT_COLONIZATION_REMOVE_COMMAND_NAME:
      await colonization.remove();
      break;
    case AppSettings.INTERACTION_COLONIZATION_LIST_COMMAND_NAME:
      await colonization.list();
      break;
    case AppSettings.BOT_COLONIZATION_PROGRESS_COMMAND_NAME:
      await colonization.progress();
      break;
    case AppSettings.BOT_COLONIZATION_HELP_COMMAND_NAME:
      await colonization.help();
      break;
    case AppSettings.INTERACTION_COLONIZATION_PARTICIPATE_COMMAND_NAME:
      await colonization.participate();
      break;
    case AppSettings.BOT_COLONIZATION_UPDATE_PROGRESS_COMMAND_NAME:
      await colonization.updateProgress();
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

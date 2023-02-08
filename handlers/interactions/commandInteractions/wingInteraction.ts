import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
} from "discord.js";
import { AppSettings } from "../../../utils/settings";
import getEpochTimeAfterHours from "../../../utils/timestamp";
import embedMessage from "../../embeded_message";
import deleteInteraction from "../utils/deleteInteractions";
import isValidDuration from "../utils/durationValidation";

/**
 * Creates a new Team/Wing Request.
 */

async function wingInteraction(
  interaction: CommandInteraction,
  listFieldheading: string[],
  nickName: string,
  buttons: ActionRowBuilder<ButtonBuilder>
) {
  // Defer interaction reply
  await interaction
    .deferReply({
      ephemeral: false,
    })
    .catch((err) => {
      console.error(`Error in wing interaction deferReply: ${err}`);
    });

  // Defining options to get interaction options
  const { options } = interaction;
  // Get specific option from the command
  const activity_value =
    options.get(AppSettings.INTERACTION_ACTIVITY_ID)?.value ||
    AppSettings.DEFAULT_TEAM_ACTIVITY;
  let activity_name = AppSettings.DEFAULT_TEAM_ACTIVITY;
  AppSettings.INTERACTION_ACTIVITY_CHOICES.map((activity, _) => {
    if (activity.value === activity_value) {
      activity_name = activity.name;
    }
  });
  const location =
    options.get(AppSettings.INTERACTION_LOCATION_ID)?.value ||
    AppSettings.DEFAULT_TEAM_LOCATION;
  let spots = Number(
    options.get(AppSettings.INTERACTION_SPOTS_ID)?.value ||
      AppSettings.MAXIMUM_TEAM_SPOT
  );

  const gameMode =
    options.get(AppSettings.INTERACTION_GAME_MODE_ID)?.value ||
    AppSettings.DEFAULT_GAME_MODE;

  let gameModeName: string = AppSettings.DEFAULT_GAME_MODE;
  if (gameMode === "own_pg") {
    gameModeName = `${nickName} Private Group`;
  }

  const gameVersion = options.get(
    AppSettings.INTERACTION_GAME_VERSION_ID
  )?.value;

  let gameVersionName: string = AppSettings.DEFAULT_GAME_VERSION;
  AppSettings.INTERACTION_GAME_VERSION_CHOICES.map((version, _) => {
    if (version.value === gameVersion) {
      gameVersionName = version.name;
      return;
    }
  });

  // How long the team will be active
  let duration: number = Number(
    (
      (options.get(AppSettings.INTERACTION_DURATION_ID)?.value as number) ||
      AppSettings.DEFAULT_TEAM_DURATION
    ).toFixed(2)
  );
  // When the Team creator is looking for Team
  let when: number = Number(
    (
      (options.get(AppSettings.INTERACTION_WHEN_ID)?.value as number) || 0
    ).toFixed(2)
  );

  // Check if the duration and when is valid
  if (
    !(await isValidDuration(interaction, duration)) ||
    !(await isValidDuration(interaction, when)) ||
    !(await isValidDuration(interaction, duration + when))
  ) {
    await interaction.reply({
      content: AppSettings.INVALID_DURATION_MESSAGE,
    });
    return;
  }

  // If timer is more then [MAXIMUM_HOURS_TEAM] hours convert it into Minutes
  if (when > AppSettings.MAXIMUM_HOURS_TEAM) {
    when = when / 60;
  }

  // If Duration is more then [MAXIMUM_HOURS_TEAM] hours convert it into Minutes
  if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
    duration = duration / 60;
  }

  // Maximum spot in wing is [MAXIMUM_TEAM_SPOT] which is 3 as of now
  if (spots > AppSettings.MAXIMUM_TEAM_SPOT) {
    spots = AppSettings.MAXIMUM_TEAM_SPOT;
  }

  // Special case for AX Conflict Zone, where no of players are more than 3
  if (activity_value === "ax_conflict_zone") {
    spots = AppSettings.MAXIMUM_PEOPLE_INSTANCE;
  }

  /*
      If when is 0 then it means the user is looking for team now
      else it will be the time when the user is looking for team
    */
  const listFieldValue = [
    gameVersionName,
    activity_name,
    location,
    parseInt(spots.toString()),
    gameModeName,
    when === 0
      ? AppSettings.DEFAULT_WHEN_VALUE
      : `<t:${getEpochTimeAfterHours(when)}:T>`,
    `${interaction.user}`,
  ];

  // Title for the embed message
  let title: string = AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;

  // Channel name for the embed message
  if (interaction.channelId === AppSettings.XBOX_CHANNEL_ID) {
    title = AppSettings.XBOX_WING_REQUEST_INTERACTION_TITLE;
  } else if (interaction.channelId === AppSettings.PS_CHANNEL_ID) {
    title = AppSettings.PS_WING_REQUEST_INTERACTION_TITLE;
  } else {
    title = AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;
  }

  // Create the embed message
  let embeded_message = embedMessage(
    title,
    listFieldheading,
    listFieldValue,
    nickName
  );

  // Adding time
  embeded_message.addFields({
    name: AppSettings.BOT_WING_DURATION_FIELD_NAME,
    value: `<t:${getEpochTimeAfterHours(duration + when).toString()}:T>`,
  });

  // Set footer for the embed message
  embeded_message.setFooter({
    text: `Posted at`,
  });

  // Send the embed message specific for the channel [PC, XBOX, PS]
  if (interaction.channelId === AppSettings.PC_CHANNEL_ID) {
    // Pretty Looking reply
    // Send the embed message
    // Add the buttons
    await interaction
      .editReply({
        embeds: [embeded_message],
        components: [buttons],
      })
      .catch((err) => {
        console.error(`Error in wing interaction editReply: ${err}`);
      });
  } else {
    // Pretty Looking reply
    await interaction
      .editReply({
        embeds: [embeded_message],
        components: [buttons],
      })
      .catch((err) => {
        console.error(`Error in Wing interaction Reply: ${err}`);
      });
  }
  // Auto Delete message after certain time.
  deleteInteraction(
    interaction,
    AppSettings.HOURS_TO_MILISEC * (duration + when)
  );
}

export default wingInteraction;

import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
} from "discord.js";
import { AppSettings, InteractionChoices } from "../../../utils/settings";
import getEpochTimeAfterHours from "../../../utils/timestamp";
import embedMessage from "../../embeded_message";
import deleteInteraction from "../utils/deleteInteractions";
import isValidDuration from "../utils/durationValidation";

/**
 * Creates a new Team/Wing Request.
 * @param interaction The interaction object.
 * @param listFieldheading The list of field headings.
 * @param nickName The nickname of the user.
 * @param buttons The buttons to be added to the message.
 * */

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

  // Get the platform of the user
  const platformValue: string =
    (options.get(AppSettings.INTERACTION_PLAYFORM_ID)?.value as string) ||
    AppSettings.DEFAULT_PLATFORM;

  // Get the platform name of the user
  let platformName: string = AppSettings.DEFAULT_PLATFORM;

  // Get the platform name from the platform value
  AppSettings.INTERACTION_PLATFORM_CHOICES.map((iter, _) => {
    if (iter.value === platformValue) {
      platformName = iter.name;
    }
  });

  // Get the activity of the user
  const activity_value =
    options.get(AppSettings.INTERACTION_ACTIVITY_ID)?.value ||
    AppSettings.DEFAULT_TEAM_ACTIVITY;

  // Get the activity name of the user
  let activity_name = getActivityName(platformValue, activity_value as string);

  // Get the location of the user
  const location =
    options.get(AppSettings.INTERACTION_LOCATION_ID)?.value ||
    AppSettings.DEFAULT_TEAM_LOCATION;

  // Get the number of spots in the team
  let spots = Number(
    options.get(AppSettings.INTERACTION_SPOTS_ID)?.value ||
      AppSettings.MAXIMUM_TEAM_SPOT
  );

  // Get the game mode of the user
  const gameMode =
    options.get(AppSettings.INTERACTION_GAME_MODE_ID)?.value ||
    AppSettings.DEFAULT_GAME_MODE;

  // If the game mode is own_pg, then the game mode name is the nickname of the user
  let gameModeName: string = gameMode as string;
  if (gameMode === "my_pg") {
    gameModeName = `${nickName} Private Group`;
  }

  const gameVersionValue = options.get(AppSettings.INTERACTION_GAME_VERSION_ID)
    ?.value as string;

  let gameVersionName: string = getGameVersionName(
    platformValue,
    gameVersionValue
  );

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

  // Additional Infomation if provided
  let additionalInfo: string =
    options.get(AppSettings.INTERACTION_EXTRA_ID)?.value?.toString() || "";

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
  // Maybe a better implementation is to check the activity and then set the maximum spot
  if (activity_value !== "cqc" && spots > AppSettings.MAXIMUM_TEAM_SPOT) {
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
    platformName,
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

  // If additional info is provided then add it to the list
  if (additionalInfo !== "") {
    listFieldValue.push(additionalInfo);
    listFieldheading.push(AppSettings.BOT_WING_ADDITIONAL_FIELD_NAME);
  }

  // Title for the embed message
  let title: string = getWingMessageTitle(platformValue);

  // Create the embed message
  let embeded_message = embedMessage(
    title,
    listFieldheading,
    listFieldValue,
    nickName,
    false,
    platformValue
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

  // Pretty Looking reply
  await interaction
    .editReply({
      embeds: [embeded_message],
      components: [buttons],
    })
    .catch((err) => {
      console.error(`Error in Wing interaction Reply: ${err}`);
    });
  // Auto Delete message after certain time.
  deleteInteraction(
    interaction,
    AppSettings.HOURS_TO_MILISEC * (duration + when)
  );
}

/**
 * Get Activity Name from the activity value from [AppSettings]
 * @param platform Platform of the user
 * @param activityValue Activity value of the user
 * @returns Activity Name
 * */
function getActivityName(platform: string, activityValue: string): string {
  // If the platform is Xbox or PS4 and the activity is Odyssey specific then
  // return the default activity of the platform
  if (
    (platform === AppSettings.XBOX_PLATFORM ||
      platform === AppSettings.PS_PLATFORM) &&
    AppSettings.ODYSSEY_SPECIFIC_ACTIVITY.find(
      (activity) => activity === activityValue
    )
  ) {
    return AppSettings.DEFAULT_TEAM_ACTIVITY;
  }

  let activity_name = AppSettings.DEFAULT_TEAM_ACTIVITY;

  // Get the activity name from the activity value
  AppSettings.INTERACTION_ACTIVITY_CHOICES.map((activity, _) => {
    if (activity.value === activityValue) {
      activity_name = activity.name;
    }
  });

  return activity_name;
}

/**
 * Get the game version name from the game version value from [AppSettings]
 * If the platform is Xbox or PS4 and the game version is [DEFAULT_CONSOLE_GAME_VERSION]
 * or return the default game version of the platform
 * @param platform  Platform of the user
 * @param gameVersion Game version value of the user
 * @returns Game version name
 */
function getGameVersionName(platform: string, gameVersion: string): string {
  let gameVersionName: string = AppSettings.DEFAULT_PC_GAME_VERSION;

  // Get the game version name from the game version value
  AppSettings.INTERACTION_GAME_VERSION_CHOICES.map((version, _) => {
    if (version.value === gameVersion) {
      gameVersionName = version.name;
    }
  });

  // If the platform is Xbox or PS4 and the game version is [DEFAULT_CONSOLE_GAME_VERSION]
  if (
    (platform === AppSettings.XBOX_PLATFORM ||
      platform === AppSettings.PS_PLATFORM) &&
    (gameVersionName === AppSettings.ELITE_DANGEROUS_ODYSSEY ||
      AppSettings.ELITE_DANGEROUS_HORIZON_4_0)
  ) {
    gameVersionName = AppSettings.DEFAULT_CONSOLE_GAME_VERSION;
  }

  return gameVersionName;
}

/**
 * Get Embed Message Title based on the platform
 * @param platform Platform of the user
 * @returns Embed Message Title
 * */
function getWingMessageTitle(platform: string): string {
  switch (platform) {
    // If the platform is PC then return the PC title
    case AppSettings.DEFAULT_PLATFORM:
      return AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;
    case AppSettings.XBOX_PLATFORM:
      return AppSettings.XBOX_WING_REQUEST_INTERACTION_TITLE;
    case AppSettings.PS_PLATFORM:
      return AppSettings.PS_WING_REQUEST_INTERACTION_TITLE;
    //  If the platform is not PC, Xbox or PS4 then return the PC title
    default:
      return AppSettings.PC_WING_REQUEST_INTERACTION_TITLE;
  }
}

export default wingInteraction;

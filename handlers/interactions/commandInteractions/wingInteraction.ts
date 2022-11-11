import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  SelectMenuBuilder,
} from "discord.js";
import { AppSettings } from "../../../utils/settings";
import getEpochTimeAfterHours from "../../../utils/timestamp";
import embedMessage from "../../embeded_message";
import deleteInteraction from "../utils/deleteInteractions";
import isValidDuration from "../utils/durationValidation";

/*
  Creates a new Team/Wing Request.
*/

async function wingInteraction(
  interaction: CommandInteraction,
  listFieldheading: string[],
  nickName: string,
  buttons: ActionRowBuilder<ButtonBuilder>,
  menus: ActionRowBuilder<SelectMenuBuilder>
) {
  // Defining options to get interaction options
  const { options } = interaction;
  // Get specific option from the command
  const activity =
    options.get(AppSettings.INTERACTION_ACTIVITY_ID)?.value ||
    AppSettings.DEFAULT_TEAM_ACTIVITY;
  const location =
    options.get(AppSettings.INTERACTION_LOCATION_ID)?.value ||
    AppSettings.DEFAULT_TEAM_LOCATION;
  let spots =
    options.get(AppSettings.INTERACTION_SPOTS_ID)?.value ||
    AppSettings.MAXIMUM_TEAM_SPOT;

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
    return;
  }

  // Defer the reply
  await interaction.deferReply().catch((error) => {
    console.error(error);
  });

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

  /*
      If when is 0 then it means the user is looking for team now
      else it will be the time when the user is looking for team
    */
  const listFieldValue = [
    activity,
    location,
    parseInt(spots.toString()),
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

  console.log(duration + when);

  // Set footer for the embed message
  embeded_message.setFooter({
    text: `Posted at`,
  });

  // Defer message reply
  await interaction
    .deferReply({
      ephemeral: false,
    })
    .catch((err) => {
      console.error(`Error in deferReply: ${err}`);
    });

  // Send the embed message specific for the channel [PC, XBOX, PS]
  if (interaction.channelId === AppSettings.PC_CHANNEL_ID) {
    // Pretty Looking reply
    // Send the embed message
    // Add the buttons and menu to the message
    await interaction
      .editReply({
        embeds: [embeded_message],
        components: [buttons, menus],
      })
      .catch((err) => {
        console.error(`Error in editReply: ${err}`);
      });
  } else {
    // Pretty Looking reply
    await interaction
      .editReply({
        embeds: [embeded_message],
        components: [buttons],
      })
      .catch((err) => {
        console.error(`Error in deferReply: ${err}`);
      });
  }
  // Auto Delete message after certain time.
  deleteInteraction(
    interaction,
    AppSettings.HOURS_TO_MILISEC * (duration + when)
  );
}

export default wingInteraction;

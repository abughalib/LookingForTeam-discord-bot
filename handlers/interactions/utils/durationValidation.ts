import { CommandInteraction, MessageFlags } from "discord.js";
import {
  checkDurationValidation,
  DurationValidation,
} from "../../../utils/helpers";

/**
 *  Check if the duration is Valid.
 *  If the duration is valid, then return true.
 *  else send a ephemeral message to the user and return false.
 *  @param interaction CommandInteraction
 *  @param timer Time in hours
 */
async function isValidDuration(
  interaction: CommandInteraction,
  timer: number,
): Promise<boolean> {
  // Check if the timer is valid

  // If the duration is more than 10 hours consider it minutes
  if (timer > 10) {
    timer = timer / 60;
  }

  switch (checkDurationValidation(timer)) {
    case DurationValidation.INVALID:
      await interaction
        .reply({
          content: "Please enter a valid hour",
          flags: MessageFlags.Ephemeral,
        })
        .catch((err) => {
          console.error(err);
        });
      return false;
    // In case if the Duration is more then allowd time [MAXIMUM_HOURS_TEAM]
    case DurationValidation.LIMIT_EXCEEDED:
      await interaction
        .reply({
          flags: MessageFlags.Ephemeral,
          content: "You cannnot request for more then 10 hours",
        })
        .catch((err) => {
          console.error(
            `Error If Duration/Timer is more then 10 hours dismiss it: ${err}`,
          );
        });
      return false;
    case DurationValidation.VALID:
      break;
    default:
      break;
  }
  return true;
}

export default isValidDuration;

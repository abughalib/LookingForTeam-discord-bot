import { SystemTrafficInfo } from "./models";
import { AppSettings } from "./settings";

interface ShipsInfo {
  shipNames: Array<string>;
  shipCount: Array<string>;
}

/**
 *  Returns the ships info from the
 *  system traffic info by ship name and count
 *  @param systemTrafficInfo
 */
function getEliteShipAndCount(systemTrafficInfo: SystemTrafficInfo): ShipsInfo {
  let shipNames: string[] = [];
  let shipCount: string[] = [];

  if (systemTrafficInfo.breakdown !== null) {
    for (const [shipName, count] of Object.entries(
      systemTrafficInfo.breakdown,
    )) {
      shipNames.push(shipName);
      shipCount.push(count.toString());
    }
  }

  return {
    shipNames,
    shipCount,
  };
}

enum DurationValidation {
  VALID,
  INVALID,
  LIMIT_EXCEEDED,
}

/** Checks if the given duration is valid or not.
 * Based on the conditions specified in settings.ts
 * @param duration The duration in hours to check.
 */

function checkDurationValidation(duration: number): DurationValidation {
  // Duration cannot be negative
  if (duration < 0) {
    return DurationValidation.INVALID;
  }

  // Duration cannot be greater than [MAXIMUM_HOURS_TEAM]
  if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
    return DurationValidation.LIMIT_EXCEEDED;
  }

  // Duration is valid
  return DurationValidation.VALID;
}

/** Removes an element from an array by given value.
 * @param arri The array to remove the element from.
 * @param itemToRemove The element to remove.
 */
function removeEntry<T>(arri: Array<T>, itemToRemove: T) {
  let array: Array<T> = [];

  for (let i = 0; i < arri.length; i += 1) {
    if (arri[i] !== itemToRemove) {
      array.push(arri[i]);
    }
  }

  return array;
}

export {
  getEliteShipAndCount,
  removeEntry,
  checkDurationValidation,
  DurationValidation,
};

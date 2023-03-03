/**
 * Calculates the epoch time after the given hours
 * @param hours Hours to add to the current time
 */

function getEpochTimeAfterHours(hours: number) {
  return Math.floor(Date.now() / 1000) + Math.floor(hours * 60 * 60);
}

export default getEpochTimeAfterHours;

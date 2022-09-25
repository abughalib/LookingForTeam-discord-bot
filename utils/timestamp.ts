/*
  Args:
    hours: number
  Returns:
    number
  Description:
    Returns the epoch time after the given hours
*/

function getEpochTimeAfterHours(hours: number) {
  return Math.floor(Date.now() / 1000) + Math.floor(hours * 60 * 60);
}

export default getEpochTimeAfterHours;

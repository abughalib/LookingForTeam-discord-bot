function getEpochTimeAfterHours(hours: number) {
  return Math.floor(Date.now() / 1000) + Math.floor(hours * 60 * 60);
}

export default getEpochTimeAfterHours;

function formatTime(duration: number): string {
  // Added for cameld00d
  if (duration < 0) {
    return "For few hours maybe";
  }

  // Duration less then 1 i.e minutes
  if (duration < 1) {
    duration = 60 * duration;
    if (duration < 1) {
      return `${duration * 60} seconds`;
    }
    return `About ${duration.toFixed(2)} Minutes`;
  }
  let str_duration = duration.toString();

  if (str_duration.includes(".")) {
    const duration_split = str_duration.split(".");
    const hours = duration_split[0];
    const minutes = (parseInt(duration_split[1]) * 60) / 10;
    return `About ${hours} hours and ${minutes.toFixed(2)} Minutes`;
  }

  return `About ${duration} Hours`;
}

export default formatTime;

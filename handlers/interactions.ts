import { Interaction } from "discord.js";
import { AppSettings } from "../utils/settings";
import formatTime from "../utils/helpers";
import embedMessage from "./embeded_message";

async function handleInteractions(interaction: Interaction) {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName, options } = interaction;

  const userInterected = await interaction.guild?.members.fetch(
    interaction.user.id
  );
  const nickName = userInterected?.nickname || interaction.user.username;

  if (commandName === "lookingforteam") {
    const version = options.get("version")?.value || "Odyssey";
    const activity = options.get("activity")?.value || "Any";
    const location = options.get("location")?.value || "Anywhere";
    let spots = options.get('spots')?.value || 3;
    let duration: number = (options.get("duration")?.value as number) || 0.5;

    // Maximum spot in wing is MAXIMUM_TEAM_SPOT which is 3 as of now
    if (spots > AppSettings.MAXIMUM_TEAM_SPOT){
      spots = AppSettings.MAXIMUM_TEAM_SPOT;
    }
    // If Duration is more then MAXIMUM_HOURS_TEAM hours convert it into Minutes
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM) {
      duration = duration/60;
    }

    // If Duration is more then 18 hours dismiss it.
    if (duration > AppSettings.MAXIMUM_HOURS_TEAM*60) {
      return;
    }

    const list_headers = [
      "Game Version",
      "What kind of mission/gameplay?",
      "Star System/Location",
      "Number of Space in Wing/Team Available"
    ];
    const list_headers_values = [version, activity, location, spots];
    const title: string = "PC Team + Wing Request";

    let embeded_message = embedMessage(
      title,
      list_headers,
      list_headers_values,
      nickName,
    );

    // Adding time
    embeded_message.addFields({
      name: "Duration/TimeFrame",
      value: `${formatTime(duration)}`,
    });

    // Time can't be negative;
    if (duration < 0) {
      duration = 0.5;
    }

    embeded_message.setFooter({
      text: `Auto delete in ${duration * 60} minutes`,
    });

    await interaction.deferReply({
      ephemeral: false,
    });

    // Pretty Looking reply
    await interaction.editReply({
      embeds: [embeded_message],
    });

    // Auto Delete message after certain time.
    setTimeout(async () => {
      await interaction.deleteReply();
    }, AppSettings.HOURS_TO_MILISEC * duration);
  }
}

export default handleInteractions;

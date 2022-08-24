import { Client, Message } from "discord.js";
import { AppSettings } from "../utils/settings";
import embedMessage from "./embeded_message";

async function handleMessage(prefix: string, message: Message, client: Client) {
  if (message.author == client?.user) {
    return;
  }
  if (message.content.startsWith(prefix)) {
    const command = message.content.slice(prefix.length).split(" ")[0];

    switch (command) {
      case "ping":
        await message.channel.send({
          content: "Bots never sleeps",
        });
        break;
      case "help":
        const title: string = "How to use, Check example.";
        const list_headers = [
          "Game Version",
          "What kind of mission/gameplay?",
          "Star System/Location",
          "Number of Space in Wing/Team Available",
          "Duration/TimeFrame",
        ];
        const list_headers_values = [
          "Odyssey, Horizon 4.0, Horizon 3.8, ED Beyond",
          "Mining, Bounty Hunting, etc...",
          "SOL",
          "2 Spots",
          "1.5 (1 hours and 30 minutes)",
        ];

        let embeded_message = embedMessage(
          title,
          list_headers,
          list_headers_values,
          client.user?.username || "Unknown"
        );

        embeded_message.setFooter({
          text: `Auto delete in ${AppSettings.HELP_MESSAGE_DISMISS_DURATION/1000} seconds`,
        });

        let sent_message = await message.channel.send({
          embeds: [embeded_message],
        });

        setTimeout(async () => {
          await sent_message.delete();
          await message.delete();
        }, AppSettings.HELP_MESSAGE_DISMISS_DURATION);
    }
  }
}

export default handleMessage;

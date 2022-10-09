import { TickInfo } from "./models";
import { AppSettings } from "./settings";

class BGSInfo {
  async getLastTick(): Promise<TickInfo | null> {
    const response = await fetch("https://elitebgs.app/api/ebgs/v5/ticks", {
      method: "GET",
      headers: AppSettings.BOT_HEADER,
    });

    if (response.status !== 200) {
      console.log("Error getting last tick");
      return null;
    }

    const json = await response.json();
    return json[0];
  }
}

export default BGSInfo;

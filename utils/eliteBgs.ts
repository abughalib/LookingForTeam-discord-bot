import { TickInfo } from "./models";
import { AppSettings } from "./settings";
import { httpsRequest } from "./httpsRequest";

class BGSInfo {
  async getLastTick(): Promise<TickInfo | null> {
    try {
      const response = await httpsRequest("https://elitebgs.app/api/ebgs/v5/ticks", {
        method: "GET",
        headers: AppSettings.BOT_HEADER,
      });

      if (!response.ok) {
        console.error(`EliteBGS tick fetch error: ${response.status} ${response.statusText}`);
        return null;
      }

      const json = await response.json();
      return json[0] ?? null;
    } catch (error) {
      console.error("EliteBGS tick fetch exception:", error);
      return null;
    }
  }
}

export default BGSInfo;

import { AppSettings } from "./settings";
import { SystemFactionInfo, Factions } from "./systemInfoModel";
import {
  ServerStatusModel,
  SystemDeath,
  SystemInfo,
  SystemTrafficInfo,
} from "./models";
import { getSystemInfoFromCache, cacheSystemInfo } from "./database";

/*
  EDSM API Queries here.
*/

class EDSM {
  constructor() {}

  /*
    Args:
      systemName: string // Elite Dangerous system Name
    Returns:
      json_data: json // EDSM system faction info [SystemFactionInfo]
    Description:
      Fetches system Factions from EDSM
  */
  async fetchSystemFactionInfo(systemName: string, showHistory: number = 0) {
    let resp = await fetch(AppSettings.BOT_SYSTEM_FACTION_FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        systemName: systemName,
        showHistory: showHistory,
      }),
      headers: AppSettings.BOT_HEADER,
    });

    return resp.json();
  }

  // Elite Dangerous server status
  async eliteServerStatus(): Promise<ServerStatusModel | null> {
    let resp = await fetch(AppSettings.BOT_ELITE_SERVER_FETCH_URL);

    let resp_json = await resp.json();

    let serverStatus: ServerStatusModel = resp_json;

    return serverStatus;
  }

  // Elite Dangerous system Traffic info with Breakdown by ships
  async getSystemTrafficInfo(systemName: string): Promise<any | null> {
    let resp = await fetch(AppSettings.BOT_SYSTEM_TRAFFIC_FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        systemName: systemName,
      }),
      headers: AppSettings.BOT_HEADER,
    });

    let resp_json = await resp.json();

    return resp_json;
  }

  /*
    Args:
      systemName: string // Elite Dangerous system Name
    Returns:
      systemDeath // [SystemDeath]
  */
  async getSystemDeath(systemName: string): Promise<SystemDeath | null> {
    let resp = await fetch(AppSettings.BOT_SYSTEM_DEATHS_INFO_FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        systemName: systemName,
      }),
      headers: AppSettings.BOT_HEADER,
    });

    let resp_json = await resp.json();

    let systemDeath: SystemDeath = resp_json;

    return systemDeath;
  }

  /*
    Args:
      systemName: string // Elite Dangerous system Name
    Returns:
      systemfactioninfo // [SystemFactionInfo]
  */

  async getSystemFactionInfo(
    systemName: string,
    showHistory: number = 0,
  ): Promise<SystemFactionInfo | null> {
    let json_data = await this.fetchSystemFactionInfo(systemName, showHistory);

    if (!json_data) {
      console.error("EDSM not responding: ", json_data);
      return null;
    }

    return {
      id: json_data.id,
      id64: json_data.id64,
      name: json_data.name,
      url: json_data.url,
      controllingFaction: json_data.controllingFaction,
      factions: json_data.factions,
    };
  }

  static async getSystemInfo(systemName: string): Promise<SystemInfo | null> {
    // First, try to get from cache
    try {
      const cachedSystemInfo = await getSystemInfoFromCache(systemName);
      if (cachedSystemInfo) {
        return cachedSystemInfo;
      }
    } catch (error) {
      console.error(
        "Error retrieving from cache, proceeding with API call:",
        error,
      );
    }

    // If not in cache, fetch from API
    const systemInfo = await fetch(
      AppSettings.BOT_SYSTEM_INFO_FETCH_URL +
        `?systemName=${encodeURIComponent(systemName)}&showCoordinates=1`,
      {
        method: "GET",
        headers: AppSettings.BOT_HEADER,
      },
    );

    if (!systemInfo.ok) {
      console.error("EDSM not responding: ", systemInfo.statusText);
      return null;
    }

    const systemInfoData: SystemInfo = await systemInfo.json();

    // Cache the result if it's valid
    if (systemInfoData && systemInfoData.coords) {
      try {
        await cacheSystemInfo(systemInfoData);
      } catch (error) {
        console.error("Error caching system info:", error);
        // Don't throw here, just log the error since we still have the data
      }
    }

    return systemInfoData;
  }
}

export default EDSM;

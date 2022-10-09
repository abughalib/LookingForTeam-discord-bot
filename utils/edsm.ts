import { AppSettings } from "./settings";
import SystemFactionInfo from "./systemInfoModel";
import { ServerStatusModel, SystemDeath, SystemTrafficInfo } from "./models";

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
  async fetchSystemFactionInfo(systemName: string) {
    let resp = await fetch(AppSettings.BOT_SYSTEM_INFO_FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        systemName: systemName,
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
  async getSystemTrafficInfo(
    systemName: string
  ): Promise<SystemTrafficInfo | null> {
    let resp = await fetch(AppSettings.BOT_SYSTEM_TRAFFIC_FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        systemName: systemName,
      }),
      headers: AppSettings.BOT_HEADER,
    });

    let resp_json = await resp.json();

    let systemTrafficInfo: SystemTrafficInfo = resp_json;

    return systemTrafficInfo;
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

  async getSystemFactionInfo(systemName: string): Promise<SystemFactionInfo | null> {
    let json_data = await this.fetchSystemFactionInfo(systemName);

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
}

export default EDSM;

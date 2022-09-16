import { AppSettings } from "./settings";
import SystemInfo from "./systemInfoModel";
import { ServerStatusModel, SystemDeath, SystemTrafficInfo } from "./models";

async function fetchSystemInfo(systemName: string) {
  let resp = await fetch(AppSettings.BOT_SYSTEM_INFO_FETCH_URL, {
    method: "POST",
    body: JSON.stringify({
      systemName: systemName,
    }),
    headers: AppSettings.BOT_HEADER,
  });

  return resp.json();
}

async function eliteServerStatus(): Promise<ServerStatusModel | null> {
  let resp = await fetch(AppSettings.BOT_ELITE_SERVER_FETCH_URL);

  let resp_json = await resp.json();

  let serverStatus: ServerStatusModel = resp_json;

  return serverStatus;
}

async function getSystemTrafficInfo(
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

async function getSystemDeath(systemName: string): Promise<SystemDeath | null> {
  let resp = await fetch(AppSettings.BOT_SYSTEM_DEATHS_INFO_FETCH_URL, {
    method: "POST",
    body: JSON.stringify({
      systemName: systemName
    }),
    headers: AppSettings.BOT_HEADER
  });

  let resp_json = await resp.json();

  let systemDeath: SystemDeath = resp_json;

  return systemDeath;
}

async function getSystemInfo(systemName: string): Promise<SystemInfo | null> {
  let json_data = await fetchSystemInfo(systemName);

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

export default getSystemInfo;

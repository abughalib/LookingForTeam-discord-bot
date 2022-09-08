import { AppSettings } from "./settings";
import SystemInfo from "./systemInfoMode";

async function fetchSystemInfo(systemName: string) {
  let resp = await fetch(AppSettings.BOT_SYSTEM_INFO_FETCH_URL, {
    method: "POST",
    body: JSON.stringify({
      systemName: systemName,
    }),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Looking-For-Team-Bot/1.8 (Linux)",
    },
  });

  return resp.json();
}

async function getSystemInfo(systemName: string): Promise<SystemInfo | null> {
  let json_data = await fetchSystemInfo(systemName);

  if (!json_data) {
    console.error("EDSM not responding: ", json_data);
    return null;
  }

  let systemInfo: SystemInfo = {
    id: json_data.id,
    id64: json_data.id64,
    name: json_data.name,
    url: json_data.url,
    controllingFaction: json_data.controllingFaction,
    factions: json_data.factions,
  };

  return systemInfo;
}

export default getSystemInfo;

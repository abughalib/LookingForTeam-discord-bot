export class AppSettings {
  static readonly EMBEDED_MESSAGE_COLOR = 0x0099ff;
  static readonly HOURS_TO_MILISEC = 60 * 60 * 1000; // 3600 seconds
  static readonly HELP_MESSAGE_DISMISS_TIMEOUT = 180 * 1000; // 3 Minutes
  static readonly DEFAULT_REQUEST_TEAM_TIMEOUT = 10 * 60 * 1000; // 10 Minutes
  static readonly MAXIMUM_TEAM_SPOT = 3;
  static readonly MAXIMUM_HOURS_TEAM = 10;
  static readonly DEFAULT_GAME_VERSION = "Odyssey";
  static readonly DEFAULT_TEAM_ACTIVITY = "Any";
  static readonly DEFAULT_TEAM_LOCATION = "Anywhere";
  static readonly DEFAULT_SYSTEM_NAME = "SOL";
  static readonly DEFAULT_TEAM_DURATION = 1;
  static readonly PC_WING_REQUEST_INTERACTION_TITLE = "PC Team + Wing Request";
  static readonly PC_CHANNEL_ID = "1010103086334873651";
  static readonly XBOX_WING_REQUEST_INTERACTION_TITLE = "XBOX Wing Request";
  static readonly XBOX_CHANNEL_ID = "790162405342707713";
  static readonly PS_WING_REQUEST_INTERACTION_TITLE =
    "Play Station Wing Request";
  static readonly PS_CHANNEL_ID = "790162689887961089";
  static readonly BOT_WING_COMMAND_NAME = "wing";
  static readonly BOT_SYSTEM_INFO_COMMAND_NAME = "systeminfo";
  static readonly BOT_SYSTEM_TRAFFIC_COMMAND_NAME = "systemtraffic";
  static readonly BOT_SYSTEM_DEATH_COMMAND_NAME = "systemdeath";
  static readonly BOT_SYSTEM_INFO_FETCH_URL =
    "https://www.edsm.net/api-system-v1/factions";
  static readonly BOT_SYSTEM_DEATHS_INFO_FETCH_URL =
    "https://www.edsm.net/api-system-v1/deaths";
  static readonly BOT_SYSTEM_TRAFFIC_FETCH_URL =
    "https://www.edsm.net/api-system-v1/traffic";
  static readonly BOT_ELITE_SERVER_FETCH_URL =
    "https://www.edsm.net/api-status-v1/elite-server";
  static readonly BOT_HELP_COMMAND_NAME = "winghelp";
  static readonly BOT_PING_COMMAND_NAME = "ping";
  static readonly GAME_NAME = "Elite Dangerous";
  static readonly BOT_HEADER = {
    "Content-Type": "application/json",
    "User-Agent": "Looking-For-Team-Bot/1.8 (Linux)",
  };
  static readonly AVAILABLE_GAME_VERSIONS = [
    {
      label: "Odyssey",
      description: "Elite Dangerous Odyssey 4.0",
      value: "odyssey",
    },
    {
      label: "Horizon 4.0",
      description: "Elite Dangerous Horizon 4.0",
      value: "horizon_four_zero",
    },
    {
      label: "Horizon 3.8",
      description: "Elite Dangerous Horizon 3.8",
      value: "horizon_three_eight",
    },
    {
      label: "Beyond",
      description: "Elite Dangerous Beyond",
      value: "beyond",
    },
    {
      label: "Any",
      description: "Any Version of Elite Dangerous",
      value: "any",
    },
  ];
}

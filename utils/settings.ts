export class AppSettings {
  // DEFAULT COMMAND VALUES
  static readonly GAME_NAME = "Elite Dangerous";
  static readonly DEFAULT_STAR_SYSTEM_NAME = "SOL";
  static readonly EMBEDED_MESSAGE_COLOR = 0x0099ff;
  static readonly HOURS_TO_MILISEC = 60 * 60 * 1000; // 3600 seconds
  static readonly HELP_MESSAGE_DISMISS_TIMEOUT = 180 * 1000; // 3 Minutes
  static readonly DEFAULT_REQUEST_TEAM_TIMEOUT = 10 * 60 * 1000; // 10 Minutes
  static readonly DEFAULT_WHEN_VALUE = "Now";
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
  static readonly BOT_WING_DURATION_FIELD_NAME = "Duration";
  static readonly BOT_WING_FIELDS = [
    "What kind of mission/gameplay?",
    "Star System/Location",
    "Number of Space in Wing/Team Available",
    "When to join?",
    "Players Joined",
  ];

  // Interaction commands for the bot.
  static readonly BOT_WING_COMMAND_NAME = "wing";
  static readonly BOT_SYSTEM_FACTION_INFO_COMMAND_NAME = "systemfaction";
  static readonly BOT_SYSTEM_TRAFFIC_COMMAND_NAME = "systemtraffic";
  static readonly BOT_ELITE_SERVER_TICK_INFO = "lastservertick";
  static readonly BOT_SYSTEM_DEATH_COMMAND_NAME = "systemdeath";
  static readonly BOT_HELP_COMMAND_NAME = "winghelp";
  static readonly BOT_PING_COMMAND_NAME = "ping";

  // Interaction field IDs
  static readonly INTERACTION_ACTIVITY_ID = "activity";
  static readonly INTERACTION_LOCATION_ID = "location";
  static readonly INTERACTION_SPOTS_ID = "spots";
  static readonly INTERACTION_DURATION_ID = "duration";
  static readonly INTERACTION_WHEN_ID = "when";
  static readonly INTERACTION_SYSTEM_NAME_ID = "system_name";
  static readonly INTERACTION_DISMISS_ID = "command_dismiss";

  // Interaction field description
  static readonly INTERACTION_SYSTEM_NAME_DESC = "Elite Dangerous System Name";
  static readonly INTERACTION_HELP_DESC = "Need help to use this BOT?";
  static readonly INTERACTION_PING_DESC = "Check if the Bot is up and Running";

  // Buttons customIDs
  static readonly BUTTON_JOIN_ID = "button_join";
  static readonly BUTTON_DISMISS_ID = "button_dismiss";
  static readonly BUTTON_LEAVE_TEAM_ID = "command_leave_team";
  static readonly BUTTON_ACCEPT_REQUEST_ID = "accept_request";
  static readonly BUTTON_REJECT_REQUEST_ID = "reject_request";

  // Button Labels corresponding to CustomIDs.
  static readonly BUTTON_JOIN_LABEL = "Request Team Invite";
  static readonly BUTTON_DISMISS_LABEL = "Delete";
  static readonly BUTTON_LEAVE_TEAM_LABEL = "Leave Team";
  static readonly BUTTON_ACCEPT_REQUEST_LABEL = "Accept Request";
  static readonly BUTTON_REQUEST_REQUEST_LABEL = "Decline/Cancel Request";

  // API Urls
  static readonly BOT_SYSTEM_INFO_FETCH_URL =
    "https://www.edsm.net/api-system-v1/factions";
  static readonly BOT_SYSTEM_DEATHS_INFO_FETCH_URL =
    "https://www.edsm.net/api-system-v1/deaths";
  static readonly BOT_SYSTEM_TRAFFIC_FETCH_URL =
    "https://www.edsm.net/api-system-v1/traffic";
  static readonly BOT_ELITE_SERVER_FETCH_URL =
    "https://www.edsm.net/api-status-v1/elite-server";

  // Headers for API Request to Other Websites.
  static readonly BOT_HEADER = {
    "Content-Type": "application/json",
    "User-Agent": "Looking-For-Team-Bot/1.8 (Linux)",
  };
  static readonly SYSTEM_TIMELINE = ["Today", "This Week", "All Time"];

  /// BOT REPLY VALUES
  static readonly BOT_ELITE_SERVER_TICK_INFO_TITLE = "Elite Last Server Tick";
  static readonly BOT_HELP_REPLY_TITLE = "How to use, Check example.";
  static readonly BOT_HELP_REPLY_FOOTER_NOTE =
    "Note: Messages may get delete by dyno";
  static readonly BOT_PING_REPLY = "Bots never sleeps";

  // Available Game Versions or Menu Interaction
  static readonly SELECT_GAME_VERSION_ID = "select_game_version";
  static readonly SELECT_GAME_VERSION_PLACEHOLDER = "Game Version";
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

  // When BOT_HELP_COMMAND_NAME is used.
  // These are the fields of embeded messages sent on reply
  static readonly BOT_HELP_FIELD_TITLE = ["Command"];
  static readonly BOT_HELP_EXTRA_FIELDS = [
    this.BOT_WING_DURATION_FIELD_NAME,
    this.SELECT_GAME_VERSION_PLACEHOLDER,
  ];
  static readonly BOT_HELP_COMMAND_REPLY_FIELD_VALUES = [
    `"Use '${this.BOT_WING_COMMAND_NAME}'"`,
    "Odyssey, Horizon 4.0, Horizon 3.8, ED Beyond",
    "Mining, Bounty Hunting, etc...",
    "SOL",
    "2 Spots",
    "25 (25 minutes from now)",
    "YourName\nPlayer1...",
    "1.5 (1 hours and 30 minutes)",
  ];
}

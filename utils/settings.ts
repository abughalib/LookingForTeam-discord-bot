export class AppSettings {
  // DEFAULT COMMAND VALUES
  static readonly GAME_NAME = "Elite Dangerous";
  static readonly DEFAULT_STAR_SYSTEM_NAME = "SOL";
  static readonly HOURS_TO_MILISEC = 60 * 60 * 1000; // 3600 seconds
  static readonly HELP_MESSAGE_DISMISS_TIMEOUT = 180 * 1000; // 3 Minutes
  static readonly ERROR_MESSAGE_DIMISS_TIMEOUT = 60 * 1000; // 1 Minute
  static readonly DEFAULT_REQUEST_TEAM_TIMEOUT = 10 * 60 * 1000; // 10 Minutes
  static readonly DEFAULT_WHEN_VALUE = "Now";
  static readonly MAXIMUM_TEAM_SPOT = 40;
  static readonly MAXIMUM_HOURS_TEAM = 10;
  static readonly MAXIMUM_PEOPLE_INSTANCE = 40;
  static readonly DEFAULT_PC_GAME_VERSION = "Elite Dangerous Odyssey";
  static readonly DEFAULT_CONSOLE_GAME_VERSION = "Elite Dangerous Horizons 3.8";
  static readonly DEFAULT_TEAM_ACTIVITY = "Any";
  static readonly DEFAULT_TEAM_LOCATION = "Anywhere";
  static readonly DEFAULT_SYSTEM_NAME = "SOL";
  static readonly DEFAULT_TEAM_DURATION = 1;
  static readonly DEFAULT_GAME_MODE = "Open Play";
  static readonly INVALID_DURATION_MESSAGE =
    "Duration should not exceed 10 hours";
  static readonly PC_WING_REQUEST_INTERACTION_TITLE = "PC Team + Wing Request";
  static readonly XBOX_WING_REQUEST_INTERACTION_TITLE = "XBOX Wing Request";
  static readonly PS_WING_REQUEST_INTERACTION_TITLE =
    "Play Station Wing Request";
  static readonly BOT_WING_DURATION_FIELD_NAME = "Team Until";
  static readonly BOT_WING_ADDITIONAL_FIELD_NAME = "Additional Info";
  static readonly BOT_WING_FIELDS = [
    "Game Platform",
    "Game Version",
    "What kind of mission/gameplay?",
    "Star System/Location",
    "Number of Space in Wing/Team Available",
    "Game Mode",
    "When to join?",
    "Players Joined",
  ];

  // Interaction commands for the bot.
  static readonly BOT_WING_COMMAND_NAME = "wing";
  static readonly BOT_SYSTEM_FACTION_INFO_COMMAND_NAME = "systemfaction";
  static readonly BOT_SYSTEM_FACTION_HISTORY_COMMAND_NAME = "factionhistory";
  static readonly BOT_SYSTEM_TRAFFIC_COMMAND_NAME = "systemtraffic";
  static readonly BOT_ELITE_SERVER_TICK_INFO = "lastservertick";
  static readonly BOT_SYSTEM_DEATH_COMMAND_NAME = "systemdeath";
  static readonly BOT_HELP_COMMAND_NAME = "winghelp";
  static readonly BOT_PING_COMMAND_NAME = "ping";
  static readonly BOT_COLONIZATION_ADD_COMMAND_NAME = "colonization_add";
  static readonly BOT_COLONIZATION_REMOVE_COMMAND_NAME = "colonization_remove";
  static readonly INTERACTION_COLONIZATION_LIST_COMMAND_NAME =
    "colonization_list";
  static readonly BOT_COLONIZATION_PROGRESS_COMMAND_NAME =
    "colonization_progress";
  static readonly BOT_COLONIZATION_HELP_COMMAND_NAME = "colonization_help";
  static readonly BOT_COLONIZATION_UPDATE_PROGRESS_COMMAND_NAME =
    "colonization_update_progress";

  // Interaction field IDs
  static readonly INTERACTION_GAME_VERSION_ID = "game_version";
  static readonly INTERACTION_GAME_MODE_ID = "game_mode";
  static readonly INTERACTION_ACTIVITY_ID = "activity";
  static readonly INTERACTION_LOCATION_ID = "location";
  static readonly INTERACTION_SPOTS_ID = "spots";
  static readonly INTERACTION_DURATION_ID = "duration";
  static readonly INTERACTION_PLAYFORM_ID = "platform";
  static readonly INTERACTION_WHEN_ID = "when";
  static readonly INTERACTION_DAY_NAME_ID = "day";
  static readonly INTERACTION_SYSTEM_NAME_ID = "system_name";
  static readonly INTERACTION_DISMISS_ID = "command_dismiss";
  static readonly INTERACTION_EXTRA_ID = "extra";
  static readonly INTERACTION_COLONIZATION_SYSTEM_NAME_ID = "system_name";
  static readonly INTERACTION_COLONIZATION_ARCHITECT_ID = "architect";
  static readonly INTERACTION_COLONIZATION_STARPORT_TYPE_ID = "starport_type";
  static readonly INTERACTION_COLONIZATION_IS_PRIMARY_PORT_ID =
    "is_primary_port";
  static readonly INTERACTION_COLONIZATION_SRV_SURVEY_LINK_ID =
    "srv_survey_link";
  static readonly INTERACTION_COLONIZATION_PROJECT_NAME_ID = "project_name";
  static readonly INTERACTION_COLONIZATION_PROGRESS_ID = "progress";
  static readonly INTERACTION_COLONIZATION_NOTES_ID = "notes";
  static readonly INTERACTION_COLONIZATION_TIMELEFT_ID = "timeleft";
  static readonly INTERACTION_COLONIZATION_REFERENCE_SYSTEM_ID = "ref_sys";
  static readonly INTERACTION_COLONIZATION_PARTICIPATE_COMMAND_NAME =
    "colonization_join";
  static readonly INTERACTION_COLONIZATION_PROGRESS_COMMAND_NAME =
    "colonization_progress";
  static readonly INTERACTION_COLONIZATION_HELP_COMMAND_NAME =
    "colonization_help";
  static readonly INTERACTION_COLONIZATION_UPDATE_PROGRESS_COMMAND_NAME =
    "colonization_update_progress";

  // Interaction field description
  static readonly INTERACTION_GAME_VERSION_DESCRIPTION =
    "Game Version (odyssey, Horizon, ...)";
  static readonly INTERACTION_GAME_MODE_DESCRIPTION =
    "Game Mode (Open, Private Group)";
  static readonly INTERACTION_FACTION_HISTROY_DESC =
    "Get the faction history for a system";
  static readonly INTERACTION_SYSTEM_NAME_DESC = "Elite Dangerous System Name";
  static readonly INTERACTION_HELP_DESC = "Need help to use this BOT?";
  static readonly INTERACTION_PING_DESC = "Check if the Bot is up and Running";
  static readonly INTERACTION_DAY_DESC =
    "The day to get the faction history for";
  static readonly INTERACTION_ARCHITECT_DESC = "Name of the System Architect";
  static readonly INTERACTION_STARPORT_TYPE_DESC =
    "Starport type (Coriolis, Ocellus, ...)";
  static readonly INTERACTION_IS_PRIMARY_PORT_DESC =
    "Is it the primary starport of the system?";
  static readonly INTERACTION_SRV_SURVEY_LINK_DESC =
    "Link to the SRV Survey (if any)";
  static readonly INTERACTION_PROJECT_NAME_DESC =
    "Name of the colonization project";
  static readonly INTERACTION_PROGRESS_DESC =
    "Progress of the colonization (in %)";
  static readonly INTERACTION_NOTES_DESC =
    "Additional notes about the colonization";

  static readonly INTERACTION_COLONIZATION_TIMELEFT_DESC =
    "Time left to complete the colonization (week, days, hours), i.e 3w, 2d, 5h, default 3weeks";
  static readonly INTERACTION_COLONIZATION_PROJECT_NAME_DESC =
    "Name of the colonization project (give it anyname you want, no spaces)";
  static readonly INTERACTION_COLONIZATION_ARCHITECT_DESC =
    "Name of the System Architect (in-game name)";
  static readonly INTERACTION_COLONIZATION_IS_PRIMARY_PORT_DESC =
    "Is it the primary starport of the system?";
  static readonly INTERACTION_COLONIZATION_PROGRESS_DESC =
    "Progress of the colonization (in %)";
  static readonly INTERACTION_COLONIZATION_NOTES_DESC =
    "Additional notes about the colonization (optional)";
  static readonly INTERACTION_COLONIZATION_REFERENCE_SYSTEM_NAME_DESC =
    "Reference System Name to filter the colonization projects";
  static readonly INTERACTION_COLONIZATION_STARPORT_TYPE_DESC =
    "Starport type (Coriolis, Ocellus, ...)";
  static readonly INTERACTION_COLONIZATION_REFERENCE_SYSTEM_DESC =
    "Reference System Name to filter the colonization projects";

  // Embed colors
  static readonly DEFAULT_EMBED_COLOR = 0xb3b3b3; // Grey
  static readonly EMBED_PC_COLOR = 0xff0000; // Red
  static readonly EMBED_PS_COLOR = 0x0066ff; // Blue
  static readonly EMBED_XBOX_COLOR = 0x00ff00; // Green

  // Platform values
  static readonly DEFAULT_PLATFORM = "pc";
  static readonly XBOX_PLATFORM = "xbox";
  static readonly PS_PLATFORM = "ps";

  static readonly INTERACTION_PLATFORM_CHOICES: Array<
    InteractionChoices<string>
  > = [
    {
      name: "PC",
      value: this.DEFAULT_PLATFORM,
    },
    {
      name: "XBOX",
      value: this.XBOX_PLATFORM,
    },
    {
      name: "Play Station",
      value: this.PS_PLATFORM,
    },
  ];
  // Interaction field choices
  static readonly INTERACTION_GAME_VERSION_CHOICES: Array<
    InteractionChoices<string>
  > = [
    {
      name: "Elite Dangerous Odyssey",
      value: "odyssey",
    },
    {
      name: "Elite Dangerous Horizon 4.0",
      value: "horizon_four_zero",
    },
    {
      name: "Elite Dangerous Horizon 3.8",
      value: "horizon_three_eight",
    },
    {
      name: "Elite Dangerous Beyond",
      value: "beyond",
    },
    {
      name: "Elite Dangerous any",
      value: "any",
    },
  ];

  // Odyssey specific activities
  static readonly ODYSSEY_SPECIFIC_ACTIVITY: Array<string> = [
    "cz_g",
    "ground_stuffs",
  ];

  static readonly INTERACTION_ACTIVITY_CHOICES: Array<
    InteractionChoices<string>
  > = [
    {
      name: "Xeno Hunting",
      value: "xeno_hunting",
    },
    {
      name: "AX Conflict Zone",
      value: "ax_conflict_zone",
    },
    {
      name: "Bounty Hunting",
      value: "bounty_hunting",
    },
    {
      name: "Conflict Zone (Space)",
      value: "cz_s",
    },
    {
      name: "Conflict Zone (Ground)",
      value: "cz_g",
    },
    {
      name: "Ground Stuffs",
      value: "ground_stuffs",
    },
    {
      name: "Trading",
      value: "trading",
    },
    {
      name: "Mining",
      value: "mining",
    },
    {
      name: "Community Goal",
      value: "cg",
    },
    {
      name: "PVP",
      value: "pvp",
    },
    {
      name: "Smuggling",
      value: "smuggling",
    },
    {
      name: "Exploration",
      value: "exploration",
    },
    {
      name: "CQC",
      value: "cqc",
    },
    {
      name: "Help",
      value: "help",
    },
    {
      name: "Any",
      value: "any",
    },
  ];
  static readonly INTERACTION_GAME_MODE_CHOICES: Array<
    InteractionChoices<string>
  > = [
    {
      name: "Open Play",
      value: "open_play",
    },
    {
      name: "Fatherhood PG",
      value: "tf_pg",
    },
    {
      name: "Anti-Xeno Initiative",
      value: "axin_pg",
    },
    {
      name: "My PG",
      value: "own_pg",
    },
  ];

  static readonly INTERACTION_SPOTS_CHOICES: Array<InteractionChoices<number>> =
    [
      {
        name: "Infinite",
        value: 40,
      },
      {
        name: "8",
        value: 8,
      },
      {
        name: "7",
        value: 7,
      },
      {
        name: "6",
        value: 6,
      },
      {
        name: "5",
        value: 5,
      },
      {
        name: "4",
        value: 4,
      },
      {
        name: "3",
        value: 3,
      },
      {
        name: "2",
        value: 2,
      },
      {
        name: "1",
        value: 1,
      },
    ];

  static readonly INTERACTION_COLONIZATION_STARPORT_TYPE_CHOICES = [
    { name: "Coriolis", value: "Coriolis" },
    { name: "Ocellus", value: "Ocellus" },
    { name: "Orbis", value: "Orbis" },
    { name: "Outpost", value: "Outpost" },
    { name: "Planetary Port", value: "Planetary Port" },
    { name: "Asteroid Base", value: "Asteroid Base" },
    { name: "Installation", value: "Installation" },
  ];

  // Buttons customIDs
  static readonly BUTTON_JOIN_ID = "button_join";
  static readonly BUTTON_DISMISS_ID = "button_dismiss";
  static readonly BUTTON_LEAVE_TEAM_ID = "command_leave_team";
  static readonly BUTTON_ACCEPT_REQUEST_ID = "accept_request";
  static readonly BUTTON_REJECT_REQUEST_ID = "reject_request";
  static readonly BUTTON_DELETE_ACCEPT_MESSAGE = "delete_accept_message";
  static readonly BUTTON_NEXT_COLONIZATION_LIST_ID = "next_colonization_list";

  // Button Labels corresponding to CustomIDs.
  static readonly BUTTON_JOIN_LABEL = "Request Team Invite";
  static readonly BUTTON_DELETE_LABEL = "Delete";
  static readonly BUTTON_DISMISS_LABEL = "Dismiss";
  static readonly BUTTON_LEAVE_TEAM_LABEL = "Leave Team";
  static readonly BUTTON_ACCEPT_REQUEST_LABEL = "Accept Request";
  static readonly BUTTON_REQUEST_REQUEST_LABEL = "Decline/Cancel Request";
  static readonly BUTTON_DELETE_ACCEPT_MESSAGE_LABEL = "Delete Message";
  static readonly BUTTON_NEXT_COLONIZATION_LIST_LABEL = "Next";

  // API Urls
  static readonly BOT_SYSTEM_FACTION_FETCH_URL =
    "https://www.edsm.net/api-system-v1/factions";
  static readonly BOT_SYSTEM_DEATHS_INFO_FETCH_URL =
    "https://www.edsm.net/api-system-v1/deaths";
  static readonly BOT_SYSTEM_TRAFFIC_FETCH_URL =
    "https://www.edsm.net/api-system-v1/traffic";
  static readonly BOT_ELITE_SERVER_FETCH_URL =
    "https://www.edsm.net/api-status-v1/elite-server";
  static readonly BOT_SYSTEM_INFO_FETCH_URL =
    "https://www.edsm.net/api-v1/system";

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

  // Available Game Versions
  static readonly ELITE_DANGEROUS_ODYSSEY = "odyssey";
  static readonly ELITE_DANGEROUS_HORIZON_4_0 = "horizon_four_zero";
  static readonly ELITE_DANGEROUS_HORIZON_3_8 = "horizon_three_eight";
  static readonly ELITE_DANGEROUS_BEYOND = "beyond";
  static readonly ELITE_DANGEROUS_ANY = "any";

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
  static readonly BOT_HELP_EXTRA_FIELDS = [this.BOT_WING_DURATION_FIELD_NAME];
  static readonly BOT_HELP_COMMAND_REPLY_FIELD_VALUES = [
    `Use **/${this.BOT_WING_COMMAND_NAME}**`,
    "PC, PS, XBOX",
    "Odyssey, Horizon 4.0, Horizon 3.8, ED Beyond",
    "Mining, Bounty Hunting, etc...",
    "SOL",
    "2 Spots",
    "Open Play or Private Group",
    "25 (25 minutes from now)",
    "YourName\nPlayer1...",
    "1.5 (1 hours and 30 minutes)",
  ];
}

interface InteractionChoices<T> {
  name: string;
  value: T;
}

export type { InteractionChoices };

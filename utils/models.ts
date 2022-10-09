interface SystemDeath {
  id: number;
  id64: number;
  name: string;
  deaths: Traffic;
}

interface ServerStatusModel {
  lastUpdate: string;
  type: string;
  message: string;
  status: 2;
}

interface SystemTrafficInfo {
  id: number;
  id64: number;
  name: string;
  url: string;
  discovery: Discovery | null;
  traffic: Traffic | null;
  breakdown: Breakdown | null;
}

interface Discovery {
  commander: string;
  date: string;
}

interface Traffic {
  total: number;
  week: number;
  day: number;
}

interface Breakdown {
  Addar: number | null;
  Anaconda: number | null;
  "Asp Explorer": number | null;
  "Beluga Liner": number | null;
  "Cobra MkIII": number | null;
  "Diamondback Explorer": number | null;
  Dolphin: number | null;
  "Federal Assault Ship": number | null;
  "Federal Corvette": number | null;
  "Federal Gunship": number | null;
  "Fer-de-Lance": number | null;
  Hauler: number | null;
  "Imperial Clipper": number | null;
  "Imperial Courier": number | null;
  "Imperial Cutter": number | null;
  Orca: number | null;
  Python: number | null;
  "Type-9 Heavy": number | null;
  "Viper MkIII": number | null;
  "Viper MkIV": number | null;
  Vulture: number | null;
}

interface TickHistory {
  _id: string;
  __v: number;
  time: string;
  updated_at: string;
}

interface TickInfo {
  _id: string;
  time: string;
  updated_at: string;
  __v: number;
  history: TickHistory[] | null;
}

export { ServerStatusModel, SystemTrafficInfo, SystemDeath, TickInfo };

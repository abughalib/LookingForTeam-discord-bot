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
  breakdown: { [key: string]: number } | null;
}

interface SystemInfo {
  name: string;
  coords: {
    x: number;
    y: number;
    z: number;
  };
  coordsLocked: boolean;
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

interface Position {
  x: number;
  y: number;
  z: number;
}

export {
  ServerStatusModel,
  SystemTrafficInfo,
  SystemDeath,
  TickInfo,
  Position,
  SystemInfo,
};

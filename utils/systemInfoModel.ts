interface Factions {
  id: number;
  name: string;
  allegiance: string;
  government: string;
  influence: number;
  state: string;
  activeStates: string;
  recoveringStates: string;
  happiness: string;
  isPlayer: false;
  lastUpdate: number;
}

interface SystemInfo {
  id: string;
  id64: string;
  name: string;
  url: string;
  controllingFaction: {
    id: number;
    name: string;
    allegiance: string;
    government: string;
  };
  factions: Factions[];
}

export default SystemInfo;

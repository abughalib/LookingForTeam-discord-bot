export interface ColonizationData {
  id: number;
  projectName: string;
  systemName: string;
  timeLeft: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  architect: string;
  progress: number;
  starPortType: string;
  isPrimaryPort: boolean;
  srv_survey_link: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  addedBy: string;
  notes?: string;
  participants: Participants[];
}

interface Participants {
  id: number;
  colonizationDataId: number;
  username: string;
  role: string;
  joinedAt: Date;
}

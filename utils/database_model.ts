export interface ColonizationData {
  id: number;
  projectName: string;
  systemName: string;
  timeLeft?: number; // Time in seconds
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  architect: string;
  progress?: number;
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

export interface Participants {
  id: number;
  joinedAt: Date;
  userId: string;
  colonizationDataId: number;
}

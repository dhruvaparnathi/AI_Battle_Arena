export interface JudgeResult {
  winner: 'Solution-1' | 'Solution-2' | string;
  reasoning: string;
  solution_1_score?: number;
  solution_2_score?: number;
}

export interface GraphResponse {
  messages: Array<{ content: string; [key: string]: any }>;
  solution_1: string;
  solution_2: string;
  judge: JudgeResult;
}

export interface BattleRecord {
  id: string;
  timestamp: string;
  userPrompt: string;
  data: GraphResponse;
}

export interface ModelMetadata {
  name: string;
  provider: string;
  badgeColor: string;
  avatarBg: string;
  textColor: string;
  description: string;
}

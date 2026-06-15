export type GameModeKey =
  | "classic"
  | "fast"
  | "family"
  | "kazakh"
  | "russian"
  | "english"
  | "mixed";

export type GamePhase = "setup" | "playing" | "results" | "final";

export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export type Answers = Record<string, Record<string, string>>;

export type RoundScores = Record<string, Record<string, number>>;

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentLetter: string;
  modeKey: GameModeKey;
  currentCategories: string[];
  nextCategories: string[];
  currentPlayerId: string | null;
  categoryChooserId: string | null;
  currentAnswers: Answers;
  roundStopped: boolean;
  stoppedByPlayerId: string | null;
  roundScores: RoundScores;
}

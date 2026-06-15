import type { Player, Answers, RoundScores } from "@/types/game";

export function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

export function isAnswerValidForLetter(answer: string, letter: string): boolean {
  const normalized = normalizeAnswer(answer);
  if (!normalized) return false;
  return normalized.startsWith(letter.toLowerCase());
}

interface ScoreInput {
  playerId: string;
  answer: string;
}

function calculateCategoryScores(
  inputs: ScoreInput[],
  letter: string,
  stoppedByPlayerId: string | null
): { playerId: string; score: number }[] {
  const processed = inputs.map((input) => ({
    playerId: input.playerId,
    normalized: normalizeAnswer(input.answer),
    isValid: isAnswerValidForLetter(input.answer, letter),
  }));

  const stopEntry = stoppedByPlayerId
    ? processed.find((p) => p.playerId === stoppedByPlayerId)
    : null;
  const stopAnswer = stopEntry?.isValid ? stopEntry.normalized : null;

  return processed.map((entry) => {
    if (!entry.isValid) return { playerId: entry.playerId, score: 0 };

    // STOP player always gets 20 points for a valid answer
    if (entry.playerId === stoppedByPlayerId) {
      return { playerId: entry.playerId, score: 20 };
    }

    // Non-STOP player wrote the same as STOP player → 0 points
    if (stopAnswer && entry.normalized === stopAnswer) {
      return { playerId: entry.playerId, score: 0 };
    }

    // Count non-STOP players with the same valid answer (that didn't match STOP player)
    const sameAnswerCount = processed.filter(
      (other) =>
        other.playerId !== stoppedByPlayerId &&
        other.isValid &&
        other.normalized === entry.normalized &&
        !(stopAnswer && other.normalized === stopAnswer)
    ).length;

    const score = Math.round((20 / sameAnswerCount) * 10) / 10;
    return { playerId: entry.playerId, score };
  });
}

export function calculateScores(
  players: Pick<Player, "id">[],
  categories: string[],
  answers: Answers,
  letter: string,
  stoppedByPlayerId: string | null
): RoundScores {
  const scores: RoundScores = {};

  for (const player of players) {
    scores[player.id] = {};
    for (const category of categories) {
      scores[player.id][category] = 0;
    }
  }

  for (const category of categories) {
    const inputs: ScoreInput[] = players.map((player) => ({
      playerId: player.id,
      answer: answers[player.id]?.[category] ?? "",
    }));

    const results = calculateCategoryScores(inputs, letter, stoppedByPlayerId);
    for (const result of results) {
      scores[result.playerId][category] = result.score;
    }
  }

  return scores;
}

export function getRoundTotal(scores: Record<string, number>): number {
  return Object.values(scores).reduce((sum, s) => sum + s, 0);
}

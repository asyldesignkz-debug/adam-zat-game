"use client";

import { useState, useCallback } from "react";
import type { GameState, Player, GameModeKey } from "@/types/game";
import { ALL_CATEGORIES } from "@/lib/categories";
import { getRandomLetter } from "@/lib/letters";
import { calculateScores, getRoundTotal } from "@/lib/gameRules";
import { GAME_MODES, DEFAULT_MODE_KEY } from "@/lib/gameModes";
import PlayerSetup from "@/components/PlayerSetup";
import GameBoard from "@/components/GameBoard";
import ScoreTable from "@/components/ScoreTable";
import FinalResults from "@/components/FinalResults";

function buildEmptyAnswers(players: Player[], categories: string[]): GameState["currentAnswers"] {
  const answers: GameState["currentAnswers"] = {};
  for (const player of players) {
    answers[player.id] = {};
    for (const category of categories) {
      answers[player.id][category] = "";
    }
  }
  return answers;
}

function getNextCategoryChooserId(
  players: Player[],
  scores: GameState["roundScores"],
  stoppedByPlayerId: string | null
): string | null {
  const totals = players.map((player) => ({
    id: player.id,
    total: Object.values(scores[player.id] ?? {}).reduce((sum, value) => sum + value, 0),
  }));

  const maxScore = Math.max(...totals.map((item) => item.total));
  const winners = totals.filter((item) => item.total === maxScore);
  if (winners.length === 0) return null;

  if (stoppedByPlayerId && winners.some((winner) => winner.id === stoppedByPlayerId)) {
    return stoppedByPlayerId;
  }

  return winners[0].id;
}

const INITIAL_STATE: GameState = {
  phase: "setup",
  players: [],
  currentRound: 0,
  totalRounds: 0,
  currentLetter: "",
  modeKey: DEFAULT_MODE_KEY,
  currentCategories: [],
  nextCategories: [],
  currentPlayerId: null,
  categoryChooserId: null,
  currentAnswers: {},
  roundStopped: false,
  stoppedByPlayerId: null,
  roundScores: {},
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const handleStartGame = useCallback(
    (players: Player[], modeKey: GameModeKey, categories: string[]) => {
      const mode = GAME_MODES.find((item) => item.key === modeKey) ?? GAME_MODES[0];
      const letter = getRandomLetter(mode.letters);
      const firstPlayerId = players[0]?.id ?? null;

      setGameState({
        phase: "playing",
        players,
        currentRound: 1,
        totalRounds: mode.totalRounds,
        currentLetter: letter,
        modeKey,
        currentCategories: categories,
        nextCategories: categories,
        currentPlayerId: firstPlayerId,
        categoryChooserId: firstPlayerId,
        currentAnswers: buildEmptyAnswers(players, categories),
        roundStopped: false,
        stoppedByPlayerId: null,
        roundScores: {},
      });
    },
    []
  );

  const handleAnswerChange = useCallback(
    (playerId: string, category: string, answer: string) => {
      setGameState((prev) => {
        if (prev.roundStopped) return prev;
        return {
          ...prev,
          currentAnswers: {
            ...prev.currentAnswers,
            [playerId]: {
              ...prev.currentAnswers[playerId],
              [category]: answer,
            },
          },
        };
      });
    },
    []
  );

  const handleStop = useCallback((stoppedByPlayerId: string) => {
    setGameState((prev) => {
      if (prev.roundStopped) return prev;

      const scores = calculateScores(
        prev.players,
        prev.currentCategories,
        prev.currentAnswers,
        prev.currentLetter,
        stoppedByPlayerId
      );

      const updatedPlayers = prev.players.map((player) => ({
        ...player,
        totalScore:
          player.totalScore + getRoundTotal(scores[player.id] ?? {}),
      }));

      return {
        ...prev,
        players: updatedPlayers,
        roundStopped: true,
        stoppedByPlayerId,
        roundScores: scores,
        categoryChooserId: getNextCategoryChooserId(prev.players, scores, stoppedByPlayerId),
        phase: "results",
      };
    });
  }, []);

  const handleNextRound = useCallback(() => {
    setGameState((prev) => {
      if (prev.currentRound >= prev.totalRounds) {
        return { ...prev, phase: "final" };
      }
      const mode = GAME_MODES.find((item) => item.key === prev.modeKey) ?? GAME_MODES[0];
      const newLetter = getRandomLetter(mode.letters, prev.currentLetter);
      return {
        ...prev,
        phase: "playing",
        currentRound: prev.currentRound + 1,
        currentLetter: newLetter,
        currentCategories: prev.nextCategories,
        currentAnswers: buildEmptyAnswers(prev.players, prev.nextCategories),
        roundStopped: false,
        stoppedByPlayerId: null,
        roundScores: {},
        currentPlayerId: prev.categoryChooserId ?? prev.currentPlayerId,
      };
    });
  }, []);

  const handleToggleNextCategory = useCallback((category: string) => {
    setGameState((prev) => {
      const currentSet = prev.nextCategories;
      const hasCategory = currentSet.includes(category);
      if (hasCategory) {
        return {
          ...prev,
          nextCategories: currentSet.filter((item) => item !== category),
        };
      }
      if (currentSet.length >= 15) return prev;
      return {
        ...prev,
        nextCategories: [...currentSet, category],
      };
    });
  }, []);

  const handleSelectCurrentPlayer = useCallback((playerId: string) => {
    setGameState((prev) => ({ ...prev, currentPlayerId: playerId }));
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameState(INITIAL_STATE);
  }, []);

  switch (gameState.phase) {
    case "setup":
      return (
        <PlayerSetup
          onStartGame={handleStartGame}
          availableCategories={ALL_CATEGORIES}
          gameModes={GAME_MODES}
        />
      );

    case "playing":
      return (
        <GameBoard
          gameState={gameState}
          onAnswerChange={handleAnswerChange}
          onStop={handleStop}
          onSelectPlayer={handleSelectCurrentPlayer}
        />
      );

    case "results":
      return (
        <ScoreTable
          gameState={gameState}
          availableCategories={ALL_CATEGORIES}
          onToggleCategory={handleToggleNextCategory}
          onNextRound={handleNextRound}
        />
      );

    case "final":
      return (
        <FinalResults
          players={gameState.players}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return null;
  }
}

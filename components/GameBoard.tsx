"use client";

import { useState, useEffect } from "react";
import type { GameState } from "@/types/game";
import PlayerCard, { type PlayerCardColors } from "./PlayerCard";

interface Props {
  gameState: GameState;
  onAnswerChange: (playerId: string, category: string, answer: string) => void;
  onStop: (playerId: string) => void;
  onSelectPlayer: (playerId: string) => void;
}

const PLAYER_COLORS: PlayerCardColors[] = [
  {
    header: "bg-blue-500",
    light: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-400",
  },
  {
    header: "bg-green-500",
    light: "bg-green-50",
    border: "border-green-200",
    ring: "ring-green-400",
  },
  {
    header: "bg-violet-500",
    light: "bg-violet-50",
    border: "border-violet-200",
    ring: "ring-violet-400",
  },
  {
    header: "bg-orange-500",
    light: "bg-orange-50",
    border: "border-orange-200",
    ring: "ring-orange-400",
  },
  {
    header: "bg-pink-500",
    light: "bg-pink-50",
    border: "border-pink-200",
    ring: "ring-pink-400",
  },
  {
    header: "bg-teal-500",
    light: "bg-teal-50",
    border: "border-teal-200",
    ring: "ring-teal-400",
  },
];

export default function GameBoard({
  gameState,
  onAnswerChange,
  onStop,
  onSelectPlayer,
}: Props) {
  const {
    players,
    currentLetter,
    currentRound,
    totalRounds,
    roundStopped,
    stoppedByPlayerId,
    currentAnswers,
    currentPlayerId,
    modeKey,
  } = gameState;

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const timerSeconds = (() => {
    const modeTimers: Record<string, number | undefined> = {
      fast: 60,
      classic: undefined,
      family: undefined,
      kazakh: undefined,
      russian: undefined,
      english: undefined,
      mixed: undefined,
    };
    return modeTimers[modeKey];
  })();

  useEffect(() => {
    if (!timerSeconds || roundStopped) {
      setSecondsLeft(null);
      return;
    }

    setSecondsLeft(timerSeconds);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          onStop("timer");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerSeconds, roundStopped, onStop]);

  const stopPlayerName =
    stoppedByPlayerId === "timer"
      ? "Таймер"
      : players.find((p) => p.id === stoppedByPlayerId)?.name;

  const gridClass =
    players.length <= 2
      ? "grid-cols-1 sm:grid-cols-2"
      : players.length <= 4
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="min-h-screen p-4 pb-8 bg-gradient-to-b from-sky-300 via-cyan-200 to-lime-100">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 rounded-[2rem] bg-white/90 px-5 py-3 shadow-2xl border border-white/80">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Раунд</span>
              <span className="text-lg font-black text-slate-900">{currentRound}/{totalRounds}</span>
            </div>
            <div className="inline-flex items-center gap-3 rounded-[2rem] bg-white/90 px-5 py-3 shadow-2xl border border-white/80">
              <span className="pill-chip">{players.length} ойыншы</span>
            </div>
          </div>

          <div className="bg-white/90 rounded-[2rem] shadow-2xl p-4 flex flex-col gap-3 border border-white/70">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              Қай ойыншы ойнап жатыр?
            </label>
            <select
              value={currentPlayerId ?? players[0]?.id ?? ""}
              onChange={(e) => onSelectPlayer(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-semibold focus:border-blue-600 focus:outline-none"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center">
            <div className="inline-block card px-10 py-6 border border-white/80 bg-white/95">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Әріп</p>
              <p className="text-8xl font-black text-sky-600 leading-none">{currentLetter}</p>
              {timerSeconds && secondsLeft !== null && !roundStopped && (
                <div className="mt-4 rounded-3xl bg-gradient-to-r from-cyan-400 to-lime-400 text-white px-5 py-3 text-2xl font-black shadow-xl">
              </div>
            )}
          </div>
        </div>

        {roundStopped && stopPlayerName && (
          <div className="text-center">
            <div className="inline-block rounded-3xl bg-red-500 px-8 py-4 text-white shadow-lg">
              <p className="font-black text-lg">⚡ STOP! — {stopPlayerName} тоқтатты</p>
            </div>
          </div>
        )}

        <div className={`grid gap-4 ${gridClass}`}>
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              categories={gameState.currentCategories}
              answers={currentAnswers[player.id] ?? {}}
              letter={currentLetter}
              roundStopped={roundStopped}
              isStopPlayer={stoppedByPlayerId === player.id}
              isSelectedView={player.id === currentPlayerId}
              colors={PLAYER_COLORS[index % PLAYER_COLORS.length]}
              onAnswerChange={(category, answer) => onAnswerChange(player.id, category, answer)}
              onStop={() => onStop(player.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

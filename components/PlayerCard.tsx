"use client";

import type { Player } from "@/types/game";

export interface PlayerCardColors {
  header: string;
  light: string;
  border: string;
  ring: string;
}

interface Props {
  player: Player;
  categories: string[];
  answers: Record<string, string>;
  letter: string;
  roundStopped: boolean;
  isStopPlayer: boolean;
  isSelectedView: boolean;
  colors: PlayerCardColors;
  onAnswerChange: (category: string, answer: string) => void;
  onStop: () => void;
}

export default function PlayerCard({
  player,
  categories,
  answers,
  letter,
  roundStopped,
  isStopPlayer,
  isSelectedView,
  colors,
  onAnswerChange,
  onStop,
}: Props) {
  const filledCount = categories.filter((cat) => answers[cat]?.trim()).length;
  const allFilled = filledCount === categories.length;

  if (!isSelectedView) {
    return (
      <div className={`bg-white/95 rounded-[2rem] shadow-2xl overflow-hidden border-2 ${colors.border}`}>
        <div className={`${colors.header} px-4 py-4 flex items-center justify-between`}>
          <span className="text-white font-black text-lg truncate max-w-[140px]">{player.name}</span>
          <div className="text-white text-sm font-bold opacity-90">{player.totalScore} ұп.</div>
        </div>
        <div className={`p-4 ${colors.light}`}>
          <p className="text-sm font-semibold text-gray-600">Жауаптары жасырын</p>
          <div className="mt-4 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: `${(filledCount / categories.length) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">{filledCount}/{categories.length} толтырды</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card border-2 ${colors.border} ${isStopPlayer ? `ring-4 ${colors.ring}` : ""}`}>
      <div className={`${colors.header} px-4 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-lg truncate max-w-[140px]">{player.name}</span>
          {isStopPlayer && (
            <span className="bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded-full shrink-0">⚡ STOP!</span>
          )}
        </div>
        <div className="text-white text-sm font-bold opacity-90 shrink-0">{player.totalScore} ұп.</div>
      </div>

      <div className={`p-3 ${colors.light}`}>
        <div className="space-y-1.5">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 w-20 shrink-0 text-right">{category}</label>
              <input
                type="text"
                value={answers[category] ?? ""}
                onChange={(e) => onAnswerChange(category, e.target.value)}
                disabled={roundStopped}
                placeholder={`${letter}...`}
                autoComplete="off"
                spellCheck={false}
                className={`flex-1 border-2 rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none transition-colors min-w-0
                  ${
                    roundStopped
                      ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                      : answers[category]?.trim()
                      ? "border-green-300 bg-green-50 focus:border-green-400"
                      : "border-gray-200 bg-white focus:border-blue-400"
                  }`}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {!roundStopped && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${(filledCount / categories.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-semibold shrink-0">{filledCount}/{categories.length}</span>
            </div>
          )}

          <button
            onClick={onStop}
            disabled={!allFilled || roundStopped}
            className={`btn-stop ${!allFilled || roundStopped ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {roundStopped ? (isStopPlayer ? "✓ STOP!" : "Тоқтатылды") : allFilled ? "⚡ STOP!" : "STOP"}
          </button>
        </div>
      </div>
    </div>
  );
}

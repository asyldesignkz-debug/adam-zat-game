"use client";

import type { Player } from "@/types/game";

interface Props {
  players: Player[];
  onPlayAgain: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_STYLES = [
  "bg-yellow-100 border-2 border-yellow-400",
  "bg-gray-100 border-2 border-gray-300",
  "bg-orange-50 border-2 border-orange-300",
];

export default function FinalResults({ players, onPlayAgain }: Props) {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-10 bg-gradient-to-b from-sky-300 via-cyan-200 to-lime-100">
      {/* Trophy */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-3">🏆</div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-500 mb-1 drop-shadow-lg">
          Ойын аяқталды!
        </h1>
        <p className="text-2xl font-black text-emerald-600">
          {winner.name} жеңді!
        </p>
        <p className="text-base text-slate-500 mt-1 font-semibold">
          {winner.totalScore} ұпаймен
        </p>
      </div>

      {/* Podium - Top 3 */}
      {sorted.length >= 2 && (
        <div className="flex items-end justify-center gap-3 mb-8 w-full max-w-sm">
          {/* 2nd place */}
          {sorted[1] && (
            <div className="flex-1 text-center">
              <div className="text-3xl mb-2">🥈</div>
              <div className="bg-gray-200 rounded-t-2xl h-16 flex items-end justify-center pb-2">
                <span className="font-black text-gray-600 text-lg">2</span>
              </div>
              <div className="bg-white border-2 border-gray-300 rounded-b-2xl px-2 py-2">
                <p className="font-black text-gray-700 text-sm truncate">
                  {sorted[1].name}
                </p>
                <p className="font-black text-gray-500 text-sm">
                  {sorted[1].totalScore}
                </p>
              </div>
            </div>
          )}

          {/* 1st place */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">🥇</div>
            <div className="bg-yellow-400 rounded-t-2xl h-24 flex items-end justify-center pb-2">
              <span className="font-black text-yellow-800 text-xl">1</span>
            </div>
            <div className="bg-white border-2 border-yellow-400 rounded-b-2xl px-2 py-2">
              <p className="font-black text-yellow-700 text-sm truncate">
                {sorted[0].name}
              </p>
              <p className="font-black text-yellow-600 text-sm">
                {sorted[0].totalScore}
              </p>
            </div>
          </div>

          {/* 3rd place */}
          {sorted[2] && (
            <div className="flex-1 text-center">
              <div className="text-3xl mb-2">🥉</div>
              <div className="bg-orange-200 rounded-t-2xl h-10 flex items-end justify-center pb-2">
                <span className="font-black text-orange-700 text-base">3</span>
              </div>
              <div className="bg-white border-2 border-orange-300 rounded-b-2xl px-2 py-2">
                <p className="font-black text-orange-700 text-sm truncate">
                  {sorted[2].name}
                </p>
                <p className="font-black text-orange-500 text-sm">
                  {sorted[2].totalScore}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Rankings */}
      <div className="bg-white rounded-3xl shadow-xl p-5 w-full max-w-sm mb-8">
        <h2 className="text-base font-black text-gray-700 mb-4 text-center">
          Жалпы рейтинг
        </h2>
        <div className="space-y-2">
          {sorted.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl ${
                RANK_STYLES[index] ?? "bg-gray-50 border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">
                  {MEDALS[index] ?? `${index + 1}.`}
                </span>
                <div>
                  <p className="font-black text-gray-700">{player.name}</p>
                  {index === 0 && (
                    <p className="text-xs font-bold text-yellow-600">
                      🏆 Жеңімпаз!
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-xl text-gray-700">
                  {player.totalScore}
                </p>
                <p className="text-xs text-gray-400">ұпай</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Play Again */}
      <button
        onClick={onPlayAgain}
        className="bg-green-500 hover:bg-green-600 text-white font-black text-xl px-10 py-4 rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
      >
        Қайта ойнау →
      </button>
    </div>
  );
}

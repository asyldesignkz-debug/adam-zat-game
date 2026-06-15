"use client";

import type { GameState } from "@/types/game";
import { normalizeAnswer, isAnswerValidForLetter, getRoundTotal } from "@/lib/gameRules";
import CategorySelector from "./CategorySelector";

interface Props {
  gameState: GameState;
  availableCategories: string[];
  onToggleCategory: (category: string) => void;
  onNextRound: () => void;
}

function getMostRepeatedAnswer(answers: string[]) {
  const counts = new Map<string, number>();
  for (const answer of answers) {
    const normalized = normalizeAnswer(answer);
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  let best: string | null = null;
  let maxCount = 0;
  counts.forEach((count, answer) => {
    if (count > maxCount) {
      maxCount = count;
      best = answer;
    }
  });

  return maxCount > 1 ? best : null;
}

function getUniqueAnswer(answers: string[]) {
  const map = new Map<string, { count: number; original: string }>();
  for (const answer of answers) {
    const normalized = normalizeAnswer(answer);
    if (!normalized) continue;
    const existing = map.get(normalized);
    if (existing) {
      map.set(normalized, { count: existing.count + 1, original: existing.original });
    } else {
      map.set(normalized, { count: 1, original: answer });
    }
  }

  const unique = Array.from(map.values()).filter((item) => item.count === 1);
  if (unique.length === 0) return null;
  return unique[Math.floor(Math.random() * unique.length)].original;
}

export default function ScoreTable({ gameState, availableCategories, onToggleCategory, onNextRound }: Props) {
  const {
    players,
    currentLetter,
    currentRound,
    totalRounds,
    currentAnswers,
    roundScores,
    stoppedByPlayerId,
    currentPlayerId,
    categoryChooserId,
    nextCategories,
    currentCategories,
  } = gameState;

  const isLastRound = currentRound >= totalRounds;
  const stopPlayerName = stoppedByPlayerId === "timer" ? "Таймер" : players.find((p) => p.id === stoppedByPlayerId)?.name;
  const chooserName = players.find((p) => p.id === categoryChooserId)?.name ?? "—";
  const isChooser = currentPlayerId === categoryChooserId;
  const canProceed = nextCategories.length >= 5;

  const allAnswers = players.flatMap((player) =>
    currentCategories.map((category) => currentAnswers[player.id]?.[category] ?? "")
  );

  const mostRepeated = getMostRepeatedAnswer(allAnswers);
  const uniqueAnswer = getUniqueAnswer(allAnswers);

  const empties = players.map((player) => ({
    player,
    missing: currentCategories.filter((category) => !currentAnswers[player.id]?.[category]?.trim()).length,
  }));
  const maxEmpty = Math.max(...empties.map((item) => item.missing));
  const emptyPlayer = empties.find((item) => item.missing === maxEmpty);

  const sortedByTotal = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="min-h-screen p-4 pb-10 bg-gradient-to-b from-sky-300 via-cyan-200 to-lime-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-4 flex-wrap justify-center">
            <div className="bg-white/95 rounded-[2rem] shadow-2xl px-8 py-5 border border-white/70">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                Раунд {currentRound} нәтижесі | Әріп
              </p>
              <p className="text-6xl font-black text-sky-600 leading-none">{currentLetter}</p>
            </div>
            {stopPlayerName && (
              <div className="bg-red-500 text-white rounded-[1.75rem] px-6 py-3 shadow-2xl border border-red-300/80">
                <p className="font-black text-lg">⚡ STOP!</p>
                <p className="text-sm font-semibold opacity-90">{stopPlayerName}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="bg-white/95 rounded-[2rem] shadow-2xl overflow-hidden border border-white/80">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left font-black sticky left-0 bg-blue-600 z-10">
                      Категория
                    </th>
                    {players.map((player) => (
                      <th
                        key={player.id}
                        className={`px-3 py-3 text-center font-bold min-w-[100px] ${
                          stoppedByPlayerId === player.id ? "bg-red-500" : ""
                        }`}
                      >
                        {player.name}
                        {stoppedByPlayerId === player.id && (
                          <span className="block text-xs font-black">⚡ STOP</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((category, i) => (
                    <tr key={category} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2.5 font-bold text-gray-700 sticky left-0 bg-inherit whitespace-nowrap">
                        {category}
                      </td>
                      {players.map((player) => {
                        const answer = currentAnswers[player.id]?.[category] ?? "";
                        const score = roundScores[player.id]?.[category] ?? 0;
                        const isValid = answer ? isAnswerValidForLetter(answer, currentLetter) : false;

                        return (
                          <td key={player.id} className="px-3 py-2.5 text-center">
                            <div
                              className={`font-semibold text-sm ${
                                !answer
                                  ? "text-gray-300"
                                  : isValid
                                  ? "text-gray-700"
                                  : "text-red-400 line-through"
                              }`}
                            >
                              {answer || "—"}
                            </div>
                            <div className={`text-xs font-black mt-0.5 ${score > 0 ? "text-green-600" : "text-gray-300"}`}>
                              {score > 0 ? `+${score}` : "0"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td className="px-4 py-3 font-black text-blue-700 sticky left-0 bg-blue-50">Раунд ұпайы</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-3 py-3 text-center font-black text-blue-700 text-lg">
                        {getRoundTotal(roundScores[player.id] ?? {})}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-green-50 border-t-2 border-green-200">
                    <td className="px-4 py-3 font-black text-green-700 sticky left-0 bg-green-50">Жалпы ұпай</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-3 py-3 text-center font-black text-green-700 text-lg">
                        {player.totalScore}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/95 rounded-[2rem] shadow-2xl p-6 border border-white/80">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-black mb-3">Келесі раунд</p>
              <p className="text-lg font-black text-slate-900 mb-2">Категория таңдайтын ойыншы</p>
              <p className="text-sm text-slate-600 mb-4">{chooserName}</p>

              {isChooser ? (
                <CategorySelector
                  availableCategories={availableCategories}
                  selectedCategories={nextCategories}
                  onToggleCategory={onToggleCategory}
                  minRequired={5}
                  maxAllowed={15}
                  title="Келесі раунд категориялары"
                  description="Таңдауды сақтап, келесі раундқа дайын болыңыз."
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-5 text-gray-600">
                  <p className="font-bold text-gray-800 mb-2">Қазір {chooserName} категория таңдайды</p>
                  <p className="text-sm leading-relaxed">
                    Ойынды жалғастыру үшін күтіңіз. Қалған категориялар белгіленгенше сіз өз жауаптарыңызды көре алмайсыз.
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="font-semibold mb-2">Таңдалған категориялар:</p>
                    <div className="flex flex-wrap gap-2">
                      {nextCategories.map((category) => (
                        <span key={category} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/95 rounded-[2rem] shadow-2xl p-6 border border-white/80">
              <h3 className="text-lg font-black text-slate-900 mb-4">Раунд қызықтары 😄</h3>
              <div className="space-y-4">
                <div className="stat-card flex items-start gap-3">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <p className="font-bold text-gray-700">Ең жылдам ойыншы</p>
                    <p className="text-sm text-gray-600 mt-1">{stopPlayerName}</p>
                  </div>
                </div>
                <div className="stat-card flex items-start gap-3">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <p className="font-bold text-gray-700">Раунд жеңімпазы</p>
                    <p className="text-sm text-gray-600 mt-1">{sortedByTotal[0]?.name} — {sortedByTotal[0]?.totalScore ?? 0} ұпай</p>
                  </div>
                </div>
                <div className="stat-card flex items-start gap-3">
                  <div className="text-3xl">🔁</div>
                  <div>
                    <p className="font-bold text-gray-700">Ең көп қайталанған жауап</p>
                    <p className="text-sm text-gray-600 mt-1">{mostRepeated ? `Ең көп қайталанған жауап: ${mostRepeated}` : "Қайталанған жауап болған жоқ"}</p>
                  </div>
                </div>
                <div className="stat-card flex items-start gap-3">
                  <div className="text-3xl">💎</div>
                  <div>
                    <p className="font-bold text-gray-700">Ең ерекше жауап</p>
                    <p className="text-sm text-gray-600 mt-1">{uniqueAnswer ? uniqueAnswer : "Бұл раундта бәрі бір-біріне ұқсап кетті 😄"}</p>
                  </div>
                </div>
                <div className="stat-card flex items-start gap-3">
                  <div className="text-3xl">📌</div>
                  <div>
                    <p className="font-bold text-gray-700">Ең бос қалған ойыншы</p>
                    <p className="text-sm text-gray-600 mt-1">{maxEmpty === 0 ? "✅ Барлығы жақсы тырысты!" : `${emptyPlayer?.player.name} — ${emptyPlayer?.missing} бос жауап`}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onNextRound}
            disabled={!canProceed}
            className={`btn-primary ${!canProceed ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLastRound ? "🏆 Финалды көру" : `Раунд ${currentRound + 1} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

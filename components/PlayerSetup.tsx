"use client";

import { useState, type KeyboardEvent } from "react";
import type { Player, GameModeKey } from "@/types/game";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { GAME_MODES, DEFAULT_MODE_KEY } from "@/lib/gameModes";
import CategorySelector from "@/components/CategorySelector";

interface Props {
  onStartGame: (players: Player[], modeKey: GameModeKey, categories: string[]) => void;
  availableCategories: string[];
  gameModes: typeof GAME_MODES;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function PlayerSetup({ onStartGame, availableCategories, gameModes }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputName, setInputName] = useState("");
  const [error, setError] = useState("");
  const [modeKey, setModeKey] = useState<GameModeKey>(DEFAULT_MODE_KEY);
  const defaultCategories =
    gameModes.find((mode) => mode.key === DEFAULT_MODE_KEY)?.suggestedCategories ?? DEFAULT_CATEGORIES.slice(0, 5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultCategories);

  const createUniqueName = (baseName: string) => {
    const normalizedBase = baseName.trim();
    const baseRegex = new RegExp(`^${escapeRegExp(normalizedBase)}(?:\s(\d+))?$`, "i");
    const matching = players.filter((player) => baseRegex.test(player.name));
    if (matching.length === 0) {
      return normalizedBase;
    }
    return `${normalizedBase} ${matching.length + 1}`;
  };

  const addPlayer = () => {
    const trimmed = inputName.trim();
    if (!trimmed) return;
    if (players.length >= 10) {
      setError("Ең көбі 10 ойыншы қосуға болады");
      return;
    }

    const name = createUniqueName(trimmed);
    setPlayers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, totalScore: 0 },
    ]);
    setInputName("");
    setError("");
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((player) => player.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addPlayer();
  };

  const handleModeSelect = (key: GameModeKey) => {
    const selectedMode = gameModes.find((mode) => mode.key === key);
    setModeKey(key);
    if (selectedMode) {
      setSelectedCategories(selectedMode.suggestedCategories.slice(0, 15));
    }
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }
      if (prev.length >= 15) return prev;
      return [...prev, category];
    });
  };

  const canStart = players.length >= 2 && selectedCategories.length >= 5;

  return (
    <div className="min-h-screen p-4 py-10 relative">
      {/* Decorative background elements */}
      <div className="blob-1" />
      <div className="blob-2" />
      <div className="blob-3" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-white/80 bg-gradient-to-br from-white/95 via-sky-50/90 to-cyan-50/90 shadow-2xl p-8 md:p-12 mb-10">
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="hero-badge">A-З</div>
              <div className="rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-5 py-3 text-white font-black shadow-2xl text-sm">
                Балаларға арналған көңілді ойын
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 via-emerald-400 to-amber-500 drop-shadow-[0_20px_50px_rgba(56,189,248,0.4)]" style={{textShadow: '0 0 60px rgba(56, 189, 248, 0.3), 0 0 40px rgba(34, 211, 238, 0.2)'}}>
              Адам-зат
            </h1>
            <p className="max-w-3xl text-base md:text-lg text-slate-600 leading-relaxed">
              Жақсы ойын үшін 2-10 ойыншы қосып, режим мен категорияларды таңдаңыз. Әр әріптен басталатын жауаптарды жазып, бәрі дайын болғанда STOP басыңыз.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="card card-accent-sky p-6">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="badge-step">1-қадам</span>
                    <h2 className="text-xl font-black text-slate-900">Ойыншыларды қосу</h2>
                  </div>
                  <span className="text-sm text-slate-500">{players.length}/10</span>
                </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => {
                    setInputName(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ойыншы аты..."
                  maxLength={20}
                  className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-3 text-base font-semibold focus:border-blue-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={addPlayer}
                  disabled={!inputName.trim() || players.length >= 10}
                  className={`ml-2 btn-primary ${!inputName.trim() || players.length >= 10 ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label="Add player"
                >
                  +
                </button>
              </div>

              {error && <p className="text-red-500 text-sm font-semibold mb-3">{error}</p>}

              <div className="flex flex-wrap gap-3">
                {players.length === 0 ? (
                  <div className="w-full rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-400">
                    Тағы 2-ден кем емес ойыншы қосыңыз
                  </div>
                ) : (
                  players.map((player, index) => (
                    <div
                      key={player.id}
                      className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-white px-4 py-2 shadow-sm"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-gray-700">{player.name}</span>
                      <button
                        type="button"
                        onClick={() => removePlayer(player.id)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Ойыншы ${player.name} өшіру`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card card-accent-cyan p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-500 font-black">2-қадам</p>
                  <h2 className="text-xl font-black text-slate-900">Ойын режимі</h2>
                </div>
                <span className="text-sm text-slate-500">{gameModes.find((mode) => mode.key === modeKey)?.title}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {gameModes.map((mode) => {
                    const ICONS: Record<string,string> = {
                      classic: '🏆', fast: '⚡', family: '👨‍👩‍👧‍👦', kazakh: '🇰🇿', russian: '🇷🇺', english: '🇬🇧', mixed: '🌈'
                    };
                  const selected = mode.key === modeKey;
                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => handleModeSelect(mode.key)}
                      className={`rounded-3xl border p-5 text-left transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl mr-2">{ICONS[mode.key] ?? '⭐'}</span>
                            <span className="text-base font-black text-gray-900">{mode.title}</span>
                          </div>
                          {selected && <span className="text-xs font-black text-blue-600">Таңдалды</span>}
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="card card-accent-amber p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-black">3-қадам</p>
                  <h2 className="text-xl font-black text-slate-900">Категорияларды таңдаңыз</h2>
                </div>
                <span className="text-sm text-slate-500">{selectedCategories.length} таңдалды</span>
              </div>

              <CategorySelector
                availableCategories={availableCategories}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                minRequired={5}
                maxAllowed={15}
                title="Категориялар"
                description="Кем дегенде 5, максимум 15 категория таңдаңыз. Режимге сай ұсыныстар автоматты таңдалады."
              />
            </section>
          </div>

          <aside className="space-y-6">
            <section className="card card-accent-lime p-6 sticky top-6 border-t-4 border-lime-400">
              <p className="text-xs uppercase tracking-[0.3em] text-lime-600 font-black mb-3">4-қадам</p>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Ойынды бастау</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Ойыншылар, режим және категориялар дайын болғанда бастау батырмасын басыңыз.
              </p>
              <button
                type="button"
                onClick={() => onStartGame(players, modeKey, selectedCategories)}
                disabled={!canStart}
                className={`btn-primary ${!canStart ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Ойынды бастау →
              </button>
              <div className="mt-4 text-sm text-slate-500 space-y-2">
                <p>2-10 ойыншы қажет.</p>
                <p>5-тен кем категория болғанда ойын басталмайды.</p>
              </div>
            </section>

            <section className="card card-accent-lime p-6 bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-400 text-white shadow-2xl border-t-4 border-lime-300">
              <h3 className="text-xl font-black mb-3">Жеңіл әрі көңілді</h3>
              <p className="text-sm leading-relaxed text-white/90">
                Балаларға арналған қауіпсіз интерфейс. Ойын көрінісі таза және көңілді, тек STOP, жылдамдық және ұпай арқылы жарыс сезімі.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

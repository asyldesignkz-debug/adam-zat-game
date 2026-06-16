"use client";

import { useEffect, useRef, useState } from "react";
import {
  saveMyAnswers,
  stopRoom,
  nextRound,
  finishRoom,
} from "../lib/roomService";
import type { PlayerRecord, RoomRecord } from "../lib/roomService";
import { calculateScores, getRoundTotal } from "../lib/gameRules";
import { GAME_MODES } from "../lib/gameModes";

type Props = {
  room: RoomRecord;
  players: PlayerRecord[];
  myPlayer: PlayerRecord | null;
};

export default function OnlineGameBoard({ room, players, myPlayer }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stopping, setStopping] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState("");
  const [selectedNextLetter, setSelectedNextLetter] = useState<string | null>(null);
  // Tracks whether this player's answers have been saved to Supabase this round
  const savedThisRoundRef = useRef(false);

  const categories =
    room.selected_categories && room.selected_categories.length > 0
      ? room.selected_categories
      : ["Адам", "Жануар", "Қала", "Кино", "Машина"];

  const modeConfig = GAME_MODES.find((m) => m.key === room.mode) ?? GAME_MODES[0];
  const totalRounds = modeConfig.totalRounds;
  const currentLetter = room.current_letter ?? "А";
  const rawAnswers = (room.round_answers ?? {}) as Record<string, unknown>;
  const currentRound =
    typeof rawAnswers["_round"] === "number"
      ? rawAnswers["_round"]
      : (room.current_round ?? 1);
  // Filter ALL underscore-prefixed metadata keys; only player UUID keys remain
  const playerAnswerMap = Object.fromEntries(
    Object.entries(rawAnswers).filter(([k]) => !k.startsWith("_"))
  ) as Record<string, Record<string, string>>;
  const allFilled = categories.every((cat) => (answers[cat] ?? "").trim().length > 0);
  const isHost = Boolean(myPlayer?.is_host);
  const isLastRound = currentRound >= totalRounds;

  // Who stopped this round (stored in round_answers by handleStop)
  const stoppedByRaw = rawAnswers["_stoppedBy"];
  const stoppedById =
    stoppedByRaw && typeof stoppedByRaw === "object" && "id" in stoppedByRaw
      ? String((stoppedByRaw as Record<string, unknown>).id)
      : undefined;
  const stoppedByName =
    stoppedByRaw && typeof stoppedByRaw === "object" && "name" in stoppedByRaw
      ? String((stoppedByRaw as Record<string, unknown>).name)
      : undefined;
  const isStopPlayer = Boolean(myPlayer?.id && myPlayer.id === stoppedById);
  // Stop player picks the next letter; fall back to host if tracking failed
  const canAdvance = stoppedById ? isStopPlayer : isHost;

  // Reset local answers when the round number changes (new round started)
  useEffect(() => {
    setAnswers({});
    setStopping(false);
    setAdvancing(false);
    setAdvanceError("");
    setSelectedNextLetter(null);
    savedThisRoundRef.current = false;
  }, [currentRound]);

  // When the round is stopped, non-stopper players auto-save their local answers.
  // The stopper already saved before calling stopRoom, so savedThisRoundRef prevents a double save.
  useEffect(() => {
    if (room.status !== "stopped" || !myPlayer || savedThisRoundRef.current) return;
    savedThisRoundRef.current = true;
    // Save even partial answers so they appear in the results table
    saveMyAnswers(room.id, myPlayer.id, answers).catch(() => {});
    // answers is captured at effect time (correct snapshot). ESLint wants it in deps:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.status, myPlayer, room.id]);

  function updateAnswer(category: string, value: string) {
    setAnswers((prev) => ({ ...prev, [category]: value }));
  }

  async function handleStop() {
    if (!allFilled || stopping || !myPlayer) return;
    try {
      setStopping(true);
      savedThisRoundRef.current = true; // block the auto-save effect
      await saveMyAnswers(room.id, myPlayer.id, answers);
      await stopRoom(room.id, myPlayer.id, myPlayer.name);
    } catch {
      setStopping(false);
      savedThisRoundRef.current = false;
    }
  }

  async function handleAdvance() {
    if (!canAdvance || advancing) return;
    if (!isLastRound && !selectedNextLetter) return;
    setAdvancing(true);
    try {
      const scores = calculateScores(
        players.map((p) => ({ id: p.id })),
        categories,
        playerAnswerMap,
        currentLetter,
        null
      );

      const scoreUpdates = players.map((p) => ({
        playerId: p.id,
        newScore: (p.score ?? 0) + getRoundTotal(scores[p.id] ?? {}),
      }));

      if (isLastRound) {
        await finishRoom(room.id, scoreUpdates);
      } else {
        await nextRound(room.id, currentRound + 1, selectedNextLetter!, scoreUpdates);
      }
    } catch (err) {
      setAdvancing(false);
      const msg =
        err instanceof Error
          ? err.message
          : err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
      setAdvanceError(msg);
    }
  }

  // ── FINISHED ──────────────────────────────────────────────────────────────────
  if (room.status === "finished") {
    const sorted = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const medals = ["🥇", "🥈", "🥉"];

    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-300 via-cyan-100 to-lime-200 px-4 py-8">
        <section className="mx-auto max-w-2xl">
          <div className="mb-6 rounded-[2rem] bg-white/90 p-8 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto mb-4 inline-flex rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2 text-sm font-black text-white shadow-lg">
              ФИНАЛ
            </div>
            <h1 className="text-4xl font-black text-slate-900">Ойын аяқталды!</h1>
            <p className="mt-2 text-slate-500">{totalRounds} раунд ойналды</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-black text-slate-900">Жалпы нәтижелер</h2>
            <div className="space-y-3">
              {sorted.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${
                    index === 0
                      ? "border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50"
                      : "bg-slate-50"
                  }`}
                >
                  <span className="text-2xl w-8 text-center">
                    {medals[index] ?? `${index + 1}`}
                  </span>
                  <div className="flex-1 font-black text-slate-900">{player.name}</div>
                  {myPlayer?.id === player.id && (
                    <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-black text-yellow-800">
                      Бұл сіз
                    </span>
                  )}
                  <div className="text-2xl font-black text-sky-600">
                    {player.score ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── STOPPED — round results ───────────────────────────────────────────────────
  if (room.status === "stopped") {
    const scores = calculateScores(
      players.map((p) => ({ id: p.id })),
      categories,
      playerAnswerMap,
      currentLetter,
      null
    );

    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-300 via-cyan-100 to-lime-200 px-4 py-8">
        <section className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 rounded-[2rem] bg-white/90 p-6 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto mb-3 inline-flex rounded-full bg-gradient-to-r from-red-400 to-rose-500 px-5 py-2 text-sm font-black text-white shadow-lg">
              STOP
            </div>
            <h1 className="text-3xl font-black text-slate-900">Раунд тоқтады</h1>
            {stoppedByName && (
              <p className="mt-1 text-sm font-bold text-rose-500">{stoppedByName} тоқтатты</p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-600">
                {currentRound}-раунд / {totalRounds}
              </span>
              <span className="rounded-full bg-sky-100 px-4 py-2 text-sky-700">
                Әріп: {currentLetter}
              </span>
            </div>
          </div>

          {/* Per-player result cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {players.map((player) => {
              const playerAnswers = playerAnswerMap[player.id] ?? {};
              const playerScores = scores[player.id] ?? {};
              const roundTotal = getRoundTotal(playerScores);
              const runningTotal = (player.score ?? 0) + roundTotal;

              return (
                <div key={player.id} className="rounded-[2rem] bg-white p-5 shadow-xl">
                  {/* Player header */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-lg text-slate-900">{player.name}</span>
                      {player.is_host && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                          Host
                        </span>
                      )}
                      {myPlayer?.id === player.id && (
                        <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-black text-yellow-800">
                          Сіз
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-emerald-600">+{roundTotal}</div>
                      <div className="text-xs text-slate-400">Жалпы: {runningTotal}</div>
                    </div>
                  </div>

                  {/* Answer rows */}
                  <div className="space-y-1.5">
                    {categories.map((cat) => {
                      const ans = playerAnswers[cat] ?? "";
                      const sc = playerScores[cat] ?? 0;
                      return (
                        <div
                          key={cat}
                          className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="w-20 shrink-0 font-semibold text-slate-400">
                            {cat}
                          </span>
                          <span
                            className={`flex-1 font-black ${
                              ans ? "text-slate-900" : "text-slate-300"
                            }`}
                          >
                            {ans || "—"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-black ${
                              sc > 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {sc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* STOP player picks next letter, then advances */}
          {canAdvance ? (
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              {!isLastRound && (
                <>
                  <p className="mb-3 text-sm font-bold text-slate-600">
                    Келесі раунд үшін әріп таңдаңыз:
                  </p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {modeConfig.letters.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => setSelectedNextLetter(letter)}
                        disabled={letter === currentLetter || advancing}
                        className={`h-11 w-11 rounded-xl text-sm font-black transition ${
                          selectedNextLetter === letter
                            ? "bg-sky-500 text-white shadow-md"
                            : letter === currentLetter
                            ? "cursor-not-allowed bg-slate-100 text-slate-300"
                            : "bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-700"
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={handleAdvance}
                disabled={advancing || (!isLastRound && !selectedNextLetter)}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {advancing
                  ? "Өткізіліп жатыр..."
                  : isLastRound
                  ? "Ойынды аяқтау →"
                  : selectedNextLetter
                  ? `${currentRound + 1}-раундқа өту →`
                  : "Алдымен әріп таңдаңыз"}
              </button>
              {advanceError && (
                <p className="mt-3 text-sm font-semibold text-red-600">{advanceError}</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/60 px-5 py-4 text-center text-sm font-semibold text-slate-500 shadow">
              {isLastRound
                ? `Ойынды ${stoppedByName ?? "ойыншы"} аяқтайды...`
                : `Келесі әріпті ${stoppedByName ?? "ойыншы"} таңдайды...`}
            </div>
          )}
        </section>
      </main>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-300 via-cyan-100 to-lime-200 px-4 py-8">
      <section className="mx-auto max-w-5xl">
        {/* Round + letter header */}
        <div className="mb-6 rounded-[2rem] bg-white/80 p-6 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-3 inline-flex rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 px-5 py-2 text-sm font-black text-white shadow-lg">
            {currentRound}-РАУНД / {totalRounds}
          </div>
          <h1 className="bg-gradient-to-r from-sky-500 via-emerald-500 to-yellow-500 bg-clip-text text-7xl font-black text-transparent">
            {currentLetter}
          </h1>
          <p className="mt-2 font-semibold text-slate-500">
            осы әріптен басталатын сөздерді жазыңыз
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          {/* Answer inputs */}
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-black text-slate-800">Жауаптар</h2>

            <div className="grid gap-3">
              {categories.map((category) => (
                <label
                  key={category}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="mb-2 font-black text-slate-800">{category}</div>
                  <input
                    value={answers[category] ?? ""}
                    onChange={(e) => updateAnswer(category, e.target.value)}
                    placeholder={`${category} бойынша жауап...`}
                    disabled={stopping}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-sky-400 disabled:opacity-50"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5">
              {!allFilled && (
                <p className="mb-3 text-sm font-semibold text-slate-400">
                  Барлық жауаптарды толтырсаңыз STOP белсенді болады.
                </p>
              )}
              <button
                onClick={handleStop}
                disabled={!allFilled || stopping}
                className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stopping ? "Тоқтатылуда..." : "STOP"}
              </button>
            </div>
          </div>

          {/* Players sidebar */}
          <aside className="rounded-[2rem] bg-white p-5 shadow-xl">
            <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-black text-emerald-700">
              Ойыншылар
            </div>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{player.name}</div>
                      <div className="text-xs font-bold text-slate-400">
                        {player.score ?? 0} ұпай
                      </div>
                    </div>
                  </div>
                  {myPlayer?.id === player.id && (
                    <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-black text-yellow-800">
                      Сіз
                    </span>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

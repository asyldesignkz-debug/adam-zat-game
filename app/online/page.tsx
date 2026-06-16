"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createRoom,
  getRoomByCode,
  joinRoom,
  startRoom,
  subscribeToRoom,
  type PlayerRecord,
  type RoomRecord,
} from "../../lib/roomService";

export default function OnlineLobbyPage() {
  const [hostName, setHostName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [myPlayer, setMyPlayer] = useState<PlayerRecord | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refreshRoom = useCallback(async () => {
    if (!room?.code) return;

    const data = await getRoomByCode(room.code);
    setRoom(data.room);
    setPlayers(data.players);
  }, [room?.code]);

  useEffect(() => {
    if (!room?.id) return;

    const unsubscribe = subscribeToRoom(room.id, () => {
      refreshRoom();
    });

    return () => {
      unsubscribe();
    };
  }, [room?.id, refreshRoom]);

  async function handleCreateRoom() {
    try {
      setLoading(true);
      setMessage("");

      const result = await createRoom(hostName);
      setRoom(result.room);
      setMyPlayer(result.player);

      const fresh = await getRoomByCode(result.room.code);
      setPlayers(fresh.players);

      setMessage("Бөлме ашылды ✅");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Бөлме ашу кезінде қате шықты";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom() {
    try {
      setLoading(true);
      setMessage("");

      const result = await joinRoom(joinCode, joinName);
      setRoom(result.room);
      setMyPlayer(result.player);

      const fresh = await getRoomByCode(result.room.code);
      setPlayers(fresh.players);

      setMessage("Бөлмеге кірдіңіз ✅");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Бөлмеге кіру кезінде қате шықты";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRoom() {
    if (!room?.id) return;

    try {
      setLoading(true);
      setMessage("");

      const updatedRoom = await startRoom(room.id);
      setRoom(updatedRoom);

      setMessage("Ойын басталды ✅");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Ойынды бастау кезінде қате шықты";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  const isHost = Boolean(myPlayer?.is_host);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-300 via-cyan-100 to-lime-200 px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[2rem] bg-white/80 p-6 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-3 inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-lime-400 px-5 py-2 text-sm font-bold text-white shadow-lg">
            ONLINE LOBBY TEST
          </div>

          <h1 className="bg-gradient-to-r from-sky-500 via-emerald-500 to-yellow-500 bg-clip-text text-5xl font-black text-transparent md:text-6xl">
            Адам-зат Online
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Бұл бет арқылы бөлме ашып, басқа смартфоннан кодпен кіріп, ойыншылар
            тізімін realtime тексереміз.
          </p>
        </div>

        {!room ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="mb-4 inline-flex rounded-full bg-yellow-200 px-4 py-1 text-sm font-bold text-yellow-800">
                1-қадам
              </div>

              <h2 className="mb-3 text-2xl font-black text-slate-900">
                Бөлме ашу
              </h2>

              <p className="mb-5 text-slate-600">
                Бір ойыншы host болады. Бөлме коды автоматты жасалады.
              </p>

              <input
                value={hostName}
                onChange={(event) => setHostName(event.target.value)}
                placeholder="Атыңызды жазыңыз..."
                className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-400"
              />

              <button
                onClick={handleCreateRoom}
                disabled={loading || !hostName.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Бөлме ашу →
              </button>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="mb-4 inline-flex rounded-full bg-blue-200 px-4 py-1 text-sm font-bold text-blue-800">
                2-қадам
              </div>

              <h2 className="mb-3 text-2xl font-black text-slate-900">
                Кодпен кіру
              </h2>

              <p className="mb-5 text-slate-600">
                Басқа ойыншы host жіберген бөлме кодын енгізеді.
              </p>

              <input
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                placeholder="Атыңызды жазыңыз..."
                className="mb-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-cyan-400"
              />

              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="Бөлме коды..."
                className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold uppercase tracking-[0.3em] outline-none focus:border-cyan-400"
              />

              <button
                onClick={handleJoinRoom}
                disabled={loading || !joinName.trim() || !joinCode.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-400 via-rose-400 to-pink-500 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Бөлмеге кіру →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-bold text-emerald-700">
                    Бөлме ашық
                  </div>

                  <h2 className="text-3xl font-black text-slate-900">
                    Код:{" "}
                    <span className="rounded-2xl bg-slate-100 px-4 py-2 tracking-[0.25em] text-sky-600">
                      {room.code}
                    </span>
                  </h2>
                </div>

                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                  status: {room.status}
                </div>
              </div>

              <p className="mb-6 text-slate-600">
                Осы кодты басқа смартфонға жіберіңіз. Кірген ойыншылар төменде
                realtime көрінуі керек.
              </p>

              <div className="rounded-3xl bg-gradient-to-br from-cyan-100 to-lime-100 p-5">
                <h3 className="mb-4 text-xl font-black text-slate-900">
                  Ойыншылар
                </h3>

                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 font-black text-white">
                          {index + 1}
                        </div>

                        <div>
                          <div className="font-black text-slate-900">
                            {player.name}
                          </div>
                          <div className="text-xs font-bold text-slate-400">
                            {player.is_host ? "Host" : "Player"}
                          </div>
                        </div>
                      </div>

                      {myPlayer?.id === player.id && (
                        <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-black text-yellow-800">
                          Бұл сіз
                        </span>
                      )}
                    </div>
                  ))}

                  {players.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-slate-400">
                      Әзірге ойыншы жоқ
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="mb-4 inline-flex rounded-full bg-purple-100 px-4 py-1 text-sm font-bold text-purple-700">
                Басқару
              </div>

              <h3 className="mb-3 text-2xl font-black text-slate-900">
                Ойынды бастау
              </h3>

              <p className="mb-5 text-slate-600">
                Қазір тек lobby realtime тексереміз. Келесі кезеңде ойын
                жауаптары мен STOP синхрон қосылады.
              </p>

              <button
                onClick={handleStartRoom}
                disabled={loading || !isHost || players.length < 2}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ойынды бастау →
              </button>

              {!isHost && (
                <p className="mt-3 text-sm text-slate-500">
                  Ойынды тек host бастай алады.
                </p>
              )}

              {players.length < 2 && (
                <p className="mt-3 text-sm text-slate-500">
                  Кемінде 2 ойыншы керек.
                </p>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-center font-bold text-slate-700 shadow-lg">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}
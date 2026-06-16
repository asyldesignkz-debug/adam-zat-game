"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  time: string;
};

type Props = {
  messages: ChatMessage[];
  myPlayerId: string;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
};

export default function RoomChat({ messages, myPlayerId, input, onInputChange, onSend }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, collapsed]);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="mt-6 rounded-[2rem] bg-white shadow-xl">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="font-black text-slate-800">
          Чат
          {messages.length > 0 && (
            <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-600">
              {messages.length}
            </span>
          )}
        </span>
        <span className="text-slate-400 text-sm">{collapsed ? "▼" : "▲"}</span>
      </button>

      {!collapsed && (
        <div className="px-5 pb-5">
          <div className="mb-3 h-48 overflow-y-auto rounded-2xl bg-slate-50 p-3 space-y-2">
            {messages.length === 0 && (
              <p className="pt-16 text-center text-xs text-slate-400">
                Әзірге хабарлама жоқ
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.playerId === myPlayerId ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.playerId === myPlayerId
                      ? "bg-sky-500 text-white"
                      : "bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  {msg.playerId !== myPlayerId && (
                    <div className="mb-0.5 text-xs font-bold opacity-70">
                      {msg.playerName}
                    </div>
                  )}
                  <div>{msg.text}</div>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{msg.time}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKey}
              maxLength={200}
              placeholder="Хабарлама жазыңыз..."
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-sky-400"
            />
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className="rounded-2xl bg-sky-500 px-4 py-2.5 font-black text-white transition hover:bg-sky-600 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

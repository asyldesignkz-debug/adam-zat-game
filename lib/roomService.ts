import { supabase } from "./supabaseClient";

export type RoomStatus = "lobby" | "playing" | "stopped" | "finished";

export type RoomRecord = {
  id: string;
  code: string;
  status: RoomStatus | string;
  mode?: string | null;
  selected_categories?: string[] | null;
  host_player_id?: string | null;
  current_round?: number | null;
  current_letter?: string | null;
  round_answers?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export type PlayerRecord = {
  id: string;
  room_id: string;
  name: string;
  is_host?: boolean | null;
  score?: number | null;
  joined_at?: string;
  last_seen_at?: string | null;
};

export type RoomWithPlayers = {
  room: RoomRecord;
  players: PlayerRecord[];
};

export function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function normalizePlayerName(name: string) {
  return name.trim().slice(0, 24);
}

export async function createRoom(hostName: string) {
  const cleanName = normalizePlayerName(hostName);

  if (!cleanName) {
    throw new Error("Ойыншы аты бос болмауы керек");
  }

  const code = generateRoomCode();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      code,
      status: "lobby",
      mode: "classic",
      selected_categories: [],
      
    })
    .select("*")
    .single();

  if (roomError) {
  throw new Error(roomError.message);
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      name: cleanName,
      is_host: true,
    })
    .select("*")
    .single();

  if (playerError) {
  throw new Error(playerError.message);
  }

  const { data: updatedRoom, error: updateError } = await supabase
    .from("rooms")
    .update({
      host_player_id: player.id,
    })
    .eq("id", room.id)
    .select("*")
    .single();

  if (updateError) {
  throw new Error(updateError.message);
  }

  return {
    room: updatedRoom as RoomRecord,
    player: player as PlayerRecord,
  };
}

export async function joinRoom(code: string, playerName: string) {
  const cleanCode = normalizeRoomCode(code);
  const cleanName = normalizePlayerName(playerName);

  if (!cleanCode) {
    throw new Error("Бөлме коды бос болмауы керек");
  }

  if (!cleanName) {
    throw new Error("Ойыншы аты бос болмауы керек");
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", cleanCode)
    .single();

  if (roomError || !room) {
    throw new Error("Бөлме табылмады");
  }

  if (room.status !== "lobby") {
    throw new Error("Бұл бөлмеде ойын басталып кеткен");
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      name: cleanName,
      is_host: false,
    })
    .select("*")
    .single();

  if (playerError) {
    throw playerError;
  }

  return {
    room: room as RoomRecord,
    player: player as PlayerRecord,
  };
}

export async function getRoomByCode(code: string): Promise<RoomWithPlayers> {
  const cleanCode = normalizeRoomCode(code);

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", cleanCode)
    .single();

  if (roomError || !room) {
    throw new Error("Бөлме табылмады");
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", room.id)
    .order("joined_at", { ascending: true });

  if (playersError) {
    throw playersError;
  }

  return {
    room: room as RoomRecord,
    players: (players || []) as PlayerRecord[],
  };
}

export async function startRoom(roomId: string, letter: string) {
  const { data, error } = await supabase
    .from("rooms")
    .update({
      status: "playing",
      current_letter: letter,
      round_answers: { _round: 1 },
    })
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as RoomRecord;
}

// Reads current round_answers, merges _stoppedBy, then writes status + round_answers
// in ONE update so every client gets both fields in the same realtime event.
export async function stopRoom(
  roomId: string,
  stoppedById: string,
  stoppedByName: string
) {
  const { data: current, error: readErr } = await supabase
    .from("rooms")
    .select("round_answers")
    .eq("id", roomId)
    .single();
  if (readErr) throw readErr;

  const existing = ((current as Partial<RoomRecord>).round_answers ?? {}) as Record<string, unknown>;
  const round_answers = {
    ...existing,
    _stoppedBy: { id: stoppedById, name: stoppedByName },
  };

  const { data, error } = await supabase
    .from("rooms")
    .update({ status: "stopped", round_answers })
    .eq("id", roomId)
    .select("*")
    .single();
  if (error) throw error;
  return data as RoomRecord;
}

// Atomically merges one player's answers into rooms.round_answers via a DB function.
// Avoids lost-update races when multiple players save simultaneously.
export async function saveMyAnswers(
  roomId: string,
  playerId: string,
  answers: Record<string, string>
) {
  const { error } = await supabase.rpc("merge_player_answers", {
    p_room_id: roomId,
    p_player_id: playerId,
    p_answers: answers,
  });
  if (error) throw error;
}

export async function nextRound(
  roomId: string,
  newRound: number,
  newLetter: string,
  playerScoreUpdates: Array<{ playerId: string; newScore: number }>
) {
  // Best-effort: don't block round advancement if the score column is missing or update fails
  await Promise.allSettled(
    playerScoreUpdates.map(({ playerId, newScore }) =>
      supabase.from("players").update({ score: newScore }).eq("id", playerId)
    )
  );

  const { data, error } = await supabase
    .from("rooms")
    .update({
      status: "playing",
      current_letter: newLetter,
      round_answers: { _round: newRound },
    })
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) throw error;
  return data as RoomRecord;
}

export async function finishRoom(
  roomId: string,
  playerScoreUpdates: Array<{ playerId: string; newScore: number }>
) {
  await Promise.allSettled(
    playerScoreUpdates.map(({ playerId, newScore }) =>
      supabase.from("players").update({ score: newScore }).eq("id", playerId)
    )
  );

  const { data, error } = await supabase
    .from("rooms")
    .update({ status: "finished" })
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) throw error;
  return data as RoomRecord;
}

export async function updateRoomSettings(
  roomId: string,
  mode: string,
  selectedCategories: string[]
) {
  const { data, error } = await supabase
    .from("rooms")
    .update({ mode, selected_categories: selectedCategories })
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) throw error;

  return data as RoomRecord;
}

export async function updatePlayerPresence(playerId: string) {
  const { error } = await supabase
    .from("players")
    .update({
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", playerId);

  if (error) {
    throw error;
  }
}

export function subscribeToRoom(
  roomId: string,
  onChange: () => void
) {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      () => {
        onChange();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
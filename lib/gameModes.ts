import type { GameModeKey } from "@/types/game";
import { KAZAKH_LETTERS, RUSSIAN_LETTERS, ENGLISH_LETTERS } from "./letters";

export interface GameMode {
  key: GameModeKey;
  title: string;
  description: string;
  totalRounds: number;
  timerSeconds?: number;
  suggestedCategories: string[];
  letters: string[];
}

export const GAME_MODES: GameMode[] = [
  {
    key: "classic",
    title: "Классика",
    description: "5 раунд, таймер жоқ. Классикалық ойын, әр дұрыс жауап 20 ұпай.",
    totalRounds: 5,
    suggestedCategories: ["Адам", "Жануар", "Кино", "Машина", "Қала"],
    letters: KAZAKH_LETTERS,
  },
  {
    key: "fast",
    title: "Жылдам раунд",
    description: "5 раунд, 60 секунд. Таймер біткенде раунд автоматты тоқтайды.",
    totalRounds: 5,
    timerSeconds: 60,
    suggestedCategories: ["Адам", "Жануар", "Кино", "Машина", "Қала"],
    letters: KAZAKH_LETTERS,
  },
  {
    key: "family",
    title: "Отбасылық",
    description: "Балаларға жеңіл. Қиын әріптер жоқ, жеңіл категориялар.",
    totalRounds: 5,
    suggestedCategories: ["Адам", "Жануар", "Қала", "Тағам", "Мультфильм", "Ойын", "Киім"],
    letters: [
      "А",
      "Ә",
      "Б",
      "В",
      "Г",
      "Д",
      "Е",
      "Ж",
      "З",
      "И",
      "К",
      "Қ",
      "Л",
      "М",
      "Н",
      "О",
      "Ө",
      "П",
      "Р",
      "С",
      "Т",
      "У",
      "Ұ",
      "Ү",
      "Ш",
    ],
  },
  {
    key: "kazakh",
    title: "Қазақша",
    description: "Қазақ әріптері. Қиын әріптер алынған, қазақша категориялар.",
    totalRounds: 5,
    suggestedCategories: ["Адам", "Жануар", "Қала", "Өсімдік", "Тағам", "Спортшы", "Мамандық", "Музыка"],
    letters: [
      "А",
      "Ә",
      "Б",
      "В",
      "Г",
      "Ғ",
      "Д",
      "Е",
      "Ж",
      "З",
      "И",
      "Й",
      "К",
      "Қ",
      "Л",
      "М",
      "Н",
      "Ң",
      "О",
      "Ө",
      "П",
      "Р",
      "С",
      "Т",
      "У",
      "Ұ",
      "Ү",
      "Ш",
    ],
  },
  {
    key: "russian",
    title: "Орысша",
    description: "Орыс алфавиті. Орысша ойнауға арналған жеңіл категориялар.",
    totalRounds: 5,
    suggestedCategories: ["Человек", "Животное", "Фильм", "Машина", "Город", "Растение", "Еда", "Профессия"],
    letters: RUSSIAN_LETTERS,
  },
  {
    key: "english",
    title: "Ағылшынша",
    description: "English alphabet A–Z. Англи тілінде ойын және жауаптар.",
    totalRounds: 5,
    suggestedCategories: ["Person", "Animal", "Movie", "Car", "City", "Plant", "Food", "Brand", "Job", "Game"],
    letters: ENGLISH_LETTERS,
  },
  {
    key: "mixed",
    title: "Аралас",
    description: "Қазақша, орысша және ағылшынша сөздер қабылданады. Fun mode.",
    totalRounds: 5,
    suggestedCategories: ["Адам", "Жануар", "Movie", "Car", "City", "Food", "Game", "Мамандық"],
    letters: [...KAZAKH_LETTERS, ...RUSSIAN_LETTERS, ...ENGLISH_LETTERS],
  },
];

export const DEFAULT_MODE_KEY: GameModeKey = "classic";

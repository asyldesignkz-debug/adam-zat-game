export const KAZAKH_LETTERS: string[] = [
  "А", "Ә", "Б", "В", "Г", "Ғ", "Д", "Е", "Ж", "З",
  "И", "Й", "К", "Қ", "Л", "М", "Н", "Ң", "О", "Ө",
  "П", "Р", "С", "Т", "У", "Ұ", "Ү", "Ш",
];

export const RUSSIAN_LETTERS: string[] = [
  "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И",
  "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т",
  "У", "Ф", "Х", "Ц", "Ч", "Ш",
];

export const ENGLISH_LETTERS: string[] = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index)
);

export function getRandomLetter(letters: string[], excludeLetter?: string): string {
  const available = excludeLetter
    ? letters.filter((letter) => letter !== excludeLetter)
    : letters;
  return available[Math.floor(Math.random() * available.length)];
}

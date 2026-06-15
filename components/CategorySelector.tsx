"use client";

import React from "react";

interface Props {
  availableCategories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  minRequired: number;
  maxAllowed: number;
  title: string;
  description: string;
  disabled?: boolean;
}

export default function CategorySelector({
  availableCategories,
  selectedCategories,
  onToggleCategory,
  minRequired,
  maxAllowed,
  title,
  description,
  disabled = false,
}: Props) {
  const ICONS: Record<string, string> = {
    Адам: "🧑",
    Жануар: "🐶",
    Кино: "🎬",
    Машина: "🚗",
    Қала: "🏙️",
    Өсімдік: "🌿",
    Ел: "🌍",
    Тағам: "🍔",
    Спортшы: "🏅",
    Бренд: "🏷️",
    Мамандық: "👩‍🔧",
    Мультфильм: "🧚",
    Ойын: "🎮",
    Киім: "👕",
    Музыка: "🎵",
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <div className="mb-4">
        <div className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
          {title}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {availableCategories.map((category) => {
          const selected = selectedCategories.includes(category);
          const selectedClasses =
            "bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-300 text-white ring-2 ring-amber-300 shadow-lg";
          const normalClasses = "bg-white border border-slate-200 text-slate-700 hover:-translate-y-0.5 hover:shadow-lg";

          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggleCategory(category)}
              disabled={disabled && !selected}
              className={`rounded-3xl px-4 py-3 text-sm font-semibold transition-all min-w-[120px] text-left flex items-center gap-3 ${
                selected ? selectedClasses : normalClasses
              } ${disabled && !selected ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span className="text-2xl">{ICONS[category] ?? "⭐"}</span>
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          {selectedCategories.length} категория таңдалды · минимум {minRequired}, максимум {maxAllowed}
        </p>
        <p className="text-sm font-semibold text-gray-600">
          {selectedCategories.length < minRequired
            ? `Кем дегенде ${minRequired} категория таңдаңыз`
            : selectedCategories.length > maxAllowed
            ? `Максимум ${maxAllowed} категория`
            : "Категория таңдалды"}
        </p>
      </div>
    </div>
  );
}

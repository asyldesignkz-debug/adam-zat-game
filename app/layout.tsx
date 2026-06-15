import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
});


export const metadata: Metadata = {
  title: "Адам-зат | Қазақша Сөз Ойыны",
  description:
    "Әріп таңдалады. Сол әріптен басталатын жауаптарды жаз. Бірінші толтырған адам STOP басады!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk">
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-sky-300 via-cyan-200 to-lime-100 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}

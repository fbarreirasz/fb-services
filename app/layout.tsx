import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "FB Services — Services Tibia no RubinOT",
  description: "Char Level Up, Rotação de Bosses, Tasks, Quests e muito mais. Agende pelo site com segurança e profissionalismo.",
  openGraph: {
    title: "FB Services — Services Tibia no RubinOT",
    description: "Char Level Up, Rotação de Bosses, Tasks, Quests e muito mais. Agende pelo site!",
    url: "https://fbservices.vercel.app",
    siteName: "FB Services",
    images: [{ url: "https://fbservices.vercel.app/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FB Services — Services Tibia no RubinOT",
    description: "Char Level Up, Rotação de Bosses, Tasks, Quests e muito mais.",
    images: ["https://fbservices.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}<Analytics /></body>
    </html>
  );
}
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "FB Services",
  description: "Services Tibia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}<Analytics /></body>
    </html>
  );
}
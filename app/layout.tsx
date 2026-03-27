import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
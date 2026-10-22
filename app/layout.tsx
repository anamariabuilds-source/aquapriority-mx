import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaPriority MX — Demo sintética",
  description: "Comparación académica de seguimiento y priorización humana de incidentes ficticios.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}

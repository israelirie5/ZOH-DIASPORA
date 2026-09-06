import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZOH-HENAN Diaspora Tour 2026",
  description: "Investir dans l’immobilier en Côte d’Ivoire en toute sécurité.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

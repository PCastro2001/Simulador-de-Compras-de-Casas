import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubsiMatch | Orientacion para primera vivienda",
  description:
    "Plataforma de orientacion inmobiliaria y financiera para estimar subsidios, capacidad hipotecaria y proyectos compatibles en Chile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        {children}
        <footer className="border-t border-slate-200 bg-[#4a4a4a] px-5 py-6 text-center text-xs font-medium text-white">
          SubsiMatch 2026. Orientacion referencial para compra de vivienda en Chile.
        </footer>
      </body>
    </html>
  );
}

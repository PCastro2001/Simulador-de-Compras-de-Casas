// src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Cargamos la fuente Poppins de forma optimizada
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "SubsiMatch - Consigue tu Casa Propia",
  description: "Simulador de subsidios habitacionales (DS49, DS1, DS19) y créditos hipotecarios en Chile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.className} antialiased bg-[#f9f7f2] text-[#4a4a4a] min-h-screen flex flex-col justify-between`}>
        
        {/* El contenido de cada página se inyectará aquí */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer único centralizado para toda la aplicación */}
        <footer className="bg-[#4a4a4a] text-white text-center py-4 text-sm font-light mt-10">
          <p>© 2026 SubsiMatch</p>
        </footer>
        
      </body>
    </html>
  );
}

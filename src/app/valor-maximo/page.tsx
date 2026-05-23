// src/app/valor-maximo/page.tsx
"use client";

import Link from "next/link";

export default function ValorMaximoMenuPage() {
  const opciones = [
    { href: "/valor-maximo/ds1t1", titulo: "Subsidio DS1 Tramo 1", descripcion: "Para personas en el 60% más vulnerable." },
    { href: "/valor-maximo/ds1t2", titulo: "Subsidio DS1 Tramo 2", descripcion: "Compra de viviendas hasta 1.600 UF (hasta 80% de vulnerabilidad)." },
    { href: "/valor-maximo/ds1t3", titulo: "Subsidio DS1 Tramo 3", descripcion: "Compra de viviendas hasta 2.200 UF." },
    { href: "/valor-maximo/ds1t4", titulo: "Subsidio DS1 Tramo 4", descripcion: "Compra de viviendas hasta 4.000 UF (ahorro mínimo 200 UF y subsidio de 400 UF)." },
    { href: "/valor-maximo/ds19", titulo: "Subsidio DS19", descripcion: "Integración Social (compra de vivienda nueva en proyectos seleccionados)." },
    { href: "/valor-maximo/sin-subsidio", titulo: "Sin Subsidio / Libre", descripcion: "Calcula el valor máximo de una vivienda sin aplicar aportes del Estado." },
  ];

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Valor Máximo de Casa</h1>
            <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
              Selecciona una opción para realizar la ingeniería inversa de tu capacidad de compra.
            </p>
          </div>
          <Link href="/" className="text-xs font-bold bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all">
            ← Volver al Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opciones.map((opcion, index) => (
            <article 
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-[#6b9ac4] transition-all hover:shadow-md group"
            >
              <Link href={opcion.href} className="block h-full">
                <h2 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#6b9ac4] transition-colors">
                  {opcion.titulo}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {opcion.descripcion}
                </p>
                <div className="mt-4 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Ingresar sueldo →
                </div>
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
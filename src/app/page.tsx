import Link from "next/link";
import { FirstHomeOnboarding } from "@/components/onboarding/FirstHomeOnboarding";
import { getUfValue } from "@/services/uf";

const secondaryTools = [
  {
    href: "/percentil",
    title: "Calcular percentil RSH",
    description: "Revisa el calculo detallado del tramo segun sueldo y hogar.",
  },
  {
    href: "/asistente-subsidios",
    title: "Asistente de subsidios",
    description: "Descarta opciones con preguntas guiadas.",
  },
  {
    href: "/subsidies",
    title: "Simuladores por subsidio",
    description: "DS49, DS1 y DS19 con sus reglas especificas.",
  },
  {
    href: "/sin-subsidio",
    title: "Compra sin subsidio",
    description: "Evalua credito hipotecario tradicional.",
  },
  {
    href: "/valor-maximo",
    title: "Valor maximo de casa",
    description: "Calcula tu presupuesto por tramo y region.",
  },
  {
    href: "/ofertas-inmobiliarias",
    title: "Ofertas inmobiliarias",
    description: "Genera filtros reales con tu presupuesto.",
  },
];

export default async function HomePage() {
  const ufValue = await getUfValue();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b-4 border-white bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link href="/" className="text-lg font-bold tracking-tight drop-shadow-sm" aria-label="SubsiMatch inicio">
            SubsiMatch
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-blue-50 sm:flex" aria-label="Navegacion principal">
            <Link href="/ofertas-inmobiliarias" className="transition hover:text-white">
              Proyectos
            </Link>
            <Link href="/formulario" className="transition hover:text-white">
              Orientacion
            </Link>
          </nav>
          <Link
            href="/formulario"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-white/20 px-4 text-sm font-bold text-white transition hover:bg-white/30"
          >
            Pedir ayuda
          </Link>
        </div>
      </header>

      <main>
        <FirstHomeOnboarding ufValue={ufValue} />

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-5 px-5 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b9ac4]">Herramientas de apoyo</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Modulos originales de SubsiMatch</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Mantengo tus herramientas como apoyo para quien quiera revisar cada calculo con mas detalle.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {secondaryTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-[#6b9ac4] hover:bg-white hover:shadow-md"
                >
                  <h3 className="text-base font-bold text-slate-950">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">Acompanamiento humano</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Ordena tu plan de compra con alguien al lado.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
                Si tu resultado calza, podemos ayudarte a preparar el perfil para bancos, inmobiliarias y proyectos compatibles.
              </p>
            </div>
            <Link href="/formulario" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#87c0a3] px-5 text-sm font-bold text-slate-950 transition hover:bg-[#76b092]">
              Quiero orientacion
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

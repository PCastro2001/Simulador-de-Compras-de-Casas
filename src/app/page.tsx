import Link from "next/link";
import { FirstHomeOnboarding } from "@/components/onboarding/FirstHomeOnboarding";
import { ProjectMatches } from "@/components/results/ProjectMatches";
import { getUfValue } from "@/services/uf";

const secondaryTools = [
  {
    href: "/percentil",
    title: "Descubre tu tramo RSH",
    description: "Una guia rapida para estimar tu punto de partida social.",
  },
  {
    href: "/asistente-subsidios",
    title: "Encuentra apoyos estatales",
    description: "Responde pocas preguntas y entiende que subsidio mirar.",
  },
  {
    href: "/sin-subsidio",
    title: "Compra directa con banco",
    description: "Calcula un credito tradicional si no usaras subsidio.",
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
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Calculadoras cuando quieras profundizar</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                El registro arma tu perfil primero. Despues puedes entrar a modulos mas especificos si quieres revisar detalles.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
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

        <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
          <ProjectMatches />
        </div>

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

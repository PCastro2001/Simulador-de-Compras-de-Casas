import { PROJECT_MATCHES } from "@/config/housing";

export function ProjectMatches() {
  return (
    <section className="space-y-4" aria-label="Proyectos compatibles">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Proyectos compatibles</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-950">Donde mirar primero</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {PROJECT_MATCHES.map((project) => (
          <article key={project.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-stone-950">{project.title}</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">{project.location}</p>
            <div className="mt-4 border-t border-stone-100 pt-4 text-sm">
              <p className="font-bold text-stone-900">{project.rangeUf}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">{project.fit}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

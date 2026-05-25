import type { HousingOrientationResult } from "@/lib/finance/types";
import { formatCLP, formatUF } from "@/utils/format";

type ResultSummaryProps = {
  result: HousingOrientationResult;
  ufValue: number;
};

const viabilityStyles = {
  alta: "bg-emerald-50 text-emerald-900 border-emerald-200",
  media: "bg-amber-50 text-amber-900 border-amber-200",
  preparacion: "bg-sky-50 text-sky-900 border-sky-200",
};

export function ResultSummary({ result, ufValue }: ResultSummaryProps) {
  const debtPercentage = Math.round(result.mortgage.debtRatio * 100);

  return (
    <section className="space-y-5" aria-label="Resultado de orientacion">
      <div className={`rounded-lg border p-4 ${viabilityStyles[result.viability]}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em]">Nivel de viabilidad</p>
        <h3 className="mt-2 text-xl font-bold text-balance">{result.viabilityLabel}</h3>
        <p className="mt-2 text-sm leading-6 opacity-85">{result.viabilityDetail}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Dividendo estimado" value={formatCLP(result.mortgage.monthlyPaymentClp)} detail={`${result.mortgage.monthlyPaymentUf.toFixed(1)} UF al mes`} />
        <Metric label="Rango recomendado" value={`${formatUF(result.mortgage.recommendedMinUf)} - ${formatUF(result.maxRecommendedPriceUf)}`} detail="Precio de vivienda a priorizar" />
        <Metric label="Ahorro disponible" value={formatUF(result.savingsUf)} detail={formatCLP(result.savingsUf * ufValue)} />
        <Metric label="Carga mensual" value={`${debtPercentage}%`} detail="Del ingreso liquido declarado" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-stone-500">Apoyos compatibles</h3>
          <span className="text-xs font-semibold text-stone-500">{result.compatibleSubsidies.length} opciones</span>
        </div>
        <div className="grid gap-3">
          {result.compatibleSubsidies.map((program) => (
            <article key={program.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-stone-950">{program.friendlyName}</h4>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{program.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                  {program.name}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-stone-500">{program.rshHint}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-stone-950 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Siguiente paso</p>
        <p className="mt-2 text-base font-semibold leading-6">{result.nextAction}</p>
      </div>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-stone-950">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{detail}</p>
    </div>
  );
}

import type { HousingOrientationResult } from "@/lib/finance/types";
import { formatCLP, formatUF } from "@/utils/format";

type ResultSummaryProps = {
  result: HousingOrientationResult;
  ufValue: number;
};

const viabilityStyles = {
  alta: "bg-emerald-50 text-emerald-900 border-emerald-200",
  media: "bg-sky-50 text-sky-900 border-sky-200",
  preparacion: "bg-amber-50 text-amber-900 border-amber-200",
};

export function ResultSummary({ result, ufValue }: ResultSummaryProps) {
  const debtPercentage = Math.round(result.mortgage.debtRatio * 100);

  return (
    <section className="space-y-5" aria-label="Resultado de orientacion">
      <div className={`rounded-2xl border p-5 shadow-sm ${viabilityStyles[result.viability]}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em]">Nivel de viabilidad</p>
        <h3 className="mt-2 text-xl font-bold text-balance">{result.viabilityLabel}</h3>
        <p className="mt-2 text-sm leading-6 opacity-85">{result.viabilityDetail}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Dividendo estimado" value={formatCLP(result.mortgage.monthlyPaymentClp)} detail={`${result.mortgage.monthlyPaymentUf.toFixed(1)} UF al mes`} />
        <Metric label="Valor maximo perfil" value={formatUF(result.maxRecommendedPriceUf)} detail="Mejor techo calculado" />
        <Metric label="RSH estimado" value={`${result.rshPercentile}%`} detail="Calculado por ingreso per capita" />
        <Metric label="Ahorro disponible" value={formatUF(result.savingsUf)} detail={formatCLP(result.savingsUf * ufValue)} />
        <Metric label="Carga mensual" value={`${debtPercentage}%`} detail="Del ingreso liquido declarado" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Tu perfil de subsidio</h3>
          <span className="text-xs font-semibold text-slate-500">{result.profileSubsidies.length} opciones</span>
        </div>
        <div className="grid gap-3">
          {result.profileSubsidies.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              No encontramos una ruta fuerte con estos datos. Revisa ingreso familiar, ahorro o una compra sin subsidio.
            </div>
          ) : null}
          {result.profileSubsidies.map((option) => (
            <article key={option.program.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-950">{option.program.name}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{option.program.friendlyName}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#e9f5ef] px-3 py-1 text-xs font-bold text-[#2f7a58]">
                  {option.isReady ? formatUF(option.maxHomeUf) : `Faltan ${option.missingSavingsUf.toFixed(1)} UF`}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <span className="block font-bold uppercase tracking-wide text-slate-400">Casa maxima</span>
                  <strong className="mt-1 block text-base text-slate-900">{formatUF(option.maxHomeUf)}</strong>
                </div>
                <div>
                  <span className="block font-bold uppercase tracking-wide text-slate-400">Subsidio aprox.</span>
                  <strong className="mt-1 block text-base text-slate-900">{formatUF(option.subsidyUf)}</strong>
                </div>
                <div>
                  <span className="block font-bold uppercase tracking-wide text-slate-400">Credito estimado</span>
                  <strong className="mt-1 block text-base text-slate-900">{formatUF(option.loanUf)}</strong>
                </div>
                <div>
                  <span className="block font-bold uppercase tracking-wide text-slate-400">Ahorro minimo</span>
                  <strong className="mt-1 block text-base text-slate-900">{formatUF(option.requiredSavingsUf)}</strong>
                </div>
              </div>

              {option.termScenarios.length > 1 ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {option.termScenarios.map((scenario) => (
                    <div key={scenario.years} className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{scenario.years} años</span>
                      <strong className="mt-1 block text-sm text-slate-900">{formatUF(scenario.maxHomeUf)}</strong>
                      <span className="mt-1 block text-[11px] font-semibold text-[#6b9ac4]">{formatCLP(scenario.dividendClp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                  Dividendo estimado: {option.estimatedDividendUf > 0 ? `${formatCLP(option.estimatedDividendClp)} al mes` : "sin hipotecario"}
                </p>
              )}
              <p className="mt-3 text-xs font-medium leading-5 text-slate-500">{option.reason}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white shadow-md">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Siguiente paso</p>
        <p className="mt-2 text-base font-semibold leading-6">{result.nextAction}</p>
      </div>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

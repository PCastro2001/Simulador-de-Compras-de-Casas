"use client";

import Link from "next/link";
import { useState } from "react";
import { useFirstHomeOrientation } from "@/hooks/useFirstHomeOrientation";
import type { HouseholdInput } from "@/lib/finance/types";
import { formatCLP, formatUF } from "@/utils/format";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { ResultSummary } from "@/components/results/ResultSummary";

const STEPS = ["Ingresos", "Ahorro", "Apoyos", "Resultado"];

type FirstHomeOnboardingProps = {
  ufValue: number;
};

export function FirstHomeOnboarding({ ufValue }: FirstHomeOnboardingProps) {
  const [step, setStep] = useState(0);
  const { input, result, updateInput } = useFirstHomeOrientation(ufValue);
  const canGoBack = step > 0;
  const canGoNext = step < STEPS.length - 1;

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-12">
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Orientacion primera vivienda</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-stone-950 text-balance md:text-5xl">
            Compra con mas claridad, no con mas formularios.
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-600">
            Te guiamos paso a paso para estimar que rango de vivienda mirar, que subsidios podrian ayudarte y que tan preparado esta tu perfil.
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <ProgressSteps steps={STEPS} currentStep={step} />
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm md:p-6">
          {step === 0 ? <IncomeStep input={input} updateInput={updateInput} ufValue={ufValue} /> : null}
          {step === 1 ? <SavingsStep input={input} updateInput={updateInput} ufValue={ufValue} /> : null}
          {step === 2 ? <SupportStep input={input} updateInput={updateInput} /> : null}
          {step === 3 ? <ClosingStep /> : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {canGoBack ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="min-h-12 rounded-lg border border-stone-200 px-5 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
              >
                Volver
              </button>
            ) : null}
            {canGoNext ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                className="min-h-12 flex-1 rounded-lg bg-stone-950 px-5 text-sm font-bold text-white transition hover:bg-stone-800"
              >
                Continuar
              </button>
            ) : (
              <Link
                href="/ofertas-inmobiliarias"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Ver proyectos compatibles
              </Link>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
        <ResultSummary result={result} ufValue={ufValue} />
      </aside>
    </section>
  );
}

type UpdateInput = <Key extends keyof HouseholdInput>(key: Key, value: HouseholdInput[Key]) => void;

function IncomeStep({ input, updateInput, ufValue }: { input: HouseholdInput; updateInput: UpdateInput; ufValue: number }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 1"
        title="Partamos por tu ingreso real"
        copy="Usamos una mirada conservadora para que el rango recomendado no te deje justo a fin de mes."
      />
      <MoneyInput
        id="monthly-income"
        label="Ingreso liquido mensual del hogar"
        helper="Puedes sumar ingresos estables de quienes comprarian contigo."
        value={input.monthlyIncomeClp}
        onChange={(value) => updateInput("monthlyIncomeClp", value)}
      />
      <Slider
        label="Personas en tu hogar"
        value={input.householdSize}
        min={1}
        max={6}
        suffix={input.householdSize === 1 ? "persona" : "personas"}
        onChange={(value) => updateInput("householdSize", value)}
      />
      <p className="rounded-lg bg-stone-50 p-4 text-sm leading-6 text-stone-600">
        UF usada para esta orientacion: <strong>{formatCLP(ufValue)}</strong>. Si la API no responde, usamos un valor de respaldo para no frenar tu recorrido.
      </p>
    </div>
  );
}

function SavingsStep({ input, updateInput, ufValue }: { input: HouseholdInput; updateInput: UpdateInput; ufValue: number }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 2"
        title="Veamos tu ahorro para comprar"
        copy="No buscamos un numero perfecto. Buscamos entender cuanto pie tienes hoy y que tan cerca estas de los apoyos disponibles."
      />
      <MoneyInput
        id="savings"
        label="Ahorro disponible para la vivienda"
        helper={`Hoy equivale aproximadamente a ${formatUF(input.savingsClp / ufValue)}.`}
        value={input.savingsClp}
        step={100000}
        onChange={(value) => updateInput("savingsClp", value)}
      />
      <div className="grid grid-cols-3 gap-2">
        {[1000000, 3000000, 6000000].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => updateInput("savingsClp", amount)}
            className="rounded-lg border border-stone-200 px-3 py-3 text-xs font-bold text-stone-700 transition hover:border-emerald-600 hover:text-emerald-700"
          >
            {formatCLP(amount)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SupportStep({ input, updateInput }: { input: HouseholdInput; updateInput: UpdateInput }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 3"
        title="Descubre que apoyo estatal podria calzar"
        copy="Si no conoces tu tramo RSH, no pasa nada. Podemos orientar igual y dejarlo como tarea siguiente."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleChoice selected={!input.hasSubsidy} title="Estoy explorando" copy="Aun no tengo subsidio asignado." onClick={() => updateInput("hasSubsidy", false)} />
        <ToggleChoice selected={input.hasSubsidy} title="Ya tengo avance" copy="Tengo subsidio o estoy postulando." onClick={() => updateInput("hasSubsidy", true)} />
      </div>
      <label className="block">
        <span className="text-sm font-semibold text-stone-900">Tramo RSH aproximado</span>
        <select
          value={input.rshSegment}
          onChange={(event) => updateInput("rshSegment", event.target.value as HouseholdInput["rshSegment"])}
          className="mt-3 min-h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-900 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        >
          <option value="unknown">No lo se todavia</option>
          <option value="40">Hasta 40%</option>
          <option value="60">Hasta 60%</option>
          <option value="80">Hasta 80%</option>
          <option value="90">Hasta 90%</option>
          <option value="over90">Sobre 90%</option>
        </select>
      </label>
    </div>
  );
}

function ClosingStep() {
  return (
    <div className="space-y-4">
      <StepHeader
        eyebrow="Paso 4"
        title="Tu mapa inicial esta listo"
        copy="Ahora tienes un rango recomendado, una estimacion de dividendo y subsidios compatibles para decidir donde mirar primero."
      />
      <p className="rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
        Este resultado es una orientacion inicial. La aprobacion final depende del banco, antiguedad laboral, deuda vigente, proyecto y reglas vigentes de cada subsidio.
      </p>
    </div>
  );
}

function StepHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-4 text-sm font-semibold text-stone-900">
        {label}
        <strong className="rounded-full bg-stone-100 px-3 py-1 text-xs">
          {value} {suffix}
        </strong>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-4 h-2 w-full accent-emerald-600" />
    </label>
  );
}

function ToggleChoice({ selected, title, copy, onClick }: { selected: boolean; title: string; copy: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        selected ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
      }`}
    >
      <span className="block text-sm font-bold">{title}</span>
      <span className="mt-1 block text-xs leading-5 opacity-80">{copy}</span>
    </button>
  );
}

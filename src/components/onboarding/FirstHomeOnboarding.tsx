"use client";

import Link from "next/link";
import { useState } from "react";
import { SUBSIDY_PROGRAMS, type SubsidyId } from "@/config/housing";
import { useFirstHomeOrientation } from "@/hooks/useFirstHomeOrientation";
import type { HouseholdInput } from "@/lib/finance/types";
import { formatCLP, formatUF } from "@/utils/format";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { ResultSummary } from "@/components/results/ResultSummary";

const STEPS = ["Registro", "RSH", "Perfil"];

type FirstHomeOnboardingProps = {
  ufValue: number;
};

type UpdateInput = <Key extends keyof HouseholdInput>(key: Key, value: HouseholdInput[Key]) => void;

const subsidyOptions = SUBSIDY_PROGRAMS.filter((program) => program.id !== "sin-subsidio");

export function FirstHomeOnboarding({ ufValue }: FirstHomeOnboardingProps) {
  const [step, setStep] = useState(0);
  const { input, result, updateInput } = useFirstHomeOrientation(ufValue);
  const canGoBack = step > 0;
  const canGoNext = step < STEPS.length - 1;

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-12">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] p-6 text-white shadow-md md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-50">Perfil SubsiMatch</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight drop-shadow-sm md:text-4xl">
            Registra tu perfil y descubre que casa puedes mirar.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 md:text-base">
            Ingresa tu sueldo, ahorro y situacion de subsidio. Si aun no tienes uno, te mostraremos las 2 mejores opciones para postular segun tu RSH.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ProgressSteps steps={STEPS} currentStep={step} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md md:p-6">
          {step === 0 ? <RegisterStep input={input} updateInput={updateInput} ufValue={ufValue} /> : null}
          {step === 1 ? <SubsidyStep input={input} updateInput={updateInput} /> : null}
          {step === 2 ? <ProfileStep input={input} resultCount={result.profileSubsidies.length} /> : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {canGoBack ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="min-h-12 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Volver
              </button>
            ) : null}
            {canGoNext ? (
              <button
                type="button"
                onClick={() => setStep((current) => current + 1)}
                className="min-h-12 flex-1 rounded-xl bg-[#87c0a3] px-5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-[#76b092]"
              >
                Continuar mi perfil
              </button>
            ) : (
              <Link
                href="/ofertas-inmobiliarias"
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Buscar proyectos para mi perfil
              </Link>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b9ac4]">Resultado en vivo</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {input.name ? `Perfil de ${input.name}` : "Tu perfil de compra"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Estos numeros se actualizan mientras completas el registro.
          </p>
        </div>
        <ResultSummary result={result} ufValue={ufValue} />
      </aside>
    </section>
  );
}

function RegisterStep({ input, updateInput, ufValue }: { input: HouseholdInput; updateInput: UpdateInput; ufValue: number }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 1"
        title="Datos base del comprador"
        copy="Con esto armamos un perfil simple: cuanto puedes pagar al mes y cuanto pie tienes hoy."
      />

      <label className="block">
        <span className="text-sm font-bold text-slate-800">Nombre</span>
        <input
          type="text"
          value={input.name}
          onChange={(event) => updateInput("name", event.target.value)}
          placeholder="Ej: Camila"
          className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
        />
      </label>

      <MoneyInput
        id="monthly-income"
        label="Sueldo liquido mensual"
        helper="Puedes sumar ingresos estables si compraras con otra persona."
        value={input.monthlyIncomeClp}
        onChange={(value) => updateInput("monthlyIncomeClp", value)}
      />

      <MoneyInput
        id="savings"
        label="Ahorro para la vivienda"
        helper={`Equivale aprox. a ${formatUF(input.savingsClp / ufValue)}.`}
        value={input.savingsClp}
        step={100000}
        onChange={(value) => updateInput("savingsClp", value)}
      />

      <div className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
        UF usada hoy: <strong className="text-slate-800">{formatCLP(ufValue)}</strong>. El calculo es referencial y se actualiza con la UF disponible.
      </div>
    </div>
  );
}

function SubsidyStep({ input, updateInput }: { input: HouseholdInput; updateInput: UpdateInput }) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 2"
        title="Situacion de subsidio y RSH"
        copy="Aqui definimos si el perfil debe recomendar postulaciones o calcular con un subsidio ya ganado."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleChoice
          selected={input.subsidyStatus === "none"}
          title="No tengo subsidio"
          copy="Quiero saber a cuales postular."
          onClick={() => updateInput("subsidyStatus", "none")}
        />
        <ToggleChoice
          selected={input.subsidyStatus === "won"}
          title="Ya tengo subsidio ganado"
          copy="Quiero saber hasta que valor puedo comprar."
          onClick={() => updateInput("subsidyStatus", "won")}
        />
      </div>

      {input.subsidyStatus === "won" ? (
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Subsidio ganado</span>
          <select
            value={input.wonSubsidyId}
            onChange={(event) => updateInput("wonSubsidyId", event.target.value as SubsidyId)}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
          >
            {subsidyOptions.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Tramo RSH aproximado</span>
          <select
            value={input.rshSegment}
            onChange={(event) => updateInput("rshSegment", event.target.value as HouseholdInput["rshSegment"])}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
          >
            <option value="unknown">No lo se todavia</option>
            <option value="40">Hasta 40%</option>
            <option value="60">Hasta 60%</option>
            <option value="80">Hasta 80%</option>
            <option value="90">Hasta 90%</option>
            <option value="over90">Sobre 90%</option>
          </select>
        </label>
      )}
    </div>
  );
}

function ProfileStep({ input, resultCount }: { input: HouseholdInput; resultCount: number }) {
  const hasWonSubsidy = input.subsidyStatus === "won";

  return (
    <div className="space-y-4">
      <StepHeader
        eyebrow="Paso 3"
        title={hasWonSubsidy ? "Perfil con subsidio ganado" : "Tus mejores rutas de postulacion"}
        copy={
          hasWonSubsidy
            ? "El perfil muestra el subsidio seleccionado y el valor maximo de vivienda que puedes mirar."
            : "El perfil muestra las mejores opciones de subsidio para postular y el techo de compra estimado en cada una."
        }
      />
      <div className="rounded-xl bg-[#eef6fb] p-4 text-sm leading-6 text-slate-700">
        {hasWonSubsidy
          ? "Con subsidio ganado, el siguiente paso es filtrar proyectos por precio, comuna y disponibilidad real."
          : `Encontramos ${resultCount} rutas recomendadas. La idea es priorizar la postulacion con mejor calce, no revisar todos los subsidios a la vez.`}
      </div>
    </div>
  );
}

function StepHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b9ac4]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
    </div>
  );
}

function ToggleChoice({ selected, title, copy, onClick }: { selected: boolean; title: string; copy: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[#6b9ac4] bg-[#eef6fb] text-slate-950 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-[#87c0a3]"
      }`}
    >
      <span className="block text-sm font-bold">{title}</span>
      <span className="mt-1 block text-xs leading-5 opacity-80">{copy}</span>
    </button>
  );
}

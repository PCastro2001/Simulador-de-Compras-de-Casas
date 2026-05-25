"use client";

import Link from "next/link";
import { useState } from "react";
import { BANKS } from "@/data/banks";
import { REGION_MAP } from "@/data/regions";
import { SUBSIDY_PROGRAMS, type SubsidyId } from "@/config/housing";
import { useFirstHomeOrientation } from "@/hooks/useFirstHomeOrientation";
import type { HouseholdInput } from "@/lib/finance/types";
import { formatCLP, formatUF } from "@/utils/format";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { ResultSummary } from "@/components/results/ResultSummary";

const STEPS = ["Camino", "Datos", "Resultado"];
const subsidyOptions = SUBSIDY_PROGRAMS.filter((program) => program.id !== "sin-subsidio");

type FirstHomeOnboardingProps = {
  ufValue: number;
};

type UpdateInput = <Key extends keyof HouseholdInput>(key: Key, value: HouseholdInput[Key]) => void;

export function FirstHomeOnboarding({ ufValue }: FirstHomeOnboardingProps) {
  const [step, setStep] = useState(0);
  const [savingsMode, setSavingsMode] = useState<"clp" | "uf">("clp");
  const { input, result, updateInput } = useFirstHomeOrientation(ufValue);
  const canGoBack = step > 0;
  const canGoNext = step < STEPS.length - 1;

  const choosePath = (status: HouseholdInput["subsidyStatus"]) => {
    updateInput("subsidyStatus", status);
    setStep(1);
  };

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[0.96fr_1.04fr] lg:px-8 lg:py-12">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] p-6 text-white shadow-md md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-50">Compra de primera vivienda</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight drop-shadow-sm md:text-4xl">
            Elige tu camino y descubre que subsidios puedes usar.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 md:text-base">
            Si no tienes subsidio, calculamos tu tramo RSH con tus datos y mostramos las mejores rutas. Si ya ganaste uno, estimamos el valor maximo de casa que puedes comprar.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ProgressSteps steps={STEPS} currentStep={step} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md md:p-6">
          {step === 0 ? <PathStep choosePath={choosePath} selected={input.subsidyStatus} /> : null}
          {step === 1 ? (
            <DataStep
              input={input}
              updateInput={updateInput}
              ufValue={ufValue}
              savingsMode={savingsMode}
              setSavingsMode={setSavingsMode}
            />
          ) : null}
          {step === 2 ? <ResultStep input={input} resultCount={result.profileSubsidies.length} /> : null}

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
                {step === 0 ? "Completar datos" : "Ver mi perfil"}
              </button>
            ) : (
              <Link
                href={buildProjectsHref(input, result.maxRecommendedPriceUf, result.profileSubsidies[0]?.loanUf ?? 0, ufValue)}
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
            RSH estimado: <strong className="text-slate-800">{result.rshPercentile}%</strong>. Region:{" "}
            <strong className="text-slate-800">{REGION_MAP[input.region]?.label ?? "Metropolitana"}</strong>.
          </p>
        </div>
        <ResultSummary result={result} ufValue={ufValue} />
      </aside>
    </section>
  );
}

function PathStep({
  choosePath,
  selected,
}: {
  choosePath: (status: HouseholdInput["subsidyStatus"]) => void;
  selected: HouseholdInput["subsidyStatus"];
}) {
  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 1"
        title="Primero dime desde donde partes"
        copy="Esta decision cambia el resultado: recomendar postulaciones o calcular el techo con un subsidio ganado."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <PathCard
          selected={selected === "none"}
          title="No tengo subsidio"
          copy="Quiero saber los mejores subsidios para postular segun mi RSH."
          action="Calcular mis opciones"
          onClick={() => choosePath("none")}
        />
        <PathCard
          selected={selected === "won"}
          title="Ya tengo subsidio"
          copy="Quiero saber hasta que valor de vivienda puedo comprar."
          action="Usar mi subsidio"
          onClick={() => choosePath("won")}
        />
      </div>
    </div>
  );
}

function DataStep({
  input,
  updateInput,
  ufValue,
  savingsMode,
  setSavingsMode,
}: {
  input: HouseholdInput;
  updateInput: UpdateInput;
  ufValue: number;
  savingsMode: "clp" | "uf";
  setSavingsMode: (mode: "clp" | "uf") => void;
}) {
  const savingsUf = input.savingsClp / ufValue;

  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Paso 2"
        title="Completa tu perfil de compra"
        copy="El tramo RSH se estima automaticamente con sueldo y personas del hogar; no tienes que adivinarlo."
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

      <div className="grid gap-4 md:grid-cols-2">
        <MoneyInput
          id="monthly-income"
          label="Sueldo liquido mensual del hogar"
          helper="Se usa para calcular RSH estimado y dividendo maximo."
          value={input.monthlyIncomeClp}
          onChange={(value) => updateInput("monthlyIncomeClp", value)}
        />
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Personas en el hogar</span>
          <select
            value={input.householdSize}
            onChange={(event) => updateInput("householdSize", Number(event.target.value))}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
              <option key={size} value={size}>
                {size} {size === 1 ? "persona" : "personas"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex rounded-xl bg-white p-1">
          <button
            type="button"
            onClick={() => setSavingsMode("clp")}
            className={`min-h-10 flex-1 rounded-lg text-sm font-bold transition ${savingsMode === "clp" ? "bg-[#6b9ac4] text-white" : "text-slate-500"}`}
          >
            Ahorro en pesos
          </button>
          <button
            type="button"
            onClick={() => setSavingsMode("uf")}
            className={`min-h-10 flex-1 rounded-lg text-sm font-bold transition ${savingsMode === "uf" ? "bg-[#6b9ac4] text-white" : "text-slate-500"}`}
          >
            Ahorro en UF
          </button>
        </div>
        {savingsMode === "clp" ? (
          <MoneyInput
            id="savings-clp"
            label="Ahorro para la vivienda"
            helper={`Equivale aprox. a ${formatUF(savingsUf)}.`}
            value={input.savingsClp}
            step={100000}
            onChange={(value) => updateInput("savingsClp", value)}
          />
        ) : (
          <UfInput
            value={savingsUf}
            onChange={(value) => updateInput("savingsClp", value * ufValue)}
          />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Region donde quieres comprar</span>
          <select
            value={input.region}
            onChange={(event) => updateInput("region", event.target.value)}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
          >
            {Object.keys(REGION_MAP).map((key) => (
              <option key={key} value={key}>
                {REGION_MAP[key].label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Tipo de vivienda</span>
          <select
            value={input.propertyType}
            onChange={(event) => updateInput("propertyType", event.target.value as HouseholdInput["propertyType"])}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
          >
            <option value="ambos">Casas y departamentos</option>
            <option value="casa">Solo casas</option>
            <option value="depto">Solo departamentos</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Banco de referencia</span>
          <select
            value={input.bankId}
            onChange={(event) => updateInput("bankId", event.target.value)}
            className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
          >
            {Object.keys(BANKS).map((key) => (
              <option key={key} value={key}>
                {BANKS[key].name}
              </option>
            ))}
          </select>
        </label>
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
            <span className="text-sm font-bold text-slate-800">Zona para DS49</span>
            <select
              value={input.zoneType}
              onChange={(event) => updateInput("zoneType", event.target.value as HouseholdInput["zoneType"])}
              className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#6b9ac4] focus:bg-white focus:ring-4 focus:ring-[#6b9ac4]/10"
            >
              <option value="urban">Urbana</option>
              <option value="rural">Rural</option>
            </select>
          </label>
        )}
      </div>

      <div className="rounded-xl bg-[#eef6fb] p-4 text-xs leading-5 text-slate-600">
        UF usada hoy: <strong className="text-slate-800">{formatCLP(ufValue)}</strong>. El resultado usa tu region y una tasa bancaria de referencia para estimar los valores.
      </div>
    </div>
  );
}

function ResultStep({ input, resultCount }: { input: HouseholdInput; resultCount: number }) {
  const hasWonSubsidy = input.subsidyStatus === "won";

  return (
    <div className="space-y-4">
      <StepHeader
        eyebrow="Paso 3"
        title={hasWonSubsidy ? "Techo de compra con tu subsidio" : "Tus mejores rutas para empezar"}
        copy={
          hasWonSubsidy
            ? "El resultado usa el subsidio que seleccionaste y calcula el valor maximo de vivienda."
            : "El sistema prioriza dos rutas para no mostrarte todas las opciones al mismo tiempo."
        }
      />
      <div className="rounded-xl bg-[#eef6fb] p-4 text-sm leading-6 text-slate-700">
        {hasWonSubsidy
          ? "Ahora puedes buscar proyectos con el valor maximo calculado."
          : `Encontramos ${resultCount} rutas principales. Si alguna pide mas ahorro, se muestra cuanto falta antes de postular.`}
      </div>
    </div>
  );
}

function PathCard({
  selected,
  title,
  copy,
  action,
  onClick,
}: {
  selected: boolean;
  title: string;
  copy: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-[#6b9ac4] bg-[#eef6fb]" : "border-slate-200 bg-white"
      }`}
    >
      <span className="block text-lg font-bold text-slate-950">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-slate-500">{copy}</span>
      <span className="mt-5 inline-flex rounded-xl bg-[#87c0a3] px-4 py-2 text-xs font-bold text-slate-950">
        {action}
      </span>
    </button>
  );
}

function UfInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const displayValue = value > 0 ? String(Number(value.toFixed(1))) : "";

  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">Ahorro en UF</span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">Ingresa el mismo ahorro si lo conoces en UF.</span>
      <div className="mt-3 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition focus-within:border-[#6b9ac4] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#6b9ac4]/10">
        <input
          type="number"
          min="0"
          step="0.1"
          value={displayValue}
          onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
          className="min-h-12 w-full border-0 bg-transparent px-2 text-base font-semibold text-slate-950 outline-none"
        />
        <span className="text-sm font-bold text-slate-400">UF</span>
      </div>
    </label>
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

function buildProjectsHref(input: HouseholdInput, maxUf: number, creditUf: number, ufValue: number) {
  const roundedUf = Math.round(maxUf);
  const origin = input.subsidyStatus === "won" ? input.wonSubsidyId.replace("-", "") : "perfil";
  const propertyType = input.propertyType === "depto" ? "departamento" : input.propertyType;

  return `/ofertas-inmobiliarias?maxPrice=${Math.round(roundedUf * ufValue)}&maxUF=${roundedUf}&credit=${Math.round(creditUf)}&origin=${origin}&region=${input.region}&propertyType=${propertyType}`;
}

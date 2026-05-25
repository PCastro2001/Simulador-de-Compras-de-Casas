import { BANKS } from "@/data/banks";
import { LEGAL_ASSUMPTIONS, SUBSIDY_PROGRAMS, type SubsidyId, type SubsidyProgram } from "@/config/housing";
import type { HouseholdInput, HousingOrientationResult, MortgageCapacity, SubsidyProfileOption, TermScenario } from "./types";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const TERMS: Array<20 | 25 | 30> = [20, 25, 30];

const RSH_THRESHOLDS = [
  { max: 82320, percentile: 10 },
  { max: 141488, percentile: 20 },
  { max: 195510, percentile: 30 },
  { max: 246960, percentile: 40 },
  { max: 308700, percentile: 50 },
  { max: 398493, percentile: 60 },
  { max: 514500, percentile: 70 },
  { max: 699720, percentile: 80 },
  { max: 1151624, percentile: 90 },
];

export function calculateRshPercentile(monthlyIncomeClp: number, householdSize: number): number {
  const safeSize = Math.max(householdSize, 1);
  const perCapitaIncome = monthlyIncomeClp / safeSize;
  const found = RSH_THRESHOLDS.find((threshold) => perCapitaIncome < threshold.max);
  return found ? found.percentile : 100;
}

function getDebtRatio(householdSize: number): number {
  return householdSize === 1 ? 1 / 3 : LEGAL_ASSUMPTIONS.maxDebtRatio;
}

function getDS1Zone(region: string) {
  if (["arica-y-parinacota", "tarapaca", "antofagasta", "atacama"].includes(region)) return "north";
  if (["aysen", "magallanes"].includes(region)) return "south";
  return "none";
}

function getDS19LocationZone(region: string) {
  if (["aysen", "magallanes"].includes(region)) return "sur_islas";
  if (["arica-y-parinacota", "tarapaca", "antofagasta", "atacama", "metropolitana", "valparaiso", "biobio"].includes(region)) {
    return "urbana_norte_stgo";
  }
  return "regular";
}

function getAnnualRate(bankId: string, loanUf: number, termYears: number): number {
  const bankData = BANKS[bankId] ?? BANKS.BancoEstado;
  return bankData.calcularTasa ? bankData.calcularTasa(loanUf, termYears) : bankData.tasaBase ?? LEGAL_ASSUMPTIONS.defaultAnnualRate;
}

function getMaxLoanUf(monthlyIncomeClp: number, ufValue: number, householdSize: number, bankId: string, termYears: number) {
  const maxMonthlyPaymentUf = (monthlyIncomeClp / ufValue) * getDebtRatio(householdSize);
  const annualRate = getAnnualRate(bankId, 1000, termYears);
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  const maxLoanUf = maxMonthlyPaymentUf * ((1 - Math.pow(1 + monthlyRate, -totalPayments)) / monthlyRate);

  return { maxLoanUf, maxMonthlyPaymentUf, annualRate };
}

function getPaymentForLoanUf(loanUf: number, bankId: string, termYears: number) {
  const annualRate = getAnnualRate(bankId, loanUf, termYears);
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  return loanUf > 0 ? (loanUf * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments)) : 0;
}

export function calculateMortgageCapacity(
  monthlyIncomeClp: number,
  ufValue: number,
  annualRate: number = LEGAL_ASSUMPTIONS.defaultAnnualRate,
  termYears: number = LEGAL_ASSUMPTIONS.defaultTermYears,
  debtRatio: number = LEGAL_ASSUMPTIONS.maxDebtRatio,
): MortgageCapacity {
  const safeIncome = Math.max(monthlyIncomeClp, 0);
  const monthlyPaymentClp = safeIncome * debtRatio;
  const monthlyPaymentUf = monthlyPaymentClp / ufValue;
  const monthlyRate = annualRate / 12;
  const totalPayments = termYears * 12;
  const maxLoanUf =
    monthlyRate > 0
      ? monthlyPaymentUf * ((1 - Math.pow(1 + monthlyRate, -totalPayments)) / monthlyRate)
      : monthlyPaymentUf * totalPayments;
  const recommendedHomeUf = maxLoanUf / (1 - LEGAL_ASSUMPTIONS.minimumDownPaymentRatio);

  return {
    monthlyPaymentClp,
    monthlyPaymentUf,
    maxLoanUf,
    recommendedHomeUf,
    recommendedMinUf: recommendedHomeUf * 0.82,
    debtRatio,
  };
}

function getDS1T1Value(input: HouseholdInput, savingsUf: number, ufValue: number, termYears: number) {
  const zone = getDS1Zone(input.region);
  const { maxLoanUf, maxMonthlyPaymentUf } = getMaxLoanUf(input.monthlyIncomeClp, ufValue, input.householdSize, input.bankId, termYears);
  const subsidyUf = zone === "north" ? 700 : zone === "south" ? 750 : 600;
  const legalMaxCap = zone === "north" ? 1200 : zone === "south" ? 1250 : 1100;
  const maxHomeUf = Math.min(maxLoanUf + savingsUf + subsidyUf, legalMaxCap);
  return { maxHomeUf, subsidyUf, loanUf: Math.max(maxHomeUf - savingsUf - subsidyUf, 0), maxMonthlyPaymentUf };
}

function getDS1T2Value(input: HouseholdInput, savingsUf: number, ufValue: number, termYears: number) {
  const zone = getDS1Zone(input.region);
  const { maxLoanUf, maxMonthlyPaymentUf } = getMaxLoanUf(input.monthlyIncomeClp, ufValue, input.householdSize, input.bankId, termYears);
  const baseCapacity = maxLoanUf + savingsUf;
  let maxHomeUf = 0;
  let subsidyUf = 0;

  if (zone === "none") {
    const projected = (baseCapacity + 550 + 0.375 * 800) / 1.375;
    if (projected <= 800) {
      maxHomeUf = baseCapacity + 550;
      subsidyUf = 550;
    } else if (projected <= 1600) {
      maxHomeUf = projected;
      subsidyUf = 550 - (projected - 800) * 0.375;
    } else {
      maxHomeUf = baseCapacity + 250;
      subsidyUf = 250;
    }
  } else if (zone === "north") {
    const projected = (baseCapacity + 650 + 0.375 * 800) / 1.375;
    if (projected <= 800) {
      maxHomeUf = baseCapacity + 650;
      subsidyUf = 650;
    } else if (projected <= 1600) {
      maxHomeUf = projected;
      subsidyUf = 650 - (projected - 800) * 0.375;
    } else {
      maxHomeUf = baseCapacity + 350;
      subsidyUf = 350;
    }
  } else {
    const projected = (baseCapacity + 700 + 0.375 * 800) / 1.375;
    if (projected <= 800) {
      maxHomeUf = baseCapacity + 700;
      subsidyUf = 700;
    } else if (projected <= 1600) {
      maxHomeUf = projected;
      subsidyUf = 700 - (projected - 800) * 0.375;
    } else {
      maxHomeUf = baseCapacity + 400;
      subsidyUf = 400;
    }
  }

  maxHomeUf = Math.min(maxHomeUf, 1600);
  return { maxHomeUf, subsidyUf, loanUf: Math.max(maxHomeUf - savingsUf - subsidyUf, 0), maxMonthlyPaymentUf };
}

function getDS1T3Value(input: HouseholdInput, savingsUf: number, ufValue: number, termYears: number) {
  const zone = getDS1Zone(input.region);
  const { maxLoanUf, maxMonthlyPaymentUf } = getMaxLoanUf(input.monthlyIncomeClp, ufValue, input.householdSize, input.bankId, termYears);
  const baseCapacity = maxLoanUf + savingsUf;
  let maxHomeUf = 0;
  let subsidyUf = 0;
  let legalMaxCap = 2200;

  if (zone === "none") {
    const projected = (baseCapacity + 400 + 125) / 1.125;
    if (projected <= 1000) {
      maxHomeUf = baseCapacity + 400;
      subsidyUf = 400;
    } else if (projected <= 2200) {
      maxHomeUf = projected;
      subsidyUf = 400 - (projected - 1000) * 0.125;
    } else {
      maxHomeUf = baseCapacity + 250;
      subsidyUf = 250;
    }
  } else if (zone === "north") {
    legalMaxCap = 2600;
    const projected = (baseCapacity + 500 + 1200 / 7) / (8 / 7);
    if (projected <= 1200) {
      maxHomeUf = baseCapacity + 500;
      subsidyUf = 500;
    } else if (projected <= 2600) {
      maxHomeUf = projected;
      subsidyUf = 500 - (projected - 1200) / 7;
    } else {
      maxHomeUf = baseCapacity + 300;
      subsidyUf = 300;
    }
  } else {
    legalMaxCap = 2600;
    const projected = (baseCapacity + 550 + 1200 / 7) / (8 / 7);
    if (projected <= 1200) {
      maxHomeUf = baseCapacity + 550;
      subsidyUf = 550;
    } else if (projected <= 2600) {
      maxHomeUf = projected;
      subsidyUf = 550 - (projected - 1200) / 7;
    } else {
      maxHomeUf = baseCapacity + 350;
      subsidyUf = 350;
    }
  }

  maxHomeUf = Math.min(maxHomeUf, legalMaxCap);
  return { maxHomeUf, subsidyUf, loanUf: Math.max(maxHomeUf - savingsUf - subsidyUf, 0), maxMonthlyPaymentUf };
}

function getDS1T4Value(input: HouseholdInput, savingsUf: number, ufValue: number, termYears: number) {
  const { maxLoanUf, maxMonthlyPaymentUf } = getMaxLoanUf(input.monthlyIncomeClp, ufValue, input.householdSize, input.bankId, termYears);
  const subsidyUf = 400;
  const maxHomeUf = Math.min(maxLoanUf + savingsUf + subsidyUf, 4000);
  return { maxHomeUf, subsidyUf, loanUf: Math.max(maxHomeUf - savingsUf - subsidyUf, 0), maxMonthlyPaymentUf };
}

function getDS19Value(input: HouseholdInput, savingsUf: number, ufValue: number, termYears: number) {
  const location = getDS19LocationZone(input.region);
  const { maxLoanUf, maxMonthlyPaymentUf } = getMaxLoanUf(input.monthlyIncomeClp, ufValue, input.householdSize, input.bankId, termYears);
  const maxLimit = location === "sur_islas" ? 3000 : location === "urbana_norte_stgo" ? 2800 : 2600;
  const subsidyUf = location === "sur_islas" ? 500 : 350;
  const maxHomeUf = Math.min(maxLoanUf + savingsUf + subsidyUf, maxLimit);
  return { maxHomeUf, subsidyUf, loanUf: Math.max(maxHomeUf - savingsUf - subsidyUf, 0), maxMonthlyPaymentUf };
}

function getDS49Value(input: HouseholdInput, savingsUf: number) {
  const urbanBonus = input.zoneType === "urban" ? 100 : 0;
  const extraSavings = Math.max(0, savingsUf - 10);
  const savingsBonus = Math.min(250, extraSavings * 5);
  const subsidyUf = 800 + urbanBonus + savingsBonus;
  const maxHomeUf = Math.min(1300, savingsUf + subsidyUf);
  return { maxHomeUf, subsidyUf, loanUf: 0, maxMonthlyPaymentUf: 0 };
}

function getValueForSubsidy(input: HouseholdInput, subsidyId: SubsidyId, savingsUf: number, ufValue: number, termYears: number) {
  if (subsidyId === "ds49") return getDS49Value(input, savingsUf);
  if (subsidyId === "ds1-t1") return getDS1T1Value(input, savingsUf, ufValue, termYears);
  if (subsidyId === "ds1-t2") return getDS1T2Value(input, savingsUf, ufValue, termYears);
  if (subsidyId === "ds1-t3") return getDS1T3Value(input, savingsUf, ufValue, termYears);
  if (subsidyId === "ds1-t4") return getDS1T4Value(input, savingsUf, ufValue, termYears);
  if (subsidyId === "ds19") return getDS19Value(input, savingsUf, ufValue, termYears);
  return getDS1T3Value(input, savingsUf, ufValue, termYears);
}

function isCandidateByRsh(program: SubsidyProgram, rshPercentile: number, input: HouseholdInput) {
  if (program.id === "sin-subsidio") return false;
  if (program.id === "ds49") return rshPercentile <= 40;
  if (program.id === "ds1-t1") return rshPercentile <= 60;
  if (program.id === "ds1-t2") return rshPercentile <= 80;
  if (program.id === "ds1-t3") return !(input.householdSize === 1 && input.monthlyIncomeClp > 1500000);
  if (program.id === "ds1-t4") return !(input.householdSize === 1 && input.monthlyIncomeClp > 2300000);
  if (program.id === "ds19") return rshPercentile <= 90 || input.subsidyStatus === "won";
  return false;
}

export function getCompatibleSubsidies(input: HouseholdInput, ufValue: number) {
  const rshPercentile = calculateRshPercentile(input.monthlyIncomeClp, input.householdSize);

  if (input.subsidyStatus === "won") {
    return SUBSIDY_PROGRAMS.filter((program) => program.id === input.wonSubsidyId);
  }

  const savingsUf = input.savingsClp / ufValue;
  const candidates = SUBSIDY_PROGRAMS.filter((program) => isCandidateByRsh(program, rshPercentile, input));

  return candidates
    .map((program) => {
      const value = getValueForSubsidy(input, program.id, savingsUf, ufValue, 25);
      const missingSavingsUf = Math.max(program.minSavingsUf - savingsUf, 0);
      const ds49Priority = program.id === "ds49" ? 10000 : 0;
      const readyPriority = missingSavingsUf === 0 ? 5000 : 0;
      return { program, score: ds49Priority + readyPriority + value.maxHomeUf - missingSavingsUf * 20 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((candidate) => candidate.program);
}

export function buildSubsidyProfileOptions(input: HouseholdInput, ufValue: number): SubsidyProfileOption[] {
  const savingsUf = input.savingsClp / ufValue;
  const programs = getCompatibleSubsidies(input, ufValue);

  return programs.map((program) => {
    const scenarioTerms = program.id === "ds1-t2" || program.id === "ds1-t3" || program.id === "ds1-t4" || program.id === "ds19" ? TERMS : [25 as const];
    const termScenarios: TermScenario[] = scenarioTerms.map((years) => {
      const value = getValueForSubsidy(input, program.id, savingsUf, ufValue, years);
      const dividendUf = value.loanUf > 0 ? getPaymentForLoanUf(value.loanUf, input.bankId, years) : 0;

      return {
        years,
        maxHomeUf: value.maxHomeUf,
        dividendUf,
        dividendClp: dividendUf * ufValue,
      };
    });
    const mainScenario = termScenarios.find((scenario) => scenario.years === 25) ?? termScenarios[0];
    const mainValue = getValueForSubsidy(input, program.id, savingsUf, ufValue, mainScenario.years);
    const missingSavingsUf = Math.max(program.minSavingsUf - savingsUf, 0);

    return {
      program,
      maxHomeUf: mainScenario.maxHomeUf,
      estimatedDividendUf: mainScenario.dividendUf,
      estimatedDividendClp: mainScenario.dividendClp,
      requiredSavingsUf: program.minSavingsUf,
      missingSavingsUf,
      loanUf: mainValue.loanUf,
      subsidyUf: mainValue.subsidyUf,
      isReady: missingSavingsUf === 0,
      termScenarios,
      reason:
        input.subsidyStatus === "won"
          ? "Como ya lo tienes ganado, usamos este subsidio para calcular el techo de compra."
          : missingSavingsUf > 0
            ? `Aparece por tu RSH, pero te faltan ${missingSavingsUf.toFixed(1)} UF de ahorro minimo.`
            : "Aparece como una de tus rutas mas fuertes segun RSH, ahorro, region e ingreso.",
    };
  });
}

export function orientFirstHome(input: HouseholdInput, ufValue: number): HousingOrientationResult {
  const savingsUf = input.savingsClp / ufValue;
  const rshPercentile = calculateRshPercentile(input.monthlyIncomeClp, input.householdSize);
  const debtRatio = getDebtRatio(input.householdSize);
  const mortgage = calculateMortgageCapacity(input.monthlyIncomeClp, ufValue, LEGAL_ASSUMPTIONS.defaultAnnualRate, 25, debtRatio);
  const compatibleSubsidies = getCompatibleSubsidies(input, ufValue);
  const profileSubsidies = buildSubsidyProfileOptions(input, ufValue);
  const maxRecommendedPriceUf = Math.max(...profileSubsidies.map((option) => option.maxHomeUf), 0);

  const hasReadyRoute = profileSubsidies.some((option) => option.isReady && option.maxHomeUf > 0);
  const hasEntryRange = maxRecommendedPriceUf >= 1000;

  if (hasReadyRoute && hasEntryRange) {
    return {
      savingsUf,
      rshPercentile,
      compatibleSubsidies,
      profileSubsidies,
      mortgage,
      maxRecommendedPriceUf,
      viability: "alta",
      viabilityLabel: "Perfil con ruta clara",
      viabilityDetail: "Ya hay al menos una ruta de subsidio con ahorro suficiente para empezar a mirar viviendas.",
      nextAction: "Elige la ruta principal y filtra proyectos por region, precio y tipo de vivienda.",
    };
  }

  if (profileSubsidies.length > 0) {
    return {
      savingsUf,
      rshPercentile,
      compatibleSubsidies,
      profileSubsidies,
      mortgage,
      maxRecommendedPriceUf,
      viability: "media",
      viabilityLabel: "Perfil con camino por ordenar",
      viabilityDetail: "El sistema encontro subsidios posibles, pero hay que ajustar ahorro minimo o techo de compra.",
      nextAction: "Prioriza la ruta con menor ahorro faltante y calcula el plazo que mejor calza.",
    };
  }

  return {
    savingsUf,
    rshPercentile,
    compatibleSubsidies,
    profileSubsidies,
    mortgage,
    maxRecommendedPriceUf,
    viability: "preparacion",
    viabilityLabel: "Primero hay que preparar el perfil",
    viabilityDetail: "Con los datos actuales no aparece una ruta fuerte de subsidio para recomendar.",
    nextAction: "Revisa ingreso familiar, ahorro y opciones sin subsidio antes de buscar proyectos.",
  };
}

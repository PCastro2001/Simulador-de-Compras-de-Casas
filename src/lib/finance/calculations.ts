import { LEGAL_ASSUMPTIONS, SUBSIDY_PROGRAMS } from "@/config/housing";
import type { HouseholdInput, HousingOrientationResult, MortgageCapacity } from "./types";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function calculateMortgageCapacity(
  monthlyIncomeClp: number,
  ufValue: number,
  annualRate = LEGAL_ASSUMPTIONS.defaultAnnualRate,
  termYears = LEGAL_ASSUMPTIONS.defaultTermYears,
): MortgageCapacity {
  const safeIncome = Math.max(monthlyIncomeClp, 0);
  const monthlyPaymentClp = safeIncome * LEGAL_ASSUMPTIONS.maxDebtRatio;
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
    debtRatio: LEGAL_ASSUMPTIONS.maxDebtRatio,
  };
}

export function getCompatibleSubsidies(input: HouseholdInput, ufValue: number) {
  const savingsUf = input.savingsClp / ufValue;
  const rshOrder = { unknown: 100, "40": 40, "60": 60, "80": 80, "90": 90, over90: 101 };
  const rsh = rshOrder[input.rshSegment];

  return SUBSIDY_PROGRAMS.filter((program) => {
    if (program.id === "sin-subsidio") return true;
    if (input.hasSubsidy && program.id === "ds19") return true;
    if (savingsUf < program.minSavingsUf * 0.75) return false;
    if (program.id === "ds1-t1") return rsh <= 60 || input.rshSegment === "unknown";
    if (program.id === "ds1-t2") return rsh <= 80 || input.rshSegment === "unknown";
    if (program.id === "ds1-t3" || program.id === "ds19") return rsh <= 90 || input.rshSegment === "unknown";
    return false;
  }).slice(0, 3);
}

export function orientFirstHome(input: HouseholdInput, ufValue: number): HousingOrientationResult {
  const savingsUf = input.savingsClp / ufValue;
  const mortgage = calculateMortgageCapacity(input.monthlyIncomeClp, ufValue);
  const compatibleSubsidies = getCompatibleSubsidies(input, ufValue);
  const bestSupportUf = Math.max(...compatibleSubsidies.map((program) => program.estimatedSupportUf));
  const priceWithSavingsAndSupport = mortgage.maxLoanUf + savingsUf + bestSupportUf;
  const maxRecommendedPriceUf = clamp(
    Math.min(priceWithSavingsAndSupport, mortgage.recommendedHomeUf + bestSupportUf),
    0,
    4500,
  );

  const hasStrongSavings = savingsUf >= 40;
  const hasBankableIncome = input.monthlyIncomeClp >= 750000;
  const hasEntryRange = maxRecommendedPriceUf >= 1200;

  if (hasStrongSavings && hasBankableIncome && hasEntryRange) {
    return {
      savingsUf,
      compatibleSubsidies,
      mortgage,
      maxRecommendedPriceUf,
      viability: "alta",
      viabilityLabel: "Buen punto de partida",
      viabilityDetail: "Tu perfil ya permite mirar alternativas concretas y comparar proyectos compatibles.",
      nextAction: "Revisar proyectos y preparar preaprobacion bancaria.",
    };
  }

  if ((hasBankableIncome && savingsUf >= 20) || maxRecommendedPriceUf >= 950) {
    return {
      savingsUf,
      compatibleSubsidies,
      mortgage,
      maxRecommendedPriceUf,
      viability: "media",
      viabilityLabel: "Camino viable con ajustes",
      viabilityDetail: "Hay opciones posibles, pero conviene ajustar ahorro, tramo o precio objetivo.",
      nextAction: "Afinar tramo RSH y priorizar viviendas dentro del rango recomendado.",
    };
  }

  return {
    savingsUf,
    compatibleSubsidies,
    mortgage,
    maxRecommendedPriceUf,
    viability: "preparacion",
    viabilityLabel: "Etapa de preparacion",
    viabilityDetail: "Todavia puedes avanzar, pero el foco debe estar en ahorro, tramo y orden financiero.",
    nextAction: "Construir ahorro base y descubrir que apoyo estatal podria acercarte.",
  };
}

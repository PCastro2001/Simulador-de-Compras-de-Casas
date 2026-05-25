import { LEGAL_ASSUMPTIONS, SUBSIDY_PROGRAMS } from "@/config/housing";
import type { HouseholdInput, HousingOrientationResult, MortgageCapacity, SubsidyProfileOption } from "./types";

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

  if (input.subsidyStatus === "won") {
    return SUBSIDY_PROGRAMS.filter((program) => program.id === input.wonSubsidyId);
  }

  return SUBSIDY_PROGRAMS.filter((program) => {
    if (program.id === "sin-subsidio") return true;
    if (savingsUf < program.minSavingsUf * 0.75) return false;
    if (program.id === "ds1-t1") return rsh <= 60 || input.rshSegment === "unknown";
    if (program.id === "ds1-t2") return rsh <= 80 || input.rshSegment === "unknown";
    if (program.id === "ds1-t3" || program.id === "ds19") return rsh <= 90 || input.rshSegment === "unknown";
    return false;
  }).slice(0, 2);
}

export function buildSubsidyProfileOptions(input: HouseholdInput, ufValue: number): SubsidyProfileOption[] {
  const savingsUf = input.savingsClp / ufValue;
  const mortgage = calculateMortgageCapacity(input.monthlyIncomeClp, ufValue);
  const programs = getCompatibleSubsidies(input, ufValue);

  return programs.map((program) => {
    const affordableWithSupport = mortgage.maxLoanUf + savingsUf + program.estimatedSupportUf;
    const maxHomeUf = clamp(Math.min(affordableWithSupport, program.maxHomeUf), 0, program.maxHomeUf);
    const financedUf = Math.max(maxHomeUf - savingsUf - program.estimatedSupportUf, 0);
    const loanRatio = mortgage.maxLoanUf > 0 ? financedUf / mortgage.maxLoanUf : 0;
    const estimatedDividendUf = mortgage.monthlyPaymentUf * clamp(loanRatio, 0, 1);

    return {
      program,
      maxHomeUf,
      estimatedDividendUf,
      estimatedDividendClp: estimatedDividendUf * ufValue,
      requiredSavingsUf: program.minSavingsUf,
      reason:
        input.subsidyStatus === "won"
          ? "Como ya lo tienes ganado, el foco pasa a buscar viviendas dentro de este techo."
          : `Por tu RSH y ahorro, aparece como una de tus mejores rutas para postular.`,
    };
  });
}

export function orientFirstHome(input: HouseholdInput, ufValue: number): HousingOrientationResult {
  const savingsUf = input.savingsClp / ufValue;
  const mortgage = calculateMortgageCapacity(input.monthlyIncomeClp, ufValue);
  const compatibleSubsidies = getCompatibleSubsidies(input, ufValue);
  const profileSubsidies = buildSubsidyProfileOptions(input, ufValue);
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
      profileSubsidies,
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
      profileSubsidies,
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
    profileSubsidies,
    mortgage,
    maxRecommendedPriceUf,
    viability: "preparacion",
    viabilityLabel: "Etapa de preparacion",
    viabilityDetail: "Todavia puedes avanzar, pero el foco debe estar en ahorro, tramo y orden financiero.",
    nextAction: "Construir ahorro base y descubrir que apoyo estatal podria acercarte.",
  };
}

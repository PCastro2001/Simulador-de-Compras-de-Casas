import type { SubsidyId, SubsidyProgram } from "@/config/housing";

export type HouseholdInput = {
  name: string;
  monthlyIncomeClp: number;
  savingsClp: number;
  householdSize: number;
  subsidyStatus: "none" | "won";
  wonSubsidyId: SubsidyId;
  region: string;
  bankId: string;
  propertyType: "casa" | "depto" | "ambos";
  zoneType: "urban" | "rural";
};

export type MortgageCapacity = {
  monthlyPaymentClp: number;
  monthlyPaymentUf: number;
  maxLoanUf: number;
  recommendedHomeUf: number;
  recommendedMinUf: number;
  debtRatio: number;
};

export type HousingOrientationResult = {
  savingsUf: number;
  rshPercentile: number;
  compatibleSubsidies: SubsidyProgram[];
  profileSubsidies: SubsidyProfileOption[];
  mortgage: MortgageCapacity;
  maxRecommendedPriceUf: number;
  viability: "alta" | "media" | "preparacion";
  viabilityLabel: string;
  viabilityDetail: string;
  nextAction: string;
};

export type SubsidyProfileOption = {
  program: SubsidyProgram;
  maxHomeUf: number;
  estimatedDividendClp: number;
  estimatedDividendUf: number;
  requiredSavingsUf: number;
  missingSavingsUf: number;
  loanUf: number;
  subsidyUf: number;
  isReady: boolean;
  termScenarios: TermScenario[];
  reason: string;
};

export type TermScenario = {
  years: 20 | 25 | 30;
  maxHomeUf: number;
  dividendUf: number;
  dividendClp: number;
};

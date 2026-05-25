import type { SubsidyProgram } from "@/config/housing";

export type HouseholdInput = {
  monthlyIncomeClp: number;
  savingsClp: number;
  householdSize: number;
  hasSubsidy: boolean;
  rshSegment: "unknown" | "40" | "60" | "80" | "90" | "over90";
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
  compatibleSubsidies: SubsidyProgram[];
  mortgage: MortgageCapacity;
  maxRecommendedPriceUf: number;
  viability: "alta" | "media" | "preparacion";
  viabilityLabel: string;
  viabilityDetail: string;
  nextAction: string;
};

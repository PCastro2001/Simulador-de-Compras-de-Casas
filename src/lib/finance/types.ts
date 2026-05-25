import type { SubsidyId, SubsidyProgram } from "@/config/housing";

export type HouseholdInput = {
  name: string;
  monthlyIncomeClp: number;
  savingsClp: number;
  householdSize: number;
  subsidyStatus: "none" | "won";
  wonSubsidyId: SubsidyId;
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
  reason: string;
};

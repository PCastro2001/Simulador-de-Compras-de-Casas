import type { HouseholdInput } from "@/lib/finance/types";

export const INITIAL_ORIENTATION_INPUT: HouseholdInput = {
  name: "",
  monthlyIncomeClp: 950000,
  savingsClp: 3200000,
  householdSize: 3,
  subsidyStatus: "none",
  wonSubsidyId: "ds19",
  region: "metropolitana",
  bankId: "BancoEstado",
  propertyType: "ambos",
  zoneType: "urban",
};

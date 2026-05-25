"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { orientFirstHome } from "@/lib/finance/calculations";
import type { HouseholdInput } from "@/lib/finance/types";
import { INITIAL_ORIENTATION_INPUT } from "@/store/orientation";

export function useFirstHomeOrientation(ufValue: number) {
  const [input, setInput] = useState<HouseholdInput>(INITIAL_ORIENTATION_INPUT);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  const result = useMemo(() => orientFirstHome(input, ufValue), [input, ufValue]);

  const updateInput = <Key extends keyof HouseholdInput>(key: Key, value: HouseholdInput[Key]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("subsimatch-profile");
    if (saved) {
      try {
        setInput({ ...INITIAL_ORIENTATION_INPUT, ...(JSON.parse(saved) as Partial<HouseholdInput>) });
      } catch {
        setInput(INITIAL_ORIENTATION_INPUT);
      }
    }
    setHasLoadedProfile(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedProfile) return;
    window.localStorage.setItem("subsimatch-profile", JSON.stringify(input));
    window.localStorage.setItem("income", String(input.monthlyIncomeClp));
  }, [hasLoadedProfile, input]);

  return { input, result, updateInput };
}

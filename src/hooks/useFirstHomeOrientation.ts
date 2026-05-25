"use client";

import { useMemo, useState } from "react";
import { orientFirstHome } from "@/lib/finance/calculations";
import type { HouseholdInput } from "@/lib/finance/types";
import { INITIAL_ORIENTATION_INPUT } from "@/store/orientation";

export function useFirstHomeOrientation(ufValue: number) {
  const [input, setInput] = useState<HouseholdInput>(INITIAL_ORIENTATION_INPUT);

  const result = useMemo(() => orientFirstHome(input, ufValue), [input, ufValue]);

  const updateInput = <Key extends keyof HouseholdInput>(key: Key, value: HouseholdInput[Key]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };

  return { input, result, updateInput };
}

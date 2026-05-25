import { LEGAL_ASSUMPTIONS } from "@/config/housing";

type MindicadorUfResponse = {
  serie?: Array<{ valor?: number }>;
};

export async function getUfValue(): Promise<number> {
  try {
    const response = await fetch("https://mindicador.cl/api/uf", {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return LEGAL_ASSUMPTIONS.defaultUfValue;

    const data = (await response.json()) as MindicadorUfResponse;
    const value = data.serie?.[0]?.valor;

    return typeof value === "number" ? value : LEGAL_ASSUMPTIONS.defaultUfValue;
  } catch {
    return LEGAL_ASSUMPTIONS.defaultUfValue;
  }
}

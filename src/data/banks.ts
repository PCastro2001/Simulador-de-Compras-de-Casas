// src/data/banks.ts

export interface BankData {
  name: string;
  tasaBase?: number; // Mediana referencial tasa anual UF (Sin FOGAES / Mercado Estándar)
  tasaMin?: number; // Mínimo sin FOGAES
  tasaMax?: number; // Máximo sin FOGAES
  tasaFogaes?: number; // Mediana referencial tasa anual UF (Con FOGAES / Aval Estatal)
  tasaFogaesMin?: number; // Mínimo con FOGAES
  tasaFogaesMax?: number; // Máximo con FOGAES
  descuentoDS15?: number; // Diferencia preferencial (tasaBase - tasaFogaes)
  financiamientoMaxSinFogaes?: number; // Hasta 80% o 90%
  financiamientoMaxFogaes?: number; // Hasta 90%
  plazoMaximo?: number; // En años (ej: 30)
  calcularTasa?: (montoUF: number, plazo: number) => number; // Para bancos con matriz de riesgo
}

export const BANKS: Record<string, BankData> = {
  Itau: {
    name: "Banco Itaú",
    tasaBase: 0.0362,
    tasaMin: 0.0339,
    tasaMax: 0.0385,
    tasaFogaes: 0.0346,
    tasaFogaesMin: 0.0339,
    tasaFogaesMax: 0.0353,
    descuentoDS15: 0.0016,
    financiamientoMaxSinFogaes: 0.90,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Santander: {
    name: "Banco Santander",
    tasaBase: 0.03775,
    tasaMin: 0.0360,
    tasaMax: 0.0395,
    tasaFogaes: 0.03275,
    tasaFogaesMin: 0.0325,
    tasaFogaesMax: 0.0330,
    descuentoDS15: 0.0050,
    financiamientoMaxSinFogaes: 0.90,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Falabella: {
    name: "Banco Falabella",
    tasaBase: 0.03825,
    tasaMin: 0.0370,
    tasaMax: 0.0395,
    tasaFogaes: 0.0370,
    tasaFogaesMin: 0.0365,
    tasaFogaesMax: 0.0375,
    descuentoDS15: 0.00125,
    financiamientoMaxSinFogaes: 0.90,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Bice: {
    name: "Banco BICE",
    tasaBase: 0.0395,
    tasaMin: 0.0380,
    tasaMax: 0.0410,
    descuentoDS15: 0,
    financiamientoMaxSinFogaes: 0.80,
    plazoMaximo: 30
  },
  Chile: {
    name: "Banco de Chile",
    tasaBase: 0.0437,
    tasaMin: 0.0395,
    tasaMax: 0.0479,
    tasaFogaes: 0.03455,
    tasaFogaesMin: 0.0328,
    tasaFogaesMax: 0.0363,
    descuentoDS15: 0.00915,
    financiamientoMaxSinFogaes: 0.80,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  BCI: {
    name: "Banco BCI",
    tasaBase: 0.04175,
    tasaMin: 0.0400,
    tasaMax: 0.0435,
    tasaFogaes: 0.0364,
    tasaFogaesMin: 0.0360,
    tasaFogaesMax: 0.0368,
    descuentoDS15: 0.00535,
    financiamientoMaxSinFogaes: 0.80,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  BancoEstado: {
    name: "BancoEstado",
    tasaBase: 0.04245,
    tasaMin: 0.0400,
    tasaMax: 0.0449,
    tasaFogaes: 0.03205,
    tasaFogaesMin: 0.0300,
    tasaFogaesMax: 0.0341,
    descuentoDS15: 0.0104,
    financiamientoMaxSinFogaes: 0.80,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Coopeuch: {
    name: "Coopeuch",
    tasaBase: 0.0420,
    tasaMin: 0.0400,
    tasaMax: 0.0440,
    tasaFogaes: 0.0351,
    tasaFogaesMin: 0.0342,
    tasaFogaesMax: 0.0360,
    descuentoDS15: 0.0069,
    financiamientoMaxSinFogaes: 0.80,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Consorcio: {
    name: "Banco Consorcio",
    tasaBase: 0.0487,
    tasaMin: 0.0480,
    tasaMax: 0.0494,
    tasaFogaes: 0.0430,
    tasaFogaesMin: 0.0420,
    tasaFogaesMax: 0.0440,
    descuentoDS15: 0.0057,
    financiamientoMaxSinFogaes: 0.80,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Scotiabank: {
    name: "Scotiabank",
    tasaBase: 0.04895,
    tasaMin: 0.0452,
    tasaMax: 0.0527,
    descuentoDS15: 0,
    financiamientoMaxSinFogaes: 0.80,
    plazoMaximo: 30
  },
  Security: {
    name: "Banco Security",
    tasaBase: 0.05235,
    tasaMin: 0.0497,
    tasaMax: 0.0550,
    descuentoDS15: 0,
    financiamientoMaxSinFogaes: 0.80,
    plazoMaximo: 40
  },
  Edwards: {
    name: "Banco Edwards",
    tasaBase: 0.0437,
    tasaMin: 0.0395,
    tasaMax: 0.0479,
    tasaFogaes: 0.03455,
    tasaFogaesMin: 0.0328,
    tasaFogaesMax: 0.0363,
    descuentoDS15: 0.00915,
    financiamientoMaxSinFogaes: 0.80,
    financiamientoMaxFogaes: 0.90,
    plazoMaximo: 30
  },
  Metlife: {
    name: "MetLife",
    tasaBase: 0.0480,
    descuentoDS15: 0,
    financiamientoMaxSinFogaes: 0.80,
    plazoMaximo: 30
  },
  Internacional: {
    name: "Banco Internacional",
    tasaBase: 0.0500,
    descuentoDS15: 0,
    financiamientoMaxSinFogaes: 0.80,
    plazoMaximo: 30,
    calcularTasa: (montoUF: number, plazo: number) => {
      if (montoUF < 2000) return plazo === 12 ? 0.0540 : 0.0530;
      if (montoUF < 3000) return 0.0510;
      if (montoUF < 4000) return plazo === 12 ? 0.0510 : 0.0500;
      return plazo === 12 ? 0.0500 : 0.0490;
    }
  }
};
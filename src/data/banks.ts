// src/data/banks.ts

export interface BankData {
  name: string;
  tasaBase?: number; // Para bancos con tasa fija
  calcularTasa?: (montoUF: number, plazo: number) => number; // Para bancos con matriz de riesgo
  descuentoDS15?: number; // Descuento exclusivo si aplica beneficio de Ley/DS15
}

export const BANKS: Record<string, BankData> = {

    Itau: { name: "Banco Itaú", tasaBase: 0.0339, descuentoDS15: 0.0080 },
  Falabella: { name: "Banco Falabella", tasaBase: 0.0370, descuentoDS15: 0.0061 },
  BancoEstado: { name: "BancoEstado", tasaBase: 0.0419, descuentoDS15: 0.0092 },
  Coopeuch: { name: "Coopeuch", tasaBase: 0.0450, descuentoDS15: 0.0116 },
  Scotiabank: { name: "Scotiabank", tasaBase: 0.0484 },
  Consorcio: { name: "Banco Consorcio", tasaBase: 0.0540, descuentoDS15: 0.0061 },
  BCI: { name: "Banco BCI", tasaBase: 0.0541, descuentoDS15: 0.0065 },
  Bice: { name: "Bice Hipotecaria", tasaBase: 0.0550 },
  Security: { name: "Security Principal", tasaBase: 0.0550 },
  Metlife: { name: "Metlife", tasaBase: 0.0570 },
  Edwards: { name: "Banco Edwards", tasaBase: 0.0589 },
  Chile: { name: "Banco de Chile", tasaBase: 0.0589, descuentoDS15: 0.0070 },
  Santander: { name: "Banco Santander", tasaBase: 0.0599, descuentoDS15: 0.0105 },
  
  // El caso especial con matriz de cálculo dinámica
  Internacional: {
    name: "Banco Internacional",
    calcularTasa: (montoUF: number, plazo: number) => {
      // Tramo 1: Hasta 1.999 UF
      if (montoUF < 2000) return plazo === 12 ? 0.0540 : 0.0530;
      // Tramo 2: 2.000 a 2.999 UF
      if (montoUF < 3000) return 0.0510;
      // Tramo 3: 3.000 a 3.999 UF
      if (montoUF < 4000) return plazo === 12 ? 0.0510 : 0.0500;
      // Tramo 4: Sobre 4.000 UF
      return plazo === 12 ? 0.0500 : 0.0490;
    }
  }
};
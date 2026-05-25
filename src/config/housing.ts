export type SubsidyId = "ds1-t1" | "ds1-t2" | "ds1-t3" | "ds19" | "sin-subsidio";

export type SubsidyProgram = {
  id: SubsidyId;
  name: string;
  friendlyName: string;
  description: string;
  maxHomeUf: number;
  minSavingsUf: number;
  estimatedSupportUf: number;
  rshHint: string;
};

export const LEGAL_ASSUMPTIONS = {
  defaultUfValue: 39200,
  maxDebtRatio: 0.25,
  conservativeDebtRatio: 0.22,
  defaultAnnualRate: 0.049,
  defaultTermYears: 25,
  minimumDownPaymentRatio: 0.1,
  recommendedDownPaymentRatio: 0.2,
} as const;

export const SUBSIDY_PROGRAMS: SubsidyProgram[] = [
  {
    id: "ds1-t1",
    name: "DS1 Tramo 1",
    friendlyName: "Apoyo estatal para viviendas de entrada",
    description: "Para familias con ahorro inicial y foco en viviendas de menor valor.",
    maxHomeUf: 1100,
    minSavingsUf: 30,
    estimatedSupportUf: 600,
    rshHint: "Suele calzar con hogares hasta el 60% RSH.",
  },
  {
    id: "ds1-t2",
    name: "DS1 Tramo 2",
    friendlyName: "Compra con apoyo y credito hipotecario",
    description: "Para quienes ya tienen ahorro y necesitan combinar subsidio con banco.",
    maxHomeUf: 1600,
    minSavingsUf: 40,
    estimatedSupportUf: 450,
    rshHint: "Puede calzar con hogares hasta el 80% RSH.",
  },
  {
    id: "ds1-t3",
    name: "DS1 Tramo 3",
    friendlyName: "Mas opciones de vivienda con apoyo estatal",
    description: "Para perfiles con mayor ingreso y un rango de compra mas amplio.",
    maxHomeUf: 2200,
    minSavingsUf: 80,
    estimatedSupportUf: 300,
    rshHint: "Puede calzar con hogares hasta el 90% RSH.",
  },
  {
    id: "ds19",
    name: "DS19",
    friendlyName: "Proyectos de integracion social",
    description: "Para buscar viviendas nuevas en proyectos compatibles con subsidio.",
    maxHomeUf: 2200,
    minSavingsUf: 40,
    estimatedSupportUf: 350,
    rshHint: "Depende del proyecto y cupos disponibles.",
  },
  {
    id: "sin-subsidio",
    name: "Compra tradicional",
    friendlyName: "Compra directa con financiamiento bancario",
    description: "Para evaluar una compra sin apoyo estatal o mientras preparas tu postulacion.",
    maxHomeUf: 4500,
    minSavingsUf: 0,
    estimatedSupportUf: 0,
    rshHint: "No depende del Registro Social de Hogares.",
  },
];

export const PROJECT_MATCHES = [
  {
    title: "Departamentos compactos bien conectados",
    location: "Santiago, La Florida, Puente Alto",
    rangeUf: "1.600 a 2.200 UF",
    fit: "DS19 o DS1 Tramo 3",
  },
  {
    title: "Casas iniciales en barrios en crecimiento",
    location: "Maipu, Padre Hurtado, Buin",
    rangeUf: "1.200 a 1.900 UF",
    fit: "DS1 Tramo 2 o DS19",
  },
  {
    title: "Alternativas con menor pie inicial",
    location: "Regiones con oferta DS19",
    rangeUf: "1.100 a 1.700 UF",
    fit: "DS1 Tramo 1 o DS19",
  },
];

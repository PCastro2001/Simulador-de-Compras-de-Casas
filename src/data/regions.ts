// src/data/regions.ts

export interface RegionData {
  tt: string;
  pi: string;
  label: string;
}

export const REGION_MAP: Record<string, RegionData> = {
  "arica-y-parinacota": { tt: "arica-y-parinacota", pi: "arica-y-parinacota", label: "Arica y Parinacota" },
  "tarapaca": { tt: "tarapaca", pi: "tarapaca", label: "Tarapacá" },
  "antofagasta": { tt: "antofagasta", pi: "antofagasta", label: "Antofagasta" },
  "atacama": { tt: "atacama", pi: "atacama", label: "Atacama" },
  "coquimbo": { tt: "coquimbo", pi: "coquimbo", label: "Coquimbo" },
  "valparaiso": { tt: "valparaiso", pi: "valparaiso", label: "Valparaíso" },
  "metropolitana": { tt: "metropolitana", pi: "metropolitana", label: "Metropolitana" },
  "bernardo-ohiggins": { tt: "bernardo-ohiggins", pi: "bernardo-ohiggins", label: "O'Higgins" },
  "maule": { tt: "maule", pi: "maule", label: "Maule" },
  "biobio": { tt: "biobio", pi: "biobio", label: "Biobío" },
  "nuble": { tt: "nuble", pi: "nuble", label: "Ñuble" },
  "araucania": { tt: "araucania", pi: "la-araucania", label: "La Araucanía" },
  "los-rios": { tt: "los-rios", pi: "de-los-rios", label: "Los Ríos" },
  "los-lagos": { tt: "los-lagos", pi: "los-lagos", label: "Los Lagos" },
  "aysen": { tt: "aysen", pi: "aysen", label: "Aysén" },
  "magallanes": { tt: "magallanes", pi: "magallanes-y-antartica-chilena", label: "Magallanes" }
};

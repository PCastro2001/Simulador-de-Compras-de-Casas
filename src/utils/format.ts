// src/utils/format.ts

/**
 * Formatea un número flotante directo a Pesos Chilenos (CLP).
 * Redondea al entero más cercano y agrega el signo $ con separación de miles.
 */
export function formatCLP(value: number): string {
  // Aseguramos que sea un número válido antes de formatear
  if (isNaN(value) || value === null) return "$0";
  
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
// src/utils/api.ts

/**
 * Obtiene el valor actual de la UF desde la API pública.
 * Si la API falla, retorna un valor de respaldo (fallback) seguro.
 */
export async function fetchUFValue(): Promise<number> {
  try {
    // Agregamos un revalidate de 3600 segundos (1 hora) para no saturar la API en cada render
    const response = await fetch('https://mindicador.cl/api/uf', {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) throw new Error('Error al conectar con el servidor de la UF');
    
    const data = await response.json();
    const ufValue = data.serie[0].valor;
    
    return typeof ufValue === 'number' ? ufValue : 40000;
  } catch (error) {
    console.error('⚠️ Error al obtener la UF de la API, usando respaldo:', error);
    return 40000; // Tu valor fallback seguro por si falla la API
  }
}
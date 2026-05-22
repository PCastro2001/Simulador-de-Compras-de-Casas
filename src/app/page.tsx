// src/app/page.tsx
import Link from "next/link";

export default function SubsidiesMenuPage() {
  const herramientas = [
    {
      href: "/percentil",
      categoria: "Paso 1: Diagnóstico Social",
      titulo: "Calcula tu percentil",
      descripcion: "Evalúa tus ingresos mensuales según tu núcleo familiar para saber exactamente en qué tramo del RSH estás."
    },
    {
      href: "/asistente-subsidios",
      categoria: "Orientación Guiada",
      titulo: "Asistente de Subsidios",
      descripcion: "Responde preguntas interactivas para descartar opciones y descubrir el beneficio que te corresponde."
    },
    {
      href: "/subsidies",
      categoria: "Simulación de Compra",
      titulo: "Simulador de Subsidios",
      descripcion: "Calcula el dividendo mensual estimado aplicando los montos de subsidio de los decretos DS1, DS49 o DS19."
    },
    {
      href: "/sin-subsidio",
      categoria: "Crédito Bancario Puro",
      titulo: "Compra sin Subsidio",
      descripcion: "Simula un crédito hipotecario tradicional e integra automáticamente la rebaja de tasa de la nueva Ley 21.748."
    },
    {
      href: "/valor-maximo",
      categoria: "Capacidad de Endeudamiento",
      titulo: "Valor Máximo de Casa",
      descripcion: "Calcula el precio límite de la propiedad que puedes comprar según tu sueldo líquido y el plazo del crédito."
    },
    {
      href: "/creditos",
      categoria: "Información General",
      titulo: "Créditos y Alianzas",
      descripcion: "Conoce los objetivos comerciales de SubsiMatch, al equipo de desarrollo y canales de contacto."
    }
  ];

  return (
    // Fondo base del sitio en un gris/azul claro limpio que hace resaltar las tarjetas blancas
    <div className="bg-slate-100 min-h-screen text-slate-800 flex flex-col justify-between">
      
      <div>
        {/* Encabezado con tu degradado identitario original, pero en un bloque limpio y nítido */}
        <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-14 border-b-4 border-white shadow-sm">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">
              SubsiMatch
            </h1>
            <p className="text-blue-50 mt-2 max-w-xl text-sm md:text-base font-medium opacity-90">
              Simulador independiente de subsidios habitacionales y créditos hipotecarios. Calcula tu capacidad de compra real de forma clara y directa.
            </p>
          </div>
        </header>

        {/* Contenedor del contenido con padding adaptado */}
        <main className="max-w-5xl mx-auto px-6 py-10">
          
          {/* Bloque 1: El gancho comercial (Tu formulario de Leads) */}
          <section className="mb-10">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border border-slate-800">
              <div className="max-w-2xl">
                <span className="text-xs font-bold tracking-wider uppercase text-sky-400 block mb-1">
                  Evaluación de Perfil Comercial
                </span>
                <h2 className="text-xl md:text-2xl font-bold">
                  ¿Quieres que busquemos proyectos por ti?
                </h2>
                <p className="text-slate-300 text-xs md:text-sm mt-1.5 leading-relaxed">
                  Ingresa tus datos financieros en nuestra calculadora avanzada. Analizamos tu capacidad de crédito para conectarte con constructoras, inmobiliarias (DS19 o venta directa) y ejecutivos bancarios.
                </p>
              </div>
              <Link 
                href="/formulario" 
                className="w-full md:w-auto inline-flex justify-center items-center px-6 py-3.5 bg-[#87c0a3] text-slate-950 font-bold text-sm rounded-xl hover:bg-[#76b092] transition-all duration-200 shadow-sm whitespace-nowrap"
              >
                Evaluar mi capacidad gratis
              </Link>
            </div>
          </section>

          {/* Bloque 2: Indicador de sección para organizar el flujo */}
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">
              Módulos de Simulación Individual
            </h3>
            <div className="h-px bg-slate-300 w-full"></div>
          </div>

          {/* Bloque 3: Grilla de calculadoras con contraste limpio */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {herramientas.map((opcion, index) => (
              <article 
                key={index}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-[#6b9ac4] group"
              >
                <Link href={opcion.href} className="block h-full flex flex-col justify-between">
                  <div>
                    {/* El color de la categoría le da ritmo visual a la tarjeta */}
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#6b9ac4] block mb-2 group-hover:text-[#87c0a3] transition-colors duration-200">
                      {opcion.categoria}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mb-2">
                      {opcion.titulo}
                    </h4>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-normal">
                      {opcion.descripcion}
                    </p>
                  </div>
                  
                  {/* Link inferior que reacciona de forma interactiva */}
                  <div className="text-blue-600 text-xs font-semibold flex items-center gap-1 mt-6 pt-3 border-t border-slate-100 group-hover:text-slate-900 transition-colors duration-200">
                    Ingresar al simulador →
                  </div>
                </Link>
              </article>
            ))}
          </section>

        </main>
      </div>

    </div>
  );
}
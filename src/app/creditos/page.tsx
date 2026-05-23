// src/app/creditos/page.tsx
"use client";

import Link from "next/link";

export default function CreditosPage() {
  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-16">
      
      {/* Header con gradiente identitario */}
      <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-12 border-b-4 border-white shadow-sm text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Créditos y Propósito
          </h1>
          <p className="text-blue-50 text-sm md:text-base opacity-95">
            Conoce al creador detrás de SubsiMatch y la misión de transformar el acceso a la vivienda en Chile.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-6">
        
        {/* Card Principal del Creador */}
        <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg md:flex items-stretch">
          {/* Foto del Titulado */}
          <div className="md:w-2/5 relative bg-slate-900 flex items-center justify-center min-h-[320px] md:min-h-full">
            <img 
              src="/Fotos/Foto-Titulacion.png" 
              alt="Pablo Castro - Titulación Duoc UC" 
              className="w-full h-full object-cover object-center absolute inset-0 opacity-90"
            />
            <div className="absolute top-4 left-4 bg-[#6b9ac4] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              Fundador & Lead Developer
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-sm text-white p-3 rounded-xl border border-slate-700/50">
              <p className="text-xs font-bold">Pablo Castro</p>
              <p className="text-[10px] text-slate-300">Analista Programador Computacional</p>
            </div>
          </div>

          {/* Información del Fundador */}
          <div className="p-8 md:p-10 md:w-3/5 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  Duoc UC Alumni
                </span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                  Propiedad Intelectual Patentada
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Pablo Castro</h2>
              <p className="text-slate-500 text-sm font-semibold mb-6">Analista Programador Computacional (Duoc UC)</p>
              
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  Como programador y titulado de <strong>Duoc UC</strong>, he diseñado y patentado <strong>SubsiMatch</strong> como una herramienta tecnológica con impacto social real.
                </p>
                <p>
                  El proyecto nació al identificar la inmensa fricción que sufren las familias chilenas para entender los decretos de subsidio (DS1, DS49, DS19, DS52) y simular sus capacidades reales de compra. 
                  SubsiMatch automatiza todas las variables matemáticas complejas en segundos, entregando respuestas definitivas y transparentes.
                </p>
                <p className="font-semibold text-slate-900">
                  La aplicación es y será 100% gratuita para los usuarios finales, ya que nuestro propósito es conectar soluciones directamente con las personas.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-center sm:text-left">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Contacto Directo</p>
                <a href="mailto:pcastrof022001@gmail.com" className="text-sm font-bold text-[#6b9ac4] hover:text-[#87c0a3] transition-colors">
                  pcastrof022001@gmail.com
                </a>
              </div>
              <a 
                href="mailto:pcastrof022001@gmail.com?subject=Contacto%20Alianza%20SubsiMatch" 
                className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-3 bg-[#87c0a3] text-slate-950 font-bold text-xs rounded-xl hover:bg-[#76b092] transition-colors shadow-sm"
              >
                Hablemos de Alianzas
              </a>
            </div>
          </div>
        </section>

        {/* Sección de Propósito y Modelo de Negocio */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Columna 1: Misión Comercial y Modelo SaaS/B2C */}
          <article className="bg-[#6b9ac4] text-white p-8 rounded-3xl shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/20 text-white px-2.5 py-1 rounded-full inline-block mb-4">
                Visión del Proyecto
              </span>
              <h3 className="text-xl font-bold mb-4">Misión Comercial (SaaS & B2C)</h3>
              <div className="space-y-4 text-xs md:text-sm leading-relaxed opacity-95">
                <p>
                  <strong>B2C (Para Familias):</strong> Damos la respuesta final e inteligente sin rodeos matemáticos. El usuario calcula su ahorro, ingreso y subsidio de forma interactiva y es emparejado inmediatamente con los proyectos reales que puede comprar.
                </p>
                <p>
                  <strong>SaaS/B2B (Para Inmobiliarias, Corredoras y Bancos):</strong> Servimos como una capa de perfilamiento avanzada que precalifica prospectos financieros y los canaliza directamente con los equipos de ventas de viviendas y ejecutivos hipotecarios, acelerando el ciclo y combatiendo el déficit habitacional del país.
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-white/20 pt-4 text-xs font-semibold">
              Diseñado para integrarse en bancos y portales inmobiliarios líderes.
            </div>
          </article>

          {/* Columna 2: Protección y Seguridad de Datos */}
          <article className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full inline-block mb-4">
                Privacidad de Datos
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Protección de Datos 100% Confiable</h3>
              <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed">
                <p>
                  Sabemos que el tema de protección de datos puede ser un desafío en la industria digital. En SubsiMatch asumimos un compromiso férreo: 
                  <strong> tus datos son sagrados</strong>.
                </p>
                <p>
                  Los resguardamos con altos estándares de seguridad y encriptación con la única y exclusiva finalidad de ayudarte a cumplir el sueño del hogar propio. 
                  No vendemos tu información a spammers ni a terceros externos. Solo los conectamos con las inmobiliarias o bancos calificados que tengan el proyecto exacto que calza con tu perfil financiero.
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
              Seguridad total para que te enfoques en tu sueño habitacional.
            </div>
          </article>

        </section>

        {/* Botón de Retorno */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-sm">
            ← Volver al Menú Principal
          </Link>
        </div>

      </main>

    </div>
  );
}

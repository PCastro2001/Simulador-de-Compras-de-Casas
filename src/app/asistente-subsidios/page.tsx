// src/app/asistente-subsidios/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ResultInfo {
  title: string;
  description: string;
  links: { label: string; href: string }[];
  autoRedirect?: { href: string; seconds: number };
}

interface Option {
  text: string;
  nextNodeId: string;
}

interface DecisionNode {
  type: "question" | "result";
  text: string;
  options?: Option[];
  resultInfo?: ResultInfo;
}

const DECISION_TREE: Record<string, DecisionNode> = {
  ownsHouse: {
    type: "question",
    text: "¿Posees casa propia?",
    options: [
      { text: "Sí", nextNodeId: "socialHouse" },
      { text: "No", nextNodeId: "ownsLand" }
    ]
  },
  socialHouse: {
    type: "question",
    text: "¿La casa fue comprada a través del SERVIU y/o es considerada vivienda social?",
    options: [
      { text: "Sí", nextNodeId: "resultDS27" },
      { text: "No", nextNodeId: "resultNoSubsidy" }
    ]
  },
  resultDS27: {
    type: "result",
    text: "Subsidio DS27",
    resultInfo: {
      title: "Subsidio de Mejoramiento de Vivienda y Barrio (DS27)",
      description: "Al poseer una vivienda social o SERVIU, calificas para postular a este beneficio orientado a reparar filtraciones, ampliar dormitorios, realizar reparaciones estructurales o instalar colectores solares y eficiencia energética.",
      links: [
        { label: "Evaluar mi capacidad de financiamiento", href: "/formulario" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  resultNoSubsidy: {
    type: "result",
    text: "Sin Subsidios Disponibles",
    resultInfo: {
      title: "No se puede postular a ningún subsidio",
      description: "Lamentablemente, el Ministerio de Vivienda y Urbanismo (MINVU) no otorga subsidios de adquisición o arriendo para personas que ya poseen una propiedad comprada de manera independiente.",
      links: [
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  ownsLand: {
    type: "question",
    text: "¿Posees terreno propio para construir?",
    options: [
      { text: "Sí", nextNodeId: "landType" },
      { text: "No", nextNodeId: "savingsCapacity" }
    ]
  },
  landType: {
    type: "question",
    text: "¿La postulación del terreno o proyecto es Colectiva o Individual?",
    options: [
      { text: "Colectiva (en comité)", nextNodeId: "colectiveArea" },
      { text: "Individual (sitio propio)", nextNodeId: "percentileLevel" }
    ]
  },
  colectiveArea: {
    type: "question",
    text: "¿El terreno o desarrollo se encuentra en un sector Urbano o Rural?",
    options: [
      { text: "Urbano", nextNodeId: "resultDS49Condo" },
      { text: "Rural", nextNodeId: "resultDS49Rural" }
    ]
  },
  resultDS49Condo: {
    type: "result",
    text: "Subsidio DS49 (Pequeños Condominios)",
    resultInfo: {
      title: "Subsidio DS49 — Modalidad Pequeños Condominios",
      description: "Esta modalidad permite a comités de vivienda construir pequeños condominios integrados de hasta 12 viviendas en áreas urbanas consolidadas, promoviendo la integración social.",
      links: [
        { label: "Simular capacidad de subsidio DS49", href: "/subsidies/ds49" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  resultDS49Rural: {
    type: "result",
    text: "Subsidio DS49 (Nuevos Terrenos - Rural)",
    resultInfo: {
      title: "Subsidio DS49 — Modalidad Nuevos Terrenos (Rural)",
      description: "Esta modalidad financia la adquisición de terrenos y la construcción de conjuntos habitacionales en zonas rurales para grupos organizados en comités.",
      links: [
        { label: "Simular capacidad de subsidio DS49", href: "/subsidies/ds49" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  percentileLevel: {
    type: "question",
    text: "¿En qué percentil del Registro Social de Hogares (RSH) te encuentras?",
    options: [
      { text: "Menor o igual a 40%", nextNodeId: "hasHouseOnLand" },
      { text: "Entre 41% y 90%", nextNodeId: "resultDS1Construccion" }
    ]
  },
  resultDS1Construccion: {
    type: "result",
    text: "DS1 Construcción en Sitio Propio",
    resultInfo: {
      title: "Subsidio DS1 — Construcción en Sitio Propio (Tramo 2 o 3)",
      description: "Tienes la posibilidad de construir una casa en tu propio sitio. Deberás optar por postular en el Tramo 2 o el Tramo 3 del subsidio DS1, dependiendo de tu capacidad de ahorro y ficha social.",
      links: [
        { label: "Simular Ahorro Seguro Tramo 2", href: "/percentil/ds1t2" },
        { label: "Simular Ahorro Seguro Tramo 3", href: "/percentil/ds1t3" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  hasHouseOnLand: {
    type: "question",
    text: "¿Hay alguna casa habitable construida dentro de tu terreno actualmente?",
    options: [
      { text: "Sí", nextNodeId: "resultDS49Densificacion" },
      { text: "No", nextNodeId: "resultDS49SitioPropio" }
    ]
  },
  resultDS49Densificacion: {
    type: "result",
    text: "Subsidio DS49 (Densificación Predial)",
    resultInfo: {
      title: "Subsidio DS49 — Densificación Predial",
      description: "Permite la construcción de una o más viviendas en un sitio familiar que ya cuenta con una casa habitada, para dar solución habitacional a familiares allegados.",
      links: [
        { label: "Simular capacidad de subsidio DS49", href: "/subsidies/ds49" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  resultDS49SitioPropio: {
    type: "result",
    text: "Subsidio DS49 (Construcción en Sitio Propio)",
    resultInfo: {
      title: "Subsidio DS49 — Construcción en Sitio Propio",
      description: "Permite edificar una vivienda social en tu propio terreno, siempre que esté libre de construcción previa y debidamente regularizado.",
      links: [
        { label: "Simular capacidad de subsidio DS49", href: "/subsidies/ds49" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  savingsCapacity: {
    type: "question",
    text: "¿Posees capacidad de ahorro (o tienes ahorros en una libreta de vivienda)?",
    options: [
      { text: "Sí", nextNodeId: "redirectPercentil" },
      { text: "No", nextNodeId: "redirectDS52" }
    ]
  },
  redirectPercentil: {
    type: "result",
    text: "Redirigiendo a Percentil...",
    resultInfo: {
      title: "Recomendación: Simulador de Percentiles",
      description: "Dado que no tienes terreno pero sí tienes capacidad de ahorro, el mejor punto de partida es calcular tu percentil RSH para evaluar la compra de vivienda nueva o usada.",
      autoRedirect: { href: "/percentil", seconds: 5 },
      links: [
        { label: "Ir al simulador de percentiles ahora", href: "/percentil" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  },
  redirectDS52: {
    type: "result",
    text: "Redirigiendo a DS52...",
    resultInfo: {
      title: "Recomendación: Subsidio de Arriendo DS52",
      description: "Si no tienes terreno ni capacidad de ahorro para la casa propia en el corto plazo, tu mejor opción es el Subsidio de Arriendo (DS52). Te permitirá alquilar una vivienda con copago estatal para ir ahorrando progresivamente.",
      autoRedirect: { href: "/percentil/ds52", seconds: 5 },
      links: [
        { label: "Ir al simulador de Arriendo DS52 ahora", href: "/percentil/ds52" },
        { label: "Volver al Inicio", href: "/" }
      ]
    }
  }
};

export default function AsistenteSubsidiosPage() {
  const router = useRouter();
  const [currentNodeId, setCurrentNodeId] = useState<string>("ownsHouse");
  const [history, setHistory] = useState<string[]>(["ownsHouse"]);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const currentNode = DECISION_TREE[currentNodeId];

  // Manejo de Auto Redirección
  useEffect(() => {
    if (currentNode.type === "result" && currentNode.resultInfo?.autoRedirect) {
      const redirect = currentNode.resultInfo.autoRedirect;
      setRedirectCountdown(redirect.seconds);

      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(interval);
            router.push(redirect.href);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRedirectCountdown(null);
    }
  }, [currentNodeId, currentNode, router]);

  const handleSelectOption = (nextNodeId: string) => {
    setCurrentNodeId(nextNodeId);
    setHistory((prev) => [...prev, nextNodeId]);
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const prevNodeId = newHistory[newHistory.length - 1];
      setCurrentNodeId(prevNodeId);
      setHistory(newHistory);
    }
  };

  const handleRestart = () => {
    setCurrentNodeId("ownsHouse");
    setHistory(["ownsHouse"]);
  };

  // Calcular porcentaje aproximado de progreso (max estimado de 4 pasos)
  const progressPercent = Math.min((history.length / 4) * 100, 100);

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* Header institucional */}
        <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Asistente de Subsidios</h1>
              <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
                Responde las preguntas guiadas para encontrar el beneficio ideal para ti.
              </p>
            </div>
            <Link href="/" className="text-xs font-bold bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all">
              ← Volver al Inicio
            </Link>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="max-w-3xl mx-auto px-6 py-10">
          
          {/* Barra de Progreso */}
          {currentNode.type === "question" && (
            <div className="w-full bg-slate-200 h-2 rounded-full mb-6 overflow-hidden shadow-inner">
              <div 
                className="bg-[#6b9ac4] h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          )}

          {/* Tarjeta del Asistente */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            
            {/* Modo Pregunta */}
            {currentNode.type === "question" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pregunta {history.length}</span>
                  {history.length > 1 && (
                    <button 
                      onClick={handleGoBack}
                      className="text-xs text-slate-500 hover:text-[#6b9ac4] font-semibold flex items-center gap-1 transition-colors"
                    >
                      ← Volver atrás
                    </button>
                  )}
                </div>

                <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-snug">
                  {currentNode.text}
                </h2>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  {currentNode.options?.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option.nextNodeId)}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50 transition-all font-medium text-slate-700 hover:text-slate-900 active:bg-slate-100 flex justify-between items-center group"
                    >
                      <span>{option.text}</span>
                      <span className="text-slate-300 group-hover:text-[#6b9ac4] transition-colors font-bold text-lg">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modo Resultado */}
            {currentNode.type === "result" && currentNode.resultInfo && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Recomendación Final</span>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                    {currentNode.resultInfo.title}
                  </h2>
                  <p className="text-sm md:text-base text-slate-600 mt-3 leading-relaxed">
                    {currentNode.resultInfo.description}
                  </p>
                </div>

                {/* Mensaje de auto redirección si existe */}
                {redirectCountdown !== null && currentNode.resultInfo.autoRedirect && (
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-center">
                    <p className="text-xs md:text-sm text-sky-800 font-medium animate-pulse">
                      ⏳ Redirigiendo automáticamente en <strong className="text-base text-sky-950 font-black">{redirectCountdown}</strong> segundos...
                    </p>
                  </div>
                )}

                {/* Acciones del Resultado */}
                <div className="flex flex-col gap-3 pt-2">
                  {currentNode.resultInfo.links.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className={`w-full p-4 rounded-xl text-center font-bold text-sm transition-all shadow-sm ${
                        idx === 0 
                          ? "bg-[#6b9ac4] text-white hover:bg-[#5a86ae]" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleRestart}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium underline mt-2 transition-colors self-center"
                  >
                    Volver a empezar el test
                  </button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      <footer className="text-center py-6 text-slate-400 text-xs border-t border-slate-200 bg-white">
        <p>© 2026 SubsiMatch</p>
      </footer>
    </div>
  );
}

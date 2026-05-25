// src/app/asistente-subsidios/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUFValue } from "@/utils/api";
import { BANKS } from "@/data/banks";

export default function AsistenteSubsidiosPage() {
  // Estado para el perfil: "A" (Descubrimiento), "B" (Simulación Rápida) o null (Sin seleccionar)
  const [profile, setProfile] = useState<"A" | "B" | null>(null);
  
  // Estado general para pasos
  const [step, setStep] = useState<number>(1);
  
  // Datos de la UF y banco
  const [ufValue, setUfValue] = useState<number>(39200);
  
  // --- Estados de Perfil A (Descubrimiento) ---
  const [familyType, setFamilyType] = useState<"familia" | "solo" | "">("");
  const [knowsRSH, setKnowsRSH] = useState<"si" | "no" | "">("");
  const [rshTramo, setRshTramo] = useState<"40" | "60" | "90" | "100" | "">("");
  
  // Mini-calculadora RSH
  const [rshMembers, setRshMembers] = useState<string>("3");
  const [rshIncome, setRshIncome] = useState<string>("");
  const [calculatedRsh, setCalculatedRsh] = useState<"40" | "60" | "90" | "100" | "">("");

  // Ahorro
  const [savingsUF, setSavingsUF] = useState<string>("");

  // --- Estados de Perfil B (Simulación Avanzada) ---
  const [incomeCLPB, setIncomeCLPB] = useState<string>("");
  const [savingsUFB, setSavingsUFB] = useState<string>("");
  const [selectedSubsidyB, setSelectedSubsidyB] = useState<string>("none");
  const [loanTermB, setLoanTermB] = useState<string>("25");
  const [isYoungSingleB, setIsYoungSingleB] = useState<boolean>(false);
  const [selectedBankB, setSelectedBankB] = useState<string>("");
  const [locationB, setLocationB] = useState<string>("none");
  const [resultsB, setResultsB] = useState<any>(null);

  // Inicializar la UF y detectar perfil desde la URL
  useEffect(() => {
    async function init() {
      const uf = await fetchUFValue();
      if (uf && uf > 0) setUfValue(uf);
    }
    init();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("profile");
      if (p === "A" || p === "B") {
        setProfile(p);
        setStep(1);
      }
    }
  }, []);

  // Calcular la estimación del RSH de forma dinámica en Perfil A
  useEffect(() => {
    const incomeVal = parseFloat(rshIncome);
    const membersVal = parseInt(rshMembers);
    if (!isNaN(incomeVal) && !isNaN(membersVal) && membersVal > 0) {
      const perCapita = incomeVal / membersVal;
      if (perCapita <= 250000) {
        setCalculatedRsh("40");
      } else if (perCapita <= 500000) {
        setCalculatedRsh("60");
      } else if (perCapita <= 850000) {
        setCalculatedRsh("90");
      } else {
        setCalculatedRsh("100");
      }
    } else {
      setCalculatedRsh("");
    }
  }, [rshIncome, rshMembers]);

  // Reiniciar el asistente
  const handleRestart = () => {
    setStep(1);
    setFamilyType("");
    setKnowsRSH("");
    setRshTramo("");
    setRshMembers("3");
    setRshIncome("");
    setCalculatedRsh("");
    setSavingsUF("");
    setIncomeCLPB("");
    setSavingsUFB("");
    setSelectedSubsidyB("none");
    setLoanTermB("25");
    setIsYoungSingleB(false);
    setSelectedBankB("");
    setLocationB("none");
    setResultsB(null);
  };

  // --- NAVEGACIÓN ---
  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      setProfile(null);
    }
  };

  // --- CÁLCULO DE PERFIL B (SIMULACIÓN AVANZADA) ---
  const handleCalculateB = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(incomeCLPB);
    const savings = parseFloat(savingsUFB);
    const term = parseInt(loanTermB);

    if (!selectedBankB || !BANKS[selectedBankB]) {
      alert("Por favor, selecciona una institución financiera para la tasa de interés.");
      return;
    }

    const bankData = BANKS[selectedBankB];
    const incomeMultiplier = isYoungSingleB ? 3 : 4;
    const maxMonthlyPaymentUF = (income / ufValue) / incomeMultiplier;

    // Calcular tasa de interés bancaria
    const tasaOriginal = bankData.calcularTasa ? bankData.calcularTasa(1000, term) : (bankData.tasaBase || 0.05);
    // Aplica descuento Ley si es vivienda nueva (asumimos true para la simulación máxima de beneficio)
    const tasaAplicada = tasaOriginal - (bankData.descuentoDS15 || 0);

    const monthlyRate = tasaAplicada / 12;
    const totalPayments = term * 12;
    const maxLoanUF = maxMonthlyPaymentUF * ((1 - Math.pow(1 + monthlyRate, -totalPayments)) / monthlyRate);

    let maxHouseUF = 0;
    let subsidyUF = 0;
    let legalMaxCap = 0;
    let subsidyName = "";

    switch (selectedSubsidyB) {
      case "ds49":
        subsidyUF = 1100; // Aporte estándar promedio
        legalMaxCap = 1100;
        maxHouseUF = savings + subsidyUF; // Sin deuda hipotecaria
        subsidyName = "Subsidio DS49 (Fondo Solidario)";
        break;
      case "ds1t1":
        subsidyUF = locationB === "north" ? 700 : locationB === "south" ? 750 : 600;
        legalMaxCap = locationB === "north" ? 1200 : locationB === "south" ? 1250 : 1100;
        maxHouseUF = Math.min(maxLoanUF + savings + subsidyUF, legalMaxCap);
        subsidyName = "DS1 Tramo 1";
        break;
      case "ds1t2":
        // Tramo 2 regular: Ecuación reversa
        legalMaxCap = 1600;
        subsidyName = "DS1 Tramo 2";
        if (locationB === "none") {
          const baseCapacity = maxLoanUF + savings;
          const projected = (baseCapacity + 550 + 300) / 1.375;
          if (projected <= 800) {
            maxHouseUF = baseCapacity + 550;
            subsidyUF = 550;
          } else if (projected <= 1600) {
            maxHouseUF = projected;
            subsidyUF = 550 - ((projected - 800) * 0.375);
          } else {
            maxHouseUF = baseCapacity + 250;
            subsidyUF = 250;
          }
        } else {
          // Zonas extremas
          const baseCapacity = maxLoanUF + savings;
          const maxSub = locationB === "north" ? 650 : 700;
          const minSub = locationB === "north" ? 350 : 400;
          const projected = (baseCapacity + maxSub + 300) / 1.375;
          if (projected <= 800) {
            maxHouseUF = baseCapacity + maxSub;
            subsidyUF = maxSub;
          } else if (projected <= 1600) {
            maxHouseUF = projected;
            subsidyUF = maxSub - ((projected - 800) * 0.375);
          } else {
            maxHouseUF = baseCapacity + minSub;
            subsidyUF = minSub;
          }
        }
        break;
      case "ds1t3":
        // Tramo 3 regular
        legalMaxCap = locationB === "none" ? 2200 : 2600;
        subsidyName = "DS1 Tramo 3";
        if (locationB === "none") {
          const baseCapacity = maxLoanUF + savings;
          const projected = (baseCapacity + 400 + 125) / 1.125;
          if (projected <= 1000) {
            maxHouseUF = baseCapacity + 400;
            subsidyUF = 400;
          } else if (projected <= 2200) {
            maxHouseUF = projected;
            subsidyUF = 400 - ((projected - 1000) * 0.125);
          } else {
            maxHouseUF = baseCapacity + 250;
            subsidyUF = 250;
          }
        } else {
          const baseCapacity = maxLoanUF + savings;
          const maxSub = locationB === "north" ? 500 : 550;
          const minSub = locationB === "north" ? 300 : 350;
          const projected = (baseCapacity + maxSub + (1200 * (1/7))) / (8/7);
          if (projected <= 1200) {
            maxHouseUF = baseCapacity + maxSub;
            subsidyUF = maxSub;
          } else if (projected <= 2600) {
            maxHouseUF = projected;
            subsidyUF = maxSub - ((projected - 1200) * (1/7));
          } else {
            maxHouseUF = baseCapacity + minSub;
            subsidyUF = minSub;
          }
        }
        break;
      case "ds1t4":
        subsidyUF = 400;
        legalMaxCap = 4000;
        maxHouseUF = Math.min(maxLoanUF + savings + subsidyUF, legalMaxCap);
        subsidyName = "DS1 Tramo 4";
        break;
      case "ds19":
        subsidyUF = 350; // Promedio base sectores medios
        legalMaxCap = 2600;
        maxHouseUF = Math.min(maxLoanUF + savings + subsidyUF, legalMaxCap);
        subsidyName = "Integración Social DS19";
        break;
      default:
        subsidyUF = 0;
        legalMaxCap = 99999;
        maxHouseUF = maxLoanUF + savings;
        subsidyName = "Sin Subsidio Habitacional";
    }

    // El crédito real es el precio de la propiedad menos el ahorro y subsidio
    const finalLoan = selectedSubsidyB === "ds49" ? 0 : Math.max(0, maxHouseUF - savings - subsidyUF);

    setResultsB({
      maxHouseUF,
      loanUF: finalLoan,
      savingsUF: savings,
      subsidyUF,
      maxDividendUF: selectedSubsidyB === "ds49" ? 0 : (finalLoan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments)),
      bank: bankData.name,
      tasaAplicada,
      legalMaxCap,
      subsidyName
    });
  };

  // --- LÓGICA DE RECOMENDACIÓN PERFIL A ---
  const getRecommendation = () => {
    const savings = parseFloat(savingsUF) || 0;
    
    // Si cumple requisitos del DS49 (vulnerabilidad extrema, tiene familia, ahorro mínimo)
    if (familyType === "familia" && rshTramo === "40" && savings >= 10) {
      return {
        title: "Subsidio DS49 (Fondo Solidario de Elección de Vivienda)",
        tag: "Recomendado para Familias Vulnerables",
        description: "Cumples con el perfil ideal para postular al Subsidio DS49. Al pertenecer al 40% del RSH y postular con núcleo familiar, puedes adquirir una vivienda social nueva o usada de hasta 950 - 1.100 UF de forma 100% financiada por el Estado y tu ahorro, sin adquirir deuda de crédito hipotecario bancario.",
        requirements: ["Tramo del RSH de hasta el 40%", "Ahorro mínimo de 10 a 15 UF", "Postular con un núcleo familiar"],
        linkSim: "/subsidies/ds49",
        linkMax: "/subsidies/ds49"
      };
    }

    // DS1 Tramo 1 (hasta el 60% RSH, ahorro mínimo 30 UF)
    if ((rshTramo === "40" || rshTramo === "60") && savings >= 30) {
      return {
        title: "Subsidio DS1 Tramo 1",
        tag: "Recomendado para Sectores de Bajos Ingresos",
        description: "Cumples con los requisitos para el Subsidio DS1 Tramo 1. Te permite comprar una vivienda nueva o usada de hasta 1.100 UF (o hasta 1.200 / 1.250 UF en zonas extremas). El Estado te otorga un subsidio fijo de 600 a 750 UF, y la diferencia se cubre con tu ahorro y opcionalmente un crédito hipotecario acotado.",
        requirements: ["Tramo del RSH de hasta el 60%", "Ahorro mínimo de 30 UF", "Permite postulación individual"],
        linkSim: "/subsidies/ds1t1",
        linkMax: "/valor-maximo/ds1t1"
      };
    }

    // DS1 Tramo 2 o Tramo 3 según el ahorro disponible (hasta el 90% RSH)
    if (rshTramo === "40" || rshTramo === "60" || rshTramo === "90") {
      if (savings >= 80) {
        return {
          title: "Subsidio DS1 Tramo 3",
          tag: "Recomendado para Sectores Medios (Mayor Ahorro)",
          description: "Dado tu nivel de ahorro (80 UF o más) y tramo social, te recomendamos el Subsidio DS1 Tramo 3. Te permite adquirir viviendas de hasta 2.200 UF (o 2.600 UF en el extremo norte/sur). Obtienes un subsidio estatal de 250 a 400 UF y complementas con un crédito hipotecario tradicional.",
          requirements: ["Tramo del RSH de hasta el 90%", "Ahorro mínimo de 80 UF", "Exige pre-aprobación de crédito bancario"],
          linkSim: "/subsidies/ds1t3",
          linkMax: "/valor-maximo/ds1t3"
        };
      } else {
        return {
          title: "Subsidio DS1 Tramo 2",
          tag: "Recomendado para Sectores Medios (Ahorro Intermedio)",
          description: "Con tu tramo del RSH y tu ahorro mínimo (40 UF), calificas para el Subsidio DS1 Tramo 2. Te permite adquirir viviendas de hasta 1.600 UF. Recibes un subsidio variable de 250 a 550 UF según el precio real de la casa, y complementas el pago con un crédito hipotecario.",
          requirements: ["Tramo del RSH de hasta el 90%", "Ahorro mínimo de 40 UF", "Exige pre-aprobación de crédito bancario"],
          linkSim: "/subsidies/ds1t2",
          linkMax: "/valor-maximo/ds1t2"
        };
      }
    }

    // Para RSH > 90% o sin RSH
    if (savings >= 200) {
      return {
        title: "Subsidio DS1 Tramo 4",
        tag: "Recomendado para Viviendas de Mayor Valor",
        description: "Tu nivel de ahorro te permite acceder al nuevo Subsidio DS1 Tramo 4. Diseñado para viviendas de hasta 4.000 UF con un ahorro mínimo de 200 UF. Aporta un beneficio fijo estatal de 400 UF para ayudar a financiar tu crédito hipotecario.",
        requirements: ["Ahorro mínimo de 200 UF", "Viviendas nuevas o usadas de hasta 4.000 UF", "Exige crédito hipotecario bancario"],
        linkSim: "/subsidies/ds1t4",
        linkMax: "/valor-maximo/ds1t4"
      };
    } else if (savings >= 40) {
      return {
        title: "Subsidio de Integración Social DS19",
        tag: "Recomendado para Compra Directa Inmobiliaria",
        description: "Al tener un ahorro superior a 40 UF, tu alternativa ideal es el Subsidio DS19. No requiere postular individualmente a través de llamados del MINVU; se gestiona directamente en salas de venta de proyectos inmobiliarios que tengan convenio. Permite comprar viviendas de hasta 2.200 o 2.600 UF con ayuda estatal directa y cupos de integración.",
        requirements: ["Ahorro mínimo de 40 u 80 UF", "Gestionado directamente en inmobiliarias autorizadas", "Aplica para viviendas nuevas seleccionadas"],
        linkSim: "/subsidies/ds19",
        linkMax: "/valor-maximo/ds19"
      };
    } else {
      return {
        title: "Compra sin Subsidio (Hipotecario con Ley de Tasas)",
        tag: "Recomendado para Compra Directa",
        description: "Si no dispones del ahorro mínimo exigido para subsidios o perteneces a los sectores de mayores ingresos, puedes optar a un crédito hipotecario privado directo. Actualmente, se aplica de forma automática la rebaja estatal a la tasa del crédito por la nueva Ley de incentivo habitacional para viviendas nuevas.",
        requirements: ["Tener pie mínimo del 10% al 20%", "Capacidad de endeudamiento privada", "Aplica beneficio tributario y tasa especial"],
        linkSim: "/sin-subsidio",
        linkMax: "/valor-maximo/sin-subsidio"
      };
    }
  };

  const rec = getRecommendation();

  // Calcular número total de pasos en Perfil A (total 4 pasos)
  const totalStepsA = 4;
  const progressPercentA = (step / totalStepsA) * 100;

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* Encabezado General */}
        <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Asistente de Subsidios</h1>
              <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
                Encuentra el camino ideal a tu vivienda propia según tu perfil.
              </p>
            </div>
            <Link href="/" className="text-xs font-bold bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all">
              ← Inicio
            </Link>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-3xl mx-auto px-6 py-10">

          {/* 1. SELECCIÓN DE PERFIL INICIAL (si no se especifica en URL) */}
          {profile === null && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6b9ac4] block mb-1">
                  Paso 0: Identificación
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  ¿Cuál es tu situación actual con los subsidios?
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
                  Selecciona una opción para adaptar el asistente a lo que necesitas de forma inteligente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => { setProfile("A"); setStep(1); }}
                  className="w-full text-left p-6 rounded-2xl border border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50 transition-all shadow-sm hover:scale-[1.01] flex flex-col justify-between h-48 group"
                >
                  <div>
                    <span className="text-2xl mb-2 block">🔍</span>
                    <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-[#6b9ac4] transition-colors">
                      Perfil A: Descubrimiento Total
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      No sé mucho sobre los subsidios o en qué tramo del RSH me encuentro. Deseo una guía paso a paso.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#6b9ac4] flex items-center gap-1 mt-4">
                    Iniciar diagnóstico guiado →
                  </span>
                </button>

                <button
                  onClick={() => { setProfile("B"); setStep(1); }}
                  className="w-full text-left p-6 rounded-2xl border border-slate-200 hover:border-[#87c0a3] hover:bg-slate-50 transition-all shadow-sm hover:scale-[1.01] flex flex-col justify-between h-48 group"
                >
                  <div>
                    <span className="text-2xl mb-2 block">⚡</span>
                    <h3 className="font-bold text-slate-900 text-sm md:text-base group-hover:text-[#87c0a3] transition-colors">
                      Perfil B: Simulación Avanzada
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Ya sé qué subsidio buscar o deseo calcular mi presupuesto máximo de compra de inmediato con mis ingresos.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-4">
                    Calcular mi presupuesto ahora →
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* 2. FLUJO PERFIL A: DESCUBRIMIENTO TOTAL */}
          {profile === "A" && (
            <div className="space-y-6">
              
              {/* Progreso Stepper */}
              {step <= totalStepsA && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span className="text-[#6b9ac4] uppercase tracking-wide">Asistente de Descubrimiento (Perfil A)</span>
                    <span>Paso {step} de {totalStepsA}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="bg-[#6b9ac4] h-full transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${progressPercentA}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Tarjeta del Stepper */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                
                {/* Paso 1: Núcleo Familiar */}
                {step === 1 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paso 1: Grupo Familiar</span>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1 leading-snug">
                        ¿Cómo postularás a tu futura vivienda?
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        El número de integrantes de tu hogar determina los tipos de subsidio a los que tienes derecho legal.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <button
                        onClick={() => { setFamilyType("familia"); handleNextStep(); }}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group ${
                          familyType === "familia" 
                            ? "border-[#6b9ac4] bg-blue-50/50 font-bold" 
                            : "border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <strong className="text-slate-800 text-sm block">Con mi grupo o núcleo familiar</strong>
                          <span className="text-xs text-slate-400 font-normal">Postulación con cónyuge, conviviente, hijos u otros familiares dependientes (2 o más personas).</span>
                        </div>
                        <span className="text-slate-300 group-hover:text-[#6b9ac4] font-bold text-lg">→</span>
                      </button>

                      <button
                        onClick={() => setFamilyType("solo")}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group ${
                          familyType === "solo" 
                            ? "border-[#6b9ac4] bg-blue-50/50 font-bold" 
                            : "border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <strong className="text-slate-800 text-sm block">Postulo de manera individual (Solo)</strong>
                          <span className="text-xs text-slate-400 font-normal">Persona soltera o sin cargas familiares registradas ante el MINVU (1 persona).</span>
                        </div>
                        <span className="text-slate-300 group-hover:text-[#6b9ac4] font-bold text-lg">→</span>
                      </button>
                    </div>

                    {familyType === "solo" && (
                      <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-xs text-amber-900 animate-fade-in leading-relaxed">
                        ⚠️ <strong>Restricción del Subsidio DS49:</strong> El subsidio DS49 exige postular obligatoriamente con un núcleo familiar conformado. Al postular solo, solo podrás postular bajo excepciones muy estrictas (ser adulto mayor, persona viuda, tener discapacidad certificada por el COMPIN, o poseer calidad de indígena acreditada por CONADI). Para los subsidios DS1 o DS19 no aplica esta restricción familiar.
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button onClick={handlePrevStep} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                        ← Cambiar Perfil
                      </button>
                      
                      {familyType !== "" && (
                        <button onClick={handleNextStep} className="bg-[#6b9ac4] hover:bg-[#5a86ae] text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all">
                          Siguiente paso
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 2: Registro Social de Hogares (RSH) */}
                {step === 2 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paso 2: Vulnerabilidad Social</span>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1 leading-snug">
                        ¿Conoces tu tramo del Registro Social de Hogares (RSH)?
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        El RSH clasifica la vulnerabilidad socioeconómica del hogar. Si no lo sabes, te ayudamos a estimarlo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => { setKnowsRSH("si"); setRshTramo(""); }}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          knowsRSH === "si" 
                            ? "border-[#6b9ac4] bg-blue-50/30 font-bold" 
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-lg mb-1 block">✓</span>
                        <span className="text-slate-800 text-sm font-semibold">Sí, conozco mi tramo</span>
                      </button>

                      <button
                        onClick={() => { setKnowsRSH("no"); setRshTramo(""); }}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          knowsRSH === "no" 
                            ? "border-[#6b9ac4] bg-blue-50/30 font-bold" 
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-lg mb-1 block">❓</span>
                        <span className="text-slate-800 text-sm font-semibold">No estoy seguro / No lo sé</span>
                      </button>
                    </div>

                    {/* Selector directo de tramo si sabe */}
                    {knowsRSH === "si" && (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 animate-fade-in">
                        <label className="block text-xs font-bold text-slate-600">Selecciona tu tramo en el Registro Social de Hogares:</label>
                        <select 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:border-[#6b9ac4]"
                          value={rshTramo} 
                          onChange={(e) => setRshTramo(e.target.value as any)}
                        >
                          <option value="">Selecciona tramo social...</option>
                          <option value="40">Tramo del 40% más vulnerable</option>
                          <option value="60">Tramo de vulnerabilidad hasta el 60%</option>
                          <option value="90">Tramo de vulnerabilidad hasta el 90%</option>
                          <option value="100">Mayor al 90% / No tengo ficha RSH</option>
                        </select>
                      </div>
                    )}

                    {/* Estimador de tramo si NO sabe */}
                    {knowsRSH === "no" && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fade-in">
                        <span className="text-xs font-bold text-[#6b9ac4] uppercase tracking-wider block">Calculadora Estimativa RSH</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Integrantes del Hogar:</label>
                            <input 
                              type="number" 
                              min="1" 
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none" 
                              value={rshMembers} 
                              onChange={(e) => setRshMembers(e.target.value)} 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Ingreso Familiar Líquido Mensual ($):</label>
                            <input 
                              type="number" 
                              placeholder="Ej: 800000"
                              min="0"
                              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs text-slate-800 focus:outline-none" 
                              value={rshIncome} 
                              onChange={(e) => setRshIncome(e.target.value)} 
                            />
                          </div>
                        </div>

                        {calculatedRsh !== "" && (
                          <div className="bg-[#6b9ac4]/10 border border-[#6b9ac4]/30 p-3 rounded-lg text-xs leading-relaxed text-slate-700">
                            ✨ <strong>Tramo Estimado:</strong> Basado en un ingreso per cápita familiar de <strong>${Math.round(parseFloat(rshIncome)/parseInt(rshMembers)).toLocaleString("es-CL")}</strong>, estimamos que te encuentras en el tramo del <strong>{calculatedRsh === "100" ? "mayor a 90%" : calculatedRsh + "%"}</strong> más vulnerable del RSH.
                            <button 
                              onClick={() => setRshTramo(calculatedRsh)}
                              className="block mt-2 font-bold text-[#6b9ac4] hover:underline"
                            >
                              ✓ Usar este tramo estimado para la recomendación
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button onClick={handlePrevStep} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                        ← Atrás
                      </button>
                      
                      {rshTramo !== "" && (
                        <button onClick={handleNextStep} className="bg-[#6b9ac4] hover:bg-[#5a86ae] text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all">
                          Siguiente paso
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 3: Ahorro Actual */}
                {step === 3 && (
                  <div className="space-y-5 animate-fade-in">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paso 3: Capacidad de Ahorro</span>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1 leading-snug">
                        ¿Con cuánto ahorro cuentas en tu Libreta de Vivienda?
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        El MINVU exige montos mínimos de ahorro depositados para poder postular a los subsidios.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Monto de Ahorro en UF:</label>
                        <input 
                          type="number" 
                          min="0"
                          step="1"
                          required
                          placeholder="Ej: 40"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]"
                          value={savingsUF} 
                          onChange={(e) => setSavingsUF(e.target.value)} 
                        />
                        {savingsUF !== "" && !isNaN(parseFloat(savingsUF)) && (
                          <p className="text-xs font-semibold text-[#6b9ac4] mt-1.5">
                            ≈ ${Math.round(parseFloat(savingsUF) * ufValue).toLocaleString("es-CL")} pesos (CLP)
                          </p>
                        )}
                      </div>

                      {/* Información de referencia rápida */}
                      <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-600 block">Ahorros mínimos de referencia exigidos:</span>
                        <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                          <li><strong>Subsidio DS49:</strong> 10 UF mínimo</li>
                          <li><strong>DS1 Tramo 1:</strong> 30 UF mínimo</li>
                          <li><strong>DS1 Tramo 2 y DS19 (vulnerable):</strong> 40 UF mínimo</li>
                          <li><strong>DS1 Tramo 3 y DS19 (clase media):</strong> 80 UF mínimo</li>
                          <li><strong>DS1 Tramo 4 (4000 UF):</strong> 200 UF mínimo</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <button onClick={handlePrevStep} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                        ← Atrás
                      </button>
                      
                      {savingsUF !== "" && (
                        <button onClick={handleNextStep} className="bg-[#6b9ac4] hover:bg-[#5a86ae] text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all">
                          Ver Recomendación
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Paso 4: Recomendación Final (Resultados Perfil A) */}
                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Recomendación de Subsidio</span>
                    </div>

                    <div className="border-b border-slate-100 pb-5">
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold py-1 px-2.5 rounded-full inline-block mb-2 shadow-sm border border-emerald-100">
                        {rec.tag}
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                        {rec.title}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-600 mt-3 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    {/* Requisitos */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Requisitos del beneficio:</span>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pl-2">
                        {rec.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                      <Link 
                        href={rec.linkSim}
                        className="flex-1 py-3.5 px-4 bg-[#6b9ac4] hover:bg-[#5a86ae] text-white font-bold text-center text-xs md:text-sm rounded-xl transition-all shadow-sm"
                      >
                        Simular Dividendo
                      </Link>
                      
                      {rec.linkMax !== rec.linkSim && (
                        <Link 
                          href={rec.linkMax}
                          className="flex-1 py-3.5 px-4 bg-[#87c0a3] hover:bg-[#76b092] text-slate-950 font-bold text-center text-xs md:text-sm rounded-xl transition-all shadow-sm"
                        >
                          Calcular Presupuesto de Compra
                        </Link>
                      )}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={handleRestart}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium underline transition-colors"
                      >
                        Volver a empezar el test
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 3. FLUJO PERFIL B: SIMULACIÓN RÁPIDA / AVANZADA */}
          {profile === "B" && (
            <div className="space-y-6">
              
              {!resultsB ? (
                // Formulario de Entrada Perfil B
                <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Simulación Rápida (Perfil B)</span>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">Calcular Capacidad de Compra Inmediata</h2>
                    </div>
                    <button onClick={handlePrevStep} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                      Volver
                    </button>
                  </div>

                  <form onSubmit={handleCalculateB} className="space-y-5">
                    
                    {/* Fila 1: Ingreso y Ahorro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Renta Líquida Familiar Mensual ($ CLP):
                        </label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          placeholder="Ej: 1200000"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={incomeCLPB} 
                          onChange={(e) => setIncomeCLPB(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ahorro Disponible para la Compra (UF):
                        </label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          step="1"
                          placeholder="Ej: 80"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={savingsUFB} 
                          onChange={(e) => setSavingsUFB(e.target.value)} 
                        />
                        {savingsUFB !== "" && !isNaN(parseFloat(savingsUFB)) && (
                          <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                            ≈ ${Math.round(parseFloat(savingsUFB) * ufValue).toLocaleString("es-CL")} CLP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fila 2: Subsidio Asignado y Ubicación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subsidio ganado o al que postularás:</label>
                        <select 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={selectedSubsidyB} 
                          onChange={(e) => setSelectedSubsidyB(e.target.value)}
                        >
                          <option value="none">Compra sin Subsidio (Hipotecario Tradicional)</option>
                          <option value="ds1t1">Subsidio DS1 Tramo 1</option>
                          <option value="ds1t2">Subsidio DS1 Tramo 2</option>
                          <option value="ds1t3">Subsidio DS1 Tramo 3</option>
                          <option value="ds1t4">Subsidio DS1 Tramo 4 (4000 UF)</option>
                          <option value="ds19">Proyecto de Integración DS19</option>
                          <option value="ds49">Subsidio DS49 (Fondo Solidario)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación de la vivienda:</label>
                        <select 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={locationB} 
                          onChange={(e) => setLocationB(e.target.value)}
                        >
                          <option value="none">Zona Regular / Centro-Sur</option>
                          <option value="north">Extremo Norte (Arica, Tarapacá, Antofagasta, Atacama)</option>
                          <option value="south">Extremo Sur (Aysén, Magallanes)</option>
                        </select>
                      </div>
                    </div>

                    {/* Fila 3: Banco y Plazo (Solo si no es DS49) */}
                    {selectedSubsidyB !== "ds49" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Institución Financiera para Simulación:</label>
                          <select 
                            required
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                            value={selectedBankB} 
                            onChange={(e) => setSelectedBankB(e.target.value)}
                          >
                            <option value="">Selecciona un banco...</option>
                            {Object.keys(BANKS).map(key => (
                              <option key={key} value={key}>
                                {BANKS[key].name} ({BANKS[key].tasaBase ? `${(BANKS[key].tasaBase * 100).toFixed(2)}%` : 'Tasa Dinámica'})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Plazo del Crédito Hipotecario:</label>
                          <select 
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                            value={loanTermB} 
                            onChange={(e) => setLoanTermB(e.target.value)}
                          >
                            <option value="15">15 años</option>
                            <option value="20">20 años</option>
                            <option value="25">25 años</option>
                            <option value="30">30 años</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Leyes y Beneficios Adicionales */}
                    {selectedSubsidyB !== "ds49" && (
                      <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded text-[#87c0a3]" 
                            checked={isYoungSingleB} 
                            onChange={(e) => setIsYoungSingleB(e.target.checked)} 
                          />
                          ¿Eres joven soltero menor de 35 años? (Permite endeudamiento al 33% de la renta)
                        </label>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full bg-[#87c0a3] hover:bg-[#76b092] text-slate-950 font-bold p-3.5 rounded-xl transition-all shadow-sm text-sm"
                    >
                      Calcular Capacidad de Compra Real →
                    </button>
                  </form>
                </section>
              ) : (
                // Resultados de Simulación Perfil B
                <section className="space-y-6 animate-fade-in">
                  
                  {/* Encabezado del resultado */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="text-center pb-6 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Tu capacidad de compra estimada es
                      </span>
                      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-none">
                        {resultsB.maxHouseUF.toFixed(0)} UF
                      </h2>
                      <p className="text-lg font-bold text-emerald-600 mt-2">
                        ≈ ${Math.round(resultsB.maxHouseUF * ufValue).toLocaleString("es-CL")} CLP
                      </p>
                    </div>

                    {/* Desglose */}
                    <div className="py-6 space-y-4 text-xs md:text-sm">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Estructura del Presupuesto ({resultsB.subsidyName})
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-500 block">Tu Ahorro:</span>
                          <strong className="text-slate-800 text-sm md:text-base">{resultsB.savingsUF.toFixed(0)} UF</strong>
                          <span className="text-[10px] text-slate-400 block">($ {Math.round(resultsB.savingsUF * ufValue).toLocaleString("es-CL")})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Aporte Subsidio Estatal:</span>
                          <strong className="text-emerald-600 text-sm md:text-base">+{resultsB.subsidyUF.toFixed(0)} UF</strong>
                          <span className="text-[10px] text-slate-400 block">($ {Math.round(resultsB.subsidyUF * ufValue).toLocaleString("es-CL")})</span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-slate-50">
                          <span className="text-slate-500 block">Crédito Hipotecario Recomendado:</span>
                          <strong className="text-blue-600 text-sm md:text-base">
                            {selectedSubsidyB === "ds49" ? "No requiere deuda hipotecaria" : `${resultsB.loanUF.toFixed(0)} UF`}
                          </strong>
                          {selectedSubsidyB !== "ds49" && (
                            <span className="text-[10px] text-slate-400 block">($ {Math.round(resultsB.loanUF * ufValue).toLocaleString("es-CL")} en {resultsB.bank})</span>
                          )}
                        </div>
                      </div>

                      {selectedSubsidyB !== "ds49" && resultsB.maxDividendUF > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center text-xs mt-2">
                          <span className="font-bold text-slate-500 uppercase">Dividendo Mensual Dividido:</span>
                          <strong className="text-slate-900 text-sm md:text-base">
                            {resultsB.maxDividendUF.toFixed(2)} UF 
                            <span className="font-normal text-xs text-slate-400 ml-1">
                              ($ {Math.round(resultsB.maxDividendUF * ufValue).toLocaleString("es-CL")})
                            </span>
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100">
                      <Link
                        href={`/ofertas-inmobiliarias?maxPrice=${Math.round(resultsB.maxHouseUF * ufValue)}&maxUF=${Math.round(resultsB.maxHouseUF)}&credit=${Math.round(resultsB.loanUF)}&origin=${selectedSubsidyB}&region=metropolitana`}
                        className="flex-grow py-3.5 px-4 bg-[#87c0a3] hover:bg-[#76b092] text-slate-950 font-bold text-center text-xs md:text-sm rounded-xl transition-all shadow-sm"
                      >
                        Buscar Ofertas Compatibles
                      </Link>

                      <Link 
                        href="/formulario"
                        className="flex-grow py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-center text-xs md:text-sm rounded-xl transition-all shadow-sm"
                      >
                        Evaluar mi Capacidad Gratis
                      </Link>
                    </div>

                    <div className="text-center pt-4">
                      <button
                        onClick={handleRestart}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium underline transition-colors"
                      >
                        Volver a simular con otros valores
                      </button>
                    </div>

                  </div>

                </section>
              )}

            </div>
          )}

        </main>
      </div>

      {/* Footer único */}
      <footer className="text-center py-6 text-slate-400 text-xs border-t border-slate-200 bg-white">
        <p>© 2026 SubsiMatch</p>
      </footer>
    </div>
  );
}

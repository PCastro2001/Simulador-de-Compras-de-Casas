// src/app/asistente-subsidios/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUFValue } from "@/utils/api";
import { BANKS } from "@/data/banks";
import { REGION_MAP } from "@/data/regions";

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

  // Región e Ingreso para Perfil A
  const [regionA, setRegionA] = useState<string>("metropolitana");
  const [incomeCLPA, setIncomeCLPA] = useState<string>("");

  // Ahorro Perfil A
  const [savingsUF, setSavingsUF] = useState<string>("");
  const [savingsCLPA, setSavingsCLPA] = useState<string>("");

  // Controles dinámicos de Resultados Perfil A
  const [loanTermA, setLoanTermA] = useState<string>("25");
  const [isYoungSingleA, setIsYoungSingleA] = useState<boolean>(false);
  const [selectedBankA, setSelectedBankA] = useState<string>("BancoEstado");

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

  // Sincronizar renta y tramo de RSH de forma automática
  useEffect(() => {
    setIncomeCLPA(rshIncome);
  }, [rshIncome]);

  useEffect(() => {
    setRshTramo(calculatedRsh);
  }, [calculatedRsh]);

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
    setRegionA("metropolitana");
    setIncomeCLPA("");
    setSavingsUF("");
    setSavingsCLPA("");
    setLoanTermA("25");
    setIsYoungSingleA(false);
    setSelectedBankA("BancoEstado");
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

  // --- MATRIZ DE ZONAS GEOGRÁFICAS ---
  const getDS1Zone = (reg: string) => {
    if (["arica-y-parinacota", "tarapaca", "antofagasta", "atacama"].includes(reg)) {
      return "north";
    }
    if (["aysen", "magallanes"].includes(reg)) {
      return "south";
    }
    return "none";
  };

  const getDS19LocationZone = (reg: string) => {
    if (["aysen", "magallanes"].includes(reg)) {
      return "sur_islas";
    }
    if (["arica-y-parinacota", "tarapaca", "antofagasta", "atacama", "metropolitana"].includes(reg)) {
      return "urbana_norte_stgo";
    }
    return "regular";
  };

  // --- FÓRMULAS DE TOPES DE SUBSIDIO VARIABLE ---
  const calculateDS1T2Max = (maxLoanUF: number, savings: number, location: string) => {
    const baseCapacity = maxLoanUF + savings;
    let maxPropertyValue = 0;
    let subsidy = 0;
    if (location === 'none') {
      const projected = (baseCapacity + 550 + (0.375 * 800)) / 1.375;
      if (projected <= 800) { maxPropertyValue = baseCapacity + 550; subsidy = 550; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 550 - ((projected - 800) * 0.375); }
      else { maxPropertyValue = baseCapacity + 250; subsidy = 250; }
    } else if (location === 'north') {
      const projected = (baseCapacity + 650 + (0.375 * 800)) / 1.375;
      if (projected <= 800) { maxPropertyValue = baseCapacity + 650; subsidy = 650; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 650 - ((projected - 800) * 0.375); }
      else { maxPropertyValue = baseCapacity + 350; subsidy = 350; }
    } else {
      const projected = (baseCapacity + 700 + (0.375 * 800)) / 1.375;
      if (projected <= 800) { maxPropertyValue = baseCapacity + 700; subsidy = 700; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 700 - ((projected - 800) * 0.375); }
      else { maxPropertyValue = baseCapacity + 400; subsidy = 400; }
    }
    if (maxPropertyValue > 1600) maxPropertyValue = 1600;
    return { maxHouseUF: maxPropertyValue, subsidyUF: subsidy };
  };

  const calculateDS1T3Max = (maxLoanUF: number, savings: number, location: string) => {
    const baseCapacity = maxLoanUF + savings;
    let maxPropertyValue = 0;
    let subsidy = 0;
    if (location === 'none') {
      const projected = (baseCapacity + 850) / 1.375;
      if (projected <= 1200) { maxPropertyValue = baseCapacity + 400; subsidy = 400; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 850 - (0.375 * projected); }
      else { maxPropertyValue = baseCapacity + 250; subsidy = 250; }
    } else if (location === 'north') {
      const projected = (baseCapacity + 500 + (1200 * (1/7))) / (8/7);
      if (projected <= 1200) { maxPropertyValue = baseCapacity + 500; subsidy = 500; }
      else if (projected <= 2600) { maxPropertyValue = projected; subsidy = 500 - ((projected - 1200) * (1/7)); }
      else { maxPropertyValue = baseCapacity + 300; subsidy = 300; }
    } else {
      const projected = (baseCapacity + 550 + (1200 * (1/7))) / (8/7);
      if (projected <= 1200) { maxPropertyValue = baseCapacity + 550; subsidy = 550; }
      else if (projected <= 2600) { maxPropertyValue = projected; subsidy = 550 - ((projected - 1200) * (1/7)); }
      else { maxPropertyValue = baseCapacity + 350; subsidy = 350; }
    }
    const legalMax = (location === 'none') ? 2200 : 2600;
    if (maxPropertyValue > legalMax) maxPropertyValue = legalMax;
    return { maxHouseUF: maxPropertyValue, subsidyUF: subsidy };
  };

  const calculateDS1T2MaxWithDS15 = (maxLoanUF: number, savings: number, location: string) => {
    // DS15 para Tramo 2 otorga un bono de 150 UF y sube el tope a 3000 UF
    const baseCapacity = maxLoanUF + savings + 150;
    let maxPropertyValue = 0;
    let subsidy = 0;
    if (location === 'none') {
      const projected = (baseCapacity + 550 + (0.375 * 800)) / 1.375;
      if (projected <= 800) { maxPropertyValue = baseCapacity + 550; subsidy = 550; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 550 - ((projected - 800) * 0.375); }
      else { maxPropertyValue = baseCapacity + 250; subsidy = 250; }
    } else if (location === 'north') {
      const projected = (baseCapacity + 650 + (0.375 * 800)) / 1.375;
      if (projected <= 800) { maxPropertyValue = baseCapacity + 650; subsidy = 650; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 650 - ((projected - 800) * 0.375); }
      else { maxPropertyValue = baseCapacity + 350; subsidy = 350; }
    } else {
      const projected = (baseCapacity + 700 + (0.375 * 800)) / 1.375;
      if (projected <= 800) { maxPropertyValue = baseCapacity + 700; subsidy = 700; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 700 - ((projected - 800) * 0.375); }
      else { maxPropertyValue = baseCapacity + 400; subsidy = 400; }
    }
    if (maxPropertyValue > 3000) maxPropertyValue = 3000;
    return { maxHouseUF: maxPropertyValue, subsidyUF: subsidy + 150 };
  };

  const calculateDS1T3MaxWithDS15 = (maxLoanUF: number, savings: number, location: string) => {
    // DS15 para Tramo 3 otorga un bono de 150 UF y sube el tope a 3000 UF
    const baseCapacity = maxLoanUF + savings + 150;
    let maxPropertyValue = 0;
    let subsidy = 0;
    if (location === 'none') {
      const projected = (baseCapacity + 850) / 1.375;
      if (projected <= 1200) { maxPropertyValue = baseCapacity + 400; subsidy = 400; }
      else if (projected <= 1600) { maxPropertyValue = projected; subsidy = 850 - (0.375 * projected); }
      else { maxPropertyValue = baseCapacity + 250; subsidy = 250; }
    } else if (location === 'north') {
      const projected = (baseCapacity + 500 + (1200 * (1/7))) / (8/7);
      if (projected <= 1200) { maxPropertyValue = baseCapacity + 500; subsidy = 500; }
      else if (projected <= 2600) { maxPropertyValue = projected; subsidy = 500 - ((projected - 1200) * (1/7)); }
      else { maxPropertyValue = baseCapacity + 300; subsidy = 300; }
    } else {
      const projected = (baseCapacity + 550 + (1200 * (1/7))) / (8/7);
      if (projected <= 1200) { maxPropertyValue = baseCapacity + 550; subsidy = 550; }
      else if (projected <= 2600) { maxPropertyValue = projected; subsidy = 550 - ((projected - 1200) * (1/7)); }
      else { maxPropertyValue = baseCapacity + 350; subsidy = 350; }
    }
    if (maxPropertyValue > 3000) maxPropertyValue = 3000;
    return { maxHouseUF: maxPropertyValue, subsidyUF: subsidy + 150 };
  };

  const handleSavingsUFChange = (val: string) => {
    setSavingsUF(val);
    const uf = parseFloat(val);
    if (!isNaN(uf) && ufValue > 0) {
      setSavingsCLPA((uf * ufValue).toFixed(0));
    } else {
      setSavingsCLPA("");
    }
  };

  const handleSavingsCLPChange = (val: string) => {
    setSavingsCLPA(val);
    const clp = parseFloat(val);
    if (!isNaN(clp) && ufValue > 0) {
      setSavingsUF((clp / ufValue).toFixed(2));
    } else {
      setSavingsUF("");
    }
  };

  // --- CÁLCULO DINÁMICO DE MULTI-RECOMENDACIONES PERFIL A ---
  const getDynamicRecommendationsA = () => {
    const savings = parseFloat(savingsUF) || 0;
    const income = parseFloat(incomeCLPA) || 0;
    const term = parseInt(loanTermA) || 25;
    const isYoungSingle = isYoungSingleA;
    const bankKey = selectedBankA || "BancoEstado";

    const bankData = BANKS[bankKey] || BANKS["BancoEstado"];
    const incomeMultiplier = isYoungSingle ? 3 : 4;
    const maxMonthlyPaymentUF = (income / ufValue) / incomeMultiplier;

    // Calcular tasa bancaria
    const tasaOriginal = bankData.calcularTasa ? bankData.calcularTasa(1000, term) : (bankData.tasaBase || 0.045);
    const descuento = bankData.descuentoDS15 || 0.009;
    const tasaDS15 = tasaOriginal - descuento;

    const monthlyRateNormal = tasaOriginal / 12;
    const monthlyRateDS15 = tasaDS15 / 12;
    const totalPayments = term * 12;

    const maxLoanUFNormal = monthlyRateNormal > 0 
      ? maxMonthlyPaymentUF * ((1 - Math.pow(1 + monthlyRateNormal, -totalPayments)) / monthlyRateNormal)
      : 0;

    const maxLoanUFDS15 = monthlyRateDS15 > 0 
      ? maxMonthlyPaymentUF * ((1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) / monthlyRateDS15)
      : 0;

    const ds1Zone = getDS1Zone(regionA);
    const ds19Zone = getDS19LocationZone(regionA);

    const hhSize = familyType === "solo" ? 1 : (parseInt(rshMembers) || 3);

    const checkDS1T3IncomeLimit = (inc: number, sz: number, loc: string) => {
      const limitsNorthSouth = [2589712, 3386546, 3705280, 4204014];
      const limitsRegular = [1992086, 2788921, 3107655, 3426388];
      const limits = (loc === "north" || loc === "south") ? limitsNorthSouth : limitsRegular;
      const idx = Math.min(sz - 1, 3);
      return inc <= limits[idx];
    };

    const checkDS1T4IncomeLimit = (inc: number, sz: number) => {
      const baseLimits = [1992086, 2788921, 3107655, 3426388];
      const idx = Math.min(sz - 1, 3);
      return inc <= (baseLimits[idx] * 1.8);
    };

    const meetsDS1T3Limit = checkDS1T3IncomeLimit(income, hhSize, ds1Zone);
    const meetsDS1T4Limit = checkDS1T4IncomeLimit(income, hhSize);

    const cards: any[] = [];

    // --- OPCIÓN 1: DS19 (Proyecto de Integración - Vivienda Nueva Directa) ---
    const isVulnerableEligible = rshTramo === "40" || rshTramo === "60";
    const isClaseMediaEligible = rshTramo === "40" || rshTramo === "60" || rshTramo === "90" || (rshTramo === "100" && meetsDS1T3Limit);

    if (isVulnerableEligible) {
      // Cupo Vulnerable DS19 (Sin Crédito)
      const minAhorro = 10;
      const sub = ds19Zone === "sur_islas" ? 1700 : (ds19Zone === "urbana_norte_stgo" ? 1250 : 1150);
      const cap = ds19Zone === "sur_islas" ? 2000 : 1550;
      const valMax = Math.min(savings + sub, cap);
      cards.push({
        id: "ds19-vulnerable",
        subsidyKey: "ds19",
        cupoType: "vulnerable",
        badge: "Vivienda Nueva - Convenio Inmobiliaria",
        title: "Subsidio DS19 (Cupo Vulnerable)",
        description: "Adquiere una vivienda nueva en proyectos con convenio sin deuda hipotecaria bancaria. El financiamiento es cubierto por el Estado y tu ahorro.",
        maxHouseUF: valMax,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF: sub,
        minAhorro,
        hasDS15Option: false
      });
    }

    if (isClaseMediaEligible) {
      // Sectores Medios DS19 (Con Crédito)
      const minAhorroNormal = 40;
      const capMedio = ds19Zone === "sur_islas" ? 3000 : (ds19Zone === "urbana_norte_stgo" ? 2800 : 2600);
      const valMaxNormal = Math.min(maxLoanUFNormal + savings + 350, capMedio);
      const creditRealNormal = Math.max(0, valMaxNormal - savings - 350);

      const valMaxDS15 = Math.min(maxLoanUFDS15 + savings + 450, capMedio);
      const creditRealDS15 = Math.max(0, valMaxDS15 - savings - 450);

      cards.push({
        id: "ds19-clase-media",
        subsidyKey: "ds19",
        cupoType: "urban_media",
        badge: "Vivienda Nueva - Convenio Inmobiliaria",
        title: "Subsidio DS19 (Sectores Medios)",
        description: "Permite comprar vivienda nueva en proyectos integrados. Combina tu ahorro, subsidio estatal y crédito hipotecario gestionándose directamente con la inmobiliaria.",
        hasDS15Option: true,
        normalInfo: {
          maxHouseUF: valMaxNormal,
          loanUF: creditRealNormal,
          subsidyUF: 350,
          minAhorro: minAhorroNormal
        },
        ds15Info: {
          maxHouseUF: valMaxDS15,
          loanUF: creditRealDS15,
          subsidyUF: 450,
          minAhorro: 80
        }
      });
    }

    // --- OPCIÓN 2: DS1 o DS49 (Postulación Individual MINVU - Nueva/Usada/Construcción) ---
    if (familyType === "familia" && rshTramo === "40") {
      // Recomendar DS49 (Fondo Solidario)
      const minAhorro = 10;
      const sub = 1100;
      const valMax = Math.min(savings + sub, 1100);
      cards.push({
        id: "ds49",
        subsidyKey: "ds49",
        badge: "Vivienda Nueva o Usada - Postulación MINVU",
        title: "Subsidio DS49 (Fondo Solidario)",
        description: "Postulación para comprar casa sin crédito hipotecario. Orientado a familias del 40% RSH. Puedes postular en llamados individuales o comités de vivienda.",
        maxHouseUF: valMax,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF: sub,
        minAhorro,
        hasDS15Option: false
      });
    } else if (rshTramo === "40" || rshTramo === "60") {
      // Recomendar DS1 Tramo 1
      const minAhorro = 30;
      const cap = ds1Zone === "north" ? 1200 : (ds1Zone === "south" ? 1250 : 1100);
      const sub = ds1Zone === "north" ? 700 : (ds1Zone === "south" ? 750 : 600);
      const valMax = Math.min(maxLoanUFNormal + savings + sub, cap);
      const creditReal = Math.max(0, valMax - savings - sub);
      cards.push({
        id: "ds1t1",
        subsidyKey: "ds1t1",
        badge: "Vivienda Nueva/Usada o Construcción - MINVU",
        title: "Subsidio DS1 Tramo 1",
        description: "Para familias hasta el 60% RSH. Otorga un subsidio estatal alto y fijo, requiriendo un crédito bancario pequeño o pago al contado de la diferencia.",
        maxHouseUF: valMax,
        loanUF: creditReal,
        savingsUF: savings,
        subsidyUF: sub,
        minAhorro,
        hasDS15Option: false
      });
    } else if (rshTramo === "90" || (rshTramo === "100" && meetsDS1T3Limit)) {
      // Recomendar DS1 Tramo 2 o Tramo 3 según ahorro
      if (savings >= 80) {
        // Tramo 3
        const resNormal = calculateDS1T3Max(maxLoanUFNormal, savings, ds1Zone);
        const creditRealNormal = Math.max(0, resNormal.maxHouseUF - savings - resNormal.subsidyUF);

        const resDS15 = calculateDS1T3MaxWithDS15(maxLoanUFDS15, savings, ds1Zone);
        const creditRealDS15 = Math.max(0, resDS15.maxHouseUF - savings - resDS15.subsidyUF);

        cards.push({
          id: "ds1t3",
          subsidyKey: "ds1t3",
          badge: "Vivienda Nueva/Usada o Construcción - MINVU",
          title: "Subsidio DS1 Tramo 3",
          description: "Para la compra de viviendas de hasta 2.200 UF (o 3.000 UF con beneficio DS15). Requiere capacidad de crédito hipotecario bancario obligatorio.",
          hasDS15Option: true,
          normalInfo: {
            maxHouseUF: resNormal.maxHouseUF,
            loanUF: creditRealNormal,
            subsidyUF: resNormal.subsidyUF,
            minAhorro: 80
          },
          ds15Info: {
            maxHouseUF: resDS15.maxHouseUF,
            loanUF: creditRealDS15,
            subsidyUF: resDS15.subsidyUF,
            minAhorro: 160
          }
        });
      } else {
        // Tramo 2
        const resNormal = calculateDS1T2Max(maxLoanUFNormal, savings, ds1Zone);
        const creditRealNormal = Math.max(0, resNormal.maxHouseUF - savings - resNormal.subsidyUF);

        const resDS15 = calculateDS1T2MaxWithDS15(maxLoanUFDS15, savings, ds1Zone);
        const creditRealDS15 = Math.max(0, resDS15.maxHouseUF - savings - resDS15.subsidyUF);

        cards.push({
          id: "ds1t2",
          subsidyKey: "ds1t2",
          badge: "Vivienda Nueva/Usada o Construcción - MINVU",
          title: "Subsidio DS1 Tramo 2",
          description: "Ofrece un subsidio intermedio variable para comprar viviendas de hasta 1.600 UF (o 3.000 UF con beneficio DS15) con financiamiento bancario complementario.",
          hasDS15Option: true,
          normalInfo: {
            maxHouseUF: resNormal.maxHouseUF,
            loanUF: creditRealNormal,
            subsidyUF: resNormal.subsidyUF,
            minAhorro: 40
          },
          ds15Info: {
            maxHouseUF: resDS15.maxHouseUF,
            loanUF: creditRealDS15,
            subsidyUF: resDS15.subsidyUF,
            minAhorro: 80
          }
        });
      }
    }

    if (rshTramo === "100" && meetsDS1T4Limit) {
      // Recomendar DS1 Tramo 4
      const minAhorro = 200;
      const effectiveSavings = savings < minAhorro ? minAhorro : savings;
      const cap = 4000;
      const sub = 400;
      const valMax = Math.min(maxLoanUFNormal + effectiveSavings + sub, cap);
      const creditReal = Math.max(0, valMax - effectiveSavings - sub);
      cards.push({
        id: "ds1t4",
        subsidyKey: "ds1t4",
        badge: "Vivienda Nueva/Usada - MINVU",
        title: "Subsidio DS1 Tramo 4",
        description: "Diseñado para viviendas de sectores medios de hasta 4.000 UF con un ahorro alto. El subsidio estatal es un apoyo fijo directo al crédito hipotecario.",
        maxHouseUF: valMax,
        loanUF: creditReal,
        savingsUF: effectiveSavings,
        subsidyUF: sub,
        minAhorro,
        hasDS15Option: false
      });
    }

    // --- OPCIÓN 3: COMPRA SIN SUBSIDIO (Financiamiento Privado Puro) ---
    // Opción A: Vivienda Nueva (Con FOGAES + Subsidio Dividendo)
    const maxHouseFogaesWithDiscount = Math.min(4000, Math.min(savings / 0.10, maxLoanUFDS15 + savings));
    const maxHouseFogaesNormal = Math.min(4500, Math.min(savings / 0.10, maxLoanUFNormal + savings));
    const maxHouseFogaes = Math.max(maxHouseFogaesWithDiscount, maxHouseFogaesNormal);
    const loanFogaes = Math.max(0, maxHouseFogaes - savings);
    const aplicaLeyFogaes = maxHouseFogaes < 4000;
    
    // Aviso de optimización para FOGAES
    const maxLoanFogaes = aplicaLeyFogaes ? maxLoanUFDS15 : maxLoanUFNormal;
    const maxHouseFogaesByIncome = maxLoanFogaes / 0.9;
    let avisoFogaes = "";
    if (maxHouseFogaes < Math.min(4500, maxHouseFogaesByIncome)) {
      const targetUF = Math.min(4500, maxHouseFogaesByIncome);
      const neededSavings = targetUF * 0.10;
      const missing = neededSavings - savings;
      avisoFogaes = `💡 Con un pie adicional de ${missing.toFixed(0)} UF (aprox. $${Math.round(missing * ufValue).toLocaleString("es-CL")} CLP), podrías aprovechar al máximo tu sueldo y comprar una propiedad nueva de hasta ${targetUF.toFixed(0)} UF.`;
    }

    // Opción B: Vivienda Usada (Sin FOGAES ni Subsidio Dividendo - Pie 20%)
    const maxHouseUsada = Math.min(savings / 0.20, maxLoanUFNormal + savings);
    const loanUsada = Math.max(0, maxHouseUsada - savings);
    
    // Aviso de optimización para Usada
    const maxHouseUsadaByIncome = maxLoanUFNormal / 0.8;
    let avisoUsada = "";
    if (maxHouseUsada < maxHouseUsadaByIncome) {
      const targetUF = maxHouseUsadaByIncome;
      const neededSavings = targetUF * 0.20;
      const missing = neededSavings - savings;
      avisoUsada = `💡 Con un pie adicional de ${missing.toFixed(0)} UF (aprox. $${Math.round(missing * ufValue).toLocaleString("es-CL")} CLP), podrías aprovechar al máximo tu sueldo y comprar una propiedad usada de hasta ${targetUF.toFixed(0)} UF.`;
    }

    cards.push({
      id: "sin-subsidio",
      subsidyKey: "none",
      badge: "Compra Directa - Financiamiento Privado",
      title: "Crédito Hipotecario sin Subsidio",
      description: "Compra cualquier vivienda en el mercado inmobiliario general. Obtén financiamiento privado adaptado al estado de la vivienda.",
      hasFogaesOption: true,
      fogaesInfo: {
        maxHouseUF: maxHouseFogaes,
        loanUF: loanFogaes,
        piePercentage: 10,
        aplicaLey: aplicaLeyFogaes,
        aviso: avisoFogaes
      },
      normalInfo: {
        maxHouseUF: maxHouseUsada,
        loanUF: loanUsada,
        piePercentage: 20,
        aplicaLey: false, // Usadas no tienen ley
        aviso: avisoUsada
      }
    });

    return cards;
  };

  const recommendationsA = getDynamicRecommendationsA();

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

    const tasaOriginal = bankData.calcularTasa ? bankData.calcularTasa(1000, term) : (bankData.tasaBase || 0.045);
    const tasaAplicada = tasaOriginal - (bankData.descuentoDS15 || 0);

    const monthlyRate = tasaAplicada / 12;
    const totalPayments = term * 12;
    const maxLoanUF = monthlyRate > 0 
      ? maxMonthlyPaymentUF * ((1 - Math.pow(1 + monthlyRate, -totalPayments)) / monthlyRate)
      : 0;

    let maxHouseUF = 0;
    let subsidyUF = 0;
    let legalMaxCap = 0;
    let subsidyName = "";

    switch (selectedSubsidyB) {
      case "ds49":
        subsidyUF = 1100;
        legalMaxCap = 1100;
        maxHouseUF = savings + subsidyUF;
        subsidyName = "Subsidio DS49 (Fondo Solidario)";
        break;
      case "ds1t1":
        subsidyUF = locationB === "north" ? 700 : locationB === "south" ? 750 : 600;
        legalMaxCap = locationB === "north" ? 1200 : locationB === "south" ? 1250 : 1100;
        maxHouseUF = Math.min(maxLoanUF + savings + subsidyUF, legalMaxCap);
        subsidyName = "DS1 Tramo 1";
        break;
      case "ds1t2":
        legalMaxCap = 1600;
        subsidyName = "DS1 Tramo 2";
        const t2Res = calculateDS1T2Max(maxLoanUF, savings, locationB);
        maxHouseUF = t2Res.maxHouseUF;
        subsidyUF = t2Res.subsidyUF;
        break;
      case "ds1t3":
        legalMaxCap = locationB === "none" ? 2200 : 2600;
        subsidyName = "DS1 Tramo 3";
        const t3Res = calculateDS1T3Max(maxLoanUF, savings, locationB);
        maxHouseUF = t3Res.maxHouseUF;
        subsidyUF = t3Res.subsidyUF;
        break;
      case "ds1t4":
        subsidyUF = 400;
        legalMaxCap = 4000;
        const effectiveSavingsB = savings < 200 ? 200 : savings;
        maxHouseUF = Math.min(maxLoanUF + effectiveSavingsB + subsidyUF, legalMaxCap);
        subsidyName = "DS1 Tramo 4";
        break;
      case "ds19":
        subsidyUF = 350;
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

    const finalSavingsB = (selectedSubsidyB === "ds1t4" && savings < 200) ? 200 : savings;
    const finalLoan = selectedSubsidyB === "ds49" ? 0 : Math.max(0, maxHouseUF - finalSavingsB - subsidyUF);

    setResultsB({
      maxHouseUF,
      loanUF: finalLoan,
      savingsUF: finalSavingsB,
      originalSavingsUF: savings,
      subsidyUF,
      maxDividendUF: selectedSubsidyB === "ds49" ? 0 : (finalLoan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments)),
      bank: bankData.name,
      tasaAplicada,
      legalMaxCap,
      subsidyName
    });
  };

  // Calcular número total de pasos en Perfil A (total 5 pasos)
  const totalStepsA = 5;
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
        <main className="max-w-5xl mx-auto px-6 py-10">

          {/* 1. SELECCIÓN DE PERFIL INICIAL */}
          {profile === null && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-fade-in">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6b9ac4] block mb-1">
                  Paso 0: Identificación
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  ¿Cuál es tu situación actual con los subsidios?
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
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
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Progreso Stepper */}
              {step <= totalStepsA && (
                <div className="max-w-3xl mx-auto space-y-2">
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

              {/* Contenedores por pasos de Perfil A */}
              {step === 1 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto animate-fade-in space-y-5">
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

              {step === 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto animate-fade-in space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paso 2: Registro Social de Hogares (RSH)</span>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1 leading-snug">
                      Ingresa los datos de tu hogar para estimar tu tramo del RSH
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      El Registro Social de Hogares clasifica tu vulnerabilidad socioeconómica. Necesitamos estos datos para calcular a qué subsidios calificas.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Integrantes del Hogar:</label>
                        <input 
                          type="number" 
                          min="1" 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-800 focus:outline-none focus:border-[#6b9ac4]" 
                          value={rshMembers} 
                          onChange={(e) => setRshMembers(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ingreso Familiar Líquido Mensual ($ CLP):</label>
                        <input 
                          type="number" 
                          placeholder="Ej: 800000"
                          min="0"
                          required
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-800 focus:outline-none focus:border-[#6b9ac4]" 
                          value={rshIncome} 
                          onChange={(e) => setRshIncome(e.target.value)} 
                        />
                      </div>
                    </div>

                    {calculatedRsh !== "" && (
                      <div className="bg-[#6b9ac4]/10 border border-[#6b9ac4]/30 p-3 rounded-lg text-xs leading-relaxed text-slate-700">
                        ✨ <strong>Tramo Estimado:</strong> Basado en un ingreso per cápita familiar de <strong>${Math.round(parseFloat(rshIncome)/parseInt(rshMembers)).toLocaleString("es-CL")}</strong>, estimamos que te encuentras en el tramo del <strong>{calculatedRsh === "100" ? "mayor a 90%" : calculatedRsh + "%"}</strong> de vulnerabilidad.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button onClick={handlePrevStep} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                      ← Atrás
                    </button>
                    
                    <button 
                      onClick={handleNextStep}
                      disabled={rshIncome === "" || parseFloat(rshIncome) < 0}
                      className={`font-bold text-xs py-2.5 px-5 rounded-lg transition-all ${
                        (rshIncome !== "" && parseFloat(rshIncome) >= 0)
                          ? "bg-[#6b9ac4] hover:bg-[#5a86ae] text-white" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Siguiente paso
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 3: Ubicación de Compra */}
              {step === 3 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto animate-fade-in space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paso 3: Ubicación de Compra</span>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1 leading-snug">
                      ¿En qué región deseas buscar o comprar tu vivienda?
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Los límites de valor de propiedad y montos de subsidio varían según la región del país.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Región donde deseas comprar:</label>
                      <select
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]"
                        value={regionA}
                        onChange={(e) => setRegionA(e.target.value)}
                      >
                        {Object.keys(REGION_MAP).map((key) => (
                          <option key={key} value={key}>{REGION_MAP[key].label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button onClick={handlePrevStep} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                      ← Atrás
                    </button>
                    
                    <button 
                      onClick={handleNextStep} 
                      className="bg-[#6b9ac4] hover:bg-[#5a86ae] text-white font-bold text-xs py-2.5 px-5 rounded-lg transition-all"
                    >
                      Siguiente paso
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 4: Capacidad de Ahorro */}
              {step === 4 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto animate-fade-in space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paso 4: Ahorro Habitacional</span>
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1 leading-snug">
                      ¿Con cuánto ahorro cuentas en tu Libreta de Vivienda?
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      El MINVU exige montos mínimos de ahorro depositados para poder postular a los subsidios.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Monto de Ahorro ($ CLP):</label>
                        <input 
                          type="number" 
                          min="0"
                          placeholder="Ej: 3000000"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]"
                          value={savingsCLPA} 
                          onChange={(e) => handleSavingsCLPChange(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Monto de Ahorro (UF):</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          placeholder="Ej: 80"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]"
                          value={savingsUF} 
                          onChange={(e) => handleSavingsUFChange(e.target.value)} 
                        />
                      </div>
                    </div>

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

              {/* Paso 5: Resultados (Perfil A - Multi-Recomendación) */}
              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Panel de Controles Interactivos */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">Configuración Financiera del Reporte</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Ajusta los plazos del crédito para recalcular los presupuestos máximos.</p>
                      </div>
                      
                      {/* Controles rápidos */}
                      <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Plazo Crédito:</label>
                          <select
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                            value={loanTermA}
                            onChange={(e) => setLoanTermA(e.target.value)}
                          >
                            <option value="15">15 años</option>
                            <option value="20">20 años</option>
                            <option value="25">25 años</option>
                            <option value="30">30 años</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Banco Simulado:</label>
                          <select
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                            value={selectedBankA}
                            onChange={(e) => setSelectedBankA(e.target.value)}
                          >
                            {Object.keys(BANKS).map((key) => (
                              <option key={key} value={key}>{BANKS[key].name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end pb-2 sm:pb-3">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded text-[#6b9ac4]"
                              checked={isYoungSingleA}
                              onChange={(e) => setIsYoungSingleA(e.target.checked)}
                            />
                            ¿Menor de 35 años?
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Título de Recomendaciones */}
                  <div className="text-center pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6b9ac4] block mb-1">Resultados de Diagnóstico</span>
                    <h2 className="text-2xl font-extrabold text-slate-900">Tus Subsidios y Alternativas de Compra</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                      Hemos simulado tu perfil en {REGION_MAP[regionA].label} con una renta de ${(parseFloat(incomeCLPA) || 0).toLocaleString("es-CL")} CLP. A continuación, tus 3 opciones de financiamiento habitacional.
                    </p>
                  </div>

                  {/* Grilla de 3 Tarjetas de Recomendación */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {recommendationsA.map((card, idx) => {
                      const isSavingsShort = parseFloat(savingsUF) < card.minAhorro;
                      const missingUF = Math.max(0, card.minAhorro - (parseFloat(savingsUF) || 0));
                      const missingCLP = missingUF * ufValue;

                      return (
                        <article 
                          key={idx}
                          className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-[#6b9ac4] hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            {/* Insignia tramo */}
                            <span className="bg-blue-50 text-[#6b9ac4] text-[9px] font-bold py-1 px-2 rounded-full inline-block mb-3 border border-blue-100">
                              {card.badge}
                            </span>
                            
                            <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight">
                              {card.title}
                            </h3>
                            
                            <p className="text-xs text-slate-500 leading-relaxed mb-4 font-normal">
                              {card.description}
                            </p>

                            {card.hasFogaesOption ? (
                              <div className="space-y-4 my-4">
                                {/* ESCENARIO A: Vivienda Nueva */}
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 shadow-sm relative text-left">
                                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Vivienda Nueva
                                  </div>
                                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block mb-1">
                                    Con FOGAES {card.fogaesInfo.aplicaLey ? "+ Subsidio Dividendo" : ""}
                                  </span>
                                  
                                  <div className="text-center my-2.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Máximo de Compra</span>
                                    <strong className="text-2xl font-black text-slate-800 block">
                                      {card.fogaesInfo.maxHouseUF.toFixed(0)} UF
                                    </strong>
                                    <span className="text-xs font-bold text-emerald-600 block">
                                      ≈ ${Math.round(card.fogaesInfo.maxHouseUF * ufValue).toLocaleString("es-CL")}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-xs border-t border-blue-100/60 pt-2 mb-3">
                                    <div className="flex justify-between text-slate-500">
                                      <span>Ahorro (Pie 10%):</span>
                                      <span className="font-bold text-slate-700">{(parseFloat(savingsUF) || 0).toFixed(0)} UF</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Crédito Bancario:</span>
                                      <span className="font-bold text-blue-600">
                                        {card.fogaesInfo.loanUF > 0 ? `${card.fogaesInfo.loanUF.toFixed(0)} UF` : "No requiere"}
                                      </span>
                                    </div>
                                    {card.fogaesInfo.aplicaLey && (
                                      <div className="text-[10px] font-semibold text-emerald-600 mt-1">
                                        ✓ Subsidio al dividendo (Ley 21.748) aplicado automáticamente.
                                      </div>
                                    )}
                                  </div>

                                  {card.fogaesInfo.aviso && (
                                    <div className="bg-sky-50 border border-sky-200 text-sky-900 p-2.5 rounded-lg text-[10px] leading-relaxed mb-3">
                                      {card.fogaesInfo.aviso}
                                    </div>
                                  )}

                                  <Link 
                                    href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.fogaesInfo.maxHouseUF * ufValue)}&maxUF=${Math.round(card.fogaesInfo.maxHouseUF)}&credit=${Math.round(card.fogaesInfo.loanUF)}&origin=no-subsidy&region=${regionA}&applyFogaes=true&applyRateDiscount=${card.fogaesInfo.aplicaLey ? "true" : "false"}&isNew=true`}
                                    className="w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm block"
                                  >
                                    Buscar Proyectos Nuevos FOGAES →
                                  </Link>
                                </div>

                                {/* ESCENARIO B: Vivienda Usada */}
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-sm relative text-left">
                                  <div className="absolute top-2 right-2 bg-slate-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Vivienda Usada
                                  </div>
                                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                                    Sin FOGAES ni Subsidio Dividendo
                                  </span>
                                  
                                  <div className="text-center my-2.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Máximo de Compra</span>
                                    <strong className="text-xl font-black text-slate-800 block">
                                      {card.normalInfo.maxHouseUF.toFixed(0)} UF
                                    </strong>
                                    <span className="text-xs font-bold text-emerald-600 block">
                                      ≈ ${Math.round(card.normalInfo.maxHouseUF * ufValue).toLocaleString("es-CL")}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-xs border-t border-slate-200/60 pt-2 mb-3">
                                    <div className="flex justify-between text-slate-500">
                                      <span>Ahorro (Pie 20%):</span>
                                      <span className="font-bold text-slate-700">{(parseFloat(savingsUF) || 0).toFixed(0)} UF</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Crédito Bancario:</span>
                                      <span className="font-bold text-blue-600">
                                        {card.normalInfo.loanUF > 0 ? `${card.normalInfo.loanUF.toFixed(0)} UF` : "No requiere"}
                                      </span>
                                    </div>
                                  </div>

                                  {card.normalInfo.aviso && (
                                    <div className="bg-sky-50 border border-sky-200 text-sky-900 p-2.5 rounded-lg text-[10px] leading-relaxed mb-3">
                                      {card.normalInfo.aviso}
                                    </div>
                                  )}

                                  <Link 
                                    href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.normalInfo.maxHouseUF * ufValue)}&maxUF=${Math.round(card.normalInfo.maxHouseUF)}&credit=${Math.round(card.normalInfo.loanUF)}&origin=no-subsidy&region=${regionA}&applyFogaes=false&applyRateDiscount=false&isNew=false`}
                                    className="w-full text-center py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all shadow-sm block"
                                  >
                                    Buscar Ofertas Usadas →
                                  </Link>
                                </div>
                              </div>
                            ) : card.hasDS15Option ? (
                              <div className="space-y-4 my-4">
                                {/* ESCENARIO A: Con DS15 */}
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 shadow-sm relative text-left">
                                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Solo Vivienda Nueva
                                  </div>
                                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block mb-1">
                                    Opción Con Beneficio DS15
                                  </span>
                                  
                                  <div className="text-center my-2.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Máximo de Compra</span>
                                    <strong className="text-2xl font-black text-slate-800 block">
                                      {card.ds15Info.maxHouseUF.toFixed(0)} UF
                                    </strong>
                                    <span className="text-xs font-bold text-emerald-600 block">
                                      ≈ ${Math.round(card.ds15Info.maxHouseUF * ufValue).toLocaleString("es-CL")}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-xs border-t border-blue-100/60 pt-2 mb-3">
                                    <div className="flex justify-between text-slate-500">
                                      <span>{(parseFloat(savingsUF) || 0) < card.ds15Info.minAhorro ? "Ahorro Mínimo:" : "Ahorro:"}</span>
                                      <span className="font-bold text-slate-700">
                                        {Math.max(card.ds15Info.minAhorro, parseFloat(savingsUF) || 0)} UF
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Aporte Subsidio:</span>
                                      <span className="font-bold text-emerald-600">+{card.ds15Info.subsidyUF.toFixed(0)} UF</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Crédito Bancario:</span>
                                      <span className="font-bold text-blue-600">
                                        {card.ds15Info.loanUF > 0 ? `${card.ds15Info.loanUF.toFixed(0)} UF` : "No requiere"}
                                      </span>
                                    </div>
                                  </div>

                                  {parseFloat(savingsUF) < card.ds15Info.minAhorro && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-[10px] leading-relaxed mb-3">
                                      <strong>⚠️ Falta Ahorro:</strong> Necesitas mínimo {card.ds15Info.minAhorro} UF. Te faltan <strong>{(card.ds15Info.minAhorro - (parseFloat(savingsUF) || 0)).toFixed(0)} UF</strong> (aprox. <strong>${Math.round((card.ds15Info.minAhorro - (parseFloat(savingsUF) || 0)) * ufValue).toLocaleString("es-CL")}</strong>).
                                    </div>
                                  )}

                                  <Link 
                                    href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.ds15Info.maxHouseUF * ufValue)}&maxUF=${Math.round(card.ds15Info.maxHouseUF)}&credit=${Math.round(card.ds15Info.loanUF)}&origin=${card.subsidyKey}&region=${regionA}&cupoType=${card.cupoType || ""}&isNew=true`}
                                    className="w-full text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm block"
                                  >
                                    Buscar Proyectos Nuevos DS15 →
                                  </Link>
                                </div>

                                {/* ESCENARIO B: Sin DS15 */}
                                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-sm relative text-left">
                                  <div className="absolute top-2 right-2 bg-slate-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {card.subsidyKey === "ds19" ? "Solo Vivienda Nueva" : "Nueva o Usada"}
                                  </div>
                                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                                    Opción Sin Beneficio DS15
                                  </span>
                                  
                                  <div className="text-center my-2.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Valor Máximo de Compra</span>
                                    <strong className="text-xl font-black text-slate-800 block">
                                      {card.normalInfo.maxHouseUF.toFixed(0)} UF
                                    </strong>
                                    <span className="text-xs font-bold text-emerald-600 block">
                                      ≈ ${Math.round(card.normalInfo.maxHouseUF * ufValue).toLocaleString("es-CL")}
                                    </span>
                                  </div>

                                  <div className="space-y-1 text-xs border-t border-slate-200/60 pt-2 mb-3">
                                    <div className="flex justify-between text-slate-500">
                                      <span>{(parseFloat(savingsUF) || 0) < card.normalInfo.minAhorro ? "Ahorro Mínimo:" : "Ahorro:"}</span>
                                      <span className="font-bold text-slate-700">
                                        {Math.max(card.normalInfo.minAhorro, parseFloat(savingsUF) || 0)} UF
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Aporte Subsidio:</span>
                                      <span className="font-bold text-emerald-600">+{card.normalInfo.subsidyUF.toFixed(0)} UF</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Crédito Bancario:</span>
                                      <span className="font-bold text-blue-600">
                                        {card.normalInfo.loanUF > 0 ? `${card.normalInfo.loanUF.toFixed(0)} UF` : "No requiere"}
                                      </span>
                                    </div>
                                  </div>

                                  {parseFloat(savingsUF) < card.normalInfo.minAhorro && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-[10px] leading-relaxed mb-3">
                                      <strong>⚠️ Falta Ahorro:</strong> Necesitas mínimo {card.normalInfo.minAhorro} UF. Te faltan <strong>{(card.normalInfo.minAhorro - (parseFloat(savingsUF) || 0)).toFixed(0)} UF</strong> (aprox. <strong>${Math.round((card.normalInfo.minAhorro - (parseFloat(savingsUF) || 0)) * ufValue).toLocaleString("es-CL")}</strong>).
                                    </div>
                                  )}

                                  <Link 
                                    href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.normalInfo.maxHouseUF * ufValue)}&maxUF=${Math.round(card.normalInfo.maxHouseUF)}&credit=${Math.round(card.normalInfo.loanUF)}&origin=${card.subsidyKey}&region=${regionA}&cupoType=${card.cupoType || ""}`}
                                    className="w-full text-center py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all shadow-sm block"
                                  >
                                    Buscar Ofertas Generales →
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              /* RENDERIZADO NORMAL SIN DS15 (DS49, DS1 T1, DS1 T4, Sin Subsidio) */
                              <>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center mb-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Máximo de Casa</span>
                                  <strong className="text-2xl md:text-3xl font-black text-slate-800 block">
                                    {card.maxHouseUF.toFixed(0)} UF
                                  </strong>
                                  <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                                    ≈ ${Math.round(card.maxHouseUF * ufValue).toLocaleString("es-CL")}
                                  </span>
                                </div>

                                <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">{(parseFloat(savingsUF) || 0) < card.minAhorro ? "Ahorro Mínimo:" : "Ahorro:"}</span>
                                    <span className="font-bold text-slate-700">
                                      {Math.max(card.minAhorro, parseFloat(savingsUF) || 0)} UF
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Aporte Estatal Subsidio:</span>
                                    <span className="font-bold text-emerald-600">+{card.subsidyUF.toFixed(0)} UF</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Crédito Hipotecario:</span>
                                    <span className="font-bold text-blue-600">
                                      {card.loanUF > 0 ? `${card.loanUF.toFixed(0)} UF` : "No requiere"}
                                    </span>
                                  </div>
                                </div>

                                {isSavingsShort && (
                                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-[11px] leading-relaxed mb-4 text-left">
                                    <strong>⚠️ Ahorro Insuficiente:</strong> Te faltan <strong>{missingUF.toFixed(0)} UF</strong> (aprox. <strong>${Math.round(missingCLP).toLocaleString("es-CL")}</strong>) para cumplir con el mínimo de {card.minAhorro} UF requerido.
                                  </div>
                                )}

                                <Link 
                                  href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.maxHouseUF * ufValue)}&maxUF=${Math.round(card.maxHouseUF)}&credit=${Math.round(card.loanUF)}&origin=${card.subsidyKey}&region=${regionA}&cupoType=${card.cupoType || ""}`}
                                  className="w-full text-center py-2.5 px-4 bg-[#6b9ac4] hover:bg-[#5a86ae] text-white font-bold text-xs rounded-lg transition-all shadow-sm block animate-pulse hover:animate-none"
                                >
                                  Buscar Ofertas Inmobiliarias →
                                </Link>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={handleRestart}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium underline transition-colors"
                    >
                      Volver a empezar el asistente (Perfil A)
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 3. FLUJO PERFIL B: SIMULACIÓN RÁPIDA / AVANZADA */}
          {profile === "B" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
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
                <section className="space-y-6 animate-fade-in bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
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

                  {selectedSubsidyB === "ds1t4" && resultsB.originalSavingsUF < 200 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs leading-relaxed">
                      <strong>⚠️ Ahorro Insuficiente:</strong> Tu ahorro ingresado es de <strong>{resultsB.originalSavingsUF.toFixed(0)} UF</strong>, pero el subsidio DS1 Tramo 4 exige un ahorro mínimo de <strong>200 UF</strong>. Hemos calculado tu capacidad asumiendo que alcanzarás la meta de ahorro (te falta ahorrar <strong>{(200 - resultsB.originalSavingsUF).toFixed(0)} UF</strong>, aprox. <strong>${Math.round((200 - resultsB.originalSavingsUF) * ufValue).toLocaleString("es-CL")} CLP</strong>).
                    </div>
                  )}

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
                        <span className="font-bold text-slate-500 uppercase">Dividendo Mensual Estimado:</span>
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

// src/app/asistente-subsidios/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUFValue } from "@/utils/api";
import { BANKS } from "@/data/banks";
import { REGION_MAP } from "@/data/regions";

const DS19_COMMUNES_PERIPHERAL: Record<string, { key: string; label: string; isPeripheral: boolean }[]> = {
  "arica-y-parinacota": [
    { key: "arica", label: "Arica", isPeripheral: false }
  ],
  "tarapaca": [
    { key: "iquique", label: "Iquique (Zona Urbana)", isPeripheral: false },
    { key: "alto-hospicio", label: "Alto Hospicio (Otras Comunas)", isPeripheral: true }
  ],
  "antofagasta": [
    { key: "antofagasta", label: "Antofagasta (Zona Urbana)", isPeripheral: false },
    { key: "calama", label: "Calama (Zona Urbana)", isPeripheral: false }
  ],
  "atacama": [
    { key: "copiapo", label: "Copiapó (Zona Urbana)", isPeripheral: false }
  ],
  "coquimbo": [
    { key: "la-serena", label: "La Serena (Otras Comunas)", isPeripheral: true },
    { key: "coquimbo", label: "Coquimbo (Zona Urbana)", isPeripheral: false },
    { key: "ovalle", label: "Ovalle (Otras Comunas)", isPeripheral: true }
  ],
  "valparaiso": [
    { key: "valparaiso", label: "Valparaíso (Zona Urbana)", isPeripheral: false },
    { key: "vina-del-mar", label: "Viña del Mar (Zona Urbana)", isPeripheral: false },
    { key: "quilpue", label: "Quilpué (Otras Comunas)", isPeripheral: true },
    { key: "quillota", label: "Quillota (Otras Comunas)", isPeripheral: true },
    { key: "casablanca", label: "Casablanca (Otras Comunas)", isPeripheral: true },
    { key: "villa-alemana", label: "Villa Alemana (Otras Comunas)", isPeripheral: true },
    { key: "san-felipe", label: "San Felipe (Otras Comunas)", isPeripheral: true },
    { key: "limache", label: "Limache (Otras Comunas)", isPeripheral: true },
    { key: "la-ligua", label: "La Ligua (Otras Comunas)", isPeripheral: true },
    { key: "los-andes", label: "Los Andes (Otras Comunas)", isPeripheral: true },
    { key: "cartagena", label: "Cartagena (Otras Comunas)", isPeripheral: true },
    { key: "el-tabo", label: "El Tabo (Otras Comunas)", isPeripheral: true }
  ],
  "metropolitana": [
    { key: "santiago", label: "Gran Santiago (Provincia Urbana)", isPeripheral: false },
    { key: "melipilla", label: "Melipilla (Otras Comunas)", isPeripheral: true },
    { key: "padre-hurtado", label: "Padre Hurtado (Otras Comunas)", isPeripheral: true },
    { key: "el-monte", label: "El Monte (Otras Comunas)", isPeripheral: true },
    { key: "lampa", label: "Lampa (Otras Comunas)", isPeripheral: true },
    { key: "colina", label: "Colina (Otras Comunas)", isPeripheral: true },
    { key: "batuco", label: "Batuco (Otras Comunas)", isPeripheral: true }
  ],
  "biobio": [
    { key: "concepcion", label: "Concepción (Zona Urbana)", isPeripheral: false },
    { key: "los-angeles", label: "Los Ángeles (Zona Urbana)", isPeripheral: false },
    { key: "penco", label: "Penco (Otras Comunas)", isPeripheral: true },
    { key: "san-pedro-de-la-paz", label: "San Pedro de la Paz (Otras Comunas)", isPeripheral: true },
    { key: "chiguayante", label: "Chiguayante (Otras Comunas)", isPeripheral: true },
    { key: "curanilahue", label: "Curanilahue (Otras Comunas)", isPeripheral: true },
    { key: "talcahuano", label: "Talcahuano (Otras Comunas)", isPeripheral: true }
  ],
  "los-lagos": [
    { key: "castro", label: "Chiloé - Castro (Zona Urbana)", isPeripheral: false }
  ]
};

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
  const [rshTramo, setRshTramo] = useState<"40" | "60" | "80" | "90" | "100" | "">("");
  
  // Mini-calculadora RSH
  const [rshMembers, setRshMembers] = useState<string>("3");
  const [rshIncome, setRshIncome] = useState<string>("");
  const [calculatedRsh, setCalculatedRsh] = useState<"40" | "60" | "80" | "90" | "100" | "">("");

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
  const [savingsCLPB, setSavingsCLPB] = useState<string>("");
  const [propertyTypeB, setPropertyTypeB] = useState<"casa" | "depto" | "ambos">("ambos");
  const [isUrbanB, setIsUrbanB] = useState<boolean>(true);
  const [selectedSubsidyB, setSelectedSubsidyB] = useState<string>("none");
  const [loanTermB, setLoanTermB] = useState<string>("25");
  const [isYoungSingleB, setIsYoungSingleB] = useState<boolean>(false);
  const [selectedBankB, setSelectedBankB] = useState<string>("");
  const [locationB, setLocationB] = useState<string>("metropolitana");
  const [selectedCommuneB, setSelectedCommuneB] = useState<string>("");
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

  // Sincronizar integrantes de RSH si postula solo
  useEffect(() => {
    if (familyType === "solo") {
      setRshMembers("1");
    } else if (familyType === "familia" && rshMembers === "1") {
      setRshMembers("3");
    }
  }, [familyType]);

  // Sincronizar comuna al cambiar de región en Perfil B
  useEffect(() => {
    const list = DS19_COMMUNES_PERIPHERAL[locationB];
    if (list && list.length > 0) {
      setSelectedCommuneB(list[0].key);
    } else {
      setSelectedCommuneB("");
    }
  }, [locationB]);

  useEffect(() => {
    setRshTramo(calculatedRsh);
  }, [calculatedRsh]);

  // Calcular la estimación del RSH de forma dinámica en Perfil A
  useEffect(() => {
    const incomeVal = parseFloat(rshIncome);
    const membersVal = parseInt(rshMembers);
    if (!isNaN(incomeVal) && !isNaN(membersVal) && membersVal > 0) {
      const perCapita = incomeVal / membersVal;
      if (perCapita < 246960) {
        setCalculatedRsh("40");
      } else if (perCapita < 398493) {
        setCalculatedRsh("60");
      } else if (perCapita < 699720) {
        setCalculatedRsh("80");
      } else if (perCapita < 1151624) {
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
    setSavingsCLPB("");
    setPropertyTypeB("ambos");
    setIsUrbanB(true);
    setSelectedSubsidyB("none");
    setLoanTermB("25");
    setIsYoungSingleB(false);
    setSelectedBankB("");
    setLocationB("metropolitana");
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

  const handleSavingsUFBChange = (val: string) => {
    setSavingsUFB(val);
    const uf = parseFloat(val);
    if (!isNaN(uf) && ufValue > 0) {
      setSavingsCLPB((uf * ufValue).toFixed(0));
    } else {
      setSavingsCLPB("");
    }
  };

  const handleSavingsCLPBChange = (val: string) => {
    setSavingsCLPB(val);
    const clp = parseFloat(val);
    if (!isNaN(clp) && ufValue > 0) {
      setSavingsUFB((clp / ufValue).toFixed(2));
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

    // --- PARÁMETROS GEOGRÁFICOS DS19 ---
    const capVul = ds19Zone === "sur_islas" ? 2000 : 1550;
    const subVul = ds19Zone === "sur_islas" ? 1700 : (ds19Zone === "urbana_norte_stgo" ? 1250 : 1150);

    const capRural = ds19Zone === "sur_islas" ? 2400 : (ds19Zone === "urbana_norte_stgo" ? 1900 : 1800);
    const subRural = (ds19Zone === "sur_islas" ? 537.5 : (ds19Zone === "urbana_norte_stgo" ? 487.5 : 425)) + 100;

    const capUrban = ds19Zone === "sur_islas" ? 3000 : (ds19Zone === "urbana_norte_stgo" ? 2800 : 2600);
    const subUrban = (ds19Zone === "sur_islas" ? 500 : 350) + 100;

    // --- OPCIÓN FALLBACK: SIN SUBSIDIO ---
    const maxHouseFogaesWithDiscount = Math.min(4000, Math.min(savings / 0.10, maxLoanUFDS15 + savings));
    const maxHouseFogaesNormal = Math.min(4500, Math.min(savings / 0.10, maxLoanUFNormal + savings));
    const maxHouseFogaes = Math.max(maxHouseFogaesWithDiscount, maxHouseFogaesNormal);
    const loanFogaes = Math.max(0, maxHouseFogaes - savings);
    const aplicaLeyFogaes = maxHouseFogaes < 4000;
    
    const maxLoanFogaesLimit = aplicaLeyFogaes ? maxLoanUFDS15 : maxLoanUFNormal;
    const maxHouseFogaesByIncome = maxLoanFogaesLimit / 0.9;
    let avisoFogaes = "";
    if (maxHouseFogaes < Math.min(4500, maxHouseFogaesByIncome)) {
      const targetUF = Math.min(4500, maxHouseFogaesByIncome);
      const neededSavings = targetUF * 0.10;
      avisoFogaes = `💡 Con un pie minimo de ${neededSavings.toFixed(0)} UF (aprox. $${Math.round(neededSavings * ufValue).toLocaleString("es-CL")} CLP), podrías aprovechar al máximo tu sueldo y comprar una propiedad nueva de hasta ${targetUF.toFixed(0)} UF.`;
    }

    const maxHouseUsada = Math.min(savings / 0.20, maxLoanUFNormal + savings);
    const loanUsada = Math.max(0, maxHouseUsada - savings);
    const maxHouseUsadaByIncome = maxLoanUFNormal / 0.8;
    let avisoUsada = "";
    if (maxHouseUsada < maxHouseUsadaByIncome) {
      const targetUF = maxHouseUsadaByIncome;
      const neededSavings = targetUF * 0.20;
      avisoUsada = `💡 Con un pie minimo de ${neededSavings.toFixed(0)} UF (aprox. $${Math.round(neededSavings * ufValue).toLocaleString("es-CL")} CLP), podrías aprovechar al máximo tu sueldo y comprar una propiedad usada de hasta ${targetUF.toFixed(0)} UF.`;
    }

    const cardSinSubsidio = {
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
        aplicaLey: false,
        aviso: avisoUsada
      }
    };

    // --- LÓGICA DE RECOMMENDACIONES POR TRAMOS ---

    // 1. RHS < 40% (tramo "40")
    if (rshTramo === "40") {
      // DS49 (Usadas)
      const extraAhorro = savings - 10;
      const incentive = savings >= 60 ? 250 : (extraAhorro > 0 ? 5 * extraAhorro : 0);
      const subsidyDS49 = 800 + 100 + incentive; // Asumimos urbano por defecto en Perfil A
      const maxHouseDS49 = Math.min(savings + subsidyDS49, 1300);
      cards.push({
        id: "ds49",
        subsidyKey: "ds49",
        badge: "Vivienda Nueva o Usada - Postulación MINVU",
        title: "Subsidio DS49 (Fondo Solidario)",
        description: "Postulación para comprar casa sin crédito hipotecario. Orientado a familias del 40% RSH.",
        maxHouseUF: maxHouseDS49,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF: subsidyDS49,
        minAhorro: 10,
        hasDS15Option: false
      });

      // DS19 Homologado en DS49 para nuevas
      const maxHouseDS19 = Math.min(savings + subVul, capVul);
      cards.push({
        id: "ds19-vulnerable",
        subsidyKey: "ds19",
        cupoType: "vulnerable",
        badge: "Solo Vivienda Nueva - Convenio Inmobiliaria",
        title: "Subsidio DS19 (Cupo Vulnerable - Homologado)",
        description: "Permite comprar sin crédito hipotecario una vivienda nueva en proyectos con convenio DS19.",
        maxHouseUF: maxHouseDS19,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF: subVul,
        minAhorro: 40,
        hasDS15Option: false
      });

      // Sin Subsidio
      cards.push(cardSinSubsidio);
    }

    // 2. RHS 40 - 60% (tramo "60")
    else if (rshTramo === "60") {
      // DS1 T1 (Usados)
      const capT1 = ds1Zone === "north" ? 1200 : (ds1Zone === "south" ? 1250 : 1100);
      const subT1 = ds1Zone === "north" ? 700 : (ds1Zone === "south" ? 750 : 600);
      const maxHouseT1 = Math.min(maxLoanUFNormal + savings + subT1, capT1);
      const loanT1 = Math.max(0, maxHouseT1 - savings - subT1);
      cards.push({
        id: "ds1t1",
        subsidyKey: "ds1t1",
        badge: "Vivienda Nueva/Usada o Construcción - MINVU",
        title: "Subsidio DS1 Tramo 1",
        description: "Para familias hasta el 60% RSH. Requiere un crédito bancario pequeño o pago al contado.",
        maxHouseUF: maxHouseT1,
        loanUF: loanT1,
        savingsUF: savings,
        subsidyUF: subT1,
        minAhorro: 30,
        hasDS15Option: false
      });

      // DS19 Homologado en DS1 T1 para nuevos
      const maxHouseRural = Math.min(maxLoanUFDS15 + savings + subRural, capRural);
      const loanRural = Math.max(0, maxHouseRural - savings - subRural);

      const maxHouseVul = Math.min(savings + subVul, capVul);

      cards.push({
        id: "ds19-homologado-t1",
        subsidyKey: "ds19",
        badge: "Solo Vivienda Nueva - Convenio Inmobiliaria",
        title: "Homologación a DS19 (Tramo 1)",
        description: "Opciones para aplicar tu subsidio Tramo 1 en proyectos DS19 homologados.",
        hasDS15Option: true,
        normalInfo: {
          maxHouseUF: maxHouseVul,
          loanUF: 0,
          subsidyUF: subVul,
          minAhorro: 40,
          label: "Cupo Vulnerable (Sin Deuda)",
          cupoType: "vulnerable"
        },
        ds15Info: {
          maxHouseUF: maxHouseRural,
          loanUF: loanRural,
          subsidyUF: subRural,
          minAhorro: 80,
          label: "Cupo Rural / Medios 1 (Con Crédito)",
          cupoType: "vulnerable_rural"
        }
      });

      // Sin Subsidio
      cards.push(cardSinSubsidio);
    }

    // 3. RHS 70 - 80% (tramo "80")
    else if (rshTramo === "80") {
      // DS1 T2 (Con y sin DS15)
      const resNormal = calculateDS1T2Max(maxLoanUFNormal, savings, ds1Zone);
      const loanNormal = Math.max(0, resNormal.maxHouseUF - savings - resNormal.subsidyUF);

      const resDS15 = calculateDS1T2MaxWithDS15(maxLoanUFDS15, savings, ds1Zone);
      const loanDS15 = Math.max(0, resDS15.maxHouseUF - savings - resDS15.subsidyUF);

      cards.push({
        id: "ds1t2",
        subsidyKey: "ds1t2",
        badge: "Vivienda Nueva/Usada o Construcción - MINVU",
        title: "Subsidio DS1 Tramo 2",
        description: "Subsidio variable para tramos medios del RSH. Complementa con crédito bancario.",
        hasDS15Option: true,
        normalInfo: {
          maxHouseUF: resNormal.maxHouseUF,
          loanUF: loanNormal,
          subsidyUF: resNormal.subsidyUF,
          minAhorro: 40,
          label: "Opción Sin Beneficio DS15 (Usada/Nueva)"
        },
        ds15Info: {
          maxHouseUF: resDS15.maxHouseUF,
          loanUF: loanDS15,
          subsidyUF: resDS15.subsidyUF,
          minAhorro: 80,
          label: "Opción Con Beneficio DS15 (Solo Nueva)"
        }
      });

      // DS19 (Homologado en DS1 T2)
      const maxHouseDS19Urban = Math.min(maxLoanUFDS15 + savings + subUrban, capUrban);
      const loanDS19Urban = Math.max(0, maxHouseDS19Urban - savings - subUrban);

      const maxHouseDS19Rural = Math.min(maxLoanUFDS15 + savings + subRural, capRural);
      const loanDS19Rural = Math.max(0, maxHouseDS19Rural - savings - subRural);

      cards.push({
        id: "ds19-homologado-t2",
        subsidyKey: "ds19",
        badge: "Solo Vivienda Nueva - Convenio Inmobiliaria",
        title: "Homologación a DS19 (Tramo 2)",
        description: "Aplica tu subsidio DS1 Tramo 2 de forma automática en proyectos integrados con convenio.",
        hasDS15Option: true,
        normalInfo: {
          maxHouseUF: maxHouseDS19Urban,
          loanUF: loanDS19Urban,
          subsidyUF: subUrban,
          minAhorro: 80,
          label: "Cupo Urbano / Medios 2 (Urbano)",
          cupoType: "urban_media"
        },
        ds15Info: {
          maxHouseUF: maxHouseDS19Rural,
          loanUF: loanDS19Rural,
          subsidyUF: subRural,
          minAhorro: 80,
          label: "Cupo Rural / Medios 1 (Rural)",
          cupoType: "vulnerable_rural"
        }
      });

      // DS19 (Postulacion directa en Sector Vulnerable/Rural)
      const maxHouseVul = Math.min(savings + subVul, capVul);

      cards.push({
        id: "ds19-directo-vul-rural",
        subsidyKey: "ds19",
        badge: "Solo Vivienda Nueva - Convenio Inmobiliaria",
        title: "DS19 Directo (Vulnerable / Rural)",
        description: "Postulación directa al proyecto inmobiliario sin requerir subsidio MINVU adjudicado previamente.",
        hasDS15Option: true,
        normalInfo: {
          maxHouseUF: maxHouseVul,
          loanUF: 0,
          subsidyUF: subVul,
          minAhorro: 40,
          label: "Cupo Vulnerable (Sin Deuda)",
          cupoType: "vulnerable"
        },
        ds15Info: {
          maxHouseUF: maxHouseDS19Rural,
          loanUF: loanDS19Rural,
          subsidyUF: subRural,
          minAhorro: 80,
          label: "Cupo Rural / Medios 1 (Con Deuda)",
          cupoType: "vulnerable_rural"
        }
      });

      // Sin Subsidio
      cards.push(cardSinSubsidio);
    }

    // 4. RHS 90% (tramo "90")
    else if (rshTramo === "90") {
      // DS1 T3 (Con y sin DS15)
      const resNormal = calculateDS1T3Max(maxLoanUFNormal, savings, ds1Zone);
      const loanNormal = Math.max(0, resNormal.maxHouseUF - savings - resNormal.subsidyUF);

      const resDS15 = calculateDS1T3MaxWithDS15(maxLoanUFDS15, savings, ds1Zone);
      const loanDS15 = Math.max(0, resDS15.maxHouseUF - savings - resDS15.subsidyUF);

      cards.push({
        id: "ds1t3",
        subsidyKey: "ds1t3",
        badge: "Vivienda Nueva/Usada o Construcción - MINVU",
        title: "Subsidio DS1 Tramo 3",
        description: "Tope de compra ampliado con crédito hipotecario bancario obligatorio.",
        hasDS15Option: true,
        normalInfo: {
          maxHouseUF: resNormal.maxHouseUF,
          loanUF: loanNormal,
          subsidyUF: resNormal.subsidyUF,
          minAhorro: 80,
          label: "Opción Sin Beneficio DS15 (Usada/Nueva)"
        },
        ds15Info: {
          maxHouseUF: resDS15.maxHouseUF,
          loanUF: loanDS15,
          subsidyUF: resDS15.subsidyUF,
          minAhorro: 160,
          label: "Opción Con Beneficio DS15 (Solo Nueva)"
        }
      });

      // DS19 (Homologado en DS1 T3)
      const maxHouseDS19Urban = Math.min(maxLoanUFDS15 + savings + subUrban, capUrban);
      const loanDS19Urban = Math.max(0, maxHouseDS19Urban - savings - subUrban);

      cards.push({
        id: "ds19-homologado-t3",
        subsidyKey: "ds19",
        cupoType: "urban_media",
        badge: "Solo Vivienda Nueva - Convenio Inmobiliaria",
        title: "Homologación a DS19 (Tramo 3)",
        description: "Homologa tu subsidio Tramo 3 en proyectos urbanos con convenio DS15 preferencial.",
        maxHouseUF: maxHouseDS19Urban,
        loanUF: loanDS19Urban,
        savingsUF: savings,
        subsidyUF: subUrban,
        minAhorro: 80,
        hasDS15Option: false
      });

      // DS19 (Postulación Directa en sector urbano/medio)
      cards.push({
        id: "ds19-directo-urban",
        subsidyKey: "ds19",
        cupoType: "urban_media",
        badge: "Solo Vivienda Nueva - Convenio Inmobiliaria",
        title: "DS19 Directo (Sectores Medios)",
        description: "Postula directamente a un proyecto DS19 urbano de integración social.",
        maxHouseUF: maxHouseDS19Urban,
        loanUF: loanDS19Urban,
        savingsUF: savings,
        subsidyUF: subUrban,
        minAhorro: 80,
        hasDS15Option: false
      });

      // Sin Subsidio
      cards.push(cardSinSubsidio);
    }

    // 5. RHS > 90% dentro del límite de DS1 T4
    else if (rshTramo === "100" && meetsDS1T4Limit) {
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
        description: "Diseñado para viviendas de hasta 4.000 UF. Apoyo estatal directo de 400 UF.",
        maxHouseUF: valMax,
        loanUF: creditReal,
        savingsUF: effectiveSavings,
        subsidyUF: sub,
        minAhorro,
        hasDS15Option: false
      });

      cards.push(cardSinSubsidio);
    }

    // 6. RHS > 90% supera límite de DS1 T4
    else {
      cards.push(cardSinSubsidio);
    }

    return cards;
  };

  const recommendationsA = getDynamicRecommendationsA();

  // --- CÁLCULO DE PERFIL B (SIMULACIÓN AVANZADA) ---
  const handleCalculateB = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(incomeCLPB) || 0;
    const savings = parseFloat(savingsUFB) || 0;
    const term = parseInt(loanTermB) || 25;

    if (selectedSubsidyB !== "ds49" && (!selectedBankB || !BANKS[selectedBankB])) {
      alert("Por favor, selecciona una institución financiera para la tasa de interés.");
      return;
    }

    const bankKey = selectedBankB || "BancoEstado";
    const bankData = BANKS[bankKey] || BANKS["BancoEstado"];
    const incomeMultiplier = isYoungSingleB ? 3 : 4;
    const maxMonthlyPaymentUF = (income / ufValue) / incomeMultiplier;

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

    const ds1ZoneB = getDS1Zone(locationB);
    
    const activeCommunes = DS19_COMMUNES_PERIPHERAL[locationB] || [];
    const currentCommune = activeCommunes.find(c => c.key === selectedCommuneB);
    const isPeripheral = currentCommune ? currentCommune.isPeripheral : false;

    const getDS19LocationZoneB = (reg: string, isVar: boolean, isPerip: boolean) => {
      if (["aysen", "magallanes"].includes(reg)) {
        return "sur_islas";
      }
      if (isPerip) {
        return "regular";
      }
      const urbanRegions = isVar 
        ? ["arica-y-parinacota", "tarapaca", "antofagasta", "atacama", "metropolitana", "valparaiso", "biobio"]
        : ["arica-y-parinacota", "tarapaca", "antofagasta", "atacama", "metropolitana"];
      if (urbanRegions.includes(reg)) {
        return "urbana_norte_stgo";
      }
      return "regular";
    };

    const options: any[] = [];

    if (selectedSubsidyB === "none") {
      // Opción A: Vivienda Nueva (Con FOGAES + Subsidio Dividendo)
      const maxHouseFogaesWithDiscount = Math.min(4000, Math.min(savings / 0.10, maxLoanUFDS15 + savings));
      const maxHouseFogaesNormal = Math.min(4500, Math.min(savings / 0.10, maxLoanUFNormal + savings));
      const maxHouseFogaes = Math.max(maxHouseFogaesWithDiscount, maxHouseFogaesNormal);
      const loanFogaes = Math.max(0, maxHouseFogaes - savings);
      const aplicaLeyFogaes = maxHouseFogaes < 4000;
      const rateFogaes = aplicaLeyFogaes ? monthlyRateDS15 : monthlyRateNormal;
      const maxDividendFogaes = loanFogaes > 0 ? (loanFogaes * rateFogaes) / (1 - Math.pow(1 + rateFogaes, -totalPayments)) : 0;
      
      const maxLoanFogaesLimit = aplicaLeyFogaes ? maxLoanUFDS15 : maxLoanUFNormal;
      const maxHouseFogaesByIncome = maxLoanFogaesLimit / 0.9;
      let warningFogaes = "";
      if (maxHouseFogaes < Math.min(4500, maxHouseFogaesByIncome)) {
        const targetUF = Math.min(4500, maxHouseFogaesByIncome);
        const neededSavings = targetUF * 0.10;
        warningFogaes = `💡 Con un pie minimo de ${neededSavings.toFixed(0)} UF (aprox. $${Math.round(neededSavings * ufValue).toLocaleString("es-CL")} CLP), podrías aprovechar al máximo tu sueldo y comprar una propiedad nueva de hasta ${targetUF.toFixed(0)} UF.`;
      }

      options.push({
        id: "fogaes-nueva",
        badge: "Vivienda Nueva - Crédito Hipotecario",
        title: `Vivienda Nueva (Con FOGAES${aplicaLeyFogaes ? " + Subsidio Dividendo" : ""})`,
        description: "Financiamiento hasta 90% con aval del Estado (FOGAES). Permite pie mínimo del 10%.",
        maxHouseUF: maxHouseFogaes,
        loanUF: loanFogaes,
        savingsUF: savings,
        subsidyUF: 0,
        minAhorro: 0,
        maxDividendUF: maxDividendFogaes,
        warning: warningFogaes,
        linkParams: `maxPrice=${Math.round(maxHouseFogaes * ufValue)}&maxUF=${Math.round(maxHouseFogaes)}&credit=${Math.round(loanFogaes)}&origin=no-subsidy&region=${locationB}&applyFogaes=true&applyRateDiscount=${aplicaLeyFogaes ? "true" : "false"}&isNew=true`
      });

      // Opción B: Vivienda Usada (Sin FOGAES ni Subsidio)
      const maxHouseUsada = Math.min(savings / 0.20, maxLoanUFNormal + savings);
      const loanUsada = Math.max(0, maxHouseUsada - savings);
      const maxDividendUsada = loanUsada > 0 ? (loanUsada * monthlyRateNormal) / (1 - Math.pow(1 + monthlyRateNormal, -totalPayments)) : 0;
      
      const maxHouseUsadaByIncome = maxLoanUFNormal / 0.8;
      let warningUsada = "";
      if (maxHouseUsada < maxHouseUsadaByIncome) {
        const targetUF = maxHouseUsadaByIncome;
        const neededSavings = targetUF * 0.20;
        warningUsada = `💡 Con un pie minimo de ${neededSavings.toFixed(0)} UF (aprox. $${Math.round(neededSavings * ufValue).toLocaleString("es-CL")} CLP), podrías aprovechar al máximo tu sueldo y comprar una propiedad usada de hasta ${targetUF.toFixed(0)} UF.`;
      }

      options.push({
        id: "tradicional-usada",
        badge: "Vivienda Usada - Crédito Hipotecario",
        title: "Vivienda Usada (Crédito Tradicional)",
        description: "Financiamiento convencional hasta el 80%. Requiere pie del 20%.",
        maxHouseUF: maxHouseUsada,
        loanUF: loanUsada,
        savingsUF: savings,
        subsidyUF: 0,
        minAhorro: 0,
        maxDividendUF: maxDividendUsada,
        warning: warningUsada,
        linkParams: `maxPrice=${Math.round(maxHouseUsada * ufValue)}&maxUF=${Math.round(maxHouseUsada)}&credit=${Math.round(loanUsada)}&origin=no-subsidy&region=${locationB}&applyFogaes=false&applyRateDiscount=false&isNew=false`
      });
    }

    else if (selectedSubsidyB === "ds49") {
      // Opción 1: Subsidio DS49
      let extraAhorro = savings - 10;
      let incentive = 0;
      if (savings >= 60) {
        incentive = 250;
      } else if (extraAhorro > 0) {
        incentive = 5 * extraAhorro;
      }
      const subsidyUF = 800 + (isUrbanB ? 100 : 0) + incentive;
      const maxHouseUF = Math.min(savings + subsidyUF, 1300);
      let warningDS49 = "";
      if (savings < 10) {
        warningDS49 = `⚠️ Falta Ahorro: El subsidio DS49 exige un ahorro mínimo de 10 UF. Te faltan ${(10 - savings).toFixed(1)} UF (aprox. $${Math.round((10 - savings) * ufValue).toLocaleString("es-CL")} CLP).`;
      }
      options.push({
        id: "ds49-propio",
        badge: "Vivienda Nueva o Usada - Postulación MINVU",
        title: "Subsidio DS49 (Fondo Solidario)",
        description: "Adquisición de vivienda sin crédito hipotecario. Financiado por subsidio y tu ahorro.",
        maxHouseUF,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF,
        minAhorro: 10,
        maxDividendUF: 0,
        warning: warningDS49,
        linkParams: `maxPrice=${Math.round(maxHouseUF * ufValue)}&maxUF=${Math.round(maxHouseUF)}&credit=0&origin=ds49&region=${locationB}&isUrban=${isUrbanB}`
      });

      // Opción 2: Homologación a DS19 Cupo Vulnerable
      const zoneVul = getDS19LocationZoneB(locationB, false, isPeripheral);
      let subDS19 = 0;
      let capDS19 = 0;
      if (zoneVul === "sur_islas") {
        capDS19 = 2000;
        subDS19 = 1700;
      } else if (zoneVul === "urbana_norte_stgo") {
        capDS19 = propertyTypeB === "casa" ? 1500 : 1600;
        subDS19 = propertyTypeB === "casa" ? 1200 : 1300;
      } else {
        capDS19 = propertyTypeB === "casa" ? 1600 : 1500;
        subDS19 = propertyTypeB === "casa" ? 1100 : 1200;
      }
      
      const maxHouseDS19 = Math.min(savings + subDS19, capDS19);
      let warningDS19 = "";
      if (savings < 40) {
        warningDS19 = `⚠️ Falta Ahorro: Para homologar a DS19 Cupo Vulnerable necesitas mínimo 40 UF. Te faltan ${(40 - savings).toFixed(0)} UF (aprox. $${Math.round((40 - savings) * ufValue).toLocaleString("es-CL")} CLP).`;
      }
      options.push({
        id: "ds49-homologado",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "Homologación a DS19 (Cupo Vulnerable)",
        description: "Permite comprar sin crédito hipotecario una vivienda nueva en proyectos con convenio DS19.",
        maxHouseUF: maxHouseDS19,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF: subDS19,
        minAhorro: 40,
        maxDividendUF: 0,
        warning: warningDS19,
        linkParams: `maxPrice=${Math.round(maxHouseDS19 * ufValue)}&maxUF=${Math.round(maxHouseDS19)}&credit=0&origin=ds19&region=${locationB}&cupoType=vulnerable&propertyType=${propertyTypeB}`
      });
    }

    else if (selectedSubsidyB === "ds1t1") {
      // Opción 1: DS1 Tramo 1 Normal
      const cap = ds1ZoneB === "north" ? 1200 : (ds1ZoneB === "south" ? 1250 : 1100);
      const sub = ds1ZoneB === "north" ? 700 : (ds1ZoneB === "south" ? 750 : 600);
      const maxHouseUF = Math.min(maxLoanUFNormal + savings + sub, cap);
      const loanUF = Math.max(0, maxHouseUF - savings - sub);
      const maxDividend = loanUF > 0 ? (loanUF * monthlyRateNormal) / (1 - Math.pow(1 + monthlyRateNormal, -totalPayments)) : 0;
      let warningT1 = "";
      if (savings < 30) {
        warningT1 = `⚠️ Falta Ahorro: Se exige mínimo 30 UF para el DS1 Tramo 1. Te faltan ${(30 - savings).toFixed(0)} UF (aprox. $${Math.round((30 - savings) * ufValue).toLocaleString("es-CL")} CLP).`;
      }
      options.push({
        id: "ds1t1-propio",
        badge: "Vivienda Nueva/Usada o Construcción - MINVU",
        title: "Subsidio DS1 Tramo 1",
        description: "Requiere un crédito bancario pequeño o pago al contado de la diferencia. Tope de propiedad de hasta 1.100 UF (o hasta 1.250 UF en zonas extremas).",
        maxHouseUF,
        loanUF,
        savingsUF: savings,
        subsidyUF: sub,
        minAhorro: 30,
        maxDividendUF: maxDividend,
        warning: warningT1,
        linkParams: `maxPrice=${Math.round(maxHouseUF * ufValue)}&maxUF=${Math.round(maxHouseUF)}&credit=${Math.round(loanUF)}&origin=ds1t1&region=${locationB}&propertyType=${propertyTypeB}`
      });

      // Opción 2: Homologación a DS19 Cupo Vulnerable
      const zoneVul = getDS19LocationZoneB(locationB, false, isPeripheral);
      let subDS19Vul = 0;
      let capDS19Vul = 0;
      if (zoneVul === "sur_islas") {
        capDS19Vul = 2000;
        subDS19Vul = 1700;
      } else if (zoneVul === "urbana_norte_stgo") {
        capDS19Vul = propertyTypeB === "casa" ? 1500 : 1600;
        subDS19Vul = propertyTypeB === "casa" ? 1200 : 1300;
      } else {
        capDS19Vul = propertyTypeB === "casa" ? 1600 : 1500;
        subDS19Vul = propertyTypeB === "casa" ? 1100 : 1200;
      }
      const maxHouseVul = Math.min(savings + subDS19Vul, capDS19Vul);
      let warningVul = "";
      if (savings < 40) {
        warningVul = `⚠️ Falta Ahorro: Para homologar a DS19 Cupo Vulnerable necesitas mínimo 40 UF. Te faltan ${(40 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t1-homologado-vulnerable",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "Homologación a DS19 (Cupo Vulnerable)",
        description: "Permite comprar sin crédito hipotecario una vivienda nueva en proyectos con convenio DS19.",
        maxHouseUF: maxHouseVul,
        loanUF: 0,
        savingsUF: savings,
        subsidyUF: subDS19Vul,
        minAhorro: 40,
        maxDividendUF: 0,
        warning: warningVul,
        linkParams: `maxPrice=${Math.round(maxHouseVul * ufValue)}&maxUF=${Math.round(maxHouseVul)}&credit=0&origin=ds19&region=${locationB}&cupoType=vulnerable&propertyType=${propertyTypeB}`
      });

      // Opción 3: Homologación a DS19 Cupo Sectores Medios 1 (Rural)
      const zoneRural = getDS19LocationZoneB(locationB, false, isPeripheral);
      let subDS19Rural = 0;
      let capDS19Rural = 0;
      if (zoneRural === "sur_islas") {
        capDS19Rural = 2400;
        subDS19Rural = 537.5 + 100;
      } else if (zoneRural === "urbana_norte_stgo") {
        capDS19Rural = 1900;
        subDS19Rural = 487.5 + 100;
      } else {
        capDS19Rural = 1800;
        subDS19Rural = 425 + 100;
      }
      const maxHouseRural = Math.min(maxLoanUFDS15 + savings + subDS19Rural, capDS19Rural);
      const loanRural = Math.max(0, maxHouseRural - savings - subDS19Rural);
      const maxDividendRural = loanRural > 0 ? (loanRural * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningRural = "";
      if (savings < 80) {
        warningRural = `⚠️ Falta Ahorro: Para el Cupo Rural necesitas un ahorro mínimo de 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t1-homologado-rural",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "Homologación a DS19 (Cupo Rural / Medios 1)",
        description: "Adquiere vivienda nueva en proyectos con convenio en sectores rurales o comunas periféricas. Incluye beneficio DS15.",
        maxHouseUF: maxHouseRural,
        loanUF: loanRural,
        savingsUF: savings,
        subsidyUF: subDS19Rural,
        minAhorro: 80,
        maxDividendUF: maxDividendRural,
        warning: warningRural,
        linkParams: `maxPrice=${Math.round(maxHouseRural * ufValue)}&maxUF=${Math.round(maxHouseRural)}&credit=${Math.round(loanRural)}&origin=ds19&region=${locationB}&cupoType=vulnerable_rural`
      });
    }

    else if (selectedSubsidyB === "ds1t2") {
      // Opción 1: DS1 Tramo 2 Usada (Sin DS15)
      const resNormal = calculateDS1T2Max(maxLoanUFNormal, savings, ds1ZoneB);
      const loanNormal = Math.max(0, resNormal.maxHouseUF - savings - resNormal.subsidyUF);
      const maxDividendNormal = loanNormal > 0 ? (loanNormal * monthlyRateNormal) / (1 - Math.pow(1 + monthlyRateNormal, -totalPayments)) : 0;
      let warningNormal = "";
      if (savings < 40) {
        warningNormal = `⚠️ Falta Ahorro: Se exige mínimo 40 UF para el DS1 Tramo 2. Te faltan ${(40 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t2-usada",
        badge: "Vivienda Usada o Nueva - MINVU",
        title: "DS1 Tramo 2 Usada/Nueva (Sin DS15)",
        description: "Para compras tradicionales. El subsidio es variable decreciente según el valor de la vivienda.",
        maxHouseUF: resNormal.maxHouseUF,
        loanUF: loanNormal,
        savingsUF: savings,
        subsidyUF: resNormal.subsidyUF,
        minAhorro: 40,
        maxDividendUF: maxDividendNormal,
        warning: warningNormal,
        linkParams: `maxPrice=${Math.round(resNormal.maxHouseUF * ufValue)}&maxUF=${Math.round(resNormal.maxHouseUF)}&credit=${Math.round(loanNormal)}&origin=ds1t2&region=${locationB}&isNew=false`
      });

      // Opción 2: DS1 Tramo 2 Nueva (Con DS15)
      const resDS15 = calculateDS1T2MaxWithDS15(maxLoanUFDS15, savings, ds1ZoneB);
      const loanDS15 = Math.max(0, resDS15.maxHouseUF - savings - resDS15.subsidyUF);
      const maxDividendDS15 = loanDS15 > 0 ? (loanDS15 * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningDS15 = "";
      let infoDS15 = "";
      if (savings < 80) {
        warningDS15 = `⚠️ Falta Ahorro: Para activar el beneficio DS15 en Tramo 2 necesitas mínimo 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
        infoDS15 = `💡 ¡Duplica tu ahorro! Si logras llegar a 80 UF, activarás el beneficio DS15, que añade un bono de 150 UF al subsidio y amplía tu tope de compra a 3.000 UF.`;
      } else {
        infoDS15 = `✨ ¡Beneficio DS15 Activo! Se agrega un bono de 150 UF al subsidio y el tope de vivienda sube a 3.000 UF por tener 80 UF o más de ahorro.`;
      }
      options.push({
        id: "ds1t2-nueva-ds15",
        badge: "Solo Vivienda Nueva - Beneficio DS15",
        title: "DS1 Tramo 2 Nueva (Con DS15)",
        description: "Aplica para viviendas nuevas. Ofrece tasa de interés preferencial y un bono adicional al subsidio.",
        maxHouseUF: resDS15.maxHouseUF,
        loanUF: loanDS15,
        savingsUF: savings,
        subsidyUF: resDS15.subsidyUF,
        minAhorro: 80,
        maxDividendUF: maxDividendDS15,
        warning: warningDS15,
        info: infoDS15,
        linkParams: `maxPrice=${Math.round(resDS15.maxHouseUF * ufValue)}&maxUF=${Math.round(resDS15.maxHouseUF)}&credit=${Math.round(loanDS15)}&origin=ds1t2&region=${locationB}&applyRateDiscount=true&isNew=true`
      });

      // Opción 3: Homologación a DS19 Cupo Sectores Medios 1 (Rural)
      const zoneRural = getDS19LocationZoneB(locationB, false, isPeripheral);
      let subRural = 0;
      let capRural = 0;
      if (zoneRural === "sur_islas") {
        capRural = 2400;
        subRural = 537.5 + 100;
      } else if (zoneRural === "urbana_norte_stgo") {
        capRural = 1900;
        subRural = 487.5 + 100;
      } else {
        capRural = 1800;
        subRural = 425 + 100;
      }
      const maxHouseRural = Math.min(maxLoanUFDS15 + savings + subRural, capRural);
      const loanRural = Math.max(0, maxHouseRural - savings - subRural);
      const maxDividendRural = loanRural > 0 ? (loanRural * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningRural = "";
      if (savings < 80) {
        warningRural = `⚠️ Falta Ahorro: Para el Cupo Rural necesitas un ahorro mínimo de 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t2-homologado-rural",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "Homologación a DS19 (Cupo Rural / Medios 1)",
        description: "Adquiere vivienda nueva en proyectos con convenio en sectores rurales o comunas periféricas. Incluye beneficio DS15.",
        maxHouseUF: maxHouseRural,
        loanUF: loanRural,
        savingsUF: savings,
        subsidyUF: subRural,
        minAhorro: 80,
        maxDividendUF: maxDividendRural,
        warning: warningRural,
        linkParams: `maxPrice=${Math.round(maxHouseRural * ufValue)}&maxUF=${Math.round(maxHouseRural)}&credit=${Math.round(loanRural)}&origin=ds19&region=${locationB}&cupoType=vulnerable_rural`
      });

      // Opción 4: Homologación a DS19 Cupo Sectores Medios 2 (Urbano)
      const zoneUrban = getDS19LocationZoneB(locationB, true, isPeripheral);
      let subUrban = 0;
      let capUrban = 0;
      if (zoneUrban === "sur_islas") {
        capUrban = 3000;
        subUrban = 500 + 100;
      } else if (zoneUrban === "urbana_norte_stgo") {
        capUrban = 2800;
        subUrban = 350 + 100;
      } else {
        capUrban = 2600;
        subUrban = 350 + 100;
      }
      const maxHouseUrban = Math.min(maxLoanUFDS15 + savings + subUrban, capUrban);
      const loanUrban = Math.max(0, maxHouseUrban - savings - subUrban);
      const maxDividendUrban = loanUrban > 0 ? (loanUrban * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningUrban = "";
      if (savings < 80) {
        warningUrban = `⚠️ Falta Ahorro: Para el Cupo Urbano necesitas un ahorro mínimo de 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t2-homologado-urban",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "Homologación a DS19 (Cupo Urbano / Medios 2)",
        description: "Adquiere vivienda nueva en proyectos integrados urbanos con beneficio DS15 aplicado automáticamente.",
        maxHouseUF: maxHouseUrban,
        loanUF: loanUrban,
        savingsUF: savings,
        subsidyUF: subUrban,
        minAhorro: 80,
        maxDividendUF: maxDividendUrban,
        warning: warningUrban,
        linkParams: `maxPrice=${Math.round(maxHouseUrban * ufValue)}&maxUF=${Math.round(maxHouseUrban)}&credit=${Math.round(loanUrban)}&origin=ds19&region=${locationB}&cupoType=urban_media`
      });
    }

    else if (selectedSubsidyB === "ds1t3") {
      // Opción 1: DS1 Tramo 3 Usada (Sin DS15)
      const resNormal = calculateDS1T3Max(maxLoanUFNormal, savings, ds1ZoneB);
      const loanNormal = Math.max(0, resNormal.maxHouseUF - savings - resNormal.subsidyUF);
      const maxDividendNormal = loanNormal > 0 ? (loanNormal * monthlyRateNormal) / (1 - Math.pow(1 + monthlyRateNormal, -totalPayments)) : 0;
      let warningNormal = "";
      if (savings < 80) {
        warningNormal = `⚠️ Falta Ahorro: Se exige mínimo 80 UF para el DS1 Tramo 3. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t3-usada",
        badge: "Vivienda Usada o Nueva - MINVU",
        title: "DS1 Tramo 3 Usada/Nueva (Sin DS15)",
        description: "Para compras convencionales. Tope máximo de compra de hasta 2.200 UF (o 2.600 UF en zonas extremas).",
        maxHouseUF: resNormal.maxHouseUF,
        loanUF: loanNormal,
        savingsUF: savings,
        subsidyUF: resNormal.subsidyUF,
        minAhorro: 80,
        maxDividendUF: maxDividendNormal,
        warning: warningNormal,
        linkParams: `maxPrice=${Math.round(resNormal.maxHouseUF * ufValue)}&maxUF=${Math.round(resNormal.maxHouseUF)}&credit=${Math.round(loanNormal)}&origin=ds1t3&region=${locationB}&isNew=false`
      });

      // Opción 2: DS1 Tramo 3 Nueva (Con DS15)
      const resDS15 = calculateDS1T3MaxWithDS15(maxLoanUFDS15, savings, ds1ZoneB);
      const loanDS15 = Math.max(0, resDS15.maxHouseUF - savings - resDS15.subsidyUF);
      const maxDividendDS15 = loanDS15 > 0 ? (loanDS15 * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningDS15 = "";
      let infoDS15 = "";
      if (savings < 160) {
        warningDS15 = `⚠️ Falta Ahorro: Para activar el beneficio DS15 en Tramo 3 necesitas mínimo 160 UF. Te faltan ${(160 - savings).toFixed(0)} UF.`;
        infoDS15 = `💡 ¡Duplica tu ahorro! Si logras llegar a 160 UF, activarás el beneficio DS15, que añade un bono de 150 UF al subsidio y amplía tu tope de compra a 3.000 UF.`;
      } else {
        infoDS15 = `✨ ¡Beneficio DS15 Activo! Se añade un bono de 150 UF al subsidio y el tope de vivienda sube a 3.000 UF por tener 160 UF o más de ahorro.`;
      }
      options.push({
        id: "ds1t3-nueva-ds15",
        badge: "Solo Vivienda Nueva - Beneficio DS15",
        title: "DS1 Tramo 3 Nueva (Con DS15)",
        description: "Aplica para viviendas nuevas. Agrega un bono de 150 UF al subsidio y tasa preferencial.",
        maxHouseUF: resDS15.maxHouseUF,
        loanUF: loanDS15,
        savingsUF: savings,
        subsidyUF: resDS15.subsidyUF,
        minAhorro: 160,
        maxDividendUF: maxDividendDS15,
        warning: warningDS15,
        info: infoDS15,
        linkParams: `maxPrice=${Math.round(resDS15.maxHouseUF * ufValue)}&maxUF=${Math.round(resDS15.maxHouseUF)}&credit=${Math.round(loanDS15)}&origin=ds1t3&region=${locationB}&applyRateDiscount=true&isNew=true`
      });

      // Opción 3: Homologación a DS19 Cupo Sectores Medios 2 (Urbano)
      const zoneUrban = getDS19LocationZoneB(locationB, true, isPeripheral);
      let subUrban = 0;
      let capUrban = 0;
      if (zoneUrban === "sur_islas") {
        capUrban = 3000;
        subUrban = 500 + 100;
      } else if (zoneUrban === "urbana_norte_stgo") {
        capUrban = 2800;
        subUrban = 350 + 100;
      } else {
        capUrban = 2600;
        subUrban = 350 + 100;
      }
      const maxHouseUrban = Math.min(maxLoanUFDS15 + savings + subUrban, capUrban);
      const loanUrban = Math.max(0, maxHouseUrban - savings - subUrban);
      const maxDividendUrban = loanUrban > 0 ? (loanUrban * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningUrban = "";
      if (savings < 80) {
        warningUrban = `⚠️ Falta Ahorro: Para el Cupo Urbano necesitas un ahorro mínimo de 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds1t3-homologado-urban",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "Homologación a DS19 (Cupo Urbano / Medios 2)",
        description: "Adquiere vivienda nueva en proyectos integrados urbanos con beneficio DS15 aplicado automáticamente.",
        maxHouseUF: maxHouseUrban,
        loanUF: loanUrban,
        savingsUF: savings,
        subsidyUF: subUrban,
        minAhorro: 80,
        maxDividendUF: maxDividendUrban,
        warning: warningUrban,
        linkParams: `maxPrice=${Math.round(maxHouseUrban * ufValue)}&maxUF=${Math.round(maxHouseUrban)}&credit=${Math.round(loanUrban)}&origin=ds19&region=${locationB}&cupoType=urban_media`
      });
    }

    else if (selectedSubsidyB === "ds1t4") {
      const subsidyUF = 400;
      const cap = 4000;
      const effectiveSavingsB = savings < 200 ? 200 : savings;
      const maxHouseUF = Math.min(maxLoanUFNormal + effectiveSavingsB + subsidyUF, cap);
      const loanUF = Math.max(0, maxHouseUF - effectiveSavingsB - subsidyUF);
      const maxDividend = loanUF > 0 ? (loanUF * monthlyRateNormal) / (1 - Math.pow(1 + monthlyRateNormal, -totalPayments)) : 0;
      let warningT4 = "";
      if (savings < 200) {
        warningT4 = `⚠️ Falta Ahorro: Se exige mínimo 200 UF para el DS1 Tramo 4. Te faltan ${(200 - savings).toFixed(0)} UF. Hemos simulado asumiendo que alcanzarás la meta de 200 UF.`;
      }
      options.push({
        id: "ds1t4-propio",
        badge: "Vivienda Nueva/Usada - Postulación MINVU",
        title: "Subsidio DS1 Tramo 4",
        description: "Diseñado para viviendas de hasta 4.000 UF en sectores medios. Apoyo estatal directo de 400 UF.",
        maxHouseUF,
        loanUF,
        savingsUF: effectiveSavingsB,
        subsidyUF,
        minAhorro: 200,
        maxDividendUF: maxDividend,
        warning: warningT4,
        linkParams: `maxPrice=${Math.round(maxHouseUF * ufValue)}&maxUF=${Math.round(maxHouseUF)}&credit=${Math.round(loanUF)}&origin=ds1t4&region=${locationB}&propertyType=${propertyTypeB}`
      });
    }

    else if (selectedSubsidyB === "ds19") {
      // Opción 1: DS19 Cupo Urbano (Medios 2)
      const zoneUrban = getDS19LocationZoneB(locationB, true, isPeripheral);
      let subUrban = 0;
      let capUrban = 0;
      if (zoneUrban === "sur_islas") {
        capUrban = 3000;
        subUrban = 500 + 100;
      } else if (zoneUrban === "urbana_norte_stgo") {
        capUrban = 2800;
        subUrban = 350 + 100;
      } else {
        capUrban = 2600;
        subUrban = 350 + 100;
      }
      const maxHouseUrban = Math.min(maxLoanUFDS15 + savings + subUrban, capUrban);
      const loanUrban = Math.max(0, maxHouseUrban - savings - subUrban);
      const maxDividendUrban = loanUrban > 0 ? (loanUrban * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningUrban = "";
      if (savings < 80) {
        warningUrban = `⚠️ Falta Ahorro: Para proyectos DS19 (Sectores Medios) se exige un ahorro mínimo de 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds19-urban",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "DS19 Cupo Urbano (Sectores Medios 2)",
        description: "Adquiere tu vivienda nueva en proyectos con convenio en zonas urbanas. Incluye el beneficio DS15 aplicado automáticamente.",
        maxHouseUF: maxHouseUrban,
        loanUF: loanUrban,
        savingsUF: savings,
        subsidyUF: subUrban,
        minAhorro: 80,
        maxDividendUF: maxDividendUrban,
        warning: warningUrban,
        linkParams: `maxPrice=${Math.round(maxHouseUrban * ufValue)}&maxUF=${Math.round(maxHouseUrban)}&credit=${Math.round(loanUrban)}&origin=ds19&region=${locationB}&cupoType=urban_media`
      });

      // Opción 2: DS19 Cupo Rural (Medios 1)
      const zoneRural = getDS19LocationZoneB(locationB, false, isPeripheral);
      let subRural = 0;
      let capRural = 0;
      if (zoneRural === "sur_islas") {
        capRural = 2400;
        subRural = 537.5 + 100;
      } else if (zoneRural === "urbana_norte_stgo") {
        capRural = 1900;
        subRural = 487.5 + 100;
      } else {
        capRural = 1800;
        subRural = 425 + 100;
      }
      const maxHouseRural = Math.min(maxLoanUFDS15 + savings + subRural, capRural);
      const loanRural = Math.max(0, maxHouseRural - savings - subRural);
      const maxDividendRural = loanRural > 0 ? (loanRural * monthlyRateDS15) / (1 - Math.pow(1 + monthlyRateDS15, -totalPayments)) : 0;
      let warningRural = "";
      if (savings < 80) {
        warningRural = `⚠️ Falta Ahorro: Para proyectos DS19 se exige un ahorro mínimo de 80 UF. Te faltan ${(80 - savings).toFixed(0)} UF.`;
      }
      options.push({
        id: "ds19-rural",
        badge: "Solo Vivienda Nueva - Convenio DS19",
        title: "DS19 Cupo Rural (Sectores Medios 1)",
        description: "Adquiere tu vivienda nueva en proyectos con convenio en sectores rurales o comunas periféricas. Incluye beneficio DS15.",
        maxHouseUF: maxHouseRural,
        loanUF: loanRural,
        savingsUF: savings,
        subsidyUF: subRural,
        minAhorro: 80,
        maxDividendUF: maxDividendRural,
        warning: warningRural,
        linkParams: `maxPrice=${Math.round(maxHouseRural * ufValue)}&maxUF=${Math.round(maxHouseRural)}&credit=${Math.round(loanRural)}&origin=ds19&region=${locationB}&cupoType=vulnerable_rural`
      });
    }

    setResultsB(options);
  };

  // Calcular número total de pasos en Perfil A (total 5 pasos)
  const totalStepsA = 5;
  const progressPercentA = (step / totalStepsA) * 100;

  const getGridColsClass = (length: number) => {
    if (length === 1) return "grid-cols-1 max-w-md mx-auto";
    if (length === 2) return "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto";
    if (length === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"; // Default for 3
  };

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
                          disabled={familyType === "solo"}
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-800 focus:outline-none focus:border-[#6b9ac4] disabled:opacity-70 disabled:bg-slate-100 disabled:cursor-not-allowed" 
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

                  {/* Grilla de Recomendaciones */}
                  <div className={`grid ${getGridColsClass(recommendationsA.length)} gap-6`}>
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
                                    {card.ds15Info?.label || "Opción Con Beneficio DS15"}
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
                                    href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.ds15Info.maxHouseUF * ufValue)}&maxUF=${Math.round(card.ds15Info.maxHouseUF)}&credit=${Math.round(card.ds15Info.loanUF)}&origin=${card.subsidyKey}&region=${regionA}&cupoType=${card.ds15Info?.cupoType || card.cupoType || ""}&isNew=true`}
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
                                    {card.normalInfo?.label || "Opción Sin Beneficio DS15"}
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
                                    href={`/ofertas-inmobiliarias?maxPrice=${Math.round(card.normalInfo.maxHouseUF * ufValue)}&maxUF=${Math.round(card.normalInfo.maxHouseUF)}&credit=${Math.round(card.normalInfo.loanUF)}&origin=${card.subsidyKey}&region=${regionA}&cupoType=${card.normalInfo?.cupoType || card.cupoType || ""}`}
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
                    
                    {/* Fila 1: Ingreso y Ahorro Sincronizado */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          Ahorro Disponible ($ CLP):
                        </label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          placeholder="Ej: 3000000"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={savingsCLPB} 
                          onChange={(e) => handleSavingsCLPBChange(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ahorro Disponible (UF):
                        </label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          step="0.01"
                          placeholder="Ej: 80"
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={savingsUFB} 
                          onChange={(e) => handleSavingsUFBChange(e.target.value)} 
                        />
                      </div>
                    </div>

                    {/* Fila 2: Subsidio, Tipo de Hogar, Entorno */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subsidio a Postular:</label>
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

                      {["ds49", "ds1t1"].includes(selectedSubsidyB) && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Hogar:</label>
                          <select 
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                            value={propertyTypeB} 
                            onChange={(e) => setPropertyTypeB(e.target.value as "casa" | "depto" | "ambos")}
                          >
                            <option value="ambos">Casa o Departamento (Cualquiera)</option>
                            <option value="casa">Solo Casa</option>
                            <option value="depto">Solo Departamento</option>
                          </select>
                        </div>
                      )}

                      {selectedSubsidyB === "ds49" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Entorno / Ubicación:</label>
                          <select 
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                            value={isUrbanB ? "urban" : "rural"} 
                            onChange={(e) => setIsUrbanB(e.target.value === "urban")}
                          >
                            <option value="urban">Urbano</option>
                            <option value="rural">Rural</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Fila 3: Región de la Vivienda y Comuna */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Región de la vivienda:</label>
                        <select 
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                          value={locationB} 
                          onChange={(e) => setLocationB(e.target.value)}
                        >
                          {Object.keys(REGION_MAP).map((key) => (
                            <option key={key} value={key}>{REGION_MAP[key].label}</option>
                          ))}
                        </select>
                      </div>

                      {["ds1t2", "ds1t3", "ds19"].includes(selectedSubsidyB) && DS19_COMMUNES_PERIPHERAL[locationB]?.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Comuna / Ciudad en la Región:</label>
                          <select 
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#87c0a3]" 
                            value={selectedCommuneB} 
                            onChange={(e) => setSelectedCommuneB(e.target.value)}
                          >
                            {DS19_COMMUNES_PERIPHERAL[locationB].map((c) => (
                              <option key={c.key} value={c.key}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Fila 4: Banco y Plazo (Solo si no es DS49) */}
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
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                      Resultados de Simulación (Perfil B)
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900">Capacidad de Compra Real Estimada</h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
                      Hemos evaluado tus opciones en la región de {REGION_MAP[locationB]?.label} con una renta familiar líquida de ${(parseFloat(incomeCLPB) || 0).toLocaleString("es-CL")} CLP.
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 ${resultsB.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto' : resultsB.length === 3 ? 'lg:grid-cols-3' : resultsB.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'max-w-xl mx-auto'} gap-6`}>
                    {resultsB.map((card: any, idx: number) => {
                      const isSavingsShort = card.minAhorro > 0 && (parseFloat(savingsUFB) || 0) < card.minAhorro;
                      const missingUF = Math.max(0, card.minAhorro - (parseFloat(savingsUFB) || 0));

                      return (
                        <article 
                          key={idx}
                          className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-emerald-500 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold py-1 px-2 rounded-full inline-block mb-3 border border-emerald-100">
                              {card.badge}
                            </span>
                            
                            <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight">
                              {card.title}
                            </h3>
                            
                            <p className="text-xs text-slate-500 leading-relaxed mb-4 font-normal">
                              {card.description}
                            </p>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center mb-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Máximo de Compra</span>
                              <strong className="text-2xl font-black text-slate-800 block">
                                {card.maxHouseUF.toFixed(0)} UF
                              </strong>
                              <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                                ≈ ${Math.round(card.maxHouseUF * ufValue).toLocaleString("es-CL")} CLP
                              </span>
                            </div>

                            <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">{isSavingsShort ? "Ahorro Mínimo:" : "Tu Ahorro:"}</span>
                                <span className="font-bold text-slate-700">
                                  {Math.max(card.minAhorro, parseFloat(savingsUFB) || 0).toFixed(0)} UF
                                </span>
                              </div>
                              {card.subsidyUF > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Aporte Estatal Subsidio:</span>
                                  <span className="font-bold text-emerald-600">+{card.subsidyUF.toFixed(0)} UF</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-500">Crédito Hipotecario:</span>
                                <span className="font-bold text-blue-600">
                                  {card.loanUF > 0 ? `${card.loanUF.toFixed(0)} UF` : "No requiere"}
                                </span>
                              </div>
                              {card.maxDividendUF > 0 && (
                                <div className="flex justify-between pt-1.5 border-t border-slate-100/60 mt-1">
                                  <span className="text-slate-500 font-medium">Dividendo Estimado:</span>
                                  <span className="font-bold text-slate-900">
                                    {card.maxDividendUF.toFixed(2)} UF ($ {Math.round(card.maxDividendUF * ufValue).toLocaleString("es-CL")})
                                  </span>
                                </div>
                              )}
                            </div>

                            {card.warning && (
                              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-[10px] leading-relaxed mb-4 text-left">
                                {card.warning}
                              </div>
                            )}

                            {card.info && (
                              <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-2.5 rounded-lg text-[10px] leading-relaxed mb-4 text-left">
                                {card.info}
                              </div>
                            )}
                          </div>

                          <Link 
                            href={`/ofertas-inmobiliarias?${card.linkParams}`}
                            className="w-full text-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-sm block"
                          >
                            Buscar Ofertas Compatibles →
                          </Link>
                        </article>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <Link 
                      href="/formulario"
                      className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
                    >
                      Evaluar mi Capacidad Gratis
                    </Link>
                    <button
                      onClick={handleRestart}
                      className="py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all"
                    >
                      Volver a simular con otros valores
                    </button>
                  </div>
                </div>
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

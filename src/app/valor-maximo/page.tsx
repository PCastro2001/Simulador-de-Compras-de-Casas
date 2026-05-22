// src/app/valor-maximo/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchUFValue } from "@/utils/api";
import { BANKS } from "@/data/banks";

function ValorMaximoForm() {
  const searchParams = useSearchParams();
  const subsidioInicial = searchParams.get("subsidio") || "ninguno";

  const [incomeCLP, setIncomeCLP] = useState("");
  const [savingsUF, setSavingsUF] = useState("0");
  const [subsidyType, setSubsidyType] = useState(subsidioInicial);
  const [bank, setBank] = useState("");
  const [loanTerm, setLoanTerm] = useState("25");
  const [isYoungSingle, setIsYoungSingle] = useState(false);
  const [ufValue, setUfValue] = useState(39200);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const uf = await fetchUFValue();
      setUfValue(uf);
    }
    init();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(incomeCLP);
    const savings = parseFloat(savingsUF);
    const term = parseInt(loanTerm);

    if (isNaN(income) || income <= 0) {
      alert("Por favor, ingresa tu renta líquida mensual.");
      return;
    }

    if (!bank || !BANKS[bank]) {
      alert("Por favor, selecciona un banco.");
      return;
    }

    // 1. Capacidad de pago (Dividendo máximo permitido)
    // Jóvenes solteros pueden comprometer hasta un 33% (1/3), familias un 25% (1/4)
    const multiplier = isYoungSingle ? 3 : 4; 
    const maxDividendCLP = income / multiplier;
    const maxDividendUF = maxDividendCLP / ufValue;

    // 2. Ingeniería Inversa: ¿Cuánto crédito genera este dividendo?
    const bankData = BANKS[bank];
    const tasa = bankData.tasaBase || 0.05; // Usamos la tasa base del banco para estimar
    const monthlyRate = tasa / 12;
    const totalPayments = term * 12;
    
    // Fórmula de Valor Presente (PV)
    const maxLoanUF = maxDividendUF * ((1 - Math.pow(1 + monthlyRate, -totalPayments)) / monthlyRate);

    // 3. Estimar Subsidio y Topes Legales según selección
    let subsidyAmount = 0;
    let legalCap = Infinity;
    let subsidyName = "Sin Subsidio";

    if (subsidyType === "ds49") {
      subsidyName = "DS49";
      legalCap = 950; // Promedio zona regular
      subsidyAmount = legalCap - savings; 
    } else if (subsidyType === "ds1t1") {
      subsidyName = "DS1 Tramo 1";
      legalCap = 1100;
      subsidyAmount = 600;
    } else if (subsidyType === "ds1t2") {
      subsidyName = "DS1 Tramo 2";
      legalCap = 1600;
      subsidyAmount = 550;
    } else if (subsidyType === "ds1t3") {
      subsidyName = "DS1 Tramo 3";
      legalCap = 2200;
      subsidyAmount = 400;
    } else if (subsidyType === "ds19") {
      subsidyName = "Proyectos DS19";
      legalCap = 2600;
      subsidyAmount = 350;
    }

    // 4. Calcular el poder adquisitivo bruto
    const purchasingPowerUF = maxLoanUF + savings + subsidyAmount;

    // 5. Ajustar al tope legal
    const finalMaxHouseValue = Math.min(purchasingPowerUF, legalCap);
    const isCapped = purchasingPowerUF > legalCap;

    setResults({
      incomeUF: income / ufValue,
      maxDividendUF,
      maxLoanUF,
      savings,
      subsidyAmount,
      purchasingPowerUF,
      finalMaxHouseValue,
      legalCap,
      isCapped,
      subsidyName,
      bank: bankData.name
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
      <form onSubmit={handleCalculate} className="space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Renta Líquida Mensual ($ CLP):</label>
            <input type="number" min="0" required placeholder="Ej: 800000" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={incomeCLP} onChange={(e) => setIncomeCLP(e.target.value)} />
            <span className="text-[10px] text-slate-400 mt-1 block">Tu sueldo tras descuentos. Puedes sumar el de tu pareja.</span>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ahorro Actual (UF):</label>
            <input type="number" min="0" step="0.01" required className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={savingsUF} onChange={(e) => setSavingsUF(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Subsidio / Beneficio a aplicar:</label>
            <select className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none text-[#6b9ac4] font-bold" value={subsidyType} onChange={(e) => setSubsidyType(e.target.value)}>
                <option value="ninguno">Ninguno (Compra Libre)</option>
                <option value="ds49">Subsidio DS49 (Sin Crédito)</option>
                <option value="ds1t1">Subsidio DS1 - Tramo 1</option>
                <option value="ds1t2">Subsidio DS1 - Tramo 2</option>
                <option value="ds1t3">Subsidio DS1 - Tramo 3</option>
                <option value="ds19">Integración Social (DS19)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Plazo del Hipotecario:</label>
            <select required className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} disabled={subsidyType === "ds49"}>
              <option value="15">15 años</option>
              <option value="20">20 años</option>
              <option value="25">25 años</option>
              <option value="30">30 años</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Banco de Preferencia:</label>
          <select 
            required 
            className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none" 
            value={bank} 
            onChange={(e) => setBank(e.target.value)} 
            disabled={subsidyType === "ds49"}
            >
                <option value="">Selecciona una entidad...</option>
                {BANKS && Object.keys(BANKS).map(key => (
                <option key={key} value={key}>
                    {BANKS[key].name || key} {/* <-- Si .name no existe, muestra la clave (ej: BancoEstado) */}
                </option>
                ))}
            </select>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
           <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-[#6b9ac4] rounded" checked={isYoungSingle} onChange={(e) => setIsYoungSingle(e.target.checked)} /> 
            ¿Eres joven soltero menor de 35 años? (Permite mayor endeudamiento)
          </label>
        </div>

        <button type="submit" className="w-full bg-[#6b9ac4] text-white font-bold p-3.5 rounded-xl hover:bg-[#5a86ae] transition-colors shadow-sm">
          Descubrir mi Presupuesto Máximo
        </button>
      </form>

      {/* RESULTADOS */}
      {results && (
        <div className="mt-8 space-y-4 animate-fade-in border-t border-slate-100 pt-8">
          
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Valor Máximo de Casa que puedes comprar</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              {results.finalMaxHouseValue.toFixed(0)} UF
            </h2>
            <p className="text-lg font-semibold text-[#6b9ac4] mt-2">
              ≈ ${(results.finalMaxHouseValue * ufValue).toLocaleString("es-CL")} CLP
            </p>
          </div>

          {results.isCapped && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-900 p-4 rounded-xl shadow-sm text-xs">
              ⚠️ <strong>Límite Legal Alcanzado:</strong> Tu sueldo y ahorros te dan un poder adquisitivo de <strong>{results.purchasingPowerUF.toFixed(0)} UF</strong>, pero el programa <strong>{results.subsidyName}</strong> tiene un tope máximo legal fijado en {results.legalCap} UF.
            </div>
          )}

          {subsidyType !== "ds49" && (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">¿De dónde sale este presupuesto?</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-slate-600">Lo que presta el banco ({results.bank}):</span>
                  <strong className="text-slate-900">{results.maxLoanUF.toFixed(0)} UF</strong>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-600">Lo que tú aportas (Ahorro):</span>
                  <strong className="text-slate-900">{results.savings.toFixed(0)} UF</strong>
                </li>
                {results.subsidyAmount > 0 && (
                  <li className="flex justify-between items-center">
                    <span className="text-slate-600">Lo que aporta el Estado ({results.subsidyName}):</span>
                    <strong className="text-emerald-600">+{results.subsidyAmount.toFixed(0)} UF</strong>
                  </li>
                )}
                <li className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold">
                  <span className="text-slate-800">Poder Adquisitivo Bruto:</span>
                  <span className="text-blue-600">{results.purchasingPowerUF.toFixed(0)} UF</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Tope máximo del Dividendo:</span>
                <span className="font-extrabold text-slate-800">{results.maxDividendUF.toFixed(2)} UF <span className="text-xs text-slate-400 font-normal">(${(results.maxDividendUF * ufValue).toLocaleString("es-CL")})</span></span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function ValorMaximoPage() {
  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Presupuesto Máximo</h1>
            <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
              Descubre hasta qué valor puedes buscar casas según tu sueldo.
            </p>
          </div>
          <Link href="/" className="text-xs font-bold bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all">
            ← Inicio
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Next.js 13+ exige que useSearchParams esté envuelto en Suspense */}
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando calculadora...</div>}>
          <ValorMaximoForm />
        </Suspense>
      </main>
    </div>
  );
}
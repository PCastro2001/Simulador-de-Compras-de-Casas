// src/app/subsidies/ds19/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUFValue } from "@/utils/api";
import { BANKS } from "@/data/banks"; // Importamos el motor de tasas universal

export default function DS19Page() {
  const [propertyCLP, setPropertyCLP] = useState("");
  const [propertyUF, setPropertyUF] = useState("");
  const [savings, setSavings] = useState("");
  const [isDS15, setIsDS15] = useState(false);
  const [bank, setBank] = useState("");
  const [loanTerm, setLoanTerm] = useState("25");
  const [isYoungSingle, setIsYoungSingle] = useState(false);
  const [ufValue, setUfValue] = useState(39200);
  const [results, setResults] = useState<any>(null);

  // Límite oficial DS19: 2200 UF (regular), 2600 UF (zonas extremas), pero con DS15 puede llegar a 3000 UF
  const maxLimit = isDS15 ? 3000 : 2600;

  useEffect(() => {
    async function init() {
      const uf = await fetchUFValue();
      setUfValue(uf);
    }
    init();
  }, []);

  const handleCLPChange = (val: string) => {
    setPropertyCLP(val);
    const clp = parseFloat(val);
    if (!isNaN(clp) && ufValue > 0) {
      setPropertyUF((clp / ufValue).toFixed(2));
    } else {
      setPropertyUF("");
    }
  };

  const handleUFChange = (val: string) => {
    setPropertyUF(val);
    const uf = parseFloat(val);
    if (!isNaN(uf) && ufValue > 0) {
      setPropertyCLP((uf * ufValue).toFixed(0));
    } else {
      setPropertyCLP("");
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const pUF = parseFloat(propertyUF);
    const sUF = parseFloat(savings);
    const term = parseInt(loanTerm);

    if (!bank || !BANKS[bank]) {
      alert("Por favor, selecciona un banco adscrito.");
      return;
    }

    if (sUF < 40) {
      alert("Para proyectos DS19 se exige un ahorro mínimo general de 40 UF.");
      return;
    }

    // Regla DS15 para DS19
    if (isDS15 && sUF < 80) {
      alert("Para activar el bono de +100 UF del DS15 en un proyecto DS19, necesitas un ahorro de al menos 80 UF.");
      return;
    }

    if (pUF > maxLimit || pUF < 800) {
      alert(`El valor de la propiedad debe estar entre 800 y ${maxLimit} UF para este programa.`);
      return;
    }

    // Tramos de Subsidio Base Automático (Integración Social)
    // Los montos base aproximados para sectores medios en DS19
    let subsidy = 0;
    if (pUF <= 1400) {
      subsidy = 500; // Vivienda Vulnerable / Económica
    } else if (pUF <= 2200) {
      subsidy = 350; // Vivienda Sector Medio
    } else {
      subsidy = 250; // Vivienda hasta 2600 o 3000 UF
    }

    // Beneficio DS15 para DS19: Agrega exactamente 100 UF según el documento
    const ds15Bonus = isDS15 ? 100 : 0;
    const totalSubsidy = subsidy + ds15Bonus;
    
    const loanAmount = pUF - sUF - totalSubsidy;

    if (loanAmount < 0) {
      alert("El subsidio y tu ahorro cubren el valor total de la vivienda. ¡Felicidades, no necesitas crédito hipotecario!");
      return;
    }

    // --- MAGIA DEL NUEVO MOTOR DE BANCOS ---
    const bankData = BANKS[bank];
    // 1. Calculamos la tasa dinámica o extraemos la fija
    const tasaOriginal = bankData.calcularTasa ? bankData.calcularTasa(loanAmount, term) : (bankData.tasaBase || 0.05);
    // 2. Como DS19 SIEMPRE es vivienda nueva, aplicamos el descuento de la ley directamente si el banco lo tiene
    const tasaAplicada = tasaOriginal - (bankData.descuentoDS15 || 0);

    const monthlyRate = tasaAplicada / 12;
    const totalPayments = term * 12;
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
    const incomeMultiplier = isYoungSingle ? 3 : 4;

    setResults({
      valorViviendaUF: pUF,
      pieUF: sUF,
      piePorcentajeReal: (sUF / pUF) * 100,
      creditoUF: loanAmount,
      banco: bankData.name,
      tasaOriginal: tasaOriginal,
      tasaAplicada: tasaAplicada,
      dividendoUF: monthlyPayment,
      rentaMinimaUF: monthlyPayment * incomeMultiplier,
      ahorroMensualCLP: totalSubsidy * ufValue,
      aplicaLey: true, // Siempre true en DS19 porque es vivienda nueva
      aplicaDS15: isDS15,
      bonoExtra: ds15Bonus,
      multiplicadorRenta: incomeMultiplier
    });
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Proyectos DS19</h1>
            <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
              Programa de Integración Social y Territorial (Tope {maxLimit} UF).
            </p>
          </div>
          <Link href="/subsidies" className="text-xs font-bold bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all">
            ← Volver
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mb-8">
          <form onSubmit={handleCalculate} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Precio en Inmobiliaria ($ CLP):</label>
                <input type="number" min="0" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={propertyCLP} onChange={(e) => handleCLPChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Precio en Inmobiliaria (UF):</label>
                <input type="number" required min="800" step="0.01" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={propertyUF} onChange={(e) => handleUFChange(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ahorro depositado (UF):</label>
                <input type="number" required min="40" step="1" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={savings} onChange={(e) => setSavings(e.target.value)} />
                <span className="text-[10px] text-slate-400 mt-1 block">Mínimo 40 UF. (80 UF si solicitas el bono DS15).</span>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Plazo del Hipotecario (años):</label>
                <select required className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)}>
                  <option value="15">15 años</option>
                  <option value="20">20 años</option>
                  <option value="25">25 años</option>
                  <option value="30">30 años</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Institución Financiera:</label>
              <select required className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none" value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option value="">Selecciona tu banco preferido...</option>
                  {Object.keys(BANKS).map(key => (
                    <option key={key} value={key}>{BANKS[key].name}</option>
                  ))}
              </select>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 cursor-not-allowed">
                <input type="checkbox" checked disabled className="w-4 h-4 rounded text-slate-300" /> 
                Proyecto de Vivienda Nueva (Aplicado por defecto en DS19)
              </label>
              
              <div className="pl-6">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-700 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" checked={isDS15} onChange={(e) => setIsDS15(e.target.checked)} /> 
                  Proyecto con Recepción Municipal hasta Mar 2024 (Aplica DS15: +100 UF)
                </label>
              </div>
              
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer pt-2 border-t border-slate-200">
                <input type="checkbox" className="w-4 h-4 text-[#6b9ac4] rounded" checked={isYoungSingle} onChange={(e) => setIsYoungSingle(e.target.checked)} /> 
                ¿Eres joven soltero menor de 35 años?
              </label>
            </div>

            <button type="submit" className="w-full bg-[#87c0a3] text-slate-950 font-bold p-3.5 rounded-xl hover:bg-[#76b092] transition-colors shadow-sm">
              Simular Compra DS19
            </button>
          </form>
        </section>

        {/* INTERFAZ DE RESULTADOS UNIFICADA */}
        {results && (
          <section className="space-y-4 animate-fade-in">
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-sm font-bold">🏢 Subsidio Automático Integrado</h4>
                <p className="text-xs opacity-90 mt-0.5">El Estado paga esta parte directamente a la inmobiliaria.</p>
              </div>
              <div className="text-right">
                <span className="text-xs block font-medium opacity-75">Bono Total:</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  ${Math.round(results.ahorroMensualCLP).toLocaleString("es-CL")} CLP
                </span>
              </div>
            </div>

            {results.aplicaDS15 && (
              <div className="bg-blue-50 border-2 border-blue-200 text-blue-950 p-4 rounded-xl shadow-sm text-xs">
                🚀 <strong>Bono Transitorio DS15:</strong> Tu subsidio automático aumentó en {results.bonoExtra} UF gracias al beneficio vigente para este proyecto inmobiliario.
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                Análisis de Crédito ({results.banco})
              </h3>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Precio Propiedad:</span>
                  <strong className="text-slate-800">{results.valorViviendaUF.toFixed(2)} UF</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Ahorro Entregado ({results.piePorcentajeReal.toFixed(1)}%):</span>
                  <strong className="text-slate-800">{results.pieUF.toFixed(2)} UF</strong>
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-slate-500 block">Crédito a Solicitar:</span>
                  <strong className="text-blue-600 font-bold">{results.creditoUF.toFixed(2)} UF</strong>
                  <span className="text-xs text-slate-400 block">(${(results.creditoUF * ufValue).toLocaleString("es-CL")})</span>
                </div>
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-slate-500 block">Tasa Final Efectiva:</span>
                  <strong className="text-slate-800">
                    {(results.tasaAplicada * 100).toFixed(2)}% Anual
                    {results.tasaAplicada < results.tasaOriginal && (
                      <span className="text-xs text-emerald-600 font-normal block">
                        (Rebaja Ley 21.748 aplicada. Tasa sin rebaja: {(results.tasaOriginal * 100).toFixed(2)}%)
                      </span>
                    )}
                  </strong>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Dividendo Mensual:</span>
                  <span className="text-xl md:text-2xl font-extrabold text-slate-900">{results.dividendoUF.toFixed(2)} UF</span>
                  <span className="text-sm font-semibold text-blue-600 block">
                    ≈ ${(results.dividendoUF * ufValue).toLocaleString("es-CL")} / mes
                  </span>
                </div>
                <div className="md:border-l md:pl-4 border-slate-200">
                  <span className="text-xs font-bold text-slate-500 block uppercase tracking-wide">Renta Mínima ({results.multiplicadorRenta}x):</span>
                  <span className="text-lg md:text-xl font-bold text-slate-800">{results.rentaMinimaUF.toFixed(2)} UF</span>
                  <span className="text-sm font-bold text-slate-700 block">
                    ≈ ${(results.rentaMinimaUF * ufValue).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
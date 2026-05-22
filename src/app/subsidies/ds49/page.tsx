// src/app/subsidies/ds49/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUFValue } from "@/utils/api";

export default function DS49Page() {
  const [propertyCLP, setPropertyCLP] = useState("");
  const [propertyUF, setPropertyUF] = useState("");
  const [savings, setSavings] = useState("10"); // Por defecto el mínimo legal
  const [location, setLocation] = useState("none");
  const [ufValue, setUfValue] = useState(39200);
  const [results, setResults] = useState<any>(null);

  // Límites oficiales aproximados para compra de vivienda construida DS49 según zona
  const maxLimit = location === "north" ? 1200 : location === "south" ? 1250 : 950;

  useEffect(() => {
    async function init() {
      const uf = await fetchUFValue();
      setUfValue(uf);
    }
    init();
  }, []);

  // Sincronizar CLP a UF
  const handleCLPChange = (val: string) => {
    setPropertyCLP(val);
    const clp = parseFloat(val);
    if (!isNaN(clp) && ufValue > 0) {
      setPropertyUF((clp / ufValue).toFixed(2));
    } else {
      setPropertyUF("");
    }
  };

  // Sincronizar UF a CLP
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

    // Validación de ahorro mínimo legal para DS49
    if (sUF < 10) {
      alert("El Subsidio DS49 exige un ahorro mínimo absoluto de 10 UF.");
      return;
    }

    if (pUF > maxLimit || pUF < 500) {
      alert(`Para el programa DS49, el valor de la vivienda debe estar entre 500 y ${maxLimit} UF en esta zona.`);
      return;
    }

    // En el DS49, el Estado subsidia la diferencia total del valor de la vivienda menos el ahorro del postulante
    const totalSubsidy = pUF - sUF;

    setResults({
      valorViviendaUF: pUF,
      pieUF: sUF,
      piePorcentajeReal: (sUF / pUF) * 100,
      subsidioEstadoUF: totalSubsidy,
      subsidioEstadoCLP: totalSubsidy * ufValue,
      creditoUF: 0, // 0 deudas
      dividendoUF: 0,
      rentaMinimaUF: 0
    });
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Subsidio DS49</h1>
            <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
              Fondo Solidario de Elección de Vivienda — Compra sin crédito hipotecario.
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
                <label className="block text-sm font-bold text-slate-700 mb-1">Valor Vivienda ($ CLP):</label>
                <input type="number" min="0" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={propertyCLP} onChange={(e) => handleCLPChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Valor Vivienda (UF):</label>
                <input type="number" required min="500" step="0.01" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={propertyUF} onChange={(e) => handleUFChange(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ahorro Exigido (UF):</label>
                <input type="number" required min="10" step="1" className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-[#6b9ac4]" value={savings} onChange={(e) => setSavings(e.target.value)} />
                <span className="text-[10px] text-slate-400 mt-1 block">Mínimo legal para postular: 10 UF.</span>
              </div>
               <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Ubicación / Zona Geográfica:</label>
                <select className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none" value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="none">Zona Regular (Tope 950 UF)</option>
                    <option value="north">Extremo Norte (Tope 1.200 UF)</option>
                    <option value="south">Extremo Sur (Tope 1.250 UF)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-950 leading-relaxed">
                ℹ️ <strong>Información de Financiamiento:</strong> Este programa estatal está destinado al 40% más vulnerable de la población. Si resultas beneficiario, el Estado cubre el valor restante de la propiedad sin necesidad de solicitar un crédito al banco.
              </p>
            </div>

            <button type="submit" className="w-full bg-[#87c0a3] text-slate-950 font-bold p-3.5 rounded-xl hover:bg-[#76b092] transition-colors shadow-sm">
              Simular Cobertura Solidaria
            </button>
          </form>
        </section>

        {/* INTERFAZ DE RESULTADOS UNIFICADA Y CONFIGURADA PARA 0 DEUDA */}
        {results && (
          <section className="space-y-4 animate-fade-in">
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-sm font-bold">🎉 Cobertura de Subsidio Completa</h4>
                <p className="text-xs opacity-90 mt-0.5">Monto total estimado que financiará el SERVIU.</p>
              </div>
              <div className="text-right">
                <span className="text-xs block font-medium opacity-75">Aporte del Estado:</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  ${Math.round(results.subsidioEstadoCLP).toLocaleString("es-CL")} CLP
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                Análisis de Adquisición Solidaria
              </h3>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Precio Vivienda:</span>
                  <strong className="text-slate-800">{results.valorViviendaUF.toFixed(2)} UF</strong>
                  <span className="text-xs text-slate-400 block">(${(results.valorViviendaUF * ufValue).toLocaleString("es-CL")})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tu Ahorro ({results.piePorcentajeReal.toFixed(1)}%):</span>
                  <strong className="text-slate-800">{results.pieUF.toFixed(2)} UF</strong>
                  <span className="text-xs text-slate-400 block">(${(results.pieUF * ufValue).toLocaleString("es-CL")})</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">Crédito a Solicitar:</span>
                  <strong className="text-emerald-600 font-bold">{results.creditoUF} UF (Sin Deuda)</strong>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block">Subsidio Solicitado:</span>
                  <strong className="text-slate-800">{results.subsidioEstadoUF.toFixed(2)} UF</strong>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide">Dividendo Mensual:</span>
                  <span className="text-xl md:text-2xl font-extrabold text-emerald-400">$0 CLP</span>
                  <span className="text-xs text-slate-300 block mt-0.5">Propiedad liberada de hipoteca bancaria</span>
                </div>
                <div className="md:border-l md:pl-4 border-slate-700">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide">Renta Mínima Exigida:</span>
                  <span className="text-lg md:text-xl font-bold text-slate-100">No aplica</span>
                  <span className="text-xs text-slate-300 block mt-0.5">No requiere evaluación comercial</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
// src/app/ofertas-inmobiliarias/page.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { REGION_MAP } from "@/data/regions";


const ENLACE_MAP: Record<string, string> = {
  "arica-y-parinacota": "norte/listado/region-parinacota",
  "tarapaca": "norte/listado/region-tarapaca",
  "antofagasta": "norte/listado/region-antofagasta",
  "atacama": "norte/listado/region-atacama",
  "coquimbo": "coquimbo/listado/region-coquimbo",
  "valparaiso": "valparaiso/listado/region-valparaiso",
  "metropolitana": "metropolitano/listado/region-metropolitana",
  "bernardo-ohiggins": "ohiggins/listado/region-ohiggins",
  "maule": "maule/listado/region-maule",
  "biobio": "biobio/listado/region-bio",
  "nuble": "biobio/listado/region-bio",
  "araucania": "araucania/listado/region-araucania",
  "los-rios": "sur/listado/region-rios",
  "los-lagos": "sur/listado/region-lagos",
  "aysen": "sur/listado/region-aysen",
  "magallanes": "sur/listado/region-magallanes"
};

const TOCTOC_PARAMS: Record<string, { text: string; viewport: string; polygon: number }> = {
  "arica-y-parinacota": {
    text: "Arica%20Y%20Parinacota,%20Chile",
    viewport: "-19.22999131394741,-70.80341585889809,-17.497775945103612,-68.48870372305349",
    polygon: 2238
  },
  "tarapaca": {
    text: "Tarapac%C3%A1,%20Chile",
    viewport: "-21.630609919514427,-71.165270613956,-18.93912523754156,-67.52591670768183",
    polygon: 2251
  },
  "antofagasta": {
    text: "Antofagasta,%20Chile",
    viewport: "-26.061004945422773,-72.41308259017686,-20.93460261132263,-65.3208534484401",
    polygon: 2250
  },
  "atacama": {
    text: "Atacama,%20Chile",
    viewport: "-29.53510248229241,-72.9308895316009,-25.285805032174622,-66.85843826593799",
    polygon: 2249
  },
  "coquimbo": {
    text: "Coquimbo,%20Chile",
    viewport: "-32.28246464382669,-73.15598649961944,-29.037289362911793,-68.3706980962963",
    polygon: 2248
  },
  "valparaiso": {
    text: "Valpara%C3%ADso,%20Chile",
    viewport: "-33.95573443839169,-72.3766611094592,-32.02063000327058,-69.45070207920313",
    polygon: 2247
  },
  "metropolitana": {
    text: "Regi%C3%B3n%20Metropolitana%20De%20Santiago,%20Chile",
    viewport: "-34.290931418747846,-71.78441680535758,-32.92240654382509,-69.70051550731733",
    polygon: 2240
  },
  "bernardo-ohiggins": {
    text: "Libertador%20General%20Bernardo%20O%27Higgins,%20Chile",
    viewport: "-35.093296657238646,-72.05727530830944,-33.76118722597266,-70.00912418992979",
    polygon: 2246
  },
  "maule": {
    text: "Maule,%20Chile",
    viewport: "-36.543598181111896,-72.99825474177219,-34.686490799511915,-70.10098993183031",
    polygon: 2245
  },
  "biobio": {
    text: "Biob%C3%ADo,%20Chile",
    viewport: "-38.48948258905056,-73.96933816960923,-36.44291882984092,-70.69903714565586",
    polygon: 2252
  },
  "nuble": {
    text: "%C3%91uble,%20Chile",
    viewport: "-37.197787750704364,-72.88832838018257,-36.005354789992104,-71.00460191521279",
    polygon: 2253
  },
  "araucania": {
    text: "La%20Araucan%C3%ADa,%20Chile",
    viewport: "-39.63716894679009,-73.84166846755615,-37.58172761184095,-70.50548243343518",
    polygon: 2244
  },
  "los-rios": {
    text: "Los%20R%C3%ADos,%20Chile",
    viewport: "-40.68114186910244,-73.8120999187665,-39.287949512260994,-71.50609645799352",
    polygon: 2239
  },
  "los-lagos": {
    text: "Los%20Lagos,%20Chile",
    viewport: "-44.06706333720235,-76.48524894518306,-40.23881316169673,-69.9334261816725",
    polygon: 2243
  },
  "aysen": {
    text: "Ays%C3%A9n%20Del%20General%20Carlos%20Ib%C3%A1%C3%B1ez%20Del%20Campo,%20Chile",
    viewport: "-49.158333331818,-78.45052897670357,-43.63915173436565,-68.28875346942299",
    polygon: 2242
  },
  "magallanes": {
    text: "Magallanes%20Y%20De%20La%20Ant%C3%A1rtica%20Chilena,%20Chile",
    viewport: "-55.91497724790314,-78.65695091533102,-48.59549667982945,-63.448412983093576",
    polygon: 2241
  }
};

function OffersContent() {
  const searchParams = useSearchParams();

  // Parámetros numéricos e iniciales leídos de la URL
  const maxPriceParam = parseInt(searchParams.get("maxPrice") || "0");
  const maxUFParam = parseInt(searchParams.get("maxUF") || "0");
  const creditParam = parseInt(searchParams.get("credit") || "0");
  const originParam = searchParams.get("origin") || "";
  const regionParam = searchParams.get("region") || "";
  const propertyTypeParam = searchParams.get("propertyType") || "";

  // Locks de origen
  const isLocked = originParam === "ds19" || originParam === "ds1t2" || originParam === "ds1t3" || originParam === "ds1t4";
  const forceNewOnly = originParam === "ds19";

  // Estados del Formulario
  const [region, setRegion] = useState(regionParam && REGION_MAP[regionParam] ? regionParam : "metropolitana");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [propertyCondition, setPropertyCondition] = useState<"nuevas" | "usadas" | "ambas">(
    forceNewOnly ? "nuevas" : "nuevas"
  );
  const [propertyType, setPropertyType] = useState(
    propertyTypeParam === "depto" || propertyTypeParam === "departamento"
      ? "departamento"
      : propertyTypeParam === "casa"
        ? "casa"
        : "ambos"
  );

  // Links generados
  const [links, setLinks] = useState<any>(null);

  // Ejecutar generación automática al cargar con los parámetros de la URL
  useEffect(() => {
    if (maxPriceParam > 0) {
      generateLinks();
    }
  }, [maxPriceParam]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateLinks();
  };

  const generateLinks = () => {
    if (!REGION_MAP[region]) return;

    const vAdults = parseInt(adults) || 1;
    const vChildren = parseInt(children) || 0;
    const totalPeople = vAdults + vChildren;

    // Cálculo de habitaciones
    const bedrooms = Math.min(4, Math.max(1, Math.ceil(totalPeople / 2)));

    // Rango de habitaciones para Enlace Inmobiliario
    let bedroomOptions: number[] = [];
    if (totalPeople <= 2) bedroomOptions = [1, 2, 3, 4];
    else if (totalPeople <= 4) bedroomOptions = [2, 3, 4];
    else if (totalPeople <= 6) bedroomOptions = [3, 4];
    else bedroomOptions = [4];

    const bedroomSlug = bedroomOptions.join("-") + "-dormitorios";

    const { tt, pi } = REGION_MAP[region];
    const { text, viewport, polygon } = TOCTOC_PARAMS[region] || TOCTOC_PARAMS["metropolitana"];

    // 1. URL TOC TOC
    const ttState = propertyCondition === "nuevas" ? "&estado=1" : propertyCondition === "usadas" ? "&estado=0" : "&estado=2";
    const ttPropType = propertyType === "casa" ? "casa" : propertyType === "departamento" ? "departamento" : "departamento-casa";
    const ttMoneda = maxUFParam > 0 ? "2" : "1";
    const ttPrecioHasta = maxUFParam > 0 ? maxUFParam : maxPriceParam;
    const ttPrecioDesde = maxUFParam > 0 ? "0" : "25000000";
    const toctocUrl = `https://www.toctoc.com/resultados/mapa/compra/${ttPropType}/${tt}/?moneda=${ttMoneda}&precioDesde=${ttPrecioDesde}&precioHasta=${ttPrecioHasta}&dormitoriosDesde=${bedrooms}&banosDesde=1${ttState}&disponibilidadEntrega=&numeroDeDiasTocToc=0&superficieDesdeUtil=0&superficieHastaUtil=0&superficieDesdeConstruida=0&superficieHastaConstruida=0&superficieDesdeTerraza=0&superficieHastaTerraza=0&superficieDesdeTerreno=0&superficieHastaTerreno=0&ordenarPor=0&pagina=1&paginaInterna=1&zoom=15&idZonaHomogenea=0&atributos=&texto=${text}&viewport=${viewport}&idPoligono=${polygon}&publicador=0&temporalidad=0`;

    // 2. URL Portal Inmobiliario
    const conditionPath = propertyCondition === "nuevas" ? "/proyectos" : propertyCondition === "usadas" ? "/propiedades-usadas" : "";
    const portalDeptoUrl = `https://www.portalinmobiliario.com/venta/departamento${conditionPath}/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPriceParam}CLP`;
    const portalCasaUrl = `https://www.portalinmobiliario.com/venta/casa${conditionPath}/${pi}/_DisplayType_M_PriceRange_25000000CLP-${maxPriceParam}CLP_BEDROOMS_${bedrooms}-*`;

    // 3. URL Enlace Inmobiliario
    let enlaceUrlNuevas = "";
    let enlaceUrlUsadas = "";
    if (ENLACE_MAP[region]) {
      const base = ENLACE_MAP[region];
      const uf = maxUFParam || 2200;
      const propTypeSegment = propertyType === "ambos" ? "todas" : propertyType;

      let subsidySegment = "";
      if (originParam === "ds1t2") {
        subsidySegment = "subsidio-ds1-tramo-2+subsidio-ds1-hasta-3000-uf";
      } else if (originParam === "ds1t3") {
        subsidySegment = "subsidio-ds1-tramo-3+subsidio-ds1-hasta-3000-uf";
      } else if (originParam === "ds1t1") {
        subsidySegment = "subsidio-ds1-tramo-1+subsidio-ds1-hasta-3000-uf";
      } else if (originParam === "ds19") {
        subsidySegment = "subsidio-ds19";
      } else if (originParam === "no-subsidy") {
        if (creditParam >= 1000 && creditParam <= 2000 && maxUFParam <= 2800) {
          subsidySegment = "subsidio-ds19";
        } else {
          subsidySegment = "subsidios";
        }
      }

      if (originParam === "ds1t4") {
        enlaceUrlNuevas = `https://www.enlaceinmobiliario.cl/${base}/propiedades/${propTypeSegment}/SD0-SH0/UFD0-UFH${uf}/${bedroomSlug}/banos/entrega/disponibilidad/nuevos/`;
      } else if (subsidySegment) {
        enlaceUrlNuevas = `https://www.enlaceinmobiliario.cl/${base}/propiedades/${propTypeSegment}/SD0-SH0/UFD0-UFH${uf}/${bedroomSlug}/${subsidySegment}/banos/entrega/disponibilidad/nuevos/`;
      }

      enlaceUrlUsadas = `https://www.enlaceinmobiliario.cl/${base}/propiedades/${propTypeSegment}/SD0-SH0/UFD0-UFH${uf}/${bedroomSlug}/banos/entrega/disponibilidad/usados/`;
    }

    let ds19Url = "";
    if (ENLACE_MAP[region]) {
      const base = ENLACE_MAP[region];
      const propTypeSegment = propertyType === "ambos" ? "todas" : propertyType;
      const ufCap = maxUFParam > 0 ? maxUFParam : 2200;
      ds19Url = `https://www.enlaceinmobiliario.cl/${base}/propiedades/${propTypeSegment}/SD0-SH0/UFD0-UFH${ufCap}/${bedroomSlug}/subsidio-ds19/banos/entrega/disponibilidad/nuevos/`;
    }

    setLinks({
      toctocUrl,
      portalDeptoUrl,
      portalCasaUrl,
      enlaceUrlNuevas,
      enlaceUrlUsadas,
      ds19Url,
      bedrooms,
      totalPeople
    });
  };

  return (
    <div className="space-y-6">

      {/* FORMULARIO */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-5">

          {isLocked && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-xl text-xs leading-relaxed">
              <strong>ℹ️ Filtros fijados por simulación:</strong> La Región y el Tipo de Propiedad han sido bloqueados de acuerdo a tu simulación del subsidio **{originParam.toUpperCase()}** para asegurar la coherencia de topes de precio y financiamiento.
              {forceNewOnly && " El subsidio DS19 exige que la vivienda sea obligatoriamente nueva."}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Región de búsqueda:</label>
              <select
                disabled={isLocked}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {Object.keys(REGION_MAP).map((key) => (
                  <option key={key} value={key}>{REGION_MAP[key].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Propiedad:</label>
              <select
                disabled={isLocked}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="ambos">Casas y Departamentos</option>
                <option value="casa">Solo Casas</option>
                <option value="departamento">Solo Departamentos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adultos:</label>
              <input
                type="number"
                min="1"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Niños:</label>
              <input
                type="number"
                min="0"
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
            </div>
          </div>

          <div className="py-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">Estado de la propiedad (Enlace Inmobiliario / TocToc):</label>
            <select
              disabled={forceNewOnly}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              value={propertyCondition}
              onChange={(e) => setPropertyCondition(e.target.value as "nuevas" | "usadas" | "ambas")}
            >
              <option value="nuevas">Solo Propiedades Nuevas (Proyectos)</option>
              <option value="usadas">Solo Propiedades Usadas</option>
              {!forceNewOnly && (
                <option value="ambas">Propiedades Nuevas y Usadas (Cualquiera)</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#6b9ac4] text-white font-bold p-3.5 rounded-xl hover:bg-[#5a86ae] transition-colors shadow-sm"
          >
            Generar Filtros de Ofertas
          </button>

        </form>
      </section>

      {/* RESULTADOS / LINKS GENERADOS */}
      {links && (
        <section className="space-y-6 animate-fade-in">

          {/* Informacion de filtros */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-500">
            Filtros cargados: <strong>{links.totalPeople} personas</strong> (estimando mínimo <strong>{links.bedrooms} {links.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}</strong>) en la Región <strong>{REGION_MAP[region].label}</strong> hasta un tope de <strong>{maxUFParam} UF</strong> (~${maxPriceParam.toLocaleString("es-CL")} CLP).
          </div>

          {/* Tarjeta de Enlaces Externos */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Buscar en Portales Inmobiliarios (Filtros Pre-cargados)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <a
                href={links.toctocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50/50 transition-all block group"
              >
                <strong className="text-slate-800 text-sm block mb-1">TocToc</strong>
                <span className="text-xs text-slate-500 block">Buscar {propertyType === 'ambos' ? 'propiedades' : propertyType === 'casa' ? 'casas' : 'departamentos'} {propertyCondition === "nuevas" ? "nuevos" : propertyCondition === "usadas" ? "usados" : "usados y nuevos"} en el mapa interactivo.</span>
                <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Abrir en TocToc →</span>
              </a>

              {/* Si la condición es solo nuevas, mostramos el enlace de nuevas */}
              {propertyCondition === "nuevas" && links.enlaceUrlNuevas && (
                <a
                  href={links.enlaceUrlNuevas}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 transition-all block group"
                >
                  <strong className="text-blue-900 text-sm block mb-1">Enlace Inmobiliario (Nuevos)</strong>
                  <span className="text-xs text-slate-500 block">Proyectos nuevos filtrados con financiamiento de subsidio {originParam?.toUpperCase() || "General"}.</span>
                  <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Ver proyectos nuevos →</span>
                </a>
              )}

              {/* Si la condición es solo usadas, mostramos el enlace de usadas */}
              {propertyCondition === "usadas" && links.enlaceUrlUsadas && (
                <a
                  href={links.enlaceUrlUsadas}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 transition-all block group"
                >
                  <strong className="text-blue-900 text-sm block mb-1">Enlace Inmobiliario (Usados)</strong>
                  <span className="text-xs text-slate-500 block">Propiedades usadas filtradas según tu presupuesto.</span>
                  <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Ver propiedades usadas →</span>
                </a>
              )}

              {/* Si la condición es ambas, mostramos dos enlaces distintos */}
              {propertyCondition === "ambas" && (
                <>
                  {links.enlaceUrlNuevas && (
                    <a
                      href={links.enlaceUrlNuevas}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 transition-all block group"
                    >
                      <strong className="text-blue-900 text-sm block mb-1">Enlace Inmobiliario (Nuevos)</strong>
                      <span className="text-xs text-slate-500 block">Proyectos nuevos filtrados con financiamiento de subsidio {originParam?.toUpperCase() || "General"}.</span>
                      <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Ver proyectos nuevos →</span>
                    </a>
                  )}
                  {links.enlaceUrlUsadas && (
                    <a
                      href={links.enlaceUrlUsadas}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 hover:bg-blue-50/40 transition-all block group"
                    >
                      <strong className="text-blue-900 text-sm block mb-1">Enlace Inmobiliario (Usados)</strong>
                      <span className="text-xs text-slate-500 block">Propiedades usadas filtradas según tu presupuesto.</span>
                      <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Ver propiedades usadas →</span>
                    </a>
                  )}
                </>
              )}

              {propertyType !== 'casa' && (
                <a
                  href={links.portalDeptoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50/50 transition-all block group"
                >
                  <strong className="text-slate-800 text-sm block mb-1">PortalInmobiliario - Deptos</strong>
                  <span className="text-xs text-slate-500 block">Buscar departamentos según tu presupuesto en PortalInmobiliario.</span>
                  <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Abrir PortalInmobiliario →</span>
                </a>
              )}

              {propertyType !== 'departamento' && (
                <a
                  href={links.portalCasaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#6b9ac4] hover:bg-slate-50/50 transition-all block group"
                >
                  <strong className="text-slate-800 text-sm block mb-1">PortalInmobiliario - Casas</strong>
                  <span className="text-xs text-slate-500 block">Buscar casas con mínimo {links.bedrooms} dorms.</span>
                  <span className="text-xs text-blue-600 font-semibold mt-3 block group-hover:underline">Abrir PortalInmobiliario →</span>
                </a>
              )}

            </div>
          </div>

          {/* Bloque especial DS19 */}
          {originParam !== "ds1t4" && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-950 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase block mb-1">Financiamiento Integrado</span>
                <h3 className="text-lg font-bold">Proyectos DS19 (Integración Social)</h3>
                <p className="text-slate-300 text-xs leading-relaxed mt-2">
                  Los proyectos **DS19** permiten a familias adquirir viviendas nuevas con o sin subsidio habitacional previo.
                  Si ya posees un subsidio DS1 (Tramo 1, 2 o 3) o DS49, puedes **homologarlo directamente** con la inmobiliaria de cualquiera de estos proyectos sin volver a postular en el Serviu. Si no tienes subsidio, puedes comprar mediante crédito hipotecario integrando beneficios si calificas en tu RSH (hasta el 90%).
                </p>
              </div>

              {links.ds19Url && (
                <a
                  href={links.ds19Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full md:w-auto px-5 py-3 bg-[#87c0a3] hover:bg-[#76b092] text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Buscar Proyectos DS19 en {REGION_MAP[region].label} →
                </a>
              )}
            </div>
          )}

          {/* Bloque especial DS49 (Advertencia de Ampliaciones Irregulares) */}
          {(originParam === 'ds49' || maxUFParam <= 1400) && (
            <div className="bg-amber-50 border-2 border-amber-200 text-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                <span className="text-xl">⚠️</span>
                <h4 className="font-bold text-sm">Información Crítica para Compra de Usadas (Subsidio DS49)</h4>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <p>
                  <strong>1. Cuidado con Ampliaciones Irregulares:</strong> Al adquirir una vivienda de segundo uso (usada) con subsidio DS49, el tasador designado por el Serviu inspeccionará físicamente la propiedad. Si la vivienda tiene una ampliación o modificación que **no cuente con su respectiva Recepción Final de la DOM** (Dirección de Obras Municipales), **el subsidio será denegado y la operación se caerá**. Exige al vendedor el plano municipal y el certificado de Recepción Final al día antes de pagar tasaciones o firmar promesas.
                </p>
                <p>
                  <strong>2. Aceptación del Subsidio:</strong> Dado que el cobro y pago efectivo del subsidio DS49 por parte del Serviu puede demorar de 3 a 6 meses desde la escrituración, debes confirmar explícitamente con el propietario o corredor si aceptan este medio de pago, ya que algunos exigen venta con crédito bancario tradicional de pago rápido.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.portalinmobiliario.com/venta/casa-departamento/${REGION_MAP[region].pi}/_DisplayType_M_PriceRange_20000000CLP-${maxPriceParam}CLP`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
                >
                  Buscar viviendas baratas en {REGION_MAP[region].label} →
                </a>
              </div>
            </div>
          )}

        </section>
      )}

    </div>
  );
}

export default function RealEstateOffersPage() {
  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 font-sans pb-12">
      <header className="bg-gradient-to-r from-[#6b9ac4] to-[#87c0a3] text-white px-6 py-10 border-b-4 border-white shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ofertas Inmobiliarias</h1>
            <p className="text-blue-50 text-xs md:text-sm opacity-90 mt-1">
              Filtra y explora las viviendas que se ajustan exactamente a tu presupuesto financiero.
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-xs font-bold bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-all"
          >
            ← Volver
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Suspense fallback={<p className="text-center text-slate-500">Cargando filtros...</p>}>
          <OffersContent />
        </Suspense>
      </main>
    </div>
  );
}

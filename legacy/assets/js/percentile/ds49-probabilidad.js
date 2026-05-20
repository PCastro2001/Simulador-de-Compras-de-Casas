// 1. DICCIONARIO DE PUNTAJES DE CORTE (DS49)
const PUNTAJES_CORTE_DS49 = {
    arica: 980,
    tarapaca: 940,
    antofagasta: 940,
    atacama: 970,
    coquimbo: 940,
    valparaiso: 900,
    ohiggins: 1000,
    maule: 990,
    nuble: 980,
    biobio: 980,
    araucania: 890,
    rios: 850,
    lagos: 840,
    aysen: 750,
    magallanes: 653,
    metropolitana: 1000
};

document.getElementById('ds49-prob-form').addEventListener('submit', (event) => {
    event.preventDefault();

    // Recoger variables
    const region = document.getElementById('region').value;
    const integrantesExtra = parseInt(document.getElementById('integrantes-extra').value) || 0;
    const menores5 = parseInt(document.getElementById('menores-5').value) || 0;
    const menores18 = parseInt(document.getElementById('menores-18').value) || 0;
    const adultosMayores = parseInt(document.getElementById('adultos-mayores').value) || 0;
    
    const dormitorios = parseInt(document.getElementById('dormitorios').value) || 1;
    const viviendaPrecaria = document.getElementById('vivienda-precaria').value === 'si';
    const aguaPrecaria = document.getElementById('agua-precaria').value === 'si';
    const banoPrecario = document.getElementById('bano-precario').value === 'si';

    const postulacionesFallidas = parseInt(document.getElementById('postulaciones-fallidas').value) || 0;
    const mesesLibreta = parseInt(document.getElementById('meses-libreta').value) || 0;
    const saldoConstante = document.getElementById('saldo-constante').value === 'si';

    const discapacidad = parseInt(document.getElementById('discapacidad').value) || 0;
    const monoparental = document.getElementById('monoparental').value === 'si';
    const victimaPolitica = document.getElementById('victima-politica').value === 'si';
    const profesionMinvu = document.getElementById('profesion-minvu').value;
    const servicioMilitar = parseInt(document.getElementById('servicio-militar').value) || 0;
    const bomberos = parseInt(document.getElementById('bomberos').value) || 0;
    // --- FACTOR A: NÚCLEO FAMILIAR ---
    let factorA = 0;
    
    factorA += (integrantesExtra * 50); // 50 pts por integrante (excluye al postulante)
    factorA += (menores5 * 50);         // 50 pts adicionales por menor hasta 5 años
    factorA += (menores18 * 40);        // 40 pts por menor entre 6 y 18 años
    factorA += (adultosMayores * 100);  // 100 pts por cada adulto mayor (incluye al postulante)
    factorA += (bomberos * 40);         // 40 pts por cada bombero activo
    
    // Asignación de puntaje por profesión/Gendarmería (40 pts fijos si seleccionó alguna)
    if (profesionMinvu !== 'ninguna') {
        factorA += 40;
    }
    
    // Servicio Militar (20 pts por persona)
    factorA += (servicioMilitar * 20);
    
    // REGLA DE ORO DEL MINVU: El tope máximo es 600 puntos para este factor
    if (factorA > 600) {
        factorA = 600;
    }

    // --- FACTOR B: VULNERABILIDAD HABITACIONAL ---
    let factorB = 0;
    const totalPersonas = integrantesExtra + 1;
    const indiceHacinamiento = totalPersonas / dormitorios;
    
    if (indiceHacinamiento >= 5) factorB += 280;
    else if (indiceHacinamiento >= 2.5) factorB += 140;

    if (viviendaPrecaria) factorB += 140;
    if (aguaPrecaria) factorB += 30;
    if (banoPrecario) factorB += 30;

    // --- FACTOR C: ANTIGÜEDAD POSTULACIÓN ---
    let factorC = postulacionesFallidas * 40;
    if (factorC > 160) factorC = 160;

    // --- FACTOR D: AHORRO ---
    let factorD = 0;
    let ptosMeses = mesesLibreta * 1;
    if (ptosMeses > 40) ptosMeses = 40;
    factorD += ptosMeses;
    if (saldoConstante) factorD += 10;

    // Sumatoria Base (A + B + C + D)
    const sumatoriaBase = factorA + factorB + factorC + factorD;

    // --- FACTOR E: CONDICIONES ESPECIALES Y BONIFICACIONES ---
    let factorE = 0;
    factorE += (discapacidad * 300);
    if (victimaPolitica) factorE += 600;
    if (monoparental) factorE += 150;

    let bonificacion = 0;
    // Si hay discapacidad O victima política, se suma el 50% de la Sumatoria Base
    if (discapacidad > 0 || victimaPolitica) {
        bonificacion = sumatoriaBase * 0.5;
    }

    // PUNTAJE TOTAL FINAL
    const puntajeTotal = sumatoriaBase + factorE + bonificacion;
    const puntajeCorte = PUNTAJES_CORTE_DS49[region];

    // --- MOSTRAR RESULTADOS ---
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';

    if (puntajeTotal >= puntajeCorte) {
        // MENSAJE DE ÉXITO
        resultsDiv.innerHTML = `
            <h2 style="color: #4CAF50;">¡Tus probabilidades son altísimas! 🎉</h2>
            <p>El corte histórico en tu región es de <strong>${puntajeCorte} puntos</strong>.</p>
            <p>Según tu situación de vulnerabilidad, alcanzas un total de <strong>${puntajeTotal.toFixed(0)} puntos</strong>.</p>
            <hr>
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center;">
                <p style="font-size: 1.1em; color: #2e7d32;">Estás en una posición excelente para adjudicarte el DS49. Asegúrate de tener las 10 UF mínimas en tu libreta y mantener tu Registro Social de Hogares actualizado al 40%.</p>
            </div>
        `;
    } else {
        // MENSAJE OPTIMISTA CON DERIVACIÓN AL DS1
        const faltan = puntajeCorte - puntajeTotal;
        resultsDiv.innerHTML = `
            <h2>Resultado de tu Análisis</h2>
            <p>El corte histórico en tu región está bastante exigente: <strong>${puntajeCorte} puntos</strong>.</p>
            <p>Tu puntaje calculado es de <strong>${puntajeTotal.toFixed(0)} puntos</strong>. Te faltan aproximadamente ${faltan.toFixed(0)} puntos para asegurar un cupo.</p>
            <hr>
            <div style="background-color: #fff3e0; padding: 15px; border-radius: 10px; text-align: center;">
                <h3 style="color: #e65100; margin-bottom: 10px;">¡No te desanimes, hay una estrategia mejor! 💡</h3>
                <p style="color: #5a3e36;">El DS49 es muy competitivo y premia la vulnerabilidad extrema. Como tú tienes capacidad de ahorro, <strong>tu mejor opción es el Subsidio DS1 Tramo 1</strong>.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">En el DS1, los puntos que te faltan los puedes "comprar" ahorrando más dinero. ¡Puedes asegurar tu casa tú mismo sin depender de la suerte!</p>
                <button onclick="window.location.href='ds1t1.html'" style="margin-top: 15px; background-color: #ff8a65; padding: 10px 20px; border: none; border-radius: 5px; color: white; cursor: pointer; font-weight: bold;">
                    Calcular mi Ahorro Seguro en DS1
                </button>
            </div>
        `;
    }

    resultsDiv.scrollIntoView({ behavior: 'smooth' });
});
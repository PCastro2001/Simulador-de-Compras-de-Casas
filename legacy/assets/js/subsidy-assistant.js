// Elementos del DOM
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const optionsDiv = document.getElementById('options');
const resultContainer = document.getElementById('result');
const resultText = document.getElementById('result-text');

// Estado del asistente
let currentStep = 1;

// Función para mostrar una pregunta
function showQuestion(text, options) {
    questionText.textContent = text;
    optionsDiv.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.onclick = option.onClick;
        optionsDiv.appendChild(button);
    });
    questionContainer.style.display = 'block';
    resultContainer.style.display = 'none';
}

// Función para mostrar el resultado final
function showResult(text) {
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    resultText.textContent = text;
}

// Función para reiniciar el asistente
function restartAssistant() {
    currentStep = 1;
    startAssistant();
}

// Iniciar el asistente
function startAssistant() {
    currentStep = 1;
    showQuestion('¿Posee casa propia?', [
        { text: 'Sí', onClick: () => handleOwnsHouse(true) },
        { text: 'No', onClick: () => handleOwnsHouse(false) }
    ]);
}

// Paso 1: ¿Posee casa propia?
function handleOwnsHouse(ownsHouse) {
    if (ownsHouse) {
        currentStep = 2;
        showQuestion('¿La casa es comprada en el Serviu y/o es vivienda social?', [
            { text: 'Sí', onClick: () => showResult('Subsidio DS27') },
            { text: 'No', onClick: () => showResult('No se puede postular a ningún subsidio') }
        ]);
    } else {
        currentStep = 3;
        showQuestion('¿Posee terreno?', [
            { text: 'Sí', onClick: () => handleOwnsLand(true) },
            { text: 'No', onClick: () => handleOwnsLand(false) }
        ]);
    }
}

// Paso 2: ¿Posee terreno?
function handleOwnsLand(ownsLand) {
    if (ownsLand) {
        currentStep = 4;
        showQuestion('¿Colectivo o Individual?', [
            { text: 'Colectivo', onClick: () => handleLandType('colectivo') },
            { text: 'Individual', onClick: () => handleLandType('individual') }
        ]);
    } else {
        currentStep = 5;
        showQuestion('¿Posee capacidad de ahorro?', [
            { 
    text: 'Sí', 
    onClick: () => {
        // 1. Muestra el mensaje primero
        showResult('Te recomendamos usar el Simulador de Percentiles para determinar a qué subsidios puedes optar.\n\n⏳ Redirigiendo en 5 segundos...');
        
        // 2. Espera 5 segundos (5000 ms) y luego cambia de página
        setTimeout(() => {
            window.location.href = 'percentile.html';
        }, 5000);
    } 
},
{ 
    text: 'No', 
    onClick: () => {
        // 1. Muestra el mensaje primero
        showResult('Tu mejor opción podría ser el Subsidio DS52 (Arriendo).\n\n⏳ Redirigiendo a los detalles en 5 segundos...');
        
        // 2. Espera 5 segundos (5000 ms) y luego cambia de página
        // (Asumí 5 segundos en vez de 5 minutos, porque 5 min es mucho tiempo esperando en una web)
        setTimeout(() => {
            window.location.href = 'percentile/ds52.html';
        }, 5000);
    } 
}
        ]);
    }
}

// Paso 3: ¿Colectivo o Individual?
function handleLandType(type) {
    if (type === 'colectivo') {
        currentStep = 6;
        showQuestion('¿Urbano o Rural?', [
            { text: 'Urbano', onClick: () => showResult('Subsidio DS49 (Pequeños Condominios)') },
            { text: 'Rural', onClick: () => showResult('Subsidio DS49 (Nuevos Terrenos)') }
        ]);
    } else {
        currentStep = 7;
        showQuestion('¿Percentil?', [
            { text: 'Entre 40% y 90%', onClick: () => showResult('Tienes 2 Subsidios de Construcción de Vivienda: DS1 Tramo 2 y DS1 Tramo 3') },
            { text: 'Menor a 40%', onClick: () => handlePercentileLessThan40() }
        ]);
    }
}

// Paso 4: Percentil < 40%
function handlePercentileLessThan40() {
    currentStep = 8;
    showQuestion('¿Posee casa en el terreno?', [
        { text: 'Sí', onClick: () => showResult('Subsidio DS49 (Densificación Predial)') },
        { text: 'No', onClick: () => showResult('Subsidio DS49 (Construcción en Sitio Propio)') }
    ]);
}

// Iniciar el asistente al cargar la página
document.addEventListener('DOMContentLoaded', startAssistant);
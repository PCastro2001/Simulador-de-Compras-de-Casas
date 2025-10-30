// Función para obtener el valor de la UF desde la API
async function fetchUFValue() {
    try {
        const response = await fetch('https://mindicador.cl/api/uf');
        const data = await response.json();
        const ufValue = data.serie[0].valor;
        document.getElementById('uf-value').value = ufValue.toFixed(2);
        return ufValue;
    } catch (error) {
        console.error('Error al obtener el valor de la UF:', error);
        return 37396.77; // Valor por defecto
    }
}

// Cargar UF al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchUFValue();
});

// Convertir subsidio CLP a UF automáticamente
function convertSubsidyToUF() {
    const ufValue = parseFloat(document.getElementById('uf-value').value) || 37396.77;
    const subsidyCLP = parseFloat(document.getElementById('subsidy-clp').value);
    if (!isNaN(subsidyCLP)) {
        document.getElementById('subsidy-uf').value = (subsidyCLP / ufValue).toFixed(2);
    }
}

// Manejar el formulario
document.getElementById('ds19-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const ufValue = parseFloat(document.getElementById('uf-value').value) || await fetchUFValue();
    const propertyValueUF = parseFloat(document.getElementById('property-value').value);
    const savingsUF = parseFloat(document.getElementById('savings').value);
    const subsidyUF = parseFloat(document.getElementById('subsidy-uf').value);

    // Calcular crédito hipotecario
    const loanAmount = propertyValueUF - savingsUF - subsidyUF;
    if (loanAmount <= 0) {
        document.getElementById('results').innerHTML = `<p style="color: #d9534f;">El crédito hipotecario no puede ser cero o negativo. Revisa los valores ingresados.</p>`;
        return;
    }

    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const loanTerm = parseInt(document.getElementById('loan-term').value);
    const isYoungSingle = document.getElementById('is-young-single').checked;

    // Calcular dividendo mensual
    const monthlyRate = interestRate / 12;
    const totalPayments = loanTerm * 12;
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
    const monthlyPaymentCLP = monthlyPayment * ufValue;

    // Renta mínima (3x para jóvenes solteros, 4x para familias)
    const incomeMultiplier = isYoungSingle ? 3 : 4;
    const minimumIncome = monthlyPayment * incomeMultiplier;
    const minimumIncomeCLP = minimumIncome * ufValue;

    // Formatear valores
    const formatCurrency = (value) => value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

    // Mostrar resultados
    document.getElementById('results').innerHTML = `
        <p>Valor de la vivienda: ${propertyValueUF.toFixed(2)} UF (${formatCurrency(propertyValueUF * ufValue)})</p>
        <p>Ahorro ingresado: ${savingsUF.toFixed(2)} UF (${formatCurrency(savingsUF * ufValue)})</p>
        <p>Subsidio aplicado: ${subsidyUF.toFixed(2)} UF (${formatCurrency(subsidyUF * ufValue)})</p>
        <p>Crédito hipotecario estimado: ${loanAmount.toFixed(2)} UF (${formatCurrency(loanAmount * ufValue)})</p>
        <p>Dividendo mensual estimado: ${monthlyPayment.toFixed(2)} UF (${formatCurrency(monthlyPaymentCLP)})</p>
        <p>Renta mínima requerida (aprox. ${incomeMultiplier}x el dividendo): ${minimumIncome.toFixed(2)} UF (${formatCurrency(minimumIncomeCLP)})</p>
    `;
});

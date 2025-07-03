// Página de ofertas inmobiliarias
// Se calcula la cantidad mínima de habitaciones asumiendo
// 1 a 2 personas por dormitorio.

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const maxPrice = parseInt(params.get('maxPrice'), 10) || 0;
    const form = document.getElementById('offers-form');
    const results = document.getElementById('links-result');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const region = document.getElementById('region').value.trim();
        const adults = parseInt(document.getElementById('adults').value, 10);
        const children = parseInt(document.getElementById('children').value, 10);
        if (!region || isNaN(adults) || isNaN(children)) return;

        const bedrooms = Math.ceil((adults + children) / 2);
        const toctoc = `https://www.toctoc.com/resultados/mapa/compra/departamento/${region}/?moneda=1&precioDesde=30000000&precioHasta=${maxPrice}&dormitoriosDesde=${bedrooms}&banosDesde=1`;
        const portal = `https://www.portalinmobiliario.com/venta/departamento/${region}/_PriceRange_30000000CLP-${maxPrice}CLP_BEDROOMS_${bedrooms}-*_FULL*BATHROOMS_1-*`;

        results.innerHTML = `
            <p><a href="${toctoc}" target="_blank">Buscar en TocToc</a></p>
            <p><a href="${portal}" target="_blank">Buscar en Portal Inmobiliario</a></p>
        `;
    });
});

// Página de ofertas inmobiliarias
// Se calcula la cantidad mínima de habitaciones asumiendo
// 1 a 2 personas por dormitorio.

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const maxPrice = parseInt(params.get('maxPrice'), 10) || 0;
    const form = document.getElementById('offers-form');
    const results = document.getElementById('links-result');

    // Mapear slug de región para TocToc y Portal Inmobiliario
    const regionMap = {
        'arica-y-parinacota': { tt: 'arica-y-parinacota', pi: 'arica-y-parinacota' },
        'tarapaca': { tt: 'tarapaca', pi: 'tarapaca' },
        'antofagasta': { tt: 'antofagasta', pi: 'antofagasta' },
        'atacama': { tt: 'atacama', pi: 'atacama' },
        'coquimbo': { tt: 'coquimbo', pi: 'coquimbo' },
        'valparaiso': { tt: 'valparaiso', pi: 'valparaiso' },
        'metropolitana': { tt: 'metropolitana', pi: 'metropolitana' },
        'bernardo-ohiggins': { tt: 'bernardo-ohiggins', pi: 'bernardo-ohiggins' },
        'maule': { tt: 'maule', pi: 'maule' },
        'nuble': { tt: 'nuble', pi: 'nuble' },
        'araucania': { tt: 'araucania', pi: 'la-araucania' },
        'los-rios': { tt: 'los-rios', pi: 'de-los-rios' },
        'los-lagos': { tt: 'los-lagos', pi: 'los-lagos' },
        'aysen': { tt: 'aysen', pi: 'aysen' },
        'magallanes': { tt: 'magallanes', pi: 'magallanes-y-antartica-chilena' }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const regionKey = document.getElementById('region').value;
        const adults = parseInt(document.getElementById('adults').value, 10);
        const children = parseInt(document.getElementById('children').value, 10);
        if (!regionMap[regionKey] || isNaN(adults) || isNaN(children)) return;

        const { tt, pi } = regionMap[regionKey];
        const bedrooms = Math.ceil((adults + children) / 2);

        const toctoc = `https://www.toctoc.com/resultados/mapa/compra/departamento/${tt}/?moneda=1&precioDesde=30000000&precioHasta=${maxPrice}&dormitoriosDesde=${bedrooms}&banosDesde=1`;
        const portalDepto = `https://www.portalinmobiliario.com/venta/departamento/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPrice}CLP`;
        const portalCasa = `https://www.portalinmobiliario.com/venta/casa/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPrice}CLP`;

        results.innerHTML = `
            <p><a href="${toctoc}" target="_blank">Buscar departamentos en TocToc</a></p>
            <p><a href="${portalDepto}" target="_blank">Departamentos en Portal Inmobiliario</a></p>
            <p><a href="${portalCasa}" target="_blank">Casas en Portal Inmobiliario</a></p>
        `;
    });
});

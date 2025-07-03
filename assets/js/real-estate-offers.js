// Página de ofertas inmobiliarias

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const maxPrice = parseInt(params.get('maxPrice'), 10) || 0;
    const form = document.getElementById('offers-form');
    const results = document.getElementById('links-result');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const adults = parseInt(document.getElementById('adults').value, 10);
        const children = parseInt(document.getElementById('children').value, 10);
        if (!region || isNaN(adults) || isNaN(children)) return;

        const bedrooms = Math.ceil((adults + children) / 2);
        const toctoc = `https://www.toctoc.com/resultados/mapa/compra/departamento-casa//${region}/?moneda=1&precioDesde=30000000&precioHasta=${maxPrice}&dormitoriosDesde=${bedrooms}&banosDesde=1&banosHasta=0&estado=0&disponibilidadEntrega=&numeroDeDiasTocToc=0&superficieDesdeUtil=0&superficieHastaUtil=0&superficieDesdeConstruida=0&superficieHastaConstruida=0&superficieDesdeTerraza=0&superficieHastaTerraza=0&superficieDesdeTerreno=0&superficieHastaTerreno=0&ordenarPor=0&pagina=1&paginaInterna=1&zoom=5.614608763715405&idZonaHomogenea=0&atributos=&texto=Región%20Metropolitana%20De%20Santiago,%20Chile&viewport=&idPoligono=2240&publicador=0&temporalidad=0`;
        const portal = `https://www.portalinmobiliario.com/venta/departamento/_PriceRange_30000000CLP-${maxPrice}CLP_BEDROOMS_${bedrooms}-*_FULL*BATHROOMS_1-*`;

        results.innerHTML = `
            <p><a href="${toctoc}" target="_blank">Buscar en TocToc</a></p>
            <p><a href="${portal}" target="_blank">Buscar en Portal Inmobiliario</a></p>
        `;
    });
});

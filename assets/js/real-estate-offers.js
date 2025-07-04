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
        'biobio': { tt: 'biobio', pi: 'biobio' },
        'nuble': { tt: 'nuble', pi: 'nuble' },
        'araucania': { tt: 'araucania', pi: 'la-araucania' },
        'los-rios': { tt: 'los-rios', pi: 'de-los-rios' },
        'los-lagos': { tt: 'los-lagos', pi: 'los-lagos' },
        'aysen': { tt: 'aysen', pi: 'aysen' },
        'magallanes': { tt: 'magallanes', pi: 'magallanes-y-antartica-chilena' }
    };

// Parámetros de texto y viewport específicos por región para TocToc
    const toctocParams = {
        'arica-y-parinacota': {
            text: 'Arica%20Y%20Parinacota,%20Chile',
            viewport: '-19.22999131394741,-70.80341585889809,-17.497775945103612,-68.48870372305349',
            polygon: 2238
        },
        'tarapaca': {
            text: 'Tarapac%C3%A1,%20Chile',
            viewport: '-21.630609919514427,-71.165270613956,-18.93912523754156,-67.52591670768183',
            polygon: 2251
        },
        'antofagasta': {
            text: 'Antofagasta,%20Chile',
            viewport: '-26.061004945422773,-72.41308259017686,-20.93460261132263,-65.3208534484401',
            polygon: 2250
        },
        'atacama': {
            text: 'Atacama,%20Chile',
            viewport: '-29.53510248229241,-72.9308895316009,-25.285805032174622,-66.85843826593799',
            polygon: 2249
        },
        'coquimbo': {
            text: 'Coquimbo,%20Chile',
            viewport: '-32.28246464382669,-73.15598649961944,-29.037289362911793,-68.3706980962963',
            polygon: 2248
        },
        'valparaiso': {
            text: 'Valpara%C3%ADso,%20Chile',
            viewport: '-33.95573443839169,-72.3766611094592,-32.02063000327058,-69.45070207920313',
            polygon: 2247
        },
        'metropolitana': {
            text: 'Regi%C3%B3n%20Metropolitana%20De%20Santiago,%20Chile',
            viewport: '-34.290931418747846,-71.78441680535758,-32.92240654382509,-69.70051550731733',
            polygon: 2240
        },
        'bernardo-ohiggins': {
            text: 'Libertador%20General%20Bernardo%20O%27Higgins,%20Chile',
            viewport: '-35.093296657238646,-72.05727530830944,-33.76118722597266,-70.00912418992979',
            polygon: 2246
        },
        'maule': {
            text: 'Maule,%20Chile',
            viewport: '-36.543598181111896,-72.99825474177219,-34.686490799511915,-70.10098993183031',
            polygon: 2245
        },
        'biobio': {
            text: 'Biob%C3%ADo,%20Chile',
            viewport: '-38.48948258905056,-73.96933816960923,-36.44291882984092,-70.69903714565586',
            polygon: 2252
        },
        'nuble': {
            text: '%C3%91uble,%20Chile',
            viewport: '-37.197787750704364,-72.88832838018257,-36.005354789992104,-71.00460191521279',
            polygon: 2253
        },
        'araucania': {
            text: 'La%20Araucan%C3%ADa,%20Chile',
            viewport: '-39.63716894679009,-73.84166846755615,-37.58172761184095,-70.50548243343518',
            polygon: 2244
        },
        'los-rios': {
            text: 'Los%20R%C3%ADos,%20Chile',
            viewport: '-40.68114186910244,-73.8120999187665,-39.287949512260994,-71.50609645799352',
            polygon: 2239
        },
        'los-lagos': {
            text: 'Los%20Lagos,%20Chile',
            viewport: '-44.06706333720235,-76.48524894518306,-40.23881316169673,-69.9334261816725',
            polygon: 2243
        },
        'aysen': {
            text: 'Ays%C3%A9n%20Del%20General%20Carlos%20Ib%C3%A1%C3%B1ez%20Del%20Campo,%20Chile',
            viewport: '-49.158333331818,-78.45052897670357,-43.63915173436565,-68.28875346942299',
            polygon: 2242
        },
        'magallanes': {
            text: 'Magallanes%20Y%20De%20La%20Ant%C3%A1rtica%20Chilena,%20Chile',
            viewport: '-55.91497724790314,-78.65695091533102,-48.59549667982945,-63.448412983093576',
            polygon: 2241
        }
    };

    const defaultParams = toctocParams['metropolitana'];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const regionKey = document.getElementById('region').value;
        const adults = parseInt(document.getElementById('adults').value, 10);
        const children = parseInt(document.getElementById('children').value, 10);
        const isNew = document.getElementById('new-property').checked;
        if (!regionMap[regionKey] || isNaN(adults) || isNaN(children)) return;

        const { tt, pi } = regionMap[regionKey];
        const bedrooms = Math.ceil((adults + children) / 2);

        const stateParam = `&estado=${isNew ? 1 : 0}`;
        const projectPath = isNew ? '/proyectos' : '';

        const { text, viewport, polygon } = toctocParams[regionKey] || defaultParams;
        const toctoc = `https://www.toctoc.com/resultados/mapa/compra/departamento-casa/${tt}/?moneda=1&precioDesde=30000000&precioHasta=${maxPrice}&dormitoriosDesde=${bedrooms}&banosDesde=1${stateParam}&disponibilidadEntrega=&numeroDeDiasTocToc=0&superficieDesdeUtil=0&superficieHastaUtil=0&superficieDesdeConstruida=0&superficieHastaConstruida=0&superficieDesdeTerraza=0&superficieHastaTerraza=0&superficieDesdeTerreno=0&superficieHastaTerreno=0&ordenarPor=0&pagina=1&paginaInterna=1&zoom=15&idZonaHomogenea=0&atributos=&texto=${text}&viewport=${viewport}&idPoligono=${polygon}&publicador=0&temporalidad=0`;        const portalDepto = `https://www.portalinmobiliario.com/venta/departamento${projectPath}/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPrice}CLP`;
        const portalCasa = `https://www.portalinmobiliario.com/venta/casa${projectPath}/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPrice}CLP_BEDROOMS_${bedrooms}-`;

        results.innerHTML = `
            <p><a href="${toctoc}" target="_blank">Buscar Departamentos y Casas en TocToc</a></p>
            <p><a href="${portalDepto}" target="_blank">Departamentos en Portal Inmobiliario</a></p>
            <p><a href="${portalCasa}" target="_blank">Casas en Portal Inmobiliario</a></p>
        `;
    });
});

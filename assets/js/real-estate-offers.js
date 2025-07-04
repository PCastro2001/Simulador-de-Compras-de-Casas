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
            viewport: '-19.22999131394748,-70.80341585889876,-17.497775945103697,-68.48870372305414'
        },
        'tarapaca': {
            text: 'Tarapacá,%20Chile',
            viewport: '-21.63060991951285,-71.16527061395584,-18.93912523753997,-67.52591670768163'
        },
        'antofagasta': {
            text: 'Antofagasta,%20Chile',
            viewport: '-26.0610049454205,-72.41308259017809,-20.934602611320273,-65.32085344844133'
        },
        'coquimbo': {
            text: 'Coquimbo,%20Chile',
            viewport: '-32.282464643828895,-73.15598649962008,-29.037289362913995,-68.37069809629682'
        },
        'valparaiso': {
            text: 'Valparaíso,%20Chile',
            viewport: '-33.95573443839357,-72.37666110945811,-32.02063000327249,-69.450702079202'
        },
        'metropolitana': {
            text: 'Región%20Metropolitana%20De%20Santiago,%20Chile',
            viewport: '-34.29093141874928,-71.78441680535728,-32.92240654382647,-69.700515507317'
        },
        'bernardo-ohiggins': {
            text: 'Libertador%20General%20Bernardo%20O%27Higgins,%20Chile',
            viewport: '-35.09329665723819,-72.05727530830973,-33.76118722597219,-70.00912418993008'
        },
        'maule': {
            text: 'Maule,%20Chile',
            viewport: '-36.54359818110996,-72.99825474177258,-34.68649079950998,-70.10098993183075'
        },
        'araucania': {
            text: 'La%20Araucanía,%20Chile',
            viewport: '-39.63716894678617,-73.84166846755777,-37.58172761183692,-70.5054824334368'
        },
        'los-rios': {
            text: 'Los%20Ríos,%20Chile',
            viewport: '-40.681141869100735,-73.81209991876636,-39.287949512259296,-71.50609645799338'
        },
        'los-lagos': {
            text: 'Los%20Lagos,%20Chile',
            viewport: '-44.06706333720388,-76.48524894518262,-40.2388131616983,-69.93342618167195'
        },
        'aysen': {
            text: 'Aysén%20Del%20General%20Carlos%20Ibáñez%20Del%20Campo,%20Chile',
            viewport: '-49.15833333181824,-78.45052897670341,-43.63915173436585,-68.28875346942284'
        },
        'magallanes': {
            text: 'Magallanes%20Y%20De%20La%20Antártica%20Chilena,%20Chile',
            viewport: '-55.914977247901156,-78.6569509153307,-48.59549667982712,-63.44841298309328'
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

        const { text, viewport } = toctocParams[regionKey] || defaultParams;
        const toctoc = `https://www.toctoc.com/resultados/mapa/compra/departamento-casa/${tt}/?moneda=1&precioDesde=30000000&precioHasta=${maxPrice}&dormitoriosDesde=${bedrooms}&banosDesde=1${stateParam}&disponibilidadEntrega=&numeroDeDiasTocToc=0&superficieDesdeUtil=0&superficieHastaUtil=0&superficieDesdeConstruida=0&superficieHastaConstruida=0&superficieDesdeTerraza=0&superficieHastaTerraza=0&superficieDesdeTerreno=0&superficieHastaTerreno=0&ordenarPor=0&pagina=1&paginaInterna=1&zoom=15&idZonaHomogenea=0&atributos=&texto=${text}&viewport=${viewport}&idPoligono=2240&publicador=0&temporalidad=0`;        
        const portalDepto = `https://www.portalinmobiliario.com/venta/departamento${projectPath}/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPrice}CLP`;
        const portalCasa = `https://www.portalinmobiliario.com/venta/casa${projectPath}/${pi}/_DisplayType_M_PriceRange_30000000CLP-${maxPrice}CLP_BEDROOMS_${bedrooms}-`;

        results.innerHTML = `
            <p><a href="${toctoc}" target="_blank">Buscar Departamentos y Casas en TocToc</a></p>
            <p><a href="${portalDepto}" target="_blank">Departamentos en Portal Inmobiliario</a></p>
            <p><a href="${portalCasa}" target="_blank">Casas en Portal Inmobiliario</a></p>
        `;
    });
});

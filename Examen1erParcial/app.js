// Minimal, cleaned app.js restoring core functionality: map, country highlights, equipos select, markers, routing

class Equipo {
    #lat;
    #lng;
    constructor(id, nombre, ciudad, historia, lat, lng) {
        this.id = id; this.nombre = nombre; this.ciudad = ciudad; this.historia = historia;
        this.#lat = lat; this.#lng = lng;
    }
    getLat() { return this.#lat; }
    getLng() { return this.#lng; }
    obtenerMensajeRedes() { return `¡Voy en camino a ver a ${this.nombre} en ${this.ciudad}!`; }
}
class EquipoMundial extends Equipo { constructor(...args){ super(...args); this.deporte = 'Futbol Soccer (Mundial 2026)'; } }
class EquipoNFL extends Equipo { constructor(...args){ super(...args); this.deporte = 'NFL'; } }
class EquipoNBA extends Equipo { constructor(...args){ super(...args); this.deporte = 'NBA'; } }

let map, stadiumMarker, userMarker, routingControl;
let equiposInstanciados = [];
let promocionesData = {};
let noticiasData = [];
let equipoSeleccionado = null;

const selectEquipo = document.getElementById('select-equipo');
const btnTrazarRuta = document.getElementById('btn-trazar-ruta');
const btnToggleInstructions = document.getElementById('btn-toggle-instructions');
const infoEquipo = document.getElementById('info-equipo');
const equipoNombre = document.getElementById('equipo-nombre');
const equipoCiudad = document.getElementById('equipo-ciudad');
const equipoHistoria = document.getElementById('equipo-historia');
const infoPromocion = document.getElementById('info-promocion');
const promoTexto = document.getElementById('promo-texto');
const shareButtons = document.getElementById('share-buttons');
const btnTwitter = document.getElementById('btn-twitter');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const tablaPosiciones = document.getElementById('tabla-posiciones');
const stadiumCards = document.getElementById('stadium-cards');
const newsList = document.getElementById('news-list');
const resultadosRecientes = document.getElementById('resultados-recientes');
const btnAdminLogin = document.getElementById('btn-admin-login');
const adminModal = document.getElementById('admin-modal');
const btnCloseAdmin = document.getElementById('btn-close-admin');
const adminLoginForm = document.getElementById('admin-login-form');
const adminPanel = document.getElementById('admin-panel');
const btnLogoutAdmin = document.getElementById('btn-logout-admin');
let instructionsVisible = true;
let adminLoggedIn = false;
const ADMIN_CREDENTIALS = { user: 'admin@mundial.local', password: 'admin123' };

// Colors + embedded simple GeoJSONs (small simplified shapes)
const paisesDestacados = [
    { nombre: 'México', color: '#ff5a5f' },
    { nombre: 'Estados Unidos', color: '#4dabf7' },
    { nombre: 'Canadá', color: '#51cf66' }
];

const GEO_MEXICO = { "type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"México"},"geometry":{"type":"Polygon","coordinates":[[[-117.12776,32.53495],[-115,31.33218],[-112,29.5],[-109.8,27.5],[-107,25],[-104.5,23],[-102,20.5],[-100,18.5],[-98,17],[-96,16],[-94.5,15],[-92.5,15.5],[-90.5,18.0],[-90,20],[-92,22],[-95,23.5],[-99,24.5],[-103.5,25.5],[-107,26.5],[-110,28],[-112.5,30],[-115,31.5],[-117.12776,32.53495]]]}}]};
const GEO_USA = { "type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Estados Unidos"},"geometry":{"type":"Polygon","coordinates":[[[-125,49],[-121,49],[-104,49],[-90,49],[-81,45],[-75,42],[-71,42],[-70,40],[-80,25],[-95,25],[-110,25],[-120,30],[-125,49]]]}}]};
const GEO_CANADA = { "type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"Canadá"},"geometry":{"type":"Polygon","coordinates":[[[-141,60],[-130,60],[-120,58],[-110,56],[-100,56],[-95,55],[-85,55],[-75,54],[-70,52],[-66,50],[-64,58],[-70,65],[-80,68],[-95,70],[-120,72],[-141,60]]]}}]};

function initMap(){
    map = L.map('map').setView([39.8283, -98.5795], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    map.createPane('pane-canada'); map.getPane('pane-canada').style.zIndex = 200;
    map.createPane('pane-usa'); map.getPane('pane-usa').style.zIndex = 300;
    map.createPane('pane-mexico'); map.getPane('pane-mexico').style.zIndex = 400;
    // Simpler approach: draw rectangular-ish bbox polygons with holes to avoid overlap
    const mexicoOuter = [ [32.7, -118.0], [32.7, -86.7], [14.5, -86.7], [14.5, -118.0] ];
    const usaOuter = [ [49.5, -125.0], [49.5, -66.9], [24.5, -66.9], [24.5, -125.0] ];
    const canadaOuter = [ [84.0, -141.0], [84.0, -52.0], [49.5, -52.0], [49.5, -141.0] ];

    // Mexico (no hole)
    const mexicoPoly = L.polygon(mexicoOuter, { pane: 'pane-mexico', color: paisesDestacados[0].color, weight:1.8, fillColor: paisesDestacados[0].color, fillOpacity:0.36 });
    mexicoPoly.on('mouseover', function(){ this.setStyle({ fillOpacity:0.65, weight:3.5 }); this.bringToFront(); });
    mexicoPoly.on('mouseout', function(){ this.setStyle({ fillOpacity:0.36, weight:1.8 }); });
    mexicoPoly.addTo(map).bindTooltip('México');

    // USA with hole for Mexico
    const usaPoly = L.polygon([usaOuter, mexicoOuter], { pane: 'pane-usa', color: paisesDestacados[1].color, weight:1.6, fillColor: paisesDestacados[1].color, fillOpacity:0.28 });
    usaPoly.on('mouseover', function(){ this.setStyle({ fillOpacity:0.5, weight:3 }); this.bringToFront(); });
    usaPoly.on('mouseout', function(){ this.setStyle({ fillOpacity:0.28, weight:1.6 }); });
    usaPoly.addTo(map).bindTooltip('Estados Unidos');

    // Canada with hole for USA (removes USA area)
    const canadaPoly = L.polygon([canadaOuter, usaOuter], { pane: 'pane-canada', color: paisesDestacados[2].color, weight:1.6, fillColor: paisesDestacados[2].color, fillOpacity:0.28 });
    canadaPoly.on('mouseover', function(){ this.setStyle({ fillOpacity:0.5, weight:3 }); this.bringToFront(); });
    canadaPoly.on('mouseout', function(){ this.setStyle({ fillOpacity:0.28, weight:1.6 }); });
    canadaPoly.addTo(map).bindTooltip('Canadá');
}

const API_BASE = window.location.protocol === 'file:' ? '' : '';

async function cargarServicios(){
    selectEquipo.innerHTML = '<option value="" disabled selected>Cargando equipos...</option>';
    const catalogStatus = document.getElementById('catalog-status');
    if (catalogStatus) catalogStatus.textContent = '';

    // Cargar secciones independientes (funcionan con o sin servidor API)
    await cargarNoticias();
    await cargarTablasPosiciones();
    await cargarHistorial();

    try {
        let rEquipos = await fetch('equipos.json');
        if (!rEquipos.ok) rEquipos = await fetch('./equipos.json').catch(() => ({ ok: false }));

        const rPromos = await fetch('promociones.json').catch(() => ({ ok: false }));

        if (!rEquipos || !rEquipos.ok) throw new Error('No se pudo cargar equipos.json');

        const dataEquipos = await rEquipos.json();
        promocionesData = (rPromos && rPromos.ok) ? await rPromos.json() : {};

        selectEquipo.innerHTML = '<option value="" disabled selected>Selecciona un equipo...</option>';
        equiposInstanciados = [];

        if (Array.isArray(dataEquipos.NFL)) {
            dataEquipos.NFL.forEach(eq => { const instancia = new EquipoNFL(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'NFL'); });
        }
        if (Array.isArray(dataEquipos.Mundial)) {
            dataEquipos.Mundial.forEach(eq => { const instancia = new EquipoMundial(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'Mundial 2026'); });
            renderStadiumCards(dataEquipos.Mundial);
        } else {
            const apiEstadios = await fetch('api/estadios').catch(() => ({ ok: false }));
            if (apiEstadios && apiEstadios.ok) {
                const estadios = await apiEstadios.json();
                const mapped = estadios.map(s => ({ id: s.id || s._id, nombre: s.nombre, ciudad: s.ciudad, historia: s.pais || '' }));
                renderStadiumCards(mapped);
            }
        }
    } catch (err) {
        console.error('Error cargando catálogo de equipos:', err);
        selectEquipo.innerHTML = '<option value="" disabled selected>No se pudo cargar el catálogo</option>';
        if (catalogStatus) {
            catalogStatus.textContent = 'No se pudo cargar el catálogo de equipos. Las tablas, noticias e historial siguen disponibles.';
        }
    }
}

async function cargarNoticias() {
    try {
        const r = await fetch('noticias.json').catch(() => ({ ok: false }));
        if (r && r.ok) {
            noticiasData = await r.json();
            renderNews();
        } else {
            // Fallback: intentar API
            const api = await fetch('api/noticias').catch(() => ({ ok: false }));
            if (api && api.ok) { noticiasData = await api.json(); renderNews(); }
            else renderNews();
        }
    } catch (e) {
        console.error('Error cargando noticias:', e);
        renderNews();
    }
}

async function cargarTablasPosiciones() {
    try {
        const api = await fetch('api/clasificaciones').catch(() => ({ ok: false }));
        if (api && api.ok) {
            const data = await api.json();
            if (Array.isArray(data) && data.length) { renderStandings(data); return; }
        }
        // Fallback local
        const r = await fetch('clasificaciones.json').catch(() => ({ ok: false }));
        if (r && r.ok) {
            const data = await r.json();
            if (Array.isArray(data) && data.length) { renderStandings(data); return; }
        }
        renderStandings([]);
    } catch (e) {
        console.error('Error cargando tablas:', e);
        renderStandings([]);
    }
}

async function cargarHistorial() {
    try {
        const [pResp, sResp] = await Promise.all([
            fetch('api/partidos').catch(() => ({ ok: false })),
            fetch('api/selecciones').catch(() => ({ ok: false }))
        ]);
        if (pResp && pResp.ok && sResp && sResp.ok) {
            const partidos = await pResp.json();
            const selecciones = await sResp.json();
            const nombrePorId = {};
            (selecciones || []).forEach(s => { nombrePorId[s.id] = s.nombre; });
            const lista = (partidos || []).map(p => ({
                local: nombrePorId[p.equipo_localId] || 'Por definir',
                visitante: nombrePorId[p.equipo_visitanteId] || 'Por definir',
                marcador: `${p.goles_local ?? '-'} - ${p.goles_visitante ?? '-'}`,
                fecha: p.fecha ? new Date(p.fecha).toLocaleString() : ''
            }));
            renderResults(lista);
            return;
        }
        // Fallback local
        const [pl, sl] = await Promise.all([
            fetch('partidos.json').catch(() => ({ ok: false })),
            fetch('selecciones.json').catch(() => ({ ok: false }))
        ]);
        if (pl && pl.ok && sl && sl.ok) {
            const partidos = await pl.json();
            const selecciones = await sl.json();
            const nombrePorId = {};
            (selecciones || []).forEach(s => { nombrePorId[s.id] = s.nombre; });
            const lista = (partidos || []).map(p => ({
                local: nombrePorId[p.equipo_localId] || p.local || 'Por definir',
                visitante: nombrePorId[p.equipo_visitanteId] || p.visitante || 'Por definir',
                marcador: `${p.goles_local ?? '-'} - ${p.goles_visitante ?? '-'}`,
                fecha: p.fecha ? new Date(p.fecha).toLocaleString() : ''
            }));
            renderResults(lista);
            return;
        }
        renderResults();
    } catch (e) {
        console.error('Error cargando historial:', e);
        renderResults();
    }
}

function agregarOpcionSelect(equipo, categoria){ const option = document.createElement('option'); option.value = equipo.id; option.textContent = `[${categoria}] ${equipo.nombre} - ${equipo.ciudad}`; selectEquipo.appendChild(option); }

function mostrarInfoEquipo(equipo) {
    equipoNombre.textContent = equipo.nombre;
    equipoCiudad.textContent = equipo.ciudad;
    equipoHistoria.textContent = equipo.historia;
    infoEquipo.classList.remove('hidden');
    mostrarPromocion(equipo.id);
    setShareButtons(equipo);
}

function mostrarPromocion(equipoId) {
    const texto = promocionesData[equipoId] || 'No hay promociones disponibles para este equipo en este momento.';
    promoTexto.textContent = texto;
    infoPromocion.classList.remove('hidden');
}

function setShareButtons(equipo) {
    shareButtons.classList.remove('hidden');
    const mensaje = `Voy en camino a ver a ${equipo.nombre} en ${equipo.ciudad}!`;
    btnTwitter.onclick = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(mensaje)}`, '_blank');
    btnWhatsapp.onclick = () => window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
}

selectEquipo.addEventListener('change', (e)=>{
    const id = e.target.value; equipoSeleccionado = equiposInstanciados.find(eq => eq.id === id);
    if (!equipoSeleccionado) return;
    mostrarMarcadorEstadio(equipoSeleccionado);
    mostrarInfoEquipo(equipoSeleccionado);
    btnTrazarRuta.disabled = false;
});

async function fetchClasificaciones() {
    try {
        const response = await fetch('/api/clasificaciones');
        if (!response.ok) throw new Error('No se pudo cargar las clasificaciones');
        return await response.json();
    } catch (error) {
        console.error('Error cargando clasificaciones:', error);
        return null;
    }
}

async function loadStandings() {
    const clasificaciones = await fetchClasificaciones();
    renderStandings(clasificaciones);
    await loadResults();
}

function mostrarMarcadorEstadio(equipo){ const lat = equipo.getLat(), lng = equipo.getLng(); if (stadiumMarker) map.removeLayer(stadiumMarker); stadiumMarker = L.marker([lat,lng]).addTo(map).bindPopup(`<b>${equipo.nombre}</b><br>${equipo.ciudad}`).openPopup(); map.setView([lat,lng],14); }

function renderStadiumCards(stadiums) {
    stadiumCards.innerHTML = '';
    stadiums.forEach((stadium) => {
        const card = document.createElement('article'); card.className = 'stadium-card';
        const title = document.createElement('h3'); title.textContent = stadium.nombre;
        const city = document.createElement('p'); city.textContent = `Ciudad: ${stadium.ciudad}`;
        const history = document.createElement('p'); history.textContent = stadium.historia;
        const button = document.createElement('button'); button.className = 'btn-view-stadium'; button.textContent = 'Ver en el mapa';
        button.addEventListener('click', () => {
            const equipo = equiposInstanciados.find(eq => eq.id === stadium.id);
            if (equipo) mostrarMarcadorEstadio(equipo);
        });
        card.append(title, city, history, button);
        stadiumCards.appendChild(card);
    });
}

function renderNews() {
    newsList.innerHTML = '';
    if (!Array.isArray(noticiasData) || noticiasData.length === 0) {
        newsList.innerHTML = '<div class="stadium-card">No hay noticias disponibles.</div>';
        return;
    }
    noticiasData.forEach(noticia => {
        const card = document.createElement('article'); card.className = 'news-card';
        const title = document.createElement('h3'); title.textContent = noticia.titulo;
        const meta = document.createElement('p'); meta.textContent = `${noticia.fecha} · ${noticia.categoria}`;
        const excerpt = document.createElement('p'); excerpt.textContent = noticia.extracto;
        card.append(title, meta, excerpt);
        if (noticia.url) {
            const link = document.createElement('a'); link.href = noticia.url; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = 'Leer más';
            card.appendChild(link);
        }
        newsList.appendChild(card);
    });
}

function renderStandings(clasificaciones = null) {
    const tableData = [];
    if (Array.isArray(clasificaciones) && clasificaciones.length) {
        const grouped = clasificaciones.reduce((acc, row) => {
            const grupo = row.grupo || 'Sin grupo';
            if (!acc[grupo]) acc[grupo] = [];
            acc[grupo].push(row);
            return acc;
        }, {});

        Object.keys(grouped).sort().forEach(grupo => {
            grouped[grupo].sort((a,b) => {
                if (b.pts !== a.pts) return b.pts - a.pts;
                if (b.dg !== a.dg) return b.dg - a.dg;
                if (b.gf !== a.gf) return b.gf - a.gf;
                return a.nombre.localeCompare(b.nombre);
            });
            tableData.push({ grupo, equipos: grouped[grupo] });
        });
    } else {
        tablaPosiciones.innerHTML = '<div class="stadium-card">No se pudieron cargar las tablas de posiciones. Revisa la conexión con la API.</div>';
        return;
    }

    tablaPosiciones.innerHTML = '';

    if (Array.isArray(clasificaciones) && clasificaciones.length) {
        const general = [...clasificaciones].sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.dg !== a.dg) return b.dg - a.dg;
            if (b.gf !== a.gf) return b.gf - a.gf;
            return a.nombre.localeCompare(b.nombre);
        });
        const generalCard = document.createElement('article'); generalCard.className = 'stadium-card tabla-general';
        const generalTitle = document.createElement('h3'); generalTitle.textContent = '🏆 Tabla General del Mundial';
        const generalTable = document.createElement('table');
        generalTable.innerHTML = '<thead><tr><th>#</th><th>Equipo</th><th>Grupo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead>';
        const generalBody = document.createElement('tbody');
        general.forEach((e, i) => {
            const gf = Number(e.gf || 0);
            const gc = Number(e.gc || 0);
            const dg = (e.dg !== undefined && e.dg !== null) ? e.dg : (gf - gc);
            const pts = e.pts ?? 0;
            const row = document.createElement('tr');
            row.innerHTML = `<td>${i + 1}</td><td>${e.nombre}</td><td>${e.grupo || '-'}</td><td>${e.pj || 0}</td><td>${e.pg || 0}</td><td>${e.pe || 0}</td><td>${e.pp || 0}</td><td>${gf}</td><td>${gc}</td><td>${dg}</td><td>${pts}</td>`;
            generalBody.appendChild(row);
        });
        generalTable.appendChild(generalBody);
        generalCard.append(generalTitle, generalTable);
        tablaPosiciones.appendChild(generalCard);
    }

    tableData.forEach(grupo => {
        const card = document.createElement('article'); card.className = 'stadium-card';
        const title = document.createElement('h3'); title.textContent = `Grupo ${grupo.grupo}`;
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr>';
        const tbody = document.createElement('tbody');
        grupo.equipos.forEach(e => {
            const row = document.createElement('tr');
            const gf = Number(e.gf || 0);
            const gc = Number(e.gc || 0);
            const dg = (e.dg !== undefined && e.dg !== null) ? e.dg : (gf - gc);
            const pts = (e.pts !== undefined && e.pts !== null) ? e.pts : (e.puntos !== undefined ? e.puntos : 0);
            const pj = e.pj || 0;
            const pg = e.pg || 0;
            const pe = e.pe || 0;
            const pp = e.pp || 0;

            row.innerHTML = `<td>${e.nombre}</td><td>${pj}</td><td>${pg}</td><td>${pe}</td><td>${pp}</td><td>${gf}</td><td>${gc}</td><td>${dg}</td><td>${pts}</td>`;
            tbody.appendChild(row);
        });
        table.appendChild(thead); table.appendChild(tbody);
        card.append(title, table);
        tablaPosiciones.appendChild(card);
    });
}

async function loadResults() {
    try {
        const [partidosResp, seleccionesResp] = await Promise.all([
            fetch('/api/partidos').catch(() => ({ ok: false })),
            fetch('/api/selecciones').catch(() => ({ ok: false }))
        ]);
        if (!partidosResp.ok || !seleccionesResp.ok) return renderResults();
        const partidos = await partidosResp.json();
        const selecciones = await seleccionesResp.json();
        const nombrePorId = {};
        (selecciones || []).forEach(s => { nombrePorId[s.id] = s.nombre; });
        const lista = (partidos || []).map(p => ({
            local: nombrePorId[p.equipo_localId] || 'Por definir',
            visitante: nombrePorId[p.equipo_visitanteId] || 'Por definir',
            marcador: `${p.goles_local ?? '-'} - ${p.goles_visitante ?? '-'}`,
            fecha: p.fecha ? new Date(p.fecha).toLocaleString() : ''
        }));
        renderResults(lista);
    } catch (error) {
        console.error('Error cargando resultados:', error);
        renderResults();
    }
}

function renderResults(results) {
    if (!Array.isArray(results) || results.length === 0) {
        resultadosRecientes.innerHTML = '<div class="stadium-card">No hay partidos registrados aún.</div>';
        return;
    }

    resultadosRecientes.innerHTML = '';
    results.forEach(partido => {
        const card = document.createElement('article'); card.className = 'stadium-card';
        const title = document.createElement('h3'); title.textContent = `${partido.local} vs ${partido.visitante}`;
        const score = document.createElement('p'); score.textContent = `Resultado: ${partido.marcador}`;
        const date = document.createElement('p'); date.textContent = partido.fecha ? `Fecha: ${partido.fecha}` : '';
        card.append(title, score, date);
        resultadosRecientes.appendChild(card);
    });
}

btnToggleInstructions.addEventListener('click', ()=>{
    const panel = document.querySelector('.leaflet-routing-container');
    if (!panel) return;
    instructionsVisible = !instructionsVisible;
    panel.style.display = instructionsVisible ? 'block' : 'none';
    btnToggleInstructions.textContent = instructionsVisible ? '⬇️ Ocultar instrucciones' : '⬆️ Mostrar instrucciones';
});

btnTrazarRuta.addEventListener('click', ()=>{
    if (!equipoSeleccionado) { alert('Selecciona primero un equipo'); return; }
    if (!navigator.geolocation) { alert('Tu navegador no soporta geolocalización'); return; }
    btnTrazarRuta.textContent = 'Obteniendo ubicación...'; btnTrazarRuta.disabled = true;
    navigator.geolocation.getCurrentPosition(pos => {
        const uLat = pos.coords.latitude, uLng = pos.coords.longitude;
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([uLat,uLng]).addTo(map).bindPopup('¡Estás aquí!').openPopup();
        trazarRutaLeaflet(uLat,uLng,equipoSeleccionado.getLat(),equipoSeleccionado.getLng());
        btnTrazarRuta.textContent = '📍 Ruta Generada';
        btnTrazarRuta.disabled = false;
    }, err => { console.error(err); alert('No se obtuvo ubicación'); btnTrazarRuta.textContent = '📍 Trazar Ruta desde mi Ubicación'; btnTrazarRuta.disabled = false; }, { enableHighAccuracy:true });
});

function trazarRutaLeaflet(uLat,uLng,dLat,dLng){
    if (routingControl) map.removeControl(routingControl);
    routingControl = L.Routing.control({
        waypoints:[L.latLng(uLat,uLng), L.latLng(dLat,dLng)],
        routeWhileDragging:false,
        addWaypoints:false,
        showAlternatives:false,
        collapsibleWaypoints:false
    }).addTo(map);

    const group = new L.featureGroup([userMarker, stadiumMarker]);
    map.fitBounds(group.getBounds(), { padding:[50,50] });

    const panel = document.querySelector('.leaflet-routing-container');
    if (panel) {
        panel.style.display = 'block';
        instructionsVisible = true;
    }
    btnToggleInstructions.classList.remove('hidden');
    btnToggleInstructions.textContent = '⬇️ Ocultar instrucciones';
}

let opcionesSelect = { selecciones: [], estadios: [], fases: [], grupos: [], continentes: [] };

async function cargarOpcionesAdmin() {
    try {
        const response = await fetch('/api/admin/opciones-select');
        if (!response.ok) throw new Error('No se pudieron cargar opciones');
        opcionesSelect = await response.json();
        poblarSelects();
    } catch (error) {
        console.error('Error cargando opciones admin:', error);
    }
}

function poblarSelects() {
    const fill = (el, items, valueField = 'id', textField = 'nombre') => {
        if (!el) return;
        el.innerHTML = '<option value="">Selecciona...</option>';
        (items || []).forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            el.appendChild(option);
        });
    };

    fill(document.getElementById('partido-fase'), opcionesSelect.fases);
    fill(document.getElementById('partido-local'), opcionesSelect.selecciones);
    fill(document.getElementById('partido-visitante'), opcionesSelect.selecciones);
    fill(document.getElementById('partido-estadio'), opcionesSelect.estadios, 'id', 'nombre');
    fill(document.getElementById('seleccion-continente'), opcionesSelect.continentes);
    fill(document.getElementById('seleccion-grupo'), opcionesSelect.grupos);
}

function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === tabName));
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        if (!content.id) return;
        const current = content.id.replace('admin-tab-', '');
        content.classList.toggle('hidden', current !== tabName);
    });
}

document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => showAdminTab(tab.dataset.tab));
});

async function loadAdminPartidos() {
    try {
        const response = await fetch('/api/admin/partidos-fase-grupos');
        if (!response.ok) throw new Error('Error al cargar partidos');
        const partidos = await response.json();
        renderAdminPartidos(partidos);
    } catch (error) {
        console.error(error);
        document.getElementById('admin-partidos-lista').innerHTML = '<div class="admin-item">No se pudieron cargar los partidos.</div>';
    }
}

function renderAdminPartidos(partidos) {
    const container = document.getElementById('admin-partidos-lista');
    container.innerHTML = '';
    if (!Array.isArray(partidos) || partidos.length === 0) {
        container.innerHTML = '<div class="admin-item">No hay partidos.</div>';
        return;
    }
    partidos.forEach(partido => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div>
                <div class="admin-item-title">${partido.local.nombre} vs ${partido.visitante.nombre}</div>
                <div class="admin-item-meta">Grupo ${partido.grupo} · ${new Date(partido.fecha).toLocaleString()} · ${partido.estadio?.nombre || 'Sin estadio'} · ${partido.goles_local ?? '-'} - ${partido.goles_visitante ?? '-'}</div>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" data-id="${partido.id}">Editar</button>
                <button class="btn-delete" data-id="${partido.id}">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editarPartido(btn.dataset.id));
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Eliminar este partido?')) return;
            const res = await fetch(`/api/admin/partidos/${btn.dataset.id}`, { method: 'DELETE' });
            if (!res.ok) return alert('No se pudo eliminar');
            alert('Partido eliminado');
            await Promise.all([loadAdminPartidos(), loadStandings()]);
        });
    });
}

async function editarPartido(id) {
    const response = await fetch('/api/admin/partidos-fase-grupos');
    const partidos = await response.json();
    const partido = partidos.find(p => p.id === id);
    if (!partido) return alert('Partido no encontrado');

    document.getElementById('partido-id').value = partido.id;
    document.getElementById('partido-fase').value = partido.fase || '';
    document.getElementById('partido-fecha').value = new Date(partido.fecha).toISOString().slice(0, 16);
    document.getElementById('partido-horario').value = partido.horario || '';
    document.getElementById('partido-local').value = partido.local?.id || '';
    document.getElementById('partido-visitante').value = partido.visitante?.id || '';
    document.getElementById('partido-estadio').value = partido.estadio?.id || '';
    document.getElementById('partido-goles-local').value = partido.goles_local ?? 0;
    document.getElementById('partido-goles-visitante').value = partido.goles_visitante ?? 0;
    showAdminTab('partidos');
}

document.getElementById('form-partido').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('partido-id').value;
    const body = {
        faseId: document.getElementById('partido-fase').value,
        equipo_localId: document.getElementById('partido-local').value,
        equipo_visitanteId: document.getElementById('partido-visitante').value,
        estadioId: document.getElementById('partido-estadio').value,
        fecha: document.getElementById('partido-fecha').value,
        horario: document.getElementById('partido-horario').value,
        goles_local: Number(document.getElementById('partido-goles-local').value),
        goles_visitante: Number(document.getElementById('partido-goles-visitante').value)
    };

    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/partidos/${id}` : '/api/admin/partidos';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return alert('No se pudo guardar el partido');
    alert(id ? 'Partido actualizado' : 'Partido creado');
    document.getElementById('form-partido').reset();
    document.getElementById('partido-id').value = '';
            await Promise.all([loadAdminPartidos(), loadStandings()]);
});

document.getElementById('btn-cancelar-partido').addEventListener('click', () => {
    document.getElementById('form-partido').reset();
    document.getElementById('partido-id').value = '';
});

async function loadAdminSelecciones() {
    try {
        const response = await fetch('/api/selecciones');
        const selecciones = await response.json();
        renderAdminSelecciones(selecciones);
    } catch (error) {
        console.error(error);
        document.getElementById('admin-selecciones-lista').innerHTML = '<div class="admin-item">No se pudieron cargar las selecciones.</div>';
    }
}

function renderAdminSelecciones(selecciones) {
    const container = document.getElementById('admin-selecciones-lista');
    container.innerHTML = '';
    if (!Array.isArray(selecciones) || selecciones.length === 0) {
        container.innerHTML = '<div class="admin-item">No hay selecciones.</div>';
        return;
    }
    selecciones.forEach(sel => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div>
                <div class="admin-item-title">${sel.nombre}</div>
                <div class="admin-item-meta">${sel.pais} · ${sel.continente || ''} · Grupo ${sel.grupo || ''} · Ranking ${sel.ranking ?? '-'}</div>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" data-id="${sel.id}">Editar</button>
                <button class="btn-delete" data-id="${sel.id}">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const res = await fetch('/api/selecciones');
            const all = await res.json();
            const sel = all.find(s => s.id === btn.dataset.id);
            if (!sel) return alert('Selección no encontrada');
            document.getElementById('seleccion-id').value = sel.id;
            document.getElementById('seleccion-nombre').value = sel.nombre || '';
            document.getElementById('seleccion-pais').value = sel.pais || '';
            document.getElementById('seleccion-ranking').value = sel.ranking ?? '';
            document.getElementById('seleccion-historia').value = sel.historia || '';
            document.getElementById('seleccion-ventajas').value = sel.ventajas || '';
            document.getElementById('seleccion-desventajas').value = sel.desventajas || '';
            document.getElementById('seleccion-bandera').value = sel.banderaUrl || '';
            document.getElementById('seleccion-latitud').value = sel.latitud ?? '';
            document.getElementById('seleccion-longitud').value = sel.longitud ?? '';
            if (opcionesSelect.continentes.length) document.getElementById('seleccion-continente').value = sel.continente || '';
            if (opcionesSelect.grupos.length) document.getElementById('seleccion-grupo').value = sel.grupo || '';
            showAdminTab('selecciones');
        });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Eliminar esta selección?')) return;
            const res = await fetch(`/api/admin/selecciones/${btn.dataset.id}`, { method: 'DELETE' });
            if (!res.ok) return alert('No se pudo eliminar');
            alert('Selección eliminada');
            await Promise.all([loadAdminSelecciones(), loadStandings()]);
        });
    });
}

document.getElementById('form-seleccion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('seleccion-id').value;
    const body = {
        nombre: document.getElementById('seleccion-nombre').value,
        pais: document.getElementById('seleccion-pais').value,
        ranking: document.getElementById('seleccion-ranking').value,
        continenteId: document.getElementById('seleccion-continente').value,
        grupoId: document.getElementById('seleccion-grupo').value,
        historia: document.getElementById('seleccion-historia').value,
        ventajas: document.getElementById('seleccion-ventajas').value,
        desventajas: document.getElementById('seleccion-desventajas').value,
        banderaUrl: document.getElementById('seleccion-bandera').value,
        latitud: document.getElementById('seleccion-latitud').value,
        longitud: document.getElementById('seleccion-longitud').value
    };

    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/selecciones/${id}` : '/api/admin/selecciones';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return alert('No se pudo guardar la selección');
    alert(id ? 'Selección actualizada' : 'Selección creada');
    document.getElementById('form-seleccion').reset();
    document.getElementById('seleccion-id').value = '';
    await Promise.all([loadAdminSelecciones(), loadStandings()]);
});

document.getElementById('btn-cancelar-seleccion').addEventListener('click', () => {
    document.getElementById('form-seleccion').reset();
    document.getElementById('seleccion-id').value = '';
});

async function loadAdminEstadios() {
    try {
        const response = await fetch('/api/estadios');
        const estadios = await response.json();
        renderAdminEstadios(estadios);
    } catch (error) {
        console.error(error);
        document.getElementById('admin-estadios-lista').innerHTML = '<div class="admin-item">No se pudieron cargar los estadios.</div>';
    }
}

function renderAdminEstadios(estadios) {
    const container = document.getElementById('admin-estadios-lista');
    container.innerHTML = '';
    if (!Array.isArray(estadios) || estadios.length === 0) {
        container.innerHTML = '<div class="admin-item">No hay estadios.</div>';
        return;
    }
    estadios.forEach(est => {
        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
            <div>
                <div class="admin-item-title">${est.nombre}</div>
                <div class="admin-item-meta">${est.ciudad}, ${est.pais} · Capacidad: ${est.capacidad ?? '-'} · Lat: ${est.latitud ?? '-'} Lng: ${est.longitud ?? '-'}</div>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" data-id="${est.id}">Editar</button>
                <button class="btn-delete" data-id="${est.id}">Eliminar</button>
            </div>
        `;
        container.appendChild(item);
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const res = await fetch('/api/estadios');
            const all = await res.json();
            const est = all.find(e => e.id === btn.dataset.id);
            if (!est) return alert('Estadio no encontrado');
            document.getElementById('estadio-id').value = est.id;
            document.getElementById('estadio-nombre').value = est.nombre || '';
            document.getElementById('estadio-ciudad').value = est.ciudad || '';
            document.getElementById('estadio-pais').value = est.pais || '';
            document.getElementById('estadio-latitud').value = est.latitud ?? '';
            document.getElementById('estadio-longitud').value = est.longitud ?? '';
            document.getElementById('estadio-capacidad').value = est.capacidad ?? '';
            showAdminTab('estadios');
        });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Eliminar este estadio?')) return;
            const res = await fetch(`/api/admin/estadios/${btn.dataset.id}`, { method: 'DELETE' });
            if (!res.ok) return alert('No se pudo eliminar');
            alert('Estadio eliminado');
            await loadAdminEstadios();
        });
    });
}

document.getElementById('form-estadio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('estadio-id').value;
    const body = {
        nombre: document.getElementById('estadio-nombre').value,
        ciudad: document.getElementById('estadio-ciudad').value,
        pais: document.getElementById('estadio-pais').value,
        latitud: document.getElementById('estadio-latitud').value,
        longitud: document.getElementById('estadio-longitud').value,
        capacidad: document.getElementById('estadio-capacidad').value
    };

    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/estadios/${id}` : '/api/admin/estadios';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) return alert('No se pudo guardar el estadio');
    alert(id ? 'Estadio actualizado' : 'Estadio creado');
    document.getElementById('form-estadio').reset();
    document.getElementById('estadio-id').value = '';
    await loadAdminEstadios();
});

document.getElementById('btn-cancelar-estadio').addEventListener('click', () => {
    document.getElementById('form-estadio').reset();
    document.getElementById('estadio-id').value = '';
});

// --- Administración de Tablas de Posiciones (clasificaciones) ---
async function loadAdminClasificaciones() {
    try {
        const response = await fetch('/api/clasificaciones-admin');
        if (!response.ok) throw new Error('Error al cargar tablas');
        const clasificaciones = await response.json();
        renderAdminClasificaciones(clasificaciones);
    } catch (error) {
        console.error(error);
        document.getElementById('admin-clasificaciones-lista').innerHTML = '<div class="admin-item">No se pudieron cargar las tablas.</div>';
    }
}

function renderAdminClasificaciones(clasificaciones) {
    const container = document.getElementById('admin-clasificaciones-lista');
    container.innerHTML = '';
    if (!Array.isArray(clasificaciones) || clasificaciones.length === 0) {
        container.innerHTML = '<div class="admin-item">No hay registros de posiciones.</div>';
        return;
    }
    clasificaciones.forEach(item => {
        const wrap = document.createElement('div');
        wrap.className = 'admin-item admin-edit-row';
        wrap.innerHTML = `
            <div class="admin-item-title">${item.nombre} <span class="admin-badge">Grupo ${item.grupo || '-'}</span></div>
            <div class="admin-edit-fields">
                <label>PJ<input type="number" min="0" data-field="pj" value="${item.pj || 0}"></label>
                <label>PG<input type="number" min="0" data-field="pg" value="${item.pg || 0}"></label>
                <label>PE<input type="number" min="0" data-field="pe" value="${item.pe || 0}"></label>
                <label>PP<input type="number" min="0" data-field="pp" value="${item.pp || 0}"></label>
                <label>GF<input type="number" min="0" data-field="gf" value="${item.gf || 0}"></label>
                <label>GC<input type="number" min="0" data-field="gc" value="${item.gc || 0}"></label>
                <label>DG<input type="number" data-field="dg" value="${item.dg || 0}"></label>
                <label>PTS<input type="number" min="0" data-field="pts" value="${item.pts || 0}"></label>
            </div>
            <button class="btn-edit" data-id="${item.id}">Guardar</button>
        `;
        const btn = wrap.querySelector('.btn-edit');
        btn.addEventListener('click', async () => {
            const body = {};
            wrap.querySelectorAll('input[data-field]').forEach(inp => { body[inp.dataset.field] = Number(inp.value); });
            const res = await fetch(`/api/admin/clasificaciones/${btn.dataset.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            if (!res.ok) return alert('No se pudo actualizar');
            alert('Tabla actualizada');
            await Promise.all([loadAdminClasificaciones(), loadStandings()]);
        });
        container.appendChild(wrap);
    });
}

// --- Administración de Fases ---
async function loadAdminFases() {
    try {
        const response = await fetch('/api/fases');
        if (!response.ok) throw new Error('Error al cargar fases');
        const fases = await response.json();
        renderAdminFases(fases);
    } catch (error) {
        console.error(error);
        document.getElementById('admin-fases-lista').innerHTML = '<div class="admin-item">No se pudieron cargar las fases.</div>';
    }
}

function renderAdminFases(fases) {
    const container = document.getElementById('admin-fases-lista');
    container.innerHTML = '';
    if (!Array.isArray(fases) || fases.length === 0) {
        container.innerHTML = '<div class="admin-item">No hay fases.</div>';
        return;
    }
    fases.forEach(f => {
        const fechas = f.fecha ? new Date(f.fecha).toISOString().slice(0, 16) : '';
        const wrap = document.createElement('div');
        wrap.className = 'admin-item admin-edit-row';
        wrap.innerHTML = `
            <div class="admin-item-title">${f.nombre}</div>
            <div class="admin-edit-fields">
                <label>Nombre<input type="text" data-field="nombre" value="${f.nombre || ''}"></label>
                <label>Sede<input type="text" data-field="sede" value="${f.sede || ''}"></label>
                <label>Fecha<input type="datetime-local" data-field="fecha" value="${fechas}"></label>
                <label>Partidos<input type="number" min="0" data-field="partidos" value="${f.partidos ?? 0}"></label>
            </div>
            <button class="btn-edit" data-id="${f.id}">Guardar</button>
        `;
        const btn = wrap.querySelector('.btn-edit');
        btn.addEventListener('click', async () => {
            const body = {};
            wrap.querySelectorAll('input[data-field]').forEach(inp => {
                if (inp.dataset.field === 'partidos') body.partidos = Number(inp.value);
                else body[inp.dataset.field] = inp.value;
            });
            const res = await fetch(`/api/admin/fases/${btn.dataset.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            if (!res.ok) return alert('No se pudo actualizar');
            alert('Fase actualizada');
            await loadAdminFases();
        });
        container.appendChild(wrap);
    });
}

async function showAdminPanel() {
    adminPanel.classList.remove('hidden');
    adminLoggedIn = true;
    await cargarOpcionesAdmin();
    await Promise.all([loadAdminPartidos(), loadAdminSelecciones(), loadAdminEstadios(), loadAdminClasificaciones(), loadAdminFases()]);
}

function hideAdminPanel() {
    adminPanel.classList.add('hidden');
    adminLoggedIn = false;
}

btnLogoutAdmin.addEventListener('click', hideAdminPanel);

adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = adminLoginForm.usuario.value.trim();
    const password = adminLoginForm.password.value.trim();
    try {
        const resp = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: user, password })
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            alert(err.error || 'Credenciales inválidas');
            return;
        }
        const data = await resp.json();
        if (data.ok) {
            hideAdminModal();
            await showAdminPanel();
        } else {
            alert('Credenciales inválidas');
        }
    } catch (err) {
        console.error('Error en login admin:', err);
        alert('Error al autenticar. Revisa la consola.');
    }
});

window.onload = () => { initMap(); cargarServicios(); };

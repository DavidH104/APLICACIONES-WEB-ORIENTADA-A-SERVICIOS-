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
const adminMatchesContainer = document.getElementById('admin-matches');
const adminQualifiedContainer = document.getElementById('admin-qualified');
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

async function cargarServicios(){
    selectEquipo.innerHTML = '<option value="" disabled selected>Cargando equipos...</option>';
    const catalogStatus = document.getElementById('catalog-status');
    if (catalogStatus) catalogStatus.textContent = '';

    try {
        // Intento principal: ruta relativa simple
        let rEquipos = await fetch('equipos.json');
        // Reintentos: absolute y con ./
        if (!rEquipos.ok) {
            try { rEquipos = await fetch('/equipos.json'); } catch (e) { /* ignore */ }
        }
        if (!rEquipos.ok) {
            try { rEquipos = await fetch('./equipos.json'); } catch (e) { /* ignore */ }
        }

        const rPromos = await fetch('promociones.json').catch(() => ({ ok: false }));
        const rNoticias = await fetch('noticias.json').catch(() => ({ ok: false }));

        if (!rEquipos || !rEquipos.ok) throw new Error('No se pudo cargar equipos.json (asegura servir desde un servidor estático o usa un servidor HTTP)');

        const dataEquipos = await rEquipos.json();
        promocionesData = (rPromos && rPromos.ok) ? await rPromos.json() : {};
        noticiasData = (rNoticias && rNoticias.ok) ? await rNoticias.json() : [];

        selectEquipo.innerHTML = '<option value="" disabled selected>Selecciona un equipo...</option>';
        equiposInstanciados = [];

        if (Array.isArray(dataEquipos.NFL)) {
            dataEquipos.NFL.forEach(eq => { const instancia = new EquipoNFL(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'NFL'); });
        }
        if (Array.isArray(dataEquipos.Mundial)) {
            dataEquipos.Mundial.forEach(eq => { const instancia = new EquipoMundial(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'Mundial 2026'); });
            renderStadiumCards(dataEquipos.Mundial);
        } else {
            // Fallback: intentar obtener estadios desde la API
            const apiEstadios = await fetch('/api/estadios').catch(() => ({ ok: false }));
            if (apiEstadios && apiEstadios.ok) {
                const estadios = await apiEstadios.json();
                const mapped = estadios.map(s => ({ id: s.id || s._id, nombre: s.nombre, ciudad: s.ciudad, historia: s.pais || '' }));
                renderStadiumCards(mapped);
                if (catalogStatus) catalogStatus.textContent = 'Catálogo cargado desde /api/estadios (fallback).';
            }
        }
    } catch (err) {
        console.error('Error cargando servicios:', err);
        selectEquipo.innerHTML = '<option value="" disabled selected>No se pudo cargar el catálogo</option>';
        if (catalogStatus) {
            if (window.location.protocol === 'file:') {
                catalogStatus.innerHTML = 'No se pudo cargar equipos.json. Estás abriendo la página vía <strong>file://</strong>. Usa un servidor estático local — por ejemplo: <code>npx http-server -c-1 .</code> o <code>python -m http.server 8000</code>.';
            } else {
                catalogStatus.textContent = 'No se pudo cargar equipos.json. Revisa la consola (network) o si /api/estadios está disponible.';
            }
        }
    } finally {
        renderNews();
        await loadStandings();
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
}

function showAdminModal() { adminModal.classList.remove('hidden'); }
function hideAdminModal() { adminModal.classList.add('hidden'); }
function showAdminPanel() { adminPanel.classList.remove('hidden'); adminLoggedIn = true; }
function hideAdminPanel() { adminPanel.classList.add('hidden'); adminLoggedIn = false; }

btnAdminLogin.addEventListener('click', showAdminModal);
btnCloseAdmin.addEventListener('click', hideAdminModal);
btnLogoutAdmin.addEventListener('click', () => {
    hideAdminPanel();
});

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
            showAdminPanel();
            await Promise.all([loadAdminMatches(), loadQualifiedTeams()]);
        } else {
            alert('Credenciales inválidas');
        }
    } catch (err) {
        console.error('Error en login admin:', err);
        alert('Error al autenticar. Revisa la consola.');
    }
});

async function loadAdminMatches() {
    try {
        const response = await fetch('/api/admin/partidos-fase-grupos');
        if (!response.ok) throw new Error('Error al cargar partidos de fase de grupos');
        const partidos = await response.json();
        renderAdminMatches(partidos);
    } catch (error) {
        console.error(error);
        adminMatchesContainer.innerHTML = '<div class="stadium-card">No se pudieron cargar los partidos.</div>';
    }
}

async function loadQualifiedTeams() {
    try {
        const response = await fetch('/api/admin/qualificados');
        if (!response.ok) throw new Error('Error al cargar equipos clasificados');
        const data = await response.json();
        renderQualifiedTeams(data);
    } catch (error) {
        console.error(error);
        adminQualifiedContainer.innerHTML = '<div class="stadium-card">No se pudieron cargar los equipos clasificados.</div>';
    }
}

function renderQualifiedTeams(data) {
    adminQualifiedContainer.innerHTML = '';
    if (!data || (!Array.isArray(data.directos) && !Array.isArray(data.mejoresTerceros))) {
        adminQualifiedContainer.innerHTML = '<div class="stadium-card">No hay equipos clasificados disponibles.</div>';
        return;
    }

    const directosCard = document.createElement('article');
    directosCard.className = 'stadium-card';
    directosCard.innerHTML = '<h3>Clasificados Directos (Top 2 por grupo)</h3>';
    const directosList = document.createElement('div');
    directosList.className = 'qualified-list';
    data.directos.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'qualified-item';
        itemEl.textContent = `${item.grupo} - ${item.posicion}°: ${item.nombre} (${item.pts} pts, DG ${item.dg})`;
        directosList.appendChild(itemEl);
    });
    directosCard.appendChild(directosList);

    const tercerosCard = document.createElement('article');
    tercerosCard.className = 'stadium-card';
    tercerosCard.innerHTML = '<h3>8 Mejores Terceros</h3>';
    const tercerosList = document.createElement('div');
    tercerosList.className = 'qualified-list';
    data.mejoresTerceros.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'qualified-item';
        itemEl.textContent = `${item.grupo} - ${item.nombre} (${item.pts} pts, DG ${item.dg}, GF ${item.gf})`;
        tercerosList.appendChild(itemEl);
    });
    tercerosCard.appendChild(tercerosList);

    adminQualifiedContainer.append(directosCard, tercerosCard);
}

function renderAdminMatches(partidos) {
    adminMatchesContainer.innerHTML = '';
    if (!Array.isArray(partidos) || partidos.length === 0) {
        adminMatchesContainer.innerHTML = '<div class="stadium-card">No hay partidos de fase de grupos disponibles.</div>';
        return;
    }

    partidos.forEach(partido => {
        const card = document.createElement('article'); card.className = 'stadium-card';
        const title = document.createElement('h3'); title.textContent = `${partido.local.nombre} vs ${partido.visitante.nombre}`;
        const info = document.createElement('p'); info.textContent = `Grupo ${partido.grupo} · ${new Date(partido.fecha).toLocaleString()} · ${partido.estadio.nombre}`;
        const form = document.createElement('div'); form.className = 'admin-match-form';
        form.innerHTML = `
            <label>Goles ${partido.local.nombre}: <input type="number" min="0" value="${partido.goles_local ?? 0}" data-role="local" /></label>
            <label>Goles ${partido.visitante.nombre}: <input type="number" min="0" value="${partido.goles_visitante ?? 0}" data-role="visitante" /></label>
            <button class="btn-primary">Actualizar</button>
        `;
        const btn = form.querySelector('button');
        btn.addEventListener('click', async () => {
            const golesLocal = Number(form.querySelector('input[data-role="local"]').value);
            const golesVisitante = Number(form.querySelector('input[data-role="visitante"]').value);
            await updateMatchScore(partido.id, golesLocal, golesVisitante);
        });
        card.append(title, info, form);
        adminMatchesContainer.appendChild(card);
    });
}

async function updateMatchScore(matchId, golesLocal, golesVisitante) {
    try {
        const response = await fetch(`/api/partidos/${matchId}/score`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goles_local: golesLocal, goles_visitante: golesVisitante })
        });
        if (!response.ok) throw new Error('No se pudo actualizar el partido');
        alert('Partido actualizado con éxito. Clasificación recalculada.');
        await Promise.all([loadAdminMatches(), loadStandings(), loadQualifiedTeams()]);
    } catch (error) {
        console.error(error);
        alert('Error actualizando el partido. Revisa la consola.');
    }
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
        // fallback manual contenido
        tableData.push({ grupo: 'A', equipos: [
            { nombre: 'México', puntos: 7, pj: 3, pg: 2, pe: 1, pp: 0, gf: 5, gc: 1 },
            { nombre: 'Canadá', puntos: 6, pj: 3, pg: 2, pe: 0, pp: 1, gf: 4, gc: 3 },
            { nombre: 'Brasil', puntos: 4, pj: 3, pg: 1, pe: 1, pp: 1, gf: 3, gc: 3 },
            { nombre: 'Camerún', puntos: 0, pj: 3, pg: 0, pe: 0, pp: 3, gf: 1, gc: 6 }
        ] });
    }

    tablaPosiciones.innerHTML = '';
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

function renderResults() {
    const results = [
        { local: 'México', visitante: 'Canadá', marcador: '2 - 1', fecha: '25 de junio, 18:00' },
        { local: 'Estados Unidos', visitante: 'Argentina', marcador: '1 - 2', fecha: '24 de junio, 20:00' },
        { local: 'Brasil', visitante: 'Camerún', marcador: '3 - 0', fecha: '23 de junio, 17:30' },
        { local: 'Bélgica', visitante: 'Portugal', marcador: '0 - 0', fecha: '22 de junio, 19:00' }
    ];

    resultadosRecientes.innerHTML = '';
    results.forEach(partido => {
        const card = document.createElement('article'); card.className = 'stadium-card';
        const title = document.createElement('h3'); title.textContent = `${partido.local} vs ${partido.visitante}`;
        const score = document.createElement('p'); score.textContent = `Resultado: ${partido.marcador}`;
        const date = document.createElement('p'); date.textContent = `Fecha: ${partido.fecha}`;
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

window.onload = () => { initMap(); cargarServicios(); };

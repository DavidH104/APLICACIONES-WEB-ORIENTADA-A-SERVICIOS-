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
let instructionsVisible = true;

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
    try{
        const [rEquipos, rPromos, rNoticias] = await Promise.all([fetch('equipos.json'), fetch('promociones.json'), fetch('noticias.json')]);
        const dataEquipos = await rEquipos.json(); promocionesData = await rPromos.json(); noticiasData = await rNoticias.json();
        selectEquipo.innerHTML = '<option value="" disabled selected>Selecciona un equipo...</option>';

        dataEquipos.NFL.forEach(eq => { const instancia = new EquipoNFL(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'NFL'); });
        dataEquipos.Mundial.forEach(eq => { const instancia = new EquipoMundial(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'Mundial 2026'); });
        dataEquipos.NBA.forEach(eq => { const instancia = new EquipoNBA(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud); equiposInstanciados.push(instancia); agregarOpcionSelect(instancia,'NBA'); });

    }catch(err){ console.error('Error cargando servicios:', err); selectEquipo.innerHTML = '<option disabled>Error al cargar</option>'; }
}

function agregarOpcionSelect(equipo, categoria){ const option = document.createElement('option'); option.value = equipo.id; option.textContent = `[${categoria}] ${equipo.nombre} - ${equipo.ciudad}`; selectEquipo.appendChild(option); }

selectEquipo.addEventListener('change', (e)=>{
    const id = e.target.value; equipoSeleccionado = equiposInstanciados.find(eq => eq.id === id);
    if (!equipoSeleccionado) return;
    mostrarMarcadorEstadio(equipoSeleccionado);
    btnTrazarRuta.disabled = false;
});

function mostrarMarcadorEstadio(equipo){ const lat = equipo.getLat(), lng = equipo.getLng(); if (stadiumMarker) map.removeLayer(stadiumMarker); stadiumMarker = L.marker([lat,lng]).addTo(map).bindPopup(`<b>${equipo.nombre}</b><br>${equipo.ciudad}`).openPopup(); map.setView([lat,lng],14); }

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
    }, err => { console.error(err); alert('No se obtuvo ubicación'); btnTrazarRuta.textContent = '📍 Trazar Ruta desde mi Ubicación'; btnTrazarRuta.disabled = false; }, { enableHighAccuracy:true });
});

function trazarRutaLeaflet(uLat,uLng,dLat,dLng){ if (routingControl) map.removeControl(routingControl); routingControl = L.Routing.control({ waypoints:[L.latLng(uLat,uLng), L.latLng(dLat,dLng)], routeWhileDragging:false, addWaypoints:false }).addTo(map); const group = new L.featureGroup([userMarker, stadiumMarker]); map.fitBounds(group.getBounds(), { padding:[50,50] }); }

window.onload = () => { initMap(); cargarServicios(); };

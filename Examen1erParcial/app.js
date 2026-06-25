/**
 * PROGRAMACIÓN ORIENTADA A OBJETOS
 */

// 1. Clase Base (Aplica Clases, Constructores y Encapsulamiento)
class Equipo {
    // Encapsulamiento básico con propiedades privadas (#)
    #latitud;
    #longitud;

    constructor(id, nombre, ciudad, historia, latitud, longitud) {
        this.id = id;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.historia = historia;
        this.#latitud = latitud;
        this.#longitud = longitud;
    }

    // Métodos para acceder a datos encapsulados
    getLat() { return this.#latitud; }
    getLng() { return this.#longitud; }
    
    obtenerMensajeRedes() {
        return `¡Voy en camino a ver a ${this.nombre} en ${this.ciudad}! 🏟️🔥`;
    }
}

// 2. Clases Hijas (Aplica Herencia)
class EquipoNFL extends Equipo {
    constructor(id, nombre, ciudad, historia, lat, lng) {
        super(id, nombre, ciudad, historia, lat, lng);
        this.deporte = "NFL";
    }
}

class EquipoMundial extends Equipo {
    constructor(id, nombre, ciudad, historia, lat, lng) {
        super(id, nombre, ciudad, historia, lat, lng);
        this.deporte = "Futbol Soccer (Mundial 2026)";
    }
}

class EquipoNBA extends Equipo {
    constructor(id, nombre, ciudad, historia, lat, lng) {
        super(id, nombre, ciudad, historia, lat, lng);
        this.deporte = "Basquetbol (NBA)";
    }
}

/**
 * ESTADO GLOBAL Y VARIABLES
 */
let map;
let stadiumMarker;
let userMarker;
let routingControl;
let equiposInstanciados = []; // Aquí guardaremos los objetos creados
let promocionesData = {};
let equipoSeleccionado = null; // Instancia del equipo actual

// Elementos del DOM
const selectEquipo = document.getElementById('select-equipo');
const btnTrazarRuta = document.getElementById('btn-trazar-ruta');
const btnToggleInstructions = document.getElementById('btn-toggle-instructions');

let instructionsVisible = true;

/**
 * INICIALIZACIÓN DEL MAPA (Leaflet)
 */
function initMap() {
    // Inicializa el mapa centrado en Norteamérica
    map = L.map('map').setView([39.8283, -98.5795], 4);
    
    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

/**
 * CONSUMO DE SERVICIOS (Archivos JSON)
 */
async function cargarServicios() {
    try {
        // Fetch paralelo para ambos "servicios"
        const [resEquipos, resPromos] = await Promise.all([
            fetch('equipos.json'),
            fetch('promociones.json')
        ]);

        const dataEquipos = await resEquipos.json();
        promocionesData = await resPromos.json();

        selectEquipo.innerHTML = '<option value="" disabled selected>Selecciona un equipo...</option>';

        // Instanciar objetos basados en el JSON (Polimorfismo / Fábrica simple)
        // NFL
        dataEquipos.NFL.forEach(eq => {
            const instancia = new EquipoNFL(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud);
            equiposInstanciados.push(instancia);
            agregarOpcionSelect(instancia, "NFL");
        });

        // Mundial
        dataEquipos.Mundial.forEach(eq => {
            const instancia = new EquipoMundial(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud);
            equiposInstanciados.push(instancia);
            agregarOpcionSelect(instancia, "Mundial 2026");
        });

        // NBA
        dataEquipos.NBA.forEach(eq => {
            const instancia = new EquipoNBA(eq.id, eq.nombre, eq.ciudad, eq.historia, eq.latitud, eq.longitud);
            equiposInstanciados.push(instancia);
            agregarOpcionSelect(instancia, "NBA");
        });

    } catch (error) {
        console.error("Error al cargar los JSON:", error);
        selectEquipo.innerHTML = '<option value="" disabled>Error al cargar datos</option>';
    }
}

function agregarOpcionSelect(equipo, categoria) {
    const option = document.createElement('option');
    option.value = equipo.id;
    option.textContent = `[${categoria}] ${equipo.nombre} - ${equipo.ciudad}`;
    selectEquipo.appendChild(option);
}

/**
 * INTERACCIÓN EN LA INTERFAZ
 */
selectEquipo.addEventListener('change', (e) => {
    const equipoId = e.target.value;
    equipoSeleccionado = equiposInstanciados.find(eq => eq.id === equipoId);
    
    if (equipoSeleccionado) {
        mostrarInfoEquipo(equipoSeleccionado);
        mostrarMarcadorEstadio(equipoSeleccionado);
        btnTrazarRuta.disabled = false;
        
        // Limpiar rutas previas si existen
        if (routingControl) {
            map.removeControl(routingControl);
            routingControl = null;
        }
    }
});

function mostrarInfoEquipo(equipo) {
    // DOM UI
    document.getElementById('info-equipo').classList.remove('hidden');
    document.getElementById('equipo-nombre').textContent = equipo.nombre;
    document.getElementById('equipo-ciudad').textContent = `${equipo.ciudad} (${equipo.deporte})`;
    document.getElementById('equipo-historia').textContent = equipo.historia;

    // Promociones
    const promo = promocionesData[equipo.id];
    const promoCard = document.getElementById('info-promocion');
    if (promo) {
        promoCard.classList.remove('hidden');
        document.getElementById('promo-texto').textContent = promo;
    } else {
        promoCard.classList.add('hidden');
    }

    // Redes Sociales
    document.getElementById('share-buttons').classList.remove('hidden');
    configurarRedesSociales(equipo);
}

function mostrarMarcadorEstadio(equipo) {
    const lat = equipo.getLat();
    const lng = equipo.getLng();

    if (stadiumMarker) { map.removeLayer(stadiumMarker); }
    
    stadiumMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${equipo.nombre}</b><br>${equipo.ciudad}`)
        .openPopup();
        
    map.setView([lat, lng], 14);
}

function configurarRedesSociales(equipo) {
    const mensajeUrl = encodeURIComponent(equipo.obtenerMensajeRedes());
    const googleMapsUrl = encodeURIComponent(`https://www.google.com/maps/search/?api=1&query=${equipo.getLat()},${equipo.getLng()}`);
    
    document.getElementById('btn-twitter').onclick = () => {
        window.open(`https://twitter.com/intent/tweet?text=${mensajeUrl}%20${googleMapsUrl}`, '_blank');
    };
    
    document.getElementById('btn-whatsapp').onclick = () => {
        window.open(`https://wa.me/?text=${mensajeUrl}%20Míralo%20aquí:%20${googleMapsUrl}`, '_blank');
    };
}

/**
 * GEOLOCALIZACIÓN Y RUTAS
 */
btnTrazarRuta.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta la Geolocalización.");
        return;
    }

    btnTrazarRuta.textContent = "Obteniendo ubicación...";
    btnTrazarRuta.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const precision = position.coords.accuracy;
            const fechaHora = new Date(position.timestamp).toLocaleString();

            // Mostrar Info Geográfica
            document.getElementById('info-geo').classList.remove('hidden');
            document.getElementById('geo-datos').innerHTML = `
                Lat: ${userLat.toFixed(5)}, Lng: ${userLng.toFixed(5)} <br>
                Precisión: ${precision.toFixed(2)} metros <br>
                Hora local: ${fechaHora}
            `;

            // Agregar marcador del usuario
            if (userMarker) { map.removeLayer(userMarker); }
            userMarker = L.marker([userLat, userLng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map).bindPopup("¡Estás aquí!").openPopup();

            // Trazar Ruta
            trazarRutaLeaflet(userLat, userLng, equipoSeleccionado.getLat(), equipoSeleccionado.getLng());

            btnTrazarRuta.textContent = "📍 Ruta Generada";
        },
        (error) => {
            console.error("Error Geolocation:", error);
            alert("No se pudo obtener la ubicación. Da permisos a tu navegador.");
            btnTrazarRuta.textContent = "📍 Trazar Ruta desde mi Ubicación";
            btnTrazarRuta.disabled = false;
        },
        {
            enableHighAccuracy: true
        }
    );
});

function trazarRutaLeaflet(uLat, uLng, dLat, dLng) {
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Utilizamos Leaflet Routing Machine
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(uLat, uLng),
            L.latLng(dLat, dLng)
        ],
        language: 'es', // Instrucciones en español
        routeWhileDragging: false,
        addWaypoints: false,
        show: true // Muestra el panel de instrucciones y distancia
    }).addTo(map);

    // Ajustar el mapa para que se vean ambos puntos
    const group = new L.featureGroup([userMarker, stadiumMarker]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });

    // Mostrar el botón para ocultar/mostrar el panel de instrucciones
    if (btnToggleInstructions) {
        btnToggleInstructions.classList.remove('hidden');
        btnToggleInstructions.textContent = '⬇️ Minimizar instrucciones';
        instructionsVisible = true;
        btnToggleInstructions.onclick = toggleRouteInstructions;
    }
}

function toggleRouteInstructions() {
    if (!routingControl) return;
    const container = routingControl.getContainer();
    if (!container) return;

    if (instructionsVisible) {
        container.style.display = 'none';
        btnToggleInstructions.textContent = '⬆️ Mostrar instrucciones';
    } else {
        container.style.display = 'block';
        btnToggleInstructions.textContent = '⬇️ Minimizar instrucciones';
    }

    instructionsVisible = !instructionsVisible;
}

// Inicializar la app
window.onload = () => {
    initMap();
    cargarServicios();
};
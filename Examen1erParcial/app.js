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

const datosPosiciones = [
    {
        nombre: 'Grupo A',
        estado: 'Grupos Finalizados',
        equipos: [
            { equipo: 'México', pts: 9, pj: 3, v: 3, e: 0, d: 0, gf: 6, gc: 0, dif: 6 },
            { equipo: 'Sudáfrica', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 2, gc: 3, dif: -1 },
            { equipo: 'Corea del Sur', pts: 3, pj: 3, v: 1, e: 0, d: 2, gf: 2, gc: 3, dif: -1 },
            { equipo: 'República Checa', pts: 1, pj: 3, v: 0, e: 1, d: 2, gf: 2, gc: 6, dif: -4 }
        ]
    },
    {
        nombre: 'Grupo B',
        estado: 'Grupos Finalizados',
        equipos: [
            { equipo: 'Suiza', pts: 7, pj: 3, v: 2, e: 1, d: 0, gf: 7, gc: 3, dif: 4 },
            { equipo: 'Canadá', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 8, gc: 3, dif: 5 },
            { equipo: 'Bosnia y Herzegovina', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 5, gc: 6, dif: -1 },
            { equipo: 'Qatar', pts: 1, pj: 3, v: 0, e: 1, d: 2, gf: 2, gc: 10, dif: -8 }
        ]
    },
    {
        nombre: 'Grupo C',
        estado: 'Grupos Finalizados',
        equipos: [
            { equipo: 'Brasil', pts: 7, pj: 3, v: 2, e: 1, d: 0, gf: 7, gc: 1, dif: 6 },
            { equipo: 'Marruecos', pts: 7, pj: 3, v: 2, e: 1, d: 0, gf: 6, gc: 3, dif: 3 },
            { equipo: 'Escocia', pts: 3, pj: 3, v: 1, e: 0, d: 2, gf: 2, gc: 4, dif: -2 },
            { equipo: 'Haití', pts: 0, pj: 3, v: 0, e: 0, d: 3, gf: 0, gc: 8, dif: -8 }
        ]
    },
    {
        nombre: 'Grupo D',
        estado: 'Grupos Finalizados',
        equipos: [
            { equipo: 'Estados Unidos', pts: 6, pj: 3, v: 2, e: 0, d: 1, gf: 8, gc: 4, dif: 4 },
            { equipo: 'Australia', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 2, gc: 2, dif: 0 },
            { equipo: 'Paraguay', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 2, gc: 4, dif: -2 },
            { equipo: 'Turquía', pts: 3, pj: 3, v: 1, e: 0, d: 2, gf: 3, gc: 5, dif: -2 }
        ]
    },
    {
        nombre: 'Grupo E',
        estado: 'Grupos Finalizados',
        equipos: [
            { equipo: 'Alemania', pts: 6, pj: 3, v: 2, e: 0, d: 1, gf: 10, gc: 4, dif: 6 },
            { equipo: 'Costa de Marfil', pts: 6, pj: 3, v: 2, e: 0, d: 1, gf: 4, gc: 2, dif: 2 },
            { equipo: 'Ecuador', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 2, gc: 2, dif: 0 },
            { equipo: 'Curazao', pts: 1, pj: 3, v: 0, e: 1, d: 2, gf: 1, gc: 9, dif: -8 }
        ]
    },
    {
        nombre: 'Grupo F',
        estado: 'Grupos Finalizados',
        equipos: [
            { equipo: 'Países Bajos', pts: 7, pj: 3, v: 2, e: 1, d: 0, gf: 10, gc: 4, dif: 6 },
            { equipo: 'Japón', pts: 5, pj: 3, v: 1, e: 2, d: 0, gf: 7, gc: 3, dif: 4 },
            { equipo: 'Suecia', pts: 4, pj: 3, v: 1, e: 1, d: 1, gf: 7, gc: 7, dif: 0 },
            { equipo: 'Túnez', pts: 0, pj: 3, v: 0, e: 0, d: 3, gf: 2, gc: 12, dif: -10 }
        ]
    },
    {
        nombre: 'Grupo G',
        estado: 'Grupos en Curso',
        equipos: [
            { equipo: 'Egipto', pts: 4, pj: 2, v: 1, e: 1, d: 0, gf: 4, gc: 2, dif: 2 },
            { equipo: 'Irán', pts: 2, pj: 2, v: 0, e: 2, d: 0, gf: 2, gc: 2, dif: 0 },
            { equipo: 'Bélgica', pts: 2, pj: 2, v: 0, e: 2, d: 0, gf: 1, gc: 1, dif: 0 },
            { equipo: 'Nueva Zelanda', pts: 1, pj: 2, v: 0, e: 1, d: 1, gf: 3, gc: 5, dif: -2 }
        ]
    },
    {
        nombre: 'Grupo H',
        estado: 'Grupos en Curso',
        equipos: [
            { equipo: 'España', pts: 4, pj: 2, v: 1, e: 1, d: 0, gf: 4, gc: 0, dif: 4 },
            { equipo: 'Uruguay', pts: 2, pj: 2, v: 0, e: 2, d: 0, gf: 3, gc: 3, dif: 0 },
            { equipo: 'Cabo Verde', pts: 2, pj: 2, v: 0, e: 2, d: 0, gf: 2, gc: 2, dif: 0 },
            { equipo: 'Arabia Saudita', pts: 1, pj: 2, v: 0, e: 1, d: 1, gf: 1, gc: 5, dif: -4 }
        ]
    },
    {
        nombre: 'Grupo I',
        estado: 'Grupos en Curso',
        equipos: [
            { equipo: 'Francia', pts: 6, pj: 2, v: 2, e: 0, d: 0, gf: 6, gc: 1, dif: 5 },
            { equipo: 'Noruega', pts: 6, pj: 2, v: 2, e: 0, d: 0, gf: 7, gc: 3, dif: 4 },
            { equipo: 'Senegal', pts: 0, pj: 2, v: 0, e: 0, d: 2, gf: 3, gc: 6, dif: -3 },
            { equipo: 'Irak', pts: 0, pj: 2, v: 0, e: 0, d: 2, gf: 1, gc: 7, dif: -6 }
        ]
    },
    {
        nombre: 'Grupo J',
        estado: 'Grupos en Curso',
        equipos: [
            { equipo: 'Argentina', pts: 6, pj: 2, v: 2, e: 0, d: 0, gf: 5, gc: 0, dif: 5 },
            { equipo: 'Austria', pts: 3, pj: 2, v: 1, e: 0, d: 1, gf: 3, gc: 3, dif: 0 },
            { equipo: 'Argelia', pts: 3, pj: 2, v: 1, e: 0, d: 1, gf: 2, gc: 4, dif: -2 },
            { equipo: 'Jordania', pts: 0, pj: 2, v: 0, e: 0, d: 2, gf: 2, gc: 5, dif: -3 }
        ]
    },
    {
        nombre: 'Grupo K',
        estado: 'Grupos en Curso',
        equipos: [
            { equipo: 'Colombia', pts: 6, pj: 2, v: 2, e: 0, d: 0, gf: 4, gc: 1, dif: 3 },
            { equipo: 'Portugal', pts: 4, pj: 2, v: 1, e: 1, d: 0, gf: 6, gc: 1, dif: 5 },
            { equipo: 'RD Congo', pts: 1, pj: 2, v: 0, e: 1, d: 1, gf: 2, gc: 4, dif: -2 },
            { equipo: 'Uzbekistán', pts: 0, pj: 2, v: 0, e: 0, d: 2, gf: 1, gc: 8, dif: -7 }
        ]
    },
    {
        nombre: 'Grupo L',
        estado: 'Grupos en Curso',
        equipos: [
            { equipo: 'Inglaterra', pts: 4, pj: 2, v: 1, e: 1, d: 0, gf: 4, gc: 2, dif: 2 },
            { equipo: 'Ghana', pts: 4, pj: 2, v: 1, e: 1, d: 0, gf: 1, gc: 0, dif: 1 },
            { equipo: 'Croacia', pts: 3, pj: 2, v: 1, e: 0, d: 1, gf: 3, gc: 4, dif: -1 },
            { equipo: 'Panamá', pts: 0, pj: 2, v: 0, e: 0, d: 2, gf: 0, gc: 2, dif: -2 }
        ]
    }
];

const resultadosRecientes = [
    { grupo: 'Grupo A', local: 'Sudáfrica', visitante: 'Corea del Sur', resultado: '1 - 0', estadio: 'Monterrey Stadium (Nuevo León)' },
    { grupo: 'Grupo A', local: 'República Checa', visitante: 'México', resultado: '0 - 3', estadio: 'Mexico City Stadium (CDMX)' },
    { grupo: 'Grupo E', local: 'Curazao', visitante: 'Costa de Marfil', resultado: '0 - 2', estadio: 'Philadelphia Stadium (Pensilvania)' },
    { grupo: 'Grupo E', local: 'Ecuador', visitante: 'Alemania', resultado: '2 - 1', estadio: 'New York New Jersey Stadium (Nueva Jersey)' },
    { grupo: 'Grupo F', local: 'Túnez', visitante: 'Países Bajos', resultado: '1 - 3', estadio: 'Kansas City Stadium (Misuri)' },
    { grupo: 'Grupo F', local: 'Japón', visitante: 'Suecia', resultado: '1 - 1', estadio: 'Dallas Stadium (Texas)' },
    { grupo: 'Grupo D', local: 'Turquía', visitante: 'Estados Unidos', resultado: '3 - 2', estadio: 'Los Angeles Stadium (California)' },
    { grupo: 'Grupo D', local: 'Paraguay', visitante: 'Australia', resultado: '0 - 0', estadio: 'San Francisco Bay Area Stadium (California)' }
];

function renderResultadosRecientes() {
    const container = document.getElementById('resultados-recientes');
    if (!container) return;

    container.innerHTML = resultadosRecientes.map((partido) => `
        <article class="result-card">
            <p class="match-group">${partido.grupo}</p>
            <p class="match-score">${partido.local} <strong>${partido.resultado}</strong> ${partido.visitante}</p>
            <p class="match-stadium">Estadio: ${partido.estadio}</p>
        </article>
    `).join('');
}

function renderTablasPosiciones() {
    const container = document.getElementById('tabla-posiciones');
    if (!container) return;

    container.innerHTML = datosPosiciones.map((grupo) => `
        <article class="group-card">
            <h3>${grupo.nombre}</h3>
            <p class="group-status">${grupo.estado}</p>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Equipo</th>
                            <th>PTS</th>
                            <th>PJ</th>
                            <th>V</th>
                            <th>E</th>
                            <th>D</th>
                            <th>GF</th>
                            <th>GC</th>
                            <th>DIF</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grupo.equipos.map((equipo) => `
                            <tr>
                                <td>${equipo.equipo}</td>
                                <td>${equipo.pts}</td>
                                <td>${equipo.pj}</td>
                                <td>${equipo.v}</td>
                                <td>${equipo.e}</td>
                                <td>${equipo.d}</td>
                                <td>${equipo.gf}</td>
                                <td>${equipo.gc}</td>
                                <td>${equipo.dif}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </article>
    `).join('');
}

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
    renderTablasPosiciones();
    renderResultadosRecientes();
    cargarServicios();
};
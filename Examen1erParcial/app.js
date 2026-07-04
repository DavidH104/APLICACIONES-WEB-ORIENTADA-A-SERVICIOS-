const API_BASE = 'http://localhost:3000/api';

let selecciones = [];
let estadios = [];
let clasificaciones = [];

function showModule(moduleName) {
  document.querySelectorAll('.modulo-section').forEach((section) => {
    section.classList.toggle('active', section.id === `mod-${moduleName}`);
  });
}

window.showModule = showModule;

function closeModal() {
  document.getElementById('modal-seleccion').style.display = 'none';
}

window.closeModal = closeModal;

async function cargarDatos() {
  const status = document.createElement('p');
  status.className = 'status-message';
  status.textContent = 'Cargando datos desde la API...';
  document.getElementById('content-area').prepend(status);

  try {
    const [seleccionesRes, estadiosRes, clasificacionesRes] = await Promise.all([
      fetch(`${API_BASE}/selecciones`),
      fetch(`${API_BASE}/estadios`),
      fetch(`${API_BASE}/clasificaciones`)
    ]);

    if (!seleccionesRes.ok || !estadiosRes.ok || !clasificacionesRes.ok) {
      throw new Error('No fue posible conectar con la API');
    }

    selecciones = await seleccionesRes.json();
    estadios = await estadiosRes.json();
    clasificaciones = await clasificacionesRes.json();

    status.textContent = `Datos cargados correctamente: ${selecciones.length} selecciones, ${estadios.length} estadios y ${clasificaciones.length} registros de clasificación.`;

    renderConfederaciones();
    renderEstadios();
    renderGrupos();
  } catch (error) {
    console.error(error);
    status.textContent = 'No se pudo conectar con la API. Asegúrate de ejecutar el servidor de MongoDB en el puerto 3000.';
  }
}

function renderConfederaciones() {
  const container = document.getElementById('confederaciones-container');
  if (!container) return;

  container.innerHTML = '';

  const grupos = selecciones.reduce((acc, item) => {
    const key = item.continente || 'Sin continente';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  Object.entries(grupos).forEach(([continente, items]) => {
    const section = document.createElement('div');
    section.className = 'table-card';
    section.innerHTML = `
      <h3>${continente}</h3>
      <p>${items.length} selecciones cargadas desde MongoDB.</p>
    `;

    const list = document.createElement('div');
    list.className = 'card-grid';

    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'selection-card';
      card.innerHTML = `
        <h4>${item.nombre}</h4>
        <p><strong>Confederación:</strong> ${item.confederacion || 'N/D'}</p>
        <p><strong>Grupo:</strong> ${item.grupo || 'N/D'}</p>
        <p><strong>Ranking:</strong> ${item.ranking || 'N/D'}</p>
        <button type="button">Ver información</button>
      `;
      card.querySelector('button').addEventListener('click', () => openModal(item));
      list.appendChild(card);
    });

    section.appendChild(list);
    container.appendChild(section);
  });
}

function renderEstadios() {
  const container = document.getElementById('estadios-container');
  if (!container) return;

  container.innerHTML = '';

  estadios.forEach((estadio) => {
    const card = document.createElement('article');
    card.className = 'stadium-card';
    card.innerHTML = `
      <h3>${estadio.nombre}</h3>
      <p><strong>Ciudad:</strong> ${estadio.ciudad}</p>
      <p><strong>País:</strong> ${estadio.pais}</p>
      <p><strong>Capacidad:</strong> ${estadio.capacidad}</p>
      <p><strong>Coordenadas:</strong> ${estadio.latitud}, ${estadio.longitud}</p>
      <a href="https://www.google.com/maps/search/?api=1&query=${estadio.latitud},${estadio.longitud}" target="_blank" rel="noopener">Abrir en Google Maps</a>
    `;
    container.appendChild(card);
  });
}

function renderGrupos() {
  const container = document.getElementById('grupos-container');
  if (!container) return;

  const grupos = clasificaciones.reduce((acc, item) => {
    if (!acc[item.grupo]) acc[item.grupo] = [];
    acc[item.grupo].push(item);
    return acc;
  }, {});

  container.innerHTML = '';

  Object.entries(grupos).forEach(([grupo, equipos]) => {
    const section = document.createElement('section');
    section.className = 'table-card';
    section.innerHTML = `
      <h3>Grupo ${grupo}</h3>
      <table>
        <thead>
          <tr>
            <th>Bandera</th>
            <th>Selección</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>PT</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    const tbody = section.querySelector('tbody');
    equipos.forEach((equipo) => {
      const row = document.createElement('tr');
      const banderaHtml = equipo.bandera
        ? `<img class="flag" src="${equipo.bandera}" alt="Bandera de ${equipo.nombre}" onerror="this.style.display='none'; this.parentElement.innerHTML='—';" />`
        : '—';
      row.innerHTML = `
        <td>${banderaHtml}</td>
        <td>${equipo.nombre}</td>
        <td>${equipo.pj}</td>
        <td>${equipo.pg}</td>
        <td>${equipo.pe}</td>
        <td>${equipo.pp}</td>
        <td>${equipo.gf}</td>
        <td>${equipo.gc}</td>
        <td>${equipo.dg}</td>
        <td><strong>${equipo.pts}</strong></td>
      `;
      tbody.appendChild(row);
    });

    container.appendChild(section);
  });
}

function openModal(selection) {
  const modal = document.getElementById('modal-seleccion');
  const body = document.getElementById('modal-body-info');

  body.innerHTML = `
    <h3>${selection.nombre}</h3>
    <p><strong>Continente:</strong> ${selection.continente || 'N/D'}</p>
    <p><strong>Confederación:</strong> ${selection.confederacion || 'N/D'}</p>
    <p><strong>Grupo:</strong> ${selection.grupo || 'N/D'}</p>
    <p><strong>Historia:</strong> ${selection.historia || 'Sin información registrada.'}</p>
    <p><strong>Ventajas:</strong> ${selection.ventajas || 'Sin información registrada.'}</p>
    <p><strong>Desventajas:</strong> ${selection.desventajas || 'Sin información registrada.'}</p>
    <p><strong>Ranking FIFA:</strong> ${selection.ranking || 'N/D'}</p>
    <p><strong>Mapa:</strong> <a href="${selection.google_maps_url || 'https://www.google.com/maps'}" target="_blank" rel="noopener">Abrir ubicación</a></p>
  `;

  modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
  showModule('inicio');
  cargarDatos();
});
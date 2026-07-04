# Entrega 2.1 - Proyecto Web y MongoDB

## 1. Información general del proyecto

Este proyecto consiste en una aplicación web orientada a servicios que muestra información relacionada con el Mundial 2026, como:

- equipos y estadios,
- promociones,
- noticias,
- tablas de posiciones,
- resultados recientes,
- y una funcionalidad de rutas en mapa.

La aplicación está desarrollada con:

- HTML para la estructura de la interfaz,
- CSS para el diseño visual,
- JavaScript para la lógica del frontend,
- Leaflet para mostrar mapas,
- MongoDB para la parte de bases de datos.

---

## 2. Objetivo del sistema

El objetivo principal del sistema es permitir al usuario:

1. explorar información sobre equipos y estadios,
2. visualizar el lugar de cada sede en un mapa,
3. obtener promociones asociadas a cada equipo,
4. ver noticias relacionadas con el torneo,
5. generar una ruta desde la ubicación del usuario hasta un estadio seleccionado.

---

## 3. Estructura del proyecto

El proyecto está dividido en dos partes principales:

### 3.1 Frontend
Archivos principales:

- index.html: estructura de la página.
- styles.css: diseño visual.
- app.js: lógica de la aplicación.
- equipos.json: datos de equipos y estadios.
- promociones.json: mensajes promocionales.
- noticias.json: noticias del torneo.

### 3.2 Backend / MongoDB
Carpeta:

- mongo/

Archivos principales:

- setup.js: crea las colecciones de la base de datos.
- seed.js: inserta datos iniciales.
- queries.js: ejecuta consultas de ejemplo.
- package.json: define las dependencias.

---

## 4. Explicación del frontend

### 4.1 index.html
Este archivo define la interfaz de usuario. Contiene:

- un selector para elegir un equipo,
- un botón para trazar la ruta,
- una sección de información del equipo,
- una sección para promociones,
- un contenedor para el mapa,
- secciones para tablas, estadios, noticias y resultados.

### 4.2 styles.css
Define el diseño visual de la aplicación, como:

- colores,
- distribución de columnas,
- botones,
- tarjetas,
- estilo del mapa,
- tablas y secciones.

### 4.3 app.js
Este es el archivo más importante del frontend. Su función es:

- inicializar el mapa con Leaflet,
- cargar datos desde archivos JSON,
- mostrar opciones en el selector de equipos,
- mostrar información del equipo seleccionado,
- mostrar promociones,
- mostrar marcadores en el mapa,
- obtener la ubicación del usuario,
- trazar la ruta hasta el estadio.

---

## 5. Explicación de la lógica principal en app.js

### 5.1 Clases utilizadas
Se implementan clases para modelar los equipos:

- Equipo: clase base.
- EquipoNFL: clase hija para equipos de la NFL.
- EquipoMundial: clase hija para sedes del Mundial 2026.
- EquipoNBA: clase hija para equipos de la NBA.

Estas clases permiten:

- encapsular datos,
- reutilizar lógica,
- y representar distintos tipos de equipo con una estructura común.

### 5.2 Variables globales
En el archivo se definen variables para:

- almacenar el mapa,
- almacenar marcadores,
- guardar la ruta calculada,
- guardar los equipos cargados,
- guardar promociones y noticias,
- guardar el equipo seleccionado.

### 5.3 Carga de datos
La app hace peticiones a los archivos JSON usando fetch.

Esto permite que la información se cargue dinámicamente sin tener que escribirla directamente en el HTML.

### 5.4 Interacción con el usuario
La aplicación responde a eventos como:

- cambio del selector de equipos,
- clic en el botón de trazar ruta,
- clic en botones para ver estadios.

---

## 6. Explicación de los datos JSON

### 6.1 equipos.json
Este archivo contiene información básica sobre los equipos o sedes, como:

- id,
- nombre,
- ciudad,
- historia,
- latitud,
- longitud.

Es la fuente principal para ubicar puntos en el mapa.

### 6.2 promociones.json
Aquí se almacenan los mensajes promocionales para cada equipo.

Al seleccionar un equipo, la aplicación busca la promoción correspondiente y la muestra.

### 6.3 noticias.json
Este archivo contiene noticias relacionadas con el Mundial 2026 y se muestra en una sección especial de la página.

---

## 7. Explicación de MongoDB en el proyecto

La carpeta mongo permite trabajar con una base de datos local usando MongoDB.

El propósito de esta parte es almacenar datos del torneo de forma estructurada, como:

- continentes,
- grupos,
- selecciones,
- estadios,
- partidos,
- clasificaciones,
- usuarios,
- boletos.

---

## 8. Estructura de la base de datos

### 8.1 Colección: continentes
Guarda información de los continentes y sus confederaciones.

### 8.2 Colección: grupos
Guarda los grupos del torneo.

### 8.3 Colección: selecciones
Guarda los equipos nacionales con datos como:

- nombre,
- historia,
- ventajas,
- desventajas,
- ranking,
- bandera,
- coordenadas.

### 8.4 Colección: estadios
Guarda los estadios con sus ciudades, país, capacidad y coordenadas.

### 8.5 Colección: partidos
Guarda la información de los partidos, incluyendo:

- fase,
- equipos locales y visitantes,
- goles,
- fecha,
- estadio.

### 8.6 Colección: clasificaciones
Guarda las tablas de posiciones de los grupos.

### 8.7 Colección: usuarios
Guarda usuarios de prueba.

### 8.8 Colección: boletos
Guarda información de boletos comprados para partidos.

---

## 9. Archivos de MongoDB

### 9.1 setup.js
Este archivo crea las colecciones de la base de datos y define reglas de validación.

Su función es preparar la estructura inicial de MongoDB.

### 9.2 seed.js
Este archivo inserta datos de ejemplo en la base de datos.

Permite llenar las colecciones con información realista de selecciones, grupos, estadios y partidos.

### 9.3 queries.js
Este archivo ejecuta consultas para consultar información en MongoDB.

Ejemplos de consultas:

- buscar selecciones por confederación,
- mostrar las mejores selecciones por ranking,
- consultar partidos y estadios,
- mostrar clasificaciones,
- consultar boletos.

### 9.4 package.json
Define las dependencias y scripts para ejecutar los archivos de MongoDB.

---

## 10. Cómo se ejecuta el proyecto

### 10.1 Ejecutar el frontend
Solo basta con abrir el archivo index.html en el navegador, o servir la carpeta con un servidor local.

### 10.2 Ejecutar MongoDB
Para usar la base de datos se necesita:

- tener MongoDB instalado y corriendo,
- abrir la carpeta mongo,
- ejecutar los comandos:

```bash
npm install
npm run setup
npm run seed
npm run queries
```

---

## 11. Conexión entre frontend y MongoDB

En este proyecto, el frontend y MongoDB están separados.

El frontend usa datos estáticos desde archivos JSON, mientras que MongoDB funciona como una capa adicional de almacenamiento y consultas.

Esto significa que:

- la web muestra información de forma visual,
- y MongoDB organiza y consulta los datos de manera estructurada.

En una versión más avanzada, ambos podrían conectarse mediante un backend para que la aplicación obtenga datos directamente desde MongoDB.

---

## 12. Conclusión

Este proyecto combina:

- desarrollo web frontend,
- uso de mapas interactivos,
- lógica orientada a objetos,
- consumo de datos JSON,
- y almacenamiento de datos con MongoDB.

Representa una aplicación funcional que simula un sistema de información para un evento deportivo internacional, en este caso el Mundial 2026.

---

## 13. Resumen breve

- La web muestra información del Mundial 2026.
- El usuario puede elegir un equipo o estadio.
- La app muestra su ubicación en un mapa.
- Se puede trazar una ruta desde la ubicación del usuario.
- MongoDB organiza la información del torneo en colecciones.
- El sistema está preparado para crecer hacia una arquitectura más completa.

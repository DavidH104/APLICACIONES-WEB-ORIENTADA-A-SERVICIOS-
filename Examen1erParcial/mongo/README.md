# MongoDB Local Setup para Examen Mundial 2026

Esta carpeta contiene scripts para crear una base de datos local de MongoDB con un modelo relacional simulado usando colecciones y referencias.

## Requisitos

- MongoDB local en `mongodb://localhost:27017`
- Extensión "MongoDB for VS Code" conectada a tu servidor local
- Node.js instalado

## Pasos

1. Abrir terminal en `c:\Users\HP\Downloads\Examen1erParcial\mongo`
2. Instalar dependencias:

```bash
npm install
```

3. Crear la estructura y validadores:

```bash
npm run setup
```

4. Sembrar datos de ejemplo:

```bash
npm run seed
```

> El script `seed.js` carga selecciones reales de fútbol, estadios, resultados de fase de grupos y clasificaciones parciales.

5. Ver el estado actual de la base de datos:

```bash
npm run view
```

6. Insertar datos de prueba en todas las colecciones:

```bash
npm run test-insert
```

7. Ejecutar las consultas de ejemplo:

```bash
npm run queries
```

8. En la extensión MongoDB for VS Code, inspeccionar la base de datos `mundial2026` y sus colecciones.

## Documentación de consultas

Ver `queries.md` para la lista de consultas solicitadas, explicaciones y resultados esperados.

## Estructura

- `setup.js`: crea las colecciones y configura validación de JSON Schema + índices.
- `seed.js`: inserta datos reales de selecciones, estadios, partidos, asignación de grupos y resultados parciales de fase de grupos.
- `schema-design.md`: explica el modelo relacional y las relaciones entre colecciones.

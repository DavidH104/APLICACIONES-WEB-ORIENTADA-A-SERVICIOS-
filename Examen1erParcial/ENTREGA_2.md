# Motor Inteligente de Simulación del Mundial 2026
## 2° Entrega - 12/08/2026

---

## 1. Cálculo del Índice de Fuerza (IF)

### ¿Dónde se enseña?
- **Código**: `mongo/api-server.js` → función `computeIFForSelection()` (líneas 88-133)
- **Documentación**: `mongo/consultas.md`

### ¿Qué incluye?
- **15 variables ponderadas** que suman 100%:
  1. Rating ELO: 20%
  2. Ranking FIFA: 10%
  3. Últimos 10 partidos (Forma Reciente): 15%
  4. Historial Mundial: 10%
  5. Historial contra el rival: 5%
  6. Goles anotados: 6%
  7. Goles recibidos: 6%
  8. Diferencia de goles: 5%
  9. Partidos ganados: 4%
  10. Valor de plantilla: 5%
  11. Edad promedio: 3%
  12. Experiencia mundialista: 3%
  13. Localía: 3%
  14. Descanso/Fatiga: 2%
  15. Lesiones/Sanciones: 2%
  16. Condición de Clima: 1%

- **Normalización**: Cada variable se convierte a escala 0-100 antes de ponderar.
- **Cálculo automático**: No se captura manualmente, el sistema lo calcula.
- **Pesos editables**: Panel de administración → pestaña "Pesos IF".

### Demostración en la app
1. Abrir `index.html`
2. Ir a **Simulación** → Consulta 11: *"Índice de Fuerza (IF) de selecciones"*
3. Se muestra tabla con IF y los 15 componentes desglosados.

---

## 2. Alimentación y funcionamiento del modelo Poisson

### ¿Dónde se enseña?
- **Código**: `mongo/api-server.js` → función `poissonSample()` (líneas 65-70)
- **Código**: `mongo/api-server.js` → cálculo de lambda en `monteCarloMatch()` (líneas 184-231)

### ¿Cómo funciona?
- **Algoritmo de Poisson** (Knuth):
  ```javascript
  function poissonSample(lambda) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }
  ```

- **Cálculo de λ (lambda)**:
  ```
  λ_local = Promedio goles local × (Fuerza Local / Fuerza Rival)
  λ_visita = Promedio goles visita × (Fuerza Rival / Fuerza Local)
  ```

### Demostración en la app
1. Ir a **Simulación** → Consulta 12: *"Simulación Monte Carlo (partido)"*
2. Seleccionar dos equipos (ej: México vs Argentina)
3. En los resultados ver:
   - `lambda`: valores λ_local y λ_visita
   - `topScores`: marcadores más probables generados por Poisson

---

## 3. Modelo Monte Carlo

### ¿Dónde se enseña?
- **Código**: `mongo/api-server.js`:
  - `monteCarloMatch()` (líneas 184-231) - Partido individual
  - `simulateGroupMonteCarlo()` (líneas 234-276) - Fase de grupos
  - `simulateTournamentMonteCarlo()` (líneas 291-368) - Torneo completo

### ¿Cómo funciona?
- **Partido**: Repite la simulación Poisson N veces (default 5,000)
- **Grupo**: Simula todos los partidos de la fase de grupos N veces
- **Torneo**: Simula el torneo completo (grupos + eliminatorias) N veces

### Resultados
- Probabilidad de victoria local/visitante/empate
- Promedio de goles
- Distribución de posiciones

### Demostración en la app
1. **Consulta 12**: Simula un partido (ej: 5,000 iteraciones)
2. **Consulta 13**: Simula una fase de grupo completa
3. **Consulta 14**: Simula el torneo completo

---

## 4. Actualización del Rating ELO

### ¿Dónde se enseña?
- **Código**: `mongo/api-server.js` → funciones `computeELOProbability()` y `updateELO()` (líneas 65-86)

### Fórmulas implementadas
1. **Probabilidad esperada**:
   ```
   E_A = 1 / (1 + 10^((R_B - R_A) / 400))
   ```

2. **Actualización del rating**:
   ```
   R'_A = R_A + K × (S_A - E_A)
   ```
   - K = 50 (para partidos de Mundial)
   - S = 1 (victoria), 0.5 (empate), 0 (derrota)

### Características
- **ELO base**: Cada selección tiene un rating inicial entre 1500-2000
- **Actualización dinámica**: Después de cada partido simulado en el torneo
- **Persistencia**: Se guarda en MongoDB al finalizar la simulación del torneo

### Demostración en la app
1. Ir a **Simulación** → Consulta 15: *"Ranking ELO de selecciones"*
2. Muestra tabla ordenada por rating ELO
3. En Consulta 14 (torneo), los ELO se actualizan durante la simulación

---

## Panel de Administración

### Acceso
- Usuario: `admin@mundial.local`
- Contraseña: `admin123`

### Funcionalidades
1. **Pesos IF**: Modificar los 15 pesos del Índice de Fuerza
2. **Selecciones**: Gestionar datos de selecciones incluyendo:
   - ELO
   - Valor de plantilla
   - Edad promedio
   - Experiencia mundialista
   - Títulos mundiales
   - Subcampeonatos
   - Es sede (localía)

---

## Arquitectura del Sistema

```
Frontend (index.html + app.js)
    ↓
API Server (mongo/api-server.js)
    ↓
MongoDB (mundial2026)
    ├── selecciones (con ELO, valor_plantilla, etc.)
    ├── partidos
    ├── config (pesos IF)
    ├── simulaciones (historial)
    └── historial_enfrentamientos
```

---

## Algoritmos implementados

| Algoritmo | Función | Línea |
|-----------|---------|-------|
| Poisson | `poissonSample(lambda)` | 65 |
| ELO Probability | `computeELOProbability(eloA, eloB)` | 68 |
| ELO Update | `updateELO(eloA, eloB, scoreA, scoreB, K)` | 75 |
| IF Calculation | `computeIFForSelection(selDoc, stats, weights)` | 88 |
| Recent Form | `computeRecentForm(db, seleccionId)` | 119 |
| Experience Score | `computeExperienceScore(db, seleccionId, selDoc)` | 145 |
| Monte Carlo Match | `monteCarloMatch(db, localId, visitanteId, iterations, ...)` | 184 |
| Group Simulation | `simulateGroupMonteCarlo(db, groupId, iterations)` | 234 |
| Tournament Simulation | `simulateTournamentMonteCarlo(db, iterations)` | 291 |

---

## Variables de entrada del IF

| Variable | Fuente | Normalización |
|----------|--------|---------------|
| ELO | BD `selecciones.elo` | (elo - 1500) / 500 * 100 |
| Ranking FIFA | BD `selecciones.ranking` | (250 - ranking) / 250 * 100 |
| Forma Reciente | Últimos 10 partidos en BD | Puntos, goles, diferencia |
| Historial Mundial | BD `selecciones.experiencia_mundiales` | mundial * 10 |
| Historial Rival | BD `historial_enfrentamientos` | Victorias/empates normalizados |
| Goles Anotados | Agregación de `partidos` | (gf/pj) * 40 |
| Goles Recibidos | Agregación de `partidos` | 100 - (gc/pj) * 40 |
| Diferencia | gf - gc | (dif + 10) * 5 |
| Partidos Ganados | pg/pj * 100 | Directo |
| Valor Plantilla | BD `selecciones.valor_plantilla` | valor / max_valor * 100 |
| Edad Promedio | BD `selecciones.edad_promedio` | Curva óptimo 27-29 años |
| Experiencia | Cálculo complejo | 4 sub-variables |
| Localía | BD `selecciones.es_sede` | 100 o 0 |
| Fatiga | Default | 80 (sin datos reales) |
| Lesiones | Default | 90 (sin datos reales) |
| Clima | Default | 100 (sin datos reales) |

---

## Notas importantes para el profesor

1. **Datos reales vs defaults**: Algunas variables (Fatiga, Lesiones, Clima) usan valores defaults porque no hay datos históricos en la BD. Se pueden ingresar manualmente desde el panel admin.

2. **ELO persistente**: La actualización del ELO se guarda en MongoDB después de cada simulación de torneo.

3. **Pesos configurables**: Los pesos del IF se pueden modificar desde el panel de administración sin cambiar código.

4. **Escalabilidad**: El sistema está diseñado para agregar más variables fácilmente.

5. **Tecnologías**: Node.js, Express, MongoDB, JavaScript vanilla (sin frameworks).

---

## Archivos principales

| Archivo | Descripción |
|---------|-------------|
| `mongo/api-server.js` | API principal con todos los algoritmos |
| `mongo/poblar-mundial-2026.js` | Seed de datos iniciales |
| `index.html` | Interfaz web |
| `app.js` | Lógica del frontend |
| `mongo/consultas.md` | Documentación técnica |

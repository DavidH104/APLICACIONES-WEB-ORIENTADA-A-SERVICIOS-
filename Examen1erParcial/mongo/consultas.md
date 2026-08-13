# MIS-Mundial 2026 - Documentación de Consultas y Algoritmos

## Algoritmos Implementados

### 1. Rating ELO
- **Función:** `computeELOProbability(eloA, eloB)` - Calcula la probabilidad esperada de victoria del equipo A.
- **Función:** `updateELO(eloA, eloB, scoreA, scoreB, K)` - Actualiza los ratings ELO después de un partido.
- **Campo en BD:** `selecciones.elo` - Rating inicial entre 1500 y 2000.
- **Actualización:** Se actualiza durante simulaciones de torneo (K=50 para partidos de eliminación).

### 2. Índice de Fuerza (IF)
- **Función:** `computeIFForSelection(selDoc, stats, weights)`
- **Pesos por defecto (según PDF):**
  - Rating ELO: 20%
  - Ranking FIFA: 10%
  - Últimos 10 partidos (Forma Reciente): 15%
  - Historial Mundial: 10%
  - Historial contra el rival: 5%
  - Goles anotados: 6%
  - Goles recibidos: 6%
  - Diferencia de goles: 5%
  - Partidos ganados: 4%
  - Valor de plantilla: 5%
  - Edad promedio: 3%
  - Experiencia mundialista: 3%
  - Localía: 3%
  - Descanso/Fatiga: 2%
  - Lesiones/Sanciones: 2%
  - Condición de Clima: 1%

### 3. Forma Reciente
- **Función:** `computeRecentForm(db, seleccionId)`
- Analiza los últimos 10 partidos.
- Puntuación basada en victorias (3 pts), empates (1 pt), derrotas (0 pts).
- Considera goles anotados, recibidos y diferencia.

### 4. Experiencia
- **Función:** `computeExperienceScore(db, seleccionId, selDoc)`
- Componentes:
  - Participaciones mundialistas de los jugadores: 35%
  - Partidos internacionales: 35%
  - Edad promedio: 15% (óptimo 27-29 años)
  - Títulos internacionales: 15%

### 5. Modelo Poisson
- **Función:** `poissonSample(lambda)` - Genera un número de goles según distribución de Poisson.
- **Lambda:** Se calcula combinando el promedio histórico de goles con el ratio de IF.

### 6. Monte Carlo
- **Partido:** `monteCarloMatch(db, localId, visitanteId, iterations, homeAdv, weights, tournamentCtx)`
- **Grupo:** `simulateGroupMonteCarlo(db, groupId, iterations)`
- **Torneo:** `simulateTournamentMonteCarlo(db, iterations)`

## Consultas de Simulación (API `/api/simulacion?consulta=N`)

### Consulta 11 - Índice de Fuerza (IF)
- **Método:** GET
- **Parámetros:** Ninguno
- **Descripción:** Calcula el IF para todas las selecciones con todos los componentes.
- **Respuesta:** Array con `id`, `nombre`, `IF`, `elo`, `components` (todos los componentes del IF).

### Consulta 12 - Simulación Monte Carlo (partido)
- **Método:** GET
- **Parámetros:** `localId`, `visitanteId`, `iter` (opcional, default 5000)
- **Descripción:** Simula un partido entre dos selecciones.
- **Respuesta:** Probabilidades de victoria local/visitante/empate, lambda, topScores, componentes IF, ELO.

### Consulta 13 - Simulación Monte Carlo (grupo)
- **Método:** GET
- **Parámetros:** `groupId`, `iter` (opcional, default 2000)
- **Descripción:** Simula una fase de grupo completa.
- **Respuesta:** Array con `id`, `nombre`, `avgPoints`, `avgGoalsFor`, `avgGoalsAgainst`, `finishPct` (porcentaje de terminar 1ro, 2do, 3ro, 4to).

### Consulta 14 - Simulación Monte Carlo (torneo)
- **Método:** GET
- **Parámetros:** `iter` (opcional, default 1000)
- **Descripción:** Simula el torneo completo.
- **Respuesta:** `champions` (prob. campeón), `finalists`, `semifinalists`, `quarterfinalists`, `round16`, `qualifies` (distribución posiciones grupo), `avgGoals`, `rivals` (rival más probable por fase), `mostCommonChampion`.

### Consulta 15 - Ranking ELO
- **Método:** GET
- **Parámetros:** Ninguno
- **Descripción:** Muestra el ranking ELO de todas las selecciones.
- **Respuesta:** Array con `id`, `nombre`, `elo`, `ranking`, `bandera`.

## Endpoints Adicionales

### GET `/api/simulacion/elo`
- **Descripción:** Obtiene el ranking ELO de todas las selecciones.
- **Respuesta:** Array con `id`, `nombre`, `elo`, `ranking`, `bandera`.

### POST `/api/admin/if-pesos`
- **Descripción:** Actualiza los pesos del IF.
- **Body:** JSON con los pesos (ej: `{"elo": 0.20, "ranking": 0.10, ...}`).

### GET `/api/admin/if-pesos`
- **Descripción:** Obtiene los pesos actuales del IF.

## Métricas Inteligentes (generadas en consulta 14)

- Probabilidad de ganar cada partido
- Probabilidad de empatar
- Probabilidad de perder
- Probabilidad de clasificar a dieciseisavos/octavos/cuartos/semifinales/final
- Probabilidad de ser campeón
- Promedio de goles anotados y recibidos
- Diferencia promedio de goles
- Distribución de posiciones finales en grupo
- Rival más probable en cada fase
- Campeón más frecuente

## Notas Técnicas

- El ELO se actualiza dinámicamente durante las simulaciones de torneo.
- El IF se calcula automáticamente antes de cada simulación.
- Los pesos del IF son configurables desde el panel de administración.
- La normalización de variables se realiza a escala 0-100 antes de ponderar.
- El modelo Poisson usa lambda ajustado por el ratio de IF y el promedio histórico de goles.

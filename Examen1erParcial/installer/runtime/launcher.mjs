import fs from 'node:fs';
import fsp from 'node:fs/promises';
import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const nodeExe = path.join(appRoot, 'runtime', 'node', 'node.exe');
const mongodExe = path.join(appRoot, 'runtime', 'mongodb', 'bin', 'mongod.exe');
const apiScript = path.join(appRoot, 'mongo', 'api-server.js');
const initializerScript = path.join(appRoot, 'mongo', 'initialize-installer-db.js');
const shutdownDbScript = path.join(appRoot, 'mongo', 'shutdown-installer-db.js');
const snapshotDir = path.join(appRoot, 'snapshot');
const dataRoot = path.join(process.env.LOCALAPPDATA || process.env.APPDATA || os.homedir(), 'Mundial2026');
const dbPath = path.join(dataRoot, 'database');
const logsPath = path.join(dataRoot, 'logs');
const statePath = path.join(dataRoot, 'run.json');
const launcherLog = path.join(logsPath, 'launcher.log');
const mongoLog = path.join(logsPath, 'mongodb.log');
const apiLog = path.join(logsPath, 'api.log');
const mongoPort = Number(process.env.MUNDIAL_MONGO_PORT || 27127);
const apiPort = Number(process.env.MUNDIAL_API_PORT || 18080);
const appUrl = `http://127.0.0.1:${apiPort}`;
const mongoUri = `mongodb://127.0.0.1:${mongoPort}`;

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  try {
    fs.mkdirSync(logsPath, { recursive: true });
    fs.appendFileSync(launcherLog, `${line}\n`, 'utf8');
  } catch {
    // La consola de diagnóstico todavía mostrará el mensaje.
  }
}

async function readState() {
  try {
    return JSON.parse(await fsp.readFile(statePath, 'utf8'));
  } catch {
    return null;
  }
}

function isPidRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === 'EPERM';
  }
}

function tcpOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(600);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

function apiHealthy() {
  return new Promise((resolve) => {
    const request = http.get(`${appUrl}/api/health`, { timeout: 1000 }, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.once('timeout', () => {
      request.destroy();
      resolve(false);
    });
    request.once('error', () => resolve(false));
  });
}

function requestApiShutdown(port, token) {
  return new Promise((resolve) => {
    if (!token) return resolve(false);
    const request = http.request({
      host: '127.0.0.1',
      port,
      path: '/api/internal/shutdown',
      method: 'POST',
      timeout: 1500,
      headers: { 'X-Mundial-Shutdown-Token': token }
    }, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });
    request.once('timeout', () => {
      request.destroy();
      resolve(false);
    });
    request.once('error', () => resolve(false));
    request.end();
  });
}

async function waitFor(label, check, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${label} no respondió después de ${Math.ceil(timeoutMs / 1000)} segundos.`);
}

function spawnLogged(executable, args, env) {
  const output = fs.openSync(apiLog, 'a');
  try {
    const child = spawn(executable, args, {
      cwd: appRoot,
      detached: true,
      windowsHide: true,
      env,
      stdio: ['ignore', output, output]
    });
    child.unref();
    return child;
  } finally {
    fs.closeSync(output);
  }
}

function runInitializer(env) {
  return new Promise((resolve, reject) => {
    const output = fs.openSync(apiLog, 'a');
    const child = spawn(nodeExe, [initializerScript], {
      cwd: appRoot,
      windowsHide: true,
      env,
      stdio: ['ignore', output, output]
    });
    fs.closeSync(output);
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`La inicialización de la base terminó con código ${code}. Revisa ${apiLog}.`));
    });
  });
}

function runMongoShutdown(env) {
  return new Promise((resolve) => {
    const output = fs.openSync(apiLog, 'a');
    const child = spawn(nodeExe, [shutdownDbScript], {
      cwd: appRoot,
      windowsHide: true,
      env,
      stdio: ['ignore', output, output]
    });
    fs.closeSync(output);
    child.once('error', () => resolve(false));
    child.once('close', (code) => resolve(code === 0));
  });
}

function openBrowser() {
  if (process.env.MUNDIAL_NO_BROWSER === '1') {
    log('Apertura del navegador omitida por MUNDIAL_NO_BROWSER=1.');
    return;
  }
  const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', appUrl], {
    detached: true,
    windowsHide: true,
    stdio: 'ignore'
  });
  child.unref();
}

function stopPid(pid, label) {
  if (!isPidRunning(pid)) return;
  log(`Deteniendo ${label} (PID ${pid})...`);
  let result = spawnSync('taskkill.exe', ['/PID', String(pid), '/T'], { windowsHide: true, stdio: 'ignore' });
  if (result.status !== 0 && isPidRunning(pid)) {
    result = spawnSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  }
  if (result.status !== 0 && isPidRunning(pid)) log(`No fue posible detener ${label}; PID ${pid}.`);
}

async function stopApplication() {
  const state = await readState();
  if (!state) {
    log('No hay procesos registrados para detener.');
    return;
  }
  const shutdownEnv = {
    ...process.env,
    MUNDIAL_MONGO_URI: `mongodb://127.0.0.1:${state.mongoPort || mongoPort}`,
    MUNDIAL_DB_NAME: 'mundial2026'
  };
  if (await requestApiShutdown(state.apiPort || apiPort, state.shutdownToken)) {
    log('La API recibió la orden de apagado.');
    await waitFor('Cierre de la API', async () => !(await tcpOpen(state.apiPort || apiPort)), 8000).catch(() => {});
  }
  if (await tcpOpen(state.apiPort || apiPort)) stopPid(state.apiPid, 'API');

  await runMongoShutdown(shutdownEnv);
  await waitFor('Cierre de MongoDB', async () => !(await tcpOpen(state.mongoPort || mongoPort)), 10000).catch(() => {});
  if (await tcpOpen(state.mongoPort || mongoPort)) stopPid(state.mongoPid, 'MongoDB local');

  if (await tcpOpen(state.apiPort || apiPort)) throw new Error('La API no se pudo detener; se conservó el registro para reintentar.');
  if (await tcpOpen(state.mongoPort || mongoPort)) throw new Error('MongoDB no se pudo detener; se conservó el registro para reintentar.');
  await fsp.rm(statePath, { force: true });
  log('Aplicación detenida. Los datos se conservaron.');
}

async function validateFiles() {
  const required = [nodeExe, mongodExe, apiScript, initializerScript, shutdownDbScript, path.join(snapshotDir, 'manifest.json')];
  for (const file of required) {
    try {
      await fsp.access(file, fs.constants.R_OK);
    } catch {
      throw new Error(`Falta un archivo requerido de la instalación: ${file}`);
    }
  }
}

async function startApplication() {
  await validateFiles();
  await fsp.mkdir(dbPath, { recursive: true });
  await fsp.mkdir(logsPath, { recursive: true });

  if (await apiHealthy()) {
    log('La aplicación ya estaba iniciada; se abrirá en el navegador.');
    openBrowser();
    return;
  }

  const previousState = await readState();
  let mongoPid = null;
  let startedMongo = false;

  if (await tcpOpen(mongoPort)) {
    if (previousState?.appRoot === appRoot && isPidRunning(previousState.mongoPid)) {
      mongoPid = previousState.mongoPid;
      log(`Reutilizando MongoDB local (PID ${mongoPid}).`);
    } else {
      throw new Error(`El puerto ${mongoPort} está ocupado por otro programa. Cierra ese programa o cambia MUNDIAL_MONGO_PORT.`);
    }
  } else {
    log('Iniciando MongoDB local...');
    const mongo = spawn(mongodExe, [
      '--dbpath', dbPath,
      '--port', String(mongoPort),
      '--bind_ip', '127.0.0.1',
      '--logpath', mongoLog,
      '--logappend'
    ], {
      cwd: appRoot,
      detached: true,
      windowsHide: true,
      stdio: 'ignore'
    });
    mongo.unref();
    mongoPid = mongo.pid;
    startedMongo = true;
    await waitFor('MongoDB local', () => tcpOpen(mongoPort), 20000);
    log(`MongoDB local listo (PID ${mongoPid}).`);
  }

  const env = {
    ...process.env,
    MUNDIAL_MONGO_URI: mongoUri,
    MUNDIAL_DB_NAME: 'mundial2026',
    MUNDIAL_HOST: '127.0.0.1',
    MUNDIAL_SNAPSHOT_DIR: snapshotDir,
    MUNDIAL_SHUTDOWN_TOKEN: crypto.randomBytes(32).toString('hex'),
    PORT: String(apiPort)
  };

  try {
    log('Comprobando la base inicial...');
    await runInitializer(env);
    if (await tcpOpen(apiPort)) {
      throw new Error(`El puerto ${apiPort} está ocupado por otro programa.`);
    }
    log('Iniciando API local...');
    const api = spawnLogged(nodeExe, [apiScript], env);
    await fsp.writeFile(statePath, `${JSON.stringify({
      appRoot,
      apiPid: api.pid,
      mongoPid,
      apiPort,
      mongoPort,
      shutdownToken: env.MUNDIAL_SHUTDOWN_TOKEN,
      startedAt: new Date().toISOString()
    }, null, 2)}\n`, 'utf8');
    await waitFor('La API local', apiHealthy, 20000);
    log(`Aplicación lista en ${appUrl}`);
    openBrowser();
  } catch (error) {
    if (startedMongo) stopPid(mongoPid, 'MongoDB local');
    await fsp.rm(statePath, { force: true });
    throw error;
  }
}

async function main() {
  if (process.argv.includes('--stop')) {
    await stopApplication();
    return;
  }
  await startApplication();
}

main().catch((error) => {
  log(`ERROR: ${error.stack || error.message}`);
  process.exitCode = 1;
});

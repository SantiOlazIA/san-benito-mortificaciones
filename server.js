const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SEMANAS_INICIALES = [
  { id: 'semana-1', titulo: 'Semana 1 (13/11 al 19/11)', inicio: '2026-11-13', fin: '2026-11-19' },
  { id: 'semana-2', titulo: 'Semana 2 (20/11 al 26/11)', inicio: '2026-11-20', fin: '2026-11-26' },
  { id: 'semana-3', titulo: 'Semana 3 (27/11 al 03/12)', inicio: '2026-11-27', fin: '2026-12-03' },
  { id: 'semana-4', titulo: 'Semana 4 (04/12 al 10/12)', inicio: '2026-12-04', fin: '2026-12-10' },
  { id: 'semana-5', titulo: 'Semana 5 (11/12 al 18/12)', inicio: '2026-12-11', fin: '2026-12-18' }
];

const MORTIFICACIONES_INICIALES = {
  '2026-11-13': 'Evitar tomar bebidas frescas o echarles hielo',
  '2026-11-14': 'No usar pantallas recreativamente',
  '2026-11-15': 'Evitar repetirse el plato de comida',
  '2026-11-16': 'No acostarse durante el día',
  '2026-11-17': 'Elegir la tarea más difícil/que más haga falta en la casa y realizarla discretamente',
  '2026-11-18': 'No usar el respaldo en los asientos y sentarse con compostura',
  '2026-11-19': 'No condimentar la comida (sal, aceite, pimienta, vinagre, etc.) y evitar en lo posible comidas muy elaboradas',
  '2026-11-20': 'No tomar gaseosa',
  '2026-11-21': 'No usar sillones u otros asientos cómodos',
  '2026-11-22': 'Lavar los platos del almuerzo y la cena',
  '2026-11-23': 'Limpiar el/los baños de la casa',
  '2026-11-24': 'Elegir una actividad/hobby/gusto que tenía pensado para este día y realizar en cambio una obra de caridad/oración/apostolado.',
  '2026-11-25': 'Adelantar una tarea/trabajo/responsabilidad y realizarla, aunque tenga tiempo de hacerlo más adelante',
  '2026-11-26': 'No acceder a redes sociales',
  '2026-11-27': 'No tomar gaseosa',
  '2026-11-28': 'Cambiar mi desayuno y merienda habitual por algo más sobrio (Ej: Si como pan con dulce, semitas o tortitas, comer solo pan. Evitar bebidas dulces o no ponerle azúcar al té, café, etc.)',
  '2026-11-29': 'Evitar repetirse el plato de comida',
  '2026-11-30': 'Beber únicamente agua',
  '2026-12-01': 'No usar el respaldo en los asientos y sentarse con compostura',
  '2026-12-02': 'Lavar los platos del almuerzo y la cena',
  '2026-12-03': 'Hacerse cargo de sacar la basura, poner y levantar la mesa todas las veces que haga falta durante el día.',
  '2026-12-04': 'No tomar gaseosa',
  '2026-12-05': 'No usar pantallas recreativamente',
  '2026-12-06': 'Limpiar el/los baños de la casa',
  '2026-12-07': 'No acostarse durante el día',
  '2026-12-08': 'Elegir la tarea más difícil/que más haga falta en la casa y realizarla discretamente',
  '2026-12-09': 'No condimentar la comida (sal, aceite, pimienta, vinagre, etc.) y evitar en lo posible comidas muy elaboradas',
  '2026-12-10': '',
  '2026-12-11': 'Elegir una actividad/hobby/gusto que tenía pensado para este día y realizar en cambio una obra de caridad/oración/apostolado.',
  '2026-12-12': 'Evitar tomar bebidas frescas o echarles hielo',
  '2026-12-13': 'No usar sillones u otros asientos cómodos',
  '2026-12-14': 'No acceder a redes sociales',
  '2026-12-15': 'Cambiar mi desayuno y merienda habitual por algo más sobrio (Ej: Si como pan con dulce, semitas o tortitas, comer solo pan. Evitar bebidas dulces o no ponerle azúcar/edulcorante al té, café, etc.)',
  '2026-12-16': 'Beber únicamente agua',
  '2026-12-17': 'Lavar los platos del almuerzo y la cena',
  '2026-12-18': 'No usar pantallas recreativamente'
};

const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
  '/client.js': { file: 'client.js', type: 'application/javascript; charset=utf-8' },
  '/app.js': { file: 'client.js', type: 'application/javascript; charset=utf-8' }
};

function cleanDisplayName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeName(value) {
  return cleanDisplayName(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function makeParticipantId(nombre) {
  const slug = normalizeName(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'participante';
  return `${slug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildInitialState() {
  return {
    mortificaciones: { ...MORTIFICACIONES_INICIALES },
    semanas: SEMANAS_INICIALES.map((s) => ({ ...s })),
    participantes: [],
    config: {
      adminPin: '1234',
      cloudSyncUrl: '',
      tituloGrupo: 'San Benito'
    },
    updatedAt: new Date().toISOString()
  };
}

function normalizeParticipant(raw) {
  const nombre = cleanDisplayName(raw && raw.nombre);
  return {
    id: raw && raw.id ? String(raw.id) : makeParticipantId(nombre),
    nombre,
    creadoEn: raw && raw.creadoEn ? String(raw.creadoEn) : new Date().toISOString(),
    mortificaciones: raw && raw.mortificaciones && typeof raw.mortificaciones === 'object'
      ? { ...raw.mortificaciones }
      : {},
    misas: raw && raw.misas && typeof raw.misas === 'object'
      ? { ...raw.misas }
      : {}
  };
}

function ensureStateShape(raw) {
  const base = buildInitialState();
  if (!raw || typeof raw !== 'object') return base;

  const mortificaciones = raw.mortificaciones && typeof raw.mortificaciones === 'object'
    ? { ...base.mortificaciones, ...raw.mortificaciones }
    : { ...base.mortificaciones };

  const semanas = Array.isArray(raw.semanas) && raw.semanas.length > 0
    ? raw.semanas.map((s) => ({ ...s }))
    : base.semanas;

  const participantes = Array.isArray(raw.participantes)
    ? raw.participantes.filter((p) => p && cleanDisplayName(p.nombre)).map(normalizeParticipant)
    : [];

  const config = {
    ...base.config,
    ...(raw.config && typeof raw.config === 'object' ? raw.config : {})
  };

  return {
    mortificaciones,
    semanas,
    participantes,
    config,
    updatedAt: raw.updatedAt || base.updatedAt
  };
}

const KV_STATE_KEY = 'sanbenito:state:v1';
const BLOB_STATE_PATH = 'sanbenito-state.json';

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

async function kvCommand(kv, commandArgs) {
  const res = await fetch(kv.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kv.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commandArgs)
  });
  if (!res.ok) {
    throw new Error(`Error Vercel KV (${res.status})`);
  }
  const data = await res.json();
  if (data && data.error) {
    throw new Error(data.error);
  }
  return data ? data.result : null;
}

function resolveWritableDataPath(customDataPath) {
  if (customDataPath) return path.resolve(customDataPath);
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'sanbenito-db.json');
  }
  return path.join(__dirname, 'data', 'db.json');
}

function createStore(customDataPath) {
  let activeFilePath = resolveWritableDataPath(customDataPath);
  let memoryCache = null;

  function readFileState() {
    const dir = path.dirname(activeFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(activeFilePath)) {
      const initial = buildInitialState();
      writeFileState(initial);
      return initial;
    }
    try {
      const rawText = fs.readFileSync(activeFilePath, 'utf8');
      return ensureStateShape(JSON.parse(rawText));
    } catch {
      const initial = buildInitialState();
      writeFileState(initial);
      return initial;
    }
  }

  function writeFileState(state) {
    const nextState = ensureStateShape({
      ...state,
      updatedAt: new Date().toISOString()
    });
    try {
      const dir = path.dirname(activeFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${activeFilePath}.${process.pid}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(nextState, null, 2), 'utf8');
      fs.renameSync(tmpPath, activeFilePath);
      return nextState;
    } catch (err) {
      if (!customDataPath && (err.code === 'EROFS' || err.code === 'EACCES')) {
        activeFilePath = path.join(os.tmpdir(), 'sanbenito-db.json');
        const tmpPath = `${activeFilePath}.${process.pid}.${Date.now()}.tmp`;
        fs.writeFileSync(tmpPath, JSON.stringify(nextState, null, 2), 'utf8');
        fs.renameSync(tmpPath, activeFilePath);
        return nextState;
      }
      throw err;
    }
  }

  async function readBlobState() {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: BLOB_STATE_PATH, limit: 1 });
    const match = blobs.find((b) => b.pathname === BLOB_STATE_PATH) || blobs[0];
    if (!match) {
      if (memoryCache) return memoryCache;
      const initial = buildInitialState();
      return writeBlobState(initial);
    }
    const base = match.downloadUrl || match.url;
    const sep = base.includes('?') ? '&' : '?';
    const res = await fetch(`${base}${sep}t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      if (memoryCache) return memoryCache;
      throw new Error(`Error leyendo Vercel Blob (${res.status})`);
    }
    const remoteState = ensureStateShape(await res.json());
    if (memoryCache && memoryCache.updatedAt && remoteState.updatedAt && memoryCache.updatedAt > remoteState.updatedAt) {
      return memoryCache;
    }
    memoryCache = remoteState;
    return remoteState;
  }

  async function writeBlobState(state) {
    const { put } = await import('@vercel/blob');
    const nextState = ensureStateShape({
      ...state,
      updatedAt: new Date().toISOString()
    });
    memoryCache = nextState;
    await put(BLOB_STATE_PATH, JSON.stringify(nextState, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
      contentType: 'application/json'
    });
    return nextState;
  }

  function hasBlobConfig() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
  }

  async function readState() {
    const kv = customDataPath ? null : getKvConfig();
    if (kv) {
      const raw = await kvCommand(kv, ['GET', KV_STATE_KEY]);
      if (!raw) {
        const initial = buildInitialState();
        await kvCommand(kv, ['SET', KV_STATE_KEY, JSON.stringify(initial)]);
        return initial;
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return ensureStateShape(parsed);
    }
    if (!customDataPath && hasBlobConfig()) {
      return readBlobState();
    }
    return readFileState();
  }

  async function writeState(state) {
    const kv = customDataPath ? null : getKvConfig();
    if (kv) {
      const nextState = ensureStateShape({
        ...state,
        updatedAt: new Date().toISOString()
      });
      await kvCommand(kv, ['SET', KV_STATE_KEY, JSON.stringify(nextState)]);
      return nextState;
    }
    if (!customDataPath && hasBlobConfig()) {
      return writeBlobState(state);
    }
    return writeFileState(state);
  }

  return { readState, writeState };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(req.body.trim() ? JSON.parse(req.body) : {});
    } catch {
      return Promise.reject(new Error('JSON inválido'));
    }
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Payload demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

function createRequestHandler(customDataPath) {
  const store = createStore(customDataPath);

  return async (req, res) => {
    const reqUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = reqUrl.pathname;

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && pathname === '/api/state') {
      try {
        const state = await store.readState();
        sendJson(res, 200, state);
      } catch (err) {
        sendJson(res, 500, { ok: false, error: err.message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/participant/register') {
      try {
        const body = await parseJsonBody(req);
        const cleanName = cleanDisplayName(body.nombre);
        if (!cleanName) {
          sendJson(res, 400, { ok: false, error: 'El nombre es obligatorio' });
          return;
        }
        const state = await store.readState();
        const targetNorm = normalizeName(cleanName);
        let participante = state.participantes.find((p) => normalizeName(p.nombre) === targetNorm);

        if (!participante) {
          participante = normalizeParticipant({ nombre: cleanName });
          state.participantes.push(participante);
          const saved = await store.writeState(state);
          const savedParticipant = saved.participantes.find((p) => p.id === participante.id);
          sendJson(res, 200, { ok: true, participante: savedParticipant, state: saved });
          return;
        }

        sendJson(res, 200, { ok: true, participante, state });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/participant/toggle') {
      try {
        const body = await parseJsonBody(req);
        const cleanName = cleanDisplayName(body.nombre);
        const tipo = body.tipo;
        const key = String(body.key || '').trim();
        const valor = Boolean(body.valor);

        if (!cleanName && !body.participanteId) {
          sendJson(res, 400, { ok: false, error: 'Falta identificar al participante' });
          return;
        }
        if (tipo !== 'mortificacion' && tipo !== 'misa') {
          sendJson(res, 400, { ok: false, error: 'Tipo inválido (debe ser mortificacion o misa)' });
          return;
        }
        if (!key) {
          sendJson(res, 400, { ok: false, error: 'Falta la clave de fecha o semana' });
          return;
        }

        const state = await store.readState();
        let participante = null;
        if (body.participanteId) {
          participante = state.participantes.find((p) => p.id === body.participanteId);
        }
        if (!participante && cleanName) {
          const targetNorm = normalizeName(cleanName);
          participante = state.participantes.find((p) => normalizeName(p.nombre) === targetNorm);
        }
        if (!participante) {
          participante = normalizeParticipant({ nombre: cleanName });
          state.participantes.push(participante);
        }

        const bucket = tipo === 'mortificacion' ? participante.mortificaciones : participante.misas;
        if (valor) {
          bucket[key] = true;
        } else {
          delete bucket[key];
        }

        const saved = await store.writeState(state);
        const updatedParticipant = saved.participantes.find((p) => p.id === participante.id);
        sendJson(res, 200, { ok: true, participante: updatedParticipant, state: saved });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/state') {
      try {
        const body = await parseJsonBody(req);
        const current = await store.readState();
        const next = {
          ...current,
          ...(body.mortificaciones && typeof body.mortificaciones === 'object'
            ? { mortificaciones: body.mortificaciones }
            : {}),
          ...(Array.isArray(body.semanas) ? { semanas: body.semanas } : {}),
          ...(Array.isArray(body.participantes) ? { participantes: body.participantes } : {}),
          ...(body.config && typeof body.config === 'object'
            ? { config: { ...current.config, ...body.config } }
            : {})
        };
        const saved = await store.writeState(next);
        sendJson(res, 200, { ok: true, state: saved });
      } catch (err) {
        sendJson(res, 400, { ok: false, error: err.message });
      }
      return;
    }

    if (req.method === 'GET' && STATIC_FILES[pathname]) {
      const asset = STATIC_FILES[pathname];
      const filePath = path.join(__dirname, 'public', asset.file);
      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': asset.type, 'Cache-Control': 'no-cache' });
        res.end(content);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Archivo no encontrado');
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Ruta no encontrada');
  };
}

function createServer(customDataPath) {
  return http.createServer(createRequestHandler(customDataPath));
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = createServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor San Benito escuchando en http://localhost:${port}`);
  });
}

const appHandler = createRequestHandler();
appHandler.createServer = createServer;
appHandler.createRequestHandler = createRequestHandler;
appHandler.SEMANAS_INICIALES = SEMANAS_INICIALES;
appHandler.MORTIFICACIONES_INICIALES = MORTIFICACIONES_INICIALES;
appHandler.buildInitialState = buildInitialState;

module.exports = appHandler;

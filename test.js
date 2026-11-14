const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createServer } = require('./server');

async function runTests() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sanbenito-test-'));
  const dbPath = path.join(tmpDir, 'db.json');
  const server = createServer(dbPath);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Verificar estáticos principales
    for (const staticPath of ['/', '/index.html', '/styles.css', '/app.js']) {
      const staticRes = await fetch(`${baseUrl}${staticPath}`);
      assert.strictEqual(staticRes.status, 200, `Debe servir ${staticPath} con 200`);
    }

    // 2. GET /api/state inicial: 36 fechas y 5 semanas
    const stateRes = await fetch(`${baseUrl}/api/state`);
    assert.strictEqual(stateRes.status, 200);
    const initialState = await stateRes.json();
    const fechas = Object.keys(initialState.mortificaciones).sort();
    assert.strictEqual(fechas.length, 36, 'Debe tener exactamente 36 fechas');
    assert.strictEqual(fechas[0], '2026-11-13');
    assert.strictEqual(fechas[fechas.length - 1], '2026-12-18');
    assert.strictEqual(initialState.mortificaciones['2026-11-14'], 'No usar pantallas recreativamente');
    assert.strictEqual(initialState.mortificaciones['2026-12-10'], '');
    assert.strictEqual(initialState.semanas.length, 5, 'Debe tener 5 semanas');
    assert.strictEqual(initialState.semanas[0].id, 'semana-1');
    assert.strictEqual(initialState.semanas[4].id, 'semana-5');

    // 3. POST /api/participant/register y persistencia en disco
    const reg1Res = await fetch(`${baseUrl}/api/participant/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Juan Marcos' })
    });
    assert.strictEqual(reg1Res.status, 200);
    const reg1 = await reg1Res.json();
    assert.strictEqual(reg1.ok, true);
    assert.strictEqual(reg1.participante.nombre, 'Juan Marcos');
    assert.ok(fs.existsSync(dbPath), 'db.json debe existir en disco');

    // Registro duplicado insensible a mayúsculas/espacios no debe duplicar participante
    const regDupRes = await fetch(`${baseUrl}/api/participant/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: '  juan   marcos ' })
    });
    const regDup = await regDupRes.json();
    assert.strictEqual(regDup.state.participantes.length, 1);

    // Segundo participante
    await fetch(`${baseUrl}/api/participant/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Santi O' })
    });

    // 4. POST /api/participant/toggle atómico (marcar y desmarcar)
    const toggleMortOn = await fetch(`${baseUrl}/api/participant/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan Marcos',
        tipo: 'mortificacion',
        key: '2026-11-14',
        valor: true
      })
    });
    const mortOnJson = await toggleMortOn.json();
    assert.strictEqual(mortOnJson.ok, true);
    assert.strictEqual(mortOnJson.participante.mortificaciones['2026-11-14'], true);

    const toggleMisaOn = await fetch(`${baseUrl}/api/participant/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan Marcos',
        tipo: 'misa',
        key: 'semana-1',
        valor: true
      })
    });
    const misaOnJson = await toggleMisaOn.json();
    assert.strictEqual(misaOnJson.participante.misas['semana-1'], true);
    assert.strictEqual(misaOnJson.participante.mortificaciones['2026-11-14'], true);

    // Otro participante marca sin afectar al primero
    const toggleSanti = await fetch(`${baseUrl}/api/participant/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Santi O',
        tipo: 'misa',
        key: 'semana-1',
        valor: true
      })
    });
    const santiJson = await toggleSanti.json();
    assert.strictEqual(santiJson.state.participantes.length, 2);

    // Desmarcar mortificación
    const toggleMortOff = await fetch(`${baseUrl}/api/participant/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan Marcos',
        tipo: 'mortificacion',
        key: '2026-11-14',
        valor: false
      })
    });
    const mortOffJson = await toggleMortOff.json();
    assert.strictEqual(mortOffJson.participante.mortificaciones['2026-11-14'], undefined);
    assert.strictEqual(mortOffJson.participante.misas['semana-1'], true);

    // 5. POST /api/state actualiza consigna de 2026-12-10
    const nextMort = {
      ...mortOffJson.state.mortificaciones,
      '2026-12-10': 'Ofrecer el día por las almas del purgatorio'
    };
    const updateRes = await fetch(`${baseUrl}/api/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mortificaciones: nextMort })
    });
    assert.strictEqual(updateRes.status, 200);
    const updatedJson = await updateRes.json();
    assert.strictEqual(updatedJson.state.mortificaciones['2026-12-10'], 'Ofrecer el día por las almas del purgatorio');

    // Verificar persistencia re-leyendo GET /api/state
    const verifyRes = await fetch(`${baseUrl}/api/state`);
    const verifyJson = await verifyRes.json();
    assert.strictEqual(verifyJson.mortificaciones['2026-12-10'], 'Ofrecer el día por las almas del purgatorio');
    const juanFinal = verifyJson.participantes.find((p) => p.nombre === 'Juan Marcos');
    assert.strictEqual(juanFinal.misas['semana-1'], true);

    console.log('Todas las pruebas pasaron correctamente (5/5).');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

runTests().catch((err) => {
  console.error('Error en pruebas:', err);
  process.exit(1);
});

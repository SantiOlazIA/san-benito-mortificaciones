(function () {
  'use strict';

  const STORAGE_KEYS = {
    STATE: 'sanbenito_state_v1',
    USER: 'sanbenito_participante_actual',
    CLOUD_URL: 'sanbenito_cloud_url',
    ADMIN_UNLOCKED: 'sanbenito_admin_unlocked'
  };

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

  const CAMPAMENTO_PARTICIPANTES = [
    'Santi O', 'Franco', 'Tobi', 'Enzo', 'Ponchi', 'Juli',
    'Jose María', 'Agus O', 'Pablo', 'JM Olaz', 'Marcos',
    'Juan Marcos', 'Alexis', 'Pablo M', 'Fran Sosa', 'Mathi',
    'Gaby', 'Lucas'
  ];

  const SUGERENCIA_10_12 = 'Adelantar una tarea/trabajo/responsabilidad y realizarla, aunque tenga tiempo de hacerlo más adelante';

  const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function cleanDisplayName(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeName(value) {
    return cleanDisplayName(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getTodayLocalISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseISODateLocal(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function formatDateLong(iso) {
    const dt = parseISODateLocal(iso);
    const dayName = DIAS_SEMANA[dt.getDay()];
    const dayNum = dt.getDate();
    const monthName = MESES[dt.getMonth()];
    return `${dayName} ${dayNum} de ${monthName}`;
  }

  function formatDateShort(iso) {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  }

  function buildDefaultState() {
    return {
      mortificaciones: { ...MORTIFICACIONES_INICIALES },
      semanas: SEMANAS_INICIALES.map((s) => ({ ...s })),
      participantes: [],
      config: {
        adminPin: '1234',
        cloudSyncUrl: localStorage.getItem(STORAGE_KEYS.CLOUD_URL) || '',
        tituloGrupo: 'San Benito'
      },
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeParticipant(raw) {
    const nombre = cleanDisplayName(raw && raw.nombre);
    return {
      id: raw && raw.id ? String(raw.id) : `${normalizeName(nombre).replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      nombre,
      creadoEn: raw && raw.creadoEn ? String(raw.creadoEn) : new Date().toISOString(),
      mortificaciones: raw && raw.mortificaciones && typeof raw.mortificaciones === 'object' ? { ...raw.mortificaciones } : {},
      misas: raw && raw.misas && typeof raw.misas === 'object' ? { ...raw.misas } : {}
    };
  }

  function ensureStateShape(raw) {
    const base = buildDefaultState();
    if (!raw || typeof raw !== 'object') return base;
    return {
      mortificaciones: raw.mortificaciones && typeof raw.mortificaciones === 'object'
        ? { ...base.mortificaciones, ...raw.mortificaciones }
        : base.mortificaciones,
      semanas: Array.isArray(raw.semanas) && raw.semanas.length > 0
        ? raw.semanas.map((s) => ({ ...s }))
        : base.semanas,
      participantes: Array.isArray(raw.participantes)
        ? raw.participantes.filter((p) => p && cleanDisplayName(p.nombre)).map(normalizeParticipant)
        : [],
      config: {
        ...base.config,
        ...(raw.config && typeof raw.config === 'object' ? raw.config : {})
      },
      updatedAt: raw.updatedAt || base.updatedAt
    };
  }

  const StorageService = {
    hasServerApi: false,
    syncMode: 'local',

    readLocal() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.STATE);
        return raw ? ensureStateShape(JSON.parse(raw)) : buildDefaultState();
      } catch {
        return buildDefaultState();
      }
    },

    writeLocal(state) {
      const normalized = ensureStateShape(state);
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(normalized));
      if (normalized.config && typeof normalized.config.cloudSyncUrl === 'string') {
        localStorage.setItem(STORAGE_KEYS.CLOUD_URL, normalized.config.cloudSyncUrl.trim());
      }
      return normalized;
    },

    getCloudUrl(state) {
      const fromState = state && state.config ? cleanDisplayName(state.config.cloudSyncUrl) : '';
      const fromLocal = cleanDisplayName(localStorage.getItem(STORAGE_KEYS.CLOUD_URL));
      return fromState || fromLocal;
    },

    async loadState() {
      const local = this.readLocal();

      if (window.location.protocol !== 'file:') {
        try {
          const res = await fetch('/api/state', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data && data.mortificaciones) {
              this.hasServerApi = true;
              this.syncMode = 'server';
              return this.writeLocal(data);
            }
          }
        } catch {
          // Modo estático o sin conexión al servidor local
        }
      }

      const cloudUrl = this.getCloudUrl(local);
      if (cloudUrl) {
        try {
          const res = await fetch(cloudUrl, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object' && data.mortificaciones) {
              this.syncMode = 'cloud';
              return this.writeLocal(data);
            }
            // Si la base en la nube está vacía (ej. Firebase nuevo retorna null), inicializamos con local
            if (data === null) {
              await this.pushCloud(cloudUrl, local);
              this.syncMode = 'cloud';
              return local;
            }
          }
        } catch {
          this.syncMode = 'offline';
          return local;
        }
      }

      this.syncMode = 'local';
      return local;
    },

    async pushCloud(cloudUrl, state) {
      if (!cloudUrl) return false;
      const res = await fetch(cloudUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      return res.ok;
    },

    async registerParticipant(nombre, currentState) {
      const clean = cleanDisplayName(nombre);
      if (this.hasServerApi) {
        const res = await fetch('/api/participant/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: clean })
        });
        if (!res.ok) throw new Error('No se pudo registrar el participante');
        const data = await res.json();
        const saved = this.writeLocal(data.state);
        return { participante: data.participante, state: saved };
      }

      let base = currentState;
      const cloudUrl = this.getCloudUrl(currentState);
      if (cloudUrl) {
        try {
          const remoteRes = await fetch(cloudUrl, { cache: 'no-store' });
          if (remoteRes.ok) {
            const remoteData = await remoteRes.json();
            if (remoteData && remoteData.mortificaciones) base = ensureStateShape(remoteData);
          }
        } catch {
          // Usa estado local si no hay red
        }
      }

      const targetNorm = normalizeName(clean);
      let participante = base.participantes.find((p) => normalizeName(p.nombre) === targetNorm);
      if (!participante) {
        participante = normalizeParticipant({ nombre: clean });
        base.participantes.push(participante);
        base.updatedAt = new Date().toISOString();
      }
      const saved = this.writeLocal(base);
      if (cloudUrl) {
        await this.pushCloud(cloudUrl, saved).catch(() => {});
      }
      return { participante, state: saved };
    },

    async toggleCheck({ participanteId, nombre, tipo, key, valor }, currentState) {
      if (this.hasServerApi) {
        const res = await fetch('/api/participant/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participanteId, nombre, tipo, key, valor })
        });
        if (!res.ok) throw new Error('No se pudo guardar el cambio');
        const data = await res.json();
        const saved = this.writeLocal(data.state);
        const cloudUrl = this.getCloudUrl(saved);
        if (cloudUrl) this.pushCloud(cloudUrl, saved).catch(() => {});
        return saved;
      }

      let base = ensureStateShape(currentState);
      const cloudUrl = this.getCloudUrl(base);
      if (cloudUrl) {
        try {
          const remoteRes = await fetch(cloudUrl, { cache: 'no-store' });
          if (remoteRes.ok) {
            const remoteData = await remoteRes.json();
            if (remoteData && remoteData.mortificaciones) base = ensureStateShape(remoteData);
          }
        } catch {
          // Fallback offline
        }
      }

      let participante = base.participantes.find((p) => p.id === participanteId);
      if (!participante && nombre) {
        const norm = normalizeName(nombre);
        participante = base.participantes.find((p) => normalizeName(p.nombre) === norm);
      }
      if (!participante) {
        participante = normalizeParticipant({ nombre: nombre || 'Participante' });
        base.participantes.push(participante);
      }

      const bucket = tipo === 'mortificacion' ? participante.mortificaciones : participante.misas;
      if (valor) {
        bucket[key] = true;
      } else {
        delete bucket[key];
      }
      base.updatedAt = new Date().toISOString();

      const saved = this.writeLocal(base);
      if (cloudUrl) {
        const ok = await this.pushCloud(cloudUrl, saved).catch(() => false);
        this.syncMode = ok ? 'cloud' : 'offline';
      }
      return saved;
    },

    async saveAdminState(partialState, currentState) {
      const merged = ensureStateShape({
        ...currentState,
        ...partialState,
        config: {
          ...(currentState.config || {}),
          ...(partialState.config || {})
        },
        updatedAt: new Date().toISOString()
      });

      if (this.hasServerApi) {
        const res = await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merged)
        });
        if (!res.ok) throw new Error('Error al guardar en el servidor');
        const data = await res.json();
        const saved = this.writeLocal(data.state);
        const cloudUrl = this.getCloudUrl(saved);
        if (cloudUrl) await this.pushCloud(cloudUrl, saved).catch(() => {});
        return saved;
      }

      const saved = this.writeLocal(merged);
      const cloudUrl = this.getCloudUrl(saved);
      if (cloudUrl) {
        const ok = await this.pushCloud(cloudUrl, saved).catch(() => false);
        this.syncMode = ok ? 'cloud' : 'offline';
      }
      return saved;
    }
  };

  // Estado en memoria de la UI
  const ui = {
    state: buildDefaultState(),
    currentUser: null, // { id, nombre }
    selectedDate: getTodayLocalISO(),
    todayISO: getTodayLocalISO(),
    isAdminView: false,
    adminUnlocked: localStorage.getItem(STORAGE_KEYS.ADMIN_UNLOCKED) === '1',
    activeAdminTab: 'seguimiento',
    expandedWeeks: new Set(),
    detailParticipantId: null
  };

  // Referencias DOM
  const els = {
    syncStatusBadge: document.getElementById('syncStatusBadge'),
    userChip: document.getElementById('userChip'),
    currentUserName: document.getElementById('currentUserName'),
    btnSwitchUser: document.getElementById('btnSwitchUser'),
    btnToggleAdmin: document.getElementById('btnToggleAdmin'),

    participantView: document.getElementById('participantView'),
    btnPrevDay: document.getElementById('btnPrevDay'),
    btnNextDay: document.getElementById('btnNextDay'),
    btnGoToday: document.getElementById('btnGoToday'),
    selectedDayBadge: document.getElementById('selectedDayBadge'),
    selectedDateHeading: document.getElementById('selectedDateHeading'),
    selectedWeekLabel: document.getElementById('selectedWeekLabel'),
    dayStatusPill: document.getElementById('dayStatusPill'),
    selectedMortificationText: document.getElementById('selectedMortificationText'),
    btnToggleTodayMort: document.getElementById('btnToggleTodayMort'),
    weekMassPill: document.getElementById('weekMassPill'),
    weekMassDescription: document.getElementById('weekMassDescription'),
    btnToggleWeekMass: document.getElementById('btnToggleWeekMass'),

    statMortToDate: document.getElementById('statMortToDate'),
    barMortToDate: document.getElementById('barMortToDate'),
    statMortToDateSub: document.getElementById('statMortToDateSub'),
    statMisas: document.getElementById('statMisas'),
    barMisas: document.getElementById('barMisas'),
    statMisasSub: document.getElementById('statMisasSub'),
    statMortTotal: document.getElementById('statMortTotal'),
    barMortTotal: document.getElementById('barMortTotal'),
    statMortTotalSub: document.getElementById('statMortTotalSub'),
    weeksAccordion: document.getElementById('weeksAccordion'),

    adminView: document.getElementById('adminView'),
    btnRefreshAdmin: document.getElementById('btnRefreshAdmin'),
    btnLockAdmin: document.getElementById('btnLockAdmin'),
    kpiTotalParticipants: document.getElementById('kpiTotalParticipants'),
    kpiTodayDone: document.getElementById('kpiTodayDone'),
    kpiTodayMissing: document.getElementById('kpiTodayMissing'),
    kpiMassDone: document.getElementById('kpiMassDone'),
    kpiMassMissing: document.getElementById('kpiMassMissing'),
    kpiGroupAvg: document.getElementById('kpiGroupAvg'),
    adminSearchInput: document.getElementById('adminSearchInput'),
    adminFilterSelect: document.getElementById('adminFilterSelect'),
    btnLoadCampList: document.getElementById('btnLoadCampList'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    addParticipantForm: document.getElementById('addParticipantForm'),
    newParticipantInput: document.getElementById('newParticipantInput'),
    thTodayMort: document.getElementById('thTodayMort'),
    adminTableBody: document.getElementById('adminTableBody'),
    adminEmptyState: document.getElementById('adminEmptyState'),

    emptyDayAlert: document.getElementById('emptyDayAlert'),
    btnFillDec10Suggestion: document.getElementById('btnFillDec10Suggestion'),
    mortEditorList: document.getElementById('mortEditorList'),
    btnSaveMortificaciones: document.getElementById('btnSaveMortificaciones'),
    addDateForm: document.getElementById('addDateForm'),
    newDateInput: document.getElementById('newDateInput'),
    newDateTextInput: document.getElementById('newDateTextInput'),

    pinConfigForm: document.getElementById('pinConfigForm'),
    newPinInput: document.getElementById('newPinInput'),
    cloudConfigForm: document.getElementById('cloudConfigForm'),
    cloudUrlInput: document.getElementById('cloudUrlInput'),
    btnClearCloudUrl: document.getElementById('btnClearCloudUrl'),

    welcomeModal: document.getElementById('welcomeModal'),
    existingUsersWrap: document.getElementById('existingUsersWrap'),
    existingUsersList: document.getElementById('existingUsersList'),
    loginForm: document.getElementById('loginForm'),
    loginNameInput: document.getElementById('loginNameInput'),
    btnWelcomeAdmin: document.getElementById('btnWelcomeAdmin'),

    pinModal: document.getElementById('pinModal'),
    pinLoginForm: document.getElementById('pinLoginForm'),
    pinPromptInput: document.getElementById('pinPromptInput'),
    pinErrorMsg: document.getElementById('pinErrorMsg'),
    btnCancelPin: document.getElementById('btnCancelPin'),

    detailModal: document.getElementById('detailModal'),
    detailModalTitle: document.getElementById('detailModalTitle'),
    detailModalBody: document.getElementById('detailModalBody'),
    btnCloseDetailModal: document.getElementById('btnCloseDetailModal'),

    toastContainer: document.getElementById('toastContainer')
  };

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function getSortedDates() {
    return Object.keys(ui.state.mortificaciones).sort();
  }

  function getClampDate(targetISO) {
    const dates = getSortedDates();
    if (dates.length === 0) return targetISO;
    if (ui.state.mortificaciones[targetISO] !== undefined) return targetISO;
    if (targetISO < dates[0]) return dates[0];
    if (targetISO > dates[dates.length - 1]) return dates[dates.length - 1];
    return dates.find((d) => d >= targetISO) || dates[dates.length - 1];
  }

  function getWeekForDate(dateISO) {
    const weeks = ui.state.semanas || [];
    const found = weeks.find((w) => dateISO >= w.inicio && dateISO <= w.fin);
    if (found) return found;
    if (weeks.length === 0) return { id: 'semana-1', titulo: 'Semana 1', inicio: dateISO, fin: dateISO };
    if (dateISO < weeks[0].inicio) return weeks[0];
    return weeks[weeks.length - 1];
  }

  function getCurrentParticipant() {
    if (!ui.currentUser) return null;
    const byId = ui.state.participantes.find((p) => p.id === ui.currentUser.id);
    if (byId) return byId;
    const norm = normalizeName(ui.currentUser.nombre);
    return ui.state.participantes.find((p) => normalizeName(p.nombre) === norm) || null;
  }

  function updateSyncBadge() {
    const badge = els.syncStatusBadge;
    badge.classList.remove('sync-ok', 'sync-warn', 'sync-local');
    if (StorageService.syncMode === 'server') {
      badge.textContent = 'Conectado al servidor';
      badge.classList.add('sync-ok');
    } else if (StorageService.syncMode === 'cloud') {
      badge.textContent = 'Sincronizado en la nube';
      badge.classList.add('sync-ok');
    } else if (StorageService.syncMode === 'offline') {
      badge.textContent = 'Sin conexión (guardado local)';
      badge.classList.add('sync-warn');
    } else {
      badge.textContent = 'Guardado en este dispositivo';
      badge.classList.add('sync-local');
    }
  }

  function getParticipantStats(participante) {
    const dates = getSortedDates();
    const effectiveToday = getClampDate(ui.todayISO);
    const datesToToday = ui.todayISO < dates[0]
      ? []
      : dates.filter((d) => d <= effectiveToday);

    const mortDoneTotal = dates.filter((d) => Boolean(participante.mortificaciones[d])).length;
    const mortDoneToDate = datesToToday.filter((d) => Boolean(participante.mortificaciones[d])).length;
    const misasDone = (ui.state.semanas || []).filter((w) => Boolean(participante.misas[w.id])).length;

    const toDateTotal = datesToToday.length;
    const toDatePct = toDateTotal > 0 ? Math.round((mortDoneToDate / toDateTotal) * 100) : 0;

    return {
      mortDoneTotal,
      totalDays: dates.length,
      mortDoneToDate,
      toDateTotal,
      toDatePct,
      misasDone,
      totalWeeks: (ui.state.semanas || []).length
    };
  }

  function renderTopbar() {
    updateSyncBadge();
    if (ui.currentUser) {
      els.userChip.classList.remove('hidden');
      els.currentUserName.textContent = ui.currentUser.nombre;
    } else {
      els.userChip.classList.add('hidden');
    }

    els.btnToggleAdmin.textContent = ui.isAdminView ? 'Volver a Mi Vista' : 'Panel Encargado';
  }

  function renderWelcomeModal() {
    const existing = [...ui.state.participantes].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (existing.length > 0) {
      els.existingUsersWrap.classList.remove('hidden');
      els.existingUsersList.innerHTML = existing.map((p) => (
        `<button type="button" class="user-pick-btn" data-pick-id="${escapeHtml(p.id)}">${escapeHtml(p.nombre)}</button>`
      )).join('');
    } else {
      els.existingUsersWrap.classList.add('hidden');
      els.existingUsersList.innerHTML = '';
    }
  }

  function renderParticipantView() {
    const participant = getCurrentParticipant();
    if (!participant) {
      els.participantView.classList.add('hidden');
      return;
    }

    els.participantView.classList.remove('hidden');
    const dates = getSortedDates();
    const selectedDate = getClampDate(ui.selectedDate);
    ui.selectedDate = selectedDate;

    const idx = dates.indexOf(selectedDate);
    els.btnPrevDay.disabled = idx <= 0;
    els.btnNextDay.disabled = idx < 0 || idx >= dates.length - 1;

    const effectiveToday = getClampDate(ui.todayISO);
    const isViewingToday = selectedDate === effectiveToday;
    els.btnGoToday.classList.toggle('hidden', isViewingToday);
    els.selectedDayBadge.textContent = selectedDate === ui.todayISO ? 'HOY' : formatDateShort(selectedDate);
    els.selectedDateHeading.textContent = formatDateLong(selectedDate);

    const week = getWeekForDate(selectedDate);
    els.selectedWeekLabel.textContent = week.titulo;

    // Mortificación del día
    const mortText = cleanDisplayName(ui.state.mortificaciones[selectedDate]);
    const isMortDone = Boolean(participant.mortificaciones[selectedDate]);

    if (mortText) {
      els.selectedMortificationText.textContent = mortText;
      els.selectedMortificationText.classList.remove('mortification-empty');
    } else {
      els.selectedMortificationText.textContent = 'Consigna aún no definida por el encargado para este día.';
      els.selectedMortificationText.classList.add('mortification-empty');
    }

    els.dayStatusPill.textContent = isMortDone ? '✓ Cumplida' : 'Pendiente';
    els.dayStatusPill.className = `pill ${isMortDone ? 'pill-done' : 'pill-pending'}`;

    els.btnToggleTodayMort.textContent = isMortDone
      ? '✓ ¡Mortificación Cumplida! (Tocar para desmarcar)'
      : 'Marcar Mortificación como Cumplida';
    els.btnToggleTodayMort.classList.toggle('is-done', isMortDone);

    // Misa semanal
    const isMassDone = Boolean(participant.misas[week.id]);
    els.weekMassDescription.textContent = `Participación en la Santa Misa correspondiente a ${week.titulo}.`;
    els.weekMassPill.textContent = isMassDone ? '✓ Cumplida' : 'Pendiente';
    els.weekMassPill.className = `pill ${isMassDone ? 'pill-done' : 'pill-pending'}`;
    els.btnToggleWeekMass.textContent = isMassDone
      ? '✓ ¡Misa Semanal Cumplida! (Tocar para desmarcar)'
      : 'Marcar Misa de la Semana como Cumplida';
    els.btnToggleWeekMass.classList.toggle('is-done', isMassDone);

    // Estadísticas
    const stats = getParticipantStats(participant);
    els.statMortToDate.textContent = `${stats.mortDoneToDate} / ${stats.toDateTotal}`;
    els.barMortToDate.style.width = `${stats.toDatePct}%`;
    els.statMortToDateSub.textContent = `${stats.toDatePct}% de los días transcurridos`;

    const massPct = stats.totalWeeks > 0 ? Math.round((stats.misasDone / stats.totalWeeks) * 100) : 0;
    els.statMisas.textContent = `${stats.misasDone} / ${stats.totalWeeks}`;
    els.barMisas.style.width = `${massPct}%`;
    els.statMisasSub.textContent = `${massPct}% de las ${stats.totalWeeks} semanas`;

    const totalPct = stats.totalDays > 0 ? Math.round((stats.mortDoneTotal / stats.totalDays) * 100) : 0;
    els.statMortTotal.textContent = `${stats.mortDoneTotal} / ${stats.totalDays}`;
    els.barMortTotal.style.width = `${totalPct}%`;
    els.statMortTotalSub.textContent = `${totalPct}% del camino completo (13/11 al 18/12)`;

    // Semanas Accordion
    if (ui.expandedWeeks.size === 0) {
      ui.expandedWeeks.add(getWeekForDate(effectiveToday).id);
    }

    els.weeksAccordion.innerHTML = (ui.state.semanas || []).map((w) => {
      const weekDates = dates.filter((d) => d >= w.inicio && d <= w.fin);
      const doneInWeek = weekDates.filter((d) => Boolean(participant.mortificaciones[d])).length;
      const massDone = Boolean(participant.misas[w.id]);
      const isExpanded = ui.expandedWeeks.has(w.id);

      const daysHtml = weekDates.map((d) => {
        const text = cleanDisplayName(ui.state.mortificaciones[d]) || 'Sin consigna definida';
        const checked = Boolean(participant.mortificaciones[d]);
        const isToday = d === ui.todayISO;
        return `
          <div class="day-row ${isToday ? 'is-today' : ''}">
            <div class="day-row-info">
              <div class="day-row-date">${escapeHtml(formatDateShort(d))} · ${escapeHtml(formatDateLong(d))}${isToday ? ' · HOY' : ''}</div>
              <div class="day-row-text">${escapeHtml(text)}</div>
            </div>
            <button type="button"
              class="check-pill-btn ${checked ? 'is-checked' : ''}"
              data-toggle-mort="${escapeHtml(d)}"
              data-next-val="${checked ? '0' : '1'}">
              ${checked ? '✓ Cumplida' : 'Marcar'}
            </button>
          </div>
        `;
      }).join('');

      return `
        <div class="week-card">
          <div class="week-card-head">
            <button type="button" class="week-card-title-btn" data-toggle-week-expand="${escapeHtml(w.id)}">
              <span>${isExpanded ? '▾' : '▸'}</span>
              <span>${escapeHtml(w.titulo)}</span>
              <span class="pill pill-navy">${doneInWeek}/${weekDates.length} días</span>
            </button>
            <button type="button"
              class="check-pill-btn ${massDone ? 'is-checked' : ''}"
              data-toggle-mass="${escapeHtml(w.id)}"
              data-next-val="${massDone ? '0' : '1'}">
              ${massDone ? '✓ Misa Cumplida' : 'Misa Pendiente'}
            </button>
          </div>
          <div class="week-days-list ${isExpanded ? '' : 'hidden'}">
            ${daysHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAdminKpis() {
    const participants = ui.state.participantes || [];
    const total = participants.length;
    const effectiveToday = getClampDate(ui.todayISO);
    const currentWeek = getWeekForDate(effectiveToday);

    const todayDone = participants.filter((p) => Boolean(p.mortificaciones[effectiveToday]));
    const todayMissing = participants.filter((p) => !p.mortificaciones[effectiveToday]);

    const massDone = participants.filter((p) => Boolean(p.misas[currentWeek.id]));
    const massMissing = participants.filter((p) => !p.misas[currentWeek.id]);

    const avgPct = total > 0
      ? Math.round(participants.reduce((acc, p) => acc + getParticipantStats(p).toDatePct, 0) / total)
      : 0;

    els.kpiTotalParticipants.textContent = String(total);
    els.kpiTodayDone.textContent = `${todayDone.length} / ${total}`;
    els.kpiTodayMissing.textContent = todayMissing.length === 0
      ? (total === 0 ? 'Sin participantes' : '¡Todos al día!')
      : `Faltan: ${todayMissing.slice(0, 4).map((p) => p.nombre).join(', ')}${todayMissing.length > 4 ? ` (+${todayMissing.length - 4})` : ''}`;

    els.kpiMassDone.textContent = `${massDone.length} / ${total}`;
    els.kpiMassMissing.textContent = massMissing.length === 0
      ? (total === 0 ? 'Sin participantes' : '¡Todos al día!')
      : `Faltan: ${massMissing.slice(0, 4).map((p) => p.nombre).join(', ')}${massMissing.length > 4 ? ` (+${massMissing.length - 4})` : ''}`;

    els.kpiGroupAvg.textContent = `${avgPct}%`;
    els.thTodayMort.textContent = `Hoy (${formatDateShort(effectiveToday)})`;
  }

  function renderAdminTable() {
    const search = normalizeName(els.adminSearchInput.value);
    const filter = els.adminFilterSelect.value;
    const effectiveToday = getClampDate(ui.todayISO);
    const currentWeek = getWeekForDate(effectiveToday);
    const weeks = ui.state.semanas || [];

    const filtered = [...(ui.state.participantes || [])]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .filter((p) => {
        if (search && !normalizeName(p.nombre).includes(search)) return false;
        if (filter === 'missing-today' && p.mortificaciones[effectiveToday]) return false;
        if (filter === 'missing-mass' && p.misas[currentWeek.id]) return false;
        return true;
      });

    if (filtered.length === 0) {
      els.adminTableBody.innerHTML = '';
      els.adminEmptyState.classList.remove('hidden');
      return;
    }

    els.adminEmptyState.classList.add('hidden');
    els.adminTableBody.innerHTML = filtered.map((p) => {
      const stats = getParticipantStats(p);
      const todayOk = Boolean(p.mortificaciones[effectiveToday]);

      const massCells = weeks.map((w) => {
        const ok = Boolean(p.misas[w.id]);
        return `
          <td>
            <button type="button"
              class="cell-toggle-btn ${ok ? 'is-done' : ''}"
              title="Misa ${escapeHtml(w.titulo)}"
              data-admin-toggle-id="${escapeHtml(p.id)}"
              data-admin-tipo="misa"
              data-admin-key="${escapeHtml(w.id)}"
              data-admin-next="${ok ? '0' : '1'}">
              ${ok ? '✅' : '⏳'}
            </button>
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td>${escapeHtml(p.nombre)}</td>
          ${massCells}
          <td>
            <button type="button"
              class="cell-toggle-btn ${todayOk ? 'is-done' : ''}"
              title="Mortificación de ${escapeHtml(formatDateShort(effectiveToday))}"
              data-admin-toggle-id="${escapeHtml(p.id)}"
              data-admin-tipo="mortificacion"
              data-admin-key="${escapeHtml(effectiveToday)}"
              data-admin-next="${todayOk ? '0' : '1'}">
              ${todayOk ? '✅' : '⏳'}
            </button>
          </td>
          <td>
            <div class="progress-inline">
              <span><strong>${stats.mortDoneToDate}/${stats.toDateTotal}</strong> (${stats.toDatePct}%)</span>
              <div class="progress-track progress-track-sm">
                <div class="progress-fill" style="width: ${stats.toDatePct}%"></div>
              </div>
            </div>
          </td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn btn-outline btn-sm" data-open-detail="${escapeHtml(p.id)}">Ver 36 días</button>
              <button type="button" class="btn btn-danger-ghost btn-sm" data-delete-participant="${escapeHtml(p.id)}" title="Eliminar participante">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderMortEditor() {
    const dates = getSortedDates();
    const dec10Empty = !cleanDisplayName(ui.state.mortificaciones['2026-12-10']);
    els.emptyDayAlert.classList.toggle('hidden', !dec10Empty);

    els.mortEditorList.innerHTML = dates.map((d) => {
      const val = ui.state.mortificaciones[d] || '';
      const isEmpty = !cleanDisplayName(val);
      return `
        <div class="editor-item ${isEmpty ? 'is-empty-day' : ''}">
          <div class="editor-date-col">${escapeHtml(formatDateShort(d))} · ${escapeHtml(formatDateLong(d))}</div>
          <textarea class="editor-textarea" data-edit-date="${escapeHtml(d)}" placeholder="Escribir consigna para este día...">${escapeHtml(val)}</textarea>
        </div>
      `;
    }).join('');
  }

  function renderAdminConfig() {
    els.cloudUrlInput.value = StorageService.getCloudUrl(ui.state);
  }

  function renderAdminView() {
    if (!ui.isAdminView) {
      els.adminView.classList.add('hidden');
      return;
    }
    els.adminView.classList.remove('hidden');
    renderAdminKpis();
    renderAdminTable();
    renderMortEditor();
    renderAdminConfig();
  }

  function renderDetailModal() {
    if (!ui.detailParticipantId) {
      els.detailModal.classList.add('hidden');
      return;
    }
    const participant = ui.state.participantes.find((p) => p.id === ui.detailParticipantId);
    if (!participant) {
      ui.detailParticipantId = null;
      els.detailModal.classList.add('hidden');
      return;
    }

    els.detailModal.classList.remove('hidden');
    els.detailModalTitle.textContent = participant.nombre;
    const dates = getSortedDates();

    els.detailModalBody.innerHTML = (ui.state.semanas || []).map((w) => {
      const weekDates = dates.filter((d) => d >= w.inicio && d <= w.fin);
      const massOk = Boolean(participant.misas[w.id]);

      const rows = weekDates.map((d) => {
        const text = cleanDisplayName(ui.state.mortificaciones[d]) || 'Sin consigna definida';
        const ok = Boolean(participant.mortificaciones[d]);
        return `
          <div class="day-row">
            <div class="day-row-info">
              <div class="day-row-date">${escapeHtml(formatDateShort(d))} · ${escapeHtml(formatDateLong(d))}</div>
              <div class="day-row-text">${escapeHtml(text)}</div>
            </div>
            <button type="button"
              class="check-pill-btn ${ok ? 'is-checked' : ''}"
              data-admin-toggle-id="${escapeHtml(participant.id)}"
              data-admin-tipo="mortificacion"
              data-admin-key="${escapeHtml(d)}"
              data-admin-next="${ok ? '0' : '1'}">
              ${ok ? '✓ Cumplida' : 'Pendiente'}
            </button>
          </div>
        `;
      }).join('');

      return `
        <div class="week-card">
          <div class="week-card-head">
            <strong>${escapeHtml(w.titulo)}</strong>
            <button type="button"
              class="check-pill-btn ${massOk ? 'is-checked' : ''}"
              data-admin-toggle-id="${escapeHtml(participant.id)}"
              data-admin-tipo="misa"
              data-admin-key="${escapeHtml(w.id)}"
              data-admin-next="${massOk ? '0' : '1'}">
              ${massOk ? '✓ Misa Cumplida' : 'Misa Pendiente'}
            </button>
          </div>
          <div class="week-days-list">${rows}</div>
        </div>
      `;
    }).join('');
  }

  function renderAll() {
    renderTopbar();
    renderWelcomeModal();

    if (ui.isAdminView) {
      els.participantView.classList.add('hidden');
      renderAdminView();
    } else {
      els.adminView.classList.add('hidden');
      renderParticipantView();
      if (!getCurrentParticipant()) {
        els.welcomeModal.classList.remove('hidden');
      } else {
        els.welcomeModal.classList.add('hidden');
      }
    }
    renderDetailModal();
  }

  async function selectParticipantByName(nombre) {
    const clean = cleanDisplayName(nombre);
    if (!clean) return;
    try {
      const { participante, state } = await StorageService.registerParticipant(clean, ui.state);
      ui.state = state;
      ui.currentUser = { id: participante.id, nombre: participante.nombre };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(ui.currentUser));
      ui.isAdminView = false;
      els.welcomeModal.classList.add('hidden');
      els.loginNameInput.value = '';
      renderAll();
      showToast(`Sesión guardada como ${participante.nombre}`);
    } catch {
      showToast('No se pudo iniciar sesión. Intentá de nuevo.');
    }
  }

  async function handleParticipantToggle(tipo, key, valor) {
    const participant = getCurrentParticipant();
    if (!participant) return;
    try {
      ui.state = await StorageService.toggleCheck({
        participanteId: participant.id,
        nombre: participant.nombre,
        tipo,
        key,
        valor
      }, ui.state);
      renderAll();
    } catch {
      showToast('Error al guardar el registro.');
    }
  }

  async function handleAdminToggle(participanteId, tipo, key, valor) {
    const p = ui.state.participantes.find((item) => item.id === participanteId);
    if (!p) return;
    try {
      ui.state = await StorageService.toggleCheck({
        participanteId: p.id,
        nombre: p.nombre,
        tipo,
        key,
        valor
      }, ui.state);
      renderAll();
    } catch {
      showToast('No se pudo actualizar al participante.');
    }
  }

  function openAdminViewOrPromptPin() {
    if (ui.adminUnlocked) {
      ui.isAdminView = true;
      els.welcomeModal.classList.add('hidden');
      renderAll();
      return;
    }
    els.pinErrorMsg.classList.add('hidden');
    els.pinPromptInput.value = '';
    els.pinModal.classList.remove('hidden');
    setTimeout(() => els.pinPromptInput.focus(), 50);
  }

  function exportCsvReport() {
    const dates = getSortedDates();
    const weeks = ui.state.semanas || [];
    const headers = [
      'Participante',
      'Misas Cumplidas',
      'Mortificaciones Hasta Hoy',
      'Total Mortificaciones (36)',
      ...weeks.map((w) => `Misa ${w.titulo}`),
      ...dates.map((d) => formatDateShort(d))
    ];

    const csvEscape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = [...(ui.state.participantes || [])]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((p) => {
        const stats = getParticipantStats(p);
        return [
          p.nombre,
          `${stats.misasDone}/${stats.totalWeeks}`,
          `${stats.mortDoneToDate}/${stats.toDateTotal} (${stats.toDatePct}%)`,
          `${stats.mortDoneTotal}/${stats.totalDays}`,
          ...weeks.map((w) => (p.misas[w.id] ? 'SI' : 'NO')),
          ...dates.map((d) => (p.mortificaciones[d] ? 'SI' : 'NO'))
        ].map(csvEscape).join(',');
      });

    const csvContent = `\uFEFF${headers.map(csvEscape).join(',')}\r\n${rows.join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `san-benito-seguimiento-${ui.todayISO}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Reporte CSV descargado');
  }

  function bindEvents() {
    // Bienvenida / login
    els.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      selectParticipantByName(els.loginNameInput.value);
    });

    els.existingUsersList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pick-id]');
      if (!btn) return;
      const p = ui.state.participantes.find((item) => item.id === btn.dataset.pickId);
      if (p) selectParticipantByName(p.nombre);
    });

    els.btnSwitchUser.addEventListener('click', () => {
      ui.isAdminView = false;
      renderWelcomeModal();
      els.welcomeModal.classList.remove('hidden');
    });

    els.btnWelcomeAdmin.addEventListener('click', openAdminViewOrPromptPin);

    els.btnToggleAdmin.addEventListener('click', () => {
      if (ui.isAdminView) {
        ui.isAdminView = false;
        renderAll();
      } else {
        openAdminViewOrPromptPin();
      }
    });

    // Modal PIN
    els.btnCancelPin.addEventListener('click', () => {
      els.pinModal.classList.add('hidden');
    });

    els.pinLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const expected = String((ui.state.config && ui.state.config.adminPin) || '1234');
      if (els.pinPromptInput.value === expected) {
        ui.adminUnlocked = true;
        localStorage.setItem(STORAGE_KEYS.ADMIN_UNLOCKED, '1');
        els.pinModal.classList.add('hidden');
        els.welcomeModal.classList.add('hidden');
        ui.isAdminView = true;
        renderAll();
      } else {
        els.pinErrorMsg.classList.remove('hidden');
      }
    });

    els.btnLockAdmin.addEventListener('click', () => {
      ui.adminUnlocked = false;
      ui.isAdminView = false;
      localStorage.removeItem(STORAGE_KEYS.ADMIN_UNLOCKED);
      renderAll();
      showToast('Panel de encargado bloqueado');
    });

    // Navegación fecha participante
    els.btnPrevDay.addEventListener('click', () => {
      const dates = getSortedDates();
      const idx = dates.indexOf(ui.selectedDate);
      if (idx > 0) {
        ui.selectedDate = dates[idx - 1];
        renderParticipantView();
      }
    });

    els.btnNextDay.addEventListener('click', () => {
      const dates = getSortedDates();
      const idx = dates.indexOf(ui.selectedDate);
      if (idx >= 0 && idx < dates.length - 1) {
        ui.selectedDate = dates[idx + 1];
        renderParticipantView();
      }
    });

    els.btnGoToday.addEventListener('click', () => {
      ui.selectedDate = getClampDate(ui.todayISO);
      renderParticipantView();
    });

    els.btnToggleTodayMort.addEventListener('click', () => {
      const participant = getCurrentParticipant();
      if (!participant) return;
      const currentVal = Boolean(participant.mortificaciones[ui.selectedDate]);
      handleParticipantToggle('mortificacion', ui.selectedDate, !currentVal);
    });

    els.btnToggleWeekMass.addEventListener('click', () => {
      const participant = getCurrentParticipant();
      if (!participant) return;
      const week = getWeekForDate(ui.selectedDate);
      const currentVal = Boolean(participant.misas[week.id]);
      handleParticipantToggle('misa', week.id, !currentVal);
    });

    // Acordeón semanas participante
    els.weeksAccordion.addEventListener('click', (e) => {
      const expandBtn = e.target.closest('[data-toggle-week-expand]');
      if (expandBtn) {
        const wId = expandBtn.dataset.toggleWeekExpand;
        if (ui.expandedWeeks.has(wId)) ui.expandedWeeks.delete(wId);
        else ui.expandedWeeks.add(wId);
        renderParticipantView();
        return;
      }

      const mortBtn = e.target.closest('[data-toggle-mort]');
      if (mortBtn) {
        handleParticipantToggle('mortificacion', mortBtn.dataset.toggleMort, mortBtn.dataset.nextVal === '1');
        return;
      }

      const massBtn = e.target.closest('[data-toggle-mass]');
      if (massBtn) {
        handleParticipantToggle('misa', massBtn.dataset.toggleMass, massBtn.dataset.nextVal === '1');
      }
    });

    // Tabs admin
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        ui.activeAdminTab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => {
          const active = b.dataset.tab === ui.activeAdminTab;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', String(active));
        });
        document.querySelectorAll('.tab-panel').forEach((panel) => {
          const active = panel.id === `tab-${ui.activeAdminTab}`;
          panel.classList.toggle('active', active);
          panel.classList.toggle('hidden', !active);
        });
      });
    });

    // Controles admin seguimiento
    els.btnRefreshAdmin.addEventListener('click', async () => {
      ui.state = await StorageService.loadState();
      renderAll();
      showToast('Datos actualizados');
    });

    els.adminSearchInput.addEventListener('input', renderAdminTable);
    els.adminFilterSelect.addEventListener('change', renderAdminTable);
    els.btnExportCsv.addEventListener('click', exportCsvReport);

    els.addParticipantForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clean = cleanDisplayName(els.newParticipantInput.value);
      if (!clean) return;
      try {
        const { state } = await StorageService.registerParticipant(clean, ui.state);
        ui.state = state;
        els.newParticipantInput.value = '';
        renderAll();
        showToast(`Participante agregado: ${clean}`);
      } catch {
        showToast('No se pudo agregar el participante');
      }
    });

    els.btnLoadCampList.addEventListener('click', async () => {
      const existingNorms = new Set((ui.state.participantes || []).map((p) => normalizeName(p.nombre)));
      const nextList = [...(ui.state.participantes || [])];
      let added = 0;

      CAMPAMENTO_PARTICIPANTES.forEach((name) => {
        if (!existingNorms.has(normalizeName(name))) {
          nextList.push(normalizeParticipant({ nombre: name }));
          existingNorms.add(normalizeName(name));
          added += 1;
        }
      });

      if (added === 0) {
        showToast('Todos los nombres del campamento ya están cargados');
        return;
      }

      ui.state = await StorageService.saveAdminState({ participantes: nextList }, ui.state);
      renderAll();
      showToast(`Se agregaron ${added} participantes del campamento`);
    });

    els.adminTableBody.addEventListener('click', async (e) => {
      const toggleBtn = e.target.closest('[data-admin-toggle-id]');
      if (toggleBtn) {
        handleAdminToggle(
          toggleBtn.dataset.adminToggleId,
          toggleBtn.dataset.adminTipo,
          toggleBtn.dataset.adminKey,
          toggleBtn.dataset.adminNext === '1'
        );
        return;
      }

      const detailBtn = e.target.closest('[data-open-detail]');
      if (detailBtn) {
        ui.detailParticipantId = detailBtn.dataset.openDetail;
        renderDetailModal();
        return;
      }

      const delBtn = e.target.closest('[data-delete-participant]');
      if (delBtn) {
        const pId = delBtn.dataset.deleteParticipant;
        const p = ui.state.participantes.find((item) => item.id === pId);
        if (!p) return;
        const nextParticipants = ui.state.participantes.filter((item) => item.id !== pId);
        ui.state = await StorageService.saveAdminState({ participantes: nextParticipants }, ui.state);
        if (ui.currentUser && ui.currentUser.id === pId) {
          ui.currentUser = null;
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
        renderAll();
        showToast(`Se eliminó a ${p.nombre}`);
      }
    });

    // Modal detalle 36 días
    els.btnCloseDetailModal.addEventListener('click', () => {
      ui.detailParticipantId = null;
      renderDetailModal();
    });

    els.detailModalBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-admin-toggle-id]');
      if (!btn) return;
      handleAdminToggle(
        btn.dataset.adminToggleId,
        btn.dataset.adminTipo,
        btn.dataset.adminKey,
        btn.dataset.adminNext === '1'
      );
    });

    // Editor de mortificaciones
    els.btnFillDec10Suggestion.addEventListener('click', async () => {
      const textarea = els.mortEditorList.querySelector('[data-edit-date="2026-12-10"]');
      if (textarea) textarea.value = SUGERENCIA_10_12;
      const updated = { ...ui.state.mortificaciones, '2026-12-10': SUGERENCIA_10_12 };
      ui.state = await StorageService.saveAdminState({ mortificaciones: updated }, ui.state);
      renderAll();
      showToast('Consigna del 10/12 completada y guardada');
    });

    els.btnSaveMortificaciones.addEventListener('click', async () => {
      const updated = { ...ui.state.mortificaciones };
      els.mortEditorList.querySelectorAll('[data-edit-date]').forEach((ta) => {
        updated[ta.dataset.editDate] = ta.value.trim();
      });
      ui.state = await StorageService.saveAdminState({ mortificaciones: updated }, ui.state);
      renderAll();
      showToast('Todas las consignas fueron guardadas');
    });

    els.addDateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dateStr = els.newDateInput.value;
      const text = els.newDateTextInput.value.trim();
      if (!dateStr || !text) return;
      const updated = { ...ui.state.mortificaciones, [dateStr]: text };
      ui.state = await StorageService.saveAdminState({ mortificaciones: updated }, ui.state);
      els.newDateInput.value = '';
      els.newDateTextInput.value = '';
      renderAll();
      showToast(`Fecha ${formatDateShort(dateStr)} agregada`);
    });

    // Configuración PIN y Nube
    els.pinConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nextPin = els.newPinInput.value.trim();
      if (nextPin.length < 4) {
        showToast('El PIN debe tener al menos 4 caracteres');
        return;
      }
      ui.state = await StorageService.saveAdminState({ config: { adminPin: nextPin } }, ui.state);
      els.newPinInput.value = '';
      showToast('PIN de encargado actualizado');
    });

    els.cloudConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = els.cloudUrlInput.value.trim();
      if (!url) return;
      localStorage.setItem(STORAGE_KEYS.CLOUD_URL, url);
      ui.state = await StorageService.saveAdminState({ config: { cloudSyncUrl: url } }, ui.state);
      ui.state = await StorageService.loadState();
      renderAll();
      showToast('URL de nube guardada y sincronizada');
    });

    els.btnClearCloudUrl.addEventListener('click', async () => {
      localStorage.removeItem(STORAGE_KEYS.CLOUD_URL);
      els.cloudUrlInput.value = '';
      ui.state = await StorageService.saveAdminState({ config: { cloudSyncUrl: '' } }, ui.state);
      renderAll();
      showToast('URL de nube eliminada');
    });
  }

  async function init() {
    bindEvents();

    try {
      const savedUserRaw = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUserRaw) {
        const parsed = JSON.parse(savedUserRaw);
        if (parsed && parsed.nombre) ui.currentUser = parsed;
      }
    } catch {
      ui.currentUser = null;
    }

    ui.state = await StorageService.loadState();
    ui.selectedDate = getClampDate(ui.todayISO);

    // Si el participante guardado en localStorage aún no existe en el servidor (ej. caché viejo), lo re-registra suavemente
    if (ui.currentUser && !getCurrentParticipant()) {
      try {
        const { participante, state } = await StorageService.registerParticipant(ui.currentUser.nombre, ui.state);
        ui.state = state;
        ui.currentUser = { id: participante.id, nombre: participante.nombre };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(ui.currentUser));
      } catch {
        // Si falla, renderAll mostrará bienvenida
      }
    }

    renderAll();

    // Actualización periódica silenciosa cada 30s mientras la pestaña esté visible
    setInterval(async () => {
      if (document.hidden) return;
      try {
        const refreshed = await StorageService.loadState();
        if (refreshed && refreshed.updatedAt !== ui.state.updatedAt) {
          ui.state = refreshed;
          renderAll();
        } else {
          updateSyncBadge();
        }
      } catch {
        // Ignorar errores transitorios en segundo plano
      }
    }, 30000);
  }

  init();
})();

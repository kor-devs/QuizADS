/* =========================================================
   QuizADS · Learning Storage V1
   Camada de persistência local preparada para futura nuvem.
   ========================================================= */

(function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const PREFIX = "quizads_learning";

  function buildKey(trackId, moduleId) {
    const safeTrack = String(trackId || "track")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const safeModule = String(moduleId || "module")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return `${PREFIX}_${safeTrack}_${safeModule}_v${SCHEMA_VERSION}`;
  }

  function safeParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function load(trackId, moduleId) {
    const key = buildKey(trackId, moduleId);
    const parsed = safeParse(localStorage.getItem(key), null);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return null;
    }

    return parsed;
  }

  function save(state) {
    if (!state || !state.trackId || !state.moduleId) {
      throw new Error("LearningStorage.save exige trackId e moduleId.");
    }

    state.schemaVersion = SCHEMA_VERSION;
    state.updatedAt = new Date().toISOString();

    const key = buildKey(state.trackId, state.moduleId);
    localStorage.setItem(key, JSON.stringify(state));

    return state;
  }

  function reset(trackId, moduleId) {
    localStorage.removeItem(buildKey(trackId, moduleId));
  }

  function exportState(trackId, moduleId) {
    const state = load(trackId, moduleId);
    return state ? JSON.stringify(state, null, 2) : null;
  }

  window.QuizADSLearningStorage = {
    schemaVersion: SCHEMA_VERSION,
    buildKey,
    load,
    save,
    reset,
    exportState
  };
})();

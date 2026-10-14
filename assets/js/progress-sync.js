/* QuizADS · Local-first Supabase Progress Sync */
(function () {
  "use strict";

  const MODULE_KEYS = [1, 2, 3, 4, 5].map((number) => `quizads_ed_m${String(number).padStart(2, "0")}_v1`);
  const LEARNING_KEYS = [1, 2, 3, 4, 5].map((number) => `quizads_learning_estrutura-de-dados_m${String(number).padStart(2, "0")}_v1`);
  const RETRY_KEY = "quizads_sync_retry_v1";
  const CLIENT_KEY = "quizads_sync_client_v1";
  let initialSyncPromise = null;

  function parseTime(value) {
    const time = Date.parse(value || "");
    return Number.isFinite(time) ? time : 0;
  }

  function unique(items, keyFn) {
    const values = new Map();
    (items || []).forEach((item) => values.set(keyFn(item), item));
    return Array.from(values.values());
  }

  function newest(left, right, field = "updatedAt") {
    return parseTime(right?.[field]) > parseTime(left?.[field]) ? right : left;
  }

  function mergeEvidence(left, right) {
    return unique([...(left || []), ...(right || [])], (item) => {
      return item?.id || item?.signature || `${item?.questionId || "question"}:${item?.createdAt || JSON.stringify(item)}`;
    });
  }

  function preferredConclusion(left, right) {
    if (left?.approved && !right?.approved) return left;
    if (right?.approved && !left?.approved) return right;
    return newest(left || {}, right || {}, "createdAt");
  }

  function mergeModuleProgress(local, remote) {
    const left = local || {};
    const right = remote || {};
    const recent = newest(left, right);
    const merged = { ...left, ...right, ...recent };
    merged.completed = left.completed === true || right.completed === true;
    merged.completedAt = [left.completedAt, right.completedAt].filter(Boolean).sort()[0] || null;
    merged.currentPanel = Math.max(Number(left.currentPanel || 0), Number(right.currentPanel || 0));
    merged.maxPanel = Math.max(Number(left.maxPanel || 0), Number(right.maxPanel || 0), merged.currentPanel);
    merged.conclusionEvidence = preferredConclusion(left.conclusionEvidence, right.conclusionEvidence);
    merged.updatedAt = new Date(Math.max(parseTime(left.updatedAt), parseTime(right.updatedAt), Date.now())).toISOString();
    return merged;
  }

  function mergeCompetency(left, right) {
    if (!left) return { ...right };
    if (!right) return { ...left };
    const recent = newest(left, right, "lastStudiedAt");
    return {
      ...left,
      ...right,
      ...recent,
      attempts: Math.max(Number(left.attempts || 0), Number(right.attempts || 0)),
      correct: Math.max(Number(left.correct || 0), Number(right.correct || 0)),
      hintsUsed: Math.max(Number(left.hintsUsed || 0), Number(right.hintsUsed || 0)),
      consultations: Math.max(Number(left.consultations || 0), Number(right.consultations || 0)),
      evidence: mergeEvidence(left.evidence, right.evidence),
      seenQuestionIds: Array.from(new Set([...(left.seenQuestionIds || []), ...(right.seenQuestionIds || [])])),
      seenSignatures: Array.from(new Set([...(left.seenSignatures || []), ...(right.seenSignatures || [])]))
    };
  }

  function mergeLearningState(local, remote) {
    const left = local || {};
    const right = remote || {};
    const recent = newest(left, right);
    const competencyIds = new Set([...Object.keys(left.competencies || {}), ...Object.keys(right.competencies || {})]);
    const competencies = {};
    competencyIds.forEach((id) => {
      competencies[id] = mergeCompetency(left.competencies?.[id], right.competencies?.[id]);
    });
    return {
      ...left,
      ...right,
      ...recent,
      completed: left.completed === true || right.completed === true,
      completedAt: [left.completedAt, right.completedAt].filter(Boolean).sort()[0] || null,
      competencies,
      updatedAt: new Date(Math.max(parseTime(left.updatedAt), parseTime(right.updatedAt), Date.now())).toISOString()
    };
  }

  function safeParse(value) {
    try { return JSON.parse(value || "null"); } catch { return null; }
  }

  function queueRetry(payload) {
    const queue = safeParse(localStorage.getItem(RETRY_KEY)) || [];
    queue.push({ ...payload, queuedAt: new Date().toISOString() });
    localStorage.setItem(RETRY_KEY, JSON.stringify(queue.slice(-50)));
  }

  async function userId() {
    const auth = window.QuizADSAuth;
    if (!auth?.client) return null;
    await auth.ready();
    return auth.getUser()?.id || null;
  }

  function evidenceSyncWeight(evidence) {
    if (!evidence?.correct) return 0;
    let weight = 1;
    if (evidence.hintUsed) weight *= 0.72;
    if (evidence.consultedContent) weight *= 0.7;
    if (Number(evidence.attemptNumber || 1) > 1) {
      weight *= Math.max(0.55, 1 - (Number(evidence.attemptNumber) - 1) * 0.12);
    }
    return Number(weight.toFixed(4));
  }

  async function upsertConclusion(ownerId, moduleId, evidence) {
    if (!evidence?.id) return;
    const { error } = await window.QuizADSAuth.client.from("conclusion_evidence").upsert({
      user_id: ownerId,
      track_id: "estrutura-de-dados",
      module_id: moduleId,
      evidence_id: evidence.id,
      answer: evidence.answer || "",
      approved: evidence.approved === true,
      rubric_result: evidence.evaluation || {},
      created_at: evidence.createdAt || new Date().toISOString()
    }, { onConflict: "user_id,track_id,module_id,evidence_id" });
    if (error) throw error;
  }

  async function upsertActivityHistory(ownerId, moduleId, learningState) {
    const rows = [];
    Object.entries(learningState?.competencies || {}).forEach(([competencyId, competency]) => {
      (competency.evidence || []).forEach((evidence) => {
        if (!evidence.signature && !evidence.questionId) return;
        rows.push({
          user_id: ownerId,
          track_id: "estrutura-de-dados",
          module_id: moduleId,
          competency_id: competencyId,
          signature: evidence.signature || evidence.questionId,
          source: evidence.source || "practice",
          correct: evidence.correct === true,
          evidence_weight: Number(evidence.weight ?? evidenceSyncWeight(evidence)),
          payload: evidence,
          created_at: evidence.createdAt || new Date().toISOString()
        });
      });
    });
    if (!rows.length) return;
    const { error } = await window.QuizADSAuth.client.from("activity_history").upsert(rows, {
      onConflict: "user_id,track_id,module_id,competency_id,signature"
    });
    if (error) throw error;
  }

  async function readRemotePayload(storageKey, kind, ownerId) {
    const table = kind === "learning" ? "competency_state" : "module_progress";
    const moduleId = storageKey.match(/m(\d{2})/)?.[0] || storageKey;
    const query = window.QuizADSAuth.client
      .from(table)
      .select("payload")
      .eq("user_id", ownerId)
      .eq("track_id", "estrutura-de-dados")
      .eq("module_id", moduleId);
    if (kind === "learning") query.eq("competency_id", "__module__");
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data?.payload || null;
  }

  async function hydrateSnapshot(storageKey, kind, knownOwnerId) {
    const ownerId = knownOwnerId || await userId();
    if (!ownerId) return { skipped: true, reason: "anonymous" };
    const payload = safeParse(localStorage.getItem(storageKey));
    const remotePayload = await readRemotePayload(storageKey, kind, ownerId);
    if (!payload && !remotePayload) return { skipped: true, reason: "empty" };
    const merged = kind === "learning"
      ? mergeLearningState(payload, remotePayload)
      : mergeModuleProgress(payload, remotePayload);
    localStorage.setItem(storageKey, JSON.stringify(merged));
    return { hydrated: true, merged };
  }

  async function hydrateAll() {
    const ownerId = await userId();
    if (!ownerId) return { skipped: true, reason: "anonymous" };
    const results = [];
    for (const key of MODULE_KEYS) results.push(await hydrateSnapshot(key, "module", ownerId));
    for (const key of LEARNING_KEYS) results.push(await hydrateSnapshot(key, "learning", ownerId));
    return { hydrated: results.filter((item) => item.hydrated).length };
  }

  async function upsertSnapshot(storageKey, payload, kind, knownOwnerId) {
    const ownerId = knownOwnerId || await userId();
    if (!ownerId) return { skipped: true, reason: "anonymous" };
    const moduleId = storageKey.match(/m(\d{2})/)?.[0] || storageKey;
    const table = kind === "learning" ? "competency_state" : "module_progress";
    let remotePayload = null;
    try {
      remotePayload = await readRemotePayload(storageKey, kind, ownerId);
    } catch (error) {
      queueRetry({ storageKey, kind });
      throw error;
    }
    if (!payload && !remotePayload) return { skipped: true, reason: "empty" };
    const merged = kind === "learning"
      ? mergeLearningState(payload, remotePayload)
      : mergeModuleProgress(payload, remotePayload);
    localStorage.setItem(storageKey, JSON.stringify(merged));
    const row = {
      user_id: ownerId,
      track_id: "estrutura-de-dados",
      module_id: moduleId,
      payload: merged,
      updated_at: new Date().toISOString()
    };
    if (kind === "learning") row.competency_id = "__module__";
    const conflict = kind === "learning"
      ? "user_id,track_id,module_id,competency_id"
      : "user_id,track_id,module_id";
    const { error } = await window.QuizADSAuth.client.from(table).upsert(row, { onConflict: conflict });
    if (error) {
      queueRetry({ storageKey, kind });
      throw error;
    }
    if (kind === "learning") {
      await upsertActivityHistory(ownerId, moduleId, merged);
      await upsertConclusion(ownerId, moduleId, merged.conclusionEvidence);
    } else {
      await upsertConclusion(ownerId, moduleId, merged.conclusionEvidence);
    }
    return { synced: true, merged };
  }

  async function syncAll() {
    const ownerId = await userId();
    if (!ownerId) return { skipped: true, reason: "anonymous" };
    const user = window.QuizADSAuth.getUser();
    const { error: profileError } = await window.QuizADSAuth.client.from("profiles").upsert({
      user_id: ownerId,
      display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || null,
      avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (profileError) throw profileError;
    const results = [];
    for (const key of MODULE_KEYS) {
      const payload = safeParse(localStorage.getItem(key));
      results.push(await upsertSnapshot(key, payload, "module", ownerId));
    }
    for (const key of LEARNING_KEYS) {
      const payload = safeParse(localStorage.getItem(key));
      results.push(await upsertSnapshot(key, payload, "learning", ownerId));
    }
    let clientId = localStorage.getItem(CLIENT_KEY);
    if (!clientId) {
      clientId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `browser-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(CLIENT_KEY, clientId);
    }
    const { error: metadataError } = await window.QuizADSAuth.client.from("sync_metadata").upsert({
      user_id: ownerId,
      client_id: clientId,
      last_synced_at: new Date().toISOString(),
      payload: { modules: results.filter((item) => item.synced).length }
    }, { onConflict: "user_id,client_id" });
    if (metadataError) throw metadataError;
    localStorage.removeItem(RETRY_KEY);
    return { synced: results.length };
  }

  function ready() {
    if (!initialSyncPromise) {
      initialSyncPromise = hydrateAll().catch((error) => {
        console.warn("QuizADS: sincronização inicial indisponível; usando progresso local.", error);
        return { skipped: true, reason: "sync-error" };
      });
    }
    return initialSyncPromise;
  }

  async function hydrateAfterAuthChange() {
    const result = await hydrateAll();
    document.dispatchEvent(new CustomEvent("quizads:progress-hydrated", { detail: result }));
    return result;
  }

  window.QuizADSProgressSync = {
    mergeModuleProgress,
    mergeLearningState,
    hydrateAll,
    ready,
    syncAll,
    syncModule: upsertSnapshot
  };

  if (typeof document !== "undefined") {
    document.addEventListener("quizads:auth-changed", () => { initialSyncPromise = hydrateAfterAuthChange().catch(console.warn); });
    let syncTimer = null;
    document.addEventListener("quizads:progress-saved", () => {
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => { syncAll().catch(console.warn); }, 800);
    });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => { ready(); }, { once: true });
    } else {
      ready();
    }
  }
})();

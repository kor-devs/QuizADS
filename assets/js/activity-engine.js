/* QuizADS · Generic Activity Engine */
(function () {
  "use strict";

  const DEFAULT_GENERATION_ATTEMPTS = 12;

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = stableValue(value[key]);
        return result;
      }, {});
    }
    return value;
  }

  function signatureFor(template, activity) {
    const parameters = activity.parameters && Object.keys(activity.parameters).length
      ? JSON.stringify(stableValue(activity.parameters))
      : normalize(activity.prompt);
    return `${template.id}:${parameters}`;
  }

  function validateOptions(activity) {
    if (!Array.isArray(activity.options) || activity.options.length < 2) {
      throw new Error("A atividade precisa ter pelo menos duas alternativas.");
    }
    const normalized = activity.options.map(normalize);
    if (new Set(normalized).size !== normalized.length) {
      throw new Error("A atividade precisa ter alternativas únicas e não ambíguas.");
    }
    if (!Number.isInteger(activity.correctIndex) || activity.correctIndex < 0 || activity.correctIndex >= activity.options.length) {
      throw new Error("A atividade precisa indicar uma alternativa correta válida.");
    }
  }

  function materialize(template, context) {
    const competencyId = template?.competencyId || context?.competencyId;
    if (!template || !template.id || !competencyId) {
      throw new Error("Template de atividade inválido: id e competencyId são obrigatórios.");
    }
    const requestedLevel = Number(context?.requestedLevel || template.level || 60);
    const generated = typeof template.generate === "function"
      ? template.generate({ ...(context || {}), requestedLevel })
      : { ...template };
    const activity = {
      ...generated,
      id: generated.id || template.id,
      templateId: template.id,
      competencyId,
      requestedLevel,
      usedLevel: Number(template.level || requestedLevel),
      cognitiveLayer: generated.cognitiveLayer || template.cognitiveLayer || "entender-explicar",
      parameters: generated.parameters || {},
      evidenceWeight: Number(generated.evidenceWeight ?? template.evidenceWeight ?? 1),
      supports: Array.isArray(generated.supports)
        ? generated.supports.slice()
        : Array.isArray(template.supports) ? template.supports.slice() : []
    };
    validateOptions(activity);
    activity.signature = generated.signature || signatureFor(template, activity);
    return activity;
  }

  function orderedTemplates(templates, requestedLevel) {
    return templates
      .map((template, index) => ({ template, index, distance: Math.abs(Number(template.level || 60) - requestedLevel) }))
      .sort((a, b) => a.distance - b.distance || a.index - b.index)
      .map((entry) => entry.template);
  }

  function choose(competencyState, templates, context) {
    const requestedLevel = Number(competencyState?.level || context?.requestedLevel || 60);
    const compatible = (templates || []).filter((template) => {
      return !template.competencyId || !competencyState?.id || template.competencyId === competencyState.id;
    });
    if (!compatible.length) return null;

    const seen = new Set([
      ...(competencyState?.seenSignatures || []),
      ...(context?.excludeSignatures || [])
    ]);
    const candidates = orderedTemplates(compatible, requestedLevel);
    let fallback = null;

    for (const template of candidates) {
      for (let attempt = 0; attempt < DEFAULT_GENERATION_ATTEMPTS; attempt += 1) {
        const activity = materialize(template, { ...(context || {}), competencyId: template.competencyId || competencyState?.id, requestedLevel, attempt });
        fallback = fallback || activity;
        if (!seen.has(activity.signature)) return activity;
      }
    }
    return fallback;
  }

  window.QuizADSActivityEngine = {
    materialize,
    choose,
    signatureFor
  };
})();

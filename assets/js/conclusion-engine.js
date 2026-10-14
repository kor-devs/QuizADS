/* QuizADS · Conclusion Evidence Engine */
(function () {
  "use strict";

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function evaluate(blueprint, rawAnswer) {
    const answer = String(rawAnswer ?? "").trim();
    const normalized = normalize(answer);
    const rubric = Array.isArray(blueprint?.rubric) ? blueprint.rubric : [];
    const minimumCharacters = Number(blueprint?.minimumCharacters || 1);
    const criteria = rubric.map((criterion) => {
      const accepted = (criterion.any || []).some((term) => normalized.includes(normalize(term)));
      return { id: criterion.id, label: criterion.label, accepted };
    });
    const acceptedCount = criteria.filter((criterion) => criterion.accepted).length;
    const minimumCriteria = Number(blueprint?.minimumCriteria || rubric.length);
    const lengthAccepted = answer.length >= minimumCharacters;

    return {
      approved: lengthAccepted && acceptedCount >= minimumCriteria,
      deterministic: true,
      lengthAccepted,
      acceptedCount,
      minimumCriteria,
      criteria,
      missingCriteria: criteria.filter((criterion) => !criterion.accepted).map((criterion) => criterion.label)
    };
  }

  function createEvidence(blueprint, answer, metadata) {
    const evaluation = evaluate(blueprint, answer);
    return {
      id: `${metadata?.moduleId || "module"}-${Date.now()}`,
      blueprintId: blueprint.id,
      moduleId: metadata?.moduleId || null,
      competencyId: metadata?.competencyId || null,
      level: Number(metadata?.level || 60),
      answer: String(answer ?? "").trim(),
      approved: evaluation.approved,
      evaluation,
      createdAt: new Date().toISOString()
    };
  }

  function canComplete(moduleState) {
    return moduleState?.bossPassed === true && moduleState?.conclusionEvidence?.approved === true;
  }

  window.QuizADSConclusionEngine = { evaluate, createEvidence, canComplete };
})();

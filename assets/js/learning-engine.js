/* =========================================================
   QuizADS · Learning Engine V1
   Motor adaptativo determinístico por competência.
   ========================================================= */

(function () {
  "use strict";

  const LEVELS = [20, 40, 60, 80, 100];
  const LEVEL_NAMES = {
    20: "FOUNDATION",
    40: "EASY",
    60: "STANDARD",
    80: "ADVANCED",
    100: "EXPERT"
  };

  // Nomes pedagógicos exibidos ao aluno.
  // Os nomes técnicos acima permanecem estáveis para lógica, estado e documentação interna.
  const DISPLAY_LEVEL_NAMES = {
    20: "DESBRAVADOR",
    40: "APRENDIZ",
    60: "PRATICANTE",
    80: "COMPETENTE",
    100: "AVANÇADO"
  };

  const DEFAULT_LEVEL = 60;
  const DEFAULT_BLOCK_SIZE = 3;
  const MASTERY_WINDOW = 10;

  function clampLevel(level) {
    const numeric = Number(level);
    if (LEVELS.includes(numeric)) {
      return numeric;
    }
    return DEFAULT_LEVEL;
  }

  function createCompetencyState(id, initialLevel) {
    return {
      id,
      level: clampLevel(initialLevel),
      mastery: 50,
      attempts: 0,
      correct: 0,
      hintsUsed: 0,
      consultations: 0,
      recoveryRequired: false,
      lastAdjustment: null,
      lastStudiedAt: null,
      seenQuestionIds: [],
      evidence: [],
      block: {
        level: clampLevel(initialLevel),
        evidence: []
      }
    };
  }

  function createModuleState(definition, existingState) {
    const now = new Date().toISOString();
    const base = existingState && typeof existingState === "object"
      ? existingState
      : {
          schemaVersion: 1,
          userId: null,
          trackId: definition.trackId,
          moduleId: definition.moduleId,
          startedAt: now,
          updatedAt: now,
          completed: false,
          completedAt: null,
          competencies: {},
          session: {
            activeCompetencyId: definition.competencies[0]?.id || null
          }
        };

    base.trackId = definition.trackId;
    base.moduleId = definition.moduleId;
    base.competencies = base.competencies || {};
    base.session = base.session || {};

    definition.competencies.forEach((competency) => {
      if (!base.competencies[competency.id]) {
        base.competencies[competency.id] = createCompetencyState(
          competency.id,
          competency.initialLevel || DEFAULT_LEVEL
        );
      } else {
        const current = base.competencies[competency.id];
        current.level = clampLevel(current.level);
        current.evidence = Array.isArray(current.evidence) ? current.evidence : [];
        current.seenQuestionIds = Array.isArray(current.seenQuestionIds)
          ? current.seenQuestionIds
          : [];
        current.block = current.block || {
          level: current.level,
          evidence: []
        };
        current.block.level = clampLevel(current.block.level || current.level);
        current.block.evidence = Array.isArray(current.block.evidence)
          ? current.block.evidence
          : [];
      }
    });

    if (!base.session.activeCompetencyId) {
      base.session.activeCompetencyId = definition.competencies[0]?.id || null;
    }

    return base;
  }

  function evidenceWeight(evidence) {
    if (!evidence.correct) {
      return 0;
    }

    let weight = 1;

    if (evidence.hintUsed) {
      weight *= 0.72;
    }

    if (evidence.consultedContent) {
      weight *= 0.7;
    }

    if (evidence.attemptNumber && evidence.attemptNumber > 1) {
      weight *= Math.max(0.55, 1 - (evidence.attemptNumber - 1) * 0.12);
    }

    return Math.max(0, Math.min(1, weight));
  }

  function recalculateMastery(competencyState) {
    const recent = competencyState.evidence.slice(-MASTERY_WINDOW);

    if (!recent.length) {
      competencyState.mastery = 50;
      return competencyState.mastery;
    }

    const levelFactor = (level) => {
      const normalized = clampLevel(level) / 100;
      return 0.7 + normalized * 0.3;
    };

    let earned = 0;
    let possible = 0;

    recent.forEach((item) => {
      const factor = levelFactor(item.level);
      earned += evidenceWeight(item) * factor;
      possible += factor;
    });

    competencyState.mastery = Math.round((earned / possible) * 100);
    return competencyState.mastery;
  }

  function getBlockScore(blockEvidence) {
    if (!blockEvidence.length) {
      return 0;
    }

    const earned = blockEvidence.reduce(
      (total, item) => total + evidenceWeight(item),
      0
    );

    return Math.round((earned / blockEvidence.length) * 100);
  }

  function moveLevel(currentLevel, direction) {
    const index = LEVELS.indexOf(clampLevel(currentLevel));
    const nextIndex = Math.max(
      0,
      Math.min(LEVELS.length - 1, index + direction)
    );
    return LEVELS[nextIndex];
  }

  function evaluateBlock(competencyState, blockSize) {
    const size = Number(blockSize || DEFAULT_BLOCK_SIZE);
    const evidence = competencyState.block.evidence;

    if (evidence.length < size) {
      return null;
    }

    const used = evidence.slice(0, size);
    const score = getBlockScore(used);
    const previousLevel = competencyState.level;
    let nextLevel = previousLevel;
    let action = "stay";

    if (score >= 80) {
      nextLevel = moveLevel(previousLevel, 1);
      action = nextLevel > previousLevel ? "up" : "stay-max";
      competencyState.recoveryRequired = false;
    } else if (score < 60) {
      nextLevel = moveLevel(previousLevel, -1);
      action = nextLevel < previousLevel ? "down" : "stay-min";
      competencyState.recoveryRequired = true;
    } else {
      competencyState.recoveryRequired = false;
    }

    competencyState.level = nextLevel;
    competencyState.lastAdjustment = {
      at: new Date().toISOString(),
      previousLevel,
      nextLevel,
      score,
      action,
      evidenceCount: used.length
    };

    competencyState.block = {
      level: nextLevel,
      evidence: evidence.slice(size)
    };

    return competencyState.lastAdjustment;
  }

  function recordEvidence(state, competencyId, rawEvidence, options) {
    const competencyState = state.competencies[competencyId];
    if (!competencyState) {
      throw new Error(`Competência desconhecida: ${competencyId}`);
    }

    const evidence = {
      questionId: rawEvidence.questionId || null,
      level: clampLevel(rawEvidence.level || competencyState.level),
      correct: rawEvidence.correct === true,
      hintUsed: rawEvidence.hintUsed === true,
      consultedContent: rawEvidence.consultedContent === true,
      attemptNumber: Math.max(1, Number(rawEvidence.attemptNumber || 1)),
      source: rawEvidence.source || "practice",
      createdAt: new Date().toISOString()
    };

    competencyState.attempts += 1;
    competencyState.correct += evidence.correct ? 1 : 0;
    competencyState.hintsUsed += evidence.hintUsed ? 1 : 0;
    competencyState.consultations += evidence.consultedContent ? 1 : 0;
    competencyState.lastStudiedAt = evidence.createdAt;

    if (evidence.questionId && !competencyState.seenQuestionIds.includes(evidence.questionId)) {
      competencyState.seenQuestionIds.push(evidence.questionId);
    }

    competencyState.evidence.push(evidence);

    if (competencyState.block.level !== competencyState.level) {
      competencyState.block = {
        level: competencyState.level,
        evidence: []
      };
    }

    competencyState.block.evidence.push(evidence);
    recalculateMastery(competencyState);

    const adjustment = evaluateBlock(
      competencyState,
      options?.blockSize || DEFAULT_BLOCK_SIZE
    );

    state.updatedAt = new Date().toISOString();

    return {
      evidence,
      mastery: competencyState.mastery,
      adjustment,
      competency: competencyState
    };
  }

  function getLevelName(level) {
    return LEVEL_NAMES[clampLevel(level)];
  }

  function getDisplayLevelName(level) {
    return DISPLAY_LEVEL_NAMES[clampLevel(level)];
  }

  function getModuleSummary(state, definition) {
    const competencies = definition.competencies.map((item) => {
      const stored = state.competencies[item.id];
      return {
        id: item.id,
        name: item.name,
        critical: item.critical === true,
        level: stored.level,
        levelName: getLevelName(stored.level),
        mastery: stored.mastery,
        attempts: stored.attempts,
        recoveryRequired: stored.recoveryRequired
      };
    });

    const averageMastery = competencies.length
      ? Math.round(
          competencies.reduce((sum, item) => sum + item.mastery, 0) /
            competencies.length
        )
      : 0;

    return {
      competencies,
      averageMastery
    };
  }

  function chooseQuestion(competencyState, questionTemplates) {
    const level = competencyState.level;
    const exact = questionTemplates.filter((item) => item.level === level);
    const candidates = exact.length
      ? exact
      : questionTemplates
          .slice()
          .sort((a, b) => Math.abs(a.level - level) - Math.abs(b.level - level));

    if (!candidates.length) {
      return null;
    }

    let unseen = candidates.filter(
      (item) => !competencyState.seenQuestionIds.includes(item.id)
    );

    if (!unseen.length) {
      competencyState.seenQuestionIds = competencyState.seenQuestionIds.filter(
        (id) => !candidates.some((item) => item.id === id)
      );
      unseen = candidates;
    }

    const template = unseen[Math.floor(Math.random() * unseen.length)];
    return typeof template.generate === "function"
      ? template.generate()
      : { ...template };
  }

  window.QuizADSLearningEngine = {
    levels: LEVELS,
    levelNames: LEVEL_NAMES,
    displayLevelNames: DISPLAY_LEVEL_NAMES,
    defaultLevel: DEFAULT_LEVEL,
    defaultBlockSize: DEFAULT_BLOCK_SIZE,
    createModuleState,
    recordEvidence,
    getLevelName,
    getDisplayLevelName,
    getModuleSummary,
    chooseQuestion,
    getBlockScore
  };
})();

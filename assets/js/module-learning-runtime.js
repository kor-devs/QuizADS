/* =========================================================
   QuizADS · Module Learning Runtime V1
   Shell premium + Checkpoint/Boss adaptativos compartilhados.
   ========================================================= */

(function () {
  "use strict";

  const data = window.QUIZADS_MODULE_LEARNING;
  const engine = window.QuizADSLearningEngine;
  const storage = window.QuizADSLearningStorage;
  const bridge = window.QUIZADS_MODULE_BRIDGE;

  if (!data || !engine || !storage || !bridge) {
    console.error("QuizADS: runtime adaptativo não pôde ser inicializado.");
    return;
  }

  const ui = data.ui;
  const state = bridge.state;
  let learningState = engine.createModuleState(
    data.definition,
    storage.load(data.definition.trackId, data.definition.moduleId)
  );

  learningState.assessments = learningState.assessments || {};
  storage.save(learningState);

  let checkpointSession = null;
  let bossSession = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function displayLevel(level) {
    return engine.getDisplayLevelName(level);
  }

  function competencyDefinition(id) {
    return data.definition.competencies.find((item) => item.id === id);
  }

  function competencyState(id) {
    return learningState.competencies[id];
  }

  function persistLearning() {
    storage.save(learningState);
  }

  function persistLegacy() {
    if (typeof bridge.saveState === "function") bridge.saveState();
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function allMissionsDone() {
    const keys = ui.missionKeys || [];
    if (!keys.length) return true;
    const missions = state.missions || {};
    return keys.every((key) => missions[key] === true);
  }

  function orderedCompetenciesByNeed() {
    return data.definition.competencies
      .slice()
      .sort((a, b) => {
        const as = competencyState(a.id);
        const bs = competencyState(b.id);
        if (as.recoveryRequired !== bs.recoveryRequired) {
          return as.recoveryRequired ? -1 : 1;
        }
        if (as.mastery !== bs.mastery) return as.mastery - bs.mastery;
        return as.level - bs.level;
      });
  }

  function chooseAssessmentQuestion(competencyId, preferredLevel, usedQuestionIds) {
    const stored = competencyState(competencyId);
    const bank = data.questions[competencyId] || [];
    if (!bank.length) return null;

    const available = bank.filter((template) => !usedQuestionIds.has(template.id));
    const candidates = available.length ? available : bank;
    const nearestDistance = Math.min(...candidates.map((template) => Math.abs(template.level - preferredLevel)));
    const nearest = candidates.filter((template) => Math.abs(template.level - preferredLevel) === nearestDistance);
    const unseen = nearest.filter((template) => !stored.seenQuestionIds.includes(template.id));
    const pool = unseen.length ? unseen : nearest;
    const template = pool[Math.floor(Math.random() * pool.length)];
    if (!template) return null;

    usedQuestionIds.add(template.id);
    return typeof template.generate === "function" ? template.generate() : { ...template };
  }

  /* =======================================================
     PREMIUM SHELL
     ======================================================= */

  const moduleDefinitions = [
    { id: 1, name: "Fundamentos", topic: "TAD e ponteiros", path: "../modulo-01/", key: "quizads_ed_m01_v1", online: true },
    { id: 2, name: "Lista Sequencial", topic: "vetor e operações", path: "../modulo-02/", key: "quizads_ed_m02_v1", online: true },
    { id: 3, name: "Lista Encadeada", topic: "nós e memória dinâmica", path: "../modulo-03/", key: "quizads_ed_m03_v1", online: true },
    { id: 4, name: "Variações de Lista", topic: "circular e dupla", online: false },
    { id: 5, name: "Pilha e Fila", topic: "LIFO e FIFO", online: false },
    { id: 6, name: "Árvores", topic: "conceitos e percursos", online: false },
    { id: 7, name: "BST e AVL", topic: "busca e balanceamento", online: false },
    { id: 8, name: "Árvore B e Hash", topic: "estrutura e dispersão", online: false }
  ];

  function readModuleState(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  }

  function canAccessModule(module) {
    if (!module.online) return false;
    if (module.id === 1) return true;
    if (module.id === 2) return readModuleState("quizads_ed_m01_v1").completed === true;
    if (module.id === 3) return readModuleState("quizads_ed_m02_v1").completed === true;
    return false;
  }

  function buildSidebar() {
    const aside = document.createElement("aside");
    aside.className = "course-sidebar";
    aside.setAttribute("aria-label", "Módulos da trilha");
    aside.innerHTML = `
      <div class="course-sidebar-inner">
        <div class="course-sidebar-head">
          <div class="course-sidebar-label">Trilha 01</div>
          <div class="course-sidebar-title">Estrutura de Dados</div>
        </div>
        <nav id="courseModulesAdaptive" class="course-modules" aria-label="Módulos"></nav>
      </div>
    `;
    return aside;
  }

  function renderModuleRail() {
    const container = document.getElementById("courseModulesAdaptive");
    if (!container) return;
    container.innerHTML = "";

    moduleDefinitions.forEach((module) => {
      const accessible = canAccessModule(module);
      const stored = module.key ? readModuleState(module.key) : {};
      const item = document.createElement(accessible ? "a" : "div");
      item.className = "course-module-link";
      if (module.id === ui.moduleNumber) item.classList.add("current");
      if (stored.completed) item.classList.add("done");
      if (!accessible) item.classList.add("locked");
      if (accessible) item.href = module.path;
      item.innerHTML = `
        <span class="course-module-dot"></span>
        <span>
          <span class="course-module-number">Módulo ${String(module.id).padStart(2, "0")}</span>
          <span class="course-module-name">${escapeHtml(module.name)}</span>
          <span class="course-module-topic">${escapeHtml(module.topic)}</span>
        </span>
      `;
      container.appendChild(item);
    });
  }

  function outlineAccessible(item) {
    if (item.panel <= ui.labPanel) return true;
    if (item.panel === ui.checkpointPanel) return allMissionsDone() || state.checkpointPassed === true;
    if (item.panel === ui.bossIntroPanel || item.panel === ui.bossPanel) return state.checkpointPassed === true;
    if (item.panel === ui.essayPanel) return state.bossPassed === true;
    if (item.panel === ui.completePanel) return state.completed === true;
    return false;
  }

  function buildOutline() {
    const aside = document.createElement("aside");
    aside.className = "course-outline";
    aside.setAttribute("aria-label", "Conteúdo do módulo");
    aside.innerHTML = `
      <div class="course-outline-inner">
        <div class="course-outline-title">Neste módulo</div>
        <div id="courseOutlineAdaptive" class="course-outline-list"></div>
      </div>
    `;
    return aside;
  }

  function renderOutline() {
    const container = document.getElementById("courseOutlineAdaptive");
    if (!container) return;
    container.innerHTML = "";
    const current = Number(state.currentPanel || 0);

    ui.outline.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "course-outline-item";
      const bossActive = item.panel === ui.bossIntroPanel && (current === ui.bossIntroPanel || current === ui.bossPanel);
      if (item.panel === current || bossActive) button.classList.add("active");
      const accessible = outlineAccessible(item);
      button.disabled = !accessible;
      button.innerHTML = `
        <span class="course-outline-index">${String(item.number).padStart(2, "0")}</span>
        <span class="course-outline-name">${escapeHtml(item.name)}<span class="course-outline-note">${escapeHtml(item.note || "")}</span></span>
      `;
      if (accessible) button.addEventListener("click", () => window.goToPanel(item.panel));
      container.appendChild(button);
    });
  }

  function createMobileBar() {
    if (document.getElementById("adaptiveMobileBar")) return;
    const bar = document.createElement("div");
    bar.id = "adaptiveMobileBar";
    bar.className = "mobile-course-bar";
    bar.innerHTML = `
      <div class="mobile-course-bar-row">
        <span class="mobile-course-bar-title">Módulo ${String(ui.moduleNumber).padStart(2, "0")} · ${escapeHtml(ui.moduleName)}</span>
        <span id="adaptiveMobileProgress" class="mobile-course-bar-progress"></span>
      </div>
      <div class="mobile-course-line"><div id="adaptiveMobileProgressFill"></div></div>
    `;
    const content = document.getElementById("moduleContent");
    if (content) content.prepend(bar);
  }

  function updateMobileProgress() {
    const percent = ui.panelProgress?.[Number(state.currentPanel || 0)] || 0;
    const label = document.getElementById("adaptiveMobileProgress");
    const fill = document.getElementById("adaptiveMobileProgressFill");
    if (label) label.textContent = `${percent}%`;
    if (fill) fill.style.width = `${percent}%`;
  }

  function transformLessonMarkup() {
    document.body.classList.add("premium-module");
    const main = document.querySelector("main.module-main");
    const content = document.getElementById("moduleContent");
    if (!main || !content || content.style.display === "none") return;

    main.classList.add("course-shell", "premium-adaptive-course-shell");
    content.classList.remove("container");
    content.classList.add("course-content");

    if (!main.querySelector(".course-sidebar")) main.insertBefore(buildSidebar(), content);
    if (!main.querySelector(".course-outline")) main.insertBefore(buildOutline(), document.getElementById("lockedContent") || null);

    const hero = content.querySelector(".module-top");
    if (hero) {
      hero.classList.add("module-hero", "legacy-premium-hero");
      const breadcrumb = hero.querySelector(".breadcrumb");
      if (breadcrumb) {
        breadcrumb.classList.add("course-breadcrumb");
        content.insertBefore(breadcrumb, hero);
      }
      hero.querySelector(":scope > .kicker")?.classList.add("module-overline");
      hero.querySelector(".module-summary")?.classList.add("module-hero-description");
    }

    content.querySelectorAll(".lesson").forEach((lesson) => lesson.classList.add("course-lesson"));
    content.querySelectorAll(".lesson-block").forEach((block) => block.classList.add("course-section"));
    content.querySelectorAll(".lesson-block > .kicker").forEach((kicker) => kicker.classList.add("lesson-sequence"));

    createMobileBar();
    renderModuleRail();
    renderOutline();
    updateMobileProgress();
  }

  function afterPanelChange(index) {
    document.body.classList.toggle("assessment-mode", Number(index) === ui.bossPanel);
    renderOutline();
    renderModuleRail();
    updateMobileProgress();
  }

  function installNavigationBridge() {
    const original = bridge.goToPanel;
    window.goToPanel = function (index, scroll = true) {
      original(index, scroll);
      afterPanelChange(index);
    };
  }

  /* =======================================================
     CHECKPOINT ADAPTATIVO
     ======================================================= */

  function checkpointBlueprint() {
    const ordered = orderedCompetenciesByNeed();
    const focus = ordered[0]?.id || data.definition.competencies[0].id;
    const others = shuffle(data.definition.competencies.map((item) => item.id).filter((id) => id !== focus));
    const blueprint = [];
    const count = ui.checkpoint.count;

    // Garante três evidências da competência que mais precisa de atenção.
    if (count >= 1) blueprint.push(focus);
    if (count >= 2 && others[0]) blueprint.push(others[0]);
    if (count >= 3) blueprint.push(focus);
    if (count >= 4 && others[1]) blueprint.push(others[1]);
    if (count >= 5) blueprint.push(focus);

    const cycle = shuffle(data.definition.competencies.map((item) => item.id));
    let cursor = 0;
    while (blueprint.length < count) {
      blueprint.push(cycle[cursor % cycle.length]);
      cursor += 1;
    }
    return blueprint.slice(0, count);
  }

  function createCheckpointSession() {
    return {
      id: `checkpoint-${Date.now()}`,
      blueprint: checkpointBlueprint(),
      index: 0,
      score: 0,
      answers: [],
      currentQuestion: null,
      currentCompetencyId: null,
      currentLevel: null,
      hintUsed: false,
      consultedContent: false,
      finished: false
    };
  }

  function ensureCheckpointQuestion() {
    if (!checkpointSession || checkpointSession.finished || checkpointSession.currentQuestion) return;
    const competencyId = checkpointSession.blueprint[checkpointSession.index];
    const stored = competencyState(competencyId);
    checkpointSession.currentCompetencyId = competencyId;
    checkpointSession.currentLevel = stored.level;
    checkpointSession.currentQuestion = engine.chooseQuestion(stored, data.questions[competencyId] || []);
    checkpointSession.hintUsed = false;
    checkpointSession.consultedContent = false;
  }

  function currentLessonHtml(competencyId, level) {
    const lesson = data.lessons?.[competencyId]?.[level];
    if (!lesson) return "";
    return `
      <div class="adaptive-consult-box">
        <span class="adaptive-kicker">Consulta orientada · ${level} · ${displayLevel(level)}</span>
        <h4>${escapeHtml(lesson.title)}</h4>
        <div>${lesson.body}</div>
      </div>
    `;
  }

  function renderAdjustment(adjustment, competencyId) {
    const previous = `${adjustment.previousLevel} · ${displayLevel(adjustment.previousLevel)}`;
    const next = `${adjustment.nextLevel} · ${displayLevel(adjustment.nextLevel)}`;
    if (adjustment.action === "up") {
      return `<div class="adaptive-adjustment-card up"><strong>Competência evoluiu</strong><span>${previous} → ${next}</span><p>Os próximos desafios exigirão mais autonomia.</p></div>`;
    }
    if (adjustment.action === "down") {
      return `<div class="adaptive-adjustment-card down"><strong>Vamos aumentar o apoio</strong><span>${previous} → ${next}</span><p>Uma nova abordagem foi preparada para esta competência.</p>${currentLessonHtml(competencyId, adjustment.nextLevel)}</div>`;
    }
    if (adjustment.action === "stay-max") {
      return `<div class="adaptive-adjustment-card up"><strong>Nível máximo mantido</strong><span>${next}</span></div>`;
    }
    if (adjustment.action === "stay-min") {
      return `<div class="adaptive-adjustment-card down"><strong>Suporte máximo mantido</strong><span>${next}</span>${currentLessonHtml(competencyId, adjustment.nextLevel)}</div>`;
    }
    return `<div class="adaptive-adjustment-card"><strong>Nível mantido</strong><span>${next}</span></div>`;
  }

  function renderCheckpoint() {
    const form = document.getElementById("checkpointForm");
    const resultBox = document.getElementById("checkpointResult");
    if (!form) return;
    if (resultBox) resultBox.style.display = "none";
    if (!checkpointSession) checkpointSession = createCheckpointSession();
    if (checkpointSession.finished) return renderCheckpointResult();

    ensureCheckpointQuestion();
    const question = checkpointSession.currentQuestion;
    const competencyId = checkpointSession.currentCompetencyId;
    const definition = competencyDefinition(competencyId);
    const stored = competencyState(competencyId);

    if (!question) {
      form.innerHTML = `<div class="adaptive-empty">Não foi possível carregar uma questão desta competência.</div>`;
      return;
    }

    form.innerHTML = `
      <div class="adaptive-assessment-shell">
        <div class="adaptive-question-meta">
          <div>
            <span class="adaptive-kicker">Questão ${checkpointSession.index + 1} de ${ui.checkpoint.count}</span>
            <strong>${escapeHtml(definition.name)}</strong>
          </div>
          <div class="adaptive-level-stack">
            <span class="adaptive-level-chip" data-level="${stored.level}">${stored.level} · ${displayLevel(stored.level)}</span>
            <span>Domínio ${stored.mastery}% · evidência ${Math.min(stored.block.evidence.length + 1, data.definition.blockSize)}/${data.definition.blockSize}</span>
          </div>
        </div>

        <div class="adaptive-question-card" id="adaptiveCheckpointCard">
          <h3>${escapeHtml(question.prompt)}</h3>
          <div class="adaptive-options">
            ${question.options.map((option, index) => `
              <label class="adaptive-option" data-option-index="${index}">
                <input type="radio" name="adaptiveCheckpointOption" value="${index}" />
                <span class="adaptive-option-marker">${String.fromCharCode(65 + index)}</span>
                <span>${escapeHtml(option)}</span>
              </label>
            `).join("")}
          </div>

          <div class="adaptive-question-tools" id="adaptiveCheckpointTools">
            <button type="button" class="small-button" id="adaptiveHintButton">Ver dica</button>
            <button type="button" class="small-button" id="adaptiveConsultButton">Consultar conteúdo</button>
            <button type="button" class="btn btn-primary adaptive-answer-button" id="adaptiveAnswerButton">Responder</button>
          </div>

          <div class="adaptive-hint" id="adaptiveHint">${escapeHtml(question.hint)}</div>
          <div id="adaptiveConsult" hidden></div>
          <div class="adaptive-feedback" id="adaptiveFeedback" hidden></div>
        </div>
      </div>
    `;

    document.getElementById("adaptiveHintButton")?.addEventListener("click", () => {
      checkpointSession.hintUsed = true;
      document.getElementById("adaptiveHint")?.classList.add("visible");
    });

    document.getElementById("adaptiveConsultButton")?.addEventListener("click", () => {
      checkpointSession.consultedContent = true;
      const box = document.getElementById("adaptiveConsult");
      if (box) {
        box.hidden = false;
        box.innerHTML = currentLessonHtml(competencyId, stored.level);
      }
    });

    document.getElementById("adaptiveAnswerButton")?.addEventListener("click", submitCheckpointAnswer);
  }

  function submitCheckpointAnswer() {
    const selected = document.querySelector('input[name="adaptiveCheckpointOption"]:checked');
    if (!selected) {
      alert("Escolha uma alternativa antes de responder.");
      return;
    }

    const question = checkpointSession.currentQuestion;
    const competencyId = checkpointSession.currentCompetencyId;
    const selectedIndex = Number(selected.value);
    const correct = selectedIndex === question.correctIndex;

    const result = engine.recordEvidence(
      learningState,
      competencyId,
      {
        questionId: question.id,
        level: checkpointSession.currentLevel,
        correct,
        hintUsed: checkpointSession.hintUsed,
        consultedContent: checkpointSession.consultedContent,
        attemptNumber: 1,
        source: "checkpoint"
      },
      { blockSize: data.definition.blockSize }
    );

    if (correct) checkpointSession.score += 1;
    checkpointSession.answers.push({
      competencyId,
      questionId: question.id,
      level: checkpointSession.currentLevel,
      correct,
      hintUsed: checkpointSession.hintUsed,
      consultedContent: checkpointSession.consultedContent
    });
    persistLearning();

    document.querySelectorAll("#adaptiveCheckpointCard .adaptive-option").forEach((label, index) => {
      label.classList.add("answered");
      const input = label.querySelector("input");
      if (input) input.disabled = true;
      if (index === question.correctIndex) label.classList.add("is-correct-answer");
      if (index === selectedIndex && correct) label.classList.add("is-selected-correct");
      if (index === selectedIndex && !correct) label.classList.add("is-selected-wrong");
    });

    const tools = document.getElementById("adaptiveCheckpointTools");
    if (tools) tools.hidden = true;

    const feedback = document.getElementById("adaptiveFeedback");
    if (feedback) {
      feedback.hidden = false;
      feedback.className = `adaptive-feedback ${correct ? "correct" : "incorrect"}`;
      feedback.innerHTML = `
        <div class="adaptive-feedback-title">${correct ? "Boa leitura." : "Ainda não."}</div>
        <p>${escapeHtml(question.explanation)}</p>
        <div class="adaptive-feedback-metrics"><span>Domínio atual <strong>${result.mastery}%</strong></span></div>
        ${result.adjustment ? renderAdjustment(result.adjustment, competencyId) : ""}
        <button type="button" class="btn btn-secondary adaptive-next-button" id="adaptiveNextButton">${checkpointSession.index + 1 >= ui.checkpoint.count ? "Ver resultado do Checkpoint" : "Próxima questão"}</button>
      `;
    }

    document.getElementById("adaptiveNextButton")?.addEventListener("click", nextCheckpointQuestion);
  }

  function nextCheckpointQuestion() {
    checkpointSession.index += 1;
    checkpointSession.currentQuestion = null;
    checkpointSession.currentCompetencyId = null;
    checkpointSession.currentLevel = null;
    if (checkpointSession.index >= ui.checkpoint.count) {
      checkpointSession.finished = true;
      finishCheckpoint();
      return;
    }
    renderCheckpoint();
    document.getElementById("checkpointForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function competencySummaryHtml() {
    const summary = engine.getModuleSummary(learningState, data.definition);
    return `
      <div class="adaptive-competency-summary">
        ${summary.competencies.map((item) => `
          <div class="adaptive-competency-row">
            <div><strong>${escapeHtml(item.name)}</strong><span>${item.recoveryRequired ? "reforço ativo" : "evidências em desenvolvimento"}</span></div>
            <div class="adaptive-competency-score"><span>${item.level} · ${displayLevel(item.level)}</span><strong>${item.mastery}%</strong></div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function finishCheckpoint() {
    const passed = checkpointSession.score >= ui.checkpoint.pass;
    learningState.assessments.checkpoint = {
      completedAt: new Date().toISOString(),
      score: checkpointSession.score,
      total: ui.checkpoint.count,
      passed,
      answers: checkpointSession.answers
    };

    if (passed) {
      state.checkpointPassed = true;
      state.checkpointScore = checkpointSession.score;
      state.maxPanel = Math.max(Number(state.maxPanel || 0), ui.bossIntroPanel);
    } else if (state.checkpointPassed !== true) {
      state.checkpointPassed = false;
      state.checkpointScore = checkpointSession.score;
    }

    persistLearning();
    persistLegacy();
    renderOutline();
    renderCheckpointResult();
  }

  function renderCheckpointResult() {
    const form = document.getElementById("checkpointForm");
    const resultBox = document.getElementById("checkpointResult");
    if (!form || !checkpointSession || !resultBox) return;
    const passed = checkpointSession.score >= ui.checkpoint.pass;
    form.innerHTML = "";
    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <div class="adaptive-result-head">
        <div><span class="adaptive-kicker">Checkpoint adaptativo</span><div class="result-score">${checkpointSession.score}/${ui.checkpoint.count}</div><h2>${passed ? "Checkpoint concluído." : "Ainda precisamos reforçar alguns pontos."}</h2></div>
        <span class="adaptive-result-status ${passed ? "passed" : "retry"}">${passed ? "LIBERADO" : "REVISÃO"}</span>
      </div>
      <p>${passed ? "Você atingiu o mínimo para enfrentar o Boss. O resultado também atualizou as evidências das competências avaliadas." : "Uma nova tentativa será composta por outras variações e continuará ajustando suas competências."}</p>
      ${competencySummaryHtml()}
      <div class="adaptive-result-actions">
        <button type="button" class="btn btn-secondary" id="retryAdaptiveCheckpoint">Refazer com novas questões</button>
        ${passed ? `<button type="button" class="btn btn-primary" id="unlockAdaptiveBoss">Liberar Boss</button>` : ""}
      </div>
    `;

    document.getElementById("retryAdaptiveCheckpoint")?.addEventListener("click", () => {
      resultBox.style.display = "none";
      checkpointSession = createCheckpointSession();
      renderCheckpoint();
    });
    document.getElementById("unlockAdaptiveBoss")?.addEventListener("click", () => window.goToPanel(ui.bossIntroPanel));
  }

  function startCheckpointAdaptive() {
    if (!allMissionsDone()) {
      alert(`Complete primeiro ${ui.missionKeys.length === 1 ? "a missão" : "as missões"} do laboratório.`);
      return;
    }
    checkpointSession = createCheckpointSession();
    window.goToPanel(ui.checkpointPanel);
    renderCheckpoint();
  }

  /* =======================================================
     BOSS DINÂMICO
     ======================================================= */

  function bossBlueprint() {
    const ids = data.definition.competencies.map((item) => item.id);
    const result = [];
    ids.forEach((id) => { result.push(id, id); });
    const needs = orderedCompetenciesByNeed().map((item) => item.id);
    let cursor = 0;
    while (result.length < ui.boss.count) {
      result.push(needs[cursor % needs.length]);
      cursor += 1;
    }
    return shuffle(result).slice(0, ui.boss.count);
  }

  function buildBossSession() {
    const blueprint = bossBlueprint();
    const usedQuestionIds = new Set();
    const questions = blueprint.map((competencyId) => {
      const stored = competencyState(competencyId);
      const question = chooseAssessmentQuestion(competencyId, stored.level, usedQuestionIds);
      return {
        competencyId,
        level: question?.level || stored.level,
        question
      };
    }).filter((item) => item.question);
    return { id: `boss-${Date.now()}`, questions, startedAt: new Date().toISOString() };
  }

  function renderBossAdaptive() {
    const form = document.getElementById("bossForm");
    if (!form) return;
    if (!bossSession) bossSession = buildBossSession();

    form.innerHTML = `
      <div class="adaptive-boss-meta">
        <span>${bossSession.questions.length} questões dinâmicas</span>
        <span>mínimo ${ui.boss.pass} acertos</span>
        <span>sem dicas · sem consulta</span>
      </div>
      ${bossSession.questions.map((item, index) => {
        const definition = competencyDefinition(item.competencyId);
        return `
          <div class="quiz-question adaptive-boss-question">
            <div class="adaptive-question-meta compact">
              <div><span class="adaptive-kicker">Questão ${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(definition.name)}</strong></div>
              <span class="adaptive-level-chip" data-level="${item.level}">${item.level} · ${displayLevel(item.level)}</span>
            </div>
            <div class="question-title">${escapeHtml(item.question.prompt)}</div>
            <div class="options">
              ${item.question.options.map((option, optionIndex) => `<label class="option"><input type="radio" name="adaptive-boss-${index}" value="${optionIndex}" />${escapeHtml(option)}</label>`).join("")}
            </div>
          </div>
        `;
      }).join("")}
      <div class="assessment-submit"><button type="button" class="btn btn-primary" id="finishAdaptiveBoss">Finalizar Boss</button></div>
    `;
    document.getElementById("finishAdaptiveBoss")?.addEventListener("click", submitBossAdaptive);
  }

  function startBossAdaptive() {
    if (state.checkpointPassed !== true) {
      alert("Conclua primeiro o Checkpoint.");
      return;
    }
    bossSession = buildBossSession();
    window.goToPanel(ui.bossPanel);
    renderBossAdaptive();
  }

  function submitBossAdaptive() {
    if (!bossSession) return;
    const answers = [];
    let score = 0;

    for (let index = 0; index < bossSession.questions.length; index += 1) {
      const selected = document.querySelector(`input[name="adaptive-boss-${index}"]:checked`);
      if (!selected) {
        alert(`Responda todas as ${bossSession.questions.length} questões antes de finalizar.`);
        return;
      }
      const item = bossSession.questions[index];
      const selectedIndex = Number(selected.value);
      const correct = selectedIndex === item.question.correctIndex;
      if (correct) score += 1;
      answers.push({ ...item, selectedIndex, correct });
    }

    answers.forEach((answer) => {
      engine.recordEvidence(
        learningState,
        answer.competencyId,
        {
          questionId: answer.question.id,
          level: answer.level,
          correct: answer.correct,
          hintUsed: false,
          consultedContent: false,
          attemptNumber: 1,
          source: "boss"
        },
        { blockSize: data.definition.blockSize }
      );
    });

    const passed = score >= ui.boss.pass;
    learningState.assessments.boss = {
      completedAt: new Date().toISOString(),
      score,
      total: bossSession.questions.length,
      passed,
      answers: answers.map((answer) => ({ competencyId: answer.competencyId, questionId: answer.question.id, level: answer.level, correct: answer.correct }))
    };

    state.bossScore = score;
    if (passed) {
      state.bossPassed = true;
      state.maxPanel = Math.max(Number(state.maxPanel || 0), ui.essayPanel);
    } else if (state.bossPassed !== true) {
      state.bossPassed = false;
    }

    persistLearning();
    persistLegacy();
    renderOutline();
    renderBossResult(score, passed);
  }

  function renderBossResult(score, passed) {
    const form = document.getElementById("bossForm");
    if (!form) return;
    form.innerHTML = `
      <div class="result-box adaptive-boss-result">
        <div class="adaptive-result-head">
          <div><span class="adaptive-kicker">Boss concluído</span><div class="result-score">${score}/${bossSession.questions.length}</div><h2>${passed ? "Boss vencido." : "Ainda não."}</h2></div>
          <span class="adaptive-result-status ${passed ? "passed" : "retry"}">${passed ? "APROVADO" : "NOVA TENTATIVA"}</span>
        </div>
        <p>${passed ? "Você demonstrou desempenho suficiente sem consulta. As evidências foram registradas por competência." : `O mínimo é ${ui.boss.pass}/${ui.boss.count}. As respostas corretas continuam ocultas; a próxima tentativa terá novas variações.`}</p>
        ${competencySummaryHtml()}
        <div class="adaptive-result-actions">
          ${passed
            ? `<button type="button" class="btn btn-primary" id="continueAfterAdaptiveBoss">Continuar para a pergunta-chave</button>`
            : `<button type="button" class="btn btn-secondary" id="reviewAfterAdaptiveBoss">Revisar módulo</button><button type="button" class="btn btn-primary" id="retryAdaptiveBoss">Tentar novo Boss</button>`}
        </div>
      </div>
    `;
    document.getElementById("continueAfterAdaptiveBoss")?.addEventListener("click", () => window.goToPanel(ui.essayPanel));
    document.getElementById("reviewAfterAdaptiveBoss")?.addEventListener("click", () => window.goToPanel(0));
    document.getElementById("retryAdaptiveBoss")?.addEventListener("click", startBossAdaptive);
  }

  function initializeAdaptiveAssessments() {
    const form = document.getElementById("checkpointForm");
    if (form) {
      form.dataset.adaptive = "true";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
    }
    checkpointSession = createCheckpointSession();
    renderCheckpoint();

    window.startCheckpoint = startCheckpointAdaptive;
    window.startBoss = startBossAdaptive;
    window.renderBoss = renderBossAdaptive;
    window.reviewAfterBoss = function () {
      bossSession = null;
      window.goToPanel(0);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    transformLessonMarkup();
    installNavigationBridge();
    initializeAdaptiveAssessments();
    afterPanelChange(Number(state.currentPanel || 0));
  }, { once: true });
})();

/* =========================================================
   QuizADS · M01 · Learning Runtime V1
   Conecta o Learning Engine ao Checkpoint e ao Boss reais.
   ========================================================= */

(function () {
  "use strict";

  const data = window.QUIZADS_M01_LEARNING;
  const engine = window.QuizADSLearningEngine;
  const storage = window.QuizADSLearningStorage;

  if (!data || !engine || !storage) {
    console.error("QuizADS: Learning Engine do M01 não foi carregado.");
    return;
  }

  const CHECKPOINT_COUNT = 6;
  const CHECKPOINT_PASS = 5;
  const BOSS_COUNT = 10;
  const BOSS_PASS = 8;

  const LESSON_BY_COMPETENCY = {
    structures: 0,
    tad: 1,
    pointers: 2,
    nodes: 2,
    "c-reading": 3
  };

  let learningState = engine.createModuleState(
    data.definition,
    storage.load(data.definition.trackId, data.definition.moduleId)
  );

  learningState.assessments = learningState.assessments || {};
  storage.save(learningState);

  let checkpointSession = null;
  let bossSession = null;

  function displayLevel(level) {
    return engine.getDisplayLevelName(level);
  }

  function competencyDefinition(id) {
    return data.definition.competencies.find((item) => item.id === id);
  }

  function competencyState(id) {
    return learningState.competencies[id];
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function persistLearning() {
    storage.save(learningState);
  }

  function persistLegacy() {
    if (typeof saveState === "function") {
      saveState();
    }
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function weakestCriticalCompetency() {
    return data.definition.competencies
      .filter((item) => item.critical)
      .slice()
      .sort((a, b) => {
        const aState = competencyState(a.id);
        const bState = competencyState(b.id);
        if (aState.recoveryRequired !== bState.recoveryRequired) {
          return aState.recoveryRequired ? -1 : 1;
        }
        if (aState.mastery !== bState.mastery) {
          return aState.mastery - bState.mastery;
        }
        return aState.level - bState.level;
      })[0]?.id || data.definition.competencies[0].id;
  }

  function checkpointBlueprint() {
    const base = data.definition.competencies.map((item) => item.id);
    const focus = weakestCriticalCompetency();
    return shuffle(base).concat(focus).slice(0, CHECKPOINT_COUNT);
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

  function chooseCheckpointQuestion(competencyId) {
    const stored = competencyState(competencyId);
    const question = engine.chooseQuestion(stored, data.questions[competencyId] || []);
    return question;
  }

  function ensureCheckpointQuestion() {
    if (!checkpointSession || checkpointSession.finished) return;
    if (checkpointSession.currentQuestion) return;

    const competencyId = checkpointSession.blueprint[checkpointSession.index];
    const stored = competencyState(competencyId);
    checkpointSession.currentCompetencyId = competencyId;
    checkpointSession.currentLevel = stored.level;
    checkpointSession.currentQuestion = chooseCheckpointQuestion(competencyId);
    checkpointSession.hintUsed = false;
    checkpointSession.consultedContent = false;
  }

  function renderCheckpoint() {
    const form = document.getElementById("checkpointForm");
    if (!form) return;

    if (!checkpointSession) {
      checkpointSession = createCheckpointSession();
    }

    if (checkpointSession.finished) {
      renderCheckpointResult();
      return;
    }

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
            <span class="adaptive-kicker">Questão ${checkpointSession.index + 1} de ${CHECKPOINT_COUNT}</span>
            <strong>${escapeHtml(definition.name)}</strong>
          </div>
          <div class="adaptive-level-stack">
            <span class="adaptive-level-chip" data-level="${stored.level}">
              ${stored.level} · ${displayLevel(stored.level)}
            </span>
            <span>Domínio ${stored.mastery}% · bloco ${Math.min(stored.block.evidence.length + 1, data.definition.blockSize)}/${data.definition.blockSize}</span>
          </div>
        </div>

        <div class="adaptive-question-card" id="adaptiveCheckpointCard">
          <h3>${question.prompt}</h3>
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
            <button type="button" class="small-button" id="adaptiveConsultButton">Consultar aula</button>
            <button type="button" class="btn btn-primary adaptive-answer-button" id="adaptiveAnswerButton">Responder</button>
          </div>

          <div class="adaptive-hint" id="adaptiveHint">${escapeHtml(question.hint)}</div>
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
      const lessonPanel = LESSON_BY_COMPETENCY[competencyId] ?? 0;
      if (typeof consultLesson === "function") {
        consultLesson(lessonPanel);
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

    const optionLabels = document.querySelectorAll("#adaptiveCheckpointCard .adaptive-option");
    optionLabels.forEach((label, index) => {
      label.classList.add("answered");
      const input = label.querySelector("input");
      if (input) input.disabled = true;

      if (index === question.correctIndex) {
        label.classList.add("is-correct-answer");
      }
      if (index === selectedIndex && !correct) {
        label.classList.add("is-selected-wrong");
      }
      if (index === selectedIndex && correct) {
        label.classList.add("is-selected-correct");
      }
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
        <div class="adaptive-feedback-metrics">
          <span>Domínio atual <strong>${result.mastery}%</strong></span>
          ${result.adjustment ? renderAdjustment(result.adjustment, competencyId) : ""}
        </div>
        <button type="button" class="btn btn-secondary adaptive-next-button" id="adaptiveNextButton">
          ${checkpointSession.index + 1 >= CHECKPOINT_COUNT ? "Ver resultado do Checkpoint" : "Próxima questão"}
        </button>
      `;
    }

    document.getElementById("adaptiveNextButton")?.addEventListener("click", nextCheckpointQuestion);
  }

  function renderAdjustment(adjustment, competencyId) {
    const definition = competencyDefinition(competencyId);
    const competencyName = definition?.name || definition?.shortName || "Competência";
    const previous = `${adjustment.previousLevel} · ${displayLevel(adjustment.previousLevel)}`;
    const next = `${adjustment.nextLevel} · ${displayLevel(adjustment.nextLevel)}`;

    if (adjustment.action === "up") {
      return `<span class="adaptive-transition up">${escapeHtml(competencyName)} · evolução: ${previous} → ${next}</span>`;
    }
    if (adjustment.action === "down") {
      return `<span class="adaptive-transition down">${escapeHtml(competencyName)} · mais apoio: ${previous} → ${next}</span>`;
    }
    if (adjustment.action === "stay-max") {
      return `<span class="adaptive-transition up">${escapeHtml(competencyName)} · nível máximo mantido: ${next}</span>`;
    }
    if (adjustment.action === "stay-min") {
      return `<span class="adaptive-transition down">${escapeHtml(competencyName)} · suporte máximo mantido: ${next}</span>`;
    }
    return `<span class="adaptive-transition">${escapeHtml(competencyName)} · nível mantido em ${next}</span>`;
  }

  function nextCheckpointQuestion() {
    checkpointSession.index += 1;
    checkpointSession.currentQuestion = null;
    checkpointSession.currentCompetencyId = null;
    checkpointSession.currentLevel = null;

    if (checkpointSession.index >= CHECKPOINT_COUNT) {
      checkpointSession.finished = true;
      finishCheckpoint();
      return;
    }

    renderCheckpoint();
    document.getElementById("checkpointForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function finishCheckpoint() {
    const passed = checkpointSession.score >= CHECKPOINT_PASS;

    learningState.assessments.checkpoint = {
      completedAt: new Date().toISOString(),
      score: checkpointSession.score,
      total: CHECKPOINT_COUNT,
      passed,
      answers: checkpointSession.answers
    };

    if (passed) {
      state.checkpointPassed = true;
      state.checkpointScore = checkpointSession.score;
      state.maxPanel = Math.max(Number(state.maxPanel || 0), 5);
    } else if (state.checkpointPassed !== true) {
      state.checkpointPassed = false;
      state.checkpointScore = checkpointSession.score;
    }

    persistLearning();
    persistLegacy();

    if (typeof renderOutline === "function") renderOutline();
    if (typeof renderModuleRail === "function") renderModuleRail();

    renderCheckpointResult();
  }

  function competencySummaryHtml() {
    const summary = engine.getModuleSummary(learningState, data.definition);
    return `
      <div class="adaptive-competency-summary">
        ${summary.competencies.map((item) => `
          <div class="adaptive-competency-row">
            <div>
              <strong>${escapeHtml(item.name)}</strong>
              <span>${item.recoveryRequired ? "reforço ativo" : "evidências em desenvolvimento"}</span>
            </div>
            <div class="adaptive-competency-score">
              <span>${item.level} · ${displayLevel(item.level)}</span>
              <strong>${item.mastery}%</strong>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderCheckpointResult() {
    const form = document.getElementById("checkpointForm");
    const resultBox = document.getElementById("checkpointResult");
    if (!form || !checkpointSession) return;

    const passed = checkpointSession.score >= CHECKPOINT_PASS;
    form.innerHTML = "";

    if (resultBox) {
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div class="adaptive-result-head">
          <div>
            <span class="adaptive-kicker">Checkpoint adaptativo</span>
            <div class="result-score">${checkpointSession.score}/${CHECKPOINT_COUNT}</div>
            <h2>${passed ? "Checkpoint concluído." : "Ainda precisamos reforçar alguns pontos."}</h2>
          </div>
          <span class="adaptive-result-status ${passed ? "passed" : "retry"}">${passed ? "LIBERADO" : "REVISÃO"}</span>
        </div>

        <p>${passed
          ? "Você atingiu o mínimo para enfrentar o Boss. O resultado também atualizou as evidências das competências avaliadas."
          : "As respostas deste Checkpoint foram registradas. Uma nova tentativa usará outras questões disponíveis e continuará ajustando as competências."}</p>

        ${competencySummaryHtml()}

        <div class="adaptive-result-actions">
          <button type="button" class="btn btn-secondary" id="retryAdaptiveCheckpoint">Refazer com novas questões</button>
          ${passed ? `<button type="button" class="btn btn-primary" id="unlockAdaptiveBoss">Liberar Boss</button>` : ""}
        </div>
      `;
    }

    document.getElementById("retryAdaptiveCheckpoint")?.addEventListener("click", () => {
      if (resultBox) resultBox.style.display = "none";
      checkpointSession = createCheckpointSession();
      renderCheckpoint();
    });

    document.getElementById("unlockAdaptiveBoss")?.addEventListener("click", () => {
      if (typeof goToPanel === "function") goToPanel(5);
    });
  }

  /* =======================================================
     BOSS DINÂMICO
     ======================================================= */

  function chooseUniqueQuestion(competencyId, usedIds) {
    const stored = competencyState(competencyId);
    const tempState = {
      ...stored,
      seenQuestionIds: Array.from(new Set([...(stored.seenQuestionIds || []), ...usedIds]))
    };
    return engine.chooseQuestion(tempState, data.questions[competencyId] || []);
  }

  function buildBossSession() {
    const competencyIds = data.definition.competencies.map((item) => item.id);
    const blueprint = shuffle(competencyIds.flatMap((id) => [id, id])).slice(0, BOSS_COUNT);
    const usedIds = new Set();

    const questions = blueprint.map((competencyId) => {
      const question = chooseUniqueQuestion(competencyId, usedIds);
      if (question?.id) usedIds.add(question.id);
      return {
        competencyId,
        level: competencyState(competencyId).level,
        question
      };
    }).filter((item) => item.question);

    return {
      id: `boss-${Date.now()}`,
      questions,
      startedAt: new Date().toISOString()
    };
  }

  function startBossAdaptive() {
    bossSession = buildBossSession();
    if (typeof goToPanel === "function") goToPanel(6);
    renderBossAdaptive();
  }

  function renderBossAdaptive() {

    const form =
      document.getElementById(
        "bossForm"
      );

    if (!form) {
      return;
    }

    if (!bossSession) {
      bossSession =
        buildBossSession();
    }


    form.innerHTML = `

      <section class="adaptive-boss-shell">

        <header class="adaptive-boss-header">

          <div>

            <span class="adaptive-kicker">
              Avaliação final · Módulo 01
            </span>

            <h2>
              Boss · Fundamentos
            </h2>

            <p>
              Agora você resolve sem dicas,
              sem consulta e sem feedback
              durante a tentativa.
            </p>

          </div>


          <div class="adaptive-boss-stats">

            <div>
              <strong>
                ${bossSession.questions.length}
              </strong>

              <span>
                questões
              </span>
            </div>


            <div>
              <strong>
                ${BOSS_PASS}
              </strong>

              <span>
                mínimo
              </span>
            </div>

          </div>

        </header>


        <div class="adaptive-boss-rules">

          <span>
            sem dicas
          </span>

          <span>
            sem consulta
          </span>

          <span>
            questões dinâmicas
          </span>

          <span>
            avaliação por competência
          </span>

        </div>


        <div class="adaptive-boss-question-list">

          ${bossSession.questions
            .map(
              (
                item,
                index
              ) => {

                const definition =
                  competencyDefinition(
                    item.competencyId
                  );


                return `

                  <article
                    class="adaptive-boss-question"
                  >

                    <div
                      class="adaptive-question-meta"
                    >

                      <div>

                        <span
                          class="adaptive-kicker"
                        >
                          Questão
                          ${String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>


                        <strong>
                          ${escapeHtml(
                            definition.name
                          )}
                        </strong>

                      </div>


                      <span
                        class="adaptive-level-chip"
                        data-level="${item.level}"
                      >
                        ${item.level}
                        ·
                        ${displayLevel(
                          item.level
                        )}
                      </span>

                    </div>


                    <h3
                      class="adaptive-boss-prompt"
                    >
                      ${item.question.prompt}
                    </h3>


                    <div
                      class="adaptive-options"
                    >

                      ${item.question.options
                        .map(
                          (
                            option,
                            optionIndex
                          ) => `

                            <label
                              class="adaptive-option"
                            >

                              <input
                                type="radio"
                                name="adaptive-boss-${index}"
                                value="${optionIndex}"
                              />


                              <span
                                class="adaptive-option-marker"
                              >
                                ${String.fromCharCode(
                                  65 + optionIndex
                                )}
                              </span>


                              <span>
                                ${escapeHtml(
                                  option
                                )}
                              </span>

                            </label>

                          `
                        )
                        .join("")}

                    </div>

                  </article>

                `;

              }
            )
            .join("")}

        </div>


        <footer
          class="adaptive-boss-footer"
        >

          <div>

            <strong>
              Terminou?
            </strong>

            <span>
              Revise antes de finalizar.
              O resultado aparece somente
              depois do envio.
            </span>

          </div>


          <button
            type="button"
            class="btn btn-primary"
            id="finishAdaptiveBoss"
          >
            Finalizar Boss
          </button>

        </footer>

      </section>

    `;


    document
      .getElementById(
        "finishAdaptiveBoss"
      )
      ?.addEventListener(
        "click",
        submitBossAdaptive
      );

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

    const passed = score >= BOSS_PASS;

    learningState.assessments.boss = {
      completedAt: new Date().toISOString(),
      score,
      total: bossSession.questions.length,
      passed,
      answers: answers.map((answer) => ({
        competencyId: answer.competencyId,
        questionId: answer.question.id,
        level: answer.level,
        correct: answer.correct
      }))
    };

    state.bossScore = score;
    if (passed) {
      state.bossPassed = true;
      state.maxPanel = Math.max(Number(state.maxPanel || 0), 7);
    } else if (state.bossPassed !== true) {
      state.bossPassed = false;
    }

    persistLearning();
    persistLegacy();
    if (typeof renderOutline === "function") renderOutline();

    renderBossResult(score, passed);
  }

  function renderBossResult(score, passed) {
    const form = document.getElementById("bossForm");
    if (!form) return;

    form.innerHTML = `
      <div class="result-box adaptive-boss-result">
        <div class="adaptive-result-head">
          <div>
            <span class="adaptive-kicker">Boss concluído</span>
            <div class="result-score">${score}/${bossSession.questions.length}</div>
            <h2>${passed ? "Boss vencido." : "Ainda não."}</h2>
          </div>
          <span class="adaptive-result-status ${passed ? "passed" : "retry"}">${passed ? "APROVADO" : "NOVA TENTATIVA"}</span>
        </div>

        <p>${passed
          ? "Você demonstrou desempenho suficiente sem consulta. As respostas corretas continuam ocultas durante o Boss."
          : `O mínimo é ${BOSS_PASS}/${BOSS_COUNT}. As respostas corretas não são reveladas aqui; uma nova tentativa será composta por outras questões disponíveis.`}</p>

        ${competencySummaryHtml()}

        <div class="adaptive-result-actions">
          ${passed
            ? `<button type="button" class="btn btn-primary" id="continueAfterAdaptiveBoss">Continuar para a pergunta-chave</button>`
            : `<button type="button" class="btn btn-secondary" id="reviewAfterAdaptiveBoss">Revisar módulo</button>
               <button type="button" class="btn btn-primary" id="retryAdaptiveBoss">Tentar novo Boss</button>`}
        </div>
      </div>
    `;

    document.getElementById("continueAfterAdaptiveBoss")?.addEventListener("click", () => {
      if (typeof goToPanel === "function") goToPanel(7);
    });

    document.getElementById("reviewAfterAdaptiveBoss")?.addEventListener("click", () => {
      if (typeof goToPanel === "function") goToPanel(0);
    });

    document.getElementById("retryAdaptiveBoss")?.addEventListener("click", () => {
      startBossAdaptive();
    });
  }

  function initializeCheckpoint() {
    const form = document.getElementById("checkpointForm");
    const resultBox = document.getElementById("checkpointResult");

    if (form) {
      form.dataset.adaptive = "true";
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
        },
        true
      );
    }

    if (resultBox) resultBox.style.display = "none";
    checkpointSession = createCheckpointSession();
    renderCheckpoint();
  }

  // Substitui os handlers V1 do Boss sem reescrever a navegação do módulo.
  window.startBoss = startBossAdaptive;
  window.renderBoss = renderBossAdaptive;
  window.reviewAfterBoss = function () {
    bossSession = null;
    if (typeof goToPanel === "function") goToPanel(0);
  };

  initializeCheckpoint();
})();

/* =========================================================
   QuizADS · Configuração compartilhada
   ========================================================= */

window.QUIZADS = {
  supportUrl:
    "https://link.infinitepay.io/thiago-m-r-santos/VC01LTAtUg-b1idoMJpab-5,00",

  supportValue:
    "R$ 5,00",

  // Preencha apenas com números, incluindo DDI 55 e DDD.
  // Exemplo: 5511999999999
  problemSupportWhatsapp:
    "5519997566806",

  totalStructureModules: 8,

  availableStructureModules: 5
};

/* =========================================================
   PROGRESSÃO COMPARTILHADA — ESTRUTURA DE DADOS
   ========================================================= */

(function initializeStructureTrackProgress() {
  const modules = [
    { id: 1, name: "Fundamentos", key: "quizads_ed_m01_v1", slug: "modulo-01", published: true },
    { id: 2, name: "Lista Sequencial", key: "quizads_ed_m02_v1", slug: "modulo-02", published: true },
    { id: 3, name: "Lista Encadeada", key: "quizads_ed_m03_v1", slug: "modulo-03", published: true },
    { id: 4, name: "Variações de Lista", key: "quizads_ed_m04_v1", slug: "modulo-04", published: true },
    { id: 5, name: "Pilha e Fila", key: "quizads_ed_m05_v1", slug: "modulo-05", published: true },
    { id: 6, name: "Árvores", key: "quizads_ed_m06_v1", slug: "modulo-06", published: false },
    { id: 7, name: "BST e AVL", key: "quizads_ed_m07_v1", slug: "modulo-07", published: false },
    { id: 8, name: "Árvore B e Hash", key: "quizads_ed_m08_v1", slug: "modulo-08", published: false }
  ];

  function readState(id) {
    const module = modules.find((item) => item.id === Number(id));
    if (!module) return {};
    try {
      return JSON.parse(localStorage.getItem(module.key) || "{}");
    } catch {
      return {};
    }
  }

  function writeState(id, state) {
    const module = modules.find((item) => item.id === Number(id));
    if (!module) return;
    localStorage.setItem(module.key, JSON.stringify(state || {}));
  }

  function hasMeaningfulProgress(state) {
    if (!state || typeof state !== "object") return false;
    return state.accessGranted === true ||
      state.started === true ||
      state.completed === true ||
      Number(state.currentPanel) > 0 ||
      state.checkpointPassed === true ||
      state.bossPassed === true ||
      state.checkpointScore != null ||
      state.bossScore != null ||
      Boolean(state.completedAt);
  }

  function firstIncompleteBefore(targetId) {
    const target = Number(targetId);
    for (const module of modules) {
      if (module.id >= target) break;
      if (readState(module.id).completed !== true) return module;
    }
    return null;
  }

  function resolveAccess(targetId) {
    const target = Number(targetId);
    const module = modules.find((item) => item.id === target);
    if (!module) return { allowed: false, blocker: null, reason: "unknown-module" };
    if (target === 1) return { allowed: true, blocker: null, reason: "first-module" };

    const ownState = readState(target);

    // Continuidade: um módulo que já foi legitimamente iniciado não pode
    // travar novamente por uma inconsistência posterior no estado anterior.
    if (hasMeaningfulProgress(ownState)) {
      return { allowed: true, blocker: null, reason: "existing-progress" };
    }

    const blocker = firstIncompleteBefore(target);
    if (blocker) return { allowed: false, blocker, reason: "prerequisite" };
    return { allowed: true, blocker: null, reason: "prerequisites-complete" };
  }

  function grantAccess(targetId) {
    const result = resolveAccess(targetId);
    if (!result.allowed) return result;
    const state = readState(targetId);
    if (state.accessGranted !== true) {
      state.accessGranted = true;
      writeState(targetId, state);
    }
    return result;
  }

  function firstPendingPublished() {
    return modules.find((module) =>
      module.published && readState(module.id).completed !== true
    ) || null;
  }

  function lastPublished() {
    return [...modules].reverse().find((module) => module.published) || modules[0];
  }

  function moduleHrefFromModule(id) {
    return `../modulo-${String(id).padStart(2, "0")}/`;
  }

  function renderLegacyBlocked(containerId, targetId, accessResult) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const result = accessResult || resolveAccess(targetId);
    const blocker = result.blocker || firstIncompleteBefore(targetId);
    if (!blocker) return;

    container.style.display = "block";
    container.hidden = false;
    container.innerHTML = `
      <div class="lesson">
        <article class="boss-intro">
          <div class="boss-lock">🔒 MÓDULO BLOQUEADO</div>
          <h1 class="module-title">Primeiro conclua ${blocker.name}.</h1>
          <p>Esta trilha é cumulativa. Continue pelo primeiro módulo ainda não concluído para preservar os pré-requisitos.</p>
          <a class="btn btn-primary" href="${moduleHrefFromModule(blocker.id)}">Voltar ao Módulo ${String(blocker.id).padStart(2, "0")} →</a>
        </article>
      </div>`;
  }

  window.QuizADSTrack = {
    modules,
    readState,
    writeState,
    hasMeaningfulProgress,
    firstIncompleteBefore,
    resolveAccess,
    grantAccess,
    firstPendingPublished,
    lastPublished,
    moduleHrefFromModule,
    renderLegacyBlocked
  };
})();


/* =========================================================
   LOGO
   Sempre usar a arte ORIGINAL clara da KorDevs.
   O canvas da aplicação possui o mesmo fundo #F0EEE8.
   ========================================================= */

function initializeLogos() {
  document
    .querySelectorAll("[data-kordevs-logo]")
    .forEach((logo) => {
      const root =
        logo.dataset.root || "./";

      logo.src =
        `${root}assets/brand/KorDevs_White.png`;
    });
}


/* =========================================================
   LINKS DE APOIO
   ========================================================= */

function initializeSupportLinks() {
  document
    .querySelectorAll("[data-support-link]")
    .forEach((link) => {
      link.href =
        window.QUIZADS.supportUrl;
    });
}


/* =========================================================
   COPYRIGHT
   ========================================================= */

function initializeCurrentYear() {
  document
    .querySelectorAll("[data-current-year]")
    .forEach((element) => {
      element.textContent =
        new Date().getFullYear();
    });
}


/* =========================================================
   DARK MODE APOSENTADO
   Remove controles antigos sem quebrar os módulos 01–03.
   ========================================================= */

function removeLegacyThemeControls() {
  document
    .querySelectorAll(
      "[data-theme-toggle], [data-theme-icon]"
    )
    .forEach((element) => {
      element.remove();
    });

  document.documentElement.removeAttribute(
    "data-theme"
  );
}


/* =========================================================
   PROGRESSO DA TRILHA — HOME
   ========================================================= */

function getStoredModule(key) {
  try {
    return JSON.parse(
      localStorage.getItem(key) || "{}"
    );
  } catch {
    return {};
  }
}


function getStructureProgress() {
  const modules = window.QuizADSTrack
    ? window.QuizADSTrack.modules.map((module) =>
        window.QuizADSTrack.readState(module.id)
      )
    : [
        getStoredModule("quizads_ed_m01_v1"),
        getStoredModule("quizads_ed_m02_v1"),
        getStoredModule("quizads_ed_m03_v1")
      ];

  const completed = modules.filter(
    (module) => module.completed === true
  ).length;

  return { modules, completed };
}

function getContinueUrl() {
  if (!window.QuizADSTrack) {
    return "./trilhas/estrutura-de-dados/modulo-01/";
  }

  const next =
    window.QuizADSTrack.firstPendingPublished() ||
    window.QuizADSTrack.lastPublished();

  return `./trilhas/estrutura-de-dados/${next.slug}/`;
}

function initializeHomeProgress() {
  const {
    modules,
    completed
  } =
    getStructureProgress();


  const total =
    window.QUIZADS.totalStructureModules;


  const percent =
    Math.round(
      (completed / total) * 100
    );


  document
    .querySelectorAll(
      "[data-structure-progress]"
    )
    .forEach((element) => {
      element.style.width =
        `${percent}%`;
    });


  document
    .querySelectorAll(
      "[data-structure-progress-label]"
    )
    .forEach((element) => {
      element.textContent =
        `${completed} / ${total} módulos concluídos`;
    });


  document
    .querySelectorAll(
      "[data-structure-available]"
    )
    .forEach((element) => {
      element.textContent =
        `${window.QUIZADS.availableStructureModules} / ${total} módulos disponíveis`;
    });


  const continueUrl =
    getContinueUrl();


  document
    .querySelectorAll(
      "[data-structure-continue]"
    )
    .forEach((link) => {
      link.href =
        continueUrl;
    });


  const pendingPublished = window.QuizADSTrack?.firstPendingPublished();

  const continueLabel =
    completed === 0
      ? "Começar a estudar"
      : pendingPublished
        ? "Continuar estudando"
        : "Revisar último módulo";


  document
    .querySelectorAll(
      "[data-structure-continue-label]"
    )
    .forEach((element) => {
      element.textContent =
        continueLabel;
    });
}




/* =========================================================
   SUPORTE DE PROBLEMAS · WHATSAPP
   Injeta um botão discreto em todas as páginas internas.
   A Home premium fica sem esse botão por decisão de produto.
   ========================================================= */

function getProblemSupportContext() {
  const activePanel =
    document.querySelector(".lesson-panel.active");

  const contextElement =
    activePanel?.querySelector(
      ".assessment-type, .lesson-sequence, .lesson-heading h2, .assessment-head h2"
    ) ||
    document.getElementById("progressLabel");

  const context =
    contextElement?.textContent
      ?.replace(/\s+/g, " ")
      .trim();

  return context || "Página interna do QuizADS";
}


function buildProblemSupportUrl() {
  const phone =
    String(
      window.QUIZADS.problemSupportWhatsapp || ""
    ).replace(/\D/g, "");

  if (phone.length < 10) {
    return null;
  }

  const competency =
    document.querySelector(
      ".lesson-panel.active .adaptive-question-meta strong"
    )?.textContent?.replace(/\s+/g, " ").trim();

  const level =
    document.querySelector(
      ".lesson-panel.active .adaptive-level-chip"
    )?.textContent?.replace(/\s+/g, " ").trim();

  const message = [
    "*ENCONTREI UM PROBLEMA*",
    "",
    "Olá, estou com um problema no QuizADS e preciso de ajuda.",
    "",
    `Página: ${document.title}`,
    `Contexto: ${getProblemSupportContext()}`,
    competency ? `Competência: ${competency}` : null,
    level ? `Nível: ${level}` : null,
    `URL: ${window.location.href}`
  ]
    .filter((item) => item !== null && item !== undefined)
    .join("\n");

  return (
    `https://wa.me/${phone}` +
    `?text=${encodeURIComponent(message)}`
  );
}


function initializeProblemSupport() {
  if (
    document.body.classList.contains(
      "premium-home"
    )
  ) {
    return;
  }

  const headerActions =
    document.querySelector(
      ".site-header .header-actions"
    );

  if (
    !headerActions ||
    headerActions.querySelector(
      "[data-problem-support]"
    )
  ) {
    return;
  }

  const button =
    document.createElement("button");

  button.type = "button";
  button.className =
    "problem-support-button";
  button.dataset.problemSupport = "";
  button.setAttribute(
    "aria-label",
    "Encontrou um problema? Fale com o suporte"
  );
  button.setAttribute(
    "data-tooltip",
    "Encontrou um problema? Fale com o suporte"
  );
  button.innerHTML = `
    <span aria-hidden="true">☎</span>
    <span>Suporte</span>
  `;

  button.addEventListener(
    "click",
    () => {
      const url =
        buildProblemSupportUrl();

      if (!url) {
        alert(
          "Configure problemSupportWhatsapp em assets/js/quizads.js antes de publicar o botão de suporte."
        );
        return;
      }

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  );

  headerActions.prepend(button);
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    removeLegacyThemeControls();

    initializeLogos();

    initializeSupportLinks();

    initializeCurrentYear();

    initializeHomeProgress();

    initializeProblemSupport();
  }
);
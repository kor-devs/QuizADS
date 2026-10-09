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

  availableStructureModules: 3
};


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
  const modules = [
    getStoredModule(
      "quizads_ed_m01_v1"
    ),

    getStoredModule(
      "quizads_ed_m02_v1"
    ),

    getStoredModule(
      "quizads_ed_m03_v1"
    )
  ];

  const completed =
    modules.filter(
      (module) =>
        module.completed === true
    ).length;

  return {
    modules,
    completed
  };
}


function getContinueUrl(modules) {
  if (
    !modules[0]?.completed
  ) {
    return "./trilhas/estrutura-de-dados/modulo-01/";
  }

  if (
    !modules[1]?.completed
  ) {
    return "./trilhas/estrutura-de-dados/modulo-02/";
  }

  if (
    !modules[2]?.completed
  ) {
    return "./trilhas/estrutura-de-dados/modulo-03/";
  }

  /*
    Módulo 04 ainda não existe.
    Até ele ser publicado, mantemos revisão do M03.
  */

  return "./trilhas/estrutura-de-dados/modulo-03/";
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
    getContinueUrl(modules);


  document
    .querySelectorAll(
      "[data-structure-continue]"
    )
    .forEach((link) => {
      link.href =
        continueUrl;
    });


  const continueLabel =
    completed === 0
      ? "Começar a estudar"
      : completed >= 3
        ? "Revisar último módulo"
        : "Continuar estudando";


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
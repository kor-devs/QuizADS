/* =========================================================
   QuizADS · Configuração compartilhada
   ========================================================= */

window.QUIZADS = {
  supportUrl:
    "https://link.infinitepay.io/thiago-m-r-santos/VC01LTAtUg-b1idoMJpab-5,00",

  supportValue:
    "R$ 5,00",

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
  }
);
/* =========================================================
   QuizADS - Configurações compartilhadas
   ========================================================= */

window.QUIZADS = {
  supportUrl:
    "https://link.infinitepay.io/thiago-m-r-santos/VC01LTAtUg-b1idoMJpab-5,00",

  supportValue:
    "R$ 5,00"
};


/* =========================================================
   Tema claro / escuro
   ========================================================= */

const THEME_KEY = "quizads_theme";

function getPreferredTheme() {
  const saved =
    localStorage.getItem(THEME_KEY);

  if (
    saved === "light" ||
    saved === "dark"
  ) {
    return saved;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}


function applyTheme(theme) {
  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  localStorage.setItem(
    THEME_KEY,
    theme
  );

  updateThemeUI();
}


function toggleTheme() {
  const current =
    document.documentElement.getAttribute(
      "data-theme"
    );

  applyTheme(
    current === "dark"
      ? "light"
      : "dark"
  );
}


function updateThemeUI() {
  const theme =
    document.documentElement.getAttribute(
      "data-theme"
    );

  document
    .querySelectorAll(
      "[data-theme-icon]"
    )
    .forEach((button) => {
      button.textContent =
        theme === "dark"
          ? "☀️"
          : "🌙";

      button.setAttribute(
        "aria-label",
        theme === "dark"
          ? "Usar tema claro"
          : "Usar tema escuro"
      );
    });

  document
    .querySelectorAll(
      "[data-kordevs-logo]"
    )
    .forEach((logo) => {
      const root =
        logo.dataset.root || "./";

      logo.src =
        theme === "dark"
          ? `${root}assets/brand/KorDevs_Dark.png`
          : `${root}assets/brand/KorDevs_White.png`;
    });
}


/* =========================================================
   Inicialização
   ========================================================= */

applyTheme(
  getPreferredTheme()
);


document.addEventListener(
  "DOMContentLoaded",
  () => {

    document
      .querySelectorAll(
        "[data-theme-toggle]"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          toggleTheme
        );
      });


    document
      .querySelectorAll(
        "[data-support-link]"
      )
      .forEach((link) => {
        link.href =
          window.QUIZADS.supportUrl;
      });


    document
      .querySelectorAll(
        "[data-current-year]"
      )
      .forEach((element) => {
        element.textContent =
          new Date().getFullYear();
      });


    updateThemeUI();

  }
);
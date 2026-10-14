/* =========================================================
   QuizADS · Auth
   Login opcional com Google via Supabase
   ========================================================= */

(function () {
  "use strict";

  const config =
    window.QUIZADS_SUPABASE;

  const sdk =
    window.supabase;

  if (
    !config ||
    !config.url ||
    !config.anonKey ||
    !sdk
  ) {
    console.warn(
      "QuizADS Auth não inicializado."
    );

    return;
  }


  const client =
    sdk.createClient(
      config.url,
      config.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );


  const M04_PROMPT_KEY =
    "quizads_auth_prompt_m04_v1";


  let currentUser = null;

  let modal = null;

  let modalMode =
    "default";

  let previouslyFocused = null;


  /* =======================================================
     CAMINHOS
     ======================================================= */

  const currentScript =
    document.currentScript;

  const appRoot =
    currentScript
      ? new URL(
          "../../",
          currentScript.src
        )
      : new URL(
          "/QuizADS/",
          window.location.origin
        );


  function appUrl(path = "") {

    return new URL(
      path,
      appRoot
    ).href;

  }


  /* =======================================================
     SEGURANÇA DE HTML
     ======================================================= */

  function escapeHtml(value) {

    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* =======================================================
     USUÁRIO
     ======================================================= */

  function getDisplayName(user) {

    return (
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Conta"
    );

  }


  function getFirstName(user) {

    return getDisplayName(user)
      .trim()
      .split(/\s+/)[0];

  }


  function getAvatar(user) {

    return (
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture ||
      ""
    );

  }


  async function refreshUser() {

    const {
      data,
      error
    } =
      await client.auth.getUser();


    if (error) {

      currentUser = null;

      return null;

    }


    currentUser =
      data.user || null;


    renderAuthTriggers();


    return currentUser;

  }


  function ensureAuthTrigger() {

    const slots =
      document.querySelectorAll(
        "[data-auth-slot]"
      );


    if (!slots.length) {
      return;
    }


    slots.forEach((slot) => {

      if (
        slot.querySelector(
          "[data-auth-trigger]"
        )
      ) {
        return;
      }


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "auth-header-trigger auth-profile-trigger";

      button.dataset.authTrigger =
        "";

      button.setAttribute(
        "aria-label",
        "Conta e progresso"
      );


      slot.appendChild(
        button
      );

    });

  }


  const readyPromise =
    refreshUser();


  /* =======================================================
     BOTÕES DE LOGIN
     ======================================================= */

  function renderAuthTriggers() {

    ensureAuthTrigger();
    
    document
      .querySelectorAll(
        "[data-auth-trigger]"
      )
      .forEach((button) => {

        if (!currentUser) {

          button.setAttribute(
            "aria-label",
            "Entrar ou criar conta para salvar seu progresso"
          );

          button.title =
            "Entrar ou criar conta";

          button.innerHTML = `
            <span
              class="auth-trigger-icon"
              aria-hidden="true"
            >
              ◉
            </span>

            <span>
              Entrar para salvar
            </span>
          `;

          button.classList.remove(
            "is-authenticated"
          );

          return;
        }


        const avatar =
          getAvatar(currentUser);

        button.setAttribute(
          "aria-label",
          "Conta e progresso"
        );

        button.removeAttribute(
          "title"
        );

        const name =
          escapeHtml(
            getFirstName(currentUser)
          );


        button.innerHTML = `

          ${
            avatar
              ? `
                <img
                  class="auth-trigger-avatar"
                  src="${escapeHtml(avatar)}"
                  alt=""
                  referrerpolicy="no-referrer"
                />
              `
              : `
                <span
                  class="auth-trigger-avatar-fallback"
                  aria-hidden="true"
                >
                  ✓
                </span>
              `
          }

          <span>
            ${name}
          </span>
        `;


        button.classList.add(
          "is-authenticated"
        );

      });

  }


  /* =======================================================
     MODAL
     ======================================================= */

  function ensureModal() {

    if (modal) {
      return modal;
    }


    const wrapper =
      document.createElement("div");


    wrapper.className =
      "auth-modal-backdrop";

    wrapper.hidden = true;


    wrapper.innerHTML = `

      <section
        class="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="authModalTitle"
      >

        <button
          type="button"
          class="auth-modal-close"
          data-auth-close
          aria-label="Fechar"
        >
          ×
        </button>


        <div
          class="auth-modal-brand"
        >
          <img
            src="${appUrl(
              "assets/brand/KorDevs_White.png"
            )}"
            alt="KorDevs"
          />

          <div>

            <strong>
              QuizADS
            </strong>

            <span>
              Um apoio à aprendizagem por KorDevs
            </span>

          </div>

        </div>


        <div
          id="authModalContent"
        ></div>

      </section>
    `;


    document.body.appendChild(
      wrapper
    );


    wrapper
      .querySelector(
        "[data-auth-close]"
      )
      .addEventListener(
        "click",
        closeModal
      );


    wrapper.addEventListener(
      "click",
      (event) => {

        if (
          event.target === wrapper
        ) {

          closeModal();

        }

      }
    );


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          !wrapper.hidden
        ) {

          closeModal();

        }

        if (
          event.key === "Tab" &&
          !wrapper.hidden
        ) {

          const focusable = Array.from(
            wrapper.querySelectorAll(
              'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((element) => !element.hidden);

          if (!focusable.length) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }

        }

      }
    );


    modal =
      wrapper;


    return modal;

  }


  function renderGuestModal() {

    const content =
      ensureModal()
        .querySelector(
          "#authModalContent"
        );


    const m04 =
      modalMode === "m04";


    content.innerHTML = `

      <div
        class="auth-modal-kicker"
      >
        ${
          m04
            ? "Seu progresso importa"
            : "Conta QuizADS"
        }
      </div>


      <h2
        id="authModalTitle"
      >
        ${
          m04
            ? "Você já avançou bastante."
            : "Seu progresso, em qualquer dispositivo."
        }
      </h2>


      <p
        class="auth-modal-lead"
      >
        ${
          m04
            ? `
              Você concluiu uma parte importante da
              trilha. Entre com Google para proteger
              sua evolução e continuar de onde parou
              em outros dispositivos.
            `
            : `
              Entre com Google para vincular sua
              evolução a uma conta e continuar seus
              estudos em outros dispositivos.
            `
        }
      </p>


      <button
        type="button"
        class="auth-google-button"
        data-google-login
      >

        <span
          class="auth-google-mark"
          aria-hidden="true"
        >
          G
        </span>

        <span>
          ${
            m04
              ? "Salvar meu progresso com Google"
              : "Continuar com Google"
          }
        </span>

      </button>


      <button
        type="button"
        class="auth-continue-button"
        data-auth-close-secondary
      >
        ${
          m04
            ? "Continuar sem login"
            : "Agora não"
        }
      </button>


      <p
        class="auth-modal-note"
      >
        O login é opcional. Você continua podendo
        estudar sem criar uma conta.
      </p>


      <div
        class="auth-modal-legal"
      >
        <a
          href="${appUrl("privacy/")}"
        >
          Privacidade
        </a>

        <span>·</span>

        <a
          href="${appUrl("terms/")}"
        >
          Termos
        </a>
      </div>
    `;


    content
      .querySelector(
        "[data-google-login]"
      )
      .addEventListener(
        "click",
        loginWithGoogle
      );


    content
      .querySelector(
        "[data-auth-close-secondary]"
      )
      .addEventListener(
        "click",
        closeModal
      );

  }


  function renderAuthenticatedModal() {

    const content =
      ensureModal()
        .querySelector(
          "#authModalContent"
        );


    const name =
      escapeHtml(
        getDisplayName(
          currentUser
        )
      );


    const email =
      escapeHtml(
        currentUser?.email || ""
      );


    const avatar =
      getAvatar(
        currentUser
      );


    content.innerHTML = `

      <div
        class="auth-modal-kicker"
      >
        Conta conectada
      </div>


      <div
        class="auth-account-head"
      >

        ${
          avatar
            ? `
              <img
                class="auth-account-avatar"
                src="${escapeHtml(avatar)}"
                alt=""
                referrerpolicy="no-referrer"
              />
            `
            : ""
        }


        <div>

          <h2
            id="authModalTitle"
          >
            ${name}
          </h2>

          <p>
            ${email}
          </p>

        </div>

      </div>


      <div
        class="auth-account-status"
      >
        <strong>
          Login ativo
        </strong>

        <span>
          Seu progresso local permanece disponível.
          A sincronização é tentada automaticamente
          quando o serviço remoto está acessível.
        </span>
      </div>


      <button
        type="button"
        class="auth-signout-button"
        data-auth-signout
      >
        Sair da conta
      </button>
    `;


    content
      .querySelector(
        "[data-auth-signout]"
      )
      .addEventListener(
        "click",
        logout
      );

  }


  async function openModal(
    mode = "default"
  ) {

    modalMode =
      mode;


    await readyPromise;

    await refreshUser();


    const wrapper =
      ensureModal();

    previouslyFocused =
      document.activeElement;


    if (currentUser) {

      renderAuthenticatedModal();

    } else {

      renderGuestModal();

    }


    wrapper.hidden =
      false;


    document.body.classList.add(
      "auth-modal-open"
    );

    requestAnimationFrame(() => {
      wrapper.querySelector("[data-auth-close]")?.focus();
    });

  }


  function closeModal() {

    if (!modal) {
      return;
    }


    modal.hidden =
      true;


    document.body.classList.remove(
      "auth-modal-open"
    );

    if (
      previouslyFocused &&
      typeof previouslyFocused.focus === "function"
    ) {
      previouslyFocused.focus();
    }

    previouslyFocused = null;

  }


  /* =======================================================
     GOOGLE OAUTH
     ======================================================= */

  async function loginWithGoogle() {

    const redirectTo =
      window.location.origin +
      window.location.pathname;


    const {
      error
    } =
      await client.auth
        .signInWithOAuth({
          provider:
            "google",

          options: {
            redirectTo
          }
        });


    if (error) {

      console.error(
        "Erro no login Google:",
        error
      );


      alert(
        "Não foi possível iniciar o login com Google."
      );

    }

  }


  async function logout() {

    await client.auth.signOut();


    currentUser =
      null;


    closeModal();

    renderAuthTriggers();

  }


  /* =======================================================
     M04 · PRIMEIRA ENTRADA
     ======================================================= */

  async function promptOnModuleEntry(
    moduleNumber
  ) {

    if (
      Number(moduleNumber) !== 4
    ) {
      return;
    }


    await readyPromise;


    if (currentUser) {
      return;
    }


    if (
      localStorage.getItem(
        M04_PROMPT_KEY
      )
    ) {
      return;
    }


    /*
      Marca no momento da primeira apresentação.
      Assim o popup realmente aparece uma única vez.
    */

    localStorage.setItem(
      M04_PROMPT_KEY,
      new Date().toISOString()
    );


    await openModal(
      "m04"
    );

  }


  /* =======================================================
     EVENTS
     ======================================================= */

  document.addEventListener(
    "click",
    (event) => {

      const trigger =
        event.target.closest(
          "[data-auth-trigger]"
        );


      if (!trigger) {
        return;
      }


      event.preventDefault();


      openModal(
        "default"
      );

    }
  );


  client.auth.onAuthStateChange(
    (_event, session) => {

      currentUser =
        session?.user || null;


      renderAuthTriggers();

      document.dispatchEvent(
        new CustomEvent("quizads:auth-changed", {
          detail: { authenticated: Boolean(currentUser) }
        })
      );

    }
  );


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      ensureAuthTrigger();
      renderAuthTriggers();

    },
    {
      once: true
    }
  );


  /* =======================================================
     API PÚBLICA
     ======================================================= */

  window.QuizADSAuth = {
    client,

    ready:
      () => readyPromise,

    getUser:
      () => currentUser,

    isAuthenticated:
      () => Boolean(currentUser),

    open:
      openModal,

    close:
      closeModal,

    loginWithGoogle,

    logout,

    promptOnModuleEntry
  };

})();

/* QuizADS · Course Shell */

(function () {

  "use strict";


  const catalog =
    window.QUIZADS_COURSE_CATALOG;

  const data =
    window.QUIZADS_COURSE_MODULE || {};

  const meta =
    data.meta || {};

  const definition =
    data.definition || {};

  const ui =
    data.ui || {};


  function escapeHtml(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function parseState(raw) {

    try {

      return JSON.parse(
        raw || ""
      ) || {};

    } catch {

      return {};

    }

  }


  function moduleState(number) {

    const key =
      `quizads_ed_m${String(number)
        .padStart(2, "0")}_v1`;


    return parseState(
      localStorage.getItem(key)
    );

  }


  const trackId =
    definition.trackId ||
    meta.trackId ||
    "estrutura-de-dados";


  const track =
    catalog?.tracks?.[trackId];


  const moduleNumber =
    Number(
      meta.number ||
      meta.moduleNumber ||
      1
    );


  const moduleName =
    meta.name ||
    definition.title
      ?.replace(
        /^Módulo\s+\d+\s*·\s*/i,
        ""
      ) ||
    `Módulo ${moduleNumber}`;


  const heroTitle =
    ui.heroTitle ||
    meta.heroTitle ||
    moduleName;


  const heroDescription =
    ui.heroDescription ||
    meta.heroDescription ||
    "";


  function canAccess(module) {

    if (!module.published) {
      return false;
    }


    if (
      window.QuizADSTrack
        ?.resolveAccess
    ) {

      return Boolean(
        window
          .QuizADSTrack
          .resolveAccess(
            module.number
          )
          ?.allowed
      );

    }


    if (module.number === 1) {
      return true;
    }


    return (
      moduleState(
        module.number - 1
      ).completed === true
    );

  }


  function moduleHref(number) {

    return new URL(
      `../modulo-${String(number)
        .padStart(2, "0")}/`,
      window.location.href
    ).href;

  }


  function renderRail() {

    return track.modules
      .map((module) => {

        const state =
          moduleState(
            module.number
          );


        const accessible =
          canAccess(module);


        const current =
          module.number ===
          moduleNumber;


        const tag =
          accessible
            ? "a"
            : "div";


        const classes = [

          "course-module-link",

          current
            ? "current"
            : "",

          state.completed
            ? "done"
            : "",

          !accessible
            ? "locked"
            : ""

        ]
          .filter(Boolean)
          .join(" ");


        return `

          <${tag}

            class="${classes}"

            ${
              accessible
                ? `href="${moduleHref(
                    module.number
                  )}"`
                : ""
            }

            ${
              current
                ? 'aria-current="page"'
                : ""
            }

          >

            <span
              class="course-module-dot"
            ></span>


            <span>

              <span
                class="course-module-number"
              >
                Módulo ${
                  String(
                    module.number
                  ).padStart(
                    2,
                    "0"
                  )
                }
              </span>


              <span
                class="course-module-name"
              >
                ${
                  escapeHtml(
                    module.name
                  )
                }
              </span>


              <span
                class="course-module-topic"
              >
                ${
                  escapeHtml(
                    module.topic
                  )
                }
              </span>

            </span>

          </${tag}>

        `;

      })
      .join("");

  }


  function refreshRail() {

    const html = renderRail();

    ["courseModules", "mobileCourseModules"]
      .forEach((id) => {
        const root = document.getElementById(id);
        if (root) root.innerHTML = html;
      });

  }


  function setOutline(items, activePanel, onSelect) {

    const render = (root) => {
      if (!root) return;
      root.innerHTML = "";

      items.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "course-outline-item";
        button.disabled = item.disabled === true;
        if (item.panel === activePanel) {
          button.classList.add("active");
          button.setAttribute("aria-current", "step");
        }
        button.innerHTML = `
          <span class="course-outline-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="course-outline-name">${escapeHtml(item.name)}<span class="course-outline-note">${escapeHtml(item.note || "")}</span></span>
        `;
        button.addEventListener("click", () => onSelect(item.panel));
        root.appendChild(button);
      });
    };

    render(document.getElementById("courseOutline"));
    render(document.getElementById("mobileCourseOutline"));

  }


  function setProgress(percent, context) {

    const value = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));

    ["moduleProgressFill", "mobileModuleProgressFill"].forEach((id) => {
      document.getElementById(id)?.style.setProperty("width", `${value}%`);
    });

    ["moduleProgressLabel", "mobileModuleProgressLabel"].forEach((id) => {
      const label = document.getElementById(id);
      if (label) label.textContent = `${value}%`;
    });

    const progress = document.querySelector("[data-module-progress]");
    progress?.setAttribute("aria-valuenow", String(value));

    const contextLabel = document.getElementById("moduleProgressContext");
    if (contextLabel && context) contextLabel.textContent = context;

  }


  function mount() {

    const app =
      document.getElementById(
        "courseApp"
      );


    if (
      !app ||
      !track
    ) {

      console.error(
        "QuizADS Course Shell: configuração inválida."
      );

      return;

    }


    document.body
      .classList
      .add(
        "course-page",
        "study-module-page"
      );


    app.innerHTML = `

      <header
        class="site-header"
      >

        <div
          class="container header-inner"
        >

          <a
            href="../../../"
            class="brand"
            aria-label="Voltar para o QuizADS"
          >

            <img
              data-kordevs-logo
              data-root="../../../"
              class="brand-logo"
              src="../../../assets/brand/KorDevs_White.png"
              alt="KorDevs"
            />


            <div
              class="brand-info"
            >

              <span
                class="brand-name"
              >
                QuizADS
              </span>

              <span
                class="brand-product"
              >
                learning system ·
                ${
                  escapeHtml(
                    track.name
                      .toLowerCase()
                  )
                }
              </span>

            </div>

          </a>


          <div
            class="header-actions"
          >

            <a
              data-support-link
              class="header-support"
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apoiar o projeto
            </a>


            <div
              class="auth-slot auth-slot-module"
              data-auth-slot
            ></div>

          </div>

        </div>

      </header>


      <main
        id="workspace"
        class="course-shell"
      >

        <aside
          class="course-sidebar"
        >

          <div
            class="course-sidebar-inner"
          >

            <div
              class="course-sidebar-head"
            >

              <div
                class="course-sidebar-label"
              >
                Trilha ${
                  String(
                    track.number
                  ).padStart(
                    2,
                    "0"
                  )
                }
              </div>


              <div
                class="course-sidebar-title"
              >
                ${
                  escapeHtml(
                    track.name
                  )
                }
              </div>

            </div>


            <nav
              id="courseModules"
              class="course-modules"
            >

              ${renderRail()}

            </nav>

          </div>

        </aside>


        <section
          id="courseContent"
          class="course-content"
        >

          <div
            class="mobile-course-bar"
          >

            <div
              class="mobile-course-bar-row"
            >

              <span
                class="mobile-course-bar-title"
              >
                Módulo ${
                  String(
                    moduleNumber
                  ).padStart(
                    2,
                    "0"
                  )
                }
                ·
                ${
                  escapeHtml(
                    moduleName
                  )
                }
              </span>


              <span
                id="mobileModuleProgressLabel"
                class="mobile-course-bar-progress"
              >
                0%
              </span>

            </div>


            <div
              class="mobile-course-line"
            >

              <div
                id="mobileModuleProgressFill"
                style="width:0%"
              ></div>

            </div>

            <details class="mobile-course-navigation">
              <summary>Navegação do curso</summary>
              <div class="mobile-course-navigation-panel">
                <strong>Módulos</strong>
                <nav id="mobileCourseModules" class="course-modules" aria-label="Módulos da trilha">
                  ${renderRail()}
                </nav>
                <strong>Etapas deste módulo</strong>
                <div id="mobileCourseOutline" class="course-outline-list"></div>
              </div>
            </details>

          </div>


          <nav
            class="course-breadcrumb"
          >

            <a href="../../../">
              QuizADS
            </a>

            <span>
              /
            </span>

            <span>
              ${
                escapeHtml(
                  track.name
                )
              }
            </span>

            <span>
              /
            </span>

            <span>
              Módulo ${
                String(
                  moduleNumber
                ).padStart(
                  2,
                  "0"
                )
              }
            </span>

          </nav>


          <header
            class="module-hero"
          >

            <div
              class="module-overline"
            >
              Módulo ${
                String(
                  moduleNumber
                ).padStart(
                  2,
                  "0"
                )
              }
              ·
              ${
                escapeHtml(
                  moduleName
                )
              }
            </div>


            <h1>
              ${
                escapeHtml(
                  heroTitle
                )
              }
            </h1>


            ${
              heroDescription
                ? `

                  <p
                    class="module-hero-description"
                  >
                    ${
                      escapeHtml(
                        heroDescription
                      )
                    }
                  </p>

                `
                : ""
            }


            <div
              class="module-progress-row"
            >

              <div>

                <div
                  class="module-progress-copy"
                >

                  <span
                    id="moduleProgressContext"
                  >
                    ${
                      Array.isArray(
                        data.lessons
                      )
                        ? `Aula 1 de ${data.lessons.length}`
                        : "Progresso"
                    }
                  </span>

                  <span>
                    Progresso do módulo
                  </span>

                </div>


                <div
                  class="module-progress-track"
                  data-module-progress
                  role="progressbar"
                  aria-label="Progresso do módulo"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="0"
                >

                  <span
                    id="moduleProgressFill"
                    class="module-progress-value"
                    style="width:0%"
                  ></span>

                </div>

              </div>


              <div
                id="moduleProgressLabel"
                class="module-progress-percent"
              >
                0%
              </div>

            </div>

          </header>


          <div
            id="lessonPanels"
          ></div>

        </section>


        <aside
          class="course-outline"
        >

          <div
            class="course-outline-inner"
          >

            <div
              class="course-outline-title"
            >
              Neste módulo
            </div>


            <div
              id="courseOutline"
              class="course-outline-list"
            ></div>

          </div>

        </aside>

      </main>


      <section
        id="lockedContent"
        class="container"
        hidden
      ></section>

    `;


    document.dispatchEvent(

      new CustomEvent(
        "quizads:course-shell-ready",
        {
          detail: {
            trackId,
            moduleNumber
          }
        }
      )

    );

  }


  window.QuizADSCourseShell = {
    mount,
    refreshRail,
    setOutline,
    setProgress
  };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      mount,
      {
        once: true
      }
    );

  } else {

    mount();

  }

})();

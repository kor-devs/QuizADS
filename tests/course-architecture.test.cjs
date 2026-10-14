const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

function seededMath(seed = 0x514a) {
  let value = seed >>> 0;
  const math = Object.create(Math);
  math.random = () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
  return math;
}

function loadModule(number) {
  const id = String(number).padStart(2, "0");
  const context = { window: {}, console, Math: seededMath(number * 991) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync("assets/js/activity-engine.js", "utf8"), context);
  vm.runInContext(fs.readFileSync(`trilhas/estrutura-de-dados/modulo-${id}/learning-data.js`, "utf8"), context);
  return { data: context.window.QUIZADS_COURSE_MODULE, engine: context.window.QuizADSActivityEngine };
}

for (const number of [1, 2, 3, 4, 5]) {
  const { data, engine } = loadModule(number);
  assert.ok(data.conclusion?.rubric?.length >= 3, `M0${number}: conclusion rubric missing`);
  assert.strictEqual(data.lessons.length, 5, `M0${number}: expected five lessons`);
  if (number > 1) assert.ok(data.lab, `M0${number}: lab missing`);

  for (const [competencyId, templates] of Object.entries(data.questions)) {
    assert.ok(templates.length >= 5, `M0${number}/${competencyId}: five-level coverage expected`);
    assert.deepStrictEqual(
      [...new Set(templates.map((template) => template.level))].sort((a, b) => a - b),
      [20, 40, 60, 80, 100],
      `M0${number}/${competencyId}: missing adaptive level`
    );
    for (const template of templates) {
      const signatures = new Set();
      for (let iteration = 0; iteration < 100; iteration += 1) {
        const activity = engine.materialize(template, { requestedLevel: template.level });
        assert.strictEqual(new Set(activity.options).size, activity.options.length, `${template.id}: duplicate options`);
        signatures.add(activity.signature);
      }
      assert.ok(signatures.size >= (number <= 3 ? 1 : 3), `${template.id}: expected generated signatures`);
    }
  }
}

const catalogContext = { window: {} };
vm.createContext(catalogContext);
vm.runInContext(fs.readFileSync("assets/js/course-catalog.js", "utf8"), catalogContext);
assert.strictEqual(catalogContext.window.QUIZADS_COURSE_CATALOG.tracks["estrutura-de-dados"].modules[4].published, true);

for (const number of [4, 5]) {
  const html = fs.readFileSync(`trilhas/estrutura-de-dados/modulo-0${number}/index.html`, "utf8");
  assert.match(html, /assets\/js\/course-runtime\.js/);
  assert.match(html, /assets\/js\/activity-engine\.js/);
  assert.match(html, /assets\/js\/conclusion-engine\.js/);
  assert.doesNotMatch(html, /course-module-runtime\.js/);
}

for (const number of [1, 2, 3]) {
  const html = fs.readFileSync(`trilhas/estrutura-de-dados/modulo-0${number}/index.html`, "utf8");
  assert.match(html, /knowledge\.js/);
  assert.match(html, /activity-engine\.js/);
  assert.match(html, /assets\/js\/course-runtime\.js/, `M0${number}: shared runtime entry missing`);
  const { data } = loadModule(number);
  assert.ok(data, `M0${number}: shared course contract missing`);
  assert.doesNotMatch(html, /Pergunta-chave/i);
}

const runtime = fs.readFileSync("assets/js/course-runtime.js", "utf8");
const submitBoss = runtime.slice(runtime.indexOf("function submitBoss"), runtime.indexOf("function renderBossResult"));
assert.doesNotMatch(submitBoss, /legacy\.completed\s*=\s*true/, "Boss must not complete a module directly");
assert.match(runtime, /conclusionEvidence/);
assert.match(runtime, /reached===0\?0/, "the initial lesson must not be reported as completed progress");
assert.match(runtime, /QuizADSProgressSync\?\.ready/, "course runtime must wait for remote hydration when available");
assert.match(runtime, /quizads:progress-hydrated/, "course runtime must refresh after a late authenticated hydration");
assert.match(runtime, /evaluation\?\.missingCriteria/, "legacy empty conclusion evidence must not crash the course renderer");

const shell = fs.readFileSync("assets/js/course-shell.js", "utf8");
assert.match(shell, /Restaurando seu progresso/, "module hero must not show a false 0% while authenticated progress is being restored");
assert.match(shell, /aria-busy/, "restoring state must be exposed to assistive technology");

const home = fs.readFileSync("assets/js/quizads.js", "utf8");
assert.match(home, /QuizADSProgressSync\?\.ready/, "home must wait for remote progress before choosing its primary study CTA");

const auth = fs.readFileSync("assets/js/quizads-auth.js", "utf8");
assert.match(auth, /Entrar para salvar/, "anonymous header action must clearly communicate login before persistence");

console.log("PASS: shared M01-M05 runtime contract, generative activity banks, conclusion gate and M05 publication.");

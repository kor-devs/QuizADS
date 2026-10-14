const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const context = { window: {}, console, Date, localStorage: { getItem: () => null, setItem() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync("assets/js/progress-sync.js", "utf8"), context);
const sync = context.window.QuizADSProgressSync;
assert.strictEqual(typeof sync.hydrateAll, "function", "remote hydration must be available before course runtime starts");

const syncSource = fs.readFileSync("assets/js/progress-sync.js", "utf8");
assert.match(
  syncSource,
  /quizads:progress-hydrated/,
  "a login that happens after the course is rendered must notify the runtime after remote hydration"
);
assert.match(
  syncSource,
  /Promise\.all\(/,
  "initial hydration must fetch progress payloads concurrently"
);
assert.match(
  syncSource,
  /select\("module_id,payload"\)/,
  "initial hydration must request all module payloads in a batch instead of one request per module"
);

const local = {
  completed: true,
  completedAt: "2026-10-12T12:00:00.000Z",
  maxPanel: 7,
  updatedAt: "2026-10-12T12:00:00.000Z",
  conclusionEvidence: { id: "local-evidence", approved: true, createdAt: "2026-10-12T12:00:00.000Z" }
};
const remote = {
  completed: false,
  maxPanel: 4,
  updatedAt: "2026-10-13T12:00:00.000Z"
};
const merged = sync.mergeModuleProgress(local, remote);
assert.strictEqual(merged.completed, true, "completion must not be lost to a newer incomplete snapshot");
assert.strictEqual(merged.maxPanel, 7, "furthest navigation progress must win");
assert.strictEqual(merged.conclusionEvidence.approved, true, "approved evidence must be preserved");

const localLearning = {
  updatedAt: "2026-10-12T12:00:00.000Z",
  competencies: {
    ops: { level: 80, mastery: 74, attempts: 4, lastStudiedAt: "2026-10-12T12:00:00.000Z", evidence: [{ signature: "a" }], seenSignatures: ["a"] }
  }
};
const remoteLearning = {
  updatedAt: "2026-10-13T12:00:00.000Z",
  competencies: {
    ops: { level: 60, mastery: 61, attempts: 6, lastStudiedAt: "2026-10-13T12:00:00.000Z", evidence: [{ signature: "b" }], seenSignatures: ["b"] }
  }
};
const mergedLearning = sync.mergeLearningState(localLearning, remoteLearning);
assert.strictEqual(mergedLearning.competencies.ops.level, 60, "newer pedagogical adjustment must win, even when it lowers support level");
assert.strictEqual(mergedLearning.competencies.ops.attempts, 6);
assert.strictEqual(mergedLearning.competencies.ops.evidence.length, 2);
assert.deepStrictEqual(Array.from(mergedLearning.competencies.ops.seenSignatures).sort(), ["a", "b"]);

console.log("PASS: conservative local-first progress merge.");

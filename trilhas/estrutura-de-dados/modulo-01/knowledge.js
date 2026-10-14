/* QuizADS · Base curricular M01 · Fundamentos */
(function () {
  "use strict";
  window.QUIZADS_KNOWLEDGE = {
    schemaVersion: 1,
    trackId: "estrutura-de-dados",
    moduleId: "m01",
    concepts: ["tipo abstrato de dado", "memória", "endereço", "ponteiro", "alocação dinâmica"],
    definitions: [
      { term: "TAD", meaning: "Modelo que define dados e operações observáveis sem expor a implementação." },
      { term: "ponteiro", meaning: "Variável cujo valor representa o endereço de outra região de memória." }
    ],
    rules: ["O operador & obtém um endereço; o operador * acessa o valor apontado.", "A memória dinâmica deve ser liberada quando deixa de ser necessária."],
    terminology: ["interface", "implementação", "endereço", "desreferência", "malloc", "free"],
    invariants: ["Um ponteiro só pode ser desreferenciado quando referencia memória válida."],
    operations: ["declarar ponteiro", "obter endereço", "desreferenciar", "alocar", "liberar"],
    codeExamples: ["int valor = 10; int *p = &valor;", "int *p = malloc(sizeof(int)); free(p);"],
    misconceptions: ["Ponteiro não é o próprio dado.", "Alocar memória não inicializa automaticamente um valor útil."],
    representations: ["caixas de memória e endereços", "tabela variável-valor-endereço", "trecho de código C"],
    constraints: ["Exemplos usam C e exigem verificação de ponteiro antes da desreferência."],
    sourceRefs: ["Ebook Estrutura de Dados · fundamentos, TAD, memória e ponteiros"]
  };
})();

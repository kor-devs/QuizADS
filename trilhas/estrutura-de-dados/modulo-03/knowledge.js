/* QuizADS · Base curricular M03 · Lista Encadeada */
(function () {
  "use strict";
  window.QUIZADS_KNOWLEDGE = {
    schemaVersion: 1,
    trackId: "estrutura-de-dados",
    moduleId: "m03",
    concepts: ["nó", "ponteiro próximo", "início", "alocação por nó", "percurso encadeado"],
    definitions: [
      { term: "nó", meaning: "Elemento que reúne a informação armazenada e a ligação para o próximo nó." },
      { term: "início", meaning: "Ponteiro que referencia o primeiro nó ou NULL quando a lista está vazia." }
    ],
    rules: ["A inserção no início liga o novo nó ao início antigo antes de atualizar o início.", "A remoção deve religar a cadeia antes de liberar o nó."],
    terminology: ["nó", "info", "prox", "início", "anterior", "atual", "NULL"],
    invariants: ["O último nó possui prox == NULL.", "Todo nó alcançável a partir do início pertence à lista."],
    operations: ["criar", "inserir no início", "percorrer", "buscar", "remover", "liberar"],
    codeExamples: ["typedef struct no { char info; struct no *prox; } no;", "novo->prox = inicio; inicio = novo;"],
    misconceptions: ["Nós não precisam ocupar posições contíguas.", "Liberar um nó antes de salvar/religar seu sucessor rompe o percurso."],
    representations: ["diagrama nó-seta", "endereços simbólicos", "rastreamento de ponteiros", "código C"],
    constraints: ["Usar a declaração curricular typedef struct no { char info; struct no *prox; } no;"],
    sourceRefs: ["Ebook Estrutura de Dados · listas simplesmente encadeadas"]
  };
})();

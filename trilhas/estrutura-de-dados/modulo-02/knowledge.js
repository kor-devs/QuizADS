/* QuizADS · Base curricular M02 · Lista Sequencial */
(function () {
  "use strict";
  window.QUIZADS_KNOWLEDGE = {
    schemaVersion: 1,
    trackId: "estrutura-de-dados",
    moduleId: "m02",
    concepts: ["lista sequencial", "capacidade", "quantidade", "índice", "armazenamento contíguo"],
    definitions: [
      { term: "lista sequencial", meaning: "Coleção armazenada em posições contíguas de um vetor." },
      { term: "último", meaning: "Índice da última posição ocupada; vale -1 quando a lista está vazia." }
    ],
    rules: ["A inserção só ocorre quando ainda existe capacidade.", "Na remoção adotada pelo ebook, o último item ocupa a posição removida e a ordem não é preservada."],
    terminology: ["vetor", "índice", "capacidade", "quantidade", "último", "remoção por substituição"],
    invariants: ["Lista vazia: último = -1.", "Com capacidade N, os índices válidos vão de 0 a N-1."],
    operations: ["criar", "inserir", "buscar", "remover", "listar"],
    codeExamples: ["lista->dados[++lista->ultimo] = valor;", "lista->dados[pos] = lista->dados[lista->ultimo--];"],
    misconceptions: ["A remoção deste módulo não desloca todos os elementos.", "Índice e quantidade não são a mesma medida."],
    representations: ["vetor indexado", "tabela índice-valor", "estado antes/depois", "código C"],
    constraints: ["Preservar a convenção curricular: a remoção substitui pelo último item."],
    sourceRefs: ["Ebook Estrutura de Dados · listas lineares e implementação sequencial"]
  };
})();

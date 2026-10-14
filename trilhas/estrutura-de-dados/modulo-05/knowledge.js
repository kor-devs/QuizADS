/* QuizADS · Base curricular M05 · Pilha e Fila */
(function () {
  "use strict";
  window.QUIZADS_KNOWLEDGE = {
    schemaVersion: 1,
    trackId: "estrutura-de-dados",
    moduleId: "m05",
    concepts: ["pilha", "fila", "LIFO", "FIFO", "topo", "início e fim", "implementação sequencial e encadeada"],
    definitions: [
      { term: "pilha", meaning: "TAD em que inserção e remoção ocorrem no topo, segundo LIFO." },
      { term: "fila", meaning: "TAD em que a inserção ocorre no fim e a remoção no início, segundo FIFO." },
      { term: "LIFO", meaning: "O último item inserido é o primeiro removido." },
      { term: "FIFO", meaning: "O primeiro item inserido é o primeiro removido." }
    ],
    rules: ["Push empilha no topo e pop desempilha do topo.", "Enqueue insere no fim e dequeue remove do início.", "Ao retirar o último nó de uma fila encadeada, início e fim tornam-se NULL."],
    terminology: ["push", "pop", "topo", "enqueue", "dequeue", "início", "fim", "underflow", "overflow"],
    invariants: ["Pilha sequencial vazia: topo = -1.", "Fila encadeada vazia: inicio = NULL e fim = NULL.", "A ordem de saída da pilha é inversa à de entrada; na fila é a mesma."],
    operations: ["criar pilha", "empilhar", "desempilhar", "criar fila", "enfileirar", "desenfileirar", "imprimir", "liberar"],
    codeExamples: [
      "typedef struct no { float info; struct no *prox; } No;",
      "void push(Pilha *p, float valor); float pop(Pilha *p);",
      "void enqueue(Fila *f, float valor); float dequeue(Fila *f);"
    ],
    misconceptions: ["Pilha e fila não diferem apenas pelo nome das operações, mas pela extremidade removida.", "Em fila encadeada, esquecer de zerar fim ao remover o último nó deixa estado inconsistente."],
    representations: ["pilha vertical", "fila horizontal", "sequência de operações", "ponteiros início-fim", "código C"],
    constraints: ["Implementação sequencial do ebook apresenta capacidade MAX 10 e topo = -1.", "O material curricular apresenta operações completas nas versões encadeadas; não inventar operações sequenciais ausentes como se fossem transcrição do ebook."],
    sourceRefs: ["Ebook Estrutura de Dados · p. 28-35: pilhas", "Ebook Estrutura de Dados · p. 38-44: filas"]
  };
})();

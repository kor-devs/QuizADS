/* QuizADS · Base curricular M04 · Variações de Lista */
(function () {
  "use strict";
  window.QUIZADS_KNOWLEDGE = {
    schemaVersion: 1,
    trackId: "estrutura-de-dados",
    moduleId: "m04",
    concepts: ["lista circular", "lista duplamente encadeada", "sentido de percurso", "fechamento do ciclo"],
    definitions: [
      { term: "lista circular", meaning: "Lista em que a ligação final retorna ao início em vez de terminar em NULL." },
      { term: "lista dupla", meaning: "Lista cujos nós mantêm ligações para o próximo e para o anterior." }
    ],
    rules: ["Em lista circular, a parada do percurso depende de reencontrar o início.", "Na lista dupla, inserção e remoção podem exigir atualização das duas direções."],
    terminology: ["circular", "dupla", "anterior", "próximo", "início", "fim", "ciclo"],
    invariants: ["Circular não vazia: o sucessor do último alcança o primeiro.", "Em ligações duplas consistentes, se A.prox = B então B.ant = A."],
    operations: ["percorrer ciclo", "navegar nos dois sentidos", "inserir", "remover", "comparar representações"],
    codeExamples: ["ultimo->prox = inicio;", "novo->ant = atual; novo->prox = atual->prox;"],
    misconceptions: ["Lista circular não usa NULL como condição normal de fim de percurso.", "Lista dupla não elimina a necessidade de atualizar os vizinhos."],
    representations: ["ciclo com setas", "nós com duas setas", "tabela de ligações", "código C"],
    constraints: ["Explicitar a condição de parada ao percorrer estruturas circulares."],
    sourceRefs: ["Ebook Estrutura de Dados · listas circulares e duplamente encadeadas"]
  };
})();

/* =========================================================
   QuizADS · M03 · Learning Data V1
   Lista Encadeada — competências, recuperação e banco variável.
   ========================================================= */
(function () {
  "use strict";

  function shuffleQuestion(question) {
    const options = question.options.map((label, index) => ({ label, isCorrect: index === question.correctIndex }));
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...question, options: options.map((item) => item.label), correctIndex: options.findIndex((item) => item.isCorrect) };
  }

  function q(id, level, generator) {
    return { id, level, generate() { return shuffleQuestion({ id, level, ...generator() }); } };
  }
  function int(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function labels(count) {
    const pool = ["A","B","C","D","E","F","G","H","J","K"];
    const copy = pool.slice();
    const out = [];
    while (out.length < count) out.push(copy.splice(int(0, copy.length - 1), 1)[0]);
    return out;
  }
  function address() { return 1000 + int(0, 60) * 10; }

  const definition = {
    trackId: "estrutura-de-dados",
    moduleId: "m03",
    title: "Módulo 03 · Lista Encadeada",
    blockSize: 3,
    competencies: [
      { id: "node-links", name: "Nó, info, prox, inicio e NULL", shortName: "Nós e ligações", critical: true, initialLevel: 60 },
      { id: "allocation-insertion", name: "malloc e inserção no início", shortName: "Alocação e inserção", critical: true, initialLevel: 60 },
      { id: "traversal", name: "Percurso e busca com aux", shortName: "Percurso e busca", critical: true, initialLevel: 60 },
      { id: "removal", name: "Remoção com ant e aux", shortName: "Remoção", critical: true, initialLevel: 60 },
      { id: "memory", name: "Liberação de memória", shortName: "Memória e free", critical: true, initialLevel: 60 }
    ]
  };

  const ui = {
    moduleNumber: 3,
    moduleName: "Lista Encadeada",
    labPanel: 6,
    checkpointPanel: 7,
    bossIntroPanel: 8,
    bossPanel: 9,
    essayPanel: 10,
    completePanel: 11,
    missionKeys: ["one", "two", "three", "four"],
    panelProgress: [8,18,30,42,54,64,72,78,82,90,97,100],
    checkpoint: { count: 9, pass: 8 },
    boss: { count: 14, pass: 12 },
    outline: [
      { number: 1, panel: 0, name: "Modelo mental", note: "nós e endereços" },
      { number: 2, panel: 1, name: "O nó", note: "info, prox e NULL" },
      { number: 3, panel: 2, name: "Memória dinâmica", note: "malloc e inserção" },
      { number: 4, panel: 3, name: "Percurso", note: "aux e busca" },
      { number: 5, panel: 4, name: "Remoção", note: "ant + aux" },
      { number: 6, panel: 5, name: "Liberação", note: "free e próximo nó" },
      { number: 7, panel: 6, name: "Laboratório", note: "manipule as ligações" },
      { number: 8, panel: 7, name: "Checkpoint", note: "consulta permitida" },
      { number: 9, panel: 8, name: "Boss", note: "sem consulta" },
      { number: 10, panel: 10, name: "Pergunta-chave", note: "explicação livre" }
    ]
  };

  const lessons = {
    "node-links": {
      20:{title:"DESBRAVADOR · Veja uma corrente de nós",body:"<p>Cada nó guarda um dado em info e uma referência em prox. O último nó usa NULL porque não existe próximo nó.</p>"},
      40:{title:"APRENDIZ · Separe dado de ligação",body:"<p>info guarda o conteúdo. prox guarda o endereço do próximo nó. inicio/lista guarda a referência para o primeiro nó.</p>"},
      60:{title:"PRATICANTE · A sequência vem das referências",body:"<p>Uma lista encadeada não depende de posições de vetor. A ordem real é definida pelos endereços armazenados em prox.</p>"},
      80:{title:"COMPETENTE · Leia a topologia",body:"<p>Se um prox muda, o caminho muda. Acompanhe quem aponta para quem antes e depois de cada instrução.</p>"},
      100:{title:"AVANÇADO · Raciocine por estados de referência",body:"<p>Trate inicio e cada campo prox como referências concretas. O desenho da lista é apenas a representação dessas relações.</p>"}
    },
    "allocation-insertion": {
      20:{title:"DESBRAVADOR · Primeiro crie o nó",body:"<p>malloc reserva espaço para um novo nó. Depois gravamos info e conectamos esse nó à lista.</p>"},
      40:{title:"APRENDIZ · Novo aponta para o antigo início",body:"<p>novo->prox = lista faz o novo nó apontar para quem era o primeiro. Depois lista = novo muda o início.</p>"},
      60:{title:"PRATICANTE · Inserção no início",body:"<p>A sequência é: alocar, preencher info, ligar prox ao início antigo e atualizar lista para o novo nó.</p>"},
      80:{title:"COMPETENTE · Preveja a estrutura",body:"<p>Cada inserção no início empurra logicamente a lista antiga para depois do novo nó. Inserir D, C, B, A produz A → B → C → D.</p>"},
      100:{title:"AVANÇADO · Preserve as referências",body:"<p>A ordem das atribuições importa: primeiro guarde o início antigo em novo->prox; só depois mova lista para novo.</p>"}
    },
    traversal: {
      20:{title:"DESBRAVADOR · aux caminha pelos nós",body:"<p>aux começa no primeiro nó e avança usando aux = aux->prox até encontrar o valor ou chegar a NULL.</p>"},
      40:{title:"APRENDIZ · Busque sem alterar a lista",body:"<p>O ponteiro aux é temporário. Mover aux não muda o ponteiro de início da lista.</p>"},
      60:{title:"PRATICANTE · Leia cada avanço",body:"<p>aux = aux->prox substitui o endereço atual pelo endereço do próximo nó.</p>"},
      80:{title:"COMPETENTE · Preveja o percurso",body:"<p>Registre a sequência de nós visitados e pare quando o dado for encontrado ou aux se tornar NULL.</p>"},
      100:{title:"AVANÇADO · Diferencie observação e mutação",body:"<p>Uma busca apenas percorre referências; ela não deve reescrever prox nem alterar o início da estrutura.</p>"}
    },
    removal: {
      20:{title:"DESBRAVADOR · ant fica atrás de aux",body:"<p>aux observa o nó atual. ant guarda o nó anterior. Essa dupla permite reconectar a lista ao remover um nó.</p>"},
      40:{title:"APRENDIZ · Remover o primeiro é diferente",body:"<p>Se ant == NULL quando encontramos o valor, estamos no primeiro nó e o início deve receber aux->prox.</p>"},
      60:{title:"PRATICANTE · Remover no meio",body:"<p>Para retirar aux do meio, use ant->prox = aux->prox e depois libere aux.</p>"},
      80:{title:"COMPETENTE · Refaça a ligação antes de liberar",body:"<p>Primeiro garanta que o nó anterior conhece o sucessor do nó removido. Só depois free(aux).</p>"},
      100:{title:"AVANÇADO · Pense na conectividade",body:"<p>Uma remoção correta preserva o caminho entre os nós restantes e atualiza o início quando o nó removido é o primeiro.</p>"}
    },
    memory: {
      20:{title:"DESBRAVADOR · free libera o nó",body:"<p>Depois de free(aux), aquele nó não deve mais ser usado. Precisamos guardar antes qualquer referência necessária para continuar.</p>"},
      40:{title:"APRENDIZ · Salve o próximo antes",body:"<p>temp = aux->prox guarda o endereço seguinte; depois free(aux); então aux = temp permite continuar.</p>"},
      60:{title:"PRATICANTE · Ordem segura de liberação",body:"<p>Salvar próximo → liberar atual → avançar para o próximo. Essa ordem evita depender de memória já liberada.</p>"},
      80:{title:"COMPETENTE · Evite referência inválida",body:"<p>Ler aux->prox depois de free(aux) é conceitualmente inseguro porque o nó já foi liberado.</p>"},
      100:{title:"AVANÇADO · Desmonte a lista sem perder o caminho",body:"<p>A liberação completa precisa preservar temporariamente o endereço do próximo nó em cada iteração até chegar a NULL.</p>"}
    }
  };

  const questions = {
    "node-links": [
      q("m03-node-20",20,()=>{const [a]=labels(1);return{prompt:`No nó ${a} de uma lista simples, qual campo guarda o dado?`,options:["info","prox","NULL","inicio"],correctIndex:0,hint:"O nome lembra informação.",explanation:`info é o campo usado para armazenar o dado do nó ${a}.`};}),
      q("m03-node-40",40,()=>{const [a,b,c]=labels(3);return{prompt:`Na lista ${a} → ${b} → ${c} → NULL, qual nó possui prox = NULL?`,options:[c,b,a,"Todos"],correctIndex:0,hint:"NULL marca ausência de próximo nó.",explanation:`${c} é o último nó e não referencia outro.`};}),
      q("m03-node-60",60,()=>{const [a,b]=labels(2);return{prompt:`Na cadeia ${a} → ${b} → NULL, o que inicio/lista deve guardar?`,options:[`A referência para ${a}, o primeiro nó`,`A referência obrigatória para ${b}, o último nó`,`O índice numérico de ${a}`,"Sempre o valor zero"],correctIndex:0,hint:"Sem essa referência, não sabemos onde a cadeia começa.",explanation:`O ponteiro de início referencia ${a}, o primeiro nó da lista.`};}),
      q("m03-node-80",80,()=>{const [a,b,c]=labels(3);return{prompt:`Ligações: ${a}.prox = ${c}, ${c}.prox = ${b}, ${b}.prox = NULL. Partindo de ${a}, qual sequência é real?`,options:[`${a} → ${c} → ${b} → NULL`,`${a} → ${b} → ${c} → NULL`,`${b} → ${a} → ${c} → NULL`,`${c} → ${a} → ${b} → NULL`],correctIndex:0,hint:"Siga os campos prox literalmente.",explanation:`As referências levam de ${a} para ${c}, depois para ${b}.`};}),
      q("m03-node-100",100,()=>{const [a,b,c,d]=labels(4);return{prompt:`inicio aponta para ${a}; ${a}.prox=${b}; ${b}.prox=${d}; ${d}.prox=${c}; ${c}.prox=NULL. Qual percurso ocorre?`,options:[`${a} → ${b} → ${d} → ${c} → NULL`,`${a} → ${b} → ${c} → ${d} → NULL`,`${d} → ${c} → ${b} → ${a} → NULL`,`${a} → ${d} → ${b} → ${c} → NULL`],correctIndex:0,hint:"A ordem visual dos nomes não importa; siga as referências.",explanation:"O percurso é determinado exclusivamente pelos endereços armazenados em prox."};})
    ],
    "allocation-insertion": [
      q("m03-alloc-20",20,()=>{const [a]=labels(1);return{prompt:`Antes de inserir o novo nó ${a}, qual é o papel de malloc?`,options:["Reservar memória para um novo nó","Ordenar a lista","Buscar um valor","Liberar a lista"],correctIndex:0,hint:"O nó precisa existir na memória antes de receber dados.",explanation:`malloc reserva espaço para o novo nó ${a}.`};}),
      q("m03-alloc-40",40,()=>{const [a,b]=labels(2);return{prompt:`lista aponta para ${a} e novo aponta para ${b}. Após novo->prox = lista, para onde ${b}.prox aponta?`,options:[a,b,"NULL obrigatoriamente","Para um índice"],correctIndex:0,hint:"O lado direito da atribuição é a referência atualmente guardada em lista.",explanation:`A referência de ${a} é copiada para o campo prox do novo nó ${b}.`};}),
      q("m03-alloc-60",60,()=>{const [a,b,c,d]=labels(4);return{prompt:`Inserindo no início na ordem ${d}, ${c}, ${b}, ${a}, qual lista resulta?`,options:[`${a} → ${b} → ${c} → ${d}`,`${d} → ${c} → ${b} → ${a}`,`${a} → ${d} → ${c} → ${b}`,`${b} → ${a} → ${d} → ${c}`],correctIndex:0,hint:"Cada novo nó se torna o primeiro.",explanation:`A última inserção (${a}) fica no início, produzindo ${a} → ${b} → ${c} → ${d}.`};}),
      q("m03-alloc-80",80,()=>{const a=address(),b=a+130;return{prompt:`lista guarda ${a}. novo guarda ${b}. Após novo->prox = lista; lista = novo;, quais referências ficam corretas?`,options:[`lista = ${b} e novo->prox = ${a}`,`lista = ${a} e novo->prox = ${b}`,`lista = NULL e novo->prox = ${b}`,`lista = ${b} e novo->prox = NULL`],correctIndex:0,hint:"Primeiro preserve o início antigo em prox; depois mova o início.",explanation:`O novo nó em ${b} passa a apontar para ${a}, e lista passa a apontar para ${b}.`};}),
      q("m03-alloc-100",100,()=>{const [a,b]=labels(2);return{prompt:`Para inserir ${b} antes de ${a}, por que executar novo->prox = lista; lista = novo; nessa ordem?`,options:["Porque preserva a referência para o antigo primeiro nó antes de mudar o início","Porque malloc só funciona depois de lista = novo","Porque NULL ordena os nós","Porque info depende do índice do vetor"],correctIndex:0,hint:"Pergunte o que seria perdido se o início mudasse cedo demais.",explanation:`Guardar primeiro a referência de ${a} em novo->prox preserva a ligação antes de ${b} virar o início.`};})
    ],
    traversal: [
      q("m03-trav-20",20,()=>{const [a,b]=labels(2);return{prompt:`Para buscar ${b} em ${a} → ${b} → NULL, qual variável costuma percorrer os nós?`,options:["aux","TAM","ultimo","printf"],correctIndex:0,hint:"Ela é um ponteiro auxiliar.",explanation:"aux começa no primeiro nó e avança pelas referências prox."};}),
      q("m03-trav-40",40,()=>{const [a,b,c]=labels(3);return{prompt:`aux começa em ${a} na lista ${a} → ${b} → ${c} → NULL. Após um avanço aux = aux->prox, onde está aux?`,options:[b,a,c,"NULL"],correctIndex:0,hint:"Um avanço segue exatamente uma ligação prox.",explanation:`O prox de ${a} leva a ${b}.`};}),
      q("m03-trav-60",60,()=>{const [a,b,c,d]=labels(4);return{prompt:`Buscando ${c} em ${a} → ${b} → ${c} → ${d} → NULL, quais nós são visitados até encontrar?`,options:[`${a} → ${b} → ${c}`,`${c} apenas`,`${a} → ${d}`,`${a} → ${b} → ${c} → ${d}`],correctIndex:0,hint:"Pare quando o valor procurado for encontrado.",explanation:`aux visita ${a}, depois ${b}, e encontra ${c}.`};}),
      q("m03-trav-80",80,()=>{const [a,b,c]=labels(3);return{prompt:`Em ${a} → ${b} → ${c} → NULL, aux recebe aux->prox duas vezes começando em ${a}. Onde termina?`,options:[c,b,a,"NULL"],correctIndex:0,hint:"Avance uma ligação por execução.",explanation:`Primeiro vai a ${b}; depois a ${c}.`};}),
      q("m03-trav-100",100,()=>{const [a,b,c]=labels(3);return{prompt:`Após buscar ${c} em ${a} → ${b} → ${c} → NULL usando apenas aux, qual propriedade deve permanecer verdadeira?`,options:["A estrutura e o ponteiro de início permanecem inalterados","Todos os campos prox viram NULL","O primeiro nó é removido","malloc é executado em cada passo"],correctIndex:0,hint:"Buscar observa; não deveria mutar a estrutura.",explanation:`Mover aux até ${c} não reescreve as ligações nem o início da lista.`};})
    ],
    removal: [
      q("m03-rem-20",20,()=>{const [a,b,c]=labels(3);return{prompt:`Ao procurar ${b} para remoção em ${a} → ${b} → ${c}, o que ant representa normalmente?`,options:["O nó anterior a aux","O nó posterior a aux","Sempre o último nó","A capacidade da lista"],correctIndex:0,hint:"ant = anterior.",explanation:`Quando aux chega a ${b}, ant acompanha ${a}, o nó anterior.`};}),
      q("m03-rem-40",40,()=>{const [a,b]=labels(2);return{prompt:`Ao encontrar ${a} para remoção no início de ${a} → ${b} → NULL, ant == NULL indica o quê?`,options:["O nó encontrado é o primeiro","O valor não existe","O nó encontrado é sempre o último","A memória acabou"],correctIndex:0,hint:"Nenhum nó anterior foi registrado.",explanation:`Como ${a} é o primeiro nó, não existe nó anterior e ant permanece NULL.`};}),
      q("m03-rem-60",60,()=>{const [a,b,c]=labels(3);return{prompt:`Na lista ${a} → ${b} → ${c}, removendo ${b}, qual ligação precisa ser criada?`,options:[`${a} → ${c}`,`${c} → ${a}`,`${b} → ${a}`,`${a} → NULL`],correctIndex:0,hint:"O nó anterior deve conhecer o sucessor do removido.",explanation:`ant->prox recebe aux->prox, ligando ${a} diretamente a ${c}.`};}),
      q("m03-rem-80",80,()=>{const [a,b,c,d]=labels(4);return{prompt:`Estado ${a} → ${b} → ${c} → ${d} → NULL. Remova ${c}. Qual resultado?`,options:[`${a} → ${b} → ${d} → NULL`,`${a} → ${c} → ${d} → NULL`,`${b} → ${c} → ${d} → NULL`,`${a} → ${b} → ${c} → NULL`],correctIndex:0,hint:"O anterior de C deve apontar para o sucessor de C.",explanation:`${b}.prox passa a referenciar ${d}; ${c} é liberado.`};}),
      q("m03-rem-100",100,()=>{const [a,b,c,d]=labels(4);return{prompt:`Após remover o primeiro nó de ${a} → ${b} → ${c} → ${d} → NULL, qual mudança é essencial?`,options:[`inicio passa a apontar para ${b}`,`${b}.prox passa a apontar para ${a}`,`inicio continua em ${a}`,`${d}.prox passa a ${a}`],correctIndex:0,hint:"Sem nó anterior, a própria referência de início precisa avançar.",explanation:`O início recebe aux->prox e passa a apontar para ${b}.`};})
    ],
    memory: [
      q("m03-mem-20",20,()=>{const [a]=labels(1);return{prompt:`Se aux aponta para o nó ${a}, o que free(aux) faz?`,options:["Libera a memória do nó apontado por aux","Cria um novo nó","Busca um valor","Ordena a lista"],correctIndex:0,hint:"free trabalha com memória já alocada.",explanation:`free libera o bloco de memória previamente alocado para o nó ${a}.`};}),
      q("m03-mem-40",40,()=>{const [a,b]=labels(2);return{prompt:`Ao liberar ${a} em ${a} → ${b} → NULL, por que guardar aux->prox em temp antes de free(aux)?`,options:["Para preservar o endereço do próximo nó","Para aumentar TAM","Para mudar info automaticamente","Para ordenar os nós"],correctIndex:0,hint:"Depois de liberar o nó, não dependa mais de seus campos.",explanation:`temp preserva a referência de ${b}, necessária para continuar após liberar ${a}.`};}),
      q("m03-mem-60",60,()=>{const [a,b,c]=labels(3);return{prompt:`Ao liberar ${a} → ${b} → ${c} → NULL nó a nó, qual ordem é segura em cada passo?`,options:["salvar próximo → free atual → avançar","free atual → ler prox → avançar","avançar → apagar inicio → malloc","free todos → procurar próximo"],correctIndex:0,hint:"Preserve a próxima referência antes de liberar.",explanation:"O próximo endereço deve ser salvo enquanto o nó atual ainda é válido."};}),
      q("m03-mem-80",80,()=>{const [a,b]=labels(2);return{prompt:`Depois de liberar ${a} em ${a} → ${b} → NULL com free(aux), qual operação é conceitualmente insegura?`,options:["Ler aux->prox","Usar um temp salvo antes","Comparar temp com NULL","Continuar pelo endereço salvo"],correctIndex:0,hint:"aux aponta para memória já liberada.",explanation:`Após liberar ${a}, não devemos depender do conteúdo daquele nó.`};}),
      q("m03-mem-100",100,()=>{const [a,b,c]=labels(3);return{prompt:`Para liberar ${a} → ${b} → ${c} → NULL sem perder o caminho, qual informação deve ser preservada a cada iteração?`,options:["A referência para o próximo nó","O índice do vetor","O valor de TAM","A posição -1"],correctIndex:0,hint:"Você precisa saber onde continuar depois de liberar o atual.",explanation:"Salvar a referência ao próximo nó permite liberar o atual e ainda prosseguir até NULL."};})
    ]
  };

  window.QUIZADS_MODULE_LEARNING = { definition, ui, lessons, questions };
})();

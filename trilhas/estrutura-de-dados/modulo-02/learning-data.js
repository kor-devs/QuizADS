/* =========================================================
   QuizADS · M02 · Learning Data V1
   Lista Sequencial — competências, recuperação e banco variável.
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
    return {
      id,
      level,
      generate() {
        return shuffleQuestion({ id, level, ...generator() });
      }
    };
  }

  function int(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function letters(count) {
    const pool = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
    const copy = pool.slice();
    const out = [];
    while (out.length < count) out.push(copy.splice(int(0, copy.length - 1), 1)[0]);
    return out;
  }

  const definition = {
    trackId: "estrutura-de-dados",
    moduleId: "m02",
    title: "Módulo 02 · Lista Sequencial",
    blockSize: 3,
    competencies: [
      { id: "array-model", name: "Vetor, índice e capacidade", shortName: "Vetor e índices", critical: true, initialLevel: 60 },
      { id: "state-last", name: "Estado da lista e ultimo", shortName: "Estado e ultimo", critical: true, initialLevel: 60 },
      { id: "insertion", name: "Inserção", shortName: "Inserção", critical: true, initialLevel: 60 },
      { id: "search", name: "Busca e percurso", shortName: "Busca", critical: false, initialLevel: 60 },
      { id: "removal", name: "Remoção e efeito na ordem", shortName: "Remoção", critical: true, initialLevel: 60 }
    ]
  };

  const ui = {
    moduleNumber: 2,
    moduleName: "Lista Sequencial",
    labPanel: 4,
    checkpointPanel: 5,
    bossIntroPanel: 6,
    bossPanel: 7,
    essayPanel: 8,
    completePanel: 9,
    missionKeys: ["one", "two", "three"],
    panelProgress: [10,22,36,50,63,72,78,88,96,100],
    checkpoint: { count: 8, pass: 7 },
    boss: { count: 12, pass: 10 },
    outline: [
      { number: 1, panel: 0, name: "Modelo sequencial", note: "vetor, índice e TAM" },
      { number: 2, panel: 1, name: "Estado da lista", note: "ultimo, vazia e cheia" },
      { number: 3, panel: 2, name: "Inserção e busca", note: "operações básicas" },
      { number: 4, panel: 3, name: "Remoção", note: "último ocupa a vaga" },
      { number: 5, panel: 4, name: "Laboratório", note: "inserir, buscar e remover" },
      { number: 6, panel: 5, name: "Checkpoint", note: "consulta permitida" },
      { number: 7, panel: 6, name: "Boss", note: "sem consulta" },
      { number: 8, panel: 8, name: "Pergunta-chave", note: "explicação livre" }
    ]
  };

  const lessons = {
    "array-model": {
      20: { title: "DESBRAVADOR · Primeiro enxergue as posições", body: "<p>Uma lista sequencial usa um vetor. Cada casa possui um índice começando em 0. Se TAM = 5, existem cinco casas: 0, 1, 2, 3 e 4.</p>" },
      40: { title: "APRENDIZ · Capacidade não é índice", body: "<p>TAM indica quantas posições existem. O maior índice válido é TAM - 1 porque a contagem começa em zero.</p>" },
      60: { title: "PRATICANTE · Leia vetor, índice e capacidade juntos", body: "<p>Ao analisar a lista, separe capacidade total, posições ocupadas e índice da última posição ocupada.</p>" },
      80: { title: "COMPETENTE · Raciocine pelos limites", body: "<p>Antes de qualquer operação, verifique se o índice pertence ao intervalo válido e se a capacidade ainda comporta novos elementos.</p>" },
      100: { title: "AVANÇADO · Trabalhe com invariantes", body: "<p>Em uma lista sequencial válida, nenhuma operação deve produzir acesso fora de 0..TAM-1. Capacidade e estado precisam permanecer coerentes após cada transformação.</p>" }
    },
    "state-last": {
      20: { title: "DESBRAVADOR · ultimo marca a última casa ocupada", body: "<p>Quando a lista está vazia, ultimo = -1. Depois do primeiro elemento, ultimo = 0.</p>" },
      40: { title: "APRENDIZ · Conte ocupados por ultimo", body: "<p>Se ultimo = 2, as posições 0, 1 e 2 estão ocupadas: três elementos.</p>" },
      60: { title: "PRATICANTE · Vazias e cheias", body: "<p>Vazia: ultimo = -1. Cheia: ultimo = TAM - 1. Essas duas condições delimitam inserções válidas.</p>" },
      80: { title: "COMPETENTE · Acompanhe transições", body: "<p>Cada inserção válida aumenta ultimo em 1; cada remoção válida diminui ultimo em 1. O campo resume o estado ocupado do vetor.</p>" },
      100: { title: "AVANÇADO · Valide o estado após operações", body: "<p>Quando a lista não está vazia, a quantidade de elementos é ultimo + 1. Use essa relação para detectar estados incoerentes.</p>" }
    },
    insertion: {
      20: { title: "DESBRAVADOR · Inserir ocupa a próxima casa", body: "<p>Com a lista vazia, a primeira inserção faz ultimo passar de -1 para 0 e grava o valor na posição 0.</p>" },
      40: { title: "APRENDIZ · Primeiro avance, depois grave", body: "<p>No modelo estudado, a inserção aumenta ultimo e usa esse novo índice para armazenar o elemento.</p>" },
      60: { title: "PRATICANTE · Traduza ultimo++", body: "<p>ultimo++ significa que uma nova posição passa a ser considerada ocupada; em seguida o dado é gravado nessa posição.</p>" },
      80: { title: "COMPETENTE · Proteja a capacidade", body: "<p>A inserção só é válida se ultimo ainda não estiver em TAM - 1. Caso contrário, não existe próxima posição disponível.</p>" },
      100: { title: "AVANÇADO · Preveja o estado completo", body: "<p>Não avalie apenas o valor inserido: antecipe também novo ultimo, quantidade ocupada e condição vazia/em uso/cheia.</p>" }
    },
    search: {
      20: { title: "DESBRAVADOR · Buscar posição é olhar a casa certa", body: "<p>Em [A, B, C], a posição 1 contém B porque os índices são 0, 1 e 2.</p>" },
      40: { title: "APRENDIZ · Só busque posições ocupadas", body: "<p>Uma posição é válida para busca quando está entre 0 e ultimo.</p>" },
      60: { title: "PRATICANTE · Percurso até ultimo", body: "<p>Para imprimir ou percorrer a lista, avance de 0 até ultimo inclusive.</p>" },
      80: { title: "COMPETENTE · Evite o erro de uma posição a mais", body: "<p>O limite é i &lt;= ultimo. Usar TAM como limite pode ler casas ainda não ocupadas.</p>" },
      100: { title: "AVANÇADO · Distinga capacidade de domínio válido", body: "<p>O vetor pode possuir espaço físico até TAM - 1, mas uma busca lógica só deve considerar posições efetivamente ocupadas até ultimo.</p>" }
    },
    removal: {
      20: { title: "DESBRAVADOR · A vaga recebe o último valor", body: "<p>Na remoção estudada, o último elemento da lista é copiado para a posição removida. Depois ultimo diminui.</p>" },
      40: { title: "APRENDIZ · A ordem pode mudar", body: "<p>[A, B, C] removendo posição 0 vira [C, B]. C ocupou a vaga de A.</p>" },
      60: { title: "PRATICANTE · Remoção sem deslocamento", body: "<p>Em vez de mover todos os elementos seguintes, a função substitui o removido pelo último valor e reduz ultimo.</p>" },
      80: { title: "COMPETENTE · Simule antes e depois", body: "<p>Registre vetor, posição removida, último valor e novo ultimo. Isso evita imaginar um deslocamento que o código não faz.</p>" },
      100: { title: "AVANÇADO · Entenda o contrato da operação", body: "<p>Essa remoção é eficiente para preencher a lacuna, mas não promete preservar a ordem. Essa propriedade faz parte do comportamento que deve ser reconhecido.</p>" }
    }
  };

  const questions = {
    "array-model": [
      q("m02-array-20", 20, () => { const tam = int(4,8); return { prompt:`Se TAM = ${tam}, quantas posições existem no vetor?`, options:[String(tam), String(tam-1), String(tam+1), "1"], correctIndex:0, hint:"TAM representa a capacidade total.", explanation:`TAM = ${tam} significa ${tam} posições no vetor.` }; }),
      q("m02-array-40", 40, () => { const tam = int(4,8); return { prompt:`Com TAM = ${tam}, qual é o maior índice válido?`, options:[String(tam-1), String(tam), String(tam+1), "-1"], correctIndex:0, hint:"Os índices começam em zero.", explanation:`Os índices válidos vão de 0 até ${tam-1}.` }; }),
      q("m02-array-60", 60, () => { const tam = int(5,9); const used = int(1,tam-1); return { prompt:`Um vetor tem TAM = ${tam} e ${used} posições ocupadas. Qual afirmação é correta?`, options:[`A capacidade continua sendo ${tam}`, `O maior índice físico passou a ser ${used}`, `TAM agora vale ${used}`, "O vetor necessariamente está cheio"], correctIndex:0, hint:"Quantidade ocupada não altera a capacidade declarada.", explanation:`TAM continua representando capacidade ${tam}, independentemente de haver ${used} posições ocupadas.` }; }),
      q("m02-array-80", 80, () => { const tam=int(5,8); const idx=int(0,tam-1); return { prompt:`TAM = ${tam}. O índice ${idx} pertence ao vetor?`, options:["Sim, está dentro de 0..TAM-1", "Não, índices começam em 1", "Só se ultimo for -1", "Só se a lista estiver cheia"], correctIndex:0, hint:"Compare o índice com 0 e TAM - 1.", explanation:`${idx} está dentro do intervalo físico 0..${tam-1}.` }; }),
      q("m02-array-100", 100, () => { const tam=int(5,9); return { prompt:`Qual estado viola o limite físico de um vetor com TAM = ${tam}?`, options:[`Acessar índice ${tam}`, `Acessar índice ${tam-1}`, "Manter ultimo = -1 quando vazio", "Usar índice 0"], correctIndex:0, hint:"O último índice físico é TAM - 1.", explanation:`Índice ${tam} está fora de 0..${tam-1}.` }; })
    ],
    "state-last": [
      q("m02-state-20",20,()=>({prompt:"O que significa ultimo = -1?",options:["A lista está vazia","A lista está cheia","Existe um elemento em -1","O vetor foi apagado"],correctIndex:0,hint:"Nenhum índice válido está ocupado.",explanation:"-1 é o marcador usado para lista vazia."})),
      q("m02-state-40",40,()=>{const u=int(0,4);return{prompt:`Se ultimo = ${u}, quantos elementos estão ocupados?`,options:[String(u+1),String(u),String(u+2),"0"],correctIndex:0,hint:"Conte do índice 0 até ultimo.",explanation:`As posições 0..${u} totalizam ${u+1} elementos.`};}),
      q("m02-state-60",60,()=>{const tam=int(4,8);return{prompt:`Com TAM = ${tam}, quando a lista está cheia?`,options:[`ultimo = ${tam-1}`,`ultimo = ${tam}`,"ultimo = -1","ultimo = 0"],correctIndex:0,hint:"Cheia significa última posição física ocupada.",explanation:`A última posição válida é TAM - 1 = ${tam-1}.`};}),
      q("m02-state-80",80,()=>{const start=int(0,2);return{prompt:`ultimo começa em ${start}. Após duas inserções válidas, qual valor terá?`,options:[String(start+2),String(start+1),String(start-1),"-1"],correctIndex:0,hint:"Cada inserção válida incrementa uma vez.",explanation:`Dois incrementos levam ${start} a ${start+2}.`};}),
      q("m02-state-100",100,()=>{const u=int(1,5);return{prompt:`Qual relação é coerente quando ultimo = ${u} e a lista não está vazia?`,options:[`quantidade = ${u+1}`,`quantidade = ${u}`,`quantidade = ${u+2}`,"quantidade = -1"],correctIndex:0,hint:"A posição 0 também conta.",explanation:`Com índices 0..${u}, existem ${u+1} elementos.`};})
    ],
    insertion: [
      q("m02-insert-20",20,()=>({prompt:"A lista está vazia (ultimo = -1). Após a primeira inserção válida, ultimo passa a:",options:["0","1","-1","TAM"],correctIndex:0,hint:"A primeira posição do vetor é zero.",explanation:"A primeira inserção ocupa a posição 0."})),
      q("m02-insert-40",40,()=>{const [a,b,c]=letters(3);return{prompt:`Inserindo ${a}, depois ${b}, depois ${c} em uma lista vazia, qual prefixo fica ocupado?`,options:[`${a}, ${b}, ${c}`,`${c}, ${b}, ${a}`,`${a}, ${c}, ${b}`,`${b}, ${a}, ${c}`],correctIndex:0,hint:"A inserção sequencial usa a próxima posição livre.",explanation:`Os valores ocupam as posições 0, 1 e 2 na ordem ${a}, ${b}, ${c}.`};}),
      q("m02-insert-60",60,()=>{const u=int(0,3);return{prompt:`Antes da inserção, ultimo = ${u}. O código incrementa ultimo antes de gravar. Em qual índice entra o novo valor?`,options:[String(u+1),String(u),String(u-1),"-1"],correctIndex:0,hint:"Traduza ultimo++.",explanation:`ultimo passa a ${u+1}, e esse é o índice usado para a nova posição.`};}),
      q("m02-insert-80",80,()=>{const tam=int(4,7);return{prompt:`TAM = ${tam} e ultimo = ${tam-1}. O que uma inserção deve fazer?`,options:["Recusar porque a lista está cheia","Gravar no índice TAM","Apagar o primeiro elemento","Definir ultimo = -1"],correctIndex:0,hint:"Não existe posição depois de TAM - 1.",explanation:"A lista já ocupa a última posição válida, então não há espaço para nova inserção."};}),
      q("m02-insert-100",100,()=>{const tam=int(5,8);const u=tam-2;return{prompt:`TAM = ${tam}, ultimo = ${u}. Após uma inserção válida, qual estado completo é correto?`,options:[`ultimo = ${u+1} e a lista fica cheia`,`ultimo = ${u} e a lista fica cheia`,`ultimo = ${tam} e a lista fica cheia`,`ultimo = -1`],correctIndex:0,hint:"A nova posição é exatamente TAM - 1.",explanation:`O incremento leva ultimo a ${tam-1}, preenchendo a última posição válida.`};})
    ],
    search: [
      q("m02-search-20",20,()=>{const [a,b,c]=letters(3);return{prompt:`Na lista [${a}, ${b}, ${c}], o que existe na posição 1?`,options:[b,a,c,"NULL"],correctIndex:0,hint:"Os índices são 0, 1 e 2.",explanation:`A posição 1 contém ${b}.`};}),
      q("m02-search-40",40,()=>{const u=int(1,4);return{prompt:`ultimo = ${u}. Qual posição é inválida para uma busca lógica?`,options:[String(u+1),String(u),"0",String(Math.max(0,u-1))],correctIndex:0,hint:"Busque apenas entre 0 e ultimo.",explanation:`${u+1} está além da última posição ocupada ${u}.`};}),
      q("m02-search-60",60,()=>({prompt:"Para percorrer apenas os elementos ocupados, qual limite combina com o modelo estudado?",options:["i <= ultimo","i <= TAM","i < -1","i == TAM"],correctIndex:0,hint:"O percurso termina na última posição ocupada.",explanation:"O laço deve alcançar ultimo inclusive."})),
      q("m02-search-80",80,()=>{const tam=int(5,8);const u=int(1,tam-2);return{prompt:`TAM = ${tam}, ultimo = ${u}. Por que percorrer até TAM - 1 seria inadequado?`,options:["Porque incluiria posições ainda não ocupadas","Porque apagaria a lista","Porque ultimo sempre vale TAM","Porque índices começam em 1"],correctIndex:0,hint:"Capacidade física pode ser maior que a parte ocupada.",explanation:`Somente 0..${u} pertencem ao estado lógico atual da lista.`};}),
      q("m02-search-100",100,()=>{const tam=int(6,9);const u=int(2,tam-2);return{prompt:`Com TAM = ${tam} e ultimo = ${u}, qual intervalo representa o domínio lógico de busca?`,options:[`0..${u}`,`0..${tam-1}`,`1..${u+1}`,`${u+1}..${tam-1}`],correctIndex:0,hint:"Use ultimo, não a capacidade total.",explanation:`As posições ocupadas vão de 0 até ${u}.`};})
    ],
    removal: [
      q("m02-remove-20",20,()=>{const [a,b,c]=letters(3);return{prompt:`Na lista [${a}, ${b}, ${c}], removendo a posição 0 pelo método estudado, qual valor ocupa a posição 0?`,options:[c,b,a,"NULL"],correctIndex:0,hint:"O último elemento ocupa a vaga removida.",explanation:`${c}, que era o último, é copiado para a posição 0.`};}),
      q("m02-remove-40",40,()=>{const [a,b,c]=letters(3);return{prompt:`[${a}, ${b}, ${c}] removendo posição 0 resulta em:`,options:[`${c}, ${b}`,`${b}, ${c}`,`${a}, ${b}`,`${a}, ${c}`],correctIndex:0,hint:"Não há deslocamento; o último ocupa a vaga.",explanation:`${a} sai, ${c} ocupa a posição 0 e ultimo diminui.`};}),
      q("m02-remove-60",60,()=>{const [a,b,c,d,e]=letters(5);return{prompt:`[${a}, ${b}, ${c}, ${d}, ${e}] removendo posição 1 resulta em:`,options:[`${a}, ${e}, ${c}, ${d}`,`${a}, ${c}, ${d}, ${e}`,`${b}, ${c}, ${d}, ${e}`,`${a}, ${b}, ${c}, ${d}`],correctIndex:0,hint:"Copie o último valor para a posição removida.",explanation:`${b} sai e ${e} ocupa a posição 1; a ordem original não é preservada.`};}),
      q("m02-remove-80",80,()=>{const [a,b,c,d]=letters(4);return{prompt:`Estado inicial [${a}, ${b}, ${c}, ${d}]. Remova posição 1 e depois posição 0. Qual estado final?`,options:[`${c}, ${d}`,`${d}, ${c}`,`${b}, ${c}`,`${a}, ${d}`],correctIndex:0,hint:"Simule uma remoção por vez, sempre usando o último elemento atual.",explanation:`Primeiro fica [${a}, ${d}, ${c}]. Depois ${c} ocupa a posição 0, resultando [${c}, ${d}].`};}),
      q("m02-remove-100",100,()=>({prompt:"Qual propriedade descreve corretamente a remoção estudada?",options:["Preenche a lacuna com o último elemento e pode alterar a ordem","Sempre desloca todos os elementos à esquerda","Preserva obrigatoriamente a ordem","Aumenta ultimo após remover"],correctIndex:0,hint:"Pense no contrato observado no laboratório.",explanation:"A função evita deslocamento em massa usando o último elemento, portanto a ordem pode mudar."}))
    ]
  };

  window.QUIZADS_MODULE_LEARNING = { definition, ui, lessons, questions };
})();

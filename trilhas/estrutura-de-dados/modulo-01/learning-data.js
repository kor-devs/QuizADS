/* =========================================================
   QuizADS · M01 · Dados do piloto adaptativo
   Baseado no conteúdo já ensinado no Módulo 01 atual.
   ========================================================= */

(function () {
  "use strict";

  function shuffleQuestion(question) {
    const options = question.options.map((label, index) => ({
      label,
      isCorrect: index === question.correctIndex
    }));

    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      ...question,
      options: options.map((item) => item.label),
      correctIndex: options.findIndex((item) => item.isCorrect)
    };
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function memoryAddress() {
    return 1000 + Math.floor(Math.random() * 8000);
  }

  function labels(count) {
    const pool = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
    const copy = pool.slice();
    const result = [];
    while (result.length < count && copy.length) {
      result.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return result;
  }

  function q(id, level, generator) {
    return {
      id,
      level,
      generate() {
        return shuffleQuestion({
          id,
          level,
          ...generator()
        });
      }
    };
  }

  const definition = {
    trackId: "estrutura-de-dados",
    moduleId: "m01",
    title: "Módulo 01 · Fundamentos",
    blockSize: 3,
    competencies: [
      {
        id: "structures",
        name: "Estruturas de dados",
        shortName: "Estruturas",
        description: "Relacionar dados, organização e operações.",
        critical: true,
        initialLevel: 60
      },
      {
        id: "tad",
        name: "TAD e abstração",
        shortName: "TAD",
        description: "Entender dados + operações e o papel da abstração.",
        critical: true,
        initialLevel: 60
      },
      {
        id: "pointers",
        name: "Memória e ponteiros",
        shortName: "Ponteiros",
        description: "Interpretar endereço de memória e o que um ponteiro armazena.",
        critical: true,
        initialLevel: 60
      },
      {
        id: "nodes",
        name: "Nós, info, prox e NULL",
        shortName: "Nós",
        description: "Compreender ligações entre nós e o fim de uma lista.",
        critical: true,
        initialLevel: 60
      },
      {
        id: "c-reading",
        name: "Leitura de código em C",
        shortName: "Código C",
        description: "Interpretar struct, ponteiros, * e -> em trechos simples.",
        critical: false,
        initialLevel: 60
      }
    ]
  };

  const lessons = {
    structures: {
      20: {
        title: "DESBRAVADOR · Primeiro organize o problema",
        body: `
          <p>Imagine uma agenda. Existem <strong>dados</strong>, como nome e telefone, e existem <strong>ações</strong>, como adicionar, buscar e remover.</p>
          <p>Uma estrutura de dados organiza essas informações e define como trabalhamos com elas.</p>
          <pre>dados + organização + operações</pre>
        `
      },
      40: {
        title: "APRENDIZ · Dados não bastam sozinhos",
        body: `
          <p>Guardar valores é apenas uma parte do problema. Também precisamos saber como inserir, buscar, alterar ou remover esses valores.</p>
          <p>Pense sempre em duas perguntas: <strong>o que é guardado?</strong> e <strong>o que podemos fazer?</strong></p>
        `
      },
      60: {
        title: "PRATICANTE · Estrutura de dados",
        body: `
          <p>Uma estrutura de dados é uma forma organizada de armazenar dados e definir operações sobre eles.</p>
          <p>O objetivo não é decorar nomes de estruturas, mas compreender como a organização escolhida afeta as operações disponíveis.</p>
        `
      },
      80: {
        title: "COMPETENTE · Organização influencia comportamento",
        body: `
          <p>Duas estruturas podem guardar informações semelhantes e ainda assim oferecer comportamentos diferentes para inserir, buscar ou remover.</p>
          <p>Ao analisar uma estrutura, separe <strong>representação</strong>, <strong>operações</strong> e <strong>efeito dessas operações</strong>.</p>
        `
      },
      100: {
        title: "AVANÇADO · Pense em contrato de comportamento",
        body: `
          <p>Não trate uma estrutura apenas como armazenamento. Pense nela como um contrato: quais estados são válidos, quais operações existem e quais transformações cada operação produz.</p>
          <p>Essa visão prepara a comparação entre listas, pilhas, filas, árvores e hash.</p>
        `
      }
    },

    tad: {
      20: {
        title: "DESBRAVADOR · O que existe e o que fazemos",
        body: `
          <p>Uma conta bancária possui dados, como saldo e titular. Também possui ações, como depositar e consultar saldo.</p>
          <pre>TAD = dados + operações</pre>
          <p>Você pode usar essas operações sem conhecer todos os detalhes internos.</p>
        `
      },
      40: {
        title: "APRENDIZ · TAD em duas partes",
        body: `
          <p>Para reconhecer um TAD, procure duas coisas: <strong>dados</strong> e <strong>operações</strong>.</p>
          <p>A abstração permite usar essas operações sem lidar ao mesmo tempo com toda a implementação interna.</p>
        `
      },
      60: {
        title: "PRATICANTE · Tipo Abstrato de Dados",
        body: `
          <p>TAD significa Tipo Abstrato de Dados. Ele descreve dados e as operações disponibilizadas sobre esses dados.</p>
          <p>A abstração separa o que precisamos saber para usar a estrutura dos detalhes internos de implementação.</p>
        `
      },
      80: {
        title: "COMPETENTE · Interface mental do TAD",
        body: `
          <p>Ao ler um TAD, pense em um conjunto de operações que expõe comportamento sem obrigar o usuário a conhecer cada detalhe interno.</p>
          <p>Isso permite raciocinar sobre o que a estrutura faz antes de estudar como ela faz.</p>
        `
      },
      100: {
        title: "AVANÇADO · Abstração como fronteira",
        body: `
          <p>A abstração cria uma fronteira entre o contrato de uso e a representação interna. Alterar detalhes internos não deveria obrigar quem usa o TAD a reaprender seu propósito.</p>
          <p>Essa separação será útil ao comparar implementações diferentes de uma mesma ideia.</p>
        `
      }
    },

    pointers: {
      20: {
        title: "DESBRAVADOR · Endereço antes de ponteiro",
        body: `
          <p>Pense na memória como locais numerados. Um valor pode estar no endereço <strong>1200</strong>.</p>
          <p>Um ponteiro não precisa guardar uma cópia desse valor. Ele guarda <strong>onde o valor está</strong>.</p>
          <pre>ponteiro → endereço de memória</pre>
        `
      },
      40: {
        title: "APRENDIZ · Valor e endereço são coisas diferentes",
        body: `
          <p>Se o valor A está no endereço 2400, o endereço é a localização. Um ponteiro pode guardar 2400 para chegar até A.</p>
          <p>Isso é diferente de guardar diretamente o próprio A.</p>
        `
      },
      60: {
        title: "PRATICANTE · Memória e ponteiros",
        body: `
          <p>Dados ocupam posições na memória. Essas posições possuem endereços.</p>
          <p>Um ponteiro armazena um endereço de memória e permite chegar ao objeto localizado ali.</p>
        `
      },
      80: {
        title: "COMPETENTE · Acompanhe quem aponta para onde",
        body: `
          <p>Ao ler código com ponteiros, não pergunte apenas “qual é o valor?”. Pergunte também “qual endereço esta variável guarda agora?”.</p>
          <p>Mudanças no endereço armazenado mudam o objeto alcançado pelo ponteiro.</p>
        `
      },
      100: {
        title: "AVANÇADO · Raciocine por estados de referência",
        body: `
          <p>Em estruturas encadeadas, grande parte do raciocínio consiste em acompanhar referências: qual ponteiro aponta para qual nó antes e depois de cada instrução.</p>
          <p>O objetivo é prever a transformação da estrutura sem depender de execução real.</p>
        `
      }
    },

    nodes: {
      20: {
        title: "DESBRAVADOR · Uma corrente de nós",
        body: `
          <p>Imagine três caixas:</p>
          <pre>A → B → C → fim</pre>
          <p>Cada caixa guarda uma informação e sabe como chegar à próxima. Quando não existe próxima caixa, usamos <strong>NULL</strong>.</p>
        `
      },
      40: {
        title: "APRENDIZ · info e prox",
        body: `
          <p>Em um nó simples, <strong>info</strong> guarda o dado. <strong>prox</strong> guarda o endereço do próximo nó.</p>
          <pre>[ info | prox ]</pre>
          <p>No último nó, prox pode ser NULL porque não existe próximo nó.</p>
        `
      },
      60: {
        title: "PRATICANTE · Nó encadeado",
        body: `
          <p>Um nó combina informação e ligação. O campo <strong>info</strong> representa o dado armazenado e <strong>prox</strong> representa a referência para o próximo nó.</p>
          <p><strong>NULL</strong> no campo prox indica ausência de próximo nó.</p>
        `
      },
      80: {
        title: "COMPETENTE · Leia a topologia",
        body: `
          <p>Uma lista encadeada não é definida apenas pelos valores. As ligações em prox determinam a sequência real.</p>
          <p>Se uma ligação mudar, a topologia da estrutura também muda.</p>
        `
      },
      100: {
        title: "AVANÇADO · Estrutura é ligação, não desenho",
        body: `
          <p>O desenho A → B → C é consequência dos endereços armazenados em prox. Para raciocinar como especialista, acompanhe as referências concretas que produzem esse desenho.</p>
          <p>Esse modelo será essencial para inserção e remoção nos próximos módulos.</p>
        `
      }
    },

    "c-reading": {
      20: {
        title: "DESBRAVADOR · Leia uma peça por vez",
        body: `
          <p>Em <code>novo-&gt;info</code>, existe um ponteiro chamado <strong>novo</strong> e queremos acessar o campo <strong>info</strong> da estrutura para a qual ele aponta.</p>
          <p>Não tente interpretar todos os símbolos de uma vez.</p>
        `
      },
      40: {
        title: "APRENDIZ · *, -> e NULL",
        body: `
          <p>Em uma declaração, <code>*</code> indica ponteiro. O operador <code>-&gt;</code> acessa um campo através de um ponteiro. <code>NULL</code> representa ausência de referência válida para outro nó.</p>
        `
      },
      60: {
        title: "PRATICANTE · Tradução de código",
        body: `
          <p>Ao ler <code>struct no *prox;</code>, traduza: “prox é um ponteiro capaz de guardar o endereço de outro nó”.</p>
          <p>Ao ler <code>novo-&gt;info</code>, traduza: “acesse o campo info da estrutura apontada por novo”.</p>
        `
      },
      80: {
        title: "COMPETENTE · Código como mudança de estado",
        body: `
          <p>Não pare na tradução sintática. Pergunte qual campo será lido ou alterado e o que isso significa para a estrutura representada.</p>
          <p>Essa leitura prepara instruções como <code>novo-&gt;prox = lista;</code>.</p>
        `
      },
      100: {
        title: "AVANÇADO · Traduza código em relações",
        body: `
          <p>Uma leitura madura transforma sintaxe em relações de memória. Em vez de “executar símbolos”, descreva quais referências existem antes e depois da instrução.</p>
          <p>Essa habilidade reduz dependência de memorização de C.</p>
        `
      }
    }
  };

  const questions = {
    structures: [
      q("structures-20-1", 20, () => {
        const item = pick(["contato", "produto", "pedido", "aluno"]);
        return {
          prompt: `Em um sistema que guarda ${item}s, qual opção representa uma operação sobre os dados?`,
          options: ["Buscar um registro", "O nome do registro", "O endereço de memória da tela", "A cor do navegador"],
          correctIndex: 0,
          hint: "Procure uma ação que pode ser realizada sobre os dados.",
          explanation: "Uma operação descreve algo que fazemos com os dados, como buscar, inserir ou remover."
        };
      }),
      q("structures-20-2", 20, () => ({
        prompt: "Qual combinação melhor descreve a ideia inicial de estrutura de dados?",
        options: ["Dados + organização + operações", "Somente dados", "Somente código", "Tela + teclado"],
        correctIndex: 0,
        hint: "Pense no que guardamos e no que fazemos com isso.",
        explanation: "Estruturas de dados combinam informação organizada e formas de manipulá-la."
      })),
      q("structures-20-3", 20, () => ({
        prompt: "Guardar nomes sem nenhuma forma de inserir, buscar ou remover resolve o problema completo de uma estrutura de dados?",
        options: ["Não, também precisamos de organização e operações", "Sim, dados sozinhos bastam", "Sim, desde que sejam textos", "Somente se houver internet"],
        correctIndex: 0,
        hint: "Relembre a diferença entre dado e operação.",
        explanation: "O problema envolve não só guardar dados, mas organizá-los e operar sobre eles."
      })),

      q("structures-40-1", 40, () => {
        const scenario = pick([
          ["agenda", "telefone", "remover contato"],
          ["estoque", "quantidade", "buscar produto"],
          ["escola", "nota", "alterar nota"]
        ]);
        return {
          prompt: `No cenário “${scenario[0]}”, qual par separa corretamente dado e operação?`,
          options: [`Dado: ${scenario[1]} · Operação: ${scenario[2]}`, `Dado: ${scenario[2]} · Operação: ${scenario[1]}`, `Dado: navegador · Operação: tela`, `Dado: operação · Operação: dado`],
          correctIndex: 0,
          hint: "Dado é informação armazenada; operação é ação.",
          explanation: `${scenario[1]} é informação armazenada, enquanto ${scenario[2]} é uma ação sobre os dados.`
        };
      }),
      q("structures-40-2", 40, () => ({
        prompt: "Por que a organização dos dados importa?",
        options: ["Porque influencia como podemos inserir, localizar e remover informações", "Porque muda a cor do código", "Porque elimina a necessidade de operações", "Porque todo dado precisa virar texto"],
        correctIndex: 0,
        hint: "Pense no efeito sobre as operações.",
        explanation: "A forma de organização afeta como as operações são realizadas."
      })),
      q("structures-40-3", 40, () => ({
        prompt: "Qual pergunta ajuda mais a analisar uma estrutura de dados?",
        options: ["O que ela guarda e o que consigo fazer com isso?", "Qual é a cor do editor?", "Quantos monitores o computador tem?", "Qual navegador foi usado?"],
        correctIndex: 0,
        hint: "Volte ao par dados + operações.",
        explanation: "A análise começa identificando os dados armazenados e as operações disponíveis."
      })),

      q("structures-60-1", 60, () => ({
        prompt: "Qual definição representa melhor uma estrutura de dados?",
        options: ["Uma forma organizada de armazenar dados e definir como trabalhar com eles", "Uma variável obrigatoriamente numérica", "Uma tela de programa", "Um arquivo sempre salvo em disco"],
        correctIndex: 0,
        hint: "Considere armazenamento, organização e operações.",
        explanation: "A estrutura organiza dados e define operações sobre eles."
      })),
      q("structures-60-2", 60, () => {
        const data = pick(["clientes", "pedidos", "notas", "produtos"]);
        return {
          prompt: `Um sistema armazena ${data}. Qual mudança mais claramente acrescenta comportamento de estrutura de dados?`,
          options: ["Definir operações de inserção, busca e remoção", "Trocar a fonte da página", "Aumentar o brilho do monitor", "Renomear o navegador"],
          correctIndex: 0,
          hint: "Procure operações que mudam ou consultam os dados.",
          explanation: "Inserir, buscar e remover são operações diretamente relacionadas aos dados armazenados."
        };
      }),
      q("structures-60-3", 60, () => ({
        prompt: "Duas estruturas guardam os mesmos valores, mas possuem formas diferentes de ligação. O que pode mudar?",
        options: ["O comportamento e a forma de executar operações", "Os valores deixam de existir", "A linguagem C deixa de funcionar", "Nenhuma operação pode mudar"],
        correctIndex: 0,
        hint: "Organização influencia operações.",
        explanation: "Estruturas diferentes podem oferecer comportamentos e custos diferentes para as operações."
      })),

      q("structures-80-1", 80, () => ({
        prompt: "Ao comparar duas estruturas que armazenam o mesmo conjunto de valores, qual análise é mais útil?",
        options: ["Comparar representação, operações e efeito dessas operações", "Comparar apenas o nome da estrutura", "Comparar apenas a quantidade de letras no código", "Ignorar como os dados estão relacionados"],
        correctIndex: 0,
        hint: "Pense além dos valores armazenados.",
        explanation: "Uma análise estrutural considera como os dados são representados e como as operações transformam o estado."
      })),
      q("structures-80-2", 80, () => ({
        prompt: "Uma operação de remoção produz resultados diferentes em duas implementações. Qual conclusão é mais adequada?",
        options: ["A representação e as regras da estrutura influenciam a transformação do estado", "Toda remoção deve ser idêntica", "Uma das estruturas não possui dados", "Operações não dependem de organização"],
        correctIndex: 0,
        hint: "Relacione organização e comportamento.",
        explanation: "O comportamento de uma operação depende do modelo da estrutura e de sua implementação."
      })),
      q("structures-80-3", 80, () => ({
        prompt: "Qual descrição separa melhor estado e operação?",
        options: ["Estado descreve como os dados estão organizados agora; operação descreve uma transformação ou consulta", "Estado e operação são sinônimos", "Estado é sempre um número; operação é sempre texto", "Operação descreve somente aparência visual"],
        correctIndex: 0,
        hint: "Uma coisa representa como está; a outra representa o que fazemos.",
        explanation: "Estado representa a configuração atual; operações consultam ou transformam essa configuração."
      })),

      q("structures-100-1", 100, () => ({
        prompt: "Pensando em uma estrutura como contrato de comportamento, qual informação é mais importante?",
        options: ["Quais estados são válidos e quais transformações cada operação pode produzir", "Qual cor foi usada na interface", "Qual nome de variável o professor prefere", "Qual editor de texto foi aberto"],
        correctIndex: 0,
        hint: "Pense no que precisa continuar verdadeiro antes e depois das operações.",
        explanation: "Uma visão madura considera estados válidos, operações e suas transformações."
      })),
      q("structures-100-2", 100, () => ({
        prompt: "Por que duas implementações diferentes podem representar a mesma ideia abstrata?",
        options: ["Porque podem oferecer o mesmo comportamento essencial apesar de representações internas diferentes", "Porque implementação nunca importa", "Porque todo dado é armazenado no mesmo endereço", "Porque toda estrutura usa a mesma sintaxe"],
        correctIndex: 0,
        hint: "Separe comportamento externo de detalhe interno.",
        explanation: "A mesma abstração pode possuir representações internas distintas se preservar o comportamento esperado."
      })),
      q("structures-100-3", 100, () => ({
        prompt: "Qual pergunta mais se aproxima de uma análise de especialista sobre uma estrutura?",
        options: ["Quais invariantes e efeitos operacionais definem seu comportamento?", "Qual alternativa apareceu na prova anterior?", "Qual palavra tem mais letras?", "Qual botão abre a página?"],
        correctIndex: 0,
        hint: "Pense em propriedades que precisam permanecer válidas.",
        explanation: "Especialistas analisam propriedades, estados e efeitos das operações, não apenas nomenclatura."
      }))
    ],

    tad: [
      q("tad-20-1", 20, () => {
        const entity = pick([
          ["conta", "saldo", "depositar"],
          ["agenda", "contato", "adicionar contato"],
          ["estoque", "quantidade", "remover produto"]
        ]);
        return {
          prompt: `No exemplo de ${entity[0]}, qual opção representa uma operação?`,
          options: [entity[2], entity[1], "o monitor", "a cor da página"],
          correctIndex: 0,
          hint: "Operação é uma ação.",
          explanation: `${entity[2]} é uma ação realizada sobre os dados do TAD.`
        };
      }),
      q("tad-20-2", 20, () => ({
        prompt: "Complete a ideia principal: TAD = ...",
        options: ["dados + operações", "apenas dados", "apenas funções", "tela + teclado"],
        correctIndex: 0,
        hint: "São duas partes: o que existe e o que fazemos.",
        explanation: "O modelo mental usado no módulo é dados + operações."
      })),
      q("tad-20-3", 20, () => ({
        prompt: "Você precisa conhecer todos os detalhes internos de um banco para consultar seu saldo?",
        options: ["Não, a abstração permite usar a operação sem conhecer todos os detalhes", "Sim, sempre", "Somente se o saldo for zero", "Somente em linguagem C"],
        correctIndex: 0,
        hint: "Pense no que significa abstração.",
        explanation: "A abstração permite utilizar operações sem lidar simultaneamente com toda a implementação interna."
      })),

      q("tad-40-1", 40, () => ({
        prompt: "Qual par representa corretamente as duas partes principais de um TAD?",
        options: ["Dados e operações", "Memória e monitor", "Internet e navegador", "Arquivo e impressora"],
        correctIndex: 0,
        hint: "Uma parte guarda; a outra age.",
        explanation: "TAD combina dados com as operações definidas sobre eles."
      })),
      q("tad-40-2", 40, () => ({
        prompt: "Qual situação demonstra abstração?",
        options: ["Usar a operação sacar sem conhecer todos os detalhes internos que atualizam a conta", "Decorar cada endereço de memória do sistema", "Ignorar todas as operações", "Trocar o nome das variáveis"],
        correctIndex: 0,
        hint: "Abstração oculta detalhes internos não necessários naquele momento.",
        explanation: "Você utiliza o comportamento oferecido sem precisar conhecer toda a implementação."
      })),
      q("tad-40-3", 40, () => ({
        prompt: "Em um TAD de lista, qual conjunto parece mais com operações?",
        options: ["cria, insere, busca, retira", "nome, idade, telefone, CEP", "monitor, teclado, mouse, tela", "HTML, CSS, cor, fonte"],
        correctIndex: 0,
        hint: "Procure ações.",
        explanation: "Os nomes indicam ações realizadas sobre a estrutura."
      })),

      q("tad-60-1", 60, () => ({
        prompt: "Um TAD é normalmente pensado a partir de quais duas partes?",
        options: ["Dados e operações", "Tela e teclado", "Internet e banco de dados", "CPU e monitor"],
        correctIndex: 0,
        hint: "Retome o modelo mental da aula 2.",
        explanation: "O módulo apresenta TAD como dados + operações."
      })),
      q("tad-60-2", 60, () => ({
        prompt: "Qual é a principal ideia de abstração neste módulo?",
        options: ["Trabalhar com algo sem lidar ao mesmo tempo com todos os detalhes internos", "Eliminar todos os dados", "Transformar tudo em números", "Evitar o uso de funções"],
        correctIndex: 0,
        hint: "Pense em usar uma conta bancária sem conhecer sua implementação inteira.",
        explanation: "Abstração permite focar no uso e no comportamento relevante sem expor todos os detalhes internos."
      })),
      q("tad-60-3", 60, () => {
        const entity = pick(["pilha", "fila", "lista"]);
        return {
          prompt: `Ao estudar o TAD ${entity}, qual pergunta deve vir primeiro?`,
          options: ["Quais dados ele representa e quais operações oferece?", "Qual cor terá o botão?", "Qual navegador será usado?", "Qual arquivo de imagem existe?"],
          correctIndex: 0,
          hint: "Use o modelo dados + operações.",
          explanation: "Antes de detalhes de implementação, identifique dados e comportamento."
        };
      }),

      q("tad-80-1", 80, () => ({
        prompt: "Qual afirmação descreve melhor a relação entre TAD e implementação?",
        options: ["O TAD descreve comportamento e operações; a implementação define como isso é realizado internamente", "TAD e implementação são sempre exatamente a mesma coisa", "TAD elimina a necessidade de dados", "Implementação existe apenas para interface gráfica"],
        correctIndex: 0,
        hint: "Separe o que a estrutura oferece de como ela faz isso.",
        explanation: "A abstração permite distinguir contrato de uso e detalhes internos."
      })),
      q("tad-80-2", 80, () => ({
        prompt: "Se a representação interna de uma estrutura muda, mas suas operações e comportamento esperado são preservados, o que isso sugere?",
        options: ["A abstração permite trocar detalhes internos sem alterar necessariamente o modo de uso", "O TAD deixou de existir", "Toda operação precisa mudar de nome", "Os dados foram apagados"],
        correctIndex: 0,
        hint: "Pense na fronteira criada pela abstração.",
        explanation: "Detalhes internos podem mudar sem alterar o contrato conceitual oferecido."
      })),
      q("tad-80-3", 80, () => ({
        prompt: "Qual descrição é mais precisa para uma operação de TAD?",
        options: ["Uma ação definida sobre o estado representado pelo tipo abstrato", "Um detalhe visual obrigatório", "Uma variável que nunca muda", "Um endereço de navegador"],
        correctIndex: 0,
        hint: "Operação age ou consulta o estado.",
        explanation: "Operações definem ações disponíveis sobre os dados do TAD."
      })),

      q("tad-100-1", 100, () => ({
        prompt: "Qual benefício arquitetural decorre diretamente da abstração de um TAD?",
        options: ["Separar contrato de uso de detalhes internos de representação", "Garantir que toda implementação use o mesmo código", "Eliminar a necessidade de operações", "Impedir mudanças internas"],
        correctIndex: 0,
        hint: "Pense em fronteira entre uso e implementação.",
        explanation: "A abstração permite que quem usa o TAD raciocine pelo contrato sem depender de cada detalhe interno."
      })),
      q("tad-100-2", 100, () => ({
        prompt: "Duas implementações diferentes oferecem as mesmas operações e respeitam o mesmo comportamento observável. Qual leitura é mais adequada?",
        options: ["Elas podem implementar a mesma abstração apesar de representações internas diferentes", "Uma delas necessariamente não é um TAD", "As duas precisam usar os mesmos endereços de memória", "As duas precisam ter nomes de variáveis iguais"],
        correctIndex: 0,
        hint: "Comportamento observável pode permanecer mesmo com representação diferente.",
        explanation: "O TAD é uma abstração do comportamento, não uma exigência de implementação idêntica."
      })),
      q("tad-100-3", 100, () => ({
        prompt: "Ao projetar mentalmente um TAD, qual ordem de raciocínio é mais madura?",
        options: ["Definir estado e operações esperadas antes de decidir detalhes internos", "Escolher nomes de variáveis antes de saber o problema", "Começar pela interface gráfica", "Ignorar operações e guardar apenas dados"],
        correctIndex: 0,
        hint: "Comece pelo contrato, depois pela implementação.",
        explanation: "A abstração ajuda a definir primeiro o comportamento desejado e depois sua representação interna."
      }))
    ],

    pointers: [
      q("pointers-20-1", 20, () => {
        const address = memoryAddress();
        return {
          prompt: `O valor "Ana" está no endereço ${address}. O que um ponteiro para esse valor precisa guardar?`,
          options: [String(address), "Ana obrigatoriamente", "A cor da tela", "O nome do navegador"],
          correctIndex: 0,
          hint: "Ponteiro guarda onde o dado está.",
          explanation: `O ponteiro pode guardar o endereço ${address}, que permite localizar o valor.`
        };
      }),
      q("pointers-20-2", 20, () => ({
        prompt: "O que um ponteiro armazena?",
        options: ["Um endereço de memória", "Somente textos", "Uma função inteira", "Uma tela"],
        correctIndex: 0,
        hint: "Ele guarda onde algo está.",
        explanation: "Ponteiros armazenam endereços de memória."
      })),
      q("pointers-20-3", 20, () => {
        const address = memoryAddress();
        return {
          prompt: `Memória simplificada: endereço ${address} → valor 27. Qual parte representa a localização?`,
          options: [String(address), "27", "A seta", "Nenhuma"],
          correctIndex: 0,
          hint: "Localização é o endereço.",
          explanation: `${address} é o endereço; 27 é o valor armazenado ali.`
        };
      }),

      q("pointers-40-1", 40, () => {
        const address = memoryAddress();
        const value = Math.floor(Math.random() * 90) + 10;
        return {
          prompt: `Se um ponteiro guarda ${address} e nesse endereço existe o valor ${value}, qual afirmação é correta?`,
          options: [`O ponteiro conhece a localização ${address} do valor`, `O ponteiro obrigatoriamente vale ${value}`, "O endereço deixou de existir", "O valor e o endereço são a mesma coisa"],
          correctIndex: 0,
          hint: "Separe localização de conteúdo.",
          explanation: `O ponteiro armazena o endereço ${address}; o conteúdo localizado ali é ${value}.`
        };
      }),
      q("pointers-40-2", 40, () => ({
        prompt: "Qual frase diferencia corretamente valor e endereço?",
        options: ["O valor é o conteúdo; o endereço identifica onde ele está na memória", "Valor e endereço são sempre iguais", "Endereço existe apenas para textos", "Ponteiro elimina endereços"],
        correctIndex: 0,
        hint: "Uma coisa é conteúdo; outra é localização.",
        explanation: "Endereço representa localização, enquanto o valor representa o conteúdo armazenado."
      })),
      q("pointers-40-3", 40, () => ({
        prompt: "Por que um ponteiro é útil em uma estrutura encadeada?",
        options: ["Porque pode guardar o endereço de outro nó", "Porque desenha setas na tela", "Porque conta automaticamente todos os elementos", "Porque substitui todas as operações"],
        correctIndex: 0,
        hint: "Pense na ligação entre nós.",
        explanation: "A ligação entre nós é representada por endereços armazenados em ponteiros."
      })),

      q("pointers-60-1", 60, () => ({
        prompt: "Qual afirmação sobre ponteiros está correta?",
        options: ["Um ponteiro armazena um endereço de memória", "Um ponteiro armazena obrigatoriamente o código-fonte", "Um ponteiro é sempre uma função", "Um ponteiro elimina a necessidade de memória"],
        correctIndex: 0,
        hint: "Ponteiro e endereço estão diretamente relacionados.",
        explanation: "O conceito central ensinado é que ponteiros armazenam endereços de memória."
      })),
      q("pointers-60-2", 60, () => {
        const addressA = memoryAddress();
        let addressB = memoryAddress();
        while (addressB === addressA) addressB = memoryAddress();
        return {
          prompt: `aux guardava o endereço ${addressA} e depois passou a guardar ${addressB}. O que mudou?`,
          options: ["O objeto alcançado por aux pode ter mudado porque o endereço armazenado mudou", "Nada pode mudar em um ponteiro", "Os dois endereços viraram o mesmo valor", "A memória foi apagada"],
          correctIndex: 0,
          hint: "Quem o ponteiro alcança depende do endereço armazenado.",
          explanation: "Ao trocar o endereço guardado, o ponteiro passa a referenciar outro local de memória."
        };
      }),
      q("pointers-60-3", 60, () => ({
        prompt: "Qual pergunta ajuda mais ao ler código com ponteiros?",
        options: ["Qual endereço esta variável guarda e para qual objeto isso leva?", "Qual cor possui a variável?", "Quantas letras tem seu nome?", "Qual navegador está aberto?"],
        correctIndex: 0,
        hint: "Acompanhe referências.",
        explanation: "Raciocinar com ponteiros exige acompanhar endereços e objetos referenciados."
      })),

      q("pointers-80-1", 80, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Considere ${a} → ${b} → ${c} → NULL. Se um ponteiro aux aponta para ${a} e recebe o endereço que ${a}.prox guarda, onde aux passa a apontar?`,
          options: [b, a, c, "NULL"],
          correctIndex: 0,
          hint: "O campo prox do primeiro nó contém o endereço do próximo.",
          explanation: `Como ${a}.prox referencia ${b}, aux passa a apontar para ${b}.`
        };
      }),
      q("pointers-80-2", 80, () => {
        const [a, b] = labels(2);
        return {
          prompt: `Um ponteiro p aponta para o nó ${a}. Depois p recebe o endereço de ${b}. Qual estado é coerente?`,
          options: [`p agora referencia ${b}`, `p continua obrigatoriamente em ${a}`, `p deixou de ser ponteiro`, `os nós ${a} e ${b} se fundiram`],
          correctIndex: 0,
          hint: "O endereço armazenado define o alvo atual.",
          explanation: `Após receber o endereço de ${b}, p passa a referenciar ${b}.`
        };
      }),
      q("pointers-80-3", 80, () => ({
        prompt: "Qual erro de raciocínio é mais perigoso ao acompanhar ponteiros?",
        options: ["Confundir o endereço armazenado com o valor do objeto apontado", "Usar nomes curtos", "Desenhar uma seta", "Ler o código linha por linha"],
        correctIndex: 0,
        hint: "Separe referência e conteúdo.",
        explanation: "Ponteiro e objeto apontado são conceitos relacionados, mas não idênticos."
      })),

      q("pointers-100-1", 100, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Na estrutura ${a} → ${b} → ${c} → NULL, aux aponta para ${a}. A instrução conceitual “aux recebe aux.prox” é executada duas vezes. Onde aux termina?`,
          options: [c, b, a, "NULL"],
          correctIndex: 0,
          hint: "Avance uma ligação por execução.",
          explanation: `Primeiro aux vai de ${a} para ${b}; depois de ${b} para ${c}.`
        };
      }),
      q("pointers-100-2", 100, () => ({
        prompt: "Qual descrição representa melhor raciocínio por estado de referência?",
        options: ["Registrar para onde cada ponteiro aponta antes e depois de cada instrução relevante", "Memorizar apenas os nomes das variáveis", "Ignorar endereços e observar só a interface", "Assumir que todo ponteiro sempre aponta para o primeiro nó"],
        correctIndex: 0,
        hint: "Pense em snapshots da estrutura.",
        explanation: "Rastrear referências antes e depois de cada operação permite prever mudanças estruturais."
      })),
      q("pointers-100-3", 100, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Temos ${a} → ${b} → ${c} → NULL. Se uma variável guarda o endereço de ${b}, qual informação adicional é necessária para saber quem vem depois de ${b}?`,
          options: [`O conteúdo do campo prox de ${b}`, `A cor do nó ${b}`, `O tamanho do monitor`, `O nome da função main`],
          correctIndex: 0,
          hint: "A próxima ligação está armazenada em um campo do nó atual.",
          explanation: `O campo prox de ${b} contém a referência usada para alcançar o próximo nó.`
        };
      })
    ],

    nodes: [
      q("nodes-20-1", 20, () => {
        const [a, b] = labels(2);
        return {
          prompt: `Na sequência ${a} → ${b} → fim, o que significa “fim”?`,
          options: ["Não existe próximo nó", `Existe outro nó ${a}`, "O valor é zero", "A lista está cheia"],
          correctIndex: 0,
          hint: "No código, esse fim é representado por NULL.",
          explanation: "Fim significa ausência de próximo nó; em C, o módulo representa isso com NULL."
        };
      }),
      q("nodes-20-2", 20, () => ({
        prompt: "Em um nó simples, qual campo guarda o dado?",
        options: ["info", "prox", "NULL", "main"],
        correctIndex: 0,
        hint: "O nome lembra informação.",
        explanation: "No modelo estudado, info guarda a informação do nó."
      })),
      q("nodes-20-3", 20, () => ({
        prompt: "Em um nó simples, qual campo ajuda a chegar ao próximo nó?",
        options: ["prox", "info", "printf", "main"],
        correctIndex: 0,
        hint: "O nome lembra próximo.",
        explanation: "prox guarda a referência/endereço do próximo nó."
      })),

      q("nodes-40-1", 40, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Na lista ${a} → ${b} → ${c} → NULL, qual nó possui prox = NULL?`,
          options: [c, b, a, "Todos"],
          correctIndex: 0,
          hint: "NULL marca ausência de próximo nó.",
          explanation: `${c} é o último nó, portanto seu campo prox não referencia outro nó.`
        };
      }),
      q("nodes-40-2", 40, () => ({
        prompt: "Qual representação combina corretamente os campos de um nó encadeado simples?",
        options: ["[ info | prox ]", "[ teclado | monitor ]", "[ tela | botão ]", "[ função | navegador ]"],
        correctIndex: 0,
        hint: "Um campo guarda dado; o outro ligação.",
        explanation: "O modelo do módulo utiliza info para o dado e prox para a referência ao próximo nó."
      })),
      q("nodes-40-3", 40, () => ({
        prompt: "Se prox de um nó muda, o que pode mudar na lista?",
        options: ["A ligação para o próximo nó", "O significado de todos os números", "O navegador", "A linguagem de programação inteira"],
        correctIndex: 0,
        hint: "prox representa ligação.",
        explanation: "Alterar prox altera qual nó é alcançado a partir do nó atual."
      })),

      q("nodes-60-1", 60, () => ({
        prompt: "No nó de uma lista encadeada, qual é o papel de info?",
        options: ["Guardar a informação do nó", "Guardar obrigatoriamente um endereço", "Ordenar automaticamente a lista", "Finalizar a função"],
        correctIndex: 0,
        hint: "info representa informação.",
        explanation: "info é o campo usado para armazenar o dado do nó."
      })),
      q("nodes-60-2", 60, () => ({
        prompt: "No nó de uma lista encadeada simples, prox normalmente:",
        options: ["Guarda o endereço do próximo nó", "Conta quantos usuários existem", "Ordena automaticamente a lista", "Apaga o nó"],
        correctIndex: 0,
        hint: "prox representa a ligação adiante.",
        explanation: "prox guarda a referência que permite alcançar o próximo nó."
      })),
      q("nodes-60-3", 60, () => ({
        prompt: "Se o campo prox do último nó contém NULL, isso indica:",
        options: ["Não existe próximo nó", "O dado vale zero", "O primeiro nó foi apagado", "A lista obrigatoriamente possui erro"],
        correctIndex: 0,
        hint: "NULL representa ausência de referência para outro nó.",
        explanation: "No último nó não há próximo elemento, por isso prox pode ser NULL."
      })),

      q("nodes-80-1", 80, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Valores armazenados: ${a}, ${b}, ${c}. Ligações: ${a}.prox = ${c}, ${c}.prox = ${b}, ${b}.prox = NULL. Qual é a sequência real?`,
          options: [`${a} → ${c} → ${b} → NULL`, `${a} → ${b} → ${c} → NULL`, `${b} → ${a} → ${c} → NULL`, `${c} → ${a} → ${b} → NULL`],
          correctIndex: 0,
          hint: "A ordem real vem dos campos prox, não da ordem em que os nomes foram listados.",
          explanation: `Seguindo as referências: ${a} leva a ${c}, que leva a ${b}, que termina em NULL.`
        };
      }),
      q("nodes-80-2", 80, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Na lista ${a} → ${b} → ${c} → NULL, o campo prox de ${a} é alterado para apontar diretamente para ${c}. Qual caminho passa a sair de ${a}?`,
          options: [`${a} → ${c}`, `${a} → ${b}`, `${c} → ${a}`, `${b} → ${a}`],
          correctIndex: 0,
          hint: "A ligação de saída de A agora ignora o nó intermediário.",
          explanation: `Ao mudar ${a}.prox para ${c}, seguir a lista a partir de ${a} leva diretamente a ${c}.`
        };
      }),
      q("nodes-80-3", 80, () => ({
        prompt: "Por que o desenho de uma lista encadeada é consequência das referências?",
        options: ["Porque são os endereços guardados em prox que determinam qual nó é alcançado a seguir", "Porque as letras dos dados criam setas automaticamente", "Porque NULL ordena os valores", "Porque todo nó fica no mesmo endereço"],
        correctIndex: 0,
        hint: "Topologia vem das ligações.",
        explanation: "As setas apenas representam as referências efetivamente armazenadas nos campos prox."
      })),

      q("nodes-100-1", 100, () => {
        const [a, b, c, d] = labels(4);
        return {
          prompt: `Ligações: ${a}.prox=${b}, ${b}.prox=${d}, ${c}.prox=NULL, ${d}.prox=${c}. Partindo de ${a}, qual percurso ocorre?`,
          options: [`${a} → ${b} → ${d} → ${c} → NULL`, `${a} → ${b} → ${c} → ${d} → NULL`, `${c} → ${d} → ${b} → ${a} → NULL`, `${a} → ${d} → ${b} → ${c} → NULL`],
          correctIndex: 0,
          hint: "Siga cada prox literalmente.",
          explanation: `Partindo de ${a}: prox leva a ${b}, depois a ${d}, depois a ${c}, e então NULL.`
        };
      }),
      q("nodes-100-2", 100, () => ({
        prompt: "Qual afirmação descreve melhor a diferença entre dado e topologia em uma lista encadeada?",
        options: ["info representa conteúdo; prox representa relações que determinam a sequência estrutural", "info e prox possuem sempre a mesma função", "topologia depende somente do valor armazenado", "NULL armazena automaticamente o primeiro dado"],
        correctIndex: 0,
        hint: "Separe conteúdo e ligação.",
        explanation: "Os valores ficam em info, enquanto as relações entre nós são definidas pelos campos prox."
      })),
      q("nodes-100-3", 100, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Partindo de ${a}, temos ${a}.prox=${b} e ${b}.prox=${c}. Se ${b}.prox passa a ser NULL, qual nó deixa de ser alcançável seguindo a partir de ${a}?`,
          options: [c, b, a, "Nenhum"],
          correctIndex: 0,
          hint: "A cadeia passa a terminar em B.",
          explanation: `Depois da alteração, o percurso é ${a} → ${b} → NULL; ${c} não é mais alcançado por esse caminho.`
        };
      })
    ],

    "c-reading": [
      q("c-reading-20-1", 20, () => ({
        prompt: "Em novo->info, qual campo está sendo acessado?",
        options: ["info", "novo", "NULL", "struct"],
        correctIndex: 0,
        hint: "O nome depois de -> é o campo.",
        explanation: "O operador -> acessa o campo info da estrutura apontada por novo."
      })),
      q("c-reading-20-2", 20, () => ({
        prompt: "Em struct no *prox;, o asterisco indica que prox:",
        options: ["É um ponteiro", "É uma soma", "É uma função", "É obrigatoriamente um caractere"],
        correctIndex: 0,
        hint: "O símbolo * aparece em declarações de ponteiro.",
        explanation: "Na declaração, * indica que prox é um ponteiro para struct no."
      })),
      q("c-reading-20-3", 20, () => ({
        prompt: "Qual símbolo é usado para acessar um campo através de um ponteiro para struct neste módulo?",
        options: ["->", ".", "+", "=="],
        correctIndex: 0,
        hint: "Ele parece uma pequena seta.",
        explanation: "O operador -> acessa um campo da estrutura apontada por um ponteiro."
      })),

      q("c-reading-40-1", 40, () => {
        const pointer = pick(["novo", "aux", "atual"]);
        return {
          prompt: `Como você traduziria ${pointer}->info?`,
          options: [`Acesse o campo info da estrutura apontada por ${pointer}`, `Compare ${pointer} com info`, `Apague ${pointer}`, `Some ${pointer} e info`],
          correctIndex: 0,
          hint: "O operador -> acessa campo através de ponteiro.",
          explanation: `${pointer}->info acessa o campo info do objeto referenciado por ${pointer}.`
        };
      }),
      q("c-reading-40-2", 40, () => ({
        prompt: "Como traduzir struct no *prox; de forma conceitual?",
        options: ["prox pode guardar o endereço de um nó", "prox guarda obrigatoriamente um caractere", "prox é uma função", "prox apaga um nó"],
        correctIndex: 0,
        hint: "Combine struct no com a ideia de ponteiro.",
        explanation: "prox é declarado como ponteiro para struct no e pode guardar endereço de outro nó."
      })),
      q("c-reading-40-3", 40, () => ({
        prompt: "Em código de lista, o que NULL costuma expressar quando atribuído a prox?",
        options: ["Ausência de próximo nó", "Valor numérico do dado", "Quantidade de nós", "Nome da estrutura"],
        correctIndex: 0,
        hint: "Pense no fim da ligação.",
        explanation: "NULL no campo prox indica que não há referência para outro nó."
      })),

      q("c-reading-60-1", 60, () => ({
        prompt: "O que novo->info representa?",
        options: ["Acesso ao campo info da estrutura apontada por novo", "Uma comparação entre novo e info", "A exclusão do campo info", "Um endereço inválido"],
        correctIndex: 0,
        hint: "novo é ponteiro; -> acessa campo.",
        explanation: "A expressão acessa o campo info do nó referenciado por novo."
      })),
      q("c-reading-60-2", 60, () => ({
        prompt: "Qual tradução conceitual corresponde a novo->prox = lista;?",
        options: ["O campo prox do novo nó recebe o endereço atualmente guardado em lista", "A lista é apagada", "novo e lista são comparados", "prox vira obrigatoriamente NULL"],
        correctIndex: 0,
        hint: "Leia a atribuição da direita para a esquerda: o que será guardado em prox?",
        explanation: "O campo prox do nó apontado por novo passa a armazenar a referência que estava em lista."
      })),
      q("c-reading-60-3", 60, () => ({
        prompt: "Ao ler uma linha com ->, qual estratégia é mais segura?",
        options: ["Identificar o ponteiro, o campo acessado e o efeito da leitura ou atribuição", "Decorar a posição da resposta", "Ignorar o lado direito da atribuição", "Assumir que -> sempre remove um nó"],
        correctIndex: 0,
        hint: "Traduza sintaxe em comportamento.",
        explanation: "A leitura correta identifica quem aponta, qual campo é acessado e qual mudança ocorre."
      })),

      q("c-reading-80-1", 80, () => {
        const [a, b] = labels(2);
        return {
          prompt: `Suponha que lista aponta para ${a}. Após novo->prox = lista;, para onde novo->prox aponta?`,
          options: [a, b, "NULL obrigatoriamente", "Para o próprio novo"],
          correctIndex: 0,
          hint: "O lado direito da atribuição é a referência atualmente guardada em lista.",
          explanation: `Como lista aponta para ${a}, essa mesma referência é copiada para novo->prox.`
        };
      }),
      q("c-reading-80-2", 80, () => ({
        prompt: "Qual sequência de raciocínio é melhor ao interpretar uma atribuição com ponteiros?",
        options: ["Identificar referência atual → campo alterado → referência nova → efeito estrutural", "Ler apenas o nome da função", "Ignorar os campos", "Transformar todo ponteiro em número sem contexto"],
        correctIndex: 0,
        hint: "Pense em estado antes e depois.",
        explanation: "Rastrear referências e efeito estrutural transforma sintaxe em comportamento."
      })),
      q("c-reading-80-3", 80, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `Temos novo apontando para ${a} e lista apontando para ${b}. A instrução novo->prox = lista; cria qual ligação?`,
          options: [`${a} → ${b}`, `${b} → ${a}`, `${a} → ${c}`, `${b} → ${c}`],
          correctIndex: 0,
          hint: "O campo prox do nó apontado por novo recebe o endereço guardado em lista.",
          explanation: `O nó ${a}, alcançado por novo, passa a ter prox apontando para ${b}.`
        };
      }),

      q("c-reading-100-1", 100, () => {
        const [a, b, c] = labels(3);
        return {
          prompt: `lista aponta para ${a}; novo aponta para ${b}. Depois de novo->prox = lista; e lista = novo;, qual início lógico resulta?`,
          options: [`${b} → ${a}`, `${a} → ${b}`, `${c} → ${a}`, `${a} → ${c}`],
          correctIndex: 0,
          hint: "Primeiro B passa a apontar para A; depois lista passa a apontar para B.",
          explanation: `A primeira instrução cria ${b} → ${a}; a segunda move o início para ${b}.`
        };
      }),
      q("c-reading-100-2", 100, () => ({
        prompt: "Qual interpretação está mais próxima de uma leitura especializada de código com ponteiros?",
        options: ["Descrever explicitamente as relações de memória antes e depois de cada atribuição", "Ler apenas os símbolos -> e *", "Memorizar frases sem reconstruir o estado", "Ignorar o objeto apontado"],
        correctIndex: 0,
        hint: "Código representa relações de memória.",
        explanation: "A leitura madura acompanha referências e transforma a linha em uma mudança de estado compreensível."
      })),
      q("c-reading-100-3", 100, () => {
        const [a, b] = labels(2);
        return {
          prompt: `aux aponta para ${a}; ${a}.prox aponta para ${b}. Após aux = aux->prox;, qual relação descreve aux?`,
          options: [`aux aponta para ${b}`, `aux continua obrigatoriamente em ${a}`, `aux vira NULL`, `aux deixa de ser ponteiro`],
          correctIndex: 0,
          hint: "O novo valor de aux é o endereço guardado no campo prox do nó atual.",
          explanation: `Como ${a}.prox referencia ${b}, aux passa a armazenar o endereço de ${b}.`
        };
      })
    ]
  };

  window.QUIZADS_M01_LEARNING = {
    definition,
    lessons,
    questions
  };
})();

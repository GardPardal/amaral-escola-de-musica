// Cursos básicos prontos da Amaral Escola de Música: 8 aulas por instrumento.
// Cada aula vira uma rotina; o "instrumento" precisa ser igual ao do cadastro do aluno.
// Os exercícios com som usam o tocador do canto.js (veja os tipos no topo daquele arquivo).
(function () {
  'use strict';
  var P = window.AmaralCanto.PADROES;

  // ---------- Atalhos para montar os exercícios ----------
  function seq(semitons, dur, ultimo) {
    return semitons.map(function (s, i) { return [s, i === semitons.length - 1 && ultimo ? ultimo : dur]; });
  }
  function curto(semitons) {
    var p = [];
    semitons.forEach(function (s, i) { if (i === semitons.length - 1) p.push([s, 1]); else p.push([s, 0.5], [null, 0.5]); });
    return p;
  }
  var MAIOR = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0];
  var CINCO = [0, 2, 4, 5, 7, 5, 4, 2, 0];

  // vocalize: sobe de meio em meio tom
  function voc(padrao, silaba, de, ate, direcao, bpm) {
    return { tipo: 'notas', padrao: P[padrao].padrao, silaba: silaba, de: de, ate: ate, direcao: direcao, bpm: bpm, acorde: true };
  }
  function resp(fases, repeticoes, bpm) { return { tipo: 'respiracao', fases: fases, repeticoes: repeticoes, bpm: bpm }; }
  // demonstração fixa (escala, melodia, afinação)
  function demo(padrao, raiz, bpm, instrucao, extra) {
    var v = { tipo: 'notas', demo: true, padrao: padrao, de: raiz, ate: raiz, bpm: bpm, silaba: instrucao, repeticoes: 1 };
    Object.keys(extra || {}).forEach(function (k) { v[k] = extra[k]; });
    return v;
  }
  // progressão: 'C:4 G:4 Am:4 F:4'
  function acordes(lista, bpm, extra) {
    var a = typeof lista === 'string' ? lista.split(/\s+/).map(function (x) { var p = x.split(':'); return [p[0], Number(p[1]) || 4]; }) : lista;
    var v = { tipo: 'acordes', acordes: a, bpm: bpm, repeticoes: 1 };
    Object.keys(extra || {}).forEach(function (k) { v[k] = extra[k]; });
    return v;
  }
  function metronomo(bpm, tempos, texto, compassos) { return { tipo: 'metronomo', bpm: bpm, tempos: tempos, texto: texto, compassos: compassos || 16 }; }
  function teclado(de, ate) { return { tipo: 'piano', de: de, ate: ate, demo: true }; }
  function t(texto, minutos, vocalize) { var i = { texto: texto, minutos: minutos }; if (vocalize) i.vocalize = vocalize; return i; }

  var AFINACAO = [[0, 3, '6ª corda: Mi'], [5, 3, '5ª corda: Lá'], [10, 3, '4ª corda: Ré'], [15, 3, '3ª corda: Sol'], [19, 3, '2ª corda: Si'], [24, 3, '1ª corda: Mi']];
  var PENTA = {
    nome: 'Pentatônica de Lá menor', inicio: 5,
    pontos: [[6, 5, 1], [6, 8, 4], [5, 5, 1], [5, 7, 3], [4, 5, 1], [4, 7, 3], [3, 5, 1], [3, 7, 3], [2, 5, 1], [2, 8, 4], [1, 5, 1], [1, 8, 4]]
  };
  var PENTA_NOTAS = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 24, 22, 19, 17, 15, 12, 10, 7, 5, 3, 0];
  // cromático: casas 1-2-3-4 da 6ª à 1ª corda e de volta (4-3-2-1 da 1ª à 6ª)
  var ARANHA = (function () {
    var soltas = [0, 5, 10, 15, 19, 24], l = [];
    soltas.forEach(function (s) { for (var c = 1; c <= 4; c++) l.push(s + c); });
    soltas.slice().reverse().forEach(function (s) { for (var c = 4; c >= 1; c--) l.push(s + c); });
    return l;
  })();
  var ODE = [[4, 1], [4, 1], [5, 1], [7, 1], [7, 1], [5, 1], [4, 1], [2, 1], [0, 1], [0, 1], [2, 1], [4, 1], [4, 1.5], [2, 0.5], [2, 2],
             [4, 1], [4, 1], [5, 1], [7, 1], [7, 1], [5, 1], [4, 1], [2, 1], [0, 1], [0, 1], [2, 1], [4, 1], [2, 1.5], [0, 0.5], [0, 2]];
  var DO_RE_MI_FA = [[0, 1], [2, 1], [4, 1], [5, 1], [5, 1], [5, 2], [0, 1], [2, 1], [0, 1], [2, 1], [2, 1], [2, 2],
                     [0, 1], [7, 1], [5, 1], [4, 1], [4, 1], [4, 2], [0, 1], [2, 1], [4, 1], [5, 1], [5, 1], [5, 2]];
  function pares(semitons, baixo, alto) { // duas mãos, uma oitava de distância
    var n = ['Dó', 'Dó♯', 'Ré', 'Mi♭', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Lá♭', 'Lá', 'Si♭', 'Si'];
    return semitons.map(function (s) { return [n[(s % 12 + 12) % 12], 1, [baixo + s, alto + s]]; });
  }

  function curso(instrumento, prefixo, aulas) {
    return {
      instrumento: instrumento,
      aulas: aulas.map(function (a, i) {
        return { titulo: prefixo + ' · Aula ' + (i + 1) + ': ' + a[0], instrumento: instrumento, nivel: a[1], observacao: a[2], itens: a[3] };
      })
    };
  }

  var CURSOS = [
    // ======================= CANTO =======================
    curso('Canto coral', 'Canto', [
      ['Respiração e apoio', 'Iniciante', 'Faça em pé, com calma. O metrônomo marca o tempo de cada fase: siga a contagem na tela.', [
        t('Postura: pés na largura dos ombros, joelhos soltos, ombros baixos. Mão na barriga: ao inspirar a barriga sai e os ombros não sobem.', 3),
        t('Respiração 4-4-8: inspire, segure e solte em "sss" bem controlado', 4, resp([['Inspire pelo nariz', 4], ['Segure, sem travar a garganta', 4], ['Solte em "sss" contínuo', 8]], 6, 60)),
        t('Pulsos de apoio: um "ts" curto em cada tempo, a barriga empurra o ar', 3, resp([['Inspire', 4], ['"Ts" a cada tempo', 8], ['Descanse', 4]], 5, 72)),
        t('Respiração 4-4-12: a saída fica mais longa', 3, resp([['Inspire pelo nariz', 4], ['Segure', 4], ['Solte em "fff" bem devagar', 12]], 4, 60)),
        t('Vibração de lábios (brrr) em 5 notas, sem empurrar o ar', 4, voc('cinco', 'Brrr (lábios)', 60, 65, 'subir-descer', 92)),
        t('Nota longa em "u" com apoio: segure até o fim sem a voz tremer', 3, voc('longa', 'Uuu', 60, 67, 'subir', 66))
      ]],
      ['Afinação', 'Iniciante', 'Ouça antes de cantar. Se a nota não "encaixar", pare, toque a tecla na tela e tente de novo.', [
        t('Ouça e repita: o piano toca, você canta a mesma nota no silêncio', 4, voc('eco', 'Lá', 60, 65, 'subir', 84)),
        t('3 notas em "Lu", devagar, junto com o piano', 4, voc('tres', 'Lu', 60, 67, 'subir-descer', 76)),
        t('Arpejo 1-3-5-3-1 em "Mi"', 4, voc('arpejo', 'Mi', 60, 67, 'subir-descer', 80)),
        t('Intervalos: terça, quinta e oitava em "Ná"', 4, voc('intervalos', 'Ná', 60, 64, 'subir', 72)),
        t('Grave no celular você cantando o arpejo e compare com o piano. Anote onde a nota ficou baixa ou alta.', 3),
        t('Teclado livre: toque uma nota, cante e confira se encaixou', 2, { tipo: 'piano', de: 53, ate: 76 })
      ]],
      ['Resistência', 'Intermediário', 'Resistência vem do apoio, não da garganta. Se arranhar ou cansar, pare e beba água.', [
        t('Vibração de lábios na escala de 9 notas', 4, voc('nove', 'Brrr (lábios)', 60, 65, 'subir-descer', 80)),
        t('Staccato no arpejo em "Ha": curto, com a barriga', 4, voc('staccato', 'Ha (curto)', 60, 65, 'subir', 96)),
        t('Arpejo com oitava em "Nó", ligado', 4, voc('oitava', 'Nó', 60, 67, 'subir-descer', 88)),
        t('Nota longa em "Ah": comece fraco, cresça e volte a diminuir (messa di voce)', 4, voc('longa8', 'Ah (fraco → forte → fraco)', 60, 65, 'subir', 60)),
        t('5 notas rápidas em "Mi-é-á" (agilidade)', 4, voc('rapido', 'Mi-é-á', 60, 67, 'subir-descer', 112)),
        t('Desaquecer: 2 minutos de vibração de lábios no grave e um copo de água.', 2)
      ]],
      ['Tessitura e extensão', 'Intermediário', 'Extensão se ganha aos poucos. Vá só até onde a voz sai sem apertar; em "Até o tom" você ajusta o limite.', [
        t('Sirene em "u": deslize do grave ao agudo e volte, como uma sirene, sem forçar', 2),
        t('Salto de quinta em "Ná", ligando as notas', 4, voc('quinta', 'Ná-á-á', 55, 67, 'subir', 80)),
        t('Arpejo com oitava em "Ia" subindo de meio em meio tom', 5, voc('oitava', 'Ia', 57, 65, 'subir', 92)),
        t('Descendo do 5 em "Ah" para explorar o grave', 4, voc('desce', 'Ah', 62, 55, 'descer', 84)),
        t('Ache sua extensão: no teclado, encontre a nota mais grave e a mais aguda que você canta confortável', 3, { tipo: 'piano', de: 48, ate: 79 }),
        t('Conte na Comunidade sua nota mais grave e a mais aguda. Repita todo mês e compare.', 2)
      ]],
      ['Articulação e dicção', 'Intermediário', 'Quem canta no coral precisa ser entendido. Boca ativa, língua solta e consoantes claras.', [
        t('Fale "A-E-I-O-U" bem aberto e exagerado, 10 vezes, olhando no espelho.', 2),
        t('5 notas com consoantes: "Pa-pa-pa", depois "Ta-ta-ta", depois "Ca-ca-ca"', 4, voc('cinco', 'Pa / Ta / Ca', 60, 65, 'subir-descer', 96)),
        t('Nota longa trocando as vogais sem mexer na nota', 4, voc('longa', 'A-E-I-O-U', 60, 65, 'subir', 60)),
        t('Trava-língua: "O rato roeu a roupa do rei de Roma", 5 vezes, cada vez mais rápido e sem perder a clareza.', 2),
        t('3 notas em "Mi-ma-mo"', 4, voc('tres', 'Mi-ma-mo', 60, 67, 'subir-descer', 90))
      ]],
      ['Registros: voz de peito e de cabeça', 'Intermediário', 'Voz de peito é a voz da fala; voz de cabeça é mais leve. O objetivo é passar de uma para outra sem "quebrar".', [
        t('Fale "ei!" como quem chama alguém (peito) e depois "uuu" como uma coruja (cabeça). Sinta a diferença.', 2),
        t('Salto de oitava em "Ui": leve no agudo', 4, voc('oitavaSalto', 'Ui (leve no agudo)', 55, 65, 'subir', 80)),
        t('Descendo do 5 em "Nhé", pequeno, como um choro de criança', 4, voc('desce', 'Nhé', 67, 60, 'descer', 84)),
        t('Arpejo com oitava em "Gu", sem empurrar na passagem', 4, voc('oitava', 'Gu', 57, 64, 'subir-descer', 88)),
        t('Anote em que nota sua voz "quer quebrar". É ali que vamos trabalhar na aula.', 2)
      ]],
      ['Ressonância', 'Intermediário', 'Ressonância é onde o som vibra. Boca fechada primeiro, depois abrindo sem perder a vibração.', [
        t('"Mmm" de boca fechada em uma nota confortável: sinta vibrar nos lábios e no nariz.', 2),
        t('5 notas em "Mmm"', 4, voc('cinco', 'Mmm (boca fechada)', 60, 65, 'subir-descer', 88)),
        t('3 notas em "Nnn" que abre para "Ná" no fim', 4, voc('tres', 'Nnn → Ná', 60, 67, 'subir', 80)),
        t('Arpejo em "Ng" (como no fim de "king") abrindo para "Á"', 4, voc('arpejo', 'Ng → Á', 60, 65, 'subir-descer', 80)),
        t('Cante um trecho de uma música em "mmm" e depois com a letra, mantendo a mesma vibração.', 3)
      ]],
      ['Cantando em vozes', 'Intermediário', 'No coral, cada naipe canta uma nota do acorde. Aqui você aprende a segurar sua nota enquanto outras soam.', [
        t('Soprano (agudo), contralto, tenor e baixo (grave): cada naipe canta uma nota do acorde.', 2),
        t('Cante em "Lu" a nota mais aguda de cada acorde', 4, acordes('C:4 F:4 G:4 C:4', 60, { repeticoes: 4, texto: 'Cante a nota mais aguda' })),
        t('Agora cante a nota do meio de cada acorde (sem ir para a de cima)', 4, acordes('C:4 F:4 G:4 C:4', 60, { repeticoes: 4, texto: 'Cante a nota do meio' })),
        t('Terças em "Lu": a base do canto a duas vozes', 4, voc('terca', 'Lu', 60, 65, 'subir-descer', 80)),
        t('Cante sozinho a sua voz da música do coral desta semana, depois junto com a gravação do ensaio.', 4)
      ]]
    ]),

    // ======================= TECLADO =======================
    curso('Teclado', 'Teclado', [
      ['Conhecendo o teclado', 'Iniciante', 'Comece devagar. Aqui o que importa é a posição da mão, não a velocidade.', [
        t('Postura: cotovelos na altura das teclas, punho reto e dedos curvados, como se segurasse uma laranja.', 3),
        t('Dedos: polegar 1, indicador 2, médio 3, anelar 4, mínimo 5 (nas duas mãos).', 2),
        t('Ache todos os Dós: o Dó fica logo à esquerda do grupo de 2 teclas pretas. Depois toque Ré, Mi, Fá, Sol, Lá e Si.', 4, teclado(48, 72)),
        t('Mão direita de Dó a Sol: dedos 1-2-3-4-5-4-3-2-1', 5, demo(seq(CINCO, 1, 2), 60, 70, 'Mão direita: dedos 1-2-3-4-5-4-3-2-1', { repeticoes: 4 })),
        t('Mão esquerda de Dó a Sol: dedos 5-4-3-2-1-2-3-4-5', 5, demo(seq(CINCO, 1, 2), 48, 70, 'Mão esquerda: dedos 5-4-3-2-1-2-3-4-5', { repeticoes: 4 }))
      ]],
      ['Escala de Dó maior', 'Iniciante', 'Suba o andamento de 4 em 4 bpm quando conseguir tocar 3 vezes seguidas sem erro.', [
        t('Mão direita: 1-2-3-1-2-3-4-5 subindo e 5-4-3-2-1-3-2-1 descendo', 6, demo(seq(MAIOR, 1, 2), 60, 66, 'Mão direita: 1-2-3, polegar passa, 1-2-3-4-5', { repeticoes: 2 })),
        t('Mão esquerda: 5-4-3-2-1-3-2-1 subindo e 1-2-3-1-2-3-4-5 descendo', 6, demo(seq(MAIOR, 1, 2), 48, 66, 'Mão esquerda: 5-4-3-2-1, o dedo 3 cruza, 3-2-1', { repeticoes: 2 })),
        t('Passagem do polegar: só Mi-Fá (mão direita), 10 vezes, sem levantar o punho.', 3),
        t('Escala com metrônomo: uma nota por clique, mãos separadas', 4, metronomo(72, 4, 'Uma nota por clique', 16))
      ]],
      ['Acordes maiores: C, F e G', 'Iniciante', 'Acorde maior = 1ª, 3ª e 5ª notas da escala. Dó maior (C) = Dó, Mi e Sol, com os dedos 1-3-5.', [
        t('Veja e ouça as notas de cada acorde', 4, acordes('C:4 F:4 G:4 C:4', 60, { repeticoes: 2 })),
        t('Troque de acorde no tempo 1 e segure até o próximo', 6, acordes('C:4 F:4 C:4 G:4', 70, { repeticoes: 4, texto: 'Mão direita faz o acorde no tempo 1' })),
        t('Agora toque o acorde em todos os 4 tempos', 5, acordes('C:4 F:4 G:4 C:4', 76, { repeticoes: 4, texto: 'Acorde em cada tempo: 1 2 3 4' })),
        t('Desafio: troque de acorde sem olhar para a mão.', 3)
      ]],
      ['Acordes menores e a progressão mais usada', 'Iniciante', 'Acorde menor: abaixe meio tom a nota do meio (a 3ª). C → Cm. Lá menor (Am) = Lá, Dó e Mi.', [
        t('Conheça Am, Dm e Em', 4, acordes('Am:4 Dm:4 Em:4 Am:4', 60, { repeticoes: 2 })),
        t('C - G - Am - F: a progressão de milhares de músicas', 8, acordes('C:4 G:4 Am:4 F:4', 72, { repeticoes: 4, texto: 'I - V - vi - IV' })),
        t('A mesma ideia começando no menor: Am - F - C - G', 5, acordes('Am:4 F:4 C:4 G:4', 72, { repeticoes: 4 }))
      ]],
      ['Mão esquerda no baixo', 'Iniciante', 'A mão esquerda toca só a nota que dá nome ao acorde (o baixo). A direita faz o acorde.', [
        t('Baixo e acorde juntos no tempo 1', 8, acordes('C:4 G:4 Am:4 F:4', 66, { repeticoes: 4, texto: 'Esquerda: baixo. Direita: acorde. Os dois no tempo 1' })),
        t('Agora trocando a cada 2 tempos', 6, acordes('C:2 G:2 Am:2 F:2', 72, { repeticoes: 6 })),
        t('Grave um vídeo curto tocando e poste na Comunidade.', 2)
      ]],
      ['Levadas e ritmo', 'Intermediário', 'Ritmo é o que faz o acompanhamento soar como música. Conte em voz alta.', [
        t('Semínimas: acorde de C em cada tempo', 3, metronomo(70, 4, 'Acorde em cada tempo: 1 2 3 4', 16)),
        t('Colcheias: acorde duas vezes por tempo (1 e 2 e 3 e 4 e)', 4, metronomo(70, 4, 'Duas vezes por clique: 1 e 2 e 3 e 4 e', 16)),
        t('Levada pop: baixo no 1 e no 3, acorde no 2 e no 4', 4, metronomo(80, 4, 'Baixo no 1 e 3 · Acorde no 2 e 4', 16)),
        t('Levada pop na progressão', 8, acordes('C:4 G:4 Am:4 F:4', 80, { repeticoes: 4, texto: 'Baixo no 1 e 3 · Acorde no 2 e 4' }))
      ]],
      ['Inversões', 'Intermediário', 'Inversão é o mesmo acorde com as notas em outra ordem. Serve para a mão quase não sair do lugar.', [
        t('C na posição fundamental, 1ª e 2ª inversão', 4, acordes([['C', 4, [48, 60, 64, 67]], ['C (1ª inv.)', 4, [48, 64, 67, 72]], ['C (2ª inv.)', 4, [48, 67, 72, 76]]], 60, { repeticoes: 2 })),
        t('C - F - G - C com a mão direita parada no lugar', 6, acordes([['C', 4, [48, 60, 64, 67]], ['F/C', 4, [41, 60, 65, 69]], ['G/B', 4, [43, 59, 62, 67]], ['C', 4, [48, 60, 64, 67]]], 66, { repeticoes: 4, texto: 'Mão direita quase não se mexe' })),
        t('C - Am - F - G escolhendo a inversão mais perto do acorde anterior', 6, acordes('C:4 Am:4 F:4 G:4', 72, { repeticoes: 4 }))
      ]],
      ['Campo harmônico e primeira música', 'Intermediário', 'Campo harmônico de Dó: C, Dm, Em, F, G, Am e Bdim. São os acordes que combinam no tom de Dó.', [
        t('Ouça os 7 acordes do campo harmônico de Dó', 4, acordes('C:2 Dm:2 Em:2 F:2 G:2 Am:2 Bdim:2 C:4', 60, { repeticoes: 2 })),
        t('I - vi - ii - V', 5, acordes('C:4 Am:4 Dm:4 G:4', 76, { repeticoes: 4 })),
        t('IV - V - iii - vi', 5, acordes('F:4 G:4 Em:4 Am:4', 76, { repeticoes: 4 })),
        t('Escolha uma música que use C, G, Am e F (muitos louvores e músicas pop usam) e toque inteira com a levada da aula 6.', 8)
      ]]
    ]),

    // ======================= PIANO =======================
    curso('Piano', 'Piano', [
      ['Postura e o Dó central', 'Iniciante', 'Banco na altura em que o antebraço fica reto. Ombros soltos, dedos curvados.', [
        t('Postura: sente na metade do banco, pés no chão, cotovelos um pouco à frente do corpo.', 3),
        t('Dó central (Dó4): fica no meio do piano, à esquerda das 2 teclas pretas. Toque-o e ache os outros Dós.', 3, teclado(48, 72)),
        t('Mão direita na posição de Dó, legato', 5, demo(seq(CINCO, 1, 2), 60, 60, 'Mão direita: dedos 1-2-3-4-5-4-3-2-1, uma nota ligada na outra', { repeticoes: 4 })),
        t('Mão esquerda na posição de Dó', 5, demo(seq(CINCO, 1, 2), 48, 60, 'Mão esquerda: dedos 5-4-3-2-1-2-3-4-5', { repeticoes: 4 })),
        t('Entre um exercício e outro, solte os braços ao lado do corpo e respire.', 1)
      ]],
      ['Leitura: clave de sol e ritmo', 'Iniciante', 'Ler partitura é como ler um texto: devagar no começo, depois fica natural.', [
        t('Clave de sol: o Sol fica na 2ª linha. Linhas: Mi-Sol-Si-Ré-Fá. Espaços: Fá-Lá-Dó-Mi. O Dó central fica numa linha suplementar abaixo da pauta.', 4),
        t('Figuras: semibreve = 4 tempos, mínima = 2, semínima = 1, colcheia = meio tempo.', 3),
        t('Bata palmas: uma semibreve (segure 4), duas mínimas, quatro semínimas', 4, metronomo(60, 4, 'Palmas: 1 semibreve → 2 mínimas → 4 semínimas', 12)),
        t('Leia e toque "Dó-ré-mi-fá" (mão direita na posição de Dó)', 5, demo(DO_RE_MI_FA, 60, 80, 'Dó-ré-mi-fá, fá-fá…', { repeticoes: 2 }))
      ]],
      ['Clave de fá e mão esquerda', 'Iniciante', 'A clave de fá é a da mão esquerda. Com ela você lê os graves.', [
        t('Clave de fá: o Fá fica na 4ª linha. Linhas: Sol-Si-Ré-Fá-Lá. Espaços: Lá-Dó-Mi-Sol.', 4),
        t('Ache no piano as notas das linhas da clave de fá: Sol2, Si2, Ré3, Fá3 e Lá3', 3, teclado(36, 60)),
        t('Mão esquerda na posição de Dó, 5-4-3-2-1-2-3-4-5', 5, demo(seq(CINCO, 1, 2), 48, 60, 'Mão esquerda: 5-4-3-2-1-2-3-4-5', { repeticoes: 3 })),
        t('"Dó-ré-mi-fá" com a mão esquerda', 5, demo(DO_RE_MI_FA, 48, 76, 'Mão esquerda, dedos começando no 5', { repeticoes: 2 }))
      ]],
      ['Mãos juntas', 'Iniciante', 'Primeiro movimento paralelo (as mãos vão para o mesmo lado), depois contrário (as mãos se abrem).', [
        t('Movimento paralelo: esquerda 5-4-3-2-1, direita 1-2-3-4-5', 5, acordes(pares([0, 2, 4, 5, 7, 5, 4, 2, 0], 48, 60), 60, { repeticoes: 3, texto: 'Mãos juntas, uma oitava de distância' })),
        t('Movimento contrário: os polegares começam juntos no Dó e as mãos se abrem', 5, acordes([['Dó / Dó', 1, [48, 60]], ['Si / Ré', 1, [47, 62]], ['Lá / Mi', 1, [45, 64]], ['Sol / Fá', 1, [43, 65]], ['Fá / Sol', 2, [41, 67]], ['Sol / Fá', 1, [43, 65]], ['Lá / Mi', 1, [45, 64]], ['Si / Ré', 1, [47, 62]], ['Dó / Dó', 2, [48, 60]]], 60, { repeticoes: 3 })),
        t('Toque "Dó-ré-mi-fá" com as duas mãos ao mesmo tempo, uma oitava de distância.', 4)
      ]],
      ['Escala de Dó com passagem do polegar', 'Intermediário', 'O polegar passa por baixo da mão sem levantar o punho. Devagar e igual.', [
        t('Mão direita: 1-2-3-1-2-3-4-5 subindo, 5-4-3-2-1-3-2-1 descendo', 6, demo(seq(MAIOR, 1, 2), 60, 60, 'Mão direita: 1-2-3, polegar passa, 1-2-3-4-5', { repeticoes: 2 })),
        t('Mão esquerda: 5-4-3-2-1-3-2-1 subindo, 1-2-3-1-2-3-4-5 descendo', 6, demo(seq(MAIOR, 1, 2), 48, 60, 'Mão esquerda: 5-4-3-2-1, o dedo 3 cruza, 3-2-1', { repeticoes: 2 })),
        t('Mãos juntas, uma oitava de distância', 6, acordes(pares(MAIOR, 48, 60), 56, { repeticoes: 2, texto: 'Mãos juntas' }))
      ]],
      ['Escalas de Sol e Fá maior', 'Intermediário', 'Sol maior tem um sustenido (Fá♯). Fá maior tem um bemol (Si♭).', [
        t('Sol maior, mão direita: 1-2-3-1-2-3-4-5 (igual a Dó)', 5, demo(seq(MAIOR, 1, 2), 67, 60, 'Sol maior: não esqueça o Fá♯', { repeticoes: 2 })),
        t('Fá maior, mão direita: 1-2-3-4-1-2-3-4 (o polegar passa depois do Si♭)', 5, demo(seq(MAIOR, 1, 2), 65, 60, 'Fá maior: Si♭ com o dedo 4', { repeticoes: 2 })),
        t('Sol maior, mão esquerda: 5-4-3-2-1-3-2-1', 4, demo(seq(MAIOR, 1, 2), 43, 60, 'Mão esquerda em Sol maior', { repeticoes: 2 })),
        t('Fá maior, mão esquerda: 5-4-3-2-1-3-2-1', 4, demo(seq(MAIOR, 1, 2), 41, 60, 'Mão esquerda em Fá maior', { repeticoes: 2 }))
      ]],
      ['Dinâmica e articulação', 'Intermediário', 'Legato = notas ligadas. Staccato = notas curtas. p (piano) = fraco, f (forte) = forte.', [
        t('Staccato: solte cada tecla rápido, com o punho leve', 4, demo(curto(CINCO), 60, 80, 'Staccato: curto e leve', { repeticoes: 3 })),
        t('Legato com crescendo: comece fraco (p) e chegue forte (f) no Dó de cima', 4, demo(seq(MAIOR, 1, 2), 60, 60, 'Cresça até o Dó de cima e diminua na volta', { repeticoes: 2 })),
        t('Toque "Dó-ré-mi-fá" duas vezes: uma piano (fraco) e uma forte.', 4, demo(DO_RE_MI_FA, 60, 80, '1ª vez piano, 2ª vez forte', { repeticoes: 2 }))
      ]],
      ['Arpejos, cadência e primeira peça', 'Intermediário', 'Esta aula fecha o básico: arpejo, a cadência mais usada da música e uma peça de verdade.', [
        t('Arpejo de Dó maior, mão direita: 1-2-3-5-3-2-1', 4, demo(seq([0, 4, 7, 12, 7, 4, 0], 1, 2), 60, 72, 'Mão direita: 1-2-3-5-3-2-1', { repeticoes: 4 })),
        t('Cadência I - IV - V - I: mão esquerda no baixo, direita nos acordes', 5, acordes([['C', 4, [48, 60, 64, 67]], ['F', 4, [41, 60, 65, 69]], ['G', 4, [43, 59, 62, 67]], ['C', 4, [48, 60, 64, 67]]], 60, { repeticoes: 4 })),
        t('Ode à Alegria (Beethoven), mão direita na posição de Dó', 8, demo(ODE, 60, 90, 'Ode à Alegria: comece no Mi com o dedo 3', { repeticoes: 2 })),
        t('Grave a Ode à Alegria e poste na Comunidade.', 3)
      ]]
    ]),

    // ======================= VIOLÃO =======================
    curso('Violão', 'Violão', [
      ['Conhecendo o violão e afinação', 'Iniciante', 'Unhas da mão esquerda curtas. Aperte a corda perto do traste, não em cima dele.', [
        t('Cordas: da mais fina (1ª, Mi) para a mais grossa (6ª, Mi grave). Postura: violão na perna, polegar da mão esquerda atrás do braço.', 3),
        t('Afinação: ouça cada nota e afine a corda até soar igual', 5, demo(AFINACAO, 40, 60, 'Afine cada corda até soar igual à nota de referência', { repeticoes: 2, semPiano: true })),
        t('Mão direita: polegar (p) nas cordas 6, 5 e 4; indicador (i), médio (m) e anelar (a) nas cordas 3, 2 e 1', 5, demo([[0, 1, 'p · 6ª corda'], [5, 1, 'p · 5ª corda'], [10, 1, 'p · 4ª corda'], [15, 1, 'i · 3ª corda'], [19, 1, 'm · 2ª corda'], [24, 1, 'a · 1ª corda']], 40, 60, 'Uma corda solta por tempo', { repeticoes: 4, semPiano: true }))
      ]],
      ['Primeiros acordes: Em e Am', 'Iniciante', 'No braço da tela, as linhas deitadas são as cordas (Mi grave embaixo). Bolinha com número = dedo que aperta; × = não toca; ○ = corda solta; pontilhado = próximo acorde.', [
        t('Troque entre Em e Am', 6, acordes('Em:4 Am:4', 60, { braco: true, repeticoes: 4 })),
        t('Toque corda por corda: todas precisam soar limpas. Se alguma abafar, ajuste o dedo.', 3),
        t('Mais rápido, sem parar antes do tempo 1', 5, acordes('Em:4 Am:4', 76, { braco: true, repeticoes: 6 }))
      ]],
      ['Acordes D, A e E', 'Iniciante', 'Dica: quando dois acordes têm um dedo no mesmo lugar, deixe esse dedo parado na troca.', [
        t('D e A', 5, acordes('D:4 A:4', 60, { braco: true, repeticoes: 4 })),
        t('A e E', 5, acordes('A:4 E:4', 60, { braco: true, repeticoes: 4 })),
        t('E - A - D - A', 6, acordes('E:4 A:4 D:4 A:4', 66, { braco: true, repeticoes: 4 }))
      ]],
      ['G e C: a primeira progressão', 'Iniciante', 'G e C são os acordes mais usados do violão popular. Vale cada minuto de treino.', [
        t('G e C', 5, acordes('G:4 C:4', 60, { braco: true, repeticoes: 4 })),
        t('G - D - C - G', 6, acordes('G:4 D:4 C:4 G:4', 66, { braco: true, repeticoes: 4 })),
        t('G - Em - C - D', 6, acordes('G:4 Em:4 C:4 D:4', 72, { braco: true, repeticoes: 4 })),
        t('Desafio: troque de G para C em menos de 1 tempo.', 2)
      ]],
      ['Ritmo: batidas', 'Iniciante', '↓ = para baixo, ↑ = para cima. A mão direita nunca para: sobe e desce o tempo todo, mesmo quando não toca a corda.', [
        t('Uma batida para baixo em cada tempo', 3, metronomo(70, 4, '↓ ↓ ↓ ↓', 16)),
        t('Colcheias: para baixo no número, para cima no "e"', 4, metronomo(70, 4, '↓↑ ↓↑ ↓↑ ↓↑', 16)),
        t('Levada pop: ↓ ↓↑ ↑↓↑', 5, metronomo(80, 4, '↓ · ↓↑ · ↑↓↑ (1 · 2 e · e 4 e)', 16)),
        t('Levada pop na progressão', 6, acordes('G:4 D:4 Em:4 C:4', 80, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' }))
      ]],
      ['Dedilhado', 'Intermediário', 'p = polegar, i = indicador, m = médio, a = anelar. O polegar toca o baixo (a corda que dá nome ao acorde).', [
        t('Am e E com dedilhado p-i-m-a', 6, acordes('Am:4 E:4', 60, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a'], texto: 'Uma nota por tempo: p · i · m · a' })),
        t('C - G - Am - Em com dedilhado p-i-m-a', 6, acordes('C:4 G:4 Am:4 Em:4', 66, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a'], texto: 'p · i · m · a' })),
        t('Variação p-i-m-a-m-i, duas notas por tempo (compasso de 3)', 5, acordes('C:3 Am:3 Em:3 G:3', 60, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a', 'm', 'i'], passo: 0.5, texto: 'p · i · m · a · m · i' }))
      ]],
      ['Acordes com sétima', 'Intermediário', 'O acorde com sétima (7) cria tensão e pede para resolver no próximo acorde.', [
        t('Conheça A7, D7, E7 e B7', 4, acordes('A7:4 D7:4 E7:4 B7:4', 60, { braco: true, repeticoes: 2 })),
        t('Em - Am - B7 - Em', 6, acordes('Em:4 Am:4 B7:4 Em:4', 70, { braco: true, repeticoes: 4 })),
        t('A - A7 - D - E7', 6, acordes('A:4 A7:4 D:4 E7:4', 70, { braco: true, repeticoes: 4 }))
      ]],
      ['Pestana e primeira música', 'Intermediário', 'Pestana: o dedo 1 deitado aperta várias cordas. No começo cansa; pare quando doer.', [
        t('F com pestana e C', 5, acordes('F:4 C:4', 56, { braco: true, repeticoes: 4, texto: 'Dedo 1 reto, perto do traste' })),
        t('Campo harmônico de Sol: G - Em - Bm - C - D', 6, acordes('G:4 Em:4 Bm:4 C:4 D:4', 72, { braco: true, repeticoes: 3 })),
        t('C - G - Am - F com a levada pop', 6, acordes('C:4 G:4 Am:4 F:4', 76, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' })),
        t('Escolha uma música com G, D, Em e C e toque inteira com a levada pop. Poste na Comunidade!', 4)
      ]]
    ]),

    // ======================= GUITARRA =======================
    curso('Guitarra', 'Guitarra', [
      ['Guitarra, afinação e palheta', 'Iniciante', 'Segure a palheta entre o polegar e a lateral do indicador, com só a pontinha para fora.', [
        t('Afinação: ouça cada nota e afine a corda até soar igual', 4, demo(AFINACAO, 40, 60, 'Afine cada corda até soar igual à nota de referência', { repeticoes: 2, semPiano: true })),
        t('Palhetada alternada na 6ª corda solta: ↓ no tempo, ↑ no "e"', 4, metronomo(60, 4, '↓↑ ↓↑ ↓↑ ↓↑', 16)),
        t('A mesma coisa em todas as cordas, um compasso em cada', 4, metronomo(80, 4, 'Um compasso por corda: 6, 5, 4, 3, 2, 1', 24))
      ]],
      ['Exercício cromático', 'Iniciante', 'Um dedo por casa: dedo 1 na casa 1, dedo 2 na 2, dedo 3 na 3, dedo 4 na 4.', [
        t('1-2-3-4 em cada corda, da 6ª até a 1ª, e volte', 6, demo(seq(ARANHA, 1, 2), 40, 60, 'Um dedo por casa, palhetada alternada', { semPiano: true, casaBase: 1 })),
        t('Agora em colcheias (duas notas por clique)', 6, demo(seq(ARANHA, 0.5, 1), 40, 80, 'Duas notas por clique', { semPiano: true, casaBase: 1 })),
        t('Suba 4 bpm quando sair limpo 3 vezes. Não aperte as cordas mais do que precisa.', 1)
      ]],
      ['Power chords', 'Iniciante', 'Power chord = tônica + quinta. Duas ou três cordas, som de rock. O desenho se move pelo braço.', [
        t('Desenho na 6ª corda: E5 - G5 - A5', 6, acordes('E5:4 G5:4 A5:4', 70, { braco: true, repeticoes: 4 })),
        t('Desenho na 5ª corda: A5 - C5 - D5', 6, acordes('A5:4 C5:4 D5:4', 70, { braco: true, repeticoes: 4 })),
        t('Riff: troca a cada 2 tempos', 5, acordes('E5:2 G5:2 A5:2 C5:2', 90, { braco: true, repeticoes: 4 }))
      ]],
      ['Pentatônica menor de Lá', 'Intermediário', 'A escala mais usada no rock e no blues: Lá, Dó, Ré, Mi e Sol. A posição 1 começa na 5ª casa.', [
        t('Uma nota por clique, palhetada alternada', 8, demo(seq(PENTA_NOTAS, 1, 2), 45, 60, 'Siga o desenho no braço', { repeticoes: 2, semPiano: true, diagrama: PENTA })),
        t('Mais rápido, em colcheias', 6, demo(seq(PENTA_NOTAS, 0.5, 1), 45, 80, 'Duas notas por tempo', { repeticoes: 2, semPiano: true, diagrama: PENTA }))
      ]],
      ['Palm mute e ritmo', 'Intermediário', 'Palm mute: encoste a lateral da mão direita nas cordas, perto da ponte. O som fica abafado e pesado.', [
        t('Colcheias com palm mute na 6ª corda solta', 4, metronomo(90, 4, '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ (duas por clique)', 16)),
        t('Palm mute nos power chords, só palhetada para baixo', 6, acordes('E5:4 G5:4 A5:4 E5:4', 100, { braco: true, repeticoes: 4, texto: 'Colcheias, só ↓' }))
      ]],
      ['Acordes abertos para base', 'Intermediário', 'Guitarra base também usa os acordes abertos do violão. Toque com palheta.', [
        t('E - A - D - A', 6, acordes('E:4 A:4 D:4 A:4', 70, { braco: true, repeticoes: 4 })),
        t('G - C - D - G', 6, acordes('G:4 C:4 D:4 G:4', 70, { braco: true, repeticoes: 4 })),
        t('Em - C - G - D com levada', 6, acordes('Em:4 C:4 G:4 D:4', 80, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' }))
      ]],
      ['Ligados e bends', 'Intermediário', 'Hammer-on: toque a nota e martele outro dedo mais à frente, sem palhetar. Pull-off: o contrário, puxe o dedo para soar a nota de trás.', [
        t('Na pentatônica: palhete a 1ª nota de cada corda e faça hammer-on na 2ª', 4, demo(seq(PENTA_NOTAS, 1, 2), 45, 60, 'Palheta só na 1ª nota de cada corda', { semPiano: true, diagrama: PENTA })),
        t('Bend: 3ª corda, casa 7. Empurre a corda para cima até soar como a casa 9 (use os dedos 2 e 3 juntos).', 3),
        t('Ouça o alvo do bend e tente chegar nele', 4, demo([[2, 2, 'Alvo: casa 9'], [0, 2, 'Casa 7'], [2, 4, 'Agora faça o bend até aqui']], 62, 60, 'Compare o bend com o alvo', { repeticoes: 4, semPiano: true, diagrama: { nome: 'Bend na 3ª corda', inicio: 7, pontos: [[3, 7, 3], [3, 9, 3]] } }))
      ]],
      ['Primeiro improviso', 'Intermediário', 'Use a pentatônica de Lá sobre a base. Poucas notas, frases curtas e respire entre elas.', [
        t('Base para improvisar: Am - G - F - G', 10, acordes('Am:4 G:4 F:4 G:4', 80, { repeticoes: 8, semPiano: true, diagrama: PENTA, texto: 'Improvise com a pentatônica de Lá' })),
        t('Grave seu improviso e poste na Comunidade.', 3)
      ]]
    ]),

    // ======================= CONCURSO =======================
    curso('Concurso', 'Teoria', [
      ['Notas, pauta e claves', 'Iniciante', 'Base de toda prova de música: ler as notas nas claves sem precisar contar linha por linha.', [
        t('As 7 notas: Dó, Ré, Mi, Fá, Sol, Lá, Si. Em cifra: C, D, E, F, G, A, B.', 2),
        t('Toque e diga em voz alta o nome de cada nota', 3, teclado(48, 72)),
        t('Clave de sol: Sol na 2ª linha. Clave de fá: Fá na 4ª linha. Clave de dó: Dó na linha em que ela está.', 4),
        t('Escreva no caderno as notas das linhas e dos espaços nas claves de sol e de fá. Confira na próxima aula.', 6)
      ]],
      ['Ritmo, figuras e compassos', 'Iniciante', 'Conte sempre em voz alta. Em prova, ritmo errado tira tanto ponto quanto nota errada.', [
        t('Figuras: semibreve 4, mínima 2, semínima 1, colcheia 1/2, semicolcheia 1/4. O ponto de aumento soma metade do valor.', 4),
        t('Compasso binário (2/4): FORTE-fraco', 3, metronomo(60, 2, 'Bata palmas e conte: 1 2', 16)),
        t('Compasso ternário (3/4): FORTE-fraco-fraco (valsa)', 3, metronomo(72, 3, 'Conte: 1 2 3', 16)),
        t('Compasso quaternário (4/4): FORTE-fraco-meio forte-fraco', 3, metronomo(72, 4, 'Conte: 1 2 3 4', 16)),
        t('Solfejo rítmico: leia a lição de ritmo da apostila falando "tá" em cada nota, com metrônomo.', 5)
      ]],
      ['Intervalos', 'Intermediário', 'Intervalo é a distância entre duas notas. Conte as notas incluindo a primeira e a última: Dó-Mi = 3ª.', [
        t('Intervalos maiores e justos a partir de Dó', 5, demo([[0, 1, 'Dó'], [2, 2, '2ª maior'], [0, 1, 'Dó'], [4, 2, '3ª maior'], [0, 1, 'Dó'], [5, 2, '4ª justa'], [0, 1, 'Dó'], [7, 2, '5ª justa'], [0, 1, 'Dó'], [9, 2, '6ª maior'], [0, 1, 'Dó'], [11, 2, '7ª maior'], [0, 1, 'Dó'], [12, 2, '8ª justa']], 60, 72, 'Ouça e cante cada intervalo')),
        t('Intervalos menores e o trítono', 4, demo([[0, 1, 'Dó'], [1, 2, '2ª menor'], [0, 1, 'Dó'], [3, 2, '3ª menor'], [0, 1, 'Dó'], [6, 2, '4ª aumentada (trítono)'], [0, 1, 'Dó'], [8, 2, '6ª menor'], [0, 1, 'Dó'], [10, 2, '7ª menor']], 60, 72, 'Compare com os maiores')),
        t('Para lembrar: 2ª maior = "Pa-ra-béns"; 5ª justa = tema de Star Wars; 8ª = "Somewhere over the rainbow".', 3)
      ]],
      ['Escalas maiores e armaduras', 'Intermediário', 'Escala maior: tom - tom - semitom - tom - tom - tom - semitom.', [
        t('Escala de Dó maior: ouça os semitons entre Mi-Fá e Si-Dó', 3, demo(seq(MAIOR, 1, 2), 60, 72, 'Semitons: Mi-Fá e Si-Dó')),
        t('Ciclo das quintas. Sustenidos entram na ordem Fá-Dó-Sol-Ré-Lá-Mi-Si (G = 1♯, D = 2♯, A = 3♯, E = 4♯). Bemóis: Si-Mi-Lá-Ré-Sol-Dó-Fá (F = 1♭, B♭ = 2♭, E♭ = 3♭, A♭ = 4♭).', 5),
        t('Sol maior: um sustenido (Fá♯)', 3, demo(seq(MAIOR, 1, 2), 67, 72, 'Ouça o Fá♯')),
        t('Escreva as escalas de Ré, Lá, Fá e Si♭ maior com a armadura de clave.', 6)
      ]],
      ['Escalas menores', 'Intermediário', 'Toda escala maior tem uma relativa menor, uma 3ª menor abaixo: Dó maior → Lá menor.', [
        t('Menor natural: T-S-T-T-S-T-T', 3, demo(seq([0, 2, 3, 5, 7, 8, 10, 12, 10, 8, 7, 5, 3, 2, 0], 1, 2), 57, 72, 'Lá menor natural')),
        t('Menor harmônica: 7º grau elevado (sensível)', 3, demo(seq([0, 2, 3, 5, 7, 8, 11, 12, 11, 8, 7, 5, 3, 2, 0], 1, 2), 57, 72, 'Lá menor harmônica: Sol♯')),
        t('Menor melódica: 6º e 7º elevados subindo, natural descendo', 3, demo(seq([0, 2, 3, 5, 7, 9, 11, 12, 10, 8, 7, 5, 3, 2, 0], 1, 2), 57, 72, 'Lá menor melódica: Fá♯ e Sol♯ na subida')),
        t('Escreva as relativas menores de Sol, Fá e Ré maior, nas três formas.', 5)
      ]],
      ['Tríades e tétrades', 'Intermediário', 'Tríade = 3 notas empilhadas em terças. Tétrade = tríade + 7ª.', [
        t('Tríades: maior (3M + 3m), menor (3m + 3M), diminuta (3m + 3m) e aumentada (3M + 3M)', 4, acordes('C:4 Cm:4 Cdim:4 Caug:4', 56, { repeticoes: 2 })),
        t('Tétrades: C7M, C7, Cm7 e Cm7(b5)', 4, acordes('C7M:4 C7:4 Cm7:4 Cm7(b5):4', 56, { repeticoes: 2 })),
        t('Percepção: toque as tríades em ordem aleatória de olhos fechados (ou peça para alguém tocar) e diga qual é.', 4)
      ]],
      ['Campo harmônico e funções', 'Intermediário', 'Funções: tônica (I, iii, vi) = repouso; subdominante (IV, ii) = afastamento; dominante (V, vii°) = tensão que pede a tônica.', [
        t('Campo harmônico de Dó: C, Dm, Em, F, G, Am e Bdim', 3, acordes('C:2 Dm:2 Em:2 F:2 G:2 Am:2 Bdim:2 C:4', 60, { repeticoes: 2 })),
        t('Com tétrades: C7M, Dm7, Em7, F7M, G7, Am7 e Bm7(b5)', 3, acordes('C7M:2 Dm7:2 Em7:2 F7M:2 G7:2 Am7:2 Bm7(b5):2 C7M:4', 60, { repeticoes: 2 })),
        t('T - S - D - T: sinta a tensão do G7 resolvendo no C', 3, acordes('C:4 F:4 G7:4 C:4', 60, { repeticoes: 3 })),
        t('Monte o campo harmônico de Sol e de Fá maior, com as tétrades.', 6)
      ]],
      ['Percepção e simulado', 'Avançado', 'Ditado: ouça quantas vezes precisar e escreva no caderno. Só depois confira o gabarito no fim da aula.', [
        t('Ditado melódico 1 (começa em Dó)', 5, demo([[0, 1], [4, 1], [2, 1], [5, 1], [4, 1], [7, 2], [null, 4]], 60, 66, 'Ouça e escreva as notas', { repeticoes: 3, ocultar: true })),
        t('Ditado melódico 2 (começa em Dó)', 5, demo([[0, 1], [7, 1], [5, 1], [4, 1], [2, 1], [4, 1], [0, 2], [null, 4]], 60, 66, 'Ouça e escreva as notas', { repeticoes: 3, ocultar: true })),
        t('Ditado harmônico: diga se cada acorde é I, IV, V ou vi (tom de Dó)', 5, acordes('C:4 Am:4 F:4 G:4 C:4', 60, { repeticoes: 3, ocultar: true })),
        t('Simulado: questões de teoria da apostila em 30 minutos, sem consulta. Corrija com o professor.', 30),
        t('Gabarito (confira só depois!): ditado 1 = Dó-Mi-Ré-Fá-Mi-Sol; ditado 2 = Dó-Sol-Fá-Mi-Ré-Mi-Dó; ditado harmônico = I - vi - IV - V - I.', 2)
      ]]
    ])
  ];

  window.AmaralCursos = CURSOS;
})();

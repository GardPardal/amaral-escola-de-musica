// Cursos básicos prontos da Amaral Escola de Música, em módulos de 4 aulas. Cada módulo termina com uma prova de teoria
// e toda aula tem um exercício de leitura de partitura.
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
  var MENOR_NAT = [0, 2, 3, 5, 7, 8, 10, 12, 10, 8, 7, 5, 3, 2, 0];
  var MENOR_HAR = [0, 2, 3, 5, 7, 8, 11, 12, 11, 8, 7, 5, 3, 2, 0];
  var ARP = [0, 4, 7, 12, 7, 4, 0], ARPm = [0, 3, 7, 12, 7, 3, 0];
  var ARP2 = [0, 4, 7, 12, 16, 19, 24, 19, 16, 12, 7, 4, 0], ARP2m = [0, 3, 7, 12, 15, 19, 24, 19, 15, 12, 7, 3, 0];
  var BLUES = [0, 3, 5, 6, 7, 10, 12, 10, 7, 6, 5, 3, 0];
  // Digitação (dedos de cada nota, na ordem). D = mão direita, E = mão esquerda.
  var D5 = '1 2 3 4 5 4 3 2 1', E5 = '5 4 3 2 1 2 3 4 5';
  var D_ESC = '1 2 3 1 2 3 4 5 4 3 2 1 3 2 1', E_ESC = '5 4 3 2 1 3 2 1 2 3 1 2 3 4 5';
  var D_FA = '1 2 3 4 1 2 3 4 3 2 1 4 3 2 1';
  var D_ARP = '1 2 3 5 3 2 1', E_ARP = '5 4 2 1 2 4 5';
  var D_ARP2 = '1 2 3 1 2 3 5 3 2 1 3 2 1', E_ARP2 = '5 4 2 1 4 2 1 2 4 1 2 4 5';
  var D_BLUES = '1 2 1 2 3 4 5 4 3 2 1 2 1';
  function repete(lista, n) { var r = []; for (var i = 0; i < n; i++) r = r.concat(lista); return r; }
  function dedosRep(txt, n) { return repete([txt], n).join(' '); }
  // exercício com as duas mãos ao mesmo tempo: cada mão tem a sua nota de partida, o seu ritmo e os seus dedos
  function duas(esq, dir, bpm, instrucao, extra) {
    var v = { tipo: 'notas', demo: true, maos: { E: esq, D: dir }, de: esq.raiz, ate: esq.raiz, bpm: bpm, silaba: instrucao, repeticoes: 1 };
    Object.keys(extra || {}).forEach(function (k) { v[k] = extra[k]; });
    return v;
  }
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
  function metronomo(bpm, tempos, texto, compassos, batidas) {
    var v = { tipo: 'metronomo', bpm: bpm, tempos: tempos, texto: texto, compassos: compassos || 16 };
    if (batidas) v.batidas = batidas;
    return v;
  }
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
  var DO_RE_MI_FA = [[0, 1], [2, 1], [4, 1], [5, 1], [5, 2], [5, 2], [0, 1], [2, 1], [0, 1], [2, 1], [2, 2], [2, 2],
                     [0, 1], [7, 1], [5, 1], [4, 1], [4, 2], [4, 2], [0, 1], [2, 1], [4, 1], [5, 1], [5, 2], [5, 2]];
  function pares(semitons, baixo, alto, dedosE, dedosD) { // duas mãos, uma oitava de distância
    var n = ['Dó', 'Dó♯', 'Ré', 'Mi♭', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Lá♭', 'Lá', 'Si♭', 'Si'];
    var e = dedosE.split(' '), d = dedosD.split(' ');
    return semitons.map(function (s, i) { return [n[(s % 12 + 12) % 12], 1, [baixo + s, alto + s], 'E' + e[i] + ' D' + d[i]]; });
  }

  // ---------- Lições de partitura ----------
  // Cada aula começa com uma lição (explicação + exemplos na pauta + "Confira se entendeu") e termina com uma leitura
  // que usa só o que já foi ensinado. A prova do módulo cobra as lições e as aulas dele.
  // notas / notasFa: notas escritas que a lição ensina (entram nas questões de nome da nota e de casa no violão).
  // gera: questões sorteadas na prova. leitura: melodia em semitons a partir do Dó (C4 escrito).
  function ex(notas, extra) { var p = { clave: 'sol', notas: notas }; Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; }); return { pauta: p }; }
  function leg(bloco, legenda) { bloco.legenda = legenda; return bloco; }
  var NAT_SOL = [60, 62, 64, 65, 67, 69, 71, 72];
  var LICOES = {
    'pauta': { titulo: 'A pauta e a clave de sol', notas: [67, 69, 71, 72],
      blocos: ['A música se escreve na pauta (ou pentagrama): 5 linhas e 4 espaços. Contamos sempre de baixo para cima: a linha de baixo é a 1ª linha.',
        leg(ex([[64, 1, '1ª'], [67, 1, '2ª'], [71, 1, '3ª'], [74, 1, '4ª'], [77, 1, '5ª']]), 'As 5 linhas, contadas de baixo para cima.'),
        'A clave de sol fica no começo da pauta e se enrola na 2ª linha: a nota dessa linha se chama Sol. A partir dela achamos as outras, na ordem Dó, Ré, Mi, Fá, Sol, Lá, Si.',
        'Linha, espaço, linha, espaço: cada degrau é a nota seguinte. Quanto mais alta na pauta, mais aguda a nota.',
        leg(ex([[67, 1, 'Sol'], [69, 1, 'Lá'], [71, 1, 'Si'], [72, 1, 'Dó']]), 'Sol (2ª linha), Lá (2º espaço), Si (3ª linha) e Dó (3º espaço).')],
      confira: [['Quantas linhas tem a pauta?', '5', '4', '6', '7'], ['A clave de sol dá nome à nota de qual linha?', '2ª linha', '1ª linha', '3ª linha', '5ª linha'],
        ['Na pauta, contamos as linhas:', 'De baixo para cima', 'De cima para baixo', 'Da direita para a esquerda', 'Tanto faz'],
        ['Uma nota mais alta na pauta soa:', 'Mais aguda', 'Mais grave', 'Mais forte', 'Mais longa'], ['A nota no espaço logo acima do Sol é:', 'Lá', 'Fá', 'Si', 'Dó']],
      gera: [], leitura: { nome: 'Sol, Lá, Si e Dó (cada nota vale 1 tempo)', padrao: [[7, 1], [9, 1], [11, 1], [12, 1], [11, 1], [9, 1], [7, 1], [7, 1], [9, 1], [11, 1], [9, 1], [7, 1]] } },
    'figuras': { titulo: 'Figuras: quanto tempo dura cada nota',
      blocos: ['A forma da nota mostra quanto tempo ela dura. O tempo é o pulso da música, o clique do metrônomo.',
        leg(ex([[71, 4, '4 tempos'], [71, 2, '2 tempos'], [71, 1, '1 tempo']]), 'Semibreve, mínima e semínima.'),
        'Semibreve: bolinha vazia sem haste, vale 4 tempos. Mínima: bolinha vazia com haste, 2 tempos. Semínima: bolinha cheia com haste, 1 tempo.',
        'A haste pode subir ou descer: isso não muda o tempo. Notas do meio da pauta para cima têm a haste para baixo.'],
      confira: [['Quantos tempos vale a semibreve?', '4', '2', '1', '3'], ['Qual figura vale 2 tempos?', 'Mínima', 'Semínima', 'Semibreve', 'Colcheia'],
        ['A semínima é:', 'Bolinha cheia com haste', 'Bolinha vazia sem haste', 'Bolinha vazia com haste', 'Bolinha cheia sem haste'],
        ['A haste para baixo muda o tempo da nota?', 'Não, só depende da posição na pauta', 'Sim, dura o dobro', 'Sim, dura a metade', 'Sim, vira pausa']],
      gera: [{ tema: 'figura', valores: [4, 2, 1] }],
      leitura: { nome: 'Semínimas, mínimas e semibreve', padrao: [[7, 1], [9, 1], [11, 2], [12, 1], [11, 1], [9, 2], [7, 1], [9, 1], [11, 1], [9, 1], [7, 4]] } },
    'compasso': { titulo: 'Compasso, barra e a fórmula 4/4',
      blocos: ['As notas são agrupadas em compassos, separados pela barra de compasso. A barra dupla (fina e grossa) marca o fim da música.',
        'A fórmula de compasso fica no começo. No 4/4, o número de cima diz que cada compasso tem 4 tempos; o de baixo diz que a semínima vale 1 tempo.',
        leg(ex([[72, 2], [71, 1], [69, 1], [67, 2], [69, 2], [71, 1], [72, 1], [71, 1], [69, 1], [67, 4]], { compasso: 4 }), 'Três compassos de 4 tempos: some as figuras de cada um.'),
        'O 1º tempo de cada compasso é o tempo forte. Conte em voz alta: UM, dois, três, quatro.'],
      confira: [['O que separa um compasso do outro?', 'A barra de compasso', 'A clave', 'A haste', 'A pausa'], ['No compasso 4/4, quantos tempos tem cada compasso?', '4', '3', '2', '8'],
        ['Qual é o tempo forte do compasso?', 'O 1º', 'O 2º', 'O 3º', 'O último'], ['A barra dupla no fim da pauta indica:', 'O fim da música', 'Repetir tudo', 'Mudar de clave', 'Uma pausa longa']],
      gera: [{ tema: 'compasso', formulas: [4], valores: [4, 2, 1] }],
      leitura: { nome: 'Contando 1-2-3-4', padrao: [[12, 2], [11, 1], [9, 1], [7, 2], [9, 2], [11, 1], [12, 1], [11, 1], [9, 1], [7, 4]] } },
    'oitava': { titulo: 'Dó, Ré, Mi e Fá: a oitava completa', notas: [60, 62, 64, 65],
      blocos: ['Descendo do Sol: o 1º espaço é o Fá e a 1ª linha é o Mi. Logo abaixo da pauta fica o Ré.',
        'O Dó precisa de uma linha extra, curtinha: a linha suplementar. É o Dó central (no piano, o Dó do meio; no violão, a 5ª corda na casa 3).',
        leg(ex([[60, 1, 'Dó'], [62, 1, 'Ré'], [64, 1, 'Mi'], [65, 1, 'Fá'], [67, 1, 'Sol']]), 'Dó (linha suplementar), Ré, Mi (1ª linha), Fá (1º espaço) e Sol.'),
        'Agora você lê uma oitava inteira, do Dó ao Dó: Dó, Ré, Mi, Fá, Sol, Lá, Si, Dó.',
        leg(ex([[60, 1], [62, 1], [64, 1], [65, 1], [67, 1], [69, 1], [71, 1], [72, 1]]), 'A oitava de Dó.')],
      confira: [['O que é linha suplementar?', 'Uma linha curta para escrever notas fora da pauta', 'A 1ª linha da pauta', 'A barra de compasso', 'A linha da clave'],
        ['Qual nota fica na 1ª linha da clave de sol?', 'Mi', 'Fá', 'Ré', 'Sol'], ['Qual nota fica no 1º espaço?', 'Fá', 'Mi', 'Lá', 'Sol'],
        ['O Dó central fica:', 'Numa linha suplementar abaixo da pauta', 'Na 1ª linha', 'No 3º espaço', 'Na 5ª linha'], ['A nota logo abaixo da 1ª linha é:', 'Ré', 'Dó', 'Mi', 'Si']],
      gera: [], leitura: { nome: 'Brilha, brilha, estrelinha', padrao: [[0, 1], [0, 1], [7, 1], [7, 1], [9, 1], [9, 1], [7, 2], [5, 1], [5, 1], [4, 1], [4, 1], [2, 1], [2, 1], [0, 2]] } },
    'pausas': { titulo: 'Pausas: o silêncio também se conta',
      blocos: ['Cada figura tem uma pausa com o mesmo valor. Na pausa você não toca, mas continua contando os tempos.',
        leg(ex([[null, 4, '4 tempos'], [null, 2, '2 tempos'], [null, 1, '1 tempo']]), 'Pausas de semibreve, de mínima e de semínima.'),
        'Pausa de semibreve: retângulo pendurado embaixo da 4ª linha. Pausa de mínima: retângulo apoiado em cima da 3ª linha. Pausa de semínima: parece um raio.',
        leg(ex([[67, 1], [null, 1], [69, 1], [null, 1], [71, 2], [null, 2]], { compasso: 4 }), 'Toque, silêncio, toque, silêncio: conte todos os tempos.')],
      confira: [['O que fazemos numa pausa?', 'Ficamos em silêncio, mas contando', 'Tocamos mais forte', 'Paramos de contar', 'Repetimos a nota'],
        ['A pausa de mínima vale:', '2 tempos', '1 tempo', '4 tempos', 'meio tempo'], ['A pausa pendurada embaixo da 4ª linha é a de:', 'Semibreve', 'Mínima', 'Semínima', 'Colcheia'],
        ['A pausa de semínima vale:', '1 tempo', '2 tempos', '4 tempos', 'meio tempo']],
      gera: [{ tema: 'pausa', valores: [4, 2, 1] }, { tema: 'compasso', formulas: [4], valores: [2, 1], pausas: true }],
      leitura: { nome: 'Notas e pausas', padrao: [[7, 1], [null, 1], [9, 1], [null, 1], [11, 2], [null, 2], [12, 1], [11, 1], [9, 1], [7, 1], [4, 2], [null, 2]] } },
    'tres': { titulo: 'Compassos de 2 e de 3 tempos',
      blocos: ['Nem toda música tem 4 tempos por compasso. 2/4 é binário (marcha): UM-dois. 3/4 é ternário (valsa): UM-dois-três.',
        leg(ex([[67, 2], [71, 1], [72, 2], [71, 1], [69, 1], [67, 1], [65, 1], [64, 3]], { compasso: 3 }), 'Valsa em 3/4: cada compasso soma 3 tempos.'),
        'A mínima com um ponto (mínima pontuada) vale 3 tempos: enche sozinha um compasso de 3/4.'],
      confira: [['O compasso 3/4 tem quantos tempos?', '3', '4', '2', '6'], ['A valsa é um compasso:', 'Ternário (3/4)', 'Binário (2/4)', 'Quaternário (4/4)', 'Livre'],
        ['A mínima pontuada vale:', '3 tempos', '2 tempos', '4 tempos', '1 tempo e meio'], ['No 2/4, contamos:', 'UM-dois', 'UM-dois-três', 'UM-dois-três-quatro', 'um-DOIS-três']],
      gera: [{ tema: 'compasso', formulas: [2, 3, 4], valores: [3, 2, 1] }, { tema: 'figura', valores: [4, 3, 2, 1] }],
      leitura: { nome: 'Valsa em 3/4', compasso: 3, padrao: [[7, 2], [11, 1], [12, 2], [11, 1], [9, 1], [7, 1], [5, 1], [4, 3]] } },
    'colcheias': { titulo: 'Colcheias: duas notas por tempo',
      blocos: ['A colcheia vale meio tempo: cabem duas em cada tempo. Sozinha ela tem uma bandeirinha; em grupo, as colcheias se ligam por uma barra.',
        leg(ex([[67, 1, '1'], [67, 1, '2'], [67, 0.5, '1'], [69, 0.5, 'e'], [71, 0.5, '2'], [72, 0.5, 'e']]), 'Semínimas e colcheias: conte "1 e 2 e".'),
        'Conte "1 e 2 e 3 e 4 e": a nota do número cai no tempo, a do "e" cai no meio. A pausa de colcheia também vale meio tempo.'],
      confira: [['A colcheia vale:', 'Meio tempo', '1 tempo', '2 tempos', '1/4 de tempo'], ['Quantas colcheias cabem em uma semínima?', '2', '4', '1', '3'],
        ['Para contar colcheias falamos:', '1 e 2 e 3 e 4 e', '1 2 3 4', '1 2 3', 'UM-dois'], ['Colcheias em grupo aparecem:', 'Ligadas por uma barra', 'Sem haste', 'Com bolinha vazia', 'Com um ponto']],
      gera: [{ tema: 'figura', valores: [4, 2, 1, 0.5] }, { tema: 'compasso', formulas: [2, 3, 4], valores: [2, 1, 0.5] }],
      leitura: { nome: 'Colcheias', padrao: [[0, 0.5], [2, 0.5], [4, 0.5], [5, 0.5], [7, 1], [7, 1], [9, 0.5], [7, 0.5], [5, 0.5], [4, 0.5], [2, 2], [4, 0.5], [5, 0.5], [4, 0.5], [2, 0.5], [0, 1], [2, 1], [0, 4]] } },
    'ponto': { titulo: 'Ponto de aumento e ligadura',
      blocos: ['O ponto ao lado da nota soma metade do valor dela. Mínima pontuada = 2 + 1 = 3 tempos. Semínima pontuada = 1 + meio = 1 tempo e meio.',
        leg(ex([[67, 1.5, '1 e meio'], [69, 0.5, 'meio'], [71, 2, '2']], { compasso: 4 }), 'Semínima pontuada + colcheia = 2 tempos (longa-curta).'),
        'A ligadura (um arco ligando duas notas iguais) junta os valores: você toca uma vez e segura pelo tempo das duas.'],
      confira: [['O ponto de aumento:', 'Soma metade do valor da nota', 'Dobra o valor', 'Deixa a nota curta', 'Sobe meio tom'], ['A semínima pontuada vale:', '1 tempo e meio', '2 tempos', 'meio tempo', '3 tempos'],
        ['Semínima pontuada + colcheia somam:', '2 tempos', '1 tempo', '3 tempos', '1 tempo e meio'], ['A ligadura entre duas notas iguais quer dizer:', 'Toca uma vez e segura o tempo das duas', 'Toca as duas separadas', 'As notas ficam curtas', 'Repete o compasso']],
      gera: [{ tema: 'figura', valores: [4, 3, 2, 1.5, 1, 0.5] }, { tema: 'compasso', formulas: [3, 4], valores: [2, 1.5, 1, 0.5] }],
      leitura: { nome: 'Ponto de aumento', padrao: [[0, 1.5], [2, 0.5], [4, 1], [0, 1], [4, 1.5], [5, 0.5], [7, 2], [9, 1.5], [7, 0.5], [5, 1], [4, 1], [2, 1.5], [2, 0.5], [0, 2]] } },
    'clave-fa': { titulo: 'A clave de fá (mão esquerda)', notasFa: [43, 45, 47, 48, 50, 52, 53, 55, 57],
      blocos: ['Os sons graves se escrevem na clave de fá. Os dois pontinhos ficam em volta da 4ª linha: a nota dessa linha é o Fá, logo abaixo do Dó central.',
        leg(ex([[43, 1, 'Sol'], [47, 1, 'Si'], [50, 1, 'Ré'], [53, 1, 'Fá'], [57, 1, 'Lá']], { clave: 'fa' }), 'Linhas da clave de fá: Sol, Si, Ré, Fá e Lá.'),
        'Espaços da clave de fá: Lá, Dó, Mi e Sol. O Dó central fica numa linha suplementar acima da pauta de fá.',
        leg(ex([[48, 1, 'Dó'], [50, 1, 'Ré'], [52, 1, 'Mi'], [53, 1, 'Fá'], [55, 1, 'Sol']], { clave: 'fa' }), 'A posição de Dó da mão esquerda.'),
        'No piano as duas pautas vêm juntas (sistema): clave de sol em cima para a mão direita e clave de fá embaixo para a esquerda.'],
      confira: [['A clave de fá dá nome à nota de qual linha?', '4ª linha', '2ª linha', '3ª linha', '5ª linha'], ['As linhas da clave de fá, de baixo para cima, são:', 'Sol – Si – Ré – Fá – Lá', 'Mi – Sol – Si – Ré – Fá', 'Fá – Lá – Dó – Mi – Sol', 'Lá – Dó – Mi – Sol – Si'],
        ['No piano, a clave de fá normalmente é lida pela:', 'Mão esquerda', 'Mão direita', 'Voz', 'Pedal'], ['O Dó central, na clave de fá, fica:', 'Numa linha suplementar acima da pauta', 'Na 1ª linha', 'No 2º espaço', 'Na 4ª linha']],
      gera: [], leitura: { nome: 'Subindo até o Sol, na clave de fá', clave: 'fa', padrao: [[0, 1], [2, 1], [4, 1], [5, 1], [7, 2], [7, 2], [5, 1], [4, 1], [2, 1], [0, 1], [0, 4]] } },
    'agudas': { titulo: 'Notas agudas: Ré, Mi, Fá e Sol', notas: [74, 76, 77, 79],
      blocos: ['Subindo do Dó do 3º espaço: Ré (4ª linha), Mi (4º espaço), Fá (5ª linha) e Sol (logo acima da pauta).',
        leg(ex([[72, 1, 'Dó'], [74, 1, 'Ré'], [76, 1, 'Mi'], [77, 1, 'Fá'], [79, 1, 'Sol']]), 'As notas de cima da clave de sol.'),
        'Para decorar: os 4 espaços formam Fá – Lá – Dó – Mi; as 5 linhas, Mi – Sol – Si – Ré – Fá.'],
      confira: [['Qual nota fica na 5ª linha da clave de sol?', 'Fá', 'Mi', 'Sol', 'Ré'], ['Os 4 espaços da clave de sol (de baixo para cima) são:', 'Fá – Lá – Dó – Mi', 'Mi – Sol – Si – Ré', 'Dó – Mi – Sol – Si', 'Sol – Si – Ré – Fá'],
        ['As 5 linhas da clave de sol (de baixo para cima) são:', 'Mi – Sol – Si – Ré – Fá', 'Fá – Lá – Dó – Mi – Sol', 'Sol – Si – Ré – Fá – Lá', 'Dó – Mi – Sol – Si – Ré'], ['A nota do 4º espaço é:', 'Mi', 'Ré', 'Fá', 'Dó']],
      gera: [], leitura: { nome: 'Lá em cima', padrao: [[12, 1], [14, 1], [16, 2], [17, 1], [16, 1], [14, 2], [12, 1], [16, 1], [19, 1], [17, 1], [16, 4]] } },
    'graves-violao': { titulo: 'As notas graves do violão (abaixo da pauta)', notas: [52, 53, 55, 57, 59],
      blocos: ['As cordas graves ficam abaixo da pauta, com linhas suplementares. Descendo do Dó (5ª corda, casa 3): Si (5ª corda, casa 2), Lá (5ª solta), Sol (6ª, casa 3), Fá (6ª, casa 1) e Mi (6ª solta).',
        leg(ex([[60, 1, 'Dó'], [59, 1, 'Si'], [57, 1, 'Lá'], [55, 1, 'Sol'], [53, 1, 'Fá'], [52, 1, 'Mi']], { tab: true }), 'Cada linha suplementar a mais é uma nota mais grave.'),
        'Para achar rápido: o Lá fica na 2ª linha suplementar, o Fá na 3ª, e o Mi logo abaixo dela.'],
      confira: [['A 6ª corda solta (Mi grave) é escrita:', 'Logo abaixo da 3ª linha suplementar', 'Na 1ª linha', 'No 1º espaço', 'Na 2ª linha suplementar'], ['A 5ª corda solta é a nota:', 'Lá', 'Si', 'Mi', 'Ré'],
        ['O Sol grave fica na:', '6ª corda, casa 3', '5ª corda solta', '4ª corda solta', '6ª corda, casa 1'], ['O Lá grave fica na:', '2ª linha suplementar abaixo da pauta', '1ª linha', '2º espaço', 'Na linha do Dó central']],
      gera: [], leitura: { nome: 'Baixos do violão', padrao: [[-8, 1], [-7, 1], [-5, 2], [-3, 1], [-1, 1], [0, 2], [-1, 1], [-3, 1], [-5, 1], [-7, 1], [-8, 4]] } },
    'acidentes': { titulo: 'Sustenido, bemol e bequadro',
      blocos: ['De uma nota para a vizinha mais próxima a distância é o semitom (meio tom). Dois semitons formam um tom. Entre Mi–Fá e Si–Dó não há nada no meio: já são semitom.',
        '♯ sustenido sobe a nota meio tom; ♭ bemol desce meio tom; ♮ bequadro cancela o acidente. O acidente vale até o fim do compasso.',
        leg(ex([[65, 1, 'Fá'], [66, 1, 'Fá♯'], [65, 2, 'Fá']], { compasso: 4 }), 'O sustenido vale no compasso inteiro; para voltar ao Fá natural, usamos o bequadro.'),
        leg(ex([[71, 2, 'Si'], [70, 2, 'Si♭']], { bemois: true, compasso: 4 }), 'O bemol desce o Si meio tom.')],
      confira: [['O sustenido (♯):', 'Sobe a nota meio tom', 'Desce meio tom', 'Cancela o acidente', 'Dobra o valor'], ['O bemol (♭):', 'Desce a nota meio tom', 'Sobe meio tom', 'Cancela o acidente', 'Indica silêncio'],
        ['O bequadro (♮):', 'Cancela o acidente e volta à nota natural', 'Sobe um tom', 'Desce um tom', 'Repete o compasso'], ['Entre quais notas naturais já existe semitom?', 'Mi–Fá e Si–Dó', 'Dó–Ré e Fá–Sol', 'Ré–Mi e Lá–Si', 'Sol–Lá e Dó–Ré'],
        ['Um acidente escrito na nota vale:', 'Até o fim do compasso', 'Só para aquela nota', 'Para a música inteira', 'Até a próxima pausa']],
      gera: [{ tema: 'acidente' }],
      leitura: { nome: 'Fá sustenido e bequadro', padrao: [[7, 1], [6, 1], [7, 2], [4, 1], [5, 1], [6, 1], [7, 1], [9, 1], [7, 1], [6, 1], [5, 1], [4, 4]] } },
    'escala-maior': { titulo: 'A escala maior',
      blocos: ['A escala maior segue sempre a mesma fórmula: tom – tom – semitom – tom – tom – tom – semitom. Começando no Dó, ela usa só as notas naturais.',
        leg(ex([[60, 1, 'Dó'], [62, 1, 'T'], [64, 1, 'T'], [65, 1, 'S'], [67, 1, 'T'], [69, 1, 'T'], [71, 1, 'T'], [72, 1, 'S']]), 'Dó maior: os semitons ficam entre Mi–Fá e Si–Dó.'),
        'Cada nota da escala é um grau: Dó é o 1º grau (a tônica), Ré o 2º, Mi o 3º, e assim por diante.'],
      confira: [['A fórmula da escala maior é:', 'T – T – S – T – T – T – S', 'T – S – T – T – S – T – T', 'S – T – T – T – S – T – T', 'T – T – T – S – T – T – S'],
        ['Na escala de Dó maior, onde ficam os semitons?', 'Mi–Fá e Si–Dó', 'Dó–Ré e Sol–Lá', 'Ré–Mi e Lá–Si', 'Fá–Sol e Dó–Ré'], ['O 1º grau da escala se chama:', 'Tônica', 'Dominante', 'Sensível', 'Mediante'],
        ['O 5º grau da escala de Dó maior é:', 'Sol', 'Fá', 'Lá', 'Mi']],
      gera: [{ tema: 'escala', tons: ['Dó'] }],
      leitura: { nome: 'Escala de Dó maior', padrao: [[0, 1], [2, 1], [4, 1], [5, 1], [7, 1], [9, 1], [11, 1], [12, 1], [11, 1], [9, 1], [7, 1], [5, 1], [4, 1], [2, 1], [0, 2]] } },
    'armadura-sol': { titulo: 'Armadura de clave: Sol maior', notas: [66],
      blocos: ['Começando a escala maior no Sol, para manter a fórmula o Fá precisa virar Fá♯.',
        'Em vez de escrever ♯ em todo Fá, ele aparece uma vez só no começo de cada linha: é a armadura de clave. Com um ♯ na armadura, todo Fá é Fá♯ (o tom é Sol maior).',
        leg(ex([[67, 1], [69, 1], [71, 1], [72, 1], [74, 1], [76, 1], [78, 1, 'Fá♯'], [79, 1]], { armadura: 1 }), 'Escala de Sol maior com a armadura.')],
      confira: [['A escala de Sol maior tem qual acidente?', 'Fá♯', 'Si♭', 'Dó♯', 'Nenhum'], ['A armadura de clave serve para:', 'Indicar os acidentes que valem na música toda', 'Mostrar o andamento', 'Separar compassos', 'Indicar a dinâmica'],
        ['Com um ♯ na armadura, todo Fá vira:', 'Fá♯', 'Fá♭', 'Sol', 'Mi'], ['Um sustenido na armadura indica o tom de:', 'Sol maior', 'Fá maior', 'Ré maior', 'Dó maior']],
      gera: [{ tema: 'escala', tons: ['Dó', 'Sol'] }, { tema: 'armadura', tons: ['Sol', 'Ré', 'Fá'] }],
      leitura: { nome: 'Em Sol maior (Fá♯ na armadura)', armadura: 1, padrao: [[7, 1], [9, 1], [11, 1], [7, 1], [6, 1], [7, 1], [9, 2], [11, 1], [12, 1], [11, 1], [9, 1], [7, 1], [6, 1], [7, 2]] } },
    'armadura-fa': { titulo: 'Fá maior, Ré maior e a ordem dos acidentes',
      blocos: ['Fá maior precisa de Si♭ para seguir a fórmula: a armadura tem um bemol. Ré maior precisa de dois sustenidos: Fá♯ e Dó♯.',
        leg(ex([[65, 1], [67, 1], [69, 1], [70, 1, 'Si♭'], [72, 1], [74, 1], [76, 1], [77, 1]], { armadura: -1 }), 'Escala de Fá maior.'),
        'Os sustenidos entram sempre nesta ordem: Fá, Dó, Sol, Ré, Lá, Mi, Si. Os bemóis, na ordem contrária: Si, Mi, Lá, Ré, Sol, Dó, Fá.'],
      confira: [['Qual tom maior tem um bemol (Si♭)?', 'Fá maior', 'Sol maior', 'Ré maior', 'Dó maior'], ['Ré maior tem quais sustenidos?', 'Fá♯ e Dó♯', 'Fá♯ e Sol♯', 'Dó♯ e Sol♯', 'Só Fá♯'],
        ['A ordem dos sustenidos começa por:', 'Fá – Dó – Sol', 'Si – Mi – Lá', 'Dó – Ré – Mi', 'Sol – Ré – Lá'], ['A ordem dos bemóis começa por:', 'Si – Mi – Lá', 'Fá – Dó – Sol', 'Lá – Si – Dó', 'Mi – Si – Fá']],
      gera: [{ tema: 'armadura', tons: ['Sol', 'Ré', 'Fá', 'Lá', 'Si♭'] }, { tema: 'escala', tons: ['Sol', 'Ré', 'Fá'] }],
      leitura: { nome: 'Em Fá maior (Si♭ na armadura)', armadura: -1, padrao: [[5, 1], [7, 1], [9, 1], [10, 1], [12, 1], [10, 1], [9, 1], [7, 1], [5, 1], [9, 1], [12, 2], [9, 1], [7, 1], [5, 2]] } },
    'intervalos': { titulo: 'Intervalos: a distância entre as notas',
      blocos: ['Intervalo é a distância entre duas notas. Conte as notas incluindo a primeira e a última: Dó–Mi = Dó, Ré, Mi = 3ª.',
        leg(ex([[60, 1, 'Dó'], [62, 1, '2ª'], [60, 1, 'Dó'], [64, 1, '3ª'], [60, 1, 'Dó'], [67, 1, '5ª'], [60, 1, 'Dó'], [72, 1, '8ª']]), 'A partir do Dó: 2ª, 3ª, 5ª e 8ª.'),
        'Na pauta é fácil: de linha para a linha seguinte (ou de espaço para espaço) é uma 3ª; de uma linha para o espaço vizinho é uma 2ª.',
        '3ª maior = 2 tons (Dó–Mi); 3ª menor = 1 tom e meio (Lá–Dó). 5ª justa = 3 tons e meio (Dó–Sol). 8ª é a mesma nota mais aguda.'],
      confira: [['O intervalo Dó–Mi é uma:', '3ª', '2ª', '4ª', '5ª'], ['O intervalo Dó–Sol é uma:', '5ª', '4ª', '6ª', '3ª'], ['Duas notas em linhas vizinhas formam uma:', '3ª', '2ª', '4ª', '5ª'],
        ['A 3ª maior tem:', '2 tons', '1 tom e meio', '1 tom', '2 tons e meio']],
      gera: [{ tema: 'intervalo', lista: [2, 3, 4, 5, 7, 12] }, { tema: 'intervalo-ouvido', lista: [3, 4, 7, 12] }],
      leitura: { nome: 'Saltos', padrao: [[0, 1], [7, 1], [4, 1], [12, 1], [11, 1], [7, 1], [9, 2], [5, 1], [9, 1], [7, 1], [4, 1], [2, 1], [7, 1], [0, 2]] } },
    'triades': { titulo: 'Acordes na pauta: as tríades',
      blocos: ['Tríade é um acorde de 3 notas empilhadas em terças. Na pauta parece um "boneco de neve": três notas em linhas seguidas (ou em espaços seguidos).',
        leg(ex([[[60, 64, 67], 1, 'C'], [[65, 69, 72], 1, 'F'], [[67, 71, 74], 1, 'G'], [[69, 72, 76], 1, 'Am']]), 'C, F, G e Am escritos na pauta.'),
        'Acorde maior: 3ª maior embaixo e 3ª menor em cima (Dó–Mi–Sol). Menor: 3ª menor embaixo e maior em cima (Lá–Dó–Mi). A cifra dá o nome: C = Dó maior, Am = Lá menor.'],
      confira: [['Tríade é um acorde de:', '3 notas em terças', '2 notas', '4 notas', 'Notas em segundas'], ['Quais notas formam C (Dó maior)?', 'Dó – Mi – Sol', 'Dó – Mi♭ – Sol', 'Dó – Fá – Lá', 'Ré – Fá – Lá'],
        ['Am é:', 'Lá menor', 'Lá maior', 'Lá com sétima', 'Lá diminuto'], ['A tríade maior tem embaixo uma:', '3ª maior', '3ª menor', '4ª justa', '2ª maior']],
      gera: [{ tema: 'triade', tons: ['Dó', 'Sol', 'Fá'] }, { tema: 'acorde-ouvido', tipos: ['', 'm'] }],
      leitura: { nome: 'Arpejos de C, F e G', padrao: [[0, 1], [4, 1], [7, 2], [5, 1], [9, 1], [12, 2], [2, 1], [7, 1], [11, 2], [0, 4]] } },
    'semicolcheias': { titulo: 'Semicolcheias: quatro notas por tempo',
      blocos: ['A semicolcheia vale 1/4 de tempo: cabem quatro em cada tempo. Tem duas bandeirinhas, ou duas barras quando está em grupo.',
        leg(ex([[67, 0.25], [69, 0.25], [71, 0.25], [72, 0.25], [71, 0.5], [69, 0.5], [67, 1]]), 'Um tempo de semicolcheias, um de colcheias e uma semínima.'),
        'Fale "ta-ca-ta-ca" em cada tempo. A colcheia pontuada com uma semicolcheia (longa-curta) também completa 1 tempo: é o "galope".'],
      confira: [['A semicolcheia vale:', '1/4 de tempo', 'Meio tempo', '1 tempo', '2 tempos'], ['Quantas semicolcheias cabem em um tempo?', '4', '2', '8', '3'],
        ['A semicolcheia tem:', 'Duas bandeirinhas (ou duas barras)', 'Uma bandeirinha', 'Nenhuma haste', 'Bolinha vazia'], ['Colcheia pontuada + semicolcheia somam:', '1 tempo', 'Meio tempo', '2 tempos', '1 tempo e meio']],
      gera: [{ tema: 'figura', valores: [2, 1, 0.5, 0.25, 0.75] }, { tema: 'compasso', formulas: [2, 4], valores: [1, 0.5, 0.25] }],
      leitura: { nome: 'Semicolcheias', padrao: [[0, 0.25], [2, 0.25], [4, 0.25], [5, 0.25], [7, 1], [5, 0.25], [4, 0.25], [2, 0.25], [0, 0.25], [2, 1], [4, 0.5], [5, 0.5], [7, 0.5], [9, 0.5], [7, 2], [4, 1], [2, 1], [0, 2]] } },
    'menor': { titulo: 'Tom menor e a relativa', notas: [68],
      blocos: ['Toda escala maior tem uma relativa menor com as mesmas notas, começando no 6º grau: Dó maior → Lá menor. Por isso as duas usam a mesma armadura.',
        leg(ex([[57, 1, 'Lá'], [59, 1], [60, 1], [62, 1], [64, 1], [65, 1], [67, 1], [69, 1]]), 'Lá menor natural: as notas de Dó maior, começando no Lá.'),
        'Na menor harmônica o 7º grau sobe meio tom (em Lá menor, Sol vira Sol♯). Ele aparece como acidente na música, não na armadura.',
        leg(ex([[57, 1], [59, 1], [60, 1], [62, 1], [64, 1], [65, 1], [68, 1, 'Sol♯'], [69, 1]]), 'Lá menor harmônica.')],
      confira: [['Qual é a relativa menor de Dó maior?', 'Lá menor', 'Mi menor', 'Ré menor', 'Dó menor'], ['A relativa menor usa a armadura:', 'Igual à do tom maior', 'Com um bemol a mais', 'Sempre sem armadura', 'Com um sustenido a mais'],
        ['Na menor harmônica de Lá, qual nota muda?', 'Sol vira Sol♯', 'Fá vira Fá♯', 'Dó vira Dó♯', 'Si vira Si♭'], ['A relativa menor começa no:', '6º grau da escala maior', '2º grau', '5º grau', '4º grau']],
      gera: [{ tema: 'relativa', tons: ['Dó', 'Sol', 'Fá', 'Ré'] }],
      leitura: { nome: 'Lá menor (com o Sol♯)', padrao: [[9, 1], [12, 1], [9, 1], [4, 1], [5, 1], [4, 1], [2, 2], [0, 1], [2, 1], [4, 1], [5, 1], [4, 1], [8, 1], [9, 2]] } },
    'campo': { titulo: 'Campo harmônico e a cifra na partitura',
      blocos: ['Os acordes de um tom saem da própria escala: em Dó maior, C – Dm – Em – F – G – Am – Bdim (graus I a VII).',
        leg(ex([[[60, 64, 67], 1, 'C'], [[62, 65, 69], 1, 'Dm'], [[64, 67, 71], 1, 'Em'], [[65, 69, 72], 1, 'F'], [[67, 71, 74], 1, 'G'], [[69, 72, 76], 1, 'Am'], [[71, 74, 77], 1, 'Bdim']]), 'O campo harmônico de Dó maior.'),
        'Funções: tônica (I, vi, iii) dá repouso; subdominante (IV, ii) afasta; dominante (V, vii) cria tensão que pede a volta para o I.',
        'Na partitura popular, a cifra vem escrita em cima da melodia: você lê a melodia e acompanha com os acordes.'],
      confira: [['No campo harmônico de Dó, o acorde do V grau é:', 'G', 'F', 'Am', 'Em'], ['Quais graus do campo maior são acordes menores?', 'II, III e VI', 'I, IV e V', 'Só o VI', 'II, V e VII'],
        ['A dominante (V) tem a função de:', 'Criar tensão que pede a tônica', 'Dar repouso', 'Afastar sem tensão', 'Encerrar o compasso'], ['Na partitura popular, a cifra fica:', 'Em cima da melodia', 'Embaixo da tablatura', 'Só no fim', 'Na armadura']],
      gera: [{ tema: 'campo', tons: ['Dó', 'Sol', 'Fá'] }, { tema: 'funcao', tons: ['Dó', 'Sol', 'Fá'] }],
      leitura: { nome: 'Melodia para acompanhar com C, F e G', padrao: [[4, 1], [5, 1], [7, 2], [9, 1], [7, 1], [5, 2], [4, 1], [2, 1], [0, 1], [2, 1], [0, 4]] } },
    'sinais': { titulo: 'Dinâmica, repetição e andamento',
      blocos: ['Dinâmica é o volume. p (piano) = suave; mf (mezzo forte) = meio forte; f (forte) = forte. O sinal < é crescendo e > é decrescendo.',
        'Repetição: o ritornello (‖: … :‖) manda repetir o trecho; D.C. (da capo) volta ao começo; Fine marca onde a música termina.',
        'Fermata (𝄐) segura a nota mais que o valor. Staccato (ponto em cima ou embaixo da nota) deixa a nota curta. Andamento: Adagio = lento, Moderato = moderado, Allegro = rápido.'],
      confira: [['O que significa p (piano) na partitura?', 'Tocar suave', 'Tocar forte', 'Tocar rápido', 'Repetir'], ['O sinal < (crescendo) pede:', 'Aumentar o volume aos poucos', 'Diminuir o volume', 'Acelerar', 'Parar'],
        ['O ritornello indica:', 'Repetir o trecho', 'Fim da música', 'Mudar de tom', 'Tocar suave'], ['A fermata indica:', 'Segurar a nota além do valor', 'Repetir', 'Tocar curto', 'Voltar ao começo'],
        ['Allegro é um andamento:', 'Rápido', 'Lento', 'Moderado', 'Livre'], ['O staccato deixa a nota:', 'Curta, destacada', 'Longa', 'Mais forte', 'Mais aguda']],
      gera: [], leitura: { nome: 'Ode à Alegria (toque a 1ª vez p e a 2ª vez f)', padrao: [[4, 1], [4, 1], [5, 1], [7, 1], [7, 1], [5, 1], [4, 1], [2, 1], [0, 1], [0, 1], [2, 1], [4, 1], [4, 1.5], [2, 0.5], [2, 2]] } },
    'sincope': { titulo: 'Síncope e contratempo',
      blocos: ['Síncope é quando a nota começa no tempo fraco (no "e") e se prolonga por cima do tempo forte. É o balanço da música brasileira e do pop.',
        leg(ex([[67, 0.5, '1'], [69, 1, 'e'], [71, 0.5, 'e'], [72, 2]], { compasso: 4 }), 'Colcheia, semínima, colcheia: a nota do meio começa no "e" e atravessa o tempo 2.'),
        'Contratempo é tocar no "e" e deixar o tempo em silêncio (pausa de colcheia no tempo, nota no "e").'],
      confira: [['Síncope é:', 'Uma nota que começa no tempo fraco e se prolonga pelo forte', 'Uma nota muito forte', 'Uma pausa longa', 'Repetir o compasso'],
        ['Colcheia + semínima + colcheia somam:', '2 tempos', '1 tempo', '3 tempos', '1 tempo e meio'], ['Contratempo é tocar:', 'No "e", com o tempo em silêncio', 'Só no tempo 1', 'Mais rápido', 'Mais devagar']],
      gera: [{ tema: 'compasso', formulas: [2, 4], valores: [1, 0.5] }],
      leitura: { nome: 'Síncope', padrao: [[0, 0.5], [2, 1], [4, 0.5], [5, 1], [4, 1], [7, 0.5], [5, 1], [4, 0.5], [2, 2], [0, 0.5], [2, 1], [4, 0.5], [2, 1], [0, 1], [0, 4]] } },
    'tablatura': { titulo: 'Lendo tablatura',
      blocos: ['A tablatura tem 6 linhas, uma para cada corda. A linha de cima é a 1ª corda (Mi agudo) e a de baixo é a 6ª (Mi grave). O número é a casa; 0 é corda solta.',
        leg(ex([[52, 1], [55, 1], [57, 2], [52, 1], [55, 1], [58, 0.5], [57, 1.5]], { tab: true, compasso: 4 }), 'Partitura e tablatura juntas: a pauta mostra o ritmo, a tab mostra corda e casa.'),
        'A tablatura sozinha não mostra bem o ritmo. Por isso ela costuma vir junto da partitura: leia o ritmo na pauta e a posição na tab.'],
      confira: [['Na tablatura, a linha de cima é a:', '1ª corda (Mi agudo)', '6ª corda (Mi grave)', '3ª corda', '5ª corda'], ['O número 0 na tablatura quer dizer:', 'Corda solta', 'Não tocar', 'Pausa', 'Casa 10'],
        ['A tablatura sozinha não mostra bem:', 'O ritmo', 'A corda', 'A casa', 'A ordem das notas']],
      gera: [{ tema: 'tab' }],
      leitura: { nome: 'Riff nas cordas graves', padrao: [[-8, 1], [-5, 1], [-3, 2], [-8, 1], [-5, 1], [-2, 0.5], [-3, 1.5], [-8, 1], [-5, 1], [-3, 2], [-5, 1], [-8, 3]] } },
    'cifra': { titulo: 'Lendo cifras',
      blocos: ['A cifra usa letras: A = Lá, B = Si, C = Dó, D = Ré, E = Mi, F = Fá, G = Sol. A letra sozinha é um acorde maior.',
        'm = menor (Am); 7 = com sétima (G7); 7M = com sétima maior (C7M); sus4 = troca a 3ª pela 4ª; ° ou dim = diminuto; a barra / mostra o baixo (C/E = Dó com Mi no baixo).'],
      confira: [['Na cifra, B é a nota:', 'Si', 'Bé', 'Sol', 'Ré'], ['A cifra C/E quer dizer:', 'Dó com Mi no baixo', 'Dó e depois Mi', 'Dó menor', 'Mi com sétima'],
        ['Am7 é:', 'Lá menor com sétima', 'Lá maior com sétima maior', 'Lá com sétima', 'Lá diminuto'], ['O "sus4" troca a 3ª do acorde pela:', '4ª', '2ª', '5ª', '7ª']],
      gera: [{ tema: 'cifra' }],
      leitura: { nome: 'Brilha, brilha, estrelinha (leia e depois acompanhe com C, F e G)', padrao: [[0, 1], [0, 1], [7, 1], [7, 1], [9, 1], [9, 1], [7, 2], [5, 1], [5, 1], [4, 1], [4, 1], [2, 1], [2, 1], [0, 2]] } },
    'primeira-vista': { titulo: 'Leitura à primeira vista',
      blocos: ['Ler à primeira vista é tocar uma música que você nunca viu. O segredo é olhar antes de tocar: clave, armadura, compasso e o ritmo mais difícil.',
        'Escolha um andamento lento, nunca pare (se errar, siga no tempo) e leia um pouco à frente da nota que está tocando.'],
      confira: [['Na leitura à primeira vista, se errar uma nota:', 'Siga no tempo, sem parar', 'Volte ao começo', 'Pare e corrija', 'Toque mais rápido'],
        ['Antes de começar, olhe:', 'Clave, armadura, compasso e o ritmo mais difícil', 'Só a primeira nota', 'Só a letra', 'O nome do compositor'],
        ['O andamento certo para ler à primeira vista é:', 'Lento, que dê para não parar', 'O mais rápido possível', 'O da gravação', 'Sem andamento']],
      gera: [{ tema: 'compasso', formulas: [2, 3, 4], valores: [2, 1, 0.5] }],
      leitura: { nome: 'Melodia nova', padrao: [[0, 1], [4, 0.5], [5, 0.5], [7, 1], [12, 1], [11, 1.5], [9, 0.5], [7, 2], [5, 1], [4, 1], [2, 0.5], [4, 0.5], [5, 1], [4, 2], [2, 1], [0, 1]] } },
    // ----- trilha profissional -----
    'sistema': { titulo: 'Pauta dupla: lendo as duas mãos', notasFa: [43, 45, 47, 48, 50, 52, 53, 55, 57],
      blocos: ['Piano e teclado leem no sistema: duas pautas unidas por uma chave. Em cima a clave de sol (mão direita), embaixo a clave de fá (mão esquerda). Notas na mesma linha vertical tocam juntas.',
        { pauta: { compasso: 4, vozes: [{ clave: 'sol', notas: [[64, 1], [64, 1], [65, 1], [67, 1], [67, 1], [65, 1], [64, 1], [62, 1]] }, { clave: 'fa', notas: [[48, 2], [43, 2], [48, 2], [43, 2]] }] }, legenda: 'Melodia na direita, baixo na esquerda.' },
        'Para ler: primeiro o ritmo e a mão esquerda (o baixo), depois junte a direita. O Dó central é a linha suplementar entre as duas pautas.'],
      confira: [['No sistema do piano, a pauta de cima é lida pela:', 'Mão direita (clave de sol)', 'Mão esquerda', 'Pedal', 'Voz'], ['Notas na mesma linha vertical nas duas pautas:', 'Tocam juntas', 'Tocam uma depois da outra', 'São pausas', 'São de outra música'],
        ['A chave que une as duas pautas indica:', 'Que as duas são lidas juntas', 'Repetição', 'Mudança de tom', 'Fim da música']],
      gera: [], leitura: { nome: 'Duas mãos', maos: { E: { raiz: 48, padrao: [[0, 4], [7, 4], [0, 4]] }, D: { raiz: 60, padrao: [[4, 1], [4, 1], [5, 1], [7, 1], [7, 1], [5, 1], [4, 1], [2, 1], [0, 1], [0, 1], [2, 1], [4, 1]] } } } },
    'armaduras-sust': { titulo: 'Armaduras com sustenidos',
      blocos: ['Ordem dos sustenidos: Fá – Dó – Sol – Ré – Lá – Mi – Si. Truque: o tom maior fica meio tom acima do último sustenido (último Dó♯ → Ré maior).',
        leg(ex([], { armadura: 3 }), 'Três sustenidos (Fá♯, Dó♯, Sol♯): Lá maior.'),
        'Tons com sustenido: Sol (1), Ré (2), Lá (3), Mi (4), Si (5), Fá♯ (6).'],
      confira: [['Qual tom maior tem 3 sustenidos?', 'Lá maior', 'Ré maior', 'Mi maior', 'Sol maior'], ['Se o último sustenido é Sol♯, o tom é:', 'Lá maior', 'Sol maior', 'Mi maior', 'Si maior'],
        ['Mi maior tem quantos sustenidos?', '4', '3', '5', '2']],
      gera: [{ tema: 'armadura', tons: ['Sol', 'Ré', 'Lá', 'Mi', 'Si'] }, { tema: 'escala', tons: ['Sol', 'Ré', 'Lá', 'Mi'] }],
      leitura: { nome: 'Em Ré maior', armadura: 2, padrao: [[2, 1], [4, 1], [6, 1], [7, 1], [9, 1], [11, 1], [9, 2], [7, 1], [6, 1], [4, 1], [2, 1], [4, 0.5], [6, 0.5], [1, 1], [2, 2]] } },
    'armaduras-bem': { titulo: 'Armaduras com bemóis',
      blocos: ['Ordem dos bemóis: Si – Mi – Lá – Ré – Sol – Dó – Fá (a dos sustenidos ao contrário). Truque: o penúltimo bemol é o nome do tom (Si♭, Mi♭ → Si♭ maior). Fá maior tem um só bemol: decore.',
        leg(ex([], { armadura: -3 }), 'Três bemóis (Si♭, Mi♭, Lá♭): Mi♭ maior.')],
      confira: [['Qual tom maior tem 2 bemóis?', 'Si♭ maior', 'Fá maior', 'Mi♭ maior', 'Lá♭ maior'], ['Si♭–Mi♭–Lá♭ na armadura é o tom de:', 'Mi♭ maior', 'Lá♭ maior', 'Si♭ maior', 'Ré♭ maior'],
        ['A ordem dos bemóis é:', 'Si – Mi – Lá – Ré – Sol – Dó – Fá', 'Fá – Dó – Sol – Ré – Lá – Mi – Si', 'Si – Lá – Sol – Fá – Mi – Ré – Dó', 'Mi – Si – Fá – Dó – Sol – Ré – Lá']],
      gera: [{ tema: 'armadura', tons: ['Fá', 'Si♭', 'Mi♭', 'Lá♭'] }, { tema: 'escala', tons: ['Fá', 'Si♭', 'Mi♭'] }],
      leitura: { nome: 'Em Fá maior', armadura: -1, padrao: [[5, 1], [7, 1], [9, 1], [10, 1], [12, 1], [10, 1], [9, 1], [7, 1], [5, 1], [9, 1], [12, 2], [9, 1], [7, 1], [5, 2]] } },
    'tetrades-pauta': { titulo: 'Tétrades na pauta e na cifra',
      blocos: ['Tétrade é a tríade com a 7ª: quatro notas empilhadas em terças (linha-linha-linha-linha ou espaço-espaço-espaço-espaço).',
        leg(ex([[[60, 64, 67, 71], 1, 'C7M'], [[60, 64, 67, 70], 1, 'C7'], [[60, 63, 67, 70], 1, 'Cm7'], [[60, 63, 66, 70], 1, 'Cm7(♭5)']], { bemois: true }), 'As quatro tétrades mais usadas, em Dó.'),
        'Na cifra: 7M (ou maj7) = 7ª maior; 7 = 3ª maior com 7ª menor (dominante); m7 = menor com 7ª; m7(♭5) = meio-diminuto; °7 = diminuto.'],
      confira: [['Tétrade é:', 'Tríade + 7ª', 'Duas tríades', 'Tríade sem 5ª', 'Acorde de 5 notas'], ['C7 tem as notas:', 'Dó – Mi – Sol – Si♭', 'Dó – Mi – Sol – Si', 'Dó – Mi♭ – Sol – Si♭', 'Dó – Mi♭ – Sol♭ – Si♭'],
        ['m7(♭5) se chama:', 'Meio-diminuto', 'Diminuto', 'Dominante', 'Sétima maior']],
      gera: [{ tema: 'tetrade', tons: ['Dó', 'Fá', 'Sol', 'Si♭'] }],
      leitura: { nome: 'Arpejos do ii-V-I', padrao: [[2, 1], [5, 1], [9, 1], [12, 1], [7, 1], [11, 1], [14, 1], [17, 1], [12, 1], [16, 1], [19, 1], [23, 1], [24, 4]] } },
    'tensoes': { titulo: 'Tensões: 9ª, 11ª e 13ª',
      blocos: ['Depois da 7ª, as terças continuam: 9ª (a 2ª uma oitava acima), 11ª (a 4ª) e 13ª (a 6ª). Na cifra elas vêm entre parênteses: C7M(9), G7(13).',
        leg(ex([[[60, 64, 67, 71, 74], 2, 'C7M(9)'], [[55, 59, 65, 76], 2, 'G7(13)']]), 'A 9ª fica em cima; na 13ª a 5ª costuma sair.'),
        'No voicing, a tônica muitas vezes sai (o baixista toca) e as tensões ficam em cima, dando a cor do acorde.'],
      confira: [['A 9ª é a mesma nota que a:', '2ª', '3ª', '4ª', '6ª'], ['A 13ª é a mesma nota que a:', '6ª', '5ª', '7ª', '4ª'], ['A 9ª de Dó é:', 'Ré', 'Mi', 'Fá', 'Lá']],
      gera: [{ tema: 'harmonia', tipos: ['tensao'] }],
      leitura: { nome: 'Melodia com 9ª e 13ª', padrao: [[14, 1], [12, 1], [11, 2], [9, 1], [7, 1], [4, 2], [2, 1], [4, 1], [7, 1], [9, 1], [14, 4]] } },
    'dominantes': { titulo: 'Dominantes secundários e SubV',
      blocos: ['Todo acorde do campo (menos o vii) pode ganhar o seu próprio dominante, o V7 dele. Em Dó, o V7 do Dm é A7 (A7 → Dm).',
        'O SubV7 (substituto de trítono) fica meio tom acima do alvo: em vez de G7 → C, toca D♭7 → C. Os dois têm o mesmo trítono (Fá e Si).'],
      confira: [['Em Dó, o dominante secundário de Am é:', 'E7', 'A7', 'D7', 'G7'], ['O SubV7 que resolve em C é:', 'D♭7', 'G7', 'F7', 'B7'], ['G7 e D♭7 têm em comum:', 'O trítono (Fá e Si)', 'A tônica', 'A 5ª', 'Nada']],
      gera: [{ tema: 'harmonia', tipos: ['subV', 'secundario'] }],
      leitura: { nome: 'Linha cromática (Lá♭ de passagem)', bemois: true, padrao: [[7, 1], [8, 1], [9, 2], [5, 1], [6, 1], [7, 2], [4, 1], [3, 1], [2, 1], [1, 1], [0, 4]] } },
    'tercinas': { titulo: 'Tercinas e swing',
      blocos: ['Tercina é um grupo de três notas no tempo de duas. Aparece com um 3 em cima do grupo. Fale "tri-pe-ra" em cada tempo.',
        'No swing, as colcheias escritas iguais soam longa-curta (como a 1ª e a 3ª nota de uma tercina). Na partitura de jazz vem escrito "Swing" no começo.',
        leg(ex([[67, 0.5, 'lon-'], [69, 0.5, 'ga'], [71, 0.5, 'lon-'], [72, 0.5, 'ga'], [71, 2]]), 'Escrito assim, tocado longa-curta.')],
      confira: [['Tercina é:', 'Três notas no tempo de duas', 'Três tempos por compasso', 'Uma nota de três tempos', 'Três acordes'], ['Colcheias em swing soam:', 'Longa-curta', 'Curta-longa', 'Todas iguais', 'Como semínimas'],
        ['A tercina é indicada por:', 'Um 3 em cima do grupo', 'Um ponto', 'Uma ligadura sem número', 'Uma pausa']],
      gera: [{ tema: 'figura', valores: [2, 1, 0.5, 0.25] }],
      leitura: { nome: 'Frase em colcheias (toque com swing)', padrao: [[0, 0.5], [2, 0.5], [4, 0.5], [7, 0.5], [9, 0.5], [7, 0.5], [4, 0.5], [2, 0.5], [0, 2], [null, 2]] } },
    'nashville': { titulo: 'Números de Nashville',
      blocos: ['No sistema Nashville cada acorde vira o número do grau no tom. Em Dó: C = 1, Dm = 2m, Em = 3m, F = 4, G = 5, Am = 6m.',
        'A vantagem: o mesmo papel serve em qualquer tom. 1 – 5 – 6m – 4 em Sol é G – D – Em – C; em Ré é D – A – Bm – G.'],
      confira: [['No tom de Dó, o número 5 é:', 'G', 'F', 'A', 'E'], ['1 – 4 – 5 em Ré é:', 'D – G – A', 'D – F – G', 'D – E – F♯', 'C – F – G'], ['A vantagem do Nashville é:', 'Servir em qualquer tom', 'Mostrar a melodia', 'Indicar o andamento', 'Dispensar o ensaio']],
      gera: [{ tema: 'nashville', tons: ['Dó', 'Sol', 'Ré', 'Fá', 'Lá'] }],
      leitura: { nome: 'Melodia sobre 1 – 5 – 6m – 4', padrao: [[4, 2], [2, 2], [0, 2], [-1, 2], [-3, 2], [0, 2], [2, 4]] } },
    'modos': { titulo: 'Modos da escala maior',
      blocos: ['Tocando a escala de Dó a partir de cada grau nascem os modos: Jônio (I), Dórico (II), Frígio (III), Lídio (IV), Mixolídio (V), Eólio (VI) e Lócrio (VII).',
        leg(ex([[62, 1, 'Ré'], [64, 1], [65, 1], [67, 1], [69, 1], [71, 1], [72, 1], [74, 1]]), 'Ré dórico: as notas de Dó maior, com centro no Ré.'),
        'Na prática: sobre m7 use dórico; sobre um dominante (7) use mixolídio; sobre 7M use jônio ou lídio.'],
      confira: [['O modo que começa no II grau é o:', 'Dórico', 'Frígio', 'Lídio', 'Eólio'], ['Sobre um acorde dominante (G7), o modo mais usado é:', 'Mixolídio', 'Dórico', 'Lócrio', 'Frígio'],
        ['O modo eólio é a mesma coisa que a:', 'Escala menor natural', 'Escala maior', 'Pentatônica', 'Escala blues']],
      gera: [{ tema: 'modo' }],
      leitura: { nome: 'Ré dórico', padrao: [[2, 1], [4, 1], [5, 1], [7, 1], [9, 1], [11, 1], [12, 1], [14, 1], [12, 1], [11, 1], [9, 1], [7, 1], [5, 1], [4, 1], [2, 2]] } },
    'lead-sheet': { titulo: 'Lead sheet: melodia com cifra',
      blocos: ['Lead sheet é a partitura da música popular: só a melodia na clave de sol e a cifra em cima. O tecladista lê a cifra e cria o acompanhamento; a melodia mostra o que o cantor faz.',
        leg(ex([[64, 2, 'C'], [67, 2], [69, 2, 'F'], [65, 2], [67, 2, 'G'], [71, 2], [72, 4, 'C']], { compasso: 4 }), 'A cifra aparece onde o acorde muda.'),
        'Repare nos sinais de repetição e nas casas 1 e 2 (1ª vez / 2ª vez) para não se perder.'],
      confira: [['Lead sheet tem:', 'Melodia e cifra', 'Só a cifra', 'Todas as vozes do arranjo', 'Só a letra'], ['No lead sheet, o acompanhamento:', 'É criado pelo músico a partir da cifra', 'Vem escrito nota por nota', 'Não existe', 'É tocado pelo cantor'],
        ['Casa 1 e casa 2 indicam:', 'Finais diferentes na 1ª e na 2ª vez', 'Duas mãos', 'Dois instrumentos', 'Dois andamentos']],
      gera: [{ tema: 'campo', tons: ['Dó', 'Sol', 'Fá'], tetrades: true }],
      leitura: { nome: 'Melodia de lead sheet', padrao: [[4, 2], [7, 2], [9, 2], [5, 2], [7, 2], [11, 2], [12, 4]] } },
    'transposicao': { titulo: 'Transposição',
      blocos: ['Transpor é mudar o tom mantendo os mesmos graus. Pense em números: em Dó, C – Am – F – G é 1 – 6m – 4 – 5; em Ré vira D – Bm – G – A.',
        'Na partitura, a armadura muda e todas as notas sobem ou descem o mesmo intervalo.'],
      confira: [['C – Am – F – G transposto para Ré fica:', 'D – Bm – G – A', 'D – Am – G – A', 'E – C♯m – A – B', 'D – B – G – A'], ['Transpor muda:', 'O tom, mantendo os graus', 'Os graus, mantendo o tom', 'Só o andamento', 'A melodia toda']],
      gera: [{ tema: 'transpor', tons: ['Sol', 'Ré', 'Fá', 'Lá'] }],
      leitura: { nome: 'A mesma melodia em Ré maior', armadura: 2, padrao: [[2, 1], [2, 1], [9, 1], [9, 1], [11, 1], [11, 1], [9, 2], [7, 1], [7, 1], [6, 1], [6, 1], [4, 1], [4, 1], [2, 2]] } },
    'roteiro': { titulo: 'Lendo uma partitura de verdade',
      blocos: ['Antes de tocar, faça o roteiro: 1) clave e armadura (qual é o tom?); 2) fórmula de compasso; 3) andamento e caráter; 4) repetições (ritornello, casas 1 e 2, D.C., D.S., Coda, Fine); 5) dinâmicas.',
        'D.S. (dal segno) volta ao sinal 𝄋. "To Coda" manda pular para a coda (𝄌) na última vez. D.C. al Fine volta ao começo e termina no Fine.'],
      confira: [['D.S. (dal segno) quer dizer:', 'Voltar ao sinal 𝄋', 'Voltar ao começo', 'Ir para o fim', 'Tocar mais devagar'], ['D.C. al Fine quer dizer:', 'Voltar ao começo e terminar no Fine', 'Pular para a coda', 'Repetir o último compasso', 'Parar'],
        ['O primeiro passo do roteiro antes de ler é:', 'Clave e armadura (o tom)', 'A dinâmica', 'O título', 'A letra']],
      gera: [], leitura: { nome: 'Leitura final', padrao: [[0, 1], [4, 0.5], [5, 0.5], [7, 1], [12, 1], [11, 1.5], [9, 0.5], [7, 2], [5, 1], [4, 1], [2, 0.5], [4, 0.5], [5, 1], [4, 2], [2, 1], [0, 1]] } }
  };
  // ordem das lições em cada curso (uma por aula; Teoria tem duas em algumas aulas)
  var SEQ = {
    'Violão': ['pauta', 'figuras', 'compasso', 'oitava', 'pausas', 'colcheias', 'tres', 'ponto', 'graves-violao', 'acidentes', 'agudas', 'escala-maior',
      'intervalos', 'armadura-sol', 'armadura-fa', 'semicolcheias', 'triades', 'menor', 'sincope', 'campo', 'tablatura', 'cifra', 'primeira-vista', 'sinais'],
    'Guitarra': ['pauta', 'figuras', 'compasso', 'tablatura', 'colcheias', 'cifra', 'intervalos', 'pausas'],
    'Teclado': ['pauta', 'figuras', 'compasso', 'oitava', 'clave-fa', 'colcheias', 'triades', 'campo', 'acidentes', 'escala-maior', 'armadura-sol', 'menor', 'pausas', 'ponto', 'intervalos', 'sincope'],
    'Teclado Pro': ['primeira-vista', 'semicolcheias', 'armaduras-sust', 'armaduras-bem', 'tetrades-pauta', 'sistema', 'campo', 'tensoes', 'intervalos', 'cifra', 'escala-maior', 'dominantes',
      'tercinas', 'sinais', 'sincope', 'tres', 'menor', 'triades', 'nashville', 'modos', 'ponto', 'lead-sheet', 'transposicao', 'roteiro'],
    'Piano': ['pauta', 'figuras', 'clave-fa', 'compasso', 'oitava', 'armadura-sol', 'sinais', 'triades'],
    'Canto': ['pauta', 'figuras', 'compasso', 'oitava', 'pausas', 'colcheias', 'intervalos', 'triades'],
    'Teoria': [['pauta', 'clave-fa'], ['figuras', 'compasso'], ['intervalos', 'acidentes'], ['escala-maior', 'armadura-sol'], ['menor', 'armadura-fa'], ['triades'], ['campo'], ['sinais', 'sincope']]
  };

  // ---------- Perguntas de cada aula (a prova do módulo sorteia entre elas) ----------
  var PERGUNTAS = {
    'Canto': {
      'Respiração e apoio': [['Na respiração do canto, ao inspirar:', 'A barriga se expande e os ombros não sobem', 'Os ombros sobem', 'A barriga entra', 'O peito estufa e trava'], ['No exercício 4-4-8, os 8 tempos são para:', 'Soltar o ar em "sss" controlado', 'Inspirar', 'Segurar o ar', 'Descansar']],
      'Afinação': [['Quando a nota não "encaixa", o certo é:', 'Parar, ouvir a nota de novo e tentar outra vez', 'Cantar mais forte', 'Continuar sem parar', 'Cantar mais rápido'], ['O arpejo 1-3-5-3-1 usa quais graus?', '1º, 3º e 5º', '1º, 2º e 3º', '1º, 4º e 5º', 'Todos os sete']],
      'Resistência': [['Resistência vocal vem:', 'Do apoio da respiração', 'De apertar a garganta', 'De cantar sempre forte', 'De cantar mais agudo'], ['Messa di voce é:', 'Começar fraco, crescer e voltar a diminuir na mesma nota', 'Cantar staccato', 'Cantar muito rápido', 'Deslizar como sirene']],
      'Tessitura e extensão': [['Extensão vocal é:', 'Da nota mais grave à mais aguda que você canta', 'O volume máximo da voz', 'O tempo que você segura uma nota', 'A velocidade da voz'], ['Para ganhar extensão, o certo é:', 'Ir aos poucos, só até onde a voz sai sem apertar', 'Forçar o agudo todo dia', 'Gritar no agudo', 'Cantar só no grave']],
      'Articulação e dicção': [['No coral, boa dicção serve para:', 'O público entender a letra', 'Cantar mais alto', 'Respirar menos', 'Afinar o piano'], ['Trocar as vogais numa nota longa sem mudar a nota treina:', 'Articulação sem perder a afinação', 'Extensão', 'Respiração 4-4-8', 'Staccato']],
      'Registros: voz de peito e de cabeça': [['A voz de peito é:', 'A voz da fala, mais cheia', 'A voz mais leve e aguda', 'O falsete', 'O sussurro'], ['O objetivo nos registros é:', 'Passar de um para o outro sem a voz quebrar', 'Cantar só de peito', 'Cantar só de cabeça', 'Evitar o agudo']],
      'Ressonância': [['Ressonância é:', 'Onde o som vibra no corpo', 'A força do ar', 'A afinação', 'O ritmo'], ['O "Mmm" de boca fechada deve vibrar:', 'Nos lábios e no nariz', 'Na barriga', 'Na garganta apertada', 'Nos ombros']],
      'Cantando em vozes': [['No coral, cada naipe:', 'Canta uma nota do acorde', 'Canta a melodia junto', 'Toca um instrumento', 'Canta sem acompanhamento'], ['Qual naipe canta mais agudo?', 'Soprano', 'Contralto', 'Tenor', 'Baixo']]
    },
    'Teclado': {
      'Conhecendo o teclado': [['No teclado, o dedo 1 é o:', 'Polegar', 'Indicador', 'Mínimo', 'Médio'], ['O Dó fica:', 'À esquerda do grupo de 2 teclas pretas', 'À direita do grupo de 3 pretas', 'Entre duas pretas', 'Sempre no centro do teclado']],
      'Escala de Dó maior': [['Na escala de Dó (mão direita), o polegar passa por baixo depois de qual nota?', 'Mi (dedo 3)', 'Sol', 'Ré', 'Si'], ['Quando subir o andamento do metrônomo?', 'Quando tocar 3 vezes seguidas sem erro', 'A cada exercício', 'Nunca', 'Quando cansar']],
      'Acordes maiores: C, F e G': [['O acorde de Dó maior (C) é:', 'Dó, Mi e Sol', 'Dó, Fá e Lá', 'Ré, Fá e Lá', 'Dó, Mi♭ e Sol'], ['Com quais dedos da mão direita se toca o acorde de 3 notas?', '1, 3 e 5', '1, 2 e 3', '2, 3 e 4', '1, 4 e 5']],
      'Acordes menores e a progressão mais usada': [['Para transformar C em Cm:', 'Abaixe meio tom a nota do meio (a 3ª)', 'Suba a nota de cima', 'Tire a nota de baixo', 'Toque uma oitava acima'], ['A progressão "de milhares de músicas" da aula é:', 'C – G – Am – F', 'C – D – E – F', 'Am – Bm – Cm – Dm', 'C – Cm – C – Cm']],
      'Mão esquerda no baixo': [['Nesta aula, a mão esquerda toca:', 'Só a nota que dá nome ao acorde (o baixo)', 'O acorde completo', 'A melodia', 'Nada'], ['Em Am, o baixo é:', 'Lá', 'Dó', 'Mi', 'Sol']],
      'Levadas e ritmo': [['Na levada pop da aula, o baixo cai nos tempos:', '1 e 3', '2 e 4', 'Só no 4', 'Em todos'], ['Acorde duas vezes por tempo é tocar em:', 'Colcheias', 'Semínimas', 'Mínimas', 'Semibreves']],
      'Inversões': [['Inversão é:', 'O mesmo acorde com as notas em outra ordem', 'Um acorde menor', 'Tocar a música de trás para frente', 'Um acorde de 4 notas'], ['Para que servem as inversões?', 'Para a mão quase não sair do lugar', 'Para mudar o tom', 'Para tocar mais forte', 'Para tocar mais rápido']],
      'Campo harmônico e primeira música': [['Os acordes do campo harmônico de Dó são:', 'C, Dm, Em, F, G, Am e Bdim', 'C, D, E, F, G, A e B', 'C, Cm, D, Dm, E, Em e F', 'Am, Bm, Cm, Dm, Em, Fm e Gm'], ['No tom de Dó, I – vi – ii – V é:', 'C – Am – Dm – G', 'C – A – D – G', 'C – Em – F – G', 'Am – C – G – F']],
      'Escalas maiores: Sol, Ré e Fá': [['Na escala de Sol maior, o Fá♯ (mão direita) é tocado com o dedo:', '4', '3', '5', '1'], ['Fá maior tem qual acidente?', 'Si♭', 'Fá♯', 'Dó♯', 'Mi♭']],
      'Escalas menores': [['A relativa menor de Dó maior é:', 'Lá menor', 'Mi menor', 'Ré menor', 'Dó menor'], ['A menor harmônica de Lá tem:', 'Sol♯', 'Fá♯', 'Dó♯', 'Si♭']],
      'Arpejos maiores e menores': [['Arpejo é:', 'O acorde tocado uma nota de cada vez', 'Uma escala rápida', 'Um acorde com 7ª', 'Tocar as duas mãos juntas'], ['A digitação do arpejo na mão direita é:', '1-2-3-5', '1-2-3-4', '1-3-4-5', '2-3-4-5']],
      'Arpejos em duas oitavas': [['No arpejo em duas oitavas subindo (mão direita), o polegar passa depois do dedo:', '3', '2', '4', '5'], ['Ao passar o polegar, o punho:', 'Não pula, fica nivelado', 'Sobe bastante', 'Gira para fora', 'Para o movimento']],
      'Blues: escala, baixo e 12 compassos': [['Quantos compassos tem o blues da aula?', '12', '8', '16', '4'], ['A escala blues de Dó tem:', 'Dó, Mi♭, Fá, Fá♯, Sol, Si♭', 'Dó, Ré, Mi, Fá, Sol, Lá, Si', 'Dó, Mi, Sol, Si', 'Dó, Ré, Mi, Sol, Lá']],
      'Frases de blues': [['Lick é:', 'Uma frase curta para usar no improviso', 'Um acorde com sétima', 'Um tipo de compasso', 'Uma pausa'], ['A "nota triste" da aula é o Mi♭ indo para:', 'Mi', 'Ré', 'Fá', 'Dó']],
      'Jazz: tétrades e o ii-V-I': [['O ii-V-I em Dó é:', 'Dm7 – G7 – C7M', 'C – F – G', 'Am – Dm – G', 'Em – A7 – D'], ['Colcheias com swing soam:', 'Longa-curta, longa-curta', 'Todas iguais', 'Curta-longa', 'Como semínimas']],
      'Independência das mãos': [['Se as mãos travarem juntas, o certo é:', 'Tocar cada mão sozinha e juntar de novo, devagar', 'Acelerar', 'Tocar só a direita', 'Parar de estudar'], ['A mão esquerda é a "bateria", por isso:', 'Não pode atrasar', 'Pode mudar o tempo', 'Toca mais forte que tudo', 'Fica parada']]
    },
    'Teclado Pro': {
      'Rotina de estudo profissional': [['Prática deliberada é:', 'Estudar no limite do que consegue, devagar, corrigindo na hora', 'Repetir o que já sai fácil', 'Estudar muitas horas sem parar', 'Tocar só músicas conhecidas'], ['O ciclo das quartas começa:', 'C – F – B♭ – E♭', 'C – G – D – A', 'C – D – E – F', 'C – E – G – B']],
      'Técnica: Hanon e independência dos dedos': [['No Hanon, quais dedos pedem mais atenção?', '4 e 5', '1 e 2', '2 e 3', '1 e 5'], ['Quando subir o bpm no Hanon?', 'Só quando sair limpo', 'Todo dia, mesmo errando', 'Nunca', 'Quando o punho doer']],
      'Escalas em todos os tons: sustenidos': [['Dó, Sol, Ré, Lá, Mi e Si maior usam na mão direita:', '1-2-3, polegar, 1-2-3-4-5', '1-2-3-4, polegar, 1-2-3', '2-3-4, polegar, 1-2-3', '1-2, polegar, 1-2-3-4-5'], ['Lá maior tem quantos sustenidos?', '3', '2', '4', '1']],
      'Escalas em todos os tons: bemóis': [['Nos tons com bemol, a regra dos polegares é:', 'Polegares no Dó e no Fá', 'Polegares no Si♭', 'Polegar só na tônica', 'Polegares no Mi e no Si'], ['Nos tons com bemol, o dedo 4 cai sempre em:', 'Si♭', 'Mi♭', 'Fá', 'Dó']],
      'Tétrades nos 12 tons': [['C7 tem as notas:', 'Dó – Mi – Sol – Si♭', 'Dó – Mi – Sol – Si', 'Dó – Mi♭ – Sol – Si♭', 'Dó – Mi♭ – Sol♭ – Si♭'], ['Cm7(♭5) se chama:', 'Meio-diminuto', 'Diminuto', 'Aumentado', 'Sétima maior']],
      'Inversões e condução de vozes': [['Condução de vozes é:', 'Cada voz andar o mínimo possível de um acorde para o outro', 'Tocar todas as vozes forte', 'Mudar de timbre', 'Tocar a melodia na esquerda'], ['C7M/E quer dizer:', 'C7M com o Mi no baixo (1ª inversão)', 'C7M e depois E', 'Mi com sétima maior', 'C7M sem a terça']],
      'ii-V-I nos 12 tons': [['O ii-V-I de Fá maior é:', 'Gm7 – C7 – F7M', 'Dm7 – G7 – C7M', 'Cm7 – F7 – B♭7M', 'Am7 – D7 – G7M'], ['O ii-V-i menor de Dó é:', 'Dm7(♭5) – G7 – Cm7', 'Dm7 – G7 – C7M', 'D7 – G7 – Cm', 'Dm – Gm – Cm']],
      'Voicings sem tônica (estilo Bill Evans)': [['No voicing sem tônica, quem toca a tônica é:', 'O baixista', 'A mão direita', 'O baterista', 'Ninguém'], ['O voicing sem tônica da aula usa:', '3ª, 5ª, 7ª e 9ª', 'Tônica, 3ª e 5ª', 'Só tônica e 5ª', 'Tônica e oitava']],
      'Shells e notas-guia': [['Notas-guia são:', 'A 3ª e a 7ª do acorde', 'A tônica e a 5ª', 'A 9ª e a 13ª', 'Só a tônica'], ['Shell é:', 'Tônica + 3ª ou 7ª na mão esquerda', 'Um acorde de 5 notas', 'Uma escala', 'Um timbre de órgão']],
      'Tensões: 9ª, 11ª, 13ª e sus': [['Pela regra da aula, a 13ª e a ♭9 ficam bem em:', 'Acordes dominantes', 'Acordes menores', 'Acordes diminutos', 'Qualquer tríade'], ['O sus4 troca a 3ª pela:', '4ª', '2ª', '6ª', '7ª']],
      'Voicings em quartas (som modal)': [['O voicing em quartas empilha:', 'Intervalos de 4ª', 'Terças', 'Segundas', 'Oitavas'], ['Ré dórico tem as notas:', 'Ré, Mi, Fá, Sol, Lá, Si, Dó', 'Ré, Mi, Fá♯, Sol, Lá, Si, Dó♯', 'Ré, Fá, Sol, Lá, Dó', 'Ré, Mi♭, Fá, Sol, Lá, Si♭, Dó']],
      'Rearmonização: dominantes secundários e trítono': [['O dominante secundário de Dm7 é:', 'A7', 'G7', 'E7', 'D7'], ['O SubV7 de G7 é:', 'D♭7', 'D7', 'C♯m7', 'A♭7']],
      'Tempo de verdade: 2 e 4 e subdivisões': [['O clique só no 2 e no 4 imita:', 'A caixa da bateria', 'O bumbo', 'O baixo', 'A melodia'], ['Tercina é:', 'Três notas no espaço de um tempo', 'Três tempos por compasso', 'Três acordes', 'Uma nota de três tempos']],
      'Pop e balada': [['Na balada da aula, a mão esquerda:', 'Segura a tônica', 'Faz as colcheias', 'Toca a melodia', 'Fica parada'], ['Para a balada crescer no refrão, a aula sugere:', 'Acordes longos no começo e colcheias só no refrão', 'Tocar tudo forte desde o início', 'Tirar o baixo no refrão', 'Mudar de tom no verso']],
      'Bossa nova': [['Na bossa, o tecladista:', 'Não marca o tempo: a direita flutua no contratempo', 'Marca todos os tempos forte', 'Toca só a melodia', 'Faz o baixo em colcheias'], ['O baixo da bossa da aula toca:', 'Tônica e quinta', 'Só a tônica', 'A escala inteira', 'A terça e a sétima']],
      'Samba e baião': [['No samba, a mão esquerda imita:', 'O surdo', 'A zabumba', 'O triângulo', 'A caixa'], ['No baião, a mão esquerda imita:', 'A zabumba', 'O surdo', 'O pandeiro', 'O agogô']],
      'Louvor e gospel: acordes de passagem': [['Para que servem os acordes de passagem?', 'Ligar os acordes principais e criar movimento', 'Mudar de tom', 'Terminar a música', 'Substituir a melodia'], ['F♯°7 entre F e C/G é um acorde:', 'Diminuto de passagem', 'Dominante', 'Meio-diminuto', 'Sus4']],
      'Percepção: intervalos e acordes': [['No ditado, o certo é:', 'Ouvir, escrever e só depois conferir', 'Olhar o gabarito antes', 'Adivinhar rápido', 'Pular os difíceis'], ['O acorde aumentado tem:', 'Duas 3ªs maiores', 'Duas 3ªs menores', '3ª menor e 3ª maior', 'Uma 4ª e uma 5ª']],
      'Tirar de ouvido, transcrever e Nashville': [['O 1º passo para tirar uma música de ouvido é:', 'Achar a tônica (a nota de repouso)', 'Tirar o solo', 'Escrever a letra', 'Ajustar o timbre'], ['1 – 5 – 6m – 4 no tom de Ré é:', 'D – A – Bm – G', 'D – G – Em – A', 'C – G – Am – F', 'D – A – B – G']],
      'Improvisação: modos e pentatônicas': [['Sobre G7 no tom de Dó, a aula usa:', 'Sol mixolídio', 'Sol jônio', 'Sol dórico', 'Sol lócrio'], ['A pentatônica menor de Ré tem:', 'Ré, Fá, Sol, Lá, Dó', 'Ré, Mi, Fá♯, Lá, Si', 'Ré, Fá, Lá, Dó, Mi', 'Ré, Mi, Sol, Lá, Si']],
      'Linguagem: frases de ii-V-I em vários tons': [['A aula ensina a improvisar como quem aprende uma língua:', 'Decorando frases e levando para todos os tons', 'Inventando tudo na hora', 'Tocando só escalas', 'Tocando só arpejos'], ['Aproximação cromática é chegar na nota do acorde:', 'Por meio tom abaixo', 'Por um salto de oitava', 'Por uma 5ª', 'Por uma pausa']],
      'O tecladista na banda: timbres e arranjo': [['O maior erro do tecladista na banda, segundo a aula:', 'Tocar demais', 'Tocar pouco', 'Usar pad', 'Usar piano'], ['Split é:', 'Cada metade do teclado com um timbre', 'Dois timbres juntos', 'Um efeito de eco', 'Trocar de tom']],
      'Ao vivo: click, playback, in-ear e direção musical': [['No in-ear, o que vem primeiro na mixagem?', 'O click e a voz principal', 'O seu teclado', 'A bateria', 'A plateia'], ['No roteiro de cada música, anote:', 'Tom, andamento, timbre e quem começa', 'Só o nome', 'Só a letra', 'O figurino']],
      'Estúdio e carreira': [['Dor no punho ao tocar é sinal para:', 'Parar e descansar', 'Insistir até passar', 'Tocar mais forte', 'Aumentar o bpm'], ['A aula sugere um repertório de:', '30 músicas de cor, em pelo menos 2 tons', '5 músicas', 'Só músicas novas', 'Só instrumentais']]
    },
    'Piano': {
      'Postura e o Dó central': [['A altura certa do banco deixa:', 'O antebraço reto', 'Os ombros levantados', 'Os punhos abaixo das teclas', 'Os pés pendurados'], ['O Dó central fica:', 'No meio do piano, à esquerda das 2 teclas pretas', 'Na ponta esquerda', 'À direita das 3 pretas', 'Na ponta direita']],
      'Leitura: clave de sol e ritmo': [['As linhas da clave de sol (de baixo para cima) são:', 'Mi – Sol – Si – Ré – Fá', 'Fá – Lá – Dó – Mi – Sol', 'Sol – Si – Ré – Fá – Lá', 'Dó – Mi – Sol – Si – Ré'], ['Bater palmas numa semibreve é:', 'Uma palma e segurar 4 tempos', 'Quatro palmas', 'Duas palmas', 'Meia palma']],
      'Clave de fá e mão esquerda': [['Na clave de fá, o Fá fica na:', '4ª linha', '2ª linha', '3º espaço', '1ª linha'], ['Os espaços da clave de fá (de baixo para cima) são:', 'Lá – Dó – Mi – Sol', 'Fá – Lá – Dó – Mi', 'Sol – Si – Ré – Fá', 'Mi – Sol – Si – Ré']],
      'Mãos juntas': [['Movimento paralelo é quando:', 'As duas mãos vão para o mesmo lado', 'As mãos se abrem', 'Uma mão para', 'As mãos se cruzam'], ['O movimento contrário começa com:', 'Os dois polegares no Dó', 'Os dois mínimos no Dó', 'As mãos uma oitava longe', 'Só a mão direita']],
      'Escala de Dó com passagem do polegar': [['Na passagem do polegar, o punho:', 'Não levanta', 'Sobe', 'Gira', 'Bate na tecla'], ['A digitação da mão direita subindo é:', '1-2-3-1-2-3-4-5', '1-2-3-4-1-2-3-4', '1-2-1-2-3-4-5-1', '5-4-3-2-1-3-2-1']],
      'Escalas de Sol e Fá maior': [['Sol maior tem:', 'Um sustenido (Fá♯)', 'Um bemol (Si♭)', 'Dois sustenidos', 'Nenhum acidente'], ['Em Fá maior (mão direita), o polegar passa depois do:', 'Si♭ (dedo 4)', 'Lá (dedo 3)', 'Dó (dedo 5)', 'Sol (dedo 2)']],
      'Dinâmica e articulação': [['Legato é:', 'Notas ligadas', 'Notas curtas', 'Notas fortes', 'Notas com pausa'], ['f (forte) na partitura quer dizer:', 'Tocar forte', 'Tocar fraco', 'Tocar rápido', 'Repetir']],
      'Arpejos, cadência e primeira peça': [['A cadência mais usada da música é:', 'I – IV – V – I', 'I – II – III – IV', 'V – IV – III – II', 'I – VI – I – VI'], ['Em Dó, I – IV – V – I é:', 'C – F – G – C', 'C – D – E – C', 'C – Am – Dm – C', 'C – E – G – C']]
    },
    'Violão': {
      'Conhecendo o violão e afinação': [['A afinação padrão, da 6ª para a 1ª corda, é:', 'Mi – Lá – Ré – Sol – Si – Mi', 'Mi – Si – Sol – Ré – Lá – Mi', 'Ré – Lá – Ré – Sol – Si – Mi', 'Dó – Fá – Si♭ – Mi♭ – Sol – Dó'], ['Na mão direita, o polegar (p) toca as cordas:', '6, 5 e 4', '1, 2 e 3', 'Só a 1ª', 'Todas juntas'], ['A 1ª corda é:', 'A mais fina (Mi agudo)', 'A mais grossa (Mi grave)', 'A corda Lá', 'A corda Sol']],
      'Primeiros acordes: Em e Am': [['No desenho do acorde, o × em cima de uma corda quer dizer:', 'Não tocar essa corda', 'Tocar solta', 'Fazer pestana', 'Tocar com o polegar'], ['O círculo vazio (○) no desenho quer dizer:', 'Corda solta', 'Corda abafada', 'Dedo 1', 'Pestana']],
      'Leitura: Sol, Lá, Si e Dó nas cordas 3 e 2': [['O Sol da 2ª linha se toca no violão na:', '3ª corda solta', '2ª corda solta', '1ª corda, casa 3', '4ª corda, casa 5'], ['O Dó do 3º espaço se toca na:', '2ª corda, casa 1', '3ª corda, casa 2', '2ª corda solta', '1ª corda, casa 1']],
      'Acordes D, A e E': [['Na troca entre dois acordes, a dica da aula é:', 'Deixar parado o dedo que fica no mesmo lugar', 'Tirar todos os dedos', 'Olhar para a mão direita', 'Tocar mais rápido'], ['No acorde D, quais cordas não se tocam?', '6ª e 5ª', 'Nenhuma', 'Só a 1ª', '4ª e 3ª']],
      'G e C: a primeira progressão': [['Em G – Em – C – D, o primeiro acorde é:', 'Sol maior', 'Dó maior', 'Mi menor', 'Ré maior'], ['O desafio da aula é:', 'Trocar de G para C em menos de 1 tempo', 'Tocar G com pestana', 'Tocar sem metrônomo', 'Tocar só C']],
      'Ritmo: batidas': [['Na batida, a mão direita:', 'Nunca para: sobe e desce o tempo todo', 'Para entre os tempos', 'Só desce', 'Só sobe'], ['Na levada pop ↓ ↓↑ ↑↓↑, a seta ↑ quer dizer:', 'Batida para cima', 'Batida para baixo', 'Pausa', 'Dedilhado']],
      'Leitura: Dó, Ré, Mi e Fá e a primeira melodia': [['O Dó da linha suplementar, no violão, fica na:', '5ª corda, casa 3', '2ª corda, casa 1', '6ª corda solta', '4ª corda, casa 2'], ['O Ré logo abaixo da pauta fica na:', '4ª corda solta', '3ª corda solta', '5ª corda, casa 2', '2ª corda, casa 3']],
      'Dedilhado': [['No dedilhado, o polegar toca:', 'O baixo, a nota que dá nome ao acorde', 'A 1ª corda', 'Todas as cordas', 'Só cordas soltas'], ['p-i-m-a quer dizer:', 'Polegar, indicador, médio, anelar', 'Palma, índice, meio, alto', 'Pestana, indicador, mínimo, anelar', 'Polegar, indicador, mínimo, anelar']],
      'Leitura: as cordas graves': [['O Mi da 6ª corda solta aparece na pauta:', 'Bem abaixo, com 3 linhas suplementares', 'Na 1ª linha', 'No 1º espaço', 'Na 5ª linha'], ['A 5ª corda solta é a nota:', 'Lá', 'Mi', 'Ré', 'Sol']],
      'Acordes com sétima': [['Para que serve a sétima no acorde?', 'Criar tensão que pede resolução', 'Deixar o acorde menor', 'Tirar o baixo', 'Abafar o som'], ['Em Em – Am – B7 – Em, qual acorde cria a tensão?', 'B7', 'Am', 'Em', 'Nenhum']],
      'Baixo alternado e valsa': [['Na valsa, a mão direita faz:', 'Baixo no 1, acorde no 2 e no 3', 'Acorde nos três tempos', 'Baixo nos três tempos', 'Acorde no 1, baixo no 2 e no 3'], ['A valsa é em compasso:', '3/4', '4/4', '2/4', '6/8']],
      'Escala de Dó maior na primeira posição': [['"Um dedo por casa" quer dizer:', 'Casa 1 = dedo 1, casa 2 = dedo 2, casa 3 = dedo 3', 'Usar só o dedo 1', 'Tocar só cordas soltas', 'Pular casas'], ['A escala de Dó maior da aula começa na:', '5ª corda, casa 3', '6ª corda solta', '4ª corda solta', '1ª corda solta']],
      'Pestana e primeira música': [['Na pestana, o dedo 1 deve ficar:', 'Reto e perto do traste', 'Dobrado no meio da casa', 'Em cima do traste', 'Só na 1ª corda'], ['Se a pestana doer, o certo é:', 'Parar e descansar', 'Apertar mais forte', 'Continuar até passar', 'Trocar de violão']],
      'Leitura: Sol maior e o Fá♯': [['Na escala de Sol maior da aula, o Fá♯ agudo fica na:', '1ª corda, casa 2', '1ª corda, casa 1', '2ª corda, casa 3', '3ª corda, casa 4'], ['A armadura com um ♯ é do tom de:', 'Sol maior', 'Ré maior', 'Fá maior', 'Dó maior']],
      'Pestana na 2ª casa: Bm, F♯m e o tom de Ré': [['Bm e F♯m usam pestana na casa:', '2', '1', '3', '5'], ['O campo harmônico de Ré maior é:', 'D – Em – F♯m – G – A – Bm', 'D – E – F♯ – G – A – B', 'D – Em – Fm – G – Am – Bm', 'D – G – A – D – G – A']],
      'Levadas brasileiras: baião e xote': [['No baião, o polegar imita:', 'A zabumba', 'O surdo', 'O pandeiro', 'A caixa'], ['No xote, o acento cai nos tempos:', '2 e 4', '1 e 3', 'Só no 1', 'Em nenhum']],
      'Campo harmônico de Dó e funções': [['No tom de Dó, G7 tem função de:', 'Dominante (tensão)', 'Tônica (repouso)', 'Subdominante', 'Nenhuma'], ['Quais acordes têm função de tônica em Dó?', 'C, Am e Em', 'F e Dm', 'G7 e Bdim', 'C, F e G']],
      'Tonalidades menores': [['Em Lá menor, o acorde do V grau é:', 'E7', 'Em', 'Dm', 'G'], ['O Sol♯ em Lá menor vem da escala:', 'Menor harmônica', 'Maior', 'Pentatônica', 'Blues']],
      'Leitura: colcheias, ponto de aumento e pausas': [['Na pausa, a mão do violonista:', 'Abafa as cordas para o silêncio ficar limpo', 'Continua tocando', 'Toca mais forte', 'Troca de acorde'], ['Contar "1 e 2 e" ajuda a ler:', 'Colcheias', 'Semibreves', 'Mínimas', 'Pausas de semibreve']],
      'Arpejos e dedilhado de balada': [['No dedilhado de balada da aula, cada nota vale:', 'Uma colcheia (meio tempo)', 'Um tempo', 'Dois tempos', 'Um compasso'], ['Arpejo é:', 'O acorde tocado uma nota de cada vez', 'Um acorde abafado', 'Uma escala', 'Uma batida']],
      'Pentatônica no violão': [['As notas da pentatônica de Lá menor são:', 'Lá – Dó – Ré – Mi – Sol', 'Lá – Si – Dó – Ré – Mi', 'Lá – Dó♯ – Mi – Fá♯ – Sol', 'Dó – Ré – Mi – Sol – Lá – Si'], ['A posição da pentatônica da aula começa na casa:', '5', '1', '3', '7']],
      'Pestana na 5ª corda: B, Cm e C♯m': [['O desenho de Cm com pestana é o de qual acorde aberto?', 'Am', 'Em', 'D', 'G'], ['Movendo o mesmo desenho de pestana pelo braço:', 'Muda o acorde e mantém o tipo (maior ou menor)', 'O acorde vira menor', 'Sempre dá Dó', 'Não muda nada']],
      'Cifra, tablatura e partitura juntas': [['A tablatura mostra:', 'A corda e a casa de cada nota', 'O ritmo exato', 'A dinâmica', 'Os acordes'], ['Dsus4 troca a 3ª do acorde pela:', '4ª', '2ª', '5ª', '7ª']],
      'Repertório e apresentação': [['Tocando com metrônomo, se errar:', 'Não para: continua no tempo', 'Volta ao começo', 'Desliga o metrônomo', 'Pula a parte'], ['Antes de tocar, a aula pede para marcar na cifra:', 'As partes: introdução, verso e refrão', 'Só o primeiro acorde', 'O nome do autor', 'O ano da música']]
    },
    'Guitarra': {
      'Guitarra, afinação e palheta': [['Como segurar a palheta?', 'Entre o polegar e a lateral do indicador, com a ponta para fora', 'Com a mão fechada', 'Entre o indicador e o médio', 'Só com o polegar'], ['Palhetada alternada é:', '↓ no tempo e ↑ no "e"', 'Só para baixo', 'Só para cima', 'Duas para baixo e uma para cima']],
      'Exercício cromático': [['No exercício cromático, "um dedo por casa" é:', 'Dedo 1 na casa 1, dedo 2 na 2, dedo 3 na 3, dedo 4 na 4', 'Só o dedo 1', 'Dedos 1 e 3', 'Pular casas'], ['Quando subir o bpm?', 'Quando sair limpo 3 vezes', 'Sempre', 'Nunca', 'Quando errar']],
      'Power chords': [['Power chord é formado por:', 'Tônica e quinta', 'Tônica e terça', 'Terça e quinta', 'Tônica e sétima'], ['O desenho do power chord:', 'Se move pelo braço e muda de nota', 'Só funciona na 1ª casa', 'Precisa de cordas soltas', 'É sempre menor']],
      'Pentatônica menor de Lá': [['A pentatônica menor tem quantas notas?', '5', '7', '6', '4'], ['A posição 1 da pentatônica de Lá começa na casa:', '5', '1', '7', '12']],
      'Palm mute e ritmo': [['Palm mute é:', 'Abafar as cordas com a lateral da mão perto da ponte', 'Tocar sem palheta', 'Fazer bend', 'Tocar com distorção'], ['No palm mute da aula, a palhetada é:', 'Só para baixo', 'Só para cima', 'Alternada rápida', 'Com os dedos']],
      'Acordes abertos para base': [['Na guitarra base, os acordes abertos são tocados:', 'Com palheta', 'Só com o polegar', 'Sempre com pestana', 'Sem a mão direita'], ['Em E – A – D – A, o acorde de repouso (tônica) é:', 'A (Lá)', 'E (Mi)', 'D (Ré)', 'Nenhum']],
      'Ligados e bends': [['Hammer-on é:', 'Martelar um dedo na corda para soar a nota sem palhetar', 'Puxar a corda para baixo', 'Abafar a corda', 'Tocar duas cordas juntas'], ['No bend da aula (3ª corda, casa 7), o alvo soa como a casa:', '9', '8', '10', '12']],
      'Primeiro improviso': [['No primeiro improviso, a aula pede:', 'Poucas notas, frases curtas e respirar entre elas', 'Tocar o mais rápido possível', 'Usar todas as notas', 'Não parar nunca'], ['Sobre Am – G – F – G, a escala usada é:', 'Pentatônica de Lá menor', 'Escala de Sol maior', 'Escala cromática', 'Pentatônica de Fá']]
    },
    'Teoria': {
      'Notas, pauta e claves': [['A clave de dó dá nome à nota:', 'Da linha em que ela está', 'Da 2ª linha sempre', 'Da 4ª linha sempre', 'Do 1º espaço'], ['Em cifra, a nota Lá é:', 'A', 'L', 'La', 'H']],
      'Ritmo, figuras e compassos': [['A semicolcheia vale:', '1/4 de tempo', 'Meio tempo', '1 tempo', '2 tempos'], ['Os acentos do compasso quaternário são:', 'FORTE – fraco – meio forte – fraco', 'FORTE – fraco – fraco – fraco', 'fraco – FORTE – fraco – FORTE', 'Todos iguais']],
      'Intervalos': [['Dó–Mi♭ é uma:', '3ª menor', '3ª maior', '2ª maior', '4ª justa'], ['O trítono tem:', '3 tons', '2 tons', '2 tons e meio', '3 tons e meio']],
      'Escalas maiores e armaduras': [['Lá maior tem quantos sustenidos?', '3', '2', '4', '1'], ['Mi♭ maior tem quantos bemóis?', '3', '2', '4', '1']],
      'Escalas menores': [['A menor melódica sobe com:', '6º e 7º graus elevados', 'Só o 7º elevado', 'Só o 3º abaixado', 'Todos os graus naturais'], ['A relativa menor de Fá maior é:', 'Ré menor', 'Lá menor', 'Mi menor', 'Sol menor']],
      'Tríades e tétrades': [['A tríade aumentada tem:', '3ª maior + 3ª maior', '3ª menor + 3ª menor', '3ª maior + 3ª menor', '3ª menor + 3ª maior'], ['Tétrade é:', 'Tríade + 7ª', 'Duas tríades', 'Acorde sem 5ª', 'Acorde de 2 notas']],
      'Campo harmônico e funções': [['A função subdominante no tom maior fica com:', 'IV e ii', 'V e vii°', 'I e vi', 'iii e V'], ['Bm7(♭5) no tom de Dó é o grau:', 'VII', 'II', 'V', 'III']],
      'Percepção e simulado': [['No ditado melódico, o certo é:', 'Ouvir quantas vezes precisar e escrever antes de ver o gabarito', 'Ver o gabarito antes', 'Escrever sem ouvir', 'Ouvir uma vez só'], ['No ditado harmônico em Dó, F é o grau:', 'IV', 'V', 'II', 'VI']]
    }
  };

  // como cada instrumento lê: nota de partida (o violão soa uma oitava abaixo do escrito) e o texto do exercício
  var LER = {
    'Violão': { raiz: 48, texto: function (n, lp) { return 'Leitura de partitura: ' + n + '. Use o que aprendeu em "' + lp + '": diga o nome das notas no ritmo e depois toque junto (a tablatura embaixo mostra corda e casa).'; } },
    'Guitarra': { raiz: 48, texto: function (n, lp) { return 'Leitura de partitura: ' + n + '. Use o que aprendeu em "' + lp + '": diga as notas no ritmo e depois toque junto, com palhetada alternada.'; } },
    'Teclado': { raiz: 60, raizFa: 48, maos: true, texto: function (n, lp, fa) { return 'Leitura de partitura: ' + n + (fa ? ', mão esquerda' : ', mão direita') + '. Use o que aprendeu em "' + lp + '": diga as notas no ritmo e depois toque junto.'; } },
    'Piano': { raiz: 60, raizFa: 48, maos: true, texto: function (n, lp, fa) { return 'Leitura de partitura: ' + n + (fa ? ', mão esquerda' : ', mão direita') + '. Use o que aprendeu em "' + lp + '": diga as notas no ritmo e depois toque junto.'; } },
    'Canto coral': { raiz: 60, texto: function (n, lp) { return 'Solfejo: ' + n + '. Use o que aprendeu em "' + lp + '": leia na pauta e cante dizendo o nome das notas, junto com o piano.'; } },
    'Concurso': { raiz: 60, raizFa: 48, texto: function (n, lp) { return 'Leitura e solfejo: ' + n + '. Use o que aprendeu em "' + lp + '": diga as notas no ritmo antes de ouvir e depois confira.'; } }
  };
  function itemTeoria(id) {
    var L = LICOES[id];
    return { texto: 'Teoria: ' + L.titulo, minutos: 5, vocalize: { tipo: 'teoria', titulo: L.titulo, blocos: L.blocos, confira: L.confira, n: 3 } };
  }
  function itemLeitura(instrumento, id) {
    var cfg = LER[instrumento], L = LICOES[id], le = L.leitura; if (!cfg || !le) return null;
    var fa = le.clave === 'fa' && !!cfg.raizFa, v;
    if (le.maos) v = { tipo: 'notas', demo: true, maos: le.maos, de: le.maos.E.raiz, ate: le.maos.E.raiz, bpm: 66, silaba: 'Leia na pauta', repeticoes: 1, pauta: 'sol', leitura: true };
    else {
      var extra = { pauta: fa ? 'fa' : true, leitura: true, repeticoes: 2 };
      if (le.compasso) extra.compasso = le.compasso;
      if (le.armadura) extra.armadura = le.armadura;
      if (le.bemois) extra.bemois = true;
      if (cfg.maos) extra.mao = fa ? 'E' : 'D';
      v = demo(le.padrao, fa ? cfg.raizFa : cfg.raiz, le.compasso === 3 ? 84 : 66, 'Leia na pauta', extra);
    }
    return t(cfg.texto(le.nome, L.titulo, fa), 4, v);
  }
  // Exercícios de notas que cabem certinho nos compassos ganham a partitura (sem cortar nota na barra de compasso)
  function cabeNaPauta(v) {
    if (!v || v.tipo !== 'notas' || !v.demo || v.ocultar || v.pauta || v.semPauta) return false;
    var vozes = v.maos ? Object.keys(v.maos).map(function (k) { return v.maos[k].padrao; }) : [v.padrao || []];
    var bpc = v.compasso || 4;
    return vozes.every(function (p) {
      var b = 0;
      if (!p.length || p.length > 64) return false;
      return p.every(function (n) {
        var d = Number(n[1]) || 1, ok = Math.floor(b / bpc + 1e-6) === Math.floor((b + d) / bpc - 1e-6) && [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25].indexOf(d) >= 0;
        b += d; return ok;
      });
    });
  }
  function comPauta(it) {
    if (!it.vocalize || !cabeNaPauta(it.vocalize)) return it;
    var v = {}; Object.keys(it.vocalize).forEach(function (k) { v[k] = it.vocalize[k]; });
    v.pauta = v.maos ? 'sol' : true;
    return { texto: it.texto, minutos: it.minutos, vocalize: v };
  }

  // ---------- Módulos e provas: cada módulo tem 4 aulas e termina com a prova do que foi estudado nele ----------
  var MODULOS = {
    'Canto': ['Respiração, afinação e leitura', 'Dicção, registros e vozes'],
    'Teclado': ['Primeiros passos', 'Ritmo e harmonia', 'Escalas e arpejos', 'Blues, jazz e independência'],
    'Teclado Pro': ['Técnica e escalas nos 12 tons', 'Tétrades, ii-V-I e voicings', 'Tensões e rearmonização', 'Groove e ritmos brasileiros', 'Gospel, percepção e improviso', 'Banda, palco e estúdio'],
    'Piano': ['Leitura e as duas claves', 'Escalas, dinâmica e primeira peça'],
    'Violão': ['Primeiros passos', 'Ritmo e primeiras músicas', 'Baixos, sétimas e a escala', 'Pestana e tonalidades', 'Harmonia no violão', 'Rumo ao repertório'],
    'Guitarra': ['Técnica e base', 'Ritmo, ligados e improviso'],
    'Teoria': ['Leitura, ritmo e intervalos', 'Escalas, acordes e percepção']
  };
  var CORDAS = { 'Violão': 1, 'Guitarra': 1 }, TECLAS = { 'Teclado': 1, 'Piano': 1 };
  // acordes treinados nas aulas do módulo (viram questões de desenho no braço ou de notas do acorde)
  function acordesDoModulo(info, instrumento) {
    var C = window.AmaralCanto, l = [];
    info.forEach(function (a) {
      a.itens.forEach(function (it) {
        var v = it.vocalize; if (!v || v.tipo !== 'acordes' || v.ocultar) return;
        (v.acordes || []).forEach(function (x) {
          var c = x[0], ok = CORDAS[instrumento] ? !!C.DIAGRAMAS[c] : !!C.lerAcorde(c);
          if (ok && l.indexOf(c) < 0) l.push(c);
        });
      });
    });
    return l;
  }
  function aulaDeProva(prefixo, instrumento, k, md, nivel, info, acum, ultimo) {
    var titulo = 'Prova do Módulo ' + (k + 1) + ' (' + md + ')', blocos = [], gera = [], vistos = {};
    function addGera(g) { var key = JSON.stringify(g); if (!vistos[key]) { vistos[key] = 1; gera.push(g); } }
    var licoes = [];
    info.forEach(function (a) {
      var pp = (PERGUNTAS[prefixo] || {})[a.nome]; if (pp && pp.length) blocos.push(pp);
      a.licoes.forEach(function (id) { var L = LICOES[id]; licoes.push(L.titulo); if (L.confira) blocos.push(L.confira); (L.gera || []).forEach(addGera); });
    });
    if (acum.sol.length >= 3) addGera({ tema: 'nota', clave: 'sol', notas: acum.sol.slice().sort() });
    if (acum.fa.length >= 3) addGera({ tema: 'nota', clave: 'fa', notas: acum.fa.slice().sort() });
    if (CORDAS[instrumento] && acum.sol.length >= 3) addGera({ tema: 'casa', notas: acum.sol.slice().sort() });
    var acordes = acordesDoModulo(info, instrumento);
    if (acordes.length >= 2) {
      addGera(CORDAS[instrumento] ? { tema: 'acorde-desenho', acordes: acordes } : { tema: 'acorde-notas', acordes: acordes });
      if (TECLAS[instrumento]) addGera({ tema: 'acorde-teclado', acordes: acordes });
      addGera({ tema: 'cifra', acordes: acordes });
    }
    var n = prefixo === 'Teoria' || ultimo ? 12 : 10;
    return { titulo: titulo, instrumento: instrumento, nivel: nivel,
      observacao: 'Prova sobre o que você estudou neste módulo: as lições de partitura e os assuntos das aulas. Precisa de 70% para liberar o próximo módulo. Atenção: 3 erros seguidos encerram a prova e o módulo recomeça.',
      itens: [
        t('Revisão antes da prova: releia a teoria do módulo (' + licoes.join('; ') + ') e refaça a leitura de partitura em que teve mais dificuldade.', 5),
        { texto: 'Prova do módulo: ' + n + ' questões, uma por vez.', minutos: 20,
          vocalize: { tipo: 'prova', titulo: titulo, blocos: blocos, gera: gera, n: n, minimo: 70, errosSeguidos: 3 } }
      ] };
  }

  function curso(instrumento, prefixo, aulas, nome) {
    var mods = MODULOS[prefixo] || [], seq = SEQ[prefixo] || [], lista = [], n = 0, acum = { sol: [], fa: [] };
    var porMod = mods.length ? Math.ceil(aulas.length / mods.length) : aulas.length;
    function nova(a, modulo, prova) {
      a.titulo = prefixo + ' · Aula ' + (++n) + ': ' + a.titulo; a.modulo = modulo; if (prova) a.prova = true;
      lista.push(a);
    }
    (mods.length ? mods : [null]).forEach(function (md, k) {
      var modulo = md ? 'Módulo ' + (k + 1) + ' · ' + md : '', parte = aulas.slice(k * porMod, (k + 1) * porMod), info = [];
      parte.forEach(function (a, j) {
        var licoes = [].concat(seq[k * porMod + j] || []);
        licoes.forEach(function (id) {
          var L = LICOES[id];
          (L.notas || []).forEach(function (m) { if (acum.sol.indexOf(m) < 0) acum.sol.push(m); });
          (L.notasFa || []).forEach(function (m) { if (acum.fa.indexOf(m) < 0) acum.fa.push(m); });
        });
        // a aula: teoria primeiro, depois a prática do instrumento e, no fim, a leitura com o que acabou de aprender
        var itens = licoes.map(itemTeoria).concat(a[3].map(comPauta));
        var ler = licoes.length ? itemLeitura(instrumento, licoes[licoes.length - 1]) : null;
        if (ler) itens.push(ler);
        nova({ titulo: a[0], instrumento: instrumento, nivel: a[1], observacao: a[2], itens: itens }, modulo);
        info.push({ nome: a[0], licoes: licoes, itens: itens });
      });
      if (md && parte.length) nova(aulaDeProva(prefixo, instrumento, k, md, parte[parte.length - 1][1], info, acum, k === mods.length - 1), modulo, true);
    });
    return { instrumento: instrumento, nome: nome || instrumento, aulas: lista };
  }

  // ---------- Ajudantes da trilha profissional ----------
  var CIF = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var QUARTAS = [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7];      // C F Bb Eb Ab Db Gb B E A D G
  function cif(pc, q) { return CIF[(pc % 12 + 12) % 12] + q; }
  // várias escalas maiores seguidas (sobe e desce), com a digitação de subida de cada uma
  function escalas(lista) {
    var raiz = lista[0][0], padrao = [], dedos = [];
    lista.forEach(function (e, k) {
      var r = e[0], sobe = e[1].split(' ');
      [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0].forEach(function (s, i, arr) { padrao.push([r - raiz + s, i === arr.length - 1 ? 1.5 : 0.5]); });
      dedos = dedos.concat(sobe, sobe.slice(0, 7).reverse());
    });
    return { raiz: raiz, padrao: padrao, dedos: dedos.join(' ') };
  }
  var ESC_SUST = escalas([[60, '1 2 3 1 2 3 4 5'], [67, '1 2 3 1 2 3 4 5'], [62, '1 2 3 1 2 3 4 5'], [69, '1 2 3 1 2 3 4 5'], [64, '1 2 3 1 2 3 4 5'], [71, '1 2 3 1 2 3 4 5']]);
  var ESC_SUST_E = escalas([[48, '5 4 3 2 1 3 2 1'], [43, '5 4 3 2 1 3 2 1'], [50, '5 4 3 2 1 3 2 1'], [45, '5 4 3 2 1 3 2 1'], [52, '5 4 3 2 1 3 2 1'], [47, '4 3 2 1 4 3 2 1']]);
  var ESCALA_FS = escalas([[66, '2 3 4 1 2 3 1 2']]);
  var ESC_BEM = escalas([[65, '1 2 3 4 1 2 3 4'], [70, '4 1 2 3 1 2 3 4'], [63, '3 1 2 3 4 1 2 3'], [68, '3 4 1 2 3 1 2 3'], [61, '2 3 1 2 3 4 1 2']]);
  // Hanon nº 1: graus 1-3-4-5-6-5-4-3 da escala de Dó, subindo um grau por grupo, em colcheias
  var HANON = (function () {
    var esc = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21], l = [];
    for (var g = 0; g < 7; g++) [0, 2, 3, 4, 5, 4, 3, 2].forEach(function (d) { l.push([esc[g + d], 0.5]); });
    l.push([12, 2]);
    return l;
  })();
  var HANON_D = HANON, HANON_E = HANON;
  var TETRADES_CICLO = [];
  QUARTAS.forEach(function (pc) { ['7M', '7', 'm7', 'm7(b5)'].forEach(function (q) { TETRADES_CICLO.push([cif(pc, q), 2, null, null, pc]); }); });
  function iiVI(tons) {
    var l = [];
    // o 5º item de cada acorde é o tom (para o mapa mostrar o grau certo)
    tons.forEach(function (pc) { l.push([cif(pc + 2, 'm7'), 2, null, null, pc], [cif(pc + 7, '7'), 2, null, null, pc], [cif(pc, '7M'), 4, null, null, pc]); });
    return l;
  }
  // ii-V-I sem tônica na mão esquerda: ii e I na forma A (3-5-7-9), V na forma B (7-9-3-13)
  function rootless(tons) {
    var l = [];
    tons.forEach(function (pc) {
      var m = 50 + ((pc + 5 - 50) % 12 + 12) % 12;            // a 3ª do ii (Fá em Dó), entre Ré3 e Dó♯4
      l.push([cif(pc + 2, 'm7(9)'), 2, [m, m + 4, m + 7, m + 11], 'E5 E3 E2 E1', pc],
             [cif(pc + 7, '7(13)'), 2, [m, m + 4, m + 6, m + 11], 'E5 E3 E2 E1', pc],
             [cif(pc, '7M(9)'), 4, [m - 1, m + 2, m + 6, m + 9], 'E5 E3 E2 E1', pc]);
    });
    return l;
  }
  // shells (tônica + 7ª ou 3ª) na esquerda e notas-guia na direita
  function shells(tons) {
    var l = [];
    tons.forEach(function (pc) {
      function grave(x) { return 36 + ((x % 12) + 12) % 12; }
      var ii = grave(pc + 2), v = grave(pc + 7), i = grave(pc), f = 60 + ((pc + 5) % 12 + 12) % 12;
      if (f > 66) f -= 12;
      l.push([cif(pc + 2, 'm7'), 2, [ii, ii + 10, f, f + 4], 'E5 E1 D1 D3', pc],
             [cif(pc + 7, '7(9)'), 2, [v, v + 4, f, f + 4], 'E5 E1 D1 D3', pc],
             [cif(pc, '7M'), 4, [i, i + 11, f - 1, f + 2], 'E5 E1 D1 D3', pc]);
    });
    return l;
  }
  // Nashville: a tela mostra só o número; o som vem do acorde do tom escolhido
  function nashville(pc, nums) {
    var graus = { '1': [0, ''], '2m': [2, 'm'], '3m': [4, 'm'], '4': [5, ''], '5': [7, ''], '6m': [9, 'm'] };
    return nums.map(function (n) { var g = graus[n]; return [n, 4, window.AmaralCanto.notasDaCifra(cif(pc + g[0], g[1]))]; });
  }
  var BEBOP = [[2, 2 / 3], [5, 1 / 3], [9, 2 / 3], [12, 1 / 3], [11, 2 / 3], [9, 1 / 3], [7, 2 / 3], [5, 1 / 3], [4, 2]];
  // Pop: C - G/B - Am - F (esquerda na tônica, direita em colcheias com inversões perto)
  var POP_E = { raiz: 48, padrao: [[0, 4], [-1, 4], [-3, 4], [-7, 4]], dedos: '5 5 5 5' };
  var POP_D = { raiz: 60, padrao: repete([[[0, 4, 7], 0.5]], 8).concat(repete([[[-1, 2, 7], 0.5]], 8), repete([[[0, 4, 9], 0.5]], 8), repete([[[0, 5, 9], 0.5]], 8)),
    dedos: [dedosRep('1+3+5', 8), dedosRep('1+2+5', 8), dedosRep('1+2+5', 8), dedosRep('1+3+5', 8)].join(' ') };
  // Bossa: Dm7 - G7 - C7M - C7M (baixo tônica/quinta; direita no contratempo)
  var BOSSA_E = { raiz: 48, padrao: [[2, 1.5], [9, 0.5], [9, 1.5], [2, 0.5], [-5, 1.5], [2, 0.5], [2, 1.5], [-5, 0.5], [0, 1.5], [7, 0.5], [7, 1.5], [0, 0.5], [0, 1.5], [7, 0.5], [7, 1.5], [0, 0.5]], dedos: dedosRep('5 1 1 5', 4) };
  function bossaCompasso(ch) { return [[ch, 0.5], [null, 1], [ch, 0.5], [null, 1], [ch, 1]]; }
  var BOSSA_D = { raiz: 60, padrao: bossaCompasso([5, 9, 12, 16]).concat(bossaCompasso([5, 9, 11, 16]), bossaCompasso([4, 7, 11, 14]), bossaCompasso([4, 7, 11, 14])), dedos: dedosRep('1+2+3+5', 12) };
  // Samba: C - G7 (surdo na esquerda, acordes picados na direita), compasso de 2 tempos
  var SAMBA_E = { raiz: 48, padrao: repete([[0, 1], [7, 1]], 2).concat(repete([[-5, 1], [2, 1]], 2)), dedos: dedosRep('5 1', 4) };
  function sambaCompasso(ch) { return [[null, 0.25], [ch, 0.25], [null, 0.25], [ch, 0.5], [null, 0.25], [ch, 0.5]]; }
  var SAMBA_D = { raiz: 60, padrao: sambaCompasso([4, 7, 12]).concat(sambaCompasso([4, 7, 12]), sambaCompasso([2, 5, 11]), sambaCompasso([2, 5, 11])), dedos: dedosRep('1+2+5', 6) + ' ' + dedosRep('1+2+5', 6) };
  // Baião: C - F - G7 - C (célula da zabumba na esquerda, acorde no 2 na direita)
  function baiaoE(r) { return [[r, 0.75], [r + 7, 0.25], [r + 7, 1]]; }
  var BAIAO_E = { raiz: 48, padrao: baiaoE(0).concat(baiaoE(-7), baiaoE(-5), baiaoE(0)), dedos: dedosRep('5 1 1', 4) };
  function baiaoD(ch) { return [[null, 1], [ch, 1]]; }
  var BAIAO_D = { raiz: 60, padrao: baiaoD([4, 7, 12]).concat(baiaoD([5, 9, 12]), baiaoD([5, 7, 11]), baiaoD([4, 7, 12])), dedos: '1+2+5 1+3+5 1+2+4 1+2+5' };

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
        t('Mão direita de Dó a Sol: dedos 1-2-3-4-5-4-3-2-1', 5, demo(seq(CINCO, 1, 2), 60, 70, 'Mão direita: dedos 1-2-3-4-5-4-3-2-1', { mao: 'D', dedos: D5, repeticoes: 4 })),
        t('Mão esquerda de Dó a Sol: dedos 5-4-3-2-1-2-3-4-5', 5, demo(seq(CINCO, 1, 2), 48, 70, 'Mão esquerda: dedos 5-4-3-2-1-2-3-4-5', { mao: 'E', dedos: E5, repeticoes: 4 }))
      ]],
      ['Escala de Dó maior', 'Iniciante', 'Suba o andamento de 4 em 4 bpm quando conseguir tocar 3 vezes seguidas sem erro.', [
        t('Mão direita: 1-2-3-1-2-3-4-5 subindo e 5-4-3-2-1-3-2-1 descendo', 6, demo(seq(MAIOR, 1, 2), 60, 66, 'Mão direita: 1-2-3, polegar passa, 1-2-3-4-5', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Mão esquerda: 5-4-3-2-1-3-2-1 subindo e 1-2-3-1-2-3-4-5 descendo', 6, demo(seq(MAIOR, 1, 2), 48, 66, 'Mão esquerda: 5-4-3-2-1, o dedo 3 cruza, 3-2-1', { mao: 'E', dedos: E_ESC, repeticoes: 2 })),
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
      ]],
      ['Escalas maiores: Sol, Ré e Fá', 'Intermediário', 'Digitação certa desde o começo: é ela que deixa a escala rápida depois. Os números nas teclas mostram o dedo de cada nota.', [
        t('Sol maior, mão direita (Fá♯ com o dedo 4)', 5, demo(seq(MAIOR, 1, 2), 67, 66, 'Sol maior: 1-2-3, polegar passa, 1-2-3-4-5', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Sol maior, mão esquerda', 5, demo(seq(MAIOR, 1, 2), 55, 66, 'Sol maior: 5-4-3-2-1, o 3 cruza, 3-2-1', { mao: 'E', dedos: E_ESC, repeticoes: 2 })),
        t('Ré maior, mão direita (Fá♯ e Dó♯)', 5, demo(seq(MAIOR, 1, 2), 62, 66, 'Ré maior: mesma digitação de Dó', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Fá maior, mão direita (Si♭ com o dedo 4)', 5, demo(seq(MAIOR, 1, 2), 65, 66, 'Fá maior: 1-2-3-4, polegar passa, 1-2-3-4', { mao: 'D', dedos: D_FA, repeticoes: 2 })),
        t('Sol maior com as duas mãos', 6, duas({ raiz: 55, padrao: seq(MAIOR, 1, 2), dedos: E_ESC }, { raiz: 67, padrao: seq(MAIOR, 1, 2), dedos: D_ESC }, 56, 'Os polegares passam em lugares diferentes: preste atenção', { repeticoes: 2 }))
      ]],
      ['Escalas menores', 'Intermediário', 'Toda escala maior tem uma relativa menor (Dó maior → Lá menor). A harmônica sobe o 7º grau e dá o som "árabe".', [
        t('Lá menor natural, mão direita', 5, demo(seq(MENOR_NAT, 1, 2), 69, 66, 'Lá menor: 1-2-3-1-2-3-4-5', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Lá menor natural, mão esquerda', 5, demo(seq(MENOR_NAT, 1, 2), 57, 66, 'Lá menor: 5-4-3-2-1-3-2-1', { mao: 'E', dedos: E_ESC, repeticoes: 2 })),
        t('Lá menor harmônica, mão direita (Sol♯ com o dedo 4)', 5, demo(seq(MENOR_HAR, 1, 2), 69, 66, 'Ouça o Sol♯ puxando para o Lá', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Mi menor natural, mão direita (Fá♯)', 5, demo(seq(MENOR_NAT, 1, 2), 64, 66, 'Mi menor: 1-2-3-1-2-3-4-5', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Lá menor harmônica com as duas mãos', 6, duas({ raiz: 57, padrao: seq(MENOR_HAR, 1, 2), dedos: E_ESC }, { raiz: 69, padrao: seq(MENOR_HAR, 1, 2), dedos: D_ESC }, 56, 'Duas mãos juntas, devagar', { repeticoes: 2 }))
      ]],
      ['Arpejos maiores e menores', 'Intermediário', 'Arpejo é o acorde tocado uma nota de cada vez. Mão direita 1-2-3-5; mão esquerda 5-4-2-1.', [
        t('Arpejo de Dó maior, mão direita', 4, demo(seq(ARP, 1, 2), 60, 72, 'Dedos 1-2-3-5-3-2-1', { mao: 'D', dedos: D_ARP, repeticoes: 4 })),
        t('Arpejo de Dó maior, mão esquerda', 4, demo(seq(ARP, 1, 2), 48, 72, 'Dedos 5-4-2-1-2-4-5', { mao: 'E', dedos: E_ARP, repeticoes: 4 })),
        t('Arpejo de Sol maior, mão direita', 4, demo(seq(ARP, 1, 2), 67, 72, 'Dedos 1-2-3-5-3-2-1', { mao: 'D', dedos: D_ARP, repeticoes: 4 })),
        t('Arpejo de Lá menor, mão direita', 4, demo(seq(ARPm, 1, 2), 69, 72, 'Menor: a nota do meio desce meio tom', { mao: 'D', dedos: D_ARP, repeticoes: 4 })),
        t('Arpejo de Lá menor, mão esquerda', 4, demo(seq(ARPm, 1, 2), 57, 72, 'Dedos 5-4-2-1-2-4-5', { mao: 'E', dedos: E_ARP, repeticoes: 4 })),
        t('Acorde na esquerda e arpejo na direita', 5, duas({ raiz: 48, padrao: [[[0, 4, 7], 4], [[0, 4, 7], 4]], dedos: '5+3+1 5+3+1' }, { raiz: 60, padrao: seq(ARP, 1, 2), dedos: D_ARP }, 66, 'Esquerda segura o acorde, direita faz o arpejo', { repeticoes: 4 }))
      ]],
      ['Arpejos em duas oitavas', 'Avançado', 'Subindo, o polegar passa por baixo depois do dedo 3. Descendo, o 3 cruza por cima do polegar. O punho não pula.', [
        t('Dó maior em duas oitavas, mão direita', 6, demo(seq(ARP2, 1, 2), 60, 72, 'Dedos 1-2-3, polegar passa, 1-2-3-5', { mao: 'D', dedos: D_ARP2, repeticoes: 2 })),
        t('Dó maior em duas oitavas, mão esquerda', 6, demo(seq(ARP2, 1, 2), 36, 72, 'Dedos 5-4-2-1, o 4 cruza, 4-2-1', { mao: 'E', dedos: E_ARP2, repeticoes: 2 })),
        t('Lá menor em duas oitavas, mão direita', 5, demo(seq(ARP2m, 1, 2), 57, 72, 'Mesma digitação do Dó maior', { mao: 'D', dedos: D_ARP2, repeticoes: 2 })),
        t('Dó maior em duas oitavas com as duas mãos', 6, duas({ raiz: 36, padrao: seq(ARP2, 1, 2), dedos: E_ARP2 }, { raiz: 60, padrao: seq(ARP2, 1, 2), dedos: D_ARP2 }, 56, 'Devagar: os polegares passam em momentos diferentes', { repeticoes: 2 }))
      ]],
      ['Blues: escala, baixo e 12 compassos', 'Intermediário', 'O blues tem 12 compassos e três acordes: C7, F7 e G7. A mão esquerda faz o "balanço" e a direita responde.', [
        t('Escala blues de Dó, mão direita (Dó, Mi♭, Fá, Fá♯, Sol, Si♭)', 5, demo(seq(BLUES, 1, 2), 60, 72, 'Dedos 1-2-1-2-3-4-5', { mao: 'D', dedos: D_BLUES, repeticoes: 3 })),
        t('Baixo do blues na mão esquerda: Dó-Sol-Lá-Sol', 4, demo(repete([[0, 1], [7, 1], [9, 1], [7, 1]], 2), 48, 84, 'Dedos 5-2-1-2, sem atrasar', { mao: 'E', dedos: dedosRep('5 2 1 2', 2), repeticoes: 4 })),
        t('Os 12 compassos do blues com acordes', 6, acordes('C7:4 C7:4 C7:4 C7:4 F7:4 F7:4 C7:4 C7:4 G7:4 F7:4 C7:4 G7:4', 84, { tom: 0, texto: 'Conte os compassos: 4 de C7, 2 de F7, 2 de C7, G7, F7, C7, G7' })),
        t('Baixo na esquerda e acorde na direita (tempos 2 e 4)', 6, duas({ raiz: 48, padrao: [[0, 1], [7, 1], [9, 1], [7, 1]], dedos: '5 2 1 2' }, { raiz: 60, padrao: [[null, 1], [[4, 7, 10], 1], [null, 1], [[4, 7, 10], 1]], dedos: '1+2+4 1+2+4' }, 80, 'Direita só no 2 e no 4', { repeticoes: 6 }))
      ]],
      ['Frases de blues', 'Intermediário', 'Frases curtas (licks) com a mão direita na posição de Dó: polegar no Dó, 5 no Sol. Toque junto até decorar e use no blues.', [
        t('Frase 1: sobe pela escala blues e volta para o Dó', 5, demo([[0, 1], [3, 0.5], [5, 0.5], [6, 0.5], [7, 1.5], [3, 1], [0, 3]], 60, 80, 'Dedos 1-2-3-4-5-2-1', { mao: 'D', dedos: '1 2 3 4 5 2 1', repeticoes: 4 })),
        t('Frase 2: desce do Sol até o Dó', 4, demo([[7, 0.5], [6, 0.5], [5, 0.5], [3, 0.5], [0, 2], [null, 2]], 60, 80, 'Dedos 5-4-3-2-1', { mao: 'D', dedos: '5 4 3 2 1', repeticoes: 4 })),
        t('Frase 3: a "nota triste" (Mi♭ escorregando para o Mi)', 4, demo([[3, 0.5], [4, 1], [0, 0.5], [3, 0.5], [4, 0.5], [7, 3]], 60, 80, 'Dedos 2-3-1-2-3-5', { mao: 'D', dedos: '2 3 1 2 3 5', repeticoes: 4 })),
        t('Use as três frases sobre o blues de 12 compassos', 6, acordes('C7:4 C7:4 C7:4 C7:4 F7:4 F7:4 C7:4 C7:4 G7:4 F7:4 C7:4 G7:4', 84, { tom: 0, repeticoes: 2, texto: 'Mão direita: frases 1, 2 e 3' }))
      ]],
      ['Jazz: tétrades e o ii-V-I', 'Avançado', 'O ii-V-I (Dm7 - G7 - C7M) é a frase-base do jazz. Colcheias com swing: longa-curta, longa-curta.', [
        t('Ouça e toque o ii-V-I em Dó', 5, acordes('Dm7:4 G7:4 C7M:8', 60, { repeticoes: 4 })),
        t('Condução de vozes: a mão direita quase não anda', 5, acordes([['Dm7', 4, [50, 65, 69, 72, 76], 'E5 D1 D2 D3 D5'], ['G7', 4, [43, 65, 67, 71, 74], 'E5 D1 D2 D3 D5'], ['C7M(9)', 8, [48, 64, 67, 71, 74], 'E5 D1 D2 D3 D5']], 66, { repeticoes: 4 })),
        t('Frase bebop: arpejo de Dm7 subindo, escala descendo, resolve no Mi', 5, demo([[2, 2 / 3], [5, 1 / 3], [9, 2 / 3], [12, 1 / 3], [11, 2 / 3], [9, 1 / 3], [7, 2 / 3], [5, 1 / 3], [4, 2]], 60, 96, 'Swing: longa-curta', { mao: 'D', dedos: '1 2 3 5 4 3 2 1 3', repeticoes: 4 })),
        t('Rodeio (enclosure): uma nota acima, uma abaixo, e chega no alvo', 3, demo([[5, 2 / 3], [3, 1 / 3], [4, 2], [null, 1]], 60, 90, 'Fá - Ré♯ - Mi', { mao: 'D', dedos: '4 2 3', repeticoes: 6 })),
        t('Improvise sobre o ii-V-I com as frases', 5, acordes('Dm7:4 G7:4 C7M:8', 100, { repeticoes: 6, texto: 'Use a frase bebop e o rodeio' }))
      ]],
      ['Independência das mãos', 'Avançado', 'Comece bem devagar. Se travar, toque cada mão sozinha e junte de novo. A esquerda é a "bateria": não pode atrasar.', [
        t('Esquerda em semínimas, direita em colcheias', 6, duas({ raiz: 48, padrao: repete([[0, 1], [7, 1]], 4), dedos: dedosRep('5 1', 4) }, { raiz: 60, padrao: seq([0, 2, 4, 5, 7, 5, 4, 2, 0, 2, 4, 5, 7, 5, 4, 2], 0.5), dedos: '1 2 3 4 5 4 3 2 1 2 3 4 5 4 3 2' }, 60, 'Esquerda: 1 por clique · Direita: 2 por clique', { repeticoes: 3 })),
        t('Ostinato na esquerda e melodia na direita (Ode à Alegria)', 6, duas({ raiz: 48, padrao: repete(seq([0, 4, 7, 4], 0.5), 8), dedos: dedosRep('5 3 1 3', 8) }, { raiz: 60, padrao: ODE.slice(0, 15) }, 72, 'A esquerda repete Dó-Mi-Sol-Mi sem parar', { repeticoes: 2 })),
        t('Contratempo: esquerda no tempo, direita no "e"', 5, duas({ raiz: 48, padrao: repete([[0, 1]], 8), dedos: dedosRep('5', 8) }, { raiz: 60, padrao: repete([[null, 0.5], [[4, 7], 0.5]], 8), dedos: dedosRep('3+5', 8) }, 72, 'Esquerda: 1 2 3 4 · Direita: "e" de cada tempo', { repeticoes: 3 })),
        t('Acorde parado na esquerda, escala na direita', 5, duas({ raiz: 48, padrao: [[[0, 7], 4], [[0, 7], 4]], dedos: '5+1 5+1' }, { raiz: 60, padrao: seq(MAIOR, 0.5, 1), dedos: D_ESC }, 66, 'Esquerda segura, direita corre', { repeticoes: 3 }))
      ]]
    ]),

    // ======================= TECLADO PROFISSIONAL =======================
    // Baseado no que as escolas e os profissionais cobram: técnica e digitação nos 12 tons (escolas clássicas),
    // leitura de cifra, voicings e ii-V-I com condução de vozes (Berklee), voicings sem tônica (Bill Evans),
    // linguagem por transcrição (Barry Harris, Oscar Peterson), Nashville Number System (estúdio),
    // acordes de passagem (gospel), levadas brasileiras e a rotina de palco e estúdio.
    curso('Teclado', 'Teclado Pro', [
      // ---- Módulo 1: rotina e técnica ----
      ['Rotina de estudo profissional', 'Profissional', 'Profissional não é quem estuda mais horas, é quem estuda com método. Esta aula monta a sua rotina para as próximas 23.', [
        t('Prática deliberada: estude no limite do que você consegue, bem devagar, corrigindo na hora. Repetir o que já sai fácil não faz evoluir.', 3),
        t('Monte sua rotina diária de 60 min: 10 aquecimento e técnica, 15 harmonia em todos os tons, 20 repertório, 10 percepção (ouvido), 5 criar/improvisar. Escreva no caderno.', 5),
        t('Grave 1 minuto tocando hoje, pelo celular. Ouça como se fosse outra pessoa: o que está fora do tempo? o que está alto demais? Anote 2 coisas para corrigir.', 5),
        t('Aquecimento com metrônomo: escala de Dó, mãos separadas, uma nota por clique e depois duas', 5, demo(seq(MAIOR, 0.5, 1), 60, 72, 'Duas notas por clique, sem acelerar', { mao: 'D', dedos: D_ESC, repeticoes: 4 })),
        t('Regra de ouro dos profissionais: tudo o que aprender nesta trilha, leve para os 12 tons. Use o ciclo das quartas: C F B♭ E♭ A♭ D♭ G♭ B E A D G.', 2)
      ]],
      ['Técnica: Hanon e independência dos dedos', 'Profissional', 'Exercício 1 do Hanon (1873, domínio público): cada dedo trabalha igual. Os dedos 4 e 5 são os mais fracos, dê atenção a eles.', [
        t('Hanon nº 1, mão direita: dedos 1-2-3-4-5-4-3-2 subindo a escala', 6, demo(HANON_D, 60, 72, 'Dedos levantados, som igual em todas as notas', { mao: 'D', dedos: dedosRep('1 2 3 4 5 4 3 2', 7) + ' 1', repeticoes: 2 })),
        t('Hanon nº 1, mão esquerda: dedos 5-4-3-2-1-2-3-4', 6, demo(HANON_E, 48, 72, 'O dedo 5 começa cada grupo', { mao: 'E', dedos: dedosRep('5 4 3 2 1 2 3 4', 7) + ' 5', repeticoes: 2 })),
        t('Hanon nº 1 com as duas mãos, uma oitava de distância', 8, duas({ raiz: 48, padrao: HANON_E, dedos: dedosRep('5 4 3 2 1 2 3 4', 7) + ' 5' }, { raiz: 60, padrao: HANON_D, dedos: dedosRep('1 2 3 4 5 4 3 2', 7) + ' 1' }, 60, 'Mãos juntas: as notas têm que soar como uma só', { repeticoes: 2 })),
        t('Meta da semana: suba 4 bpm por dia só quando sair limpo. Profissional chega a 108 bpm em semicolcheias (4 notas por clique). Se o punho doer, pare.', 2)
      ]],
      ['Escalas em todos os tons: sustenidos', 'Profissional', 'Dó, Sol, Ré, Lá, Mi e Si usam a mesma digitação na mão direita: 1-2-3, polegar passa, 1-2-3-4-5. Fá♯ começa no dedo 2.', [
        t('Dó, Sol, Ré, Lá, Mi e Si maior, mão direita, uma atrás da outra', 8, demo(ESC_SUST.padrao, ESC_SUST.raiz, 80, 'Atenção aos sustenidos de cada tom', { mao: 'D', dedos: ESC_SUST.dedos })),
        t('As mesmas escalas, mão esquerda: 5-4-3-2-1, o 3 cruza, 3-2-1', 8, demo(ESC_SUST_E.padrao, ESC_SUST_E.raiz, 80, 'Mão esquerda', { mao: 'E', dedos: ESC_SUST_E.dedos })),
        t('Fá♯ maior, mão direita: 2-3-4, polegar no Si, 2-3, polegar no Mi♯ (Fá), 2', 4, demo(ESCALA_FS.padrao, ESCALA_FS.raiz, 72, 'Só o Si e o Mi♯ são teclas brancas', { mao: 'D', dedos: ESCALA_FS.dedos, repeticoes: 2 })),
        t('Diga em voz alta os sustenidos de cada tom enquanto toca: Sol (Fá♯), Ré (Fá♯ Dó♯), Lá (+Sol♯), Mi (+Ré♯), Si (+Lá♯), Fá♯ (+Mi♯).', 3)
      ]],
      ['Escalas em todos os tons: bemóis', 'Profissional', 'Nos tons com bemol a regra é: polegares no Dó e no Fá. O dedo 4 cai sempre no Si♭.', [
        t('Fá, Si♭, Mi♭, Lá♭ e Ré♭ maior, mão direita, uma atrás da outra', 10, demo(ESC_BEM.padrao, ESC_BEM.raiz, 76, 'Polegar no Dó e no Fá', { mao: 'D', dedos: ESC_BEM.dedos })),
        t('Escreva no caderno a digitação de cada escala com bemol e confira tocando devagar, sem o tocador.', 5),
        t('Desafio: toque a escala que o metrônomo "pedir". A cada 4 compassos, sorteie mentalmente um tom do ciclo e toque sem parar.', 6, metronomo(72, 4, 'Troque de tom a cada 4 compassos', 24))
      ]],
      // ---- Módulo 2: harmonia profissional ----
      ['Tétrades nos 12 tons', 'Profissional', 'Música popular e jazz são feitos de tétrades (acordes de 4 notas). Você precisa achar qualquer uma sem pensar.', [
        t('As cinco tétrades em Dó: 7M, 7, m7, m7(♭5) e °7 (diminuto)', 4, acordes('C7M:4 C7:4 Cm7:4 Cm7(b5):4 Cdim7:4', 60, { tom: 0, repeticoes: 2 })),
        t('C7M, C7, Cm7, Cm7(♭5) em todos os tons, pelo ciclo das quartas', 12, acordes(TETRADES_CICLO, 80, { texto: 'Diga o nome antes de tocar' })),
        t('Teste: feche os olhos, escolha um tom e toque as 5 tétrades dele em menos de 10 segundos.', 4)
      ]],
      ['Inversões e condução de vozes', 'Profissional', 'Profissional não "pula" de acorde em acorde: cada voz anda o mínimo possível. Isso deixa o som limpo e as mãos relaxadas.', [
        t('C7M nas quatro posições: fundamental, 1ª, 2ª e 3ª inversão', 4, acordes([['C7M', 4, [48, 60, 64, 67, 71]], ['C7M/E', 4, [48, 64, 67, 71, 72]], ['C7M/G', 4, [48, 67, 71, 72, 76]], ['C7M/B', 4, [48, 59, 60, 64, 67]]], 60, { repeticoes: 2 })),
        t('Am7 - D7 - G7M - C7M com a direita andando o mínimo', 6, acordes([['Am7', 4, [45, 60, 64, 67, 69]], ['D7', 4, [50, 60, 62, 66, 69]], ['G7M', 4, [43, 59, 62, 66, 67]], ['C7M', 4, [48, 59, 60, 64, 67]]], 66, { repeticoes: 4 })),
        t('Pegue uma música que você toca e reescreva os acordes da mão direita para que nenhuma nota pule mais que 2 teclas.', 8)
      ]],
      ['ii-V-I nos 12 tons', 'Profissional', 'O ii-V-I é a frase mais importante da harmonia: aparece no jazz, na bossa, no gospel e no pop. Profissional toca em qualquer tom de olhos fechados.', [
        t('ii-V-I em Dó, Fá e Si♭ (devagar)', 5, acordes(iiVI([0, 5, 10]), 60, { texto: 'Dois - cinco - um' })),
        t('ii-V-I nos 12 tons pelo ciclo das quartas', 12, acordes(iiVI(QUARTAS), 76, { texto: 'O I de um tom leva ao ii do próximo' })),
        t('Faça o mesmo com o ii-V-i menor: Dm7(♭5) - G7 - Cm7. Toque em Dó, Fá e Si♭ sem o tocador.', 6)
      ]],
      ['Voicings sem tônica (estilo Bill Evans)', 'Profissional', 'Na banda, o baixista toca a tônica. O tecladista toca 3ª, 5ª, 7ª e 9ª na mão esquerda: o som fica moderno e não embola com o baixo.', [
        t('ii-V-I em Dó com voicings sem tônica na mão esquerda', 5, acordes(rootless([0]), 60, { repeticoes: 4, texto: 'Repare: de um acorde para o outro mudam só 1 ou 2 notas' })),
        t('Os mesmos voicings nos 12 tons', 12, acordes(rootless(QUARTAS), 72, { texto: 'Mão esquerda na região do Dó central' })),
        t('Toque uma melodia simples na mão direita (ex.: "Dó-ré-mi-fá") usando esses voicings na esquerda.', 5)
      ]],
      ['Shells e notas-guia', 'Profissional', 'Shell = tônica + 3ª ou 7ª na esquerda. As 3ªs e 7ªs (notas-guia) dizem qual é o acorde; o resto é cor.', [
        t('ii-V-I em Dó: shells na esquerda, notas-guia na direita', 5, acordes(shells([0]), 60, { repeticoes: 4, texto: 'A direita quase não se mexe' })),
        t('Os mesmos shells em Fá, Si♭ e Mi♭', 6, acordes(shells([5, 10, 3]), 66, { repeticoes: 2 })),
        t('Linha de notas-guia: cante a 7ª do Dm7 (Dó), que desce para a 3ª do G7 (Si) e fica na 7ª do C7M (Si). Toque e cante.', 4)
      ]],
      ['Tensões: 9ª, 11ª, 13ª e sus', 'Profissional', 'Tensões dão a "cor" do acorde. Regra prática: 9ª combina com quase tudo; 13ª e ♭9 ficam nos dominantes; 11ª nos menores.', [
        t('Ouça a diferença: C7M(9), C7(9), Cm7(9), C7sus4, C6(9) e C7(♭9)', 5, acordes('C7M(9):4 C7(9):4 Cm7(9):4 C7sus4:4 C6(9):4 C7(b9):4', 56, { tom: 0, repeticoes: 2 })),
        t('ii-V-I com tensões: Dm7(9) - G7(13) - C7M(9)', 5, acordes('Dm7(9):4 G7(13):4 C7M(9):8', 60, { repeticoes: 4 })),
        t('Sus: G7sus4 resolvendo em G7, muito usado no pop e no louvor', 4, acordes('G7sus4:4 G7:4 C7M(9):8', 60, { repeticoes: 4 }))
      ]],
      ['Voicings em quartas (som modal)', 'Profissional', 'Empilhar quartas cria um som aberto e moderno (o famoso acorde de "So What", de Miles Davis e Bill Evans). Funciona em acordes menores e sus.', [
        t('Dm11 em quartas: Ré-Sol-Dó na esquerda, Fá-Lá na direita', 4, acordes([['Dm11', 8, [50, 55, 60, 65, 69], 'E5 E2 E1 D1 D3'], ['Ebm11', 8, [51, 56, 61, 66, 70], 'E5 E2 E1 D1 D3'], ['Dm11', 8, [50, 55, 60, 65, 69], 'E5 E2 E1 D1 D3']], 72, { repeticoes: 2 })),
        t('Mova o mesmo desenho pelas notas da escala de Ré dórico (Ré, Mi, Fá, Sol, Lá, Si, Dó), mão direita inteira subindo e descendo.', 6),
        t('Improvise uma levada lenta só com esse desenho por 3 minutos, como num fundo de louvor ou de MPB.', 4, metronomo(66, 4, 'Mude o desenho a cada 2 compassos', 16))
      ]],
      ['Rearmonização: dominantes secundários e trítono', 'Profissional', 'Rearmonizar é trocar acordes sem trocar a melodia. É o que faz um arranjo soar "profissional".', [
        t('Original: C - Am7 - Dm7 - G7 - C', 3, acordes('C7M:4 Am7:4 Dm7:4 G7:4 C7M:4', 60, { repeticoes: 2 })),
        t('Dominante secundário: o Am7 vira A7 (o "cinco" do Dm7)', 4, acordes('C7M:4 A7:4 Dm7:4 G7:4 C7M:4', 60, { repeticoes: 2 })),
        t('Trítono: A7 vira E♭7 e G7 vira D♭7 (o baixo desce em meio tom)', 4, acordes('C7M:4 Eb7:4 Dm7:4 Db7:4 C7M:4', 60, { repeticoes: 2 })),
        t('Escolha uma música simples e rearmonize 4 compassos com essas duas ideias. Grave e poste na Comunidade.', 8)
      ]],
      // ---- Módulo 3: tempo, groove e estilos ----
      ['Tempo de verdade: 2 e 4 e subdivisões', 'Profissional', 'Quem dá emprego a um tecladista é o tempo. Treine com o clique só nos tempos 2 e 4 (como a caixa da bateria): você passa a sentir o balanço.', [
        t('Clique só no 2 e no 4: toque um acorde em cada tempo', 4, metronomo(80, 4, 'Clique = caixa da bateria (2 e 4)', 24, [2, 4])),
        t('Subdivisões no mesmo acorde: 4 compassos de colcheias, 4 de tercinas, 4 de semicolcheias', 5, metronomo(70, 4, 'Colcheias → tercinas → semicolcheias', 24, [2, 4])),
        t('Clique só no 1, bem lento: você segura o tempo sozinho nos outros 3', 4, metronomo(50, 4, 'Só o 1 clica: conte 2-3-4 por dentro', 16, [1])),
        t('Grave 1 minuto com o clique e confira: o acorde caiu junto do clique ou "fugiu"?', 3)
      ]],
      ['Pop e balada', 'Profissional', 'Balada e pop: a esquerda segura a tônica e a direita faz as tríades em colcheias, com inversões para não pular.', [
        t('C - G/B - Am - F: esquerda na tônica, direita em colcheias', 6, duas(POP_E, POP_D, 76, 'Direita em colcheias, esquerda segura o compasso', { repeticoes: 4 })),
        t('Dinâmica de balada: comece só com a esquerda e acordes longos, e só no refrão entre com as colcheias. Toque a progressão assim por 4 voltas.', 4, acordes('C:4 G/B:4 Am:4 F:4', 70, { repeticoes: 4, texto: 'Verso suave → refrão cheio' })),
        t('Tire de ouvido uma balada que você goste e toque com essa levada.', 8)
      ]],
      ['Bossa nova', 'Profissional', 'Na bossa o tecladista não marca o tempo: o baixo faz tônica e quinta e a direita "flutua" no contratempo, com acordes de 7ª e 9ª. Esta é uma das levadas possíveis.', [
        t('Baixo da bossa (simplificado): tônica e quinta', 4, demo(repete([[0, 1.5], [7, 0.5], [7, 1.5], [0, 0.5]], 2), 48, 92, 'Mão esquerda: tônica, quinta, quinta, tônica', { mao: 'E', dedos: dedosRep('5 1 1 5', 2), repeticoes: 4 })),
        t('ii-V-I em bossa: baixo na esquerda, acordes sincopados na direita', 8, duas(BOSSA_E, BOSSA_D, 92, 'Direita no contratempo, leve', { repeticoes: 4 })),
        t('Ouça "Garota de Ipanema" e "Wave" (Tom Jobim) e repare: o piano entra pouco e com acordes curtos.', 5)
      ]],
      ['Samba e baião', 'Profissional', 'Ritmos brasileiros pedem a esquerda como o surdo (samba) ou a zabumba (baião). São levadas possíveis para começar; depois imite os discos.', [
        t('Samba: surdo na esquerda (tônica no 1, quinta forte no 2) e acordes picados na direita', 7, duas(SAMBA_E, SAMBA_D, 88, 'Pense em 2: o 2 é o tempo forte do surdo', { repeticoes: 4 })),
        t('Baião: a célula da zabumba na esquerda', 5, demo(repete([[0, 0.75], [7, 0.25], [7, 1]], 4), 48, 92, 'Tum… tum-tum', { mao: 'E', dedos: dedosRep('5 1 1', 4), repeticoes: 4 })),
        t('Baião com acordes: C - F - G7 - C com a célula na esquerda', 6, duas(BAIAO_E, BAIAO_D, 92, 'Direita no tempo 2 de cada compasso', { repeticoes: 3 })),
        t('Ouça Luiz Gonzaga (baião) e um samba do Cartola, e toque junto só a mão esquerda.', 4)
      ]],
      ['Louvor e gospel: acordes de passagem', 'Profissional', 'Acordes de passagem ligam os principais e criam movimento. É a linguagem do gospel e do louvor contemporâneo.', [
        t('A progressão de passagem mais clássica: C - C7 - F - F♯°7 - C/G - A7 - Dm7 - G7 - C', 6, acordes('C:2 C7:2 F:2 F#dim7:2 C/G:2 A7:2 Dm7:2 G7:2 C:4', 66, { repeticoes: 4 })),
        t('O "1 - 4 sobre 1" (C e F/C): o balanço que segura os momentos de adoração', 4, acordes('C:2 F/C:2 C:2 F/C:2 Am7:2 G/B:2 C:4', 72, { repeticoes: 4 })),
        t('Sus4 antes de resolver: dá a sensação de "chegada" no refrão', 4, acordes('F7M:4 G7sus4:2 G7:2 Cadd9:4', 66, { repeticoes: 4 })),
        t('Dinâmica no culto: intro com pad suave, verso só com a esquerda e acordes longos, refrão cheio, ponte crescendo. Combine os sinais com o ministro (mão aberta = mais baixo, mão subindo = crescer).', 4)
      ]],
      // ---- Módulo 4: ouvido e improvisação ----
      ['Percepção: intervalos e acordes', 'Profissional', 'Ouvido treinado é o que permite tocar uma música que você nunca ensaiou. Ouça, escreva e só depois confira o gabarito.', [
        t('Ditado de intervalos: diga qual é cada salto', 5, demo([[0, 1], [7, 1], [null, 2], [0, 1], [4, 1], [null, 2], [0, 1], [10, 1], [null, 2], [0, 1], [5, 1], [null, 2], [0, 1], [9, 1], [null, 2], [0, 1], [3, 1], [null, 2]], 60, 72, 'Ouça e escreva os 6 intervalos', { repeticoes: 2, ocultar: true })),
        t('Ditado de acordes: maior, menor, diminuto, aumentado, 7, m7 ou 7M?', 5, acordes('Cm7:4 Caug:4 C7:4 Cdim:4 C7M:4 Cm:4', 56, { repeticoes: 2, ocultar: true })),
        t('Ditado de progressão em Dó: escreva os graus (I, ii, iii, IV, V, vi)', 5, acordes('C:4 Em:4 F:4 G7:4 Am:4 Dm7:4 G7:4 C:4', 66, { repeticoes: 3, ocultar: true })),
        t('Gabarito (só depois!): intervalos = 5ª J, 3ª M, 7ª m, 4ª J, 6ª M, 3ª m. Acordes = m7, aumentado, 7, diminuto, 7M, menor. Progressão = I - iii - IV - V7 - vi - ii7 - V7 - I.', 2)
      ]],
      ['Tirar de ouvido, transcrever e Nashville', 'Profissional', 'Os grandes aprenderam copiando discos nota por nota. E no estúdio todo mundo lê números (Nashville): 1-5-6m-4 serve em qualquer tom.', [
        t('Método para tirar uma música: 1) ache a tônica (a nota de "repouso"); 2) tire o baixo; 3) descubra se cada acorde é maior ou menor; 4) escreva em números.', 3),
        t('Nashville em Ré: os números na tela, você descobre os acordes', 5, acordes(nashville(2, ['1', '5', '6m', '4']), 72, { repeticoes: 3, texto: 'Ré: 1 = D, 5 = A, 6m = Bm, 4 = G' })),
        t('A mesma sequência em Lá: os números não mudam, só o tom', 5, acordes(nashville(9, ['1', '5', '6m', '4']), 72, { repeticoes: 3, texto: 'Lá: 1 = A, 5 = E, 6m = F♯m, 4 = D' })),
        t('Transcreva 8 compassos de um solo de piano que você ame (ouça trecho por trecho, cante, depois toque). Escreva e toque junto com a gravação.', 15)
      ]],
      ['Improvisação: modos e pentatônicas', 'Profissional', 'Sobre Dm7 use Ré dórico; sobre G7, Sol mixolídio. Repare: são as mesmas notas de Dó maior, mudando só o "centro".', [
        t('Ré dórico, mão direita', 4, demo(seq([0, 2, 3, 5, 7, 9, 10, 12, 10, 9, 7, 5, 3, 2, 0], 0.5, 1), 62, 80, 'Ré dórico: notas brancas a partir do Ré', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Sol mixolídio, mão direita', 4, demo(seq([0, 2, 4, 5, 7, 9, 10, 12, 10, 9, 7, 5, 4, 2, 0], 0.5, 1), 67, 80, 'Sol mixolídio: notas brancas a partir do Sol', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Pentatônica menor de Ré (Ré, Fá, Sol, Lá, Dó)', 4, demo(seq([0, 3, 5, 7, 10, 12, 10, 7, 5, 3, 0], 0.5, 1), 62, 80, 'Dedos 1-2-3, polegar passa, 1-2-3', { mao: 'D', dedos: '1 2 3 1 2 3 2 1 3 2 1', repeticoes: 2 })),
        t('Improvise sobre Dm7 - G7: frases curtas, respire entre elas, termine na 3ª ou na 7ª do acorde', 8, acordes('Dm7:8 G7:8', 96, { repeticoes: 6, texto: 'Dórico no Dm7 · mixolídio no G7' }))
      ]],
      ['Linguagem: frases de ii-V-I em vários tons', 'Profissional', 'Improvisar é falar uma língua: primeiro se decora frases, depois se combina. Barry Harris ensinava assim: a mesma frase em todos os tons.', [
        t('Frase bebop em Dó: arpejo do ii subindo, escala descendo, resolve na 3ª do I', 4, demo(BEBOP, 60, 100, 'Swing: longa-curta', { mao: 'D', dedos: '1 2 3 5 4 3 2 1 3', repeticoes: 4 })),
        t('A mesma frase em Fá', 4, demo(BEBOP, 65, 100, 'Mesma digitação, outro tom', { mao: 'D', dedos: '1 2 3 5 4 3 2 1 3', repeticoes: 4 })),
        t('A mesma frase em Si♭', 4, demo(BEBOP, 58, 100, 'Mesma digitação, outro tom', { mao: 'D', dedos: '1 2 3 5 4 3 2 1 3', repeticoes: 4 })),
        t('Aproximação cromática: chegue em cada nota do acorde por meio tom abaixo', 4, demo([[3, 0.5], [4, 0.5], [6, 0.5], [7, 0.5], [10, 0.5], [11, 0.5], [12, 2]], 60, 90, 'Ré♯→Mi, Fá♯→Sol, Lá♯→Si, Dó', { mao: 'D', dedos: '2 3 1 2 3 4 5', repeticoes: 4 })),
        t('Use as frases sobre a base de ii-V-I nos tons de Dó, Fá e Si♭', 6, acordes(iiVI([0, 5, 10]), 100, { repeticoes: 3 }))
      ]],
      // ---- Módulo 5: palco, estúdio e carreira ----
      ['O tecladista na banda: timbres e arranjo', 'Profissional', 'Na banda, o maior erro do tecladista é tocar demais. Cada instrumento tem a sua região: deixe o grave para o baixo e não brigue com a guitarra.', [
        t('Região: toque a progressão só entre o Dó central e o Dó de cima, sem baixo na esquerda (o baixista faz)', 5, acordes([['C', 4, [60, 64, 67]], ['G/B', 4, [59, 62, 67]], ['Am7', 4, [60, 64, 67, 69]], ['F7M', 4, [60, 64, 65, 69]]], 76, { repeticoes: 4, texto: 'Sem mão esquerda: o baixo é do baixista' })),
        t('Timbres de um tecladista profissional: piano, Rhodes (elétrico), órgão, pad, cordas, synth lead e brass. Monte no seu teclado uma lista com 1 de cada e salve.', 6),
        t('Split e layer: split = cada metade do teclado com um timbre (baixo à esquerda, piano à direita); layer = dois timbres juntos (piano + pad). Configure os dois no seu teclado ou no Kontakt/Carla.', 6),
        t('Arranjo: escute uma música da sua banda e escreva o que o teclado faz em cada parte (intro, verso, refrão, ponte). Se a guitarra faz acordes, você faz pad ou sai.', 6)
      ]],
      ['Ao vivo: click, playback, in-ear e direção musical', 'Profissional', 'Igrejas e bandas profissionais tocam com click e playback (multitrack). O tecladista costuma ser quem dispara e quem conduz.', [
        t('Entrada com contagem: ouça 2 compassos de click e entre exatamente no 1', 4, metronomo(90, 4, 'Compassos 1 e 2: só ouvir · entre no compasso 3', 12)),
        t('In-ear: no seu fone, o click e a voz principal vêm primeiro, depois você, depois o baixo e a bateria. Nunca suba o seu volume para "se ouvir": peça para baixar o resto.', 4),
        t('Roteiro do show (setlist): para cada música anote tom, andamento (bpm), timbre e quem começa. Monte o de 5 músicas que você toca.', 8),
        t('Direção musical: ensaie os finais e as viradas, combine sinais com a mão (último refrão, parar, repetir) e marque no roteiro.', 6)
      ]],
      ['Estúdio e carreira', 'Profissional', 'O tecladista profissional grava em casa, tem repertório pronto e se apresenta como empresa. Esta aula fecha a trilha.', [
        t('Gravação em casa: no Reaper, crie uma faixa MIDI com o Pianoteq (ou Kontakt), grave 8 compassos com o click, e corrija só o que estiver muito fora (quantização leve, 50%).', 10),
        t('Repertório: monte uma lista de 30 músicas que você toca de cor, em pelo menos 2 tons cada, separadas por estilo (louvor, pop, MPB, sertanejo, jazz).', 8),
        t('Profissão: tenha um vídeo curto tocando, um portfólio no Instagram, um valor de cachê por evento e um contrato simples (data, horário, valor, quem paga o som).', 6),
        t('Saúde: alongue punhos e dedos antes e depois, pausa de 5 min a cada 50 min, banco na altura certa. Dor é sinal para parar, não para insistir.', 3)
      ]]
    ], 'Teclado Profissional'),

    // ======================= PIANO =======================
    curso('Piano', 'Piano', [
      ['Postura e o Dó central', 'Iniciante', 'Banco na altura em que o antebraço fica reto. Ombros soltos, dedos curvados.', [
        t('Postura: sente na metade do banco, pés no chão, cotovelos um pouco à frente do corpo.', 3),
        t('Dó central (Dó4): fica no meio do piano, à esquerda das 2 teclas pretas. Toque-o e ache os outros Dós.', 3, teclado(48, 72)),
        t('Mão direita na posição de Dó, legato', 5, demo(seq(CINCO, 1, 2), 60, 60, 'Mão direita: dedos 1-2-3-4-5-4-3-2-1, uma nota ligada na outra', { mao: 'D', dedos: D5, repeticoes: 4 })),
        t('Mão esquerda na posição de Dó', 5, demo(seq(CINCO, 1, 2), 48, 60, 'Mão esquerda: dedos 5-4-3-2-1-2-3-4-5', { mao: 'E', dedos: E5, repeticoes: 4 })),
        t('Entre um exercício e outro, solte os braços ao lado do corpo e respire.', 1)
      ]],
      ['Leitura: clave de sol e ritmo', 'Iniciante', 'Ler partitura é como ler um texto: devagar no começo, depois fica natural.', [
        t('Clave de sol: o Sol fica na 2ª linha. Linhas: Mi-Sol-Si-Ré-Fá. Espaços: Fá-Lá-Dó-Mi. O Dó central fica numa linha suplementar abaixo da pauta.', 4),
        t('Figuras: semibreve = 4 tempos, mínima = 2, semínima = 1, colcheia = meio tempo.', 3),
        t('Bata palmas: uma semibreve (segure 4), duas mínimas, quatro semínimas', 4, metronomo(60, 4, 'Palmas: 1 semibreve → 2 mínimas → 4 semínimas', 12)),
        t('Leia e toque "Dó-ré-mi-fá" (mão direita na posição de Dó)', 5, demo(DO_RE_MI_FA, 60, 80, 'Dó-ré-mi-fá, fá-fá…', { mao: 'D', repeticoes: 2 }))
      ]],
      ['Clave de fá e mão esquerda', 'Iniciante', 'A clave de fá é a da mão esquerda. Com ela você lê os graves.', [
        t('Clave de fá: o Fá fica na 4ª linha. Linhas: Sol-Si-Ré-Fá-Lá. Espaços: Lá-Dó-Mi-Sol.', 4),
        t('Ache no piano as notas das linhas da clave de fá: Sol2, Si2, Ré3, Fá3 e Lá3', 3, teclado(36, 60)),
        t('Mão esquerda na posição de Dó, 5-4-3-2-1-2-3-4-5', 5, demo(seq(CINCO, 1, 2), 48, 60, 'Mão esquerda: 5-4-3-2-1-2-3-4-5', { mao: 'E', dedos: E5, repeticoes: 3 })),
        t('"Dó-ré-mi-fá" com a mão esquerda', 5, demo(DO_RE_MI_FA, 48, 76, 'Mão esquerda, dedos começando no 5', { mao: 'E', repeticoes: 2 }))
      ]],
      ['Mãos juntas', 'Iniciante', 'Primeiro movimento paralelo (as mãos vão para o mesmo lado), depois contrário (as mãos se abrem).', [
        t('Movimento paralelo: esquerda 5-4-3-2-1, direita 1-2-3-4-5', 5, acordes(pares([0, 2, 4, 5, 7, 5, 4, 2, 0], 48, 60, E5, D5), 60, { repeticoes: 3, texto: 'Mãos juntas, uma oitava de distância' })),
        t('Movimento contrário: os polegares começam juntos no Dó e as mãos se abrem', 5, acordes([['Dó / Dó', 1, [48, 60], 'E1 D1'], ['Si / Ré', 1, [47, 62], 'E2 D2'], ['Lá / Mi', 1, [45, 64], 'E3 D3'], ['Sol / Fá', 1, [43, 65], 'E4 D4'], ['Fá / Sol', 2, [41, 67], 'E5 D5'], ['Sol / Fá', 1, [43, 65], 'E4 D4'], ['Lá / Mi', 1, [45, 64], 'E3 D3'], ['Si / Ré', 1, [47, 62], 'E2 D2'], ['Dó / Dó', 2, [48, 60], 'E1 D1']], 60, { repeticoes: 3 })),
        t('Toque "Dó-ré-mi-fá" com as duas mãos ao mesmo tempo, uma oitava de distância.', 4)
      ]],
      ['Escala de Dó com passagem do polegar', 'Intermediário', 'O polegar passa por baixo da mão sem levantar o punho. Devagar e igual.', [
        t('Mão direita: 1-2-3-1-2-3-4-5 subindo, 5-4-3-2-1-3-2-1 descendo', 6, demo(seq(MAIOR, 1, 2), 60, 60, 'Mão direita: 1-2-3, polegar passa, 1-2-3-4-5', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Mão esquerda: 5-4-3-2-1-3-2-1 subindo, 1-2-3-1-2-3-4-5 descendo', 6, demo(seq(MAIOR, 1, 2), 48, 60, 'Mão esquerda: 5-4-3-2-1, o dedo 3 cruza, 3-2-1', { mao: 'E', dedos: E_ESC, repeticoes: 2 })),
        t('Mãos juntas, uma oitava de distância', 6, acordes(pares(MAIOR, 48, 60, E_ESC, D_ESC), 56, { repeticoes: 2, texto: 'Mãos juntas' }))
      ]],
      ['Escalas de Sol e Fá maior', 'Intermediário', 'Sol maior tem um sustenido (Fá♯). Fá maior tem um bemol (Si♭).', [
        t('Sol maior, mão direita: 1-2-3-1-2-3-4-5 (igual a Dó)', 5, demo(seq(MAIOR, 1, 2), 67, 60, 'Sol maior: não esqueça o Fá♯', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Fá maior, mão direita: 1-2-3-4-1-2-3-4 (o polegar passa depois do Si♭)', 5, demo(seq(MAIOR, 1, 2), 65, 60, 'Fá maior: Si♭ com o dedo 4', { mao: 'D', dedos: D_FA, repeticoes: 2 })),
        t('Sol maior, mão esquerda: 5-4-3-2-1-3-2-1', 4, demo(seq(MAIOR, 1, 2), 43, 60, 'Mão esquerda em Sol maior', { mao: 'E', dedos: E_ESC, repeticoes: 2 })),
        t('Fá maior, mão esquerda: 5-4-3-2-1-3-2-1', 4, demo(seq(MAIOR, 1, 2), 41, 60, 'Mão esquerda em Fá maior', { mao: 'E', dedos: E_ESC, repeticoes: 2 }))
      ]],
      ['Dinâmica e articulação', 'Intermediário', 'Legato = notas ligadas. Staccato = notas curtas. p (piano) = fraco, f (forte) = forte.', [
        t('Staccato: solte cada tecla rápido, com o punho leve', 4, demo(curto(CINCO), 60, 80, 'Staccato: curto e leve', { mao: 'D', dedos: D5, repeticoes: 3 })),
        t('Legato com crescendo: comece fraco (p) e chegue forte (f) no Dó de cima', 4, demo(seq(MAIOR, 1, 2), 60, 60, 'Cresça até o Dó de cima e diminua na volta', { mao: 'D', dedos: D_ESC, repeticoes: 2 })),
        t('Toque "Dó-ré-mi-fá" duas vezes: uma piano (fraco) e uma forte.', 4, demo(DO_RE_MI_FA, 60, 80, '1ª vez piano, 2ª vez forte', { mao: 'D', repeticoes: 2 }))
      ]],
      ['Arpejos, cadência e primeira peça', 'Intermediário', 'Esta aula fecha o básico: arpejo, a cadência mais usada da música e uma peça de verdade.', [
        t('Arpejo de Dó maior, mão direita: 1-2-3-5-3-2-1', 4, demo(seq([0, 4, 7, 12, 7, 4, 0], 1, 2), 60, 72, 'Mão direita: 1-2-3-5-3-2-1', { mao: 'D', dedos: D_ARP, repeticoes: 4 })),
        t('Cadência I - IV - V - I: mão esquerda no baixo, direita nos acordes', 5, acordes([['C', 4, [48, 60, 64, 67]], ['F', 4, [41, 60, 65, 69]], ['G', 4, [43, 59, 62, 67]], ['C', 4, [48, 60, 64, 67]]], 60, { repeticoes: 4 })),
        t('Ode à Alegria (Beethoven), mão direita na posição de Dó', 8, demo(ODE, 60, 90, 'Ode à Alegria: comece no Mi com o dedo 3', { mao: 'D', repeticoes: 2 })),
        t('Grave a Ode à Alegria e poste na Comunidade.', 3)
      ]]
    ]),

    // ======================= VIOLÃO (24 aulas em 6 módulos) =======================
    curso('Violão', 'Violão', [
      // ----- Módulo 1: Primeiros passos -----
      ['Conhecendo o violão e afinação', 'Iniciante', 'Unhas da mão esquerda curtas. Aperte a corda perto do traste, não em cima dele.', [
        t('Cordas: da mais fina (1ª, Mi) para a mais grossa (6ª, Mi grave). Postura: violão na perna, polegar da mão esquerda atrás do braço.', 3),
        t('Afinação: ouça cada nota e afine a corda até soar igual', 5, demo(AFINACAO, 40, 60, 'Afine cada corda até soar igual à nota de referência', { repeticoes: 2, semPiano: true })),
        t('Mão direita: polegar (p) nas cordas 6, 5 e 4; indicador (i), médio (m) e anelar (a) nas cordas 3, 2 e 1', 5, demo([[0, 1, 'p · 6ª corda'], [5, 1, 'p · 5ª corda'], [10, 1, 'p · 4ª corda'], [15, 1, 'i · 3ª corda'], [19, 1, 'm · 2ª corda'], [24, 1, 'a · 1ª corda']], 40, 60, 'Uma corda solta por tempo', { repeticoes: 4, semPiano: true })),
        t('Como se lê música de violão: clave de sol com um 8 embaixo (o violão soa uma oitava abaixo do que está escrito). Embaixo vem a tablatura: 6 linhas = 6 cordas (a linha de cima é a 1ª corda) e o número é a casa.', 3)
      ]],
      ['Primeiros acordes: Em e Am', 'Iniciante', 'No braço da tela, as linhas deitadas são as cordas (Mi grave embaixo). Bolinha com número = dedo que aperta; × = não toca; ○ = corda solta; pontilhado = próximo acorde.', [
        t('Troque entre Em e Am', 6, acordes('Em:4 Am:4', 60, { braco: true, repeticoes: 4 })),
        t('Toque corda por corda: todas precisam soar limpas. Se alguma abafar, ajuste o dedo.', 3),
        t('Mais rápido, sem parar antes do tempo 1', 5, acordes('Em:4 Am:4', 76, { braco: true, repeticoes: 6 }))
      ]],
      ['Leitura: Sol, Lá, Si e Dó nas cordas 3 e 2', 'Iniciante', 'As notas da lição de partitura no violão: Sol = 3ª corda solta; Lá = 3ª corda, casa 2 (dedo 2); Si = 2ª corda solta; Dó = 2ª corda, casa 1 (dedo 1). Toque alternando i e m.', [
        t('3ª corda: Sol e Lá', 4, demo([[0, 1], [2, 1], [0, 1], [2, 1], [0, 2], [2, 2]], 55, 60, 'Leia e toque', { repeticoes: 3 })),
        t('2ª corda: Si e Dó', 4, demo([[0, 1], [1, 1], [0, 1], [1, 1], [0, 2], [1, 2]], 59, 60, 'Leia e toque', { repeticoes: 3 })),
        t('As quatro notas juntas', 5, demo([[0, 1], [2, 1], [4, 1], [5, 1], [4, 1], [2, 1], [0, 2]], 55, 63, 'Leia e toque', { repeticoes: 2, leitura: true })),
        t('No caderno: desenhe uma pauta e escreva Sol, Lá, Si e Dó. Embaixo de cada nota, escreva a corda e a casa.', 3)
      ]],
      ['Acordes D, A e E', 'Iniciante', 'Dica: quando dois acordes têm um dedo no mesmo lugar, deixe esse dedo parado na troca.', [
        t('D e A', 5, acordes('D:4 A:4', 60, { braco: true, repeticoes: 4 })),
        t('A e E', 5, acordes('A:4 E:4', 60, { braco: true, repeticoes: 4 })),
        t('E - A - D - A', 6, acordes('E:4 A:4 D:4 A:4', 66, { braco: true, repeticoes: 4 })),
        t('As notas novas da lição no violão: Dó (5ª corda, casa 3), Ré (4ª solta), Mi (4ª, casa 2) e Fá (4ª, casa 3)', 4, demo([[0, 1], [2, 1], [4, 1], [5, 1], [4, 1], [2, 1], [0, 2]], 48, 60, 'Leia e toque', { repeticoes: 2 }))
      ]],
      // ----- Módulo 2: Ritmo e primeiras músicas -----
      ['G e C: a primeira progressão', 'Iniciante', 'G e C são os acordes mais usados do violão popular. Vale cada minuto de treino.', [
        t('G e C', 5, acordes('G:4 C:4', 60, { braco: true, repeticoes: 4 })),
        t('G - D - C - G', 6, acordes('G:4 D:4 C:4 G:4', 66, { braco: true, repeticoes: 4 })),
        t('G - Em - C - D', 6, acordes('G:4 Em:4 C:4 D:4', 72, { braco: true, repeticoes: 4 })),
        t('Desafio: troque de G para C em menos de 1 tempo.', 2)
      ]],
      ['Ritmo: batidas', 'Iniciante', '↓ = para baixo, ↑ = para cima. A mão direita nunca para: sobe e desce o tempo todo, mesmo quando não toca a corda.', [
        t('Uma batida para baixo em cada tempo', 3, metronomo(70, 4, '↓ ↓ ↓ ↓', 16)),
        t('Colcheias: para baixo no número, para cima no "e"', 4, metronomo(70, 4, '↓↑ ↓↑ ↓↑ ↓↑', 16)),
        t('Leitura rítmica: semínima = 1 tempo (↓), colcheias = 2 por tempo (↓↑). Toque as figuras da pauta na 2ª corda solta.', 4, demo([[0, 1], [0, 1], [0, 0.5], [0, 0.5], [0, 1], [0, 0.5], [0, 0.5], [0, 0.5], [0, 0.5], [0, 2]], 59, 70, 'Siga as figuras', { repeticoes: 3 })),
        t('Levada pop: ↓ ↓↑ ↑↓↑', 5, metronomo(80, 4, '↓ · ↓↑ · ↑↓↑ (1 · 2 e · e 4 e)', 16)),
        t('Levada pop na progressão', 6, acordes('G:4 D:4 Em:4 C:4', 80, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' }))
      ]],
      ['Leitura: Dó, Ré, Mi e Fá e a primeira melodia', 'Iniciante', 'Com as notas da oitava completa (do Dó da 5ª corda ao Dó da 2ª corda) já dá para ler uma melodia inteira na primeira posição.', [
        t('Dó e Ré: 5ª corda, casa 3, e 4ª corda solta', 4, demo([[0, 1], [2, 1], [0, 1], [2, 1], [0, 2], [2, 2]], 48, 60, 'Leia e toque', { repeticoes: 3 })),
        t('Ode à Alegria (Beethoven) lendo a partitura', 8, demo(ODE, 48, 80, 'Leia e toque', { repeticoes: 2, leitura: true })),
        t('Grave a Ode à Alegria lendo a partitura e poste na Comunidade.', 3)
      ]],
      ['Dedilhado', 'Intermediário', 'p = polegar, i = indicador, m = médio, a = anelar. O polegar toca o baixo (a corda que dá nome ao acorde).', [
        t('Am e E com dedilhado p-i-m-a', 6, acordes('Am:4 E:4', 60, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a'], texto: 'Uma nota por tempo: p · i · m · a' })),
        t('C - G - Am - Em com dedilhado p-i-m-a', 6, acordes('C:4 G:4 Am:4 Em:4', 66, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a'], texto: 'p · i · m · a' })),
        t('Variação p-i-m-a-m-i, duas notas por tempo (compasso de 3)', 5, acordes('C:3 Am:3 Em:3 G:3', 60, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a', 'm', 'i'], passo: 0.5, texto: 'p · i · m · a · m · i' }))
      ]],
      // ----- Módulo 3: Baixos, sétimas e a escala -----
      ['Leitura: as cordas graves', 'Intermediário', 'Os baixos ficam embaixo da pauta, com linhas suplementares. 6ª corda: Mi, Fá (casa 1), Sol (casa 3). 5ª: Lá, Si (casa 2), Dó (casa 3). 4ª: Ré, Mi (casa 2), Fá (casa 3). Toque com o polegar.', [
        t('6ª corda: Mi, Fá e Sol', 4, demo([[0, 1], [1, 1], [3, 1], [1, 1], [0, 2], [null, 2]], 40, 60, 'Polegar (p)', { repeticoes: 3 })),
        t('5ª corda: Lá, Si e Dó', 4, demo([[0, 1], [2, 1], [3, 1], [2, 1], [0, 2], [null, 2]], 45, 60, 'Polegar (p)', { repeticoes: 3 })),
        t('4ª corda: Ré, Mi e Fá', 4, demo([[0, 1], [2, 1], [3, 1], [2, 1], [0, 2], [null, 2]], 50, 60, 'Polegar (p)', { repeticoes: 3 })),
        t('Todas as notas naturais das cordas graves, do Mi ao Fá e de volta', 5, demo(seq([0, 1, 3, 5, 7, 8, 10, 12, 13, 12, 10, 8, 7, 5, 3, 1, 0], 1, 4), 40, 66, 'Leia e toque com o polegar', { leitura: true }))
      ]],
      ['Acordes com sétima', 'Intermediário', 'O acorde com sétima (7) cria tensão e pede para resolver no próximo acorde.', [
        t('Conheça A7, D7, E7 e B7', 4, acordes('A7:4 D7:4 E7:4 B7:4', 60, { braco: true, repeticoes: 2 })),
        t('Em - Am - B7 - Em', 6, acordes('Em:4 Am:4 B7:4 Em:4', 70, { braco: true, repeticoes: 4 })),
        t('A - A7 - D - E7', 6, acordes('A:4 A7:4 D:4 E7:4', 70, { braco: true, repeticoes: 4 }))
      ]],
      ['Baixo alternado e valsa', 'Intermediário', 'O polegar toca o baixo e os dedos i-m-a tocam o acorde juntos. Na valsa (compasso 3/4): baixo no 1, acorde no 2 e no 3.', [
        t('Valsa em 3/4: C - G7 - G7 - C', 6, acordes('C:3 G7:3 G7:3 C:3', 90, { braco: true, repeticoes: 4, texto: 'Baixo · acorde · acorde (1 2 3)' })),
        t('Valsa em Lá menor: Am - E7 - E7 - Am', 6, acordes('Am:3 E7:3 E7:3 Am:3', 90, { braco: true, repeticoes: 4, texto: 'Baixo · acorde · acorde (1 2 3)' })),
        t('Baixo alternado em 4/4: baixo, acorde, outro baixo do acorde, acorde', 6, acordes('C:4 G7:4 Am:4 E7:4', 76, { braco: true, repeticoes: 4, texto: 'Baixo · acorde · baixo · acorde' })),
        t('As notas agudas da lição no violão: Ré (2ª corda, casa 3), Mi (1ª solta), Fá (1ª, casa 1) e Sol (1ª, casa 3)', 4, demo([[2, 1], [4, 1], [5, 1], [7, 1], [5, 1], [4, 1], [2, 2]], 60, 60, 'Leia e toque', { repeticoes: 2 }))
      ]],
      ['Escala de Dó maior na primeira posição', 'Intermediário', 'A escala de Dó usa as notas que você já leu nas cordas graves e agudas. Um dedo por casa: casa 1 = dedo 1, casa 2 = dedo 2, casa 3 = dedo 3.', [
        t('Escala de Dó maior, do Dó da 5ª corda ao Dó da 2ª corda', 6, demo(seq(MAIOR, 1, 2), 48, 60, 'Leia na pauta e toque', { leitura: true })),
        t('Em colcheias, alternando i e m', 5, demo(seq(MAIOR, 0.5, 1), 48, 70, 'Duas notas por tempo')),
        t('Terças na escala: Dó-Mi, Ré-Fá, Mi-Sol…', 5, demo(seq([0, 4, 2, 5, 4, 7, 5, 9, 7, 11, 9, 12, 0], 1, 4), 48, 60, 'Leia e toque', { leitura: true }))
      ]],
      // ----- Módulo 4: Pestana e tonalidades -----
      ['Pestana e primeira música', 'Intermediário', 'Pestana: o dedo 1 deitado aperta várias cordas. No começo cansa; pare quando doer.', [
        t('F com pestana e C', 5, acordes('F:4 C:4', 56, { braco: true, repeticoes: 4, texto: 'Dedo 1 reto, perto do traste' })),
        t('Campo harmônico de Sol: G - Em - Bm - C - D', 6, acordes('G:4 Em:4 Bm:4 C:4 D:4', 72, { braco: true, repeticoes: 3 })),
        t('C - G - Am - F com a levada pop', 6, acordes('C:4 G:4 Am:4 F:4', 76, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' })),
        t('Escolha uma música com G, D, Em e C e toque inteira com a levada pop. Poste na Comunidade!', 4)
      ]],
      ['Leitura: Sol maior e o Fá♯', 'Intermediário', 'O sustenido no começo da pauta (armadura de clave) quer dizer: todo Fá vira Fá♯. Isso é o tom de Sol maior.', [
        t('Escala de Sol maior: o Fá♯ fica na 1ª corda, casa 2', 5, demo(seq(MAIOR, 1, 2), 55, 60, 'Leia a armadura!', { armadura: 1, leitura: true })),
        t('Melodia em Sol maior: lembre do Fá♯ (4ª corda, casa 4, e 1ª corda, casa 2)', 6, demo([[0, 1], [4, 1], [7, 1], [4, 1], [5, 1], [2, 1], [-1, 1], [0, 1], [4, 0.5], [5, 0.5], [7, 0.5], [9, 0.5], [11, 1], [12, 1], [11, 1], [9, 1], [7, 2]], 55, 63, 'Leia e toque', { armadura: 1, leitura: true, repeticoes: 2 })),
        t('Acompanhe em Sol: G - Em - C - D', 4, acordes('G:4 Em:4 C:4 D:4', 72, { braco: true, repeticoes: 4 }))
      ]],
      ['Pestana na 2ª casa: Bm, F♯m e o tom de Ré', 'Intermediário', 'Bm e F♯m usam pestana na casa 2. Com eles você toca todo o campo harmônico de Ré maior: D, Em, F♯m, G, A e Bm.', [
        t('Bm e F♯m', 5, acordes('Bm:4 F#m:4', 56, { braco: true, repeticoes: 4, texto: 'Pestana na casa 2' })),
        t('Campo harmônico de Ré: D - Em - F♯m - G - A - Bm', 6, acordes('D:4 Em:4 F#m:4 G:4 A:4 Bm:4', 66, { braco: true, repeticoes: 2 })),
        t('D - Bm - G - A com a levada pop', 6, acordes('D:4 Bm:4 G:4 A:4', 76, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' }))
      ]],
      ['Levadas brasileiras: baião e xote', 'Intermediário', 'No baião, o polegar faz a célula da zabumba (1 · e 2) e os dedos respondem no contratempo. No xote, a levada balança com acento no 2 e no 4.', [
        t('Célula do baião só no baixo: 1 · e 2', 4, metronomo(84, 2, 'p · p p (1 · e 2)', 16)),
        t('Baião: Am - D - Am - E7', 6, acordes('Am:2 D:2 Am:2 E7:2', 84, { braco: true, repeticoes: 6, texto: 'Baixo na célula, acorde no contratempo' })),
        t('Xote: ↓ · ↓↑ · ↓ · ↓↑, acento no 2 e no 4', 6, acordes('G:4 D:4 D:4 G:4', 80, { braco: true, repeticoes: 4, texto: 'Xote: ↓ · ↓↑ · ↓ · ↓↑' }))
      ]],
      // ----- Módulo 5: Harmonia no violão -----
      ['Campo harmônico de Dó e funções', 'Intermediário', 'Tônica (C, Am, Em) = repouso; subdominante (F, Dm) = afastamento; dominante (G7, Bdim) = tensão que pede o C.', [
        t('Campo harmônico de Dó: C - Dm - Em - F - G - Am - Bdim', 6, acordes('C:4 Dm:4 Em:4 F:4 G:4 Am:4 Bdim:4 C:4', 60, { braco: true })),
        t('T - S - D - T: C - F - G7 - C', 5, acordes('C:4 F:4 G7:4 C:4', 70, { braco: true, repeticoes: 4 })),
        t('Com o ii: C - Am - Dm - G7', 5, acordes('C:4 Am:4 Dm:4 G7:4', 72, { braco: true, repeticoes: 4 })),
        t('No caderno: escreva a função (T, S ou D) de cada acorde de uma música que você toca.', 3)
      ]],
      ['Tonalidades menores', 'Intermediário', 'Em tom menor, o V vira maior com sétima (E7 em Lá menor) por causa da escala menor harmônica, que tem o Sol♯.', [
        t('Lá menor: Am - Dm - E7 - Am', 6, acordes('Am:4 Dm:4 E7:4 Am:4', 70, { braco: true, repeticoes: 4 })),
        t('Mi menor: Em - Am - B7 - Em', 6, acordes('Em:4 Am:4 B7:4 Em:4', 70, { braco: true, repeticoes: 4 })),
        t('Escala de Lá menor harmônica lida na pauta (repare no Sol♯)', 5, demo(seq(MENOR_HAR, 1, 2), 57, 60, 'Leia e toque', { leitura: true }))
      ]],
      ['Leitura: colcheias, ponto de aumento e pausas', 'Intermediário', 'Colcheia = meio tempo (conte "1 e 2 e"). O ponto soma metade do valor: semínima pontuada = 1 tempo e meio. Pausa também se conta.', [
        t('Colcheias', 5, demo(LICOES.colcheias.leitura.padrao, 48, 63, 'Conte "1 e 2 e"', { leitura: true, repeticoes: 2 })),
        t('Ponto de aumento', 5, demo(LICOES.ponto.leitura.padrao, 48, 63, 'Segure o ponto', { leitura: true, repeticoes: 2 })),
        t('Pausas: abafe a corda no silêncio', 4, demo([[0, 1], [null, 1], [4, 1], [null, 1], [7, 0.5], [null, 0.5], [7, 0.5], [null, 0.5], [4, 1], [null, 1], [0, 2], [null, 2]], 48, 66, 'Silêncio também é música', { leitura: true, repeticoes: 2 }))
      ]],
      ['Arpejos e dedilhado de balada', 'Intermediário', 'Na balada, o polegar toca o baixo e i-m-a-m-i desenham o acorde, uma nota de cada vez, em colcheias.', [
        t('C - G - Am - F com p-i-m-a-m-i-m-i', 6, acordes('C:4 G:4 Am:4 F:4', 66, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a', 'm', 'i', 'm', 'i'], passo: 0.5, texto: 'p · i · m · a · m · i · m · i' })),
        t('Am - Em - F - C', 6, acordes('Am:4 Em:4 F:4 C:4', 66, { braco: true, repeticoes: 4, dedilhado: ['p', 'i', 'm', 'a', 'm', 'i', 'm', 'i'], passo: 0.5, texto: 'p · i · m · a · m · i · m · i' })),
        t('Arpejo de Dó maior lido na pauta: Dó, Mi, Sol, Dó, Mi', 4, demo(seq([0, 4, 7, 12, 16, 12, 7, 4, 0], 1, 4), 48, 66, 'Leia e toque', { leitura: true }))
      ]],
      // ----- Módulo 6: Rumo ao repertório -----
      ['Pentatônica no violão', 'Intermediário', 'A pentatônica de Lá menor (Lá, Dó, Ré, Mi e Sol) serve para solos e introduções. A posição começa na 5ª casa.', [
        t('Leia e toque a pentatônica (siga o desenho no braço)', 8, demo(seq(PENTA_NOTAS, 1, 2), 45, 60, 'Siga o desenho no braço', { semPiano: true, diagrama: PENTA })),
        t('Improvise sobre Am - G - F - G usando só essas notas', 8, acordes('Am:4 G:4 F:4 G:4', 80, { repeticoes: 6, semPiano: true, diagrama: PENTA, texto: 'Improvise com a pentatônica de Lá menor' }))
      ]],
      ['Pestana na 5ª corda: B, Cm e C♯m', 'Avançado', 'É o desenho do A ou do Am com o dedo 1 fazendo pestana. Mova a forma pelo braço para mudar de acorde.', [
        t('Dó menor: Cm - Fm - G - Cm', 6, acordes('Cm:4 Fm:4 G:4 Cm:4', 60, { braco: true, repeticoes: 4 })),
        t('Mi maior: E - B - C♯m - A', 6, acordes('E:4 B:4 C#m:4 A:4', 66, { braco: true, repeticoes: 4 })),
        t('Bm - G - D - A com a levada pop', 5, acordes('Bm:4 G:4 D:4 A:4', 76, { braco: true, repeticoes: 4, texto: 'Levada: ↓ ↓↑ ↑↓↑' }))
      ]],
      ['Cifra, tablatura e partitura juntas', 'Avançado', 'Na vida real a música chega em cifra (acordes), tablatura (riffs e solos) ou partitura (melodia). Aqui você treina as três.', [
        t('Riff nas cordas graves: leia a tablatura (corda e casa) e confira na pauta', 5, demo([[0, 1], [3, 1], [5, 2], [0, 1], [3, 1], [6, 0.5], [5, 1.5], [0, 1], [3, 1], [5, 2], [3, 1], [0, 3]], 40, 80, 'Leia a tablatura', { repeticoes: 2 })),
        t('Cifras novas: C7M, Am7, Dsus4 e Asus4', 5, acordes('Cmaj7:4 Am7:4 Dsus4:2 D:2 Asus4:2 A:2', 66, { braco: true, repeticoes: 3 })),
        t('Brilha, brilha, estrelinha: leia a melodia na partitura', 5, demo(LICOES.oitava.leitura.padrao, 48, 72, 'Leia e toque', { leitura: true, repeticoes: 2 })),
        t('Agora acompanhe a mesma melodia com a cifra', 4, acordes('C:4 F:2 C:2 F:2 C:2 G:2 C:2', 72, { braco: true, repeticoes: 3 }))
      ]],
      ['Repertório e apresentação', 'Avançado', 'Hora de juntar tudo: escolher uma música, montar o arranjo (introdução, levada, dedilhado) e tocar do começo ao fim.', [
        t('Aquecimento: escala de Dó em colcheias, limpa e no tempo', 5, demo(seq(MAIOR, 0.5, 1), 48, 72, 'Aquecimento')),
        t('Escolha uma música do seu repertório. Escreva a cifra no caderno e marque as partes (introdução, verso, refrão).', 5),
        t('Toque a música inteira junto com o metrônomo, sem parar nos erros', 10, metronomo(72, 4, 'Toque a música inteira junto com o clique', 64)),
        t('Grave um vídeo tocando a música completa e poste na Comunidade. Parabéns por concluir o curso de violão!', 5)
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
        t('Intervalos maiores e justos a partir de Dó', 5, demo([[0, 2, 'Dó'], [2, 2, '2ª maior'], [0, 2, 'Dó'], [4, 2, '3ª maior'], [0, 2, 'Dó'], [5, 2, '4ª justa'], [0, 2, 'Dó'], [7, 2, '5ª justa'], [0, 2, 'Dó'], [9, 2, '6ª maior'], [0, 2, 'Dó'], [11, 2, '7ª maior'], [0, 2, 'Dó'], [12, 2, '8ª justa']], 60, 72, 'Ouça e cante cada intervalo')),
        t('Intervalos menores e o trítono', 4, demo([[0, 2, 'Dó'], [1, 2, '2ª menor'], [0, 2, 'Dó'], [3, 2, '3ª menor'], [0, 2, 'Dó'], [6, 2, '4ª aumentada (trítono)'], [0, 2, 'Dó'], [8, 2, '6ª menor'], [0, 2, 'Dó'], [10, 2, '7ª menor']], 60, 72, 'Compare com os maiores')),
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

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
  var DO_RE_MI_FA = [[0, 1], [2, 1], [4, 1], [5, 1], [5, 1], [5, 2], [0, 1], [2, 1], [0, 1], [2, 1], [2, 1], [2, 2],
                     [0, 1], [7, 1], [5, 1], [4, 1], [4, 1], [4, 2], [0, 1], [2, 1], [4, 1], [5, 1], [5, 1], [5, 2]];
  function pares(semitons, baixo, alto, dedosE, dedosD) { // duas mãos, uma oitava de distância
    var n = ['Dó', 'Dó♯', 'Ré', 'Mi♭', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Lá♭', 'Lá', 'Si♭', 'Si'];
    var e = dedosE.split(' '), d = dedosD.split(' ');
    return semitons.map(function (s, i) { return [n[(s % 12 + 12) % 12], 1, [baixo + s, alto + s], 'E' + e[i] + ' D' + d[i]]; });
  }

  function curso(instrumento, prefixo, aulas, nome) {
    return {
      instrumento: instrumento, nome: nome || instrumento,
      aulas: aulas.map(function (a, i) {
        return { titulo: prefixo + ' · Aula ' + (i + 1) + ': ' + a[0], instrumento: instrumento, nivel: a[1], observacao: a[2], itens: a[3] };
      })
    };
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

// Tocador da área do aluno: piano na tela, braço do violão, metrônomo, vocalizes e acordes.
// Um exercício com som fica guardado no item da rotina, no campo "vocalize":
//   { tipo: 'notas', silaba, padrao: [[semitom|null, tempos, rótulo?], ...], de, ate, direcao, bpm, acorde }
//       vocalize: sobe de meio em meio tom de "de" até "ate" (tons da voz feminina; a masculina toca uma oitava abaixo)
//       com demo: true é uma demonstração fixa em "de" (escala, melodia, afinação), repetida "repeticoes" vezes
//   { tipo: 'acordes', acordes: [[cifra, tempos, midis?], ...], repeticoes, bpm, braco: true (desenho no braço) }
//   { tipo: 'metronomo', bpm, tempos (por compasso), compassos, texto }
//   { tipo: 'respiracao', fases: [[texto, tempos], ...], repeticoes, bpm }
//   { tipo: 'piano', de, ate, demo }
// Opcionais: semPiano (não mostra o piano), diagrama (desenho no braço: cifra ou { nome, inicio, pontos }), texto (instrução fixa),
//   ocultar (ditado: não mostra nomes de notas nem de acordes).
(function () {
  'use strict';

  var NOMES = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si'];
  function pc(midi) { return ((midi % 12) + 12) % 12; }
  function nomeNota(midi) { return NOMES[pc(midi)] + (Math.floor(midi / 12) - 1); }
  function ehPreta(midi) { return [1, 3, 6, 8, 10].indexOf(pc(midi)) >= 0; }

  // ---------- Padrões prontos (semitom a partir da tônica, duração em tempos) ----------
  function seq(semitons, dur, ultimo) {
    return semitons.map(function (s, i) { return [s, i === semitons.length - 1 && ultimo ? ultimo : dur]; });
  }
  function curto(semitons) {
    var p = [];
    semitons.forEach(function (s, i) { if (i === semitons.length - 1) p.push([s, 1]); else p.push([s, 0.5], [null, 0.5]); });
    return p;
  }
  var PADROES = {
    cinco: { nome: '5 notas (1-2-3-4-5-4-3-2-1)', padrao: seq([0, 2, 4, 5, 7, 5, 4, 2, 0], 1, 2) },
    tres: { nome: '3 notas (1-2-3-2-1)', padrao: seq([0, 2, 4, 2, 0], 1, 2) },
    arpejo: { nome: 'Arpejo (1-3-5-3-1)', padrao: seq([0, 4, 7, 4, 0], 1, 2) },
    oitava: { nome: 'Arpejo com oitava (1-3-5-8-5-3-1)', padrao: seq([0, 4, 7, 12, 7, 4, 0], 1, 2) },
    nove: { nome: 'Escala de 9 notas (1 ao 9 e volta)', padrao: seq([0, 2, 4, 5, 7, 9, 11, 12, 14, 12, 11, 9, 7, 5, 4, 2, 0], 0.5, 1) },
    rapido: { nome: '5 notas rápidas (agilidade)', padrao: seq([0, 2, 4, 5, 7, 5, 4, 2, 0], 0.5, 1) },
    desce: { nome: 'Descendo do 5 (5-4-3-2-1)', padrao: seq([7, 5, 4, 2, 0], 1, 2) },
    quinta: { nome: 'Salto de quinta (1-5-1)', padrao: [[0, 1], [7, 1], [0, 2]] },
    longa: { nome: 'Nota longa (6 tempos)', padrao: [[0, 6]] },
    longa8: { nome: 'Nota longa (8 tempos)', padrao: [[0, 8]] },
    eco: { nome: 'Ouça e repita (eco)', padrao: [[0, 2], [null, 2], [2, 2], [null, 2], [4, 2], [null, 2], [2, 2], [null, 2], [0, 2], [null, 2]] },
    staccato: { nome: 'Staccato no arpejo (1-3-5-8-5-3-1 curto)', padrao: curto([0, 4, 7, 12, 7, 4, 0]) },
    intervalos: { nome: 'Intervalos (1-3, 1-5, 1-8)', padrao: [[0, 1], [4, 1], [0, 1], [7, 1], [0, 1], [12, 2]] },
    oitavaSalto: { nome: 'Salto de oitava (1-8-1)', padrao: [[0, 1], [12, 2], [0, 2]] },
    escala: { nome: 'Escala maior (1 ao 8 e volta)', padrao: seq([0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0], 1, 2) },
    terca: { nome: 'Terças (1-3-2-4-3-5-4-2-1)', padrao: seq([0, 4, 2, 5, 4, 7, 5, 2, 0], 1, 2) }
  };

  // ---------- Cifras ----------
  var PC_LETRA = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var QUALIDADE = {
    '': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], '7M': [0, 4, 7, 11], 'maj7': [0, 4, 7, 11],
    'dim': [0, 3, 6], '°': [0, 3, 6], 'aug': [0, 4, 8], '+': [0, 4, 8], 'm7(b5)': [0, 3, 6, 10], 'ø': [0, 3, 6, 10],
    '5': [0, 7, 12], 'sus4': [0, 5, 7], 'sus2': [0, 2, 7], '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9], '9': [0, 4, 7, 10, 14], 'add9': [0, 4, 7, 14]
  };
  function pcDe(txt) { var x = txt.match(/^([A-G])([#b]?)/); return x ? (PC_LETRA[x[1]] + (x[2] === '#' ? 1 : x[2] === 'b' ? -1 : 0) + 12) % 12 : null; }
  // Voz de teclado: baixo na mão esquerda (Sol1 a Fá♯2) + acorde na direita (Sol3 a Fá♯4)
  function notasDaCifra(cifra) {
    var x = String(cifra).match(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/);
    if (!x) return [];
    var r = pcDe(x[1]), q = QUALIDADE[x[2]] || QUALIDADE[''];
    var raiz = 55 + ((r - 7 + 12) % 12);
    var baixo = x[3] != null ? pcDe(x[3]) : r;
    return [43 + ((baixo - 7 + 12) % 12)].concat(q.map(function (s) { return raiz + s; }));
  }

  // Desenhos no braço (cordas da 6ª para a 1ª; x = não tocar). d = dedos.
  var DIAGRAMAS = {
    C: { f: 'x32010', d: '-32-1-' }, G: { f: '320003', d: '21---3' }, D: { f: 'xx0232', d: '---132' },
    A: { f: 'x02220', d: '--123-' }, E: { f: '022100', d: '-231--' }, Am: { f: 'x02210', d: '--231-' },
    Em: { f: '022000', d: '-23---' }, Dm: { f: 'xx0231', d: '---231' }, A7: { f: 'x02020', d: '--2-3-' },
    D7: { f: 'xx0212', d: '---213' }, E7: { f: '020100', d: '-2-1--' }, B7: { f: 'x21202', d: '-213-4' },
    G7: { f: '320001', d: '32---1' }, C7: { f: 'x32310', d: '-3241-' }, Fmaj7: { f: 'xx3210', d: '--321-' },
    F: { f: '133211', d: '134211', pestana: 1 }, Bm: { f: 'x24432', d: '-13421', pestana: 2 },
    E5: { f: '022xxx', d: '-12---' }, A5: { f: 'x022xx', d: '--12--' }, D5: { f: 'x577xx', d: '-134--' },
    G5: { f: '355xxx', d: '134---' }, C5: { f: 'x355xx', d: '-134--' }, F5: { f: '133xxx', d: '134---' }
  };
  var CORDAS_SOLTAS = [40, 45, 50, 55, 59, 64]; // Mi2 Lá2 Ré3 Sol3 Si3 Mi4
  function diagramaDe(c) {
    if (!c) return null;
    if (typeof c === 'object') return c;
    var d = DIAGRAMAS[c]; if (!d) return null;
    var pontos = [], abafadas = [], soltas = [];
    d.f.split('').forEach(function (ch, i) {
      var corda = 6 - i;
      if (ch === 'x') abafadas.push(corda);
      else if (ch === '0') soltas.push(corda);
      else if (!(d.pestana && Number(ch) === d.pestana && d.d[i] === '1')) pontos.push([corda, Number(ch), d.d[i] === '-' ? '' : d.d[i]]);
    });
    return { nome: c, pontos: pontos, abafadas: abafadas, soltas: soltas, pestana: d.pestana };
  }
  function notasDoBraco(c) {
    var d = DIAGRAMAS[c]; if (!d) return null;
    var n = [];
    d.f.split('').forEach(function (ch, i) { if (ch !== 'x') n.push(CORDAS_SOLTAS[i] + Number(ch)); });
    return n;
  }

  // ---------- Som (síntese, sem arquivos externos) ----------
  var ctx = null, saida = null;
  function novaSaida() {
    var comp = ctx.createDynamicsCompressor();
    saida = ctx.createGain(); saida.gain.value = 0.8;
    saida.connect(comp); comp.connect(ctx.destination);
  }
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); novaSaida();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // Piano com harmônicos + uma voz-guia suave que sustenta a nota (ajuda quem canta junto)
  function somNota(midi, quando, dur, volume, semGuia) {
    var c = audio(); if (!c) return;
    var t0 = Math.max(quando || 0, c.currentTime) + 0.005, v = volume || 1;
    var f = 440 * Math.pow(2, (midi - 69) / 12);
    var queda = Math.max(1.2, 2.4 - (midi - 60) * 0.03);
    var fim = t0 + Math.max(dur || 1, 0.3);
    var filtro = c.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(Math.min(f * 8, 9000), t0);
    filtro.frequency.exponentialRampToValueAtTime(Math.max(f * 1.5, 400), t0 + queda);
    var env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(0.3 * v, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(0.11 * v, t0 + 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + queda);
    filtro.connect(env); env.connect(saida);
    [[1, 1], [2, 0.45], [3, 0.2], [4, 0.1], [5, 0.05]].forEach(function (p) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.value = f * p[0] * (1 + (p[0] - 1) * 0.0008);
      g.gain.value = p[1];
      o.connect(g); g.connect(filtro);
      o.start(t0); o.stop(t0 + queda + 0.05);
    });
    if (dur && !semGuia) {
      var guia = c.createOscillator(), gg = c.createGain();
      guia.type = 'triangle'; guia.frequency.value = f;
      gg.gain.setValueAtTime(0.0001, t0);
      gg.gain.exponentialRampToValueAtTime(0.05 * v, t0 + 0.08);
      gg.gain.setValueAtTime(0.05 * v, Math.max(t0 + 0.09, fim - 0.08));
      gg.gain.exponentialRampToValueAtTime(0.0001, fim + 0.05);
      guia.connect(gg); gg.connect(saida);
      guia.start(t0); guia.stop(fim + 0.1);
    }
  }
  function clique(quando, forte) {
    var c = audio(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'square'; o.frequency.value = forte ? 1760 : 1180;
    g.gain.setValueAtTime(0.0001, quando);
    g.gain.exponentialRampToValueAtTime(forte ? 0.16 : 0.09, quando + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.035);
    o.connect(g); g.connect(saida);
    o.start(quando); o.stop(quando + 0.05);
  }

  // ---------- Preferências do aluno ----------
  function lerPref(k, padrao) { try { var v = localStorage.getItem('amaral-' + k); return v == null ? padrao : v; } catch (e) { return padrao; } }
  function gravarPref(k, v) { try { localStorage.setItem('amaral-' + k, v); } catch (e) { /* sem armazenamento */ } }

  // ---------- DOM ----------
  var SVG = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, texto) { var e = document.createElementNS(SVG, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (texto != null) e.textContent = texto; return e; }
  function h(tag, attrs) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'text') e.textContent = v; else if (k === 'class') e.className = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }
    return e;
  }
  function opcoesNotas(sel, de, ate, valor) {
    sel.replaceChildren();
    for (var m = de; m <= ate; m++) sel.appendChild(h('option', { value: String(m), text: nomeNota(m), selected: m === valor }));
  }

  // Teclado SVG de lo até hi (midi). Retorna { el, acender(midi, seg), marcar(lista) }
  function criarTeclado(lo, hi, aoTocar, todosNomes) {
    while (ehPreta(lo)) lo--;
    while (ehPreta(hi)) hi++;
    var brancas = [];
    for (var m = lo; m <= hi; m++) if (!ehPreta(m)) brancas.push(m);
    var L = 26, H = 112, W = brancas.length * L;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + (H + 2), class: 'piano', role: 'group', 'aria-label': 'Piano de ' + nomeNota(lo) + ' a ' + nomeNota(hi) });
    svg.style.maxWidth = (brancas.length * 46) + 'px';
    var porMidi = {}, pretas = svgEl('g', {});
    function tecla(x, w, alt, classe, midi) {
      var r = svgEl('rect', { x: x, y: 1, width: w, height: alt, rx: 3, class: classe, tabindex: '0', role: 'button', 'aria-label': nomeNota(midi) });
      r.addEventListener('pointerdown', function (e) { e.preventDefault(); aoTocar(midi); });
      r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aoTocar(midi); } });
      porMidi[midi] = r; return r;
    }
    brancas.forEach(function (m, i) {
      svg.appendChild(tecla(i * L + 0.75, L - 1.5, H, 'branca', m));
      if (todosNomes || pc(m) === 0) svg.appendChild(svgEl('text', { x: i * L + L / 2, y: H - 8, class: 'nome' }, todosNomes ? NOMES[pc(m)] : nomeNota(m)));
      if (ehPreta(m + 1) && m + 1 <= hi) pretas.appendChild(tecla((i + 1) * L - 8, 16, 70, 'preta', m + 1));
    });
    svg.appendChild(pretas);
    var marcadas = [];
    return {
      el: svg,
      acender: function (midi, seg) {
        var r = porMidi[midi]; if (!r) return;
        r.classList.add('tocando');
        clearTimeout(r._t); r._t = setTimeout(function () { r.classList.remove('tocando'); }, Math.max(160, (seg || 0.25) * 1000 - 40));
      },
      marcar: function (lista) {
        marcadas.forEach(function (r) { r.classList.remove('acesa'); });
        marcadas = (lista || []).map(function (m) { return porMidi[m]; }).filter(Boolean);
        marcadas.forEach(function (r) { r.classList.add('acesa'); });
      }
    };
  }

  // Desenho do braço: 6 cordas na vertical (6ª à esquerda), 5 casas
  function desenharBraco(d) {
    var casas = d.pontos.map(function (p) { return p[1]; }).concat(d.pestana ? [d.pestana] : []);
    var maior = Math.max.apply(null, casas.concat([1]));
    var inicio = d.inicio || (maior > 5 ? Math.min.apply(null, casas.filter(function (c) { return c > 0; })) : 1);
    var X0 = 22, Y0 = 36, DX = 14, DY = 20, N = 5;
    var svg = svgEl('svg', { viewBox: '0 0 112 ' + (Y0 + N * DY + 8), class: 'braco', role: 'img', 'aria-label': 'Desenho de ' + (d.nome || 'posição') + ' no braço' });
    svg.appendChild(svgEl('text', { x: X0 + 2.5 * DX, y: 12, class: 'braco-nome' + (String(d.nome || '').length > 6 ? ' longo' : '') }, d.nome || ''));
    if (inicio === 1) svg.appendChild(svgEl('rect', { x: X0 - 1, y: Y0 - 4, width: DX * 5 + 2, height: 4, class: 'braco-pestana-fixa' }));
    else svg.appendChild(svgEl('text', { x: X0 - 6, y: Y0 + DY / 2 + 4, class: 'braco-casa' }, inicio + 'ª'));
    for (var c = 0; c < 6; c++) svg.appendChild(svgEl('line', { x1: X0 + c * DX, y1: Y0, x2: X0 + c * DX, y2: Y0 + N * DY, class: 'braco-linha' }));
    for (var k = 0; k <= N; k++) svg.appendChild(svgEl('line', { x1: X0, y1: Y0 + k * DY, x2: X0 + 5 * DX, y2: Y0 + k * DY, class: 'braco-linha' }));
    function xCorda(corda) { return X0 + (6 - corda) * DX; }
    (d.abafadas || []).forEach(function (corda) { svg.appendChild(svgEl('text', { x: xCorda(corda), y: Y0 - 5, class: 'braco-marca' }, '×')); });
    (d.soltas || []).forEach(function (corda) { svg.appendChild(svgEl('circle', { cx: xCorda(corda), cy: Y0 - 9, r: 4, class: 'braco-solta' })); });
    if (d.pestana) {
      var yP = Y0 + (d.pestana - inicio + 0.5) * DY;
      svg.appendChild(svgEl('rect', { x: X0 - 5, y: yP - 6, width: DX * 5 + 10, height: 12, rx: 6, class: 'braco-ponto' }));
    }
    d.pontos.forEach(function (p) {
      var y = Y0 + (p[1] - inicio + 0.5) * DY;
      svg.appendChild(svgEl('circle', { cx: xCorda(p[0]), cy: y, r: 6.5, class: 'braco-ponto' }));
      if (p[2]) svg.appendChild(svgEl('text', { x: xCorda(p[0]), y: y + 3.5, class: 'braco-dedo' }, String(p[2])));
    });
    return svg;
  }

  // ---------- Montagem da sequência (em tempos) ----------
  function tonicas(de, ate, direcao) {
    var l = [], m;
    if (direcao === 'descer') { for (m = de; m >= ate; m--) l.push(m); return l; }
    for (m = de; m <= ate; m++) l.push(m);
    if (direcao === 'subir-descer') for (m = ate - 1; m >= de; m--) l.push(m);
    return l;
  }
  function notasDoAcorde(v, a) { return a[2] || (v.braco && notasDoBraco(a[0])) || notasDaCifra(a[0]); }
  function montar(v, de, ate) {
    var ev = [], b = 0, i, porCompasso = Math.max(1, Number(v.tempos) || 4);
    var conta = v.tipo === 'metronomo' ? porCompasso : 4;
    for (i = 0; i < conta; i++) { ev.push({ b: i, tipo: 'clique', forte: i === 0 }); ev.push({ b: i, tipo: 'texto', txt: 'Prepare-se… ' + (conta - i) }); }
    b = conta;
    var reps = Math.max(1, Number(v.repeticoes) || 1), r;
    if (v.tipo === 'respiracao') {
      for (r = 0; r < reps; r++) {
        (v.fases || []).forEach(function (f) {
          var n = Math.max(1, Number(f[1]) || 1);
          for (var j = 0; j < n; j++) {
            ev.push({ b: b, tipo: 'clique', forte: j === 0 });
            ev.push({ b: b, tipo: 'fase', txt: f[0], n: j + 1, rep: r + 1, reps: reps });
            b++;
          }
        });
      }
    } else if (v.tipo === 'metronomo') {
      var total = Math.max(1, Number(v.compassos) || 32) * porCompasso;
      for (i = 0; i < total; i++) { ev.push({ b: b, tipo: 'clique', forte: i % porCompasso === 0 }); ev.push({ b: b, tipo: 'batida', n: i % porCompasso + 1, compasso: Math.floor(i / porCompasso) + 1 }); b++; }
    } else if (v.tipo === 'acordes') {
      var lista = v.acordes || [];
      for (r = 0; r < reps; r++) {
        lista.forEach(function (a, k) {
          var tempos = Math.max(1, Number(a[1]) || 4), prox = lista[k + 1] || (r < reps - 1 ? lista[0] : null);
          ev.push({ b: b, tipo: 'acorde', midis: notasDoAcorde(v, a), dur: tempos * 0.92, nome: a[0], k: k, prox: prox ? prox[0] : '', rep: r + 1, reps: reps });
          for (var j = 0; j < tempos; j++) { ev.push({ b: b + j, tipo: 'clique', forte: j === 0 }); ev.push({ b: b + j, tipo: 'batida', n: j + 1 }); }
          b += tempos;
        });
      }
    } else {
      var ts = v.demo ? Array.apply(null, Array(reps)).map(function () { return de; }) : tonicas(de, ate, v.direcao);
      ts.forEach(function (t, k) {
        var ini = b, notasTom = [];
        (v.padrao || []).forEach(function (p) { if (p[0] != null) notasTom.push(t + p[0]); });
        ev.push({ b: b, tipo: 'tom', tonica: t, k: k + 1, total: ts.length, notas: notasTom });
        if (v.acorde !== false && !v.demo) { ev.push({ b: b, tipo: 'acordeTom', midis: [t - 12, t, t + 4, t + 7], dur: 1.6 }); b += 2; }
        (v.padrao || []).forEach(function (p) {
          if (p[0] != null) ev.push({ b: b, tipo: 'nota', midi: t + p[0], dur: p[1], rotulo: p[2] });
          b += Number(p[1]) || 1;
        });
        b = Math.ceil(b + (v.demo ? 0 : 1)); // no vocalize, um tempo para respirar
        for (var x = ini; x < b; x++) ev.push({ b: x, tipo: 'clique', forte: x === ini });
      });
    }
    ev.push({ b: b, tipo: 'fim' });
    ev.sort(function (a, z) { return a.b - z.b; });
    return ev;
  }

  // ---------- Tocador ----------
  var ativo = null; // só um exercício toca por vez

  function criarPlayer(v) {
    v = v || {};
    var tipo = v.tipo || 'notas';
    var vocal = tipo === 'notas' && !v.demo;            // vocalize: tem voz e faixa de tons
    var temPiano = !v.semPiano && !v.ocultar && (tipo === 'notas' || tipo === 'piano' || (tipo === 'acordes' && !v.braco));
    var voz = lerPref('voz', 'f');
    var desloc = function () { return (vocal || (tipo === 'piano' && !v.demo)) && voz === 'm' ? -12 : 0; };
    var bpm = Math.min(220, Math.max(30, Number(v.bpm) || 80));
    var metro = lerPref('metronomo', '1') === '1';
    var de = Number(v.de) || 60, ate = Number(v.ate) || 65;
    var ref = { de: de, ate: ate };
    var tocando = false, eventos = [], idx = 0, ancB = 0, ancT = 0, timer = null, raf = null, visuais = [], piano = null, bracos = [];

    var caixa = h('div', { class: 'voc voc-' + tipo });
    var tomEl = h('b', { class: 'voc-tom', text: '' });
    var silEl = h('span', { class: 'voc-silaba', text: v.silaba ? (vocal ? 'Cante: ' : '') + v.silaba : (v.texto || '') });
    var inicial = tipo === 'piano' ? 'Toque nas teclas para ouvir' : 'Toque em Começar';
    var grande = h('div', { class: 'voc-grande', 'aria-live': 'polite', text: inicial });
    var contador = h('span', { class: 'voc-contador', 'aria-hidden': 'true' });
    var pulso = h('span', { class: 'voc-pulso', 'aria-hidden': 'true' });
    var areaPiano = h('div', { class: 'voc-piano' });
    var areaBraco = h('div', { class: 'voc-bracos' });
    var btn = h('button', { type: 'button', class: 'botao mini', text: '▶ Começar' });
    var bpmIn = h('input', { type: 'range', min: '40', max: '200', step: '2', value: String(bpm), 'aria-label': 'Andamento' });
    var bpmTxt = h('span', { class: 'pequeno', text: bpm + ' bpm' });
    var metroIn = h('input', { type: 'checkbox', checked: metro });
    var vozSel = h('select', { 'aria-label': 'Tipo de voz' },
      h('option', { value: 'f', text: 'Voz feminina / infantil', selected: voz === 'f' }),
      h('option', { value: 'm', text: 'Voz masculina (oitava abaixo)', selected: voz === 'm' }));
    var deSel = h('select', { 'aria-label': 'Começar no tom' }), ateSel = h('select', { 'aria-label': 'Ir até o tom' });

    function preencherTons() {
      opcoesNotas(deSel, 43 + desloc(), 79 + desloc(), ref.de + desloc());
      opcoesNotas(ateSel, 43 + desloc(), 79 + desloc(), ref.ate + desloc());
    }
    function faixaDoExercicio() {
      var todas = [];
      if (tipo === 'piano') return [de + desloc(), ate + desloc()];
      if (tipo === 'acordes') (v.acordes || []).forEach(function (a) { todas = todas.concat(notasDoAcorde(v, a)); });
      else {
        var ts = v.demo ? [de] : tonicas(ref.de + desloc(), ref.ate + desloc(), v.direcao);
        ts.forEach(function (t) { todas.push(t); (v.padrao || []).forEach(function (p) { if (p[0] != null) todas.push(t + p[0]); }); });
      }
      var lo = Math.min.apply(null, todas), hi = Math.max.apply(null, todas);
      if (hi - lo < 16) hi = lo + 16;
      return [lo, hi];
    }
    function desenharPiano() {
      if (!temPiano) return;
      var f = faixaDoExercicio();
      piano = criarTeclado(f[0], f[1], function (m) { somNota(m, 0, 0.6, 1, true); piano.acender(m, 0.4); }, tipo === 'piano' || !!v.demo || tipo === 'acordes');
      areaPiano.replaceChildren(piano.el);
    }
    function desenharBracos() {
      bracos = [];
      var lista = [];
      if (tipo === 'acordes' && v.braco) (v.acordes || []).forEach(function (a) { if (lista.indexOf(a[0]) < 0) lista.push(a[0]); });
      if (v.diagrama) lista = [v.diagrama];
      lista.forEach(function (c) {
        var d = diagramaDe(c); if (!d) return;
        var el = h('div', { class: 'voc-braco' + (v.diagrama ? ' unico' : '') }); el.appendChild(desenharBraco(d));
        bracos.push({ nome: typeof c === 'string' ? c : '', el: el });
        areaBraco.appendChild(el);
      });
    }
    function destacarBraco(nome) { bracos.forEach(function (b) { b.el.classList.toggle('atual', b.nome === nome); }); }

    // --- agendamento (lookahead de 0,12 s) ---
    function tempoDe(b) { return ancT + (b - ancB) * 60 / bpm; }
    function agendar(e) {
      var t = tempoDe(e.b), seg = 60 / bpm;
      function vis(f, atraso) { visuais.push({ t: t + (atraso || 0), f: f }); }
      if (e.tipo === 'clique') {
        if (metro) clique(t, e.forte);
        vis(function () { pulso.classList.remove('bate'); void pulso.offsetWidth; pulso.classList.add('bate'); pulso.classList.toggle('forte', e.forte); });
      } else if (e.tipo === 'nota') {
        somNota(e.midi, t, e.dur * seg, 1, !!v.demo);
        vis(function () {
          if (piano) piano.acender(e.midi, e.dur * 60 / bpm);
          if (v.demo) grande.textContent = v.ocultar ? '♪' : e.rotulo || NOMES[pc(e.midi)];
        });
      } else if (e.tipo === 'acordeTom') {
        e.midis.forEach(function (m) { somNota(m, t, e.dur * seg, 0.55); });
        vis(function () { e.midis.forEach(function (m) { if (piano) piano.acender(m, e.dur * 60 / bpm); }); grande.textContent = 'Respire…'; });
      } else if (e.tipo === 'acorde') {
        e.midis.forEach(function (m, i) { somNota(m, t + (v.braco ? i * 0.018 : 0), e.dur * seg, 0.5, true); });
        vis(function () {
          grande.textContent = v.ocultar ? 'Acorde ' + (e.k + 1) : e.nome;
          silEl.textContent = e.prox && !v.ocultar ? 'Próximo: ' + e.prox : (v.texto || '');
          tomEl.textContent = e.reps > 1 ? 'Volta ' + e.rep + ' de ' + e.reps : '';
          if (piano) { piano.marcar(e.midis); e.midis.forEach(function (m) { piano.acender(m, 0.3); }); }
          destacarBraco(e.nome);
        });
      } else if (e.tipo === 'batida') {
        vis(function () { contador.textContent = String(e.n); if (tipo === 'metronomo') { grande.textContent = String(e.n); tomEl.textContent = 'Compasso ' + e.compasso; } });
      } else if (e.tipo === 'tom') {
        vis(function () {
          tomEl.textContent = v.demo ? (e.total > 1 ? 'Vez ' + e.k + ' de ' + e.total : '') : 'Tom: ' + nomeNota(e.tonica) + ' · ' + e.k + ' de ' + e.total;
          if (piano) piano.marcar(e.notas);
          if (!v.demo && v.acorde === false) grande.textContent = v.silaba || 'Cante';
        });
        if (!v.demo && v.acorde !== false) vis(function () { grande.textContent = v.silaba || 'Cante'; }, 2 * seg);
      } else if (e.tipo === 'texto') {
        vis(function () { grande.textContent = e.txt; });
      } else if (e.tipo === 'fase') {
        vis(function () { grande.textContent = e.txt + ' · ' + e.n; tomEl.textContent = 'Repetição ' + e.rep + ' de ' + e.reps; });
      } else if (e.tipo === 'fim') {
        vis(function () { parar(); grande.textContent = 'Muito bem! Marque o exercício como feito.'; });
      }
    }
    function laco() {
      var c = audio(); if (!c) return;
      while (idx < eventos.length && tempoDe(eventos[idx].b) < c.currentTime + 0.12) { agendar(eventos[idx]); idx++; }
    }
    function desenhar() {
      if (!ctx) return;
      var agora = ctx.currentTime;
      visuais.sort(function (a, z) { return a.t - z.t; });
      while (visuais.length && visuais[0].t <= agora) visuais.shift().f();
      if (tocando) raf = requestAnimationFrame(desenhar);
    }
    function comecar() {
      var c = audio();
      if (!c) { grande.textContent = 'Seu navegador não tem suporte a áudio.'; return; }
      if (ativo && ativo !== api) ativo.parar();
      ativo = api;
      eventos = montar(v, ref.de + desloc(), ref.ate + desloc());
      idx = 0; visuais = []; ancB = 0; ancT = c.currentTime + 0.15;
      tocando = true; btn.textContent = '■ Parar'; caixa.classList.add('ativo');
      timer = setInterval(laco, 25); laco();
      raf = requestAnimationFrame(desenhar);
    }
    function parar() {
      tocando = false; clearInterval(timer); cancelAnimationFrame(raf); visuais = [];
      btn.textContent = '▶ Começar'; caixa.classList.remove('ativo');
      if (piano) piano.marcar([]);
      destacarBraco(null);
      grande.textContent = inicial; tomEl.textContent = ''; contador.textContent = '';
      silEl.textContent = v.silaba ? (vocal ? 'Cante: ' : '') + v.silaba : (v.texto || '');
      if (ctx && saida) { // corta o som que já estava agendado
        var antiga = saida; novaSaida();
        antiga.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
        setTimeout(function () { antiga.disconnect(); }, 400);
      }
      if (ativo === api) ativo = null;
    }

    btn.addEventListener('click', function () { tocando ? parar() : comecar(); });
    bpmIn.addEventListener('input', function () {
      var novo = Number(bpmIn.value);
      if (tocando && idx < eventos.length) { var nb = eventos[idx].b; ancT = tempoDe(nb); ancB = nb; }
      bpm = novo; bpmTxt.textContent = bpm + ' bpm';
    });
    metroIn.addEventListener('change', function () { metro = metroIn.checked; gravarPref('metronomo', metro ? '1' : '0'); });
    vozSel.addEventListener('change', function () {
      if (tocando) parar();
      voz = vozSel.value; gravarPref('voz', voz); preencherTons(); desenharPiano();
    });
    function mudouTom() {
      if (tocando) parar();
      ref.de = Number(deSel.value) - desloc(); ref.ate = Number(ateSel.value) - desloc();
      desenharPiano();
    }
    deSel.addEventListener('change', mudouTom); ateSel.addEventListener('change', mudouTom);

    // --- layout ---
    if (tipo !== 'piano') caixa.appendChild(h('div', { class: 'voc-topo' }, tomEl, silEl));
    caixa.appendChild(h('div', { class: 'voc-visor' }, tipo !== 'piano' ? pulso : null, grande, tipo === 'acordes' ? contador : null));
    if (tipo === 'acordes' || v.diagrama) { caixa.appendChild(areaBraco); desenharBracos(); }
    if (temPiano) { caixa.appendChild(areaPiano); desenharPiano(); }
    var ctrl = h('div', { class: 'voc-controles' });
    if (tipo !== 'piano') {
      ctrl.appendChild(btn);
      ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: 'Andamento' }), bpmIn, bpmTxt));
      if (tipo !== 'metronomo') ctrl.appendChild(h('label', { class: 'voc-check' }, metroIn, ' Metrônomo'));
    }
    if (vocal || (tipo === 'piano' && !v.demo)) ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: 'Voz' }), vozSel));
    if (vocal) {
      preencherTons();
      ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: v.direcao === 'descer' ? 'Começar em' : 'Do tom' }), deSel));
      ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: 'Até o tom' }), ateSel));
    }
    if (ctrl.children.length) caixa.appendChild(ctrl);

    var api = { el: caixa, parar: function () { if (tocando) parar(); } };
    return api;
  }

  window.AmaralCanto = {
    criarPlayer: criarPlayer, PADROES: PADROES, nomeNota: nomeNota, notasDaCifra: notasDaCifra,
    DIAGRAMAS: DIAGRAMAS, pararTudo: function () { if (ativo) ativo.parar(); }
  };
})();

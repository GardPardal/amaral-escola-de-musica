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
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* navegador antigo */ }
      ctx = new AC(); novaSaida();
    }
    if (ctx.state !== 'running') ctx.resume();
    return ctx;
  }

  // ---------- Liberar o som no celular ----------
  // iPhone/iPad: o navegador só libera o som dentro de um toque, e no modo silencioso o Web Audio fica mudo.
  // Tocar um <audio> em silêncio no primeiro toque faz o iPhone tratar a página como música (toca mesmo no silencioso).
  var silencio = null;
  function wavSilencioso() {
    var sr = 8000, n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    function txt(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    txt(0, 'RIFF'); v.setUint32(4, 36 + n, true); txt(8, 'WAVE'); txt(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    txt(36, 'data'); v.setUint32(40, n, true);
    for (var i = 0; i < n; i++) v.setUint8(44 + i, 128);
    return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  }
  function liberarSom() {
    var c = audio(); if (!c) return;
    try { // um "clique" mudo destrava o Web Audio no iOS antigo
      var b = c.createBuffer(1, 1, 22050), src = c.createBufferSource();
      src.buffer = b; src.connect(c.destination); src.start(0);
    } catch (e) { /* ignora */ }
    try {
      if (!silencio) { silencio = new Audio(wavSilencioso()); silencio.loop = true; silencio.setAttribute('playsinline', ''); silencio.volume = 0.01; }
      var pr = silencio.play(); if (pr && pr.catch) pr.catch(function () {});
    } catch (e) { /* ignora */ }
  }
  ['touchend', 'click', 'keydown'].forEach(function (ev) { document.addEventListener(ev, liberarSom, { capture: true, passive: true }); });
  // ao voltar para a página (o iOS suspende o som ao trocar de app)
  document.addEventListener('visibilitychange', function () { if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume(); });
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

  // Corda dedilhada (Karplus-Strong): nylon para violão, aço para guitarra. As ondas ficam guardadas por nota.
  var ondas = {};
  function ondaCorda(midi, timbre) {
    var chave = timbre + midi;
    if (ondas[chave]) return ondas[chave];
    var sr = ctx.sampleRate, f = 440 * Math.pow(2, (midi - 69) / 12);
    var P = sr / f - 0.5, len = Math.floor(sr * 2.8);
    var buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    var ini = Math.ceil(P) + 2, i;
    for (i = 0; i < ini; i++) d[i] = Math.random() * 2 - 1;
    var suaviza = timbre === 'aco' ? 1 : 3;              // nylon: ataque mais macio
    for (var k = 0; k < suaviza; k++) for (i = 1; i < ini; i++) d[i] = (d[i] + d[i - 1]) / 2;
    var perda = timbre === 'aco' ? 0.9975 : 0.996;
    function em(x) { var i0 = Math.floor(x), fr = x - i0; return d[i0] + (d[i0 + 1] - d[i0]) * fr; }
    for (i = ini; i < len; i++) d[i] = perda * 0.5 * (em(i - P) + em(i - P - 1));
    ondas[chave] = buf;
    return buf;
  }
  function somCorda(midi, quando, dur, volume, timbre) {
    var c = audio(); if (!c) return;
    var t0 = Math.max(quando || 0, c.currentTime) + 0.005;
    var src = c.createBufferSource(); src.buffer = ondaCorda(midi, timbre);
    var filtro = c.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = timbre === 'aco' ? 6000 : 3200;
    var g = c.createGain(), fim = t0 + Math.max(dur || 1, 0.35);
    g.gain.setValueAtTime(0.6 * (volume || 1), t0);
    g.gain.setValueAtTime(0.6 * (volume || 1), fim);
    g.gain.exponentialRampToValueAtTime(0.0001, fim + 0.12); // a mão abafa a corda na troca
    src.connect(filtro); filtro.connect(g); g.connect(saida);
    src.start(t0); src.stop(fim + 0.15);
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
    var porMidi = {}, centro = {}, pretas = svgEl('g', {});
    function tecla(x, w, alt, classe, midi) {
      centro[midi] = { x: x + w / 2, y: classe === 'preta' ? 54 : H - 30 };
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
    var fixos = svgEl('g', { class: 'pd' }), ativos = svgEl('g', { class: 'pd' });
    svg.appendChild(fixos); svg.appendChild(ativos);
    function circulo(g, midi, dedo, mao, classe, r) {
      var c = centro[midi]; if (!c || !dedo) return null;
      var grupo = svgEl('g', {});
      grupo.appendChild(svgEl('circle', { cx: c.x, cy: c.y, r: r, class: classe + ' ' + mao }));
      grupo.appendChild(svgEl('text', { x: c.x, y: c.y + 4, class: classe + '-txt ' + mao }, String(dedo)));
      g.appendChild(grupo); return grupo;
    }
    var marcadas = [];
    return {
      el: svg,
      // números dos dedos de todas as notas do exercício (fracos)
      rotular: function (lista) { fixos.replaceChildren(); (lista || []).forEach(function (n) { circulo(fixos, n.midi, n.dedo, n.mao, 'pd-fixo', 8); }); },
      // o dedo que está apertando agora
      pressionar: function (midi, dedo, mao, seg) {
        var g = circulo(ativos, midi, dedo, mao, 'pd-ativo', 10.5);
        if (g) setTimeout(function () { g.remove(); }, Math.max(160, (seg || 0.3) * 1000 - 40));
        this.acender(midi, seg);
      },
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

  // ---------- Mãos (piano e teclado) ----------
  var NOMES_DEDOS = ['', 'polegar', 'indicador', 'médio', 'anelar', 'mínimo'];
  // Mão vista de cima, com a palma para baixo: na direita o polegar fica à esquerda; a esquerda é o espelho
  var DEDOS_MAO = [null, { x: 4, y: 64, w: 17, h: 34 }, { x: 25, y: 16, w: 16, h: 54 }, { x: 44, y: 8, w: 16, h: 62 }, { x: 63, y: 14, w: 16, h: 56 }, { x: 82, y: 30, w: 14, h: 42 }];
  function criarMao(mao) {
    var svg = svgEl('svg', { viewBox: '0 0 110 118', class: 'mao', role: 'img', 'aria-label': mao === 'E' ? 'Mão esquerda' : 'Mão direita' });
    var dedos = {};
    function xm(x, w) { return mao === 'E' ? 110 - x - w : x; }
    for (var d = 1; d <= 5; d++) {
      var f = DEDOS_MAO[d];
      dedos[d] = svgEl('rect', { x: xm(f.x, f.w), y: f.y, width: f.w, height: f.h, rx: f.w / 2, class: 'mao-dedo ' + mao });
      svg.appendChild(dedos[d]);
    }
    svg.appendChild(svgEl('rect', { x: xm(17, 82), y: 58, width: 82, height: 56, rx: 22, class: 'mao-palma' }));
    for (d = 1; d <= 5; d++) { var g = DEDOS_MAO[d]; svg.appendChild(svgEl('text', { x: xm(g.x, g.w) + g.w / 2, y: g.y + 13, class: 'mao-num' }, String(d))); }
    var caixa = h('div', { class: 'mao-caixa' }, svg, h('span', { class: 'mao-nome', text: mao === 'E' ? 'Mão esquerda' : 'Mão direita' }));
    return {
      el: caixa,
      acender: function (dedo, seg) {
        var r = dedos[dedo]; if (!r) return;
        r.classList.add('ativo'); clearTimeout(r._t);
        r._t = setTimeout(function () { r.classList.remove('ativo'); }, Math.max(160, (seg || 0.3) * 1000 - 40));
      },
      usados: function (lista) { for (var k = 1; k <= 5; k++) dedos[k].classList.toggle('usado', (lista || []).indexOf(k) >= 0); }
    };
  }
  // Digitação automática de acorde: notas abaixo de Sol3 ficam com a mão esquerda.
  // Direita: 1-3-5 (1-2-5 na 1ª inversão, quando o intervalo de cima é uma quarta); 4 notas: 1-2-3-5. Esquerda: 5, 5-1, 5-3-1.
  // Uma digitação escrita ('E5 D1') vale mais que a automática.
  function dedilharAcorde(midis, escrito) {
    var ns = midis.slice().sort(function (a, b) { return a - b; }), res = [];
    if (escrito) {
      var tk = String(escrito).match(/[ED]\d/g) || [];
      ns.forEach(function (m, i) { var t = tk[i]; if (t) res.push({ midi: m, mao: t[0], dedo: Number(t[1]) }); });
      return res;
    }
    var esq = ns.filter(function (m) { return m < 55; }), dir = ns.filter(function (m) { return m >= 55; });
    var de = { 1: [5], 2: [5, 1], 3: [5, 3, 1] }[esq.length] || [5, 4, 3, 2, 1];
    var dd = dir.length === 3 ? (dir[2] - dir[1] === 5 ? [1, 2, 5] : [1, 3, 5]) : ({ 1: [1], 2: [1, 5], 4: [1, 2, 3, 5] }[dir.length] || [1, 2, 3, 4, 5]);
    esq.forEach(function (m, i) { res.push({ midi: m, mao: 'E', dedo: de[i] }); });
    dir.forEach(function (m, i) { res.push({ midi: m, mao: 'D', dedo: dd[i] }); });
    return res;
  }
  // Posição de 5 dedos a partir da tônica (Dó-Ré-Mi-Fá-Sol), quando o exercício não traz a digitação escrita
  var CINCO_DEDOS = { 0: 1, 2: 2, 4: 3, 5: 4, 7: 5 };
  function dedoNaPosicao(semitom, mao) { var d = CINCO_DEDOS[semitom]; return d ? (mao === 'E' ? 6 - d : d) : ''; }

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

  // ---------- Braço do violão na horizontal (como o aluno vê o próprio violão) ----------
  var NOMES_CORDAS = ['Mi', 'Si', 'Sol', 'Ré', 'Lá', 'Mi']; // 1ª a 6ª
  function midiCorda(corda, casa) { return CORDAS_SOLTAS[6 - corda] + casa; }
  // Corda e casa de uma nota dentro da região [base, base + 3], procurando da 6ª para a 1ª corda
  function posicaoNaRegiao(midi, base) {
    var corda, casa;
    for (corda = 6; corda >= 1; corda--) { casa = midi - CORDAS_SOLTAS[6 - corda]; if (casa >= base && casa <= base + 3) return { corda: corda, casa: casa }; }
    for (corda = 6; corda >= 1; corda--) { casa = midi - CORDAS_SOLTAS[6 - corda]; if (casa >= 0 && casa <= 15) return { corda: corda, casa: casa }; }
    return null;
  }
  function criarBracoH(lo, hi, aoTocar) {
    var FW = 62, SP = 25, X0 = 54, Y0 = 20, n = hi - lo;
    var W = X0 + n * FW + 10, H = Y0 + 5 * SP + 34;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'braco-h', role: 'img', 'aria-label': 'Braço do violão, da casa ' + lo + ' à ' + hi });
    svg.style.maxWidth = Math.round(W * 1.35) + 'px';
    function xT(k) { return X0 + (k - lo) * FW; }
    function xC(casa) { return casa === 0 ? X0 - 15 : xT(casa) - FW / 2; }
    function yC(c) { return Y0 + (c - 1) * SP; }
    var yMeio = Y0 + 2.5 * SP;
    svg.appendChild(svgEl('rect', { x: X0, y: Y0 - 12, width: n * FW, height: 5 * SP + 24, rx: 3, class: 'bh-madeira' }));
    for (var k = lo + 1; k <= hi; k++) {
      if ([3, 5, 7, 9, 15].indexOf(k) >= 0) svg.appendChild(svgEl('circle', { cx: xC(k), cy: yMeio, r: 6, class: 'bh-marcador' }));
      if (k === 12) { svg.appendChild(svgEl('circle', { cx: xC(k), cy: Y0 + 1.5 * SP, r: 6, class: 'bh-marcador' })); svg.appendChild(svgEl('circle', { cx: xC(k), cy: Y0 + 3.5 * SP, r: 6, class: 'bh-marcador' })); }
      svg.appendChild(svgEl('line', { x1: xT(k), y1: Y0 - 12, x2: xT(k), y2: Y0 + 5 * SP + 12, class: 'bh-traste' }));
      if ([3, 5, 7, 9, 12, 15].indexOf(k) >= 0 || (k === lo + 1 && lo > 0)) svg.appendChild(svgEl('text', { x: xC(k), y: H - 4, class: 'bh-num' }, k + 'ª'));
    }
    if (lo === 0) svg.appendChild(svgEl('rect', { x: X0 - 5, y: Y0 - 12, width: 6, height: 5 * SP + 24, class: 'bh-pestana' }));
    var cordasEl = {};
    for (var c = 1; c <= 6; c++) {
      svg.appendChild(svgEl('text', { x: 4, y: yC(c) + 4, class: 'bh-nome' }, NOMES_CORDAS[c - 1]));
      cordasEl[c] = svgEl('line', { x1: X0 - 26, y1: yC(c), x2: W - 4, y2: yC(c), class: 'bh-corda' + (c >= 4 ? ' grave' : ''), 'stroke-width': [1.3, 1.6, 2, 2.4, 2.9, 3.4][c - 1] });
      svg.appendChild(cordasEl[c]);
    }
    var camadas = {};
    ['marcas', 'escala', 'prox', 'acorde', 'nota', 'alvos'].forEach(function (nome) { camadas[nome] = svgEl('g', nome === 'alvos' ? { 'aria-hidden': 'true' } : {}); svg.appendChild(camadas[nome]); });
    // áreas de toque: cada casa de cada corda toca a nota
    for (c = 1; c <= 6; c++) {
      (function (corda) {
        var casas = []; if (lo === 0) casas.push(0);
        for (var q = lo + 1; q <= hi; q++) casas.push(q);
        casas.forEach(function (casa) {
          var x = casa === 0 ? X0 - 30 : xT(casa - 1), w = casa === 0 ? 30 : FW;
          var r = svgEl('rect', { x: x, y: yC(corda) - SP / 2, width: w, height: SP, class: 'bh-alvo' });
          r.addEventListener('pointerdown', function (e) { e.preventDefault(); aoTocar(corda, casa); });
          camadas.alvos.appendChild(r);
        });
      })(c);
    }
    function ponto(g, corda, casa, dedo, classe, classeTxt) {
      var x = xC(casa), y = yC(corda);
      g.appendChild(svgEl('circle', { cx: x, cy: y, r: 10, class: classe }));
      if (dedo) g.appendChild(svgEl('text', { x: x, y: y + 4, class: classeTxt || 'bh-dedo-txt' }, String(dedo)));
    }
    function pestana(g, d, classe, classeTxt) {
      if (!d.pestana) return;
      var x = xC(d.pestana);
      g.appendChild(svgEl('rect', { x: x - 10, y: yC(1) - 10, width: 20, height: 5 * SP + 20, rx: 10, class: classe }));
      if (classeTxt) g.appendChild(svgEl('text', { x: x, y: yC(1) + 4, class: classeTxt }, '1'));
    }
    function limpar(g) { g.replaceChildren(); }
    return {
      el: svg,
      acorde: function (d) {
        limpar(camadas.acorde); limpar(camadas.marcas); limpar(camadas.prox);
        if (!d) return;
        pestana(camadas.acorde, d, 'bh-dedo', 'bh-dedo-txt');
        d.pontos.forEach(function (p) { ponto(camadas.acorde, p[0], p[1], p[2], 'bh-dedo'); });
        (d.abafadas || []).forEach(function (corda) { camadas.marcas.appendChild(svgEl('text', { x: X0 - 15, y: yC(corda) + 4, class: 'bh-x' }, '×')); });
        (d.soltas || []).forEach(function (corda) { camadas.marcas.appendChild(svgEl('circle', { cx: X0 - 15, cy: yC(corda), r: 6, class: 'bh-solta' })); });
      },
      proximo: function (d) {
        limpar(camadas.prox); if (!d) return;
        pestana(camadas.prox, d, 'bh-prox');
        d.pontos.forEach(function (p) { ponto(camadas.prox, p[0], p[1], '', 'bh-prox'); });
      },
      escala: function (lista) {
        limpar(camadas.escala);
        (lista || []).forEach(function (p) { if (p.casa > 0) ponto(camadas.escala, p.corda, p.casa, p.dedo, 'bh-escala', 'bh-escala-txt'); });
      },
      nota: function (corda, casa, dedo, seg) {
        var g = svgEl('g', {});
        ponto(g, corda, casa, dedo, 'bh-tocando', 'bh-tocando-txt');
        camadas.nota.appendChild(g);
        setTimeout(function () { g.remove(); }, Math.max(150, (seg || 0.3) * 1000 - 40));
        this.vibrar([corda]);
      },
      vibrar: function (lista) {
        lista.forEach(function (corda) { var l = cordasEl[corda]; if (!l) return; l.classList.remove('vibra'); void l.getBoundingClientRect(); l.classList.add('vibra'); });
      },
      limpar: function () { ['marcas', 'escala', 'prox', 'acorde', 'nota'].forEach(function (k) { limpar(camadas[k]); }); }
    };
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
          ev.push({ b: b, tipo: 'acorde', midis: notasDoAcorde(v, a), dig: a[3], dur: tempos * 0.92, nome: a[0], k: k, prox: prox ? prox[0] : '', rep: r + 1, reps: reps, dedilhado: !!v.dedilhado });
          if (prox && tempos >= 2) ev.push({ b: b + tempos - 1, tipo: 'proximo', nome: prox[0] });
          if (v.dedilhado) {
            var passo = Number(v.passo) || 1;
            for (var q = 0; q * passo < tempos - 1e-9; q++) ev.push({ b: b + q * passo, tipo: 'dedo', tok: v.dedilhado[q % v.dedilhado.length], nome: a[0], dur: passo });
          }
          for (var j = 0; j < tempos; j++) { ev.push({ b: b + j, tipo: 'clique', forte: j === 0 }); ev.push({ b: b + j, tipo: 'batida', n: j + 1 }); }
          b += tempos;
        });
      }
    } else {
      var ts = v.demo ? Array.apply(null, Array(reps)).map(function () { return de; }) : tonicas(de, ate, v.direcao);
      ts.forEach(function (t, k) {
        var ini = b, notasTom = [], digitacao = [];
        var maos = v.maos ? ['E', 'D'].filter(function (m) { return v.maos[m]; }).map(function (m) { return { mao: m, raiz: v.maos[m].raiz, padrao: v.maos[m].padrao, dedos: v.maos[m].dedos }; })
          : [{ mao: v.mao, raiz: t, padrao: v.padrao || [], dedos: v.dedos }];
        maos.forEach(function (mh) {
          var tk = mh.dedos ? String(mh.dedos).trim().split(/\s+/) : null, n = 0;
          mh.notas = [];
          mh.padrao.forEach(function (p) {
            if (p[0] == null) { mh.notas.push(null); return; }
            var semis = [].concat(p[0]), fing = tk ? String(tk[n++] || '').split('+') : null;
            mh.notas.push(semis.map(function (s, j) {
              var midi = mh.raiz + s, dedo = mh.mao ? (fing ? Number(fing[j]) || '' : dedoNaPosicao(s, mh.mao)) : '';
              notasTom.push(midi);
              if (dedo && !digitacao.some(function (x) { return x.midi === midi; })) digitacao.push({ midi: midi, dedo: dedo, mao: mh.mao });
              return { midi: midi, dedo: dedo };
            }));
          });
        });
        ev.push({ b: b, tipo: 'tom', tonica: t, k: k + 1, total: ts.length, notas: notasTom, digitacao: digitacao });
        if (v.acorde !== false && !v.demo) { ev.push({ b: b, tipo: 'acordeTom', midis: [t - 12, t, t + 4, t + 7], dur: 1.6 }); b += 2; }
        var fimTom = b;
        maos.forEach(function (mh) {
          var bb = b;
          mh.padrao.forEach(function (p, i) {
            (mh.notas[i] || []).forEach(function (nt) { ev.push({ b: bb, tipo: 'nota', midi: nt.midi, dur: p[1], rotulo: p[2], mao: mh.mao, dedo: nt.dedo }); });
            bb += Number(p[1]) || 1;
          });
          fimTom = Math.max(fimTom, bb);
        });
        b = fimTom;
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

  // opcoes.instrumento: em 'Violão' e 'Guitarra' o som é de corda e o exercício aparece no braço, sem piano
  function criarPlayer(v, opcoes) {
    v = v || {}; opcoes = opcoes || {};
    var tipo = v.tipo || 'notas';
    var vocal = tipo === 'notas' && !v.demo;            // vocalize: tem voz e faixa de tons
    var cordas = (opcoes.instrumento === 'Violão' || opcoes.instrumento === 'Guitarra') && !vocal;
    var timbre = opcoes.instrumento === 'Guitarra' ? 'aco' : 'nylon';
    var usaBraco = cordas && (tipo === 'acordes' || tipo === 'notas') && !v.ocultar;
    var temPiano = !cordas && !v.semPiano && !v.ocultar && (tipo === 'notas' || tipo === 'piano' || (tipo === 'acordes' && !v.braco));
    var voz = lerPref('voz', 'f');
    var desloc = function () { return (vocal || (tipo === 'piano' && !v.demo)) && voz === 'm' ? -12 : 0; };
    var bpm = Math.min(220, Math.max(30, Number(v.bpm) || 80));
    var metro = lerPref('metronomo', '1') === '1';
    var de = Number(v.de) || 60, ate = Number(v.ate) || 65;
    var ref = { de: de, ate: ate };
    var tocando = false, eventos = [], idx = 0, ancB = 0, ancT = 0, timer = null, raf = null, visuais = [], piano = null, bracos = [];
    var braco = null, chips = [];
    // Piano e teclado: mãos desenhadas e número do dedo em cada tecla
    var teclas = opcoes.instrumento === 'Teclado' || opcoes.instrumento === 'Piano';
    var comMaos = teclas && temPiano && (tipo === 'acordes' || (tipo === 'notas' && (v.mao || v.maos)));
    var maoEl = {}, legenda = h('p', { class: 'mao-legenda', 'aria-live': 'polite' }), areaMaos = null;
    if (comMaos) {
      maoEl.E = criarMao('E'); maoEl.D = criarMao('D');
      areaMaos = h('div', { class: 'voc-maos' }, maoEl.E.el, maoEl.D.el);
    }
    function textoDedos(lista) {
      var porMao = { E: [], D: [] };
      lista.forEach(function (n) { if (n.dedo && porMao[n.mao]) porMao[n.mao].push(n.dedo); });
      var partes = [];
      if (porMao.E.length) partes.push('Mão esquerda: ' + (porMao.E.length === 1 ? 'dedo ' + porMao.E[0] + ' (' + NOMES_DEDOS[porMao.E[0]] + ')' : 'dedos ' + porMao.E.join('-')));
      if (porMao.D.length) partes.push('Mão direita: ' + (porMao.D.length === 1 ? 'dedo ' + porMao.D[0] + ' (' + NOMES_DEDOS[porMao.D[0]] + ')' : 'dedos ' + porMao.D.join('-')));
      return partes.join(' · ');
    }
    var soando = [];   // notas que ainda estão soando: a legenda mostra as duas mãos juntas
    function mostrarDedos(lista, seg) {
      if (!comMaos || !piano) return;
      lista.forEach(function (n) { if (n.dedo) { piano.pressionar(n.midi, n.dedo, n.mao, seg); if (maoEl[n.mao]) maoEl[n.mao].acender(n.dedo, seg); } });
      var agora = Date.now();
      soando = soando.filter(function (x) { return x.fim > agora + 30 && !lista.some(function (n) { return n.mao === x.mao; }) || x.inicio > agora - 60; });
      lista.forEach(function (n) { soando.push({ midi: n.midi, dedo: n.dedo, mao: n.mao, inicio: agora, fim: agora + (seg || 0.3) * 1000 }); });
      var t = textoDedos(soando.slice().sort(function (a, z) { return a.mao < z.mao ? -1 : 1; })); if (t) legenda.textContent = t;
    }
    function digitacaoInicial() {
      if (!comMaos) return [];
      if (tipo === 'acordes') { var a = (v.acordes || [])[0]; return a ? dedilharAcorde(notasDoAcorde(v, a), a[3]) : []; }
      var t = montar(v, de, ate).filter(function (e) { return e.tipo === 'tom'; })[0];
      return t ? t.digitacao : [];
    }
    function estadoInicialMaos() {
      if (!comMaos || !piano) return;
      var dg = digitacaoInicial();
      piano.rotular(dg);
      ['E', 'D'].forEach(function (m) { maoEl[m].usados(dg.filter(function (n) { return n.mao === m; }).map(function (n) { return n.dedo; })); });
      legenda.textContent = dg.length ? 'Os números nas teclas são os dedos. Toque em Começar.' : '';
    }

    // --- braço do violão: posições do exercício ---
    var diagFixo = v.diagrama ? diagramaDe(v.diagrama) : null;   // ex.: desenho da pentatônica
    var base = v.casaBase != null ? Number(v.casaBase) : diagFixo && diagFixo.inicio ? diagFixo.inicio : 0;
    function dedoDe(pos) {
      if (diagFixo) { var p = diagFixo.pontos.filter(function (x) { return x[0] === pos.corda && x[1] === pos.casa; })[0]; if (p) return p[2]; }
      return pos.casa ? pos.casa - Math.max(base, 1) + 1 : '';
    }
    function posicoesDasNotas() {
      var vistas = {}, lista = [];
      (v.padrao || []).forEach(function (p) {
        if (p[0] == null) return;
        var pos = posicaoNaRegiao(de + p[0], base); if (!pos) return;
        var k = pos.corda + ':' + pos.casa; if (vistas[k]) return; vistas[k] = 1;
        pos.dedo = dedoDe(pos); lista.push(pos);
      });
      return lista;
    }
    function escalaFixa() { return diagFixo ? diagFixo.pontos.map(function (p) { return { corda: p[0], casa: p[1], dedo: p[2] }; }) : posicoesDasNotas(); }
    function nomesAcordes() { var l = []; (v.acordes || []).forEach(function (a) { if (l.indexOf(a[0]) < 0) l.push(a[0]); }); return l; }
    function estadoInicialBraco() {
      if (!braco) return;
      braco.limpar();
      if (tipo === 'acordes' && !diagFixo) braco.acorde(diagramaDe((v.acordes || [[]])[0][0]));
      else braco.escala(escalaFixa());
    }
    function desenharBracoH() {
      var casas = [];
      if (tipo === 'acordes' && !diagFixo) nomesAcordes().forEach(function (n) { var d = diagramaDe(n); if (d) { d.pontos.forEach(function (p) { casas.push(p[1]); }); if (d.pestana) casas.push(d.pestana); } });
      else escalaFixa().forEach(function (p) { casas.push(p.casa); });
      var comCasa = casas.filter(function (c) { return c > 0; });
      var menor = comCasa.length ? Math.min.apply(null, comCasa) : 1, maior = Math.max.apply(null, casas.concat([3]));
      var lo = menor - 1 <= 2 ? 0 : menor - 1, hi = Math.min(lo + 9, Math.max(lo + 5, maior + 1));
      braco = criarBracoH(lo, hi, function (corda, casa) { somCorda(midiCorda(corda, casa), 0, 0.9, 0.6, timbre); braco.nota(corda, casa, '', 0.5); });
      var area = h('div', { class: 'voc-braco-h' }); area.appendChild(braco.el);
      if (tipo === 'acordes') {
        var linha = h('div', { class: 'voc-chips', 'aria-label': 'Acordes do exercício' });
        nomesAcordes().forEach(function (n) { var c = h('span', { class: 'voc-chip', text: n }); chips.push({ nome: n, el: c }); linha.appendChild(c); });
        areaBraco.appendChild(linha);
      }
      areaBraco.appendChild(area);
      estadoInicialBraco();
    }
    function destacarChip(nome) { chips.forEach(function (c) { c.el.classList.toggle('atual', c.nome === nome); }); }
    function tocarAcordeNoBraco(nome, t, dur) {
      var d = DIAGRAMAS[nome], soam = [];
      if (d) d.f.split('').forEach(function (ch, i) { if (ch !== 'x') soam.push({ corda: 6 - i, midi: CORDAS_SOLTAS[i] + Number(ch) }); });
      else notasDaCifra(nome).forEach(function (m, i) { soam.push({ corda: 6 - i, midi: m - 12 }); });
      soam.forEach(function (n, i) { somCorda(n.midi, t + i * 0.022, dur, 0.34, timbre); }); // batida para baixo, da grave para a aguda
      return soam.map(function (n) { return n.corda; });
    }

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
        if (v.maos) ['E', 'D'].forEach(function (m) { var mh = v.maos[m]; if (mh) mh.padrao.forEach(function (p) { if (p[0] != null) [].concat(p[0]).forEach(function (x) { todas.push(mh.raiz + x); }); }); });
        else {
          var ts = v.demo ? [de] : tonicas(ref.de + desloc(), ref.ate + desloc(), v.direcao);
          ts.forEach(function (t) { todas.push(t); (v.padrao || []).forEach(function (p) { if (p[0] != null) [].concat(p[0]).forEach(function (x) { todas.push(t + x); }); }); });
        }
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
      estadoInicialMaos();
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
      } else if (e.tipo === 'nota' && cordas) {
        var pos = posicaoNaRegiao(e.midi, base);
        somCorda(e.midi, t, Math.max(e.dur * seg, 0.5), 0.6, timbre);
        vis(function () {
          if (braco && pos) braco.nota(pos.corda, pos.casa, dedoDe(pos), e.dur * 60 / bpm);
          grande.textContent = v.ocultar ? '♪' : e.rotulo || (pos ? NOMES[pc(e.midi)] + ' · ' + pos.corda + 'ª corda, ' + (pos.casa ? 'casa ' + pos.casa : 'solta') : NOMES[pc(e.midi)]);
        });
      } else if (e.tipo === 'nota') {
        somNota(e.midi, t, e.dur * seg, 1, !!v.demo);
        vis(function () {
          if (comMaos && e.dedo) mostrarDedos([{ midi: e.midi, dedo: e.dedo, mao: e.mao }], e.dur * 60 / bpm);
          else if (piano) piano.acender(e.midi, e.dur * 60 / bpm);
          if (v.demo) grande.textContent = v.ocultar ? '♪' : e.rotulo || NOMES[pc(e.midi)];
        });
      } else if (e.tipo === 'dedo') {
        var dd = DIAGRAMAS[e.nome]; if (!dd) return;
        var corda = { i: 3, m: 2, a: 1 }[e.tok], casa;
        if (!corda) for (var ci = 0; ci < 6; ci++) if (dd.f[ci] !== 'x') { corda = 6 - ci; break; }  // p = baixo do acorde
        casa = Number(dd.f[6 - corda]);
        somCorda(midiCorda(corda, casa), t, e.dur * seg * 2, 0.55, timbre);
        vis(function () {
          contador.textContent = e.tok + ' · ' + ({ p: 'polegar', i: 'indicador', m: 'médio', a: 'anelar' }[e.tok] || '');
          if (braco) braco.nota(corda, casa, dd.d[6 - corda] === '-' ? '' : dd.d[6 - corda], e.dur * 60 / bpm);
        });
      } else if (e.tipo === 'proximo') {
        if (braco && !diagFixo) vis(function () { braco.proximo(diagramaDe(e.nome)); });
      } else if (e.tipo === 'acordeTom') {
        e.midis.forEach(function (m) { somNota(m, t, e.dur * seg, 0.55); });
        vis(function () { e.midis.forEach(function (m) { if (piano) piano.acender(m, e.dur * 60 / bpm); }); grande.textContent = 'Respire…'; });
      } else if (e.tipo === 'acorde') {
        var cordasSoando = [];
        if (cordas) { if (!e.dedilhado) cordasSoando = tocarAcordeNoBraco(e.nome, t, e.dur * seg); }
        else e.midis.forEach(function (m, i) { somNota(m, t + (v.braco ? i * 0.018 : 0), e.dur * seg, 0.5, true); });
        vis(function () {
          if (braco) { if (!diagFixo) braco.acorde(diagramaDe(e.nome)); braco.vibrar(cordasSoando); }
          destacarChip(e.nome);
          grande.textContent = v.ocultar ? 'Acorde ' + (e.k + 1) : e.nome;
          silEl.textContent = e.prox && !v.ocultar ? 'Próximo: ' + e.prox : (v.texto || '');
          tomEl.textContent = e.reps > 1 ? 'Volta ' + e.rep + ' de ' + e.reps : '';
          if (piano) { piano.marcar(e.midis); e.midis.forEach(function (m) { piano.acender(m, 0.3); }); }
          if (comMaos) { var dg = dedilharAcorde(e.midis, e.dig); piano.rotular(dg); mostrarDedos(dg, e.dur * 60 / bpm * 0.6); }
          destacarBraco(e.nome);
        });
      } else if (e.tipo === 'batida') {
        vis(function () { if (!v.dedilhado) contador.textContent = String(e.n); if (tipo === 'metronomo') { grande.textContent = String(e.n); tomEl.textContent = 'Compasso ' + e.compasso; } });
      } else if (e.tipo === 'tom') {
        vis(function () {
          tomEl.textContent = v.demo ? (e.total > 1 ? 'Vez ' + e.k + ' de ' + e.total : '') : 'Tom: ' + nomeNota(e.tonica) + ' · ' + e.k + ' de ' + e.total;
          if (piano) piano.marcar(e.notas);
          if (comMaos && piano) piano.rotular(e.digitacao);
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
      destacarBraco(null); destacarChip(null); estadoInicialBraco(); estadoInicialMaos();
      grande.textContent = inicial; tomEl.textContent = ''; contador.textContent = ''; soando = [];
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
    if (usaBraco) { caixa.appendChild(areaBraco); desenharBracoH(); }
    else if (tipo === 'acordes' || v.diagrama) { caixa.appendChild(areaBraco); desenharBracos(); }
    if (areaMaos) { caixa.appendChild(areaMaos); caixa.appendChild(legenda); }
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
    DIAGRAMAS: DIAGRAMAS, liberarSom: liberarSom, pararTudo: function () { if (ativo) ativo.parar(); }
  };
})();

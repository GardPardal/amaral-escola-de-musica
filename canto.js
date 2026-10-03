// Tocador da área do aluno: piano na tela, braço do violão, metrônomo, vocalizes e acordes.
// Um exercício com som fica guardado no item da rotina, no campo "vocalize":
//   { tipo: 'notas', silaba, padrao: [[semitom|null, tempos, rótulo?], ...], de, ate, direcao, bpm, acorde }
//       vocalize: sobe de meio em meio tom de "de" até "ate" (tons da voz feminina; a masculina toca uma oitava abaixo)
//       com demo: true é uma demonstração fixa em "de" (escala, melodia, afinação), repetida "repeticoes" vezes
//   { tipo: 'acordes', acordes: [[cifra, tempos, midis?], ...], repeticoes, bpm, braco: true (desenho no braço) }
//   { tipo: 'metronomo', bpm, tempos (por compasso), compassos, texto, batidas: [2, 4] (só clica nesses tempos) }
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
    '5': [0, 7, 12], 'sus4': [0, 5, 7], 'sus2': [0, 2, 7], '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9], '9': [0, 4, 7, 10, 14], 'add9': [0, 4, 7, 14],
    'dim7': [0, 3, 6, 9], '°7': [0, 3, 6, 9], '7sus4': [0, 5, 7, 10], '7M(9)': [0, 4, 7, 11, 14], '7(9)': [0, 4, 7, 10, 14],
    'm7(9)': [0, 3, 7, 10, 14], '6(9)': [0, 4, 7, 9, 14], '7(13)': [0, 4, 10, 21], '7(b9)': [0, 4, 7, 10, 13], 'm7(11)': [0, 3, 7, 10, 17]
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
    'F#m': { f: '244222', d: '134111', pestana: 2 }, B: { f: 'x24442', d: '-13331', pestana: 2 }, Cm: { f: 'x35543', d: '-13421', pestana: 3 },
    Fm: { f: '133111', d: '134111', pestana: 1 }, Gm: { f: '355333', d: '134111', pestana: 3 }, Bb: { f: 'x13331', d: '-13331', pestana: 1 },
    'C#m': { f: 'x46654', d: '-13421', pestana: 4 }, Bdim: { f: 'x2343x', d: '-1243-' }, Asus4: { f: 'x02230', d: '--123-' }, Dsus4: { f: 'xx0233', d: '---134' },
    Am7: { f: 'x02010', d: '--2-1-' }, Em7: { f: '020000', d: '-1----' }, Cmaj7: { f: 'x32000', d: '-32---' }, Dm7: { f: 'xx0211', d: '---211' },
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
    svg.style.minWidth = Math.min(brancas.length * 30, 640) + 'px';
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
    for (corda = 6; corda >= 1; corda--) { casa = midi - CORDAS_SOLTAS[6 - corda]; if ((casa >= base && casa <= base + 3) || (casa === 0 && base <= 1)) return { corda: corda, casa: casa }; }
    var melhor = null;   // fora da região: a casa mais perto dela
    for (corda = 6; corda >= 1; corda--) { casa = midi - CORDAS_SOLTAS[6 - corda]; if (casa >= 0 && casa <= 15 && (!melhor || Math.abs(casa - base) < Math.abs(melhor.casa - base))) melhor = { corda: corda, casa: casa }; }
    return melhor;
  }
  function criarBracoH(lo, hi, aoTocar) {
    var FW = 62, SP = 25, X0 = 54, Y0 = 20, n = hi - lo;
    var W = X0 + n * FW + 10, H = Y0 + 5 * SP + 34;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'braco-h', role: 'img', 'aria-label': 'Braço do violão, da casa ' + lo + ' à ' + hi });
    svg.style.maxWidth = Math.round(W * 1.35) + 'px';
    svg.style.minWidth = Math.min(Math.round(W * 0.85), 560) + 'px';
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
  // ---------- Análise dos acordes (mapa para estudar antes de tocar) ----------
  var LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], LETRA_PC = [0, 2, 4, 5, 7, 9, 11];
  var LETRA_PT = { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' };
  var ACIDENTE = { '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' };
  function lerCifra(nome) {
    var x = String(nome).match(/^([A-G])([#b]?)(.*?)(?:\/([A-G][#b]?))?$/);
    if (!x) return null;
    var q = x[3];
    if (!(q in QUALIDADE)) return null;
    return { letra: x[1], pc: pcDe(x[1] + x[2]), q: q, baixo: x[4] || null };
  }
  // Função de cada nota dentro do acorde (pelo intervalo até a fundamental) e o grau usado para escrever o nome certo
  function funcaoNota(intervalo, q) {
    var tem7 = /7|9|13|ø/.test(q), menor = /^m|dim|°|ø/.test(q);
    switch (intervalo) {
      case 0: return ['Fundamental', 1];
      case 1: return ['9ª menor (♭9)', 2];
      case 2: return ['9ª', 2];
      case 3: return [menor ? '3ª menor' : '9ª aumentada (♯9)', menor ? 3 : 2];
      case 4: return ['3ª maior', 3];
      case 5: return [/sus/.test(q) ? '4ª (sus)' : '11ª', 4];
      case 6: return [/m7\(b5\)|dim|°|ø/.test(q) ? '5ª diminuta' : '11ª aumentada (♯11)', /m7\(b5\)|dim|°|ø/.test(q) ? 5 : 4];
      case 7: return ['5ª justa', 5];
      case 8: return [/aug|\+/.test(q) ? '5ª aumentada' : '13ª menor (♭13)', /aug|\+/.test(q) ? 5 : 6];
      case 9: return [/dim7|°7/.test(q) ? '7ª diminuta' : tem7 ? '13ª' : '6ª', /dim7|°7/.test(q) ? 7 : 6];
      case 10: return ['7ª menor', 7];
      default: return ['7ª maior', 7];
    }
  }
  function escreverNota(midi, raiz, grau) {
    if (!raiz) return NOMES[pc(midi)] + (Math.floor(midi / 12) - 1);
    var li = (LETRAS.indexOf(raiz.letra) + grau - 1) % 7, letra = LETRAS[li];
    var dif = ((pc(midi) - LETRA_PC[li]) % 12 + 18) % 12 - 6;
    var oit = Math.floor((midi - dif) / 12) - 1;   // a oitava acompanha a letra (Si♯ é escrito na oitava de baixo)
    return LETRA_PT[letra] + (ACIDENTE[dif] != null ? ACIDENTE[dif] : '?') + oit;
  }
  // Tom da sequência: o tom maior em que mais acordes são do campo harmônico (empate: tônica igual ao 1º ou último acorde)
  var CAMPO = { 0: 'M', 2: 'm', 4: 'm', 5: 'M', 7: 'M', 9: 'm', 11: 'd' };
  // dominante = tem 7ª menor e 3ª maior (7, 7(9), 7(13), 7sus4…); 7M não é dominante
  function ehDominante(q) { return /^7(?!M)/.test(q) || q === '9' || q === '13'; }
  function tipoAcorde(q) { return /m7\(b5\)|ø|dim|°/.test(q) ? 'd' : /^m(?!aj)/.test(q) ? 'm' : 'M'; }
  function inferirTom(lista) {
    var cs = lista.map(function (a) { return lerCifra(a[0]); }).filter(Boolean);
    if (!cs.length) return null;
    var melhor = null, nota = -1;
    for (var k = 0; k < 12; k++) {
      var pts = 0;
      cs.forEach(function (c) { var g = CAMPO[(c.pc - k + 12) % 12]; if (g && (g === tipoAcorde(c.q) || (g === 'M' && ehDominante(c.q) && (c.pc - k + 12) % 12 === 7))) pts += 2; });
      if (cs[0].pc === k) pts += 1; if (cs[cs.length - 1].pc === k) pts += 1;
      if (pts > nota) { nota = pts; melhor = k; }
    }
    return melhor;
  }
  var ROMANOS = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV', 'V', '♭VI', 'VI', '♭VII', 'VII'];
  function sufixoGrau(q) { return q.replace('m7(b5)', 'm7(♭5)').replace('(b9)', '(♭9)').replace('dim7', '°7').replace('dim', '°'); }
  // proxima: o acorde seguinte na sequência (um dominante "aponta" para ele)
  function grauEFuncao(c, tom, proxima) {
    if (!c || tom == null) return null;
    var i = (c.pc - tom + 12) % 12, tipo = tipoAcorde(c.q), dom = ehDominante(c.q);
    var grau = ROMANOS[i] + sufixoGrau(c.q), funcao;
    var alvoDe = function (r) { var g = CAMPO[(r - tom + 12) % 12]; return g ? ROMANOS[(r - tom + 12) % 12] + (g === 'm' ? 'm' : g === 'd' ? '°' : '') : null; };
    if (dom && proxima && i !== 7 && proxima.pc === (c.pc + 5) % 12 && alvoDe(proxima.pc)) funcao = 'Dominante secundário (V7 de ' + alvoDe(proxima.pc) + ')';
    else if (dom && proxima && i !== 7 && proxima.pc === (c.pc + 11) % 12 && alvoDe(proxima.pc)) funcao = 'Substituto de trítono (SubV7 de ' + alvoDe(proxima.pc) + ')';
    else if (dom && i === 0) funcao = 'Tônica com 7ª (som de blues)';
    else if (dom && i !== 7) {
      var alvo = alvoDe((c.pc + 5) % 12), sub = alvoDe((c.pc + 11) % 12);
      funcao = alvo ? 'Dominante secundário (V7 de ' + alvo + ')' : sub ? 'Substituto de trítono (SubV7 de ' + sub + ')' : 'Empréstimo / cor';
    } else if (/dim7|°7/.test(c.q)) funcao = 'Diminuto de passagem';
    else if (CAMPO[i] && CAMPO[i] !== tipo && !(i === 0 && dom)) funcao = 'Empréstimo modal';
    else funcao = { 0: 'Tônica', 4: 'Tônica (substituto)', 9: 'Tônica (relativo)', 2: 'Subdominante', 5: 'Subdominante', 7: 'Dominante', 11: 'Dominante' }[i] || 'Empréstimo modal';
    return { grau: grau, funcao: funcao };
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
      for (i = 0; i < total; i++) {
        var n = i % porCompasso + 1;
        if (!v.batidas || v.batidas.indexOf(n) >= 0) ev.push({ b: b, tipo: 'clique', forte: !v.batidas && n === 1 });
        ev.push({ b: b, tipo: 'batida', n: n, compasso: Math.floor(i / porCompasso) + 1 });
        b++;
      }
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
            (mh.notas[i] || []).forEach(function (nt) { ev.push({ b: bb, tipo: 'nota', midi: nt.midi, dur: p[1], rotulo: p[2], mao: mh.mao, dedo: nt.dedo, i: i }); });
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

  // ---------- Partitura: pauta com clave, armadura, compasso, figuras e tablatura ----------
  // desenharPauta({ vozes: [{ clave: 'sol'|'fa', eventos: [{ b, dur, midis: [..] | null (pausa), chave }] }],
  //   compasso (tempos por compasso), armadura (+ sustenidos, - bemóis), bemois, transpor (violão: 12), tab: fn(midi) -> { corda, casa },
  //   semCompasso (figura solta, para as provas), porLinha })
  // Retorna { el, acender(chave, seg) }.
  var LETRA_NOME = ['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si'];
  var SOLETRA_SUST = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0]];
  var SOLETRA_BEM = [[0, 0], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [4, -1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0]];
  var ORDEM_SUST = [3, 0, 4, 1, 5, 2, 6], ORDEM_BEM = [6, 2, 5, 1, 4, 0, 3];      // Fá Dó Sol Ré Lá Mi Si / Si Mi Lá Ré Sol Dó Fá
  var POS_SUST = [38, 35, 39, 36, 33, 37, 34], POS_BEM = [34, 37, 33, 36, 32, 35, 31]; // onde cada acidente fica na clave de sol
  var CLAVES = { sol: { base: 30, meio: 34 }, fa: { base: 18, meio: 22 } };   // passo da 1ª linha (Mi4 / Sol2) e da linha do meio
  // passo = oitava * 7 + letra (Dó4 = 28)
  function soletrar(midi, arm, bemois) {
    var x = (arm < 0 || bemois ? SOLETRA_BEM : SOLETRA_SUST)[pc(midi)];
    return { passo: (Math.floor(midi / 12) - 1) * 7 + x[0], letra: x[0], alt: x[1] };
  }
  function altArmadura(letra, arm) {
    if (arm > 0) return ORDEM_SUST.indexOf(letra) < arm ? 1 : 0;
    if (arm < 0) return ORDEM_BEM.indexOf(letra) < -arm ? -1 : 0;
    return 0;
  }
  var FIGURAS = [[4, 'semibreve'], [3, 'mínima pontuada'], [2, 'mínima'], [1.5, 'semínima pontuada'], [1, 'semínima'], [0.75, 'colcheia pontuada'], [0.5, 'colcheia'], [0.25, 'semicolcheia']];
  function figura(d) {
    for (var i = 0; i < FIGURAS.length; i++) {
      var v = FIGURAS[i][0];
      if (d >= v - 0.01) return { valor: v, nome: FIGURAS[i][1], vazia: v >= 2, haste: v < 4, band: v <= 0.25 ? 2 : v <= 0.75 ? 1 : 0, ponto: [3, 1.5, 0.75].indexOf(v) >= 0 };
    }
    return { valor: 0.25, nome: 'semicolcheia', vazia: false, haste: true, band: 2, ponto: false };
  }
  // sustenido, bemol e bequadro desenhados (as fontes do celular trocam ♯ por emoji)
  function acidente(g, alt, x, y) {
    if (alt === 1) {
      g.appendChild(svgEl('path', { d: 'M' + (x - 2) + ' ' + (y - 9) + 'v17M' + (x + 2) + ' ' + (y - 10) + 'v17', class: 'pt-acid-fino' }));
      g.appendChild(svgEl('path', { d: 'M' + (x - 5) + ' ' + (y - 1.5) + 'l10 -3M' + (x - 5) + ' ' + (y + 4.5) + 'l10 -3', class: 'pt-acid-grosso' }));
    } else if (alt === -1) {
      g.appendChild(svgEl('path', { d: 'M' + (x - 3) + ' ' + (y - 13) + 'V' + (y + 4) + 'C' + (x + 5) + ' ' + (y + 1) + ' ' + (x + 6) + ' ' + (y - 5) + ' ' + (x - 3) + ' ' + (y - 2), class: 'pt-acid-fino bemol' }));
    } else {
      g.appendChild(svgEl('path', { d: 'M' + (x - 3) + ' ' + (y - 10) + 'V' + (y + 5) + 'M' + (x + 3) + ' ' + (y - 5) + 'V' + (y + 10), class: 'pt-acid-fino' }));
      g.appendChild(svgEl('path', { d: 'M' + (x - 3) + ' ' + (y - 1) + 'L' + (x + 3) + ' ' + (y - 3) + 'M' + (x - 3) + ' ' + (y + 5) + 'L' + (x + 3) + ' ' + (y + 3), class: 'pt-acid-grosso' }));
    }
  }
  function desenharPauta(cfg) {
    var L = 10, BW = cfg.bw || 32, arm = cfg.armadura || 0, bpc = cfg.compasso || 4, tr = cfg.transpor || 0;
    var vozes = cfg.vozes || [], nv = vozes.length || 1, temTab = !!cfg.tab;
    var total = 0;
    vozes.forEach(function (vz) { vz.eventos.forEach(function (e) { total = Math.max(total, e.b + e.dur); }); });
    var solto = !!cfg.semCompasso;
    var nComp = solto ? 1 : Math.max(1, Math.ceil(total / bpc - 1e-6));
    function compDe(b) { return solto ? 0 : Math.floor(b / bpc + 1e-6); }
    // espaço de cada compasso: proporcional à duração, mas com um mínimo entre duas notas (colcheias e semicolcheias não se encostam)
    var ataques = [];
    for (var m0 = 0; m0 < nComp; m0++) ataques.push({});
    vozes.forEach(function (vz) { vz.eventos.forEach(function (e) { var m = compDe(e.b); ataques[m][(e.b - (solto ? 0 : m * bpc)).toFixed(3)] = 1; }); });
    // rótulos embaixo das notas (nome da nota, valor da figura…) pedem mais espaço entre elas
    var temRot = vozes.some(function (vz) { return vz.eventos.some(function (e) { return e.rotulo; }); });
    var posNoComp = [], largComp = [], MIN = temRot ? 48 : 25, ESQ = temRot ? 24 : 16;
    ataques.forEach(function (a, m) {
      var ts = Object.keys(a).map(Number).sort(function (x, y) { return x - y; });
      if (!ts.length) ts = [0];
      var fimC = solto ? Math.max(total, ts[ts.length - 1] + 1) : bpc, x = ESQ, pos = {};
      ts.forEach(function (t, i) { pos[t.toFixed(3)] = x; x += Math.max(MIN, ((i + 1 < ts.length ? ts[i + 1] : fimC) - t) * BW); });
      posNoComp.push(pos); largComp.push(x + (solto ? 0 : 4));
    });
    // largura da linha acompanha a tela: no celular entram menos compassos por linha e as notas ficam grandes
    var largTela = cfg.largura || Math.min(680, Math.max(330, (window.innerWidth || 800) - 70));
    var largCab = 44 + Math.abs(arm) * 9 + (solto ? 0 : 24), util = largTela - largCab;
    // quebra de linha: cabe o que couber em cada sistema; as linhas cheias são esticadas até a margem
    var sistemas = [], atual = null;
    for (var m1 = 0; m1 < nComp; m1++) {
      if (!atual || (atual.usado + largComp[m1] > util && !(cfg.porLinha && atual.comps.length < cfg.porLinha)) || (cfg.porLinha && atual.comps.length >= cfg.porLinha)) { atual = { comps: [], usado: 0 }; sistemas.push(atual); }
      atual.comps.push(m1); atual.usado += largComp[m1];
    }
    var linhas = sistemas.length, sisDoComp = [], iniDoComp = [];
    sistemas.forEach(function (st, s) {
      st.escala = linhas > 1 && (s < linhas - 1 || st.usado > util * 0.7) ? util / st.usado : 1;
      var x = largCab;
      st.comps.forEach(function (m) { sisDoComp[m] = s; iniDoComp[m] = x; x += largComp[m] * st.escala; });
      st.fim = x;
    });
    var CIMA = 38, ENTRE = 70, TAB_GAP = 30, BAIXO = temRot ? 52 : 34;
    var altSis = CIMA + nv * 4 * L + (nv - 1) * ENTRE + (temTab ? TAB_GAP + 5 * 8 : 0) + BAIXO;
    var W = (linhas > 1 ? largCab + util : sistemas[0].fim) + 6, H = linhas * altSis;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'pauta-svg', role: 'img', 'aria-label': cfg.rotulo || 'Partitura' });
    svg.style.maxWidth = Math.round(W * 1.25) + 'px';
    var porChave = {};
    function topoDe(s, k) { return s * altSis + CIMA + k * (4 * L + ENTRE); }
    function yDe(passo, clave, topo) { return topo + 4 * L - (passo - CLAVES[clave].base) * L / 2; }
    function xDe(b) {
      var m = compDe(b), st = sistemas[sisDoComp[m]];
      return iniDoComp[m] + (posNoComp[m][(b - (solto ? 0 : m * bpc)).toFixed(3)] || ESQ) * st.escala;
    }
    function sisDe(b) { return sisDoComp[compDe(b)]; }

    for (var s = 0; s < linhas; s++) {
      var st = sistemas[s], xFim = st.fim;
      vozes.forEach(function (vz, k) {
        var topo = topoDe(s, k), cl = vz.clave;
        for (var i = 0; i < 5; i++) svg.appendChild(svgEl('line', { x1: 4, y1: topo + i * L, x2: xFim, y2: topo + i * L, class: 'pt-linha' }));
        if (cl === 'sol') svg.appendChild(svgEl('text', { x: 8, y: topo + 3 * L, class: 'pt-clave' }, '𝄞'));
        else svg.appendChild(svgEl('text', { x: 8, y: topo + L, class: 'pt-clave fa' }, '𝄢'));
        if (tr === 12 && cl === 'sol') svg.appendChild(svgEl('text', { x: 18, y: topo + 4 * L + 26, class: 'pt-oito' }, '8'));
        for (i = 0; i < Math.abs(arm); i++) {
          var p = (arm > 0 ? POS_SUST : POS_BEM)[i] - (cl === 'fa' ? 14 : 0);
          acidente(svg, arm > 0 ? 1 : -1, 44 + i * 9, yDe(p, cl, topo));
        }
        if (s === 0 && !solto) {
          var xc = 44 + Math.abs(arm) * 9 + 6;
          svg.appendChild(svgEl('text', { x: xc, y: topo + 2 * L - 1, class: 'pt-formula' }, String(bpc)));
          svg.appendChild(svgEl('text', { x: xc, y: topo + 4 * L - 1, class: 'pt-formula' }, '4'));
        }
        if (!solto) st.comps.forEach(function (m, j) {
          var xb = iniDoComp[m] + largComp[m] * st.escala, final = s === linhas - 1 && j === st.comps.length - 1;
          svg.appendChild(svgEl('line', { x1: xb - (final ? 4 : 0), y1: topo, x2: xb - (final ? 4 : 0), y2: topo + 4 * L, class: 'pt-barra' }));
          if (final) svg.appendChild(svgEl('rect', { x: xb - 2, y: topo, width: 3, height: 4 * L, class: 'pt-barra-final' }));
        });
      });
      if (nv > 1) svg.appendChild(svgEl('line', { x1: 4, y1: topoDe(s, 0), x2: 4, y2: topoDe(s, nv - 1) + 4 * L, class: 'pt-barra' }));
      if (temTab) {
        var tt = topoDe(s, nv - 1) + 4 * L + TAB_GAP;
        for (var c = 0; c < 6; c++) svg.appendChild(svgEl('line', { x1: 4, y1: tt + c * 8, x2: xFim, y2: tt + c * 8, class: 'pt-linha tab' }));
        ['T', 'A', 'B'].forEach(function (l, i) { svg.appendChild(svgEl('text', { x: 14, y: tt + 11 + i * 13, class: 'pt-tab-letra' }, l)); });
      }
    }

    vozes.forEach(function (vz, k) {
      var cl = vz.clave, meio = CLAVES[cl].meio, memo = {}, compAtual = -1;
      var notas = [];
      vz.eventos.slice().sort(function (a, z) { return a.b - z.b; }).forEach(function (e) {
        var s = sisDe(e.b), topo = topoDe(s, k), x = xDe(e.b), f = figura(e.dur);
        var m = Math.floor(e.b / bpc + 1e-6); if (m !== compAtual) { compAtual = m; memo = {}; }
        var g = svgEl('g', { class: 'pt-evento' }); svg.appendChild(g);
        if (e.chave != null) (porChave[e.chave] = porChave[e.chave] || []).push(g);
        if (e.rotulo) g.appendChild(svgEl('text', { x: x, y: topo + 4 * L + (temTab && k === nv - 1 ? TAB_GAP + 58 : 36), class: 'pt-rotulo' }, String(e.rotulo)));
        if (!e.midis || !e.midis.length) { pausa(g, x, topo, f); return; }
        var sol = e.midis.map(function (mi) { var q = soletrar(mi + tr, arm, cfg.bemois); q.midi = mi; return q; }).sort(function (a, z) { return a.passo - z.passo; });
        var ys = [];
        sol.forEach(function (q, i) {
          var y = yDe(q.passo, cl, topo); ys.push(y);
          var rel = q.passo - CLAVES[cl].base;
          for (var lp = -2; lp >= rel; lp -= 2) g.appendChild(svgEl('line', { x1: x - 10, y1: yDe(CLAVES[cl].base + lp, cl, topo), x2: x + 10, y2: yDe(CLAVES[cl].base + lp, cl, topo), class: 'pt-linha sup' }));
          for (lp = 10; lp <= rel; lp += 2) g.appendChild(svgEl('line', { x1: x - 10, y1: yDe(CLAVES[cl].base + lp, cl, topo), x2: x + 10, y2: yDe(CLAVES[cl].base + lp, cl, topo), class: 'pt-linha sup' }));
          var esperado = memo[q.passo] != null ? memo[q.passo] : altArmadura(q.letra, arm);
          if (esperado !== q.alt) { acidente(g, q.alt, x - 14, y); memo[q.passo] = q.alt; }
          var desloca = i > 0 && q.passo - sol[i - 1].passo === 1 && !sol[i - 1].desl ? 11 : 0; q.desl = !!desloca;
          g.appendChild(svgEl('ellipse', { cx: x + desloca, cy: y, rx: 6.3, ry: 4.5, transform: 'rotate(-20 ' + (x + desloca) + ' ' + y + ')', class: 'pt-cabeca' + (f.vazia ? ' vazia' : '') }));
          if (f.ponto) g.appendChild(svgEl('circle', { cx: x + 11 + desloca, cy: rel % 2 === 0 ? y - L / 2 : y, r: 1.8, class: 'pt-ponto' }));
          if (temTab) {
            var pos = cfg.tab(q.midi);
            if (pos) {
              var ty = topoDe(s, nv - 1) + 4 * L + TAB_GAP + (pos.corda - 1) * 8;
              g.appendChild(svgEl('rect', { x: x - 6, y: ty - 6, width: 12, height: 12, class: 'pt-tab-fundo' }));
              g.appendChild(svgEl('text', { x: x, y: ty + 4, class: 'pt-tab-num' }, String(pos.casa)));
            }
          }
        });
        var media = sol.reduce(function (t, q) { return t + q.passo; }, 0) / sol.length;
        notas.push({ g: g, x: x, ys: ys, f: f, b: e.b, s: s, sobe: media < meio, beat: Math.floor(e.b + 1e-6), m: m });
      });
      // hastes, bandeirolas e barras de ligação (colcheias e semicolcheias do mesmo tempo)
      var i = 0;
      while (i < notas.length) {
        var n = notas[i];
        if (!n.f.haste) { i++; continue; }
        var grupo = [n];
        if (n.f.band) {
          while (i + grupo.length < notas.length) {
            var nx = notas[i + grupo.length];
            if (!nx.f.band || nx.beat !== n.beat || nx.s !== n.s || nx.b - grupo[grupo.length - 1].b > 0.76) break;
            grupo.push(nx);
          }
        }
        haste(grupo);
        i += grupo.length;
      }
    });
    function haste(grupo) {
      var sobe = grupo.reduce(function (t, n) { return t + (n.sobe ? 1 : -1); }, 0) >= 0;
      var y0 = sobe ? Math.min.apply(null, grupo.map(function (n) { return Math.min.apply(null, n.ys); })) - 32
        : Math.max.apply(null, grupo.map(function (n) { return Math.max.apply(null, n.ys); })) + 32;
      grupo.forEach(function (n) {
        var xh = n.x + (sobe ? 5.8 : -5.8), base = sobe ? Math.max.apply(null, n.ys) : Math.min.apply(null, n.ys);
        var fim = grupo.length > 1 ? y0 : (sobe ? Math.min.apply(null, n.ys) - 32 : Math.max.apply(null, n.ys) + 32);
        n.xh = xh;
        n.g.appendChild(svgEl('line', { x1: xh, y1: base, x2: xh, y2: fim, class: 'pt-haste' }));
        if (grupo.length === 1) for (var k = 0; k < n.f.band; k++) {
          var yb = fim + (sobe ? k * 7 : -k * 7);
          n.g.appendChild(svgEl('path', { d: 'M' + xh + ' ' + yb + (sobe ? ' c1 7 10 9 8 19' : ' c1 -7 10 -9 8 -19'), class: 'pt-bandeira' }));
        }
      });
      if (grupo.length < 2) return;
      var a = grupo[0], z = grupo[grupo.length - 1];
      a.g.parentNode.insertBefore(svgEl('rect', { x: a.xh - 0.8, y: sobe ? y0 : y0 - 4.5, width: z.xh - a.xh + 1.6, height: 4.5, class: 'pt-barra-lig' }), null);
      grupo.forEach(function (n, k) {
        if (n.f.band < 2) return;
        var viz = grupo[k + 1] && grupo[k + 1].f.band >= 2 ? grupo[k + 1] : null;
        if (viz) svg.appendChild(svgEl('rect', { x: n.xh - 0.8, y: sobe ? y0 + 7 : y0 - 11.5, width: viz.xh - n.xh + 1.6, height: 4.5, class: 'pt-barra-lig' }));
        else if (!(grupo[k - 1] && grupo[k - 1].f.band >= 2)) {
          var para = k > 0 ? -8 : 8;
          svg.appendChild(svgEl('rect', { x: Math.min(n.xh, n.xh + para), y: sobe ? y0 + 7 : y0 - 11.5, width: 8, height: 4.5, class: 'pt-barra-lig' }));
        }
      });
    }
    function pausa(g, x, topo, f) {
      if (f.valor >= 4) g.appendChild(svgEl('rect', { x: x - 6, y: topo + L, width: 12, height: 5, class: 'pt-pausa' }));
      else if (f.valor >= 2) g.appendChild(svgEl('rect', { x: x - 6, y: topo + 2 * L - 5, width: 12, height: 5, class: 'pt-pausa' }));
      else if (f.valor >= 1) g.appendChild(svgEl('path', { d: 'M' + (x - 3) + ' ' + (topo + 6) + ' l6 8 l-6 6 l6 8 c-7 -3 -9 3 -3 8', class: 'pt-pausa-traco' }));
      else {
        for (var k = 0; k < f.band; k++) {
          g.appendChild(svgEl('circle', { cx: x - 3 - k * 2, cy: topo + 15 + k * 8, r: 2.6, class: 'pt-pausa' }));
          g.appendChild(svgEl('path', { d: 'M' + (x - 3 - k * 2) + ' ' + (topo + 16 + k * 8) + ' q5 2 8 -3', class: 'pt-pausa-traco fino' }));
        }
        g.appendChild(svgEl('line', { x1: x + 5, y1: topo + 13, x2: x - 1 - f.band * 2, y2: topo + 33 + (f.band - 1) * 6, class: 'pt-pausa-traco fino' }));
      }
      if (f.ponto) g.appendChild(svgEl('circle', { cx: x + 10, cy: topo + 15, r: 1.8, class: 'pt-ponto' }));
    }
    return {
      el: svg,
      acender: function (chave, seg) {
        (porChave[chave] || []).forEach(function (g) {
          g.classList.add('tocando'); clearTimeout(g._t);
          g._t = setTimeout(function () { g.classList.remove('tocando'); }, Math.max(160, (seg || 0.3) * 1000 - 40));
        });
      },
      limpar: function () { Object.keys(porChave).forEach(function (k) { porChave[k].forEach(function (g) { g.classList.remove('tocando'); }); }); }
    };
  }
  // Pauta de um exercício de notas (padrao ou maos): a chave de cada nota é "mão:índice"
  function pautaDoExercicio(v, de, opcoes) {
    var cordas = opcoes.cordas, vozes = [];
    var fontes = v.maos ? ['D', 'E'].filter(function (m) { return v.maos[m]; }).map(function (m) { return { mao: m, raiz: v.maos[m].raiz, padrao: v.maos[m].padrao }; })
      : [{ mao: v.mao || 'U', raiz: de, padrao: v.padrao || [] }];
    fontes.forEach(function (f) {
      var b = 0, eventos = [], soma = 0, n = 0;
      f.padrao.forEach(function (p, i) {
        var dur = Number(p[1]) || 1;
        var midis = p[0] == null ? null : [].concat(p[0]).map(function (s) { soma += f.raiz + s; n++; return f.raiz + s; });
        eventos.push({ b: b, dur: dur, midis: midis, chave: f.mao + ':' + i });
        b += dur;
      });
      // mão esquerda sozinha: clave de fá, a não ser que ela toque lá em cima (aí lê na clave de sol)
      var clave = typeof v.pauta === 'string' ? v.pauta : f.mao === 'E' ? (v.maos || (n && soma / n < 60) ? 'fa' : 'sol') : f.mao === 'D' || cordas ? 'sol' : (n && soma / n < 57 ? 'fa' : 'sol');
      if (v.maos && typeof v.pauta === 'string') clave = f.mao === 'E' ? 'fa' : 'sol';
      vozes.push({ clave: clave, eventos: eventos });
    });
    return desenharPauta({ vozes: vozes, compasso: v.compasso || 4, armadura: v.armadura || 0, bemois: !!v.bemois, transpor: cordas ? 12 : 0,
      tab: cordas ? opcoes.posicao : null, rotulo: 'Partitura do exercício' });
  }

  // ---------- Questões de teoria (lições e provas) ----------
  // Cada questão vem de uma especificação com os parâmetros do que o aluno já estudou, por exemplo
  //   { tema: 'nota', clave: 'sol', notas: [67, 69, 71, 72] }  ou  { tema: 'acorde-desenho', acordes: ['Em', 'Am', 'D'] }.
  function sorteio(n) { return Math.floor(Math.random() * n); }
  function escolher(l) { return l[sorteio(l.length)]; }
  function embaralhar(l) { l = l.slice(); for (var i = l.length - 1; i > 0; i--) { var j = sorteio(i + 1), t = l[i]; l[i] = l[j]; l[j] = t; } return l; }
  function questao(p, certa, erradas, extra) {
    var o = [certa];
    embaralhar(erradas).forEach(function (e) { if (e != null && o.indexOf(e) < 0 && o.length < 4) o.push(e); });
    o = embaralhar(o);
    var r = { p: p, o: o, c: o.indexOf(certa) };
    Object.keys(extra || {}).forEach(function (k) { r[k] = extra[k]; });
    return r;
  }
  function notaDe(letra, pcAlvo) { var l = ((letra % 7) + 7) % 7; return { letra: l, alt: ((pcAlvo - LETRA_PC[l]) % 12 + 18) % 12 - 6 }; }
  function nomeLA(n) { return LETRA_NOME[n.letra] + (n.alt ? ACIDENTE[String(n.alt)] : ''); }
  function cifraLA(n) { return LETRAS[n.letra] + (n.alt === 1 ? '#' : n.alt === -1 ? 'b' : n.alt === 2 ? '##' : n.alt === -2 ? 'bb' : ''); }
  var TONS = [{ n: 'Dó', l: 0, pc: 0, arm: 0 }, { n: 'Sol', l: 4, pc: 7, arm: 1 }, { n: 'Ré', l: 1, pc: 2, arm: 2 }, { n: 'Lá', l: 5, pc: 9, arm: 3 },
    { n: 'Fá', l: 3, pc: 5, arm: -1 }, { n: 'Si♭', l: 6, pc: 10, arm: -2 }, { n: 'Mi♭', l: 2, pc: 3, arm: -3 }, { n: 'Mi', l: 2, pc: 4, arm: 4 },
    { n: 'Lá♭', l: 5, pc: 8, arm: -4 }, { n: 'Si', l: 6, pc: 11, arm: 5 }, { n: 'Ré♭', l: 1, pc: 1, arm: -5 }];
  function tomDe(nome) { return TONS.filter(function (t) { return t.n === nome; })[0] || TONS[0]; }
  function tonsDe(s) { return (s.tons || ['Dó']).map(tomDe); }
  var MAIOR_ST = [0, 2, 4, 5, 7, 9, 11];
  function escalaMaior(t) { return MAIOR_ST.map(function (s, i) { return notaDe(t.l + i, t.pc + s); }); }
  var GRAUS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  var CAMPO_TRI = ['', 'm', 'm', '', '', 'm', 'dim'], CAMPO_TET = ['7M', 'm7', 'm7', '7M', '7', 'm7', 'm7(b5)'];
  var INTERVALOS = [[1, '2ª menor', 1], [2, '2ª maior', 1], [3, '3ª menor', 2], [4, '3ª maior', 2], [5, '4ª justa', 3], [6, '4ª aumentada (trítono)', 3],
    [7, '5ª justa', 4], [8, '6ª menor', 5], [9, '6ª maior', 5], [10, '7ª menor', 6], [11, '7ª maior', 6], [12, '8ª justa', 7]];
  var VALOR_TXT = { 4: '4 tempos', 3: '3 tempos', 2: '2 tempos', 1.5: '1 tempo e meio', 1: '1 tempo', 0.75: '3/4 de tempo', 0.5: 'meio tempo', 0.25: '1/4 de tempo' };
  var MODOS = ['Jônio', 'Dórico', 'Frígio', 'Lídio', 'Mixolídio', 'Eólio', 'Lócrio'];
  function pautaSolta(clave, eventos, extra) {
    var c = { vozes: [{ clave: clave, eventos: eventos }], semCompasso: true };
    Object.keys(extra || {}).forEach(function (k) { c[k] = extra[k]; });
    return c;
  }
  function nomeMidi(m) { var q = soletrar(m, 0); return LETRA_NOME[q.letra] + (q.alt ? ACIDENTE[String(q.alt)] : ''); }
  function posTxt(p) { return p.corda + 'ª corda, ' + (p.casa ? 'casa ' + p.casa : 'solta'); }
  function qualidadeTxt(q) { return { '': 'maior', m: 'menor', dim: 'diminuto', aug: 'aumentado', '7': 'com sétima', m7: 'menor com sétima', '7M': 'com sétima maior', maj7: 'com sétima maior', 'm7(b5)': 'meio-diminuto', sus4: 'com 4ª suspensa', '5': 'power chord (tônica e 5ª)' }[q]; }
  var PASSO_INTERVALO = { 0: 0, 3: 2, 4: 2, 5: 3, 6: 4, 7: 4, 8: 4, 10: 6, 11: 6, 12: 7 };
  function notasDoAcordeLA(raiz, q) {
    return (QUALIDADE[q] || []).map(function (s) { return notaDe(raiz.letra + PASSO_INTERVALO[s], LETRA_PC[raiz.letra] + raiz.alt + s); });
  }
  function listaTxt(ns) { return ns.map(nomeLA).join(' – '); }
  // cifra simples que dá para soletrar (sem baixo trocado e sem tensões)
  function lerAcorde(c) {
    var x = lerCifra(c); if (!x || x.baixo || qualidadeTxt(x.q) == null) return null;
    var alt = /^[A-G]#/.test(c) ? 1 : /^[A-G]b/.test(c) ? -1 : 0;
    var raiz = { letra: LETRAS.indexOf(x.letra), alt: alt };
    if ((QUALIDADE[x.q] || []).some(function (s) { return PASSO_INTERVALO[s] == null; })) return null;
    return { cifra: c, raiz: raiz, q: x.q, notas: notasDoAcordeLA(raiz, x.q) };
  }
  var COMUNS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm', 'F', 'G7', 'E7', 'A7', 'D7', 'B7', 'Bm'];
  // compasso incompleto feito só com as figuras estudadas
  function compassoIncompleto(bpc, valores, pausas) {
    var vs = valores.slice().sort(function (a, b) { return b - a; }), menor = vs[vs.length - 1];
    var faltas = vs.filter(function (v) { return v <= bpc - menor + 1e-6 && VALOR_TXT[v]; });
    var falta = escolher(faltas.length ? faltas : [menor]), resto = bpc - falta, ev = [], b = 0, guard = 0;
    while (resto > 1e-6 && guard++ < 20) {
      var cand = vs.filter(function (x) { return x <= resto + 1e-6; }); if (!cand.length) break;
      var d = escolher(cand);
      ev.push({ b: b, dur: d, midis: pausas && Math.random() < 0.3 ? null : [escolher([64, 65, 67, 69, 71, 72])] }); b += d; resto -= d;
    }
    return { falta: falta, eventos: ev };
  }

  var GERA = {
    // nome da nota na pauta, só com as notas já estudadas
    'nota': function (s) {
      var clave = s.clave || 'sol', midi = escolher(s.notas), certa = nomeMidi(midi);
      var outras = s.notas.map(nomeMidi).filter(function (x) { return x !== certa; });
      var q = soletrar(midi, 0), viz = [1, -1, 2, -2].map(function (d) { return LETRA_NOME[((q.letra + d) % 7 + 7) % 7]; });
      return questao('Qual é o nome desta nota' + (clave === 'fa' ? ' na clave de fá?' : '?'), certa, embaralhar(outras).concat(viz),
        { pauta: pautaSolta(clave, [{ b: 0, dur: 4, midis: [midi] }]) });
    },
    // violão e guitarra: onde se toca a nota escrita (as notas da lista são escritas; o som é uma oitava abaixo)
    'casa': function (s) {
      var pos = function (m) { return posicaoNaRegiao(m - 12, 0); };
      var lista = s.notas.filter(function (m) { var p = pos(m); return p && p.casa <= 4; });
      var midi = escolher(lista), certa = pos(midi);
      var erradas = lista.filter(function (m) { return m !== midi; }).map(function (m) { return posTxt(pos(m)); })
        .concat([posTxt({ corda: certa.corda, casa: certa.casa + 1 }), posTxt({ corda: certa.corda === 1 ? 2 : certa.corda - 1, casa: certa.casa })]);
      return questao('Onde se toca esta nota no violão (primeira posição)?', posTxt(certa), erradas,
        { pauta: pautaSolta('sol', [{ b: 0, dur: 4, midis: [midi - 12] }], { transpor: 12 }) });
    },
    'figura': function (s) {
      var vs = s.valores || [4, 2, 1], v = escolher(vs), nome = figura(v).nome;
      var nomes = vs.map(function (x) { return figura(x).nome; }).concat(['semibreve', 'mínima', 'semínima', 'colcheia']);
      if (Math.random() < 0.5) return questao('Qual é o nome desta figura?', nome, nomes, { pauta: pautaSolta('sol', [{ b: 0, dur: v, midis: [71] }]) });
      return questao('No compasso de 4/4, quanto vale a ' + nome + '?', VALOR_TXT[v], vs.map(function (x) { return VALOR_TXT[x]; }).concat(['4 tempos', '2 tempos', '1 tempo', 'meio tempo', '3 tempos']));
    },
    'pausa': function (s) {
      var vs = s.valores || [4, 2, 1], v = escolher(vs);
      var nomes = vs.concat([4, 2, 1, 0.5]).map(function (x) { return 'pausa de ' + figura(x).nome; });
      if (Math.random() < 0.5) return questao('Qual é esta pausa?', 'pausa de ' + figura(v).nome, nomes, { pauta: pautaSolta('sol', [{ b: 0, dur: v, midis: null }]) });
      return questao('Quanto vale esta pausa?', VALOR_TXT[v], ['4 tempos', '2 tempos', '1 tempo', 'meio tempo', '3 tempos'], { pauta: pautaSolta('sol', [{ b: 0, dur: v, midis: null }]) });
    },
    'compasso': function (s) {
      var bpc = escolher(s.formulas || [4]), vs = s.valores || [2, 1];
      if (Math.random() < 0.35) {
        if (vs.indexOf(0.5) >= 0 && Math.random() < 0.5) return questao('Num compasso ' + bpc + '/4, quantas colcheias cabem?', String(bpc * 2), [String(bpc), String(bpc * 4), String(bpc * 2 + 2), String(bpc + 1)]);
        return questao('Quantos tempos tem cada compasso ' + bpc + '/4?', String(bpc), ['2', '3', '4', '6', '8']);
      }
      var c = compassoIncompleto(bpc, vs, s.pausas);
      return questao('Quantos tempos faltam para completar este compasso ' + bpc + '/4?', VALOR_TXT[c.falta],
        ['meio tempo', '1 tempo', '2 tempos', '1 tempo e meio', '3 tempos', '1/4 de tempo'], { pauta: { vozes: [{ clave: 'sol', eventos: c.eventos }], compasso: bpc } });
    },
    'acidente': function () {
      var l = sorteio(7), base = LETRA_PC[l], tipo = sorteio(3), certa, txt;
      if (tipo === 0) { txt = 'Qual nota está meio tom acima de ' + LETRA_NOME[l] + '?'; certa = l === 2 || l === 6 ? notaDe(l + 1, base + 1) : notaDe(l, base + 1); }
      else if (tipo === 1) { txt = 'Qual nota está meio tom abaixo de ' + LETRA_NOME[l] + '?'; certa = l === 0 || l === 3 ? notaDe(l - 1, base - 1) : notaDe(l, base - 1); }
      else { txt = 'Qual nota está um tom acima de ' + LETRA_NOME[l] + '?'; certa = notaDe(l + 1, base + 2); }
      var erradas = [notaDe(l, base + (tipo === 1 ? 1 : -1)), notaDe(l + 1, base + 3), notaDe(l - 1, base - 2), notaDe(l + 1, base + 1), notaDe(l + 1, LETRA_PC[(l + 1) % 7]), notaDe(l, base)]
        .filter(function (x) { return Math.abs(x.alt) <= 1; }).map(nomeLA);
      return questao(txt, nomeLA(certa), erradas);
    },
    'armadura': function (s) {
      var ts = tonsDe(s).filter(function (t) { return t.arm; }), t = escolher(ts);
      var outros = ts.concat(TONS).filter(function (x) { return x !== t; }).map(function (x) { return x.n + ' maior'; });
      if (Math.random() < 0.6) return questao('Esta armadura de clave é de qual tom maior?', t.n + ' maior', outros,
        { pauta: { vozes: [{ clave: 'sol', eventos: [] }], semCompasso: true, armadura: t.arm, bw: 10 } });
      var n = Math.abs(t.arm), qual = t.arm > 0 ? (n > 1 ? 'sustenidos' : 'sustenido') : (n > 1 ? 'bemóis' : 'bemol');
      return questao('Quantos acidentes tem a armadura de ' + t.n + ' maior?', n + ' ' + qual,
        [(n + 1) + (t.arm > 0 ? ' sustenidos' : ' bemóis'), Math.max(1, n - 1) + (t.arm > 0 ? ' sustenido' + (n - 1 > 1 ? 's' : '') : ' bemol' + (n - 1 > 1 ? '' : '')), n + (t.arm > 0 ? ' bemóis' : ' sustenidos'), 'Nenhum']);
    },
    'relativa': function (s) {
      var t = escolher(tonsDe(s)), e = escalaMaior(t);
      return questao('Qual é a relativa menor de ' + t.n + ' maior?', nomeLA(e[5]) + ' menor', [nomeLA(e[2]) + ' menor', nomeLA(e[3]) + ' menor', t.n + ' menor', nomeLA(e[4]) + ' menor']);
    },
    'escala': function (s) {
      var t = escolher(tonsDe(s)), esc = escalaMaior(t), g = 1 + sorteio(6), certa = esc[g];
      var erradas = [{ letra: certa.letra, alt: certa.alt + 1 }, { letra: certa.letra, alt: certa.alt - 1 }, esc[(g + 1) % 7], esc[g - 1]].filter(function (x) { return Math.abs(x.alt) <= 1; }).map(nomeLA);
      return questao('Qual é o ' + (g + 1) + 'º grau da escala de ' + t.n + ' maior?', nomeLA(certa), erradas);
    },
    'intervalo': function (s) {
      var lista = INTERVALOS.filter(function (x) { return (s.lista || [2, 3, 4, 5, 7, 12]).indexOf(x[0]) >= 0; }), iv, raiz, alvo, guard = 0;
      do { iv = escolher(lista); raiz = { letra: sorteio(7), alt: 0 }; alvo = notaDe(raiz.letra + iv[2], LETRA_PC[raiz.letra] + iv[0]); } while (Math.abs(alvo.alt) > 1 && guard++ < 30);
      var m1 = 60 + LETRA_PC[raiz.letra], nomeIv = function (x) { return s.simples ? x[1].split(' ')[0] : x[1]; };
      var erradas = INTERVALOS.filter(function (x) { return x !== iv; }).sort(function (a, b) { return Math.abs(a[0] - iv[0]) - Math.abs(b[0] - iv[0]); }).map(nomeIv);
      return questao('Qual é o intervalo entre ' + nomeLA(raiz) + ' e ' + nomeLA(alvo) + '?', nomeIv(iv), erradas,
        { pauta: pautaSolta('sol', [{ b: 0, dur: 1, midis: [m1] }, { b: 1, dur: 1, midis: [m1 + iv[0]] }], { bemois: alvo.alt < 0 }) });
    },
    'intervalo-ouvido': function (s) {
      var opc = INTERVALOS.filter(function (x) { return (s.lista || [3, 4, 7, 12]).indexOf(x[0]) >= 0; }), iv = escolher(opc), r = 55 + sorteio(8);
      return questao('Toque em Ouvir e diga qual é o intervalo:', iv[1], opc.map(function (x) { return x[1]; }).concat(['2ª maior', '4ª justa', '6ª maior']), { ouvir: [[r], [r + iv[0]]] });
    },
    'acorde-ouvido': function (s) {
      var nomes = { '': 'maior', m: 'menor', dim: 'diminuto', aug: 'aumentado' }, tipos = s.tipos || ['', 'm'], q = escolher(tipos), r = 52 + sorteio(9);
      return questao('Toque em Ouvir: o acorde é…', nomes[q], tipos.map(function (x) { return nomes[x]; }).concat(['maior', 'menor', 'diminuto', 'aumentado']), { ouvir: [QUALIDADE[q].map(function (x) { return r + x; })] });
    },
    'triade': function (s) {
      var t = escolher(tonsDe(s)), g = escolher([0, 1, 3, 4, 5]), esc = escalaMaior(t), raiz = esc[g], q = CAMPO_TRI[g];
      var certas = notasDoAcordeLA(raiz, q);
      if (Math.random() < 0.4) return questao('O acorde ' + listaTxt(certas) + ' é:', qualidadeTxt(q), ['maior', 'menor', 'diminuto', 'aumentado']);
      return questao('Quais notas formam o acorde ' + cifraLA(raiz) + q + '?', listaTxt(certas),
        [listaTxt(notasDoAcordeLA(raiz, q === 'm' ? '' : 'm')), listaTxt(notasDoAcordeLA(esc[(g + 1) % 7], CAMPO_TRI[(g + 1) % 7])), listaTxt(notasDoAcordeLA(esc[(g + 3) % 7], CAMPO_TRI[(g + 3) % 7]))]);
    },
    'tetrade': function (s) {
      var t = escolher(tonsDe(s)), g = sorteio(7), esc = escalaMaior(t), raiz = esc[g], q = CAMPO_TET[g];
      var alt = { '7M': '7', '7': '7M', m7: 'm7(b5)', 'm7(b5)': 'm7' }[q];
      return questao('Quais notas formam o acorde ' + cifraLA(raiz) + q + '?', listaTxt(notasDoAcordeLA(raiz, q)),
        [listaTxt(notasDoAcordeLA(raiz, alt)), listaTxt(notasDoAcordeLA(raiz, q === '7M' ? 'm7' : '7M')), listaTxt(notasDoAcordeLA(raiz, q === 'm7' ? '7' : 'm7')), listaTxt(notasDoAcordeLA(esc[(g + 1) % 7], CAMPO_TET[(g + 1) % 7]))]);
    },
    // acordes treinados no módulo
    'acorde-notas': function (s) {
      var lista = (s.acordes || []).map(lerAcorde).filter(Boolean), a = escolher(lista);
      var erradas = lista.filter(function (x) { return x.cifra !== a.cifra; }).map(function (x) { return listaTxt(x.notas); })
        .concat([listaTxt(notasDoAcordeLA(a.raiz, a.q === 'm' ? '' : 'm')), listaTxt(notasDoAcordeLA(a.raiz, a.q === '7' ? '' : '7'))]);
      return questao('Quais notas formam o acorde ' + a.cifra + '?', listaTxt(a.notas), erradas);
    },
    'acorde-desenho': function (s) {
      var lista = (s.acordes || []).filter(function (c) { return DIAGRAMAS[c]; }), c = escolher(lista);
      var d = diagramaDe(c), copia = { nome: '', pontos: d.pontos, abafadas: d.abafadas, soltas: d.soltas, pestana: d.pestana };
      return questao('Qual acorde é este desenho?', c, lista.filter(function (x) { return x !== c; }).concat(embaralhar(COMUNS)),
        { desenho: function () { var e = h('div', { class: 'prova-braco' }); e.appendChild(desenharBraco(copia)); return e; } });
    },
    'acorde-teclado': function (s) {
      var lista = (s.acordes || []).map(lerAcorde).filter(Boolean), a = escolher(lista);
      var midis = QUALIDADE[a.q].map(function (x) { return 60 + LETRA_PC[a.raiz.letra] + a.raiz.alt + x; });
      return questao('Qual acorde está marcado no teclado?', a.cifra, lista.map(function (x) { return x.cifra; }).filter(function (x) { return x !== a.cifra; }).concat(embaralhar(COMUNS)),
        { desenho: function () { var t = criarTeclado(57, 84, function (m) { somNota(m, 0, 0.6, 1, true); }, false); t.marcar(midis); var e = h('div', { class: 'prova-teclado' }); e.appendChild(t.el); return e; } });
    },
    'cifra': function (s) {
      var lista = (s.acordes || COMUNS).map(lerAcorde).filter(function (x) { return x && x.q !== '5'; });
      if (!lista.length) lista = COMUNS.map(lerAcorde).filter(Boolean);
      var a = escolher(lista);
      if (Math.random() < 0.25) return questao('Na cifra, qual letra representa a nota ' + LETRA_NOME[a.raiz.letra] + '?', LETRAS[a.raiz.letra], LETRAS.filter(function (x, i) { return i !== a.raiz.letra; }));
      var nome = function (r, q) { return nomeLA(r) + ' ' + qualidadeTxt(q); };
      return questao('O que significa a cifra ' + a.cifra + '?', nome(a.raiz, a.q),
        ['', 'm', '7', 'm7', '7M'].filter(function (q) { return q !== a.q; }).map(function (q) { return nome(a.raiz, q); }).concat([nome({ letra: (a.raiz.letra + 1) % 7, alt: 0 }, a.q)]));
    },
    'campo': function (s) {
      var t = escolher(tonsDe(s)), g = sorteio(7), esc = escalaMaior(t), Q = s.tetrades ? CAMPO_TET : CAMPO_TRI;
      var c = function (i, q) { return cifraLA(esc[(i + 7) % 7]) + (q != null ? q : Q[(i + 7) % 7]); };
      return questao('No campo harmônico de ' + t.n + ' maior, qual é o acorde do grau ' + GRAUS[g] + '?', c(g), [c(g + 1), c(g - 1), c(g, Q[g] === Q[1] ? Q[0] : Q[1]), c(g + 2)]);
    },
    'funcao': function (s) {
      if (Math.random() < 0.5) {
        var g = escolher([[0, 'Tônica'], [3, 'Subdominante'], [4, 'Dominante'], [1, 'Subdominante'], [5, 'Tônica'], [6, 'Dominante']]);
        return questao('Qual é a função harmônica do grau ' + GRAUS[g[0]] + '?', g[1], ['Tônica', 'Subdominante', 'Dominante', 'Nenhuma']);
      }
      var t = escolher(tonsDe(s)), esc = escalaMaior(t);
      return questao('No tom de ' + t.n + ' maior, qual acorde é a dominante (V7)?', cifraLA(esc[4]) + '7', [cifraLA(esc[3]) + '7', cifraLA(esc[1]) + 'm7', cifraLA(esc[0]) + '7', cifraLA(esc[5]) + '7']);
    },
    'harmonia': function (s) {
      var t = escolher(TONS.slice(0, 7)), esc = escalaMaior(t), tipo = escolher(s.tipos || ['iiVI', 'subV', 'secundario', 'tensao']);
      var iiVI = function (e) { return cifraLA(e[1]) + 'm7 – ' + cifraLA(e[4]) + '7 – ' + cifraLA(e[0]) + '7M'; };
      if (tipo === 'iiVI') return questao('Qual é o ii-V-I de ' + t.n + ' maior?', iiVI(esc), TONS.filter(function (x) { return x !== t; }).slice(0, 5).map(function (x) { return iiVI(escalaMaior(x)); }));
      if (tipo === 'subV') return questao('Qual é o SubV7 (substituto de trítono) que resolve em ' + cifraLA(esc[0]) + '?', cifraLA(notaDe(t.l + 1, t.pc + 1)) + '7',
        [cifraLA(esc[4]) + '7', cifraLA(notaDe(t.l + 4, t.pc + 6)) + '7', cifraLA(esc[1]) + '7', cifraLA(notaDe(t.l + 6, t.pc + 10)) + '7']);
      if (tipo === 'secundario') {
        var alvo = esc[escolher([1, 2, 5])], pa = LETRA_PC[alvo.letra] + alvo.alt;
        return questao('Em ' + t.n + ' maior, qual é o dominante secundário (V7) de ' + cifraLA(alvo) + 'm?', cifraLA(notaDe(alvo.letra + 4, pa + 7)) + '7',
          [cifraLA(esc[4]) + '7', cifraLA(notaDe(alvo.letra + 3, pa + 5)) + '7', cifraLA(notaDe(alvo.letra + 1, pa + 2)) + '7', cifraLA(alvo) + '7']);
      }
      var tens = escolher([[2, 1, '9ª'], [5, 3, '11ª'], [9, 5, '13ª']]);
      return questao('Qual nota é a ' + tens[2] + ' do acorde ' + cifraLA(esc[0]) + '7M?', nomeLA(notaDe(t.l + tens[1], t.pc + tens[0])),
        [nomeLA(esc[(tens[1] + 1) % 7]), nomeLA(esc[(tens[1] + 6) % 7]), nomeLA(esc[(tens[1] + 2) % 7]), nomeLA(esc[(tens[1] + 4) % 7])]);
    },
    'nashville': function (s) {
      var t = escolher(tonsDe(s)), esc = escalaMaior(t), g = escolher([0, 1, 3, 4, 5]), num = [1, 2, 3, 4, 5, 6][g] + (CAMPO_TRI[g] === 'm' ? 'm' : '');
      var c = function (i) { return cifraLA(esc[(i + 7) % 7]) + CAMPO_TRI[(i + 7) % 7]; };
      return questao('No sistema Nashville, no tom de ' + t.n + ', o número ' + num + ' é qual acorde?', c(g), [c(g + 1), c(g - 1), c(g + 3), c(g + 4)]);
    },
    'transpor': function (s) {
      var ts = tonsDe(s), de = TONS[0], para = escolher(ts.filter(function (x) { return x !== de; }).concat([TONS[1], TONS[2]])), g = escolher([1, 3, 4, 5]);
      var ed = escalaMaior(de), ep = escalaMaior(para), c = function (e, i) { return cifraLA(e[i]) + CAMPO_TRI[i]; };
      return questao('Uma música em Dó maior tem o acorde ' + c(ed, g) + '. Transpondo para ' + para.n + ' maior, ele vira:', c(ep, g), [c(ep, (g + 1) % 7), c(ep, (g + 6) % 7), c(ed, g), c(ep, (g + 3) % 7)]);
    },
    'modo': function () {
      var g = sorteio(7);
      return questao('Qual modo começa no ' + (g + 1) + 'º grau da escala maior?', MODOS[g], MODOS.filter(function (x, i) { return i !== g; }));
    },
    'tab': function () {
      var corda = 1 + sorteio(6), casa = sorteio(5), midi = CORDAS_SOLTAS[6 - corda] + casa;
      if (Math.random() < 0.5) return questao('Na tablatura, o número ' + casa + ' na ' + corda + 'ª linha (de cima para baixo) quer dizer:', posTxt({ corda: corda, casa: casa }),
        [posTxt({ corda: 7 - corda, casa: casa }), posTxt({ corda: corda, casa: casa + 1 }), 'Dedo ' + Math.max(1, Math.min(4, casa)) + ' na ' + corda + 'ª corda', posTxt({ corda: (corda % 6) + 1, casa: casa })]);
      return questao('Qual nota soa na ' + posTxt({ corda: corda, casa: casa }) + '?', NOMES[pc(midi)], [NOMES[pc(midi + 1)], NOMES[pc(midi - 1)], NOMES[pc(midi + 2)], NOMES[pc(midi - 2)]]);
    }
  };
  function gerarQuestao(spec) { var f = GERA[spec.tema]; return f ? f(spec) : null; }
  function tocarOuvir(ouvir) {
    var c = audio(); if (!c) return;
    var t = c.currentTime + 0.1;
    ouvir.forEach(function (grupo, i) { grupo.forEach(function (m) { somNota(m, t + i * 1.1, 1, 0.8, true); }); });
  }
  function figuraDaQuestao(qq) {
    var caixa = h('div', { class: 'q-figura' });
    if (qq.pauta) caixa.appendChild(h('div', { class: 'prova-pauta' }, desenharPauta(qq.pauta).el));
    if (qq.desenho) caixa.appendChild(qq.desenho());
    if (qq.ouvir) caixa.appendChild(h('button', { type: 'button', class: 'botao vazado', text: '▶ Ouvir', onclick: function () { tocarOuvir(qq.ouvir); } }));
    return caixa.children.length ? caixa : null;
  }

  // ---------- Prova do módulo: uma questão por vez ----------
  // { tipo: 'prova', titulo, blocos: [[pergunta, certa, errada…], …] (um bloco por aula e por lição), gera: [especificações], n, minimo, errosSeguidos }
  // Regras: 70% para passar; 3 erros seguidos encerram a prova e o aluno refaz o módulo.
  // opcoes.aoTerminar({ acertos, total, nota, aprovado, refazer })
  function criarProva(v, opcoes) {
    opcoes = opcoes || {};
    var caixa = h('div', { class: 'prova' }), n = v.n || 10, minimo = v.minimo || 70, limite = v.errosSeguidos || 3;
    var api = { el: caixa, parar: function () {}, aprovado: false };
    function montar() {
      var lista = [], vistas = {};
      function add(q) { if (!q || q.c < 0 || q.o.length < 3) return; var k = q.p + '|' + q.o[q.c]; if (vistas[k]) return; vistas[k] = 1; lista.push(q); }
      var blocos = embaralhar((v.blocos || []).filter(function (b) { return b.length; }));
      var gera = embaralhar(v.gera || []), nFixas = gera.length ? Math.ceil(n * 0.6) : n;
      // uma questão de cada aula e de cada lição; depois as sorteadas; se faltar, mais fixas
      blocos.forEach(function (b) { if (lista.length < nFixas) { var f = escolher(b); add(questao(f[0], f[1], f.slice(2))); } });
      for (var i = 0, t = 0; lista.length < n && gera.length && t < 200; i++, t++) { try { add(gerarQuestao(gera[i % gera.length])); } catch (e) { /* especificação sem dados suficientes */ } }
      embaralhar([].concat.apply([], v.blocos || [])).forEach(function (f) { if (lista.length < n) add(questao(f[0], f[1], f.slice(2))); });
      return embaralhar(lista);
    }
    function intro() {
      caixa.replaceChildren(
        h('div', { class: 'prova-cab' }, h('span', { class: 'rotulo', text: 'Prova do módulo' }), h('b', { class: 'prova-titulo', text: v.titulo || 'Prova de teoria' })),
        h('ul', { class: 'prova-regras' },
          h('li', { text: n + ' questões, uma de cada vez, só sobre o que você estudou neste módulo.' }),
          h('li', { text: 'Para passar: ' + minimo + '% de acertos.' }),
          h('li', null, h('b', { text: limite + ' erros seguidos encerram a prova' }), ' e o módulo recomeça: você refaz as aulas antes de tentar de novo.'),
          h('li', { text: 'Sem consulta. Responda com calma: cada resposta é corrigida na hora.' })),
        h('div', null, h('button', { type: 'button', class: 'botao grande', text: 'Começar a prova', onclick: comecar })));
    }
    function comecar() {
      var qs = montar(), i = 0, acertos = 0, seguidos = 0, escolha = null;
      var barra = h('i'), contaEl = h('span', { class: 'prova-conta' }), errosEl = h('span', { class: 'prova-erros', 'aria-live': 'polite' });
      var palco = h('div', { class: 'prova-palco' });
      caixa.replaceChildren(
        h('div', { class: 'prova-topo' }, h('b', { class: 'prova-titulo', text: v.titulo || 'Prova' }), contaEl),
        h('div', { class: 'barra' }, barra), errosEl, palco);
      function status() {
        contaEl.textContent = 'Questão ' + Math.min(i + 1, qs.length) + ' de ' + qs.length + ' · ' + acertos + ' certa' + (acertos === 1 ? '' : 's');
        barra.style.width = Math.round(100 * i / qs.length) + '%';
        var bolas = ''; for (var k = 0; k < limite; k++) bolas += k < seguidos ? '●' : '○';
        errosEl.textContent = 'Erros seguidos: ' + bolas + (seguidos === limite - 1 ? '  — atenção: mais um erro e o módulo recomeça' : '');
        errosEl.className = 'prova-erros' + (seguidos ? ' alerta' : '');
      }
      function mostrar() {
        status(); escolha = null;
        var qq = qs[i];
        var ops = h('div', { class: 'prova-opcoes', role: 'radiogroup', 'aria-label': 'Respostas' });
        var responder = h('button', { type: 'button', class: 'botao grande', text: 'Responder', disabled: true });
        qq.o.forEach(function (o, k) {
          ops.appendChild(h('button', { type: 'button', class: 'prova-op', role: 'radio', 'aria-checked': 'false', text: o, onclick: function (e) {
            if (responder.dataset.feito) return;
            escolha = k; [].forEach.call(ops.children, function (b) { b.setAttribute('aria-checked', String(b === e.currentTarget)); });
            responder.disabled = false;
          } }));
        });
        var retorno = h('p', { class: 'prova-retorno', role: 'status' });
        responder.addEventListener('click', function () {
          if (responder.dataset.feito) { proxima(); return; }
          if (escolha == null) return;
          responder.dataset.feito = '1';
          var ok = escolha === qq.c;
          [].forEach.call(ops.children, function (b, k) { b.disabled = true; if (k === qq.c) b.classList.add('certa'); else if (k === escolha) b.classList.add('errada'); });
          if (ok) { acertos++; seguidos = 0; retorno.textContent = '✓ Certo!'; retorno.className = 'prova-retorno ok'; }
          else { seguidos++; retorno.textContent = '✗ A resposta certa é: ' + qq.o[qq.c]; retorno.className = 'prova-retorno nao'; }
          i++; status();
          if (!ok && seguidos >= limite) { responder.textContent = 'Ver resultado'; responder.onclick = null; responder.dataset.fim = 'refazer'; return; }
          responder.textContent = i < qs.length ? 'Próxima questão →' : 'Ver resultado';
        });
        function proxima() {
          if (responder.dataset.fim === 'refazer') return fimRefazer();
          if (i < qs.length) mostrar(); else fim();
        }
        palco.replaceChildren(h('article', { class: 'prova-q' }, h('p', { class: 'prova-perg', text: qq.p }), figuraDaQuestao(qq), ops, retorno),
          h('div', { class: 'prova-rodape' }, responder));
        responder.focus({ preventScroll: true });
      }
      function fimRefazer() {
        var res = { acertos: acertos, total: i, nota: Math.round(100 * acertos / Math.max(1, i)), aprovado: false, refazer: true };
        caixa.replaceChildren(h('div', { class: 'prova-resultado nao' },
          h('b', { class: 'prova-nota', text: limite + ' erros seguidos' }),
          h('p', { text: 'A prova parou aqui e o módulo vai recomeçar. Isso não é castigo: é sinal de que alguns assuntos ainda não firmaram. Refaça as aulas com atenção na teoria e na leitura e volte para a prova.' }),
          h('p', { class: 'suave', text: 'Você acertou ' + acertos + ' de ' + i + ' questões respondidas.' })));
        if (opcoes.aoTerminar) opcoes.aoTerminar(res);
      }
      function fim() {
        var nota = Math.round(100 * acertos / qs.length), passou = nota >= minimo;
        if (passou) api.aprovado = true;
        caixa.replaceChildren(h('div', { class: 'prova-resultado ' + (passou ? 'ok' : 'nao') },
          h('b', { class: 'prova-nota', text: acertos + ' de ' + qs.length + ' (' + nota + '%)' }),
          h('p', { text: passou ? 'Aprovado! O próximo módulo está liberado. Finalize a aula para seguir.' : 'Ainda não foi desta vez (mínimo ' + minimo + '%). Revise os assuntos em que errou e tente de novo: as questões mudam a cada tentativa.' }),
          passou ? null : h('div', null, h('button', { type: 'button', class: 'botao', text: 'Tentar de novo', onclick: comecar }))));
        if (opcoes.aoTerminar) opcoes.aoTerminar({ acertos: acertos, total: qs.length, nota: nota, aprovado: passou });
      }
      mostrar();
    }
    intro();
    return api;
  }

  // ---------- Lição de teoria: explicação com exemplos na pauta + "Confira se entendeu" ----------
  // { tipo: 'teoria', titulo, blocos: [texto | { pauta: { clave, notas: [[midi|[midis]|null, tempos, rótulo]], compasso, armadura, bemois, tab, vozes }, legenda }],
  //   confira: [[pergunta, certa, errada…]], n }   opcoes.aoTerminar({ aprovado: true }) quando acerta todas.
  function pautaDoExemplo(p, opcoes) {
    var cordas = opcoes.instrumento === 'Violão' || opcoes.instrumento === 'Guitarra';
    var fontes = p.vozes || [{ clave: p.clave || 'sol', notas: p.notas || [] }];
    var vozes = fontes.map(function (f, k) {
      var b = 0;
      return { clave: f.clave || 'sol', eventos: f.notas.map(function (n, i) {
        var e = { b: b, dur: n[1] || 1, midis: n[0] == null ? null : [].concat(n[0]), chave: k + ':' + i, rotulo: n[2] };
        b += e.dur; return e;
      }) };
    });
    // exemplos com tablatura: as notas são as escritas; o som do violão fica uma oitava abaixo
    if (p.tab) vozes.forEach(function (vz) { vz.eventos.forEach(function (e) { if (e.midis) e.midis = e.midis.map(function (m) { return m - 12; }); }); });
    var cfg = { vozes: vozes, compasso: p.compasso || 4, semCompasso: !p.compasso, armadura: p.armadura || 0, bemois: !!p.bemois,
      transpor: p.tab ? 12 : 0, tab: p.tab ? function (m) { return posicaoNaRegiao(m, 0); } : null, rotulo: 'Exemplo na partitura' };
    var desenho = desenharPauta(cfg);
    function ouvir() {
      var c = audio(); if (!c || !vozes[0].eventos.length) return;
      var t0 = c.currentTime + 0.1, seg = 60 / 84;
      vozes.forEach(function (vz) {
        vz.eventos.forEach(function (e) {
          var t = t0 + e.b * seg;
          (e.midis || []).forEach(function (m) {
            var som = p.tab ? m : cordas ? m - 12 : m;
            if (cordas) somCorda(som, t, e.dur * seg, 0.6, opcoes.instrumento === 'Guitarra' ? 'aco' : 'nylon'); else somNota(som, t, e.dur * seg, 0.9, true);
          });
          setTimeout(function () { desenho.acender(e.chave, e.dur * seg); }, (t - c.currentTime) * 1000);
        });
      });
    }
    return { el: desenho.el, ouvir: ouvir, temSom: vozes.some(function (vz) { return vz.eventos.some(function (e) { return e.midis; }); }) };
  }
  function criarTeoria(v, opcoes) {
    opcoes = opcoes || {};
    var caixa = h('div', { class: 'teoria' }), api = { el: caixa, parar: function () {}, aprovado: false };
    caixa.appendChild(h('div', { class: 'teoria-cab' }, h('span', { class: 'rotulo', text: 'Teoria' }), h('h3', { class: 'teoria-titulo', text: v.titulo || '' })));
    var corpo = h('div', { class: 'teoria-corpo' });
    (v.blocos || []).forEach(function (b) {
      if (typeof b === 'string') { corpo.appendChild(h('p', { class: 'teoria-texto', text: b })); return; }
      if (b.pauta) {
        var ex = pautaDoExemplo(b.pauta, opcoes);
        corpo.appendChild(h('figure', { class: 'teoria-fig' }, h('div', { class: 'prova-pauta larga' }, ex.el),
          h('figcaption', null, b.legenda ? h('span', { text: b.legenda }) : null,
            ex.temSom ? h('button', { type: 'button', class: 'botao mini vazado', text: '▶ Ouvir', onclick: ex.ouvir }) : null)));
      }
    });
    caixa.appendChild(corpo);
    var perguntas = embaralhar(v.confira || []).slice(0, v.n || 3), certas = 0;
    if (!perguntas.length) { api.aprovado = true; return api; }
    var confira = h('section', { class: 'teoria-confira' }, h('h4', { text: 'Confira se entendeu' }),
      h('p', { class: 'pequeno suave', text: 'Acerte as ' + perguntas.length + ' perguntas para seguir. Errou? Releia o texto acima e tente outra opção.' }));
    var aviso = h('p', { class: 'teoria-ok', role: 'status', hidden: true, text: '✓ Muito bem! Você entendeu a lição. Pode seguir.' });
    perguntas.forEach(function (f) {
      var qq = questao(f[0], f[1], f.slice(2)), feito = false, ret = h('p', { class: 'prova-retorno' });
      var ops = h('div', { class: 'prova-opcoes' });
      qq.o.forEach(function (o, k) {
        ops.appendChild(h('button', { type: 'button', class: 'prova-op', text: o, onclick: function (e) {
          if (feito) return;
          var b = e.currentTarget;
          if (k === qq.c) {
            feito = true; b.classList.add('certa'); [].forEach.call(ops.children, function (x) { x.disabled = true; });
            ret.textContent = '✓ Certo!'; ret.className = 'prova-retorno ok'; certas++;
            if (certas === perguntas.length) { aviso.hidden = false; api.aprovado = true; if (opcoes.aoTerminar) opcoes.aoTerminar({ aprovado: true }); }
          } else { b.classList.add('errada'); b.disabled = true; ret.textContent = 'Ainda não. Releia a explicação e tente outra.'; ret.className = 'prova-retorno nao'; }
        } }));
      });
      confira.appendChild(h('div', { class: 'prova-q' }, h('p', { class: 'prova-perg', text: qq.p }), ops, ret));
    });
    confira.appendChild(aviso);
    caixa.appendChild(confira);
    return api;
  }

  // ---------- Tocador ----------
  var ativo = null; // só um exercício toca por vez

  // opcoes.instrumento: em 'Violão' e 'Guitarra' o som é de corda e o exercício aparece no braço, sem piano
  function criarPlayer(v, opcoes) {
    v = v || {}; opcoes = opcoes || {};
    if (v.tipo === 'prova') return criarProva(v, opcoes);
    if (v.tipo === 'teoria') return criarTeoria(v, opcoes);
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
    // partitura do exercício (v.pauta): cada nota acende na pauta enquanto toca; violão e guitarra ganham a tablatura
    var pauta = null, areaPauta = null;
    if (v.pauta && tipo === 'notas' && (v.demo || v.maos)) {
      pauta = pautaDoExercicio(v, de, { cordas: cordas, posicao: function (m) { return posicaoNaRegiao(m, base); } });
      areaPauta = h('div', { class: 'voc-pauta' }, pauta.el);
    }
    function acenderPauta(e) { if (pauta) pauta.acender((e.mao || 'U') + ':' + e.i, e.dur * 60 / bpm); }
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
          acenderPauta(e);
          grande.textContent = v.ocultar || v.leitura ? '♪' : e.rotulo || (pos ? NOMES[pc(e.midi)] + ' · ' + pos.corda + 'ª corda, ' + (pos.casa ? 'casa ' + pos.casa : 'solta') : NOMES[pc(e.midi)]);
        });
      } else if (e.tipo === 'nota') {
        somNota(e.midi, t, e.dur * seg, 1, !!v.demo);
        vis(function () {
          if (comMaos && e.dedo) mostrarDedos([{ midi: e.midi, dedo: e.dedo, mao: e.mao }], e.dur * 60 / bpm);
          else if (piano) piano.acender(e.midi, e.dur * 60 / bpm);
          acenderPauta(e);
          if (v.demo) grande.textContent = v.ocultar || v.leitura ? '♪' : e.rotulo || NOMES[pc(e.midi)];
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
          destacarChip(e.nome); destacarMapa(e.nome);
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
      if (pauta) pauta.limpar();
      destacarBraco(null); destacarChip(null); destacarMapa(null); estadoInicialBraco(); estadoInicialMaos();
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
    if (areaPauta) caixa.appendChild(areaPauta);
    if (usaBraco) { caixa.appendChild(areaBraco); desenharBracoH(); }
    else if (tipo === 'acordes' || v.diagrama) { caixa.appendChild(areaBraco); desenharBracos(); }
    // Mapa dos acordes: tudo à vista antes de tocar (notas, dedos, função de cada nota, grau)
    var cartoes = [], areaMapa = null;
    if (tipo === 'acordes' && !v.ocultar) {
      var tomGeral = v.tom != null ? v.tom : inferirTom(v.acordes || []);
      var vistos = {};
      var fila = h('div', { class: 'mapa-fila' });
      (v.acordes || []).forEach(function (a, ia, lista) {
        var midis = cordas ? (notasDoBraco(a[0]) || notasDoAcorde(v, a)) : notasDoAcorde(v, a);
        var chaveA = a[0] + '|' + midis.join(','); if (vistos[chaveA]) return; vistos[chaveA] = 1;
        if (midis.length < 2) return;
        var c = lerCifra(a[0]), raiz = c || { letra: null, pc: pc(Math.min.apply(null, midis)), q: '' };
        if (!c) raiz = null;
        var prox = lista[ia + 1] && lerCifra(lista[ia + 1][0]);
        var ge = grauEFuncao(c, a[4] != null ? a[4] : tomGeral, prox);
        var cartao = h('div', { class: 'mapa-cartao' });
        cartao.appendChild(h('div', { class: 'mapa-cab' }, h('b', { class: 'mapa-cifra', text: a[0] }),
          h('button', { type: 'button', class: 'link-botao mapa-ouvir', 'aria-label': 'Ouvir ' + a[0], text: '▶ Ouvir', onclick: function () {
            if (cordas) tocarAcordeNoBraco(a[0], 0, 1.6); else midis.forEach(function (m) { somNota(m, 0, 1.4, 0.5, true); });
          } })));
        if (ge) cartao.appendChild(h('div', { class: 'mapa-grau' }, h('b', { text: ge.grau }), ' · ' + ge.funcao));
        var dg = cordas ? [] : dedilharAcorde(midis, a[3]);
        if (cordas && diagramaDe(a[0])) cartao.appendChild(h('div', { class: 'mapa-desenho braco-mini' }, desenharBraco(diagramaDe(a[0]))));
        else {
          var lo = Math.min.apply(null, midis) - 2, hi = Math.max.apply(null, midis) + 2;
          if (hi - lo < 14) hi = lo + 14;
          var mini = criarTeclado(lo, hi, function (m) { somNota(m, 0, 0.6, 1, true); mini.acender(m, 0.4); }, false);
          mini.marcar(midis); mini.rotular(dg);
          cartao.appendChild(h('div', { class: 'mapa-desenho' }, mini.el));
        }
        // tabela: da nota mais aguda para a mais grave (como se lê na partitura)
        var tab = h('table', { class: 'mapa-tabela' }, h('thead', null, h('tr', null, h('th', { text: 'Nota' }), h('th', { text: cordas ? 'Corda' : 'Dedo' }), h('th', { text: 'Função' }))));
        var corpo = h('tbody');
        var ordem = midis.slice().sort(function (x, y) { return y - x; }), d = DIAGRAMAS[a[0]];
        var temFund = midis.some(function (m) { return raiz && pc(m) === raiz.pc; });
        ordem.forEach(function (m) {
          var f = raiz ? funcaoNota((pc(m) - raiz.pc + 12) % 12, raiz.q) : ['', 1];
          var onde = '';
          if (cordas && d) { for (var i = 0; i < 6; i++) if (d.f[i] !== 'x' && CORDAS_SOLTAS[i] + Number(d.f[i]) === m) { onde = (6 - i) + 'ª ' + (d.f[i] === '0' ? 'solta' : 'casa ' + d.f[i] + (d.d[i] !== '-' ? ' · dedo ' + d.d[i] : '')); break; } }
          else { var x = dg.filter(function (n) { return n.midi === m; })[0]; if (x) onde = (x.mao === 'E' ? 'ME ' : 'MD ') + x.dedo; }
          corpo.appendChild(h('tr', null, h('td', { text: escreverNota(m, raiz, f[1]) }), h('td', { class: onde.indexOf('ME') === 0 ? 'me' : onde.indexOf('MD') === 0 ? 'md' : null, text: onde }), h('td', { text: f[0] })));
        });
        tab.appendChild(corpo); cartao.appendChild(tab);
        if (raiz && c && !temFund) cartao.appendChild(h('p', { class: 'mapa-obs', text: 'Sem a fundamental (' + escreverNota(raiz.pc + 48, raiz, 1).replace(/-?\d+$/, '') + '): ela fica com o baixista.' }));
        if (c && c.baixo) cartao.appendChild(h('p', { class: 'mapa-obs', text: 'Baixo em ' + LETRA_PT[c.baixo[0]] + (c.baixo[1] === 'b' ? '♭' : c.baixo[1] === '#' ? '♯' : '') + ' (acorde invertido).' }));
        cartoes.push({ nome: a[0], el: cartao });
        fila.appendChild(cartao);
      });
      if (cartoes.length) {
        areaMapa = h('div', { class: 'mapa' },
          h('div', { class: 'mapa-titulo' }, h('b', { text: 'Mapa dos acordes' }), h('span', { class: 'pequeno suave', text: ' · estude antes de tocar' + (cartoes.length > 1 ? ' (deslize para o lado)' : '') })),
          fila);
      }
    }
    function destacarMapa(nome) {
      cartoes.forEach(function (c) {
        var atual = c.nome === nome; c.el.classList.toggle('atual', atual);
        if (atual && c.el.parentNode) { var f = c.el.parentNode; f.scrollTo({ left: c.el.offsetLeft - f.offsetLeft - 8, behavior: 'smooth' }); }
      });
    }

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
    if (areaMapa) caixa.appendChild(areaMapa);

    var api = { el: caixa, parar: function () { if (tocando) parar(); } };
    return api;
  }

  window.AmaralCanto = {
    criarPlayer: criarPlayer, PADROES: PADROES, nomeNota: nomeNota, notasDaCifra: notasDaCifra,
    DIAGRAMAS: DIAGRAMAS, liberarSom: liberarSom, desenharPauta: desenharPauta, gerarQuestao: gerarQuestao, lerAcorde: function (c) { return lerAcorde(c); }, pararTudo: function () { if (ativo) ativo.parar(); }
  };
})();

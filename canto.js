// Canto: piano na tela, metrônomo e tocador de vocalizes da área do aluno.
// Um exercício com piano fica guardado no item da rotina, no campo "vocalize":
//   { tipo: 'notas', silaba, padrao: [[semitom|null, tempos], ...], de, ate, direcao, bpm, acorde }
//   { tipo: 'respiracao', fases: [[texto, tempos], ...], repeticoes, bpm }
//   { tipo: 'piano', de, ate }
// Os tons (de/ate) são da voz feminina; a voz masculina toca uma oitava abaixo.
(function () {
  'use strict';

  var NOMES = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si'];
  function nomeNota(midi) { return NOMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1); }
  function ehPreta(midi) { return [1, 3, 6, 8, 10].indexOf(((midi % 12) + 12) % 12) >= 0; }

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
    intervalos: { nome: 'Intervalos (1-3, 1-5, 1-8)', padrao: [[0, 1], [4, 1], [0, 1], [7, 1], [0, 1], [12, 2]] }
  };

  // ---------- As 4 aulas de canto prontas ----------
  function notas(padrao, silaba, de, ate, direcao, bpm) {
    return { tipo: 'notas', padrao: PADROES[padrao].padrao, silaba: silaba, de: de, ate: ate, direcao: direcao, bpm: bpm, acorde: true };
  }
  function resp(fases, repeticoes, bpm) { return { tipo: 'respiracao', fases: fases, repeticoes: repeticoes, bpm: bpm }; }

  var AULAS = [
    {
      titulo: 'Canto · Aula 1: Respiração e apoio', instrumento: 'Canto coral', nivel: 'Iniciante',
      observacao: 'Faça em pé, com calma. O metrônomo marca o tempo de cada fase: siga a contagem na tela.',
      itens: [
        { texto: 'Postura: pés na largura dos ombros, joelhos soltos, ombros baixos. Mão na barriga: ao inspirar a barriga sai e os ombros não sobem.', minutos: 3 },
        { texto: 'Respiração 4-4-8: inspire, segure e solte em "sss" bem controlado', minutos: 4,
          vocalize: resp([['Inspire pelo nariz', 4], ['Segure, sem travar a garganta', 4], ['Solte em "sss" contínuo', 8]], 6, 60) },
        { texto: 'Pulsos de apoio: um "ts" curto em cada tempo, a barriga empurra o ar', minutos: 3,
          vocalize: resp([['Inspire', 4], ['"Ts" a cada tempo', 8], ['Descanse', 4]], 5, 72) },
        { texto: 'Respiração 4-4-12: a saída fica mais longa', minutos: 3,
          vocalize: resp([['Inspire pelo nariz', 4], ['Segure', 4], ['Solte em "fff" bem devagar', 12]], 4, 60) },
        { texto: 'Vibração de lábios (brrr) em 5 notas, sem empurrar o ar', minutos: 4,
          vocalize: notas('cinco', 'Brrr (lábios)', 60, 65, 'subir-descer', 92) },
        { texto: 'Nota longa em "u" com apoio: segure até o fim sem a voz tremer', minutos: 3,
          vocalize: notas('longa', 'Uuu', 60, 67, 'subir', 66) }
      ]
    },
    {
      titulo: 'Canto · Aula 2: Afinação', instrumento: 'Canto coral', nivel: 'Iniciante',
      observacao: 'Ouça antes de cantar. Se a nota não "encaixar", pare, toque a tecla na tela e tente de novo.',
      itens: [
        { texto: 'Ouça e repita: o piano toca, você canta a mesma nota no silêncio', minutos: 4,
          vocalize: notas('eco', 'Lá', 60, 65, 'subir', 84) },
        { texto: '3 notas em "Lu", devagar, junto com o piano', minutos: 4,
          vocalize: notas('tres', 'Lu', 60, 67, 'subir-descer', 76) },
        { texto: 'Arpejo 1-3-5-3-1 em "Mi"', minutos: 4,
          vocalize: notas('arpejo', 'Mi', 60, 67, 'subir-descer', 80) },
        { texto: 'Intervalos: terça, quinta e oitava em "Ná"', minutos: 4,
          vocalize: notas('intervalos', 'Ná', 60, 64, 'subir', 72) },
        { texto: 'Grave no celular você cantando o arpejo e compare com o piano. Anote onde a nota ficou baixa ou alta.', minutos: 3 },
        { texto: 'Teclado livre: toque uma nota, cante e confira se encaixou', minutos: 2,
          vocalize: { tipo: 'piano', de: 53, ate: 76 } }
      ]
    },
    {
      titulo: 'Canto · Aula 3: Resistência', instrumento: 'Canto coral', nivel: 'Intermediário',
      observacao: 'Resistência vem do apoio, não da garganta. Se arranhar ou cansar, pare e beba água.',
      itens: [
        { texto: 'Vibração de lábios na escala de 9 notas', minutos: 4,
          vocalize: notas('nove', 'Brrr (lábios)', 60, 65, 'subir-descer', 80) },
        { texto: 'Staccato no arpejo em "Ha": curto, com a barriga', minutos: 4,
          vocalize: notas('staccato', 'Ha (curto)', 60, 65, 'subir', 96) },
        { texto: 'Arpejo com oitava em "Nó", ligado', minutos: 4,
          vocalize: notas('oitava', 'Nó', 60, 67, 'subir-descer', 88) },
        { texto: 'Nota longa em "Ah": comece fraco, cresça e volte a diminuir (messa di voce)', minutos: 4,
          vocalize: notas('longa8', 'Ah (fraco → forte → fraco)', 60, 65, 'subir', 60) },
        { texto: '5 notas rápidas em "Mi-é-á" (agilidade)', minutos: 4,
          vocalize: notas('rapido', 'Mi-é-á', 60, 67, 'subir-descer', 112) },
        { texto: 'Desaquecer: 2 minutos de vibração de lábios no grave e um copo de água.', minutos: 2 }
      ]
    },
    {
      titulo: 'Canto · Aula 4: Tessitura e extensão', instrumento: 'Canto coral', nivel: 'Intermediário',
      observacao: 'Extensão se ganha aos poucos. Vá só até onde a voz sai sem apertar; em "Até o tom" você ajusta o limite.',
      itens: [
        { texto: 'Sirene em "u": deslize do grave ao agudo e volte, como uma sirene, sem forçar', minutos: 2 },
        { texto: 'Salto de quinta em "Ná", ligando as notas', minutos: 4,
          vocalize: notas('quinta', 'Ná-á-á', 55, 67, 'subir', 80) },
        { texto: 'Arpejo com oitava em "Ia" subindo de meio em meio tom', minutos: 5,
          vocalize: notas('oitava', 'Ia', 57, 65, 'subir', 92) },
        { texto: 'Descendo do 5 em "Ah" para explorar o grave', minutos: 4,
          vocalize: notas('desce', 'Ah', 62, 55, 'descer', 84) },
        { texto: 'Ache sua extensão: no teclado, encontre a nota mais grave e a mais aguda que você canta confortável', minutos: 3,
          vocalize: { tipo: 'piano', de: 48, ate: 79 } },
        { texto: 'Conte na Comunidade sua nota mais grave e a mais aguda. Repita todo mês e compare.', minutos: 2 }
      ]
    }
  ];

  // ---------- Som (síntese, sem arquivos externos) ----------
  var ctx = null, saida = null;
  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      var comp = ctx.createDynamicsCompressor();
      saida = ctx.createGain(); saida.gain.value = 0.8;
      saida.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // Piano com harmônicos + uma voz-guia suave que sustenta a nota enquanto o aluno canta
  function somNota(midi, quando, dur, volume) {
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
    if (dur) {
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
  function svgEl(tag, attrs) { var e = document.createElementNS(SVG, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }
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
      if (todosNomes || m % 12 === 0) {
        var t = svgEl('text', { x: i * L + L / 2, y: H - 8, class: 'nome' });
        t.textContent = todosNomes ? NOMES[m % 12] : nomeNota(m);
        svg.appendChild(t);
      }
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

  // ---------- Montagem da sequência (em tempos) ----------
  function tonicas(de, ate, direcao) {
    var l = [], m;
    if (direcao === 'descer') { for (m = de; m >= ate; m--) l.push(m); return l; }
    for (m = de; m <= ate; m++) l.push(m);
    if (direcao === 'subir-descer') for (m = ate - 1; m >= de; m--) l.push(m);
    return l;
  }
  function montar(v, de, ate) {
    var ev = [], b = 0, i;
    for (i = 0; i < 4; i++) { ev.push({ b: i, tipo: 'clique', forte: i === 0 }); ev.push({ b: i, tipo: 'texto', txt: 'Prepare-se… ' + (4 - i) }); }
    b = 4;
    if (v.tipo === 'respiracao') {
      var reps = Math.max(1, Number(v.repeticoes) || 1);
      for (var r = 0; r < reps; r++) {
        (v.fases || []).forEach(function (f) {
          var n = Math.max(1, Number(f[1]) || 1);
          for (var j = 0; j < n; j++) {
            ev.push({ b: b, tipo: 'clique', forte: j === 0 });
            ev.push({ b: b, tipo: 'fase', txt: f[0], n: j + 1, total: n, rep: r + 1, reps: reps });
            b++;
          }
        });
      }
    } else {
      var ts = tonicas(de, ate, v.direcao);
      ts.forEach(function (t, k) {
        var ini = b, notasTom = [];
        (v.padrao || []).forEach(function (p) { if (p[0] != null) notasTom.push(t + p[0]); });
        ev.push({ b: b, tipo: 'tom', tonica: t, k: k + 1, total: ts.length, notas: notasTom });
        if (v.acorde !== false) { ev.push({ b: b, tipo: 'acorde', midis: [t - 12, t, t + 4, t + 7], dur: 1.6 }); b += 2; }
        (v.padrao || []).forEach(function (p) {
          if (p[0] != null) ev.push({ b: b, tipo: 'nota', midi: t + p[0], dur: p[1] });
          b += Number(p[1]) || 1;
        });
        b = Math.ceil(b + 1); // um tempo para respirar
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
    var voz = lerPref('voz', 'f');
    var desloc = function () { return voz === 'm' ? -12 : 0; };
    var bpm = Math.min(200, Math.max(30, Number(v.bpm) || 80));
    var metro = lerPref('metronomo', '1') === '1';
    var de = Number(v.de) || 60, ate = Number(v.ate) || 65;
    var ref = { de: de, ate: ate };
    var tocando = false, eventos = [], idx = 0, ancB = 0, ancT = 0, timer = null, raf = null, visuais = [], piano = null;

    var caixa = h('div', { class: 'voc' });
    var tomEl = h('b', { class: 'voc-tom', text: '' });
    var silEl = h('span', { class: 'voc-silaba', text: v.silaba ? 'Cante: ' + v.silaba : '' });
    var grande = h('div', { class: 'voc-grande', 'aria-live': 'polite', text: tipo === 'piano' ? 'Toque nas teclas para ouvir' : 'Toque em Começar' });
    var pulso = h('span', { class: 'voc-pulso', 'aria-hidden': 'true' });
    var areaPiano = h('div', { class: 'voc-piano' });
    var btn = h('button', { type: 'button', class: 'botao mini', text: '▶ Começar' });
    var bpmIn = h('input', { type: 'range', min: '40', max: '160', step: '2', value: String(bpm), 'aria-label': 'Andamento' });
    var bpmTxt = h('span', { class: 'pequeno', text: bpm + ' bpm' });
    var metroIn = h('input', { type: 'checkbox', checked: metro });
    var vozSel = h('select', { 'aria-label': 'Tipo de voz' },
      h('option', { value: 'f', text: 'Voz feminina / infantil', selected: voz === 'f' }),
      h('option', { value: 'm', text: 'Voz masculina (oitava abaixo)', selected: voz === 'm' }));
    var deSel = h('select', { 'aria-label': 'Começar no tom' }), ateSel = h('select', { 'aria-label': 'Ir até o tom' });

    function faixaTons() { return { lo: 43 + desloc(), hi: 79 + desloc() }; }
    function preencherTons() {
      var f = faixaTons();
      opcoesNotas(deSel, f.lo, f.hi, ref.de + desloc());
      opcoesNotas(ateSel, f.lo, f.hi, ref.ate + desloc());
    }
    function desenharPiano() {
      var lo, hi;
      if (tipo === 'piano') { lo = de + desloc(); hi = ate + desloc(); }
      else if (tipo === 'notas') {
        var tons = tonicas(ref.de + desloc(), ref.ate + desloc(), v.direcao), offs = (v.padrao || []).map(function (p) { return p[0]; }).filter(function (s) { return s != null; });
        var minO = Math.min.apply(null, offs.concat([0])), maxO = Math.max.apply(null, offs.concat([0]));
        lo = Math.min.apply(null, tons) + minO; hi = Math.max.apply(null, tons) + maxO;
        if (hi - lo < 16) hi = lo + 16;
      } else { lo = 60 + desloc(); hi = 76 + desloc(); }
      piano = criarTeclado(lo, hi, function (m) { somNota(m, 0, 0.6); piano.acender(m, 0.4); }, tipo === 'piano');
      areaPiano.replaceChildren(piano.el);
    }

    // --- agendamento (lookahead de 0,12 s) ---
    function tempoDe(b) { return ancT + (b - ancB) * 60 / bpm; }
    function agendar(e) {
      var t = tempoDe(e.b), seg = 60 / bpm;
      if (e.tipo === 'clique') {
        if (metro) clique(t, e.forte);
        visuais.push({ t: t, f: function () { pulso.classList.remove('bate'); void pulso.offsetWidth; pulso.classList.add('bate'); pulso.classList.toggle('forte', e.forte); } });
      } else if (e.tipo === 'nota') {
        somNota(e.midi, t, e.dur * seg);
        visuais.push({ t: t, f: function () { piano.acender(e.midi, e.dur * 60 / bpm); } });
      } else if (e.tipo === 'acorde') {
        e.midis.forEach(function (m) { somNota(m, t, e.dur * seg, 0.55); });
        visuais.push({ t: t, f: function () { e.midis.forEach(function (m) { piano.acender(m, e.dur * 60 / bpm); }); grande.textContent = 'Respire…'; } });
      } else if (e.tipo === 'tom') {
        visuais.push({ t: t, f: function () {
          tomEl.textContent = 'Tom: ' + nomeNota(e.tonica) + ' · ' + e.k + ' de ' + e.total;
          piano.marcar(e.notas);
          if (v.acorde === false) grande.textContent = v.silaba || 'Cante';
        } });
        if (v.acorde !== false) visuais.push({ t: t + 2 * seg, f: function () { grande.textContent = v.silaba || 'Cante'; } });
      } else if (e.tipo === 'texto') {
        visuais.push({ t: t, f: function () { grande.textContent = e.txt; } });
      } else if (e.tipo === 'fase') {
        visuais.push({ t: t, f: function () {
          grande.textContent = e.txt + ' · ' + e.n;
          tomEl.textContent = 'Repetição ' + e.rep + ' de ' + e.reps;
        } });
      } else if (e.tipo === 'fim') {
        visuais.push({ t: t, f: function () { parar(); grande.textContent = 'Muito bem! Marque o exercício como feito.'; } });
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
      grande.textContent = 'Toque em Começar'; tomEl.textContent = '';
      if (ctx && saida) { // corta o que já estava agendado
        var antiga = saida; saida = ctx.createGain(); saida.gain.value = 0.8;
        var comp = ctx.createDynamicsCompressor(); saida.connect(comp); comp.connect(ctx.destination);
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
    caixa.appendChild(h('div', { class: 'voc-visor' }, tipo !== 'piano' ? pulso : null, grande));
    if (tipo !== 'respiracao') caixa.appendChild(areaPiano);
    var ctrl = h('div', { class: 'voc-controles' });
    if (tipo !== 'piano') {
      ctrl.appendChild(btn);
      ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: 'Andamento' }), bpmIn, bpmTxt));
      ctrl.appendChild(h('label', { class: 'voc-check' }, metroIn, ' Metrônomo'));
    }
    if (tipo !== 'respiracao') ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: 'Voz' }), vozSel));
    if (tipo === 'notas') {
      preencherTons();
      ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: v.direcao === 'descer' ? 'Começar em' : 'Do tom' }), deSel));
      ctrl.appendChild(h('label', { class: 'voc-campo' }, h('span', { text: 'Até o tom' }), ateSel));
    }
    caixa.appendChild(ctrl);
    if (tipo !== 'respiracao') desenharPiano();

    var api = { el: caixa, parar: function () { if (tocando) parar(); } };
    return api;
  }

  window.AmaralCanto = { criarPlayer: criarPlayer, AULAS: AULAS, PADROES: PADROES, nomeNota: nomeNota, pararTudo: function () { if (ativo) ativo.parar(); } };
})();

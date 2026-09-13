/* =========================================================
   WATERLOO CRYPTO — v0.1
   Everything below is dependency-free vanilla JS.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HEX = '0123456789abcdef';
  const rhex = (n) => { let s = ''; for (let i = 0; i < n; i++) s += HEX[(Math.random() * 16) | 0]; return s; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const irand = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmt = (n) => n.toLocaleString('en-US');
  const GOLD = '#f2c230';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- visibility-aware canvas loop ---------- */
  function canvasLoop(canvas, draw, onResize) {
    const ctx = canvas.getContext('2d');
    const s = { w: 0, h: 0, dpr: 1, visible: false, running: false };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = r.width; s.h = r.height;
      canvas.width = Math.max(1, Math.round(r.width * s.dpr));
      canvas.height = Math.max(1, Math.round(r.height * s.dpr));
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      onResize && onResize(s);
      if (reduced || !s.running) draw(ctx, s, performance.now());
    };
    new ResizeObserver(resize).observe(canvas);
    const frame = (t) => {
      if (!s.visible || reduced) { s.running = false; return; }
      draw(ctx, s, t);
      requestAnimationFrame(frame);
    };
    new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (s.visible && !s.running && !reduced) { s.running = true; requestAnimationFrame(frame); }
    }, { rootMargin: '120px' }).observe(canvas);
    return s;
  }

  /* visibility flag for DOM-driven loops */
  function watchVisible(el, cb) {
    const state = { visible: false };
    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; cb && cb(state.visible); }, { rootMargin: '80px' }).observe(el);
    return state;
  }

  /* =========================================================
     TEXT SCRAMBLE
     ========================================================= */
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@';
  function scramble(el, duration = 1100) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    if (reduced) { el.textContent = final; return; }
    const q = [...final].map((ch) => ({ ch, end: 0.25 + Math.random() * 0.75 }));
    const upper = final === final.toUpperCase();
    const start = performance.now();
    const tick = (now) => {
      const p = (now - start) / duration;
      let out = '';
      for (const c of q) {
        if (c.ch === ' ' || p >= c.end) out += c.ch;
        else { const g = GLYPHS[(Math.random() * GLYPHS.length) | 0]; out += upper ? g : g.toLowerCase(); }
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
    };
    requestAnimationFrame(tick);
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    const el = $('#boot'), bar = $('#bootBar'), pct = $('#bootPct'), hash = $('#bootHash');
    const MS = reduced ? 0 : 1250;
    const t0 = performance.now();
    let finished = false;
    document.body.classList.add('booting');
    const finish = () => {
      if (finished) return; finished = true;
      el.classList.add('done');
      document.body.classList.remove('booting');
      document.body.classList.add('ready');
      setTimeout(() => $$('.hero-title [data-scramble]').forEach((w, i) => setTimeout(() => scramble(w, 1300), i * 140)), 150);
    };
    el.addEventListener('click', finish);
    const tick = (now) => {
      const p = MS ? clamp((now - t0) / MS, 0, 1) : 1;
      const e = 1 - Math.pow(1 - p, 3);
      bar.style.width = (e * 100).toFixed(1) + '%';
      pct.textContent = String(Math.round(e * 100)).padStart(3, '0') + '%';
      hash.textContent = '0x' + rhex(16);
      if (p < 1 && !finished) requestAnimationFrame(tick); else setTimeout(finish, 120);
    };
    requestAnimationFrame(tick);
  }

  /* =========================================================
     NAV · PROGRESS · ACTIVE SECTION · MENU
     ========================================================= */
  function nav() {
    const navEl = $('#nav'), bar = $('#progress');
    const onScroll = () => {
      const y = window.scrollY;
      navEl.classList.toggle('scrolled', y > 20);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const links = $$('[data-nav]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((l) => l.classList.toggle('active', l.dataset.nav === e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((l) => { const s = document.getElementById(l.dataset.nav); s && io.observe(s); });

    const btn = $('#menuBtn'), menu = $('#navLinks');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open);
      menu.classList.toggle('open', open);
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); }
    });
  }

  /* =========================================================
     REVEAL + SCRAMBLE ON VIEW
     ========================================================= */
  function reveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-scramble]', e.target).forEach((s) => { if (!s.closest('.hero-title')) scramble(s, 1000); });
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal, .card-shell, .tl-rail').forEach((el) => io.observe(el));
  }

  /* =========================================================
     LIVE ETHEREUM BLOCK HEIGHT (public RPC, falls back to estimate)
     ========================================================= */
  const chain = { block: null, live: false };
  function blockTicker() {
    const RPCS = ['https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com', 'https://cloudflare-eth.com'];
    const el = $('#blockNum'), foot = $('#footBlock');
    const estimate = () => Math.floor(21525000 + (Date.now() - Date.UTC(2025, 0, 1)) / 12000);
    async function fetchBlock() {
      for (const url of RPCS) {
        try {
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), 4000);
          const r = await fetch(url, {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }), signal: ctrl.signal,
          });
          clearTimeout(to);
          const j = await r.json();
          if (j && j.result) return parseInt(j.result, 16);
        } catch (_) { /* try next */ }
      }
      return null;
    }
    const render = () => {
      const txt = (chain.live ? '#' : '≈#') + fmt(chain.block);
      if (el.textContent !== txt) {
        el.textContent = txt; foot.textContent = fmt(chain.block);
        el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 600);
      }
      el.parentElement.title = chain.live ? 'Ethereum mainnet block height (live)' : 'Ethereum mainnet block height (estimated)';
    };
    chain.block = estimate(); render();
    const update = async () => {
      const b = await fetchBlock();
      if (b) { chain.block = b; chain.live = true; } else if (!chain.live) { chain.block = estimate(); }
      render();
    };
    update();
    setInterval(update, 12000);
  }

  /* =========================================================
     HERO — OMNICHAIN GLOBE
     ========================================================= */
  function globe() {
    const canvas = $('#globe');
    const N = innerWidth < 720 ? 750 : 1500;
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    const nodeIdx = []; for (let i = 7; i < N; i += 43) nodeIdx.push(i);
    const arcs = [];
    let rotY = 0.6, mx = 0, my = 0, tmx = 0, tmy = 0, lastSpawn = 0;
    addEventListener('pointermove', (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });

    const slerp = (a, b, u, om) => {
      const so = Math.sin(om) || 1e-6;
      const k1 = Math.sin((1 - u) * om) / so, k2 = Math.sin(u * om) / so;
      return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    };
    const spawn = (t) => {
      for (let tries = 0; tries < 12; tries++) {
        const a = pts[pick(nodeIdx)], b = pts[pick(nodeIdx)];
        const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        if (d < 0.9 && d > -0.35) { arcs.push({ a, b, om: Math.acos(d), t0: t, dur: rand(1500, 2600) }); return; }
      }
    };

    canvasLoop(canvas, (ctx, s, t) => {
      const { w, h } = s;
      ctx.clearRect(0, 0, w, h);
      const mobile = w < 720;
      const cx = mobile ? w * 0.5 : w * 0.67;
      const cy = mobile ? h * 0.36 : h * 0.5;
      const R = mobile ? Math.min(w * 0.52, h * 0.34) : Math.min(w * 0.3, h * 0.39);
      mx = lerp(mx, tmx, 0.04); my = lerp(my, tmy, 0.04);
      rotY += 0.0017;
      const ay = rotY + mx * 0.9, ax = -0.38 + my * 0.35;
      const cya = Math.cos(ay), sya = Math.sin(ay), cxa = Math.cos(ax), sxa = Math.sin(ax);
      const P = 3;
      const proj = (x, y, z, rad = 1) => {
        x *= rad; y *= rad; z *= rad;
        const x1 = x * cya + z * sya, z1 = -x * sya + z * cya;
        const y1 = y * cxa - z1 * sxa, z2 = y * sxa + z1 * cxa;
        const sc = P / (P - z2);
        return [cx + x1 * R * sc, cy + y1 * R * sc, z2];
      };

      // halo
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
      g.addColorStop(0, 'rgba(242,194,48,0.07)'); g.addColorStop(0.6, 'rgba(242,194,48,0.02)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // orbit rings
      const rings = [[1.38, 0.9, 0.2], [1.62, -0.5, 1.1], [1.9, 0.25, 2.2]];
      rings.forEach(([rr, tilt, phase], ri) => {
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        let prev = null;
        for (let k = 0; k <= 120; k++) {
          const a = (k / 120) * Math.PI * 2;
          const x = Math.cos(a), z = Math.sin(a);
          const p = proj(x, z * st, z * ct, rr);
          if (prev) {
            ctx.strokeStyle = `rgba(255,255,255,${p[2] > 0 ? 0.13 : 0.04})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
          }
          prev = p;
        }
        const sa = t * 0.00025 * (ri + 1) + phase;
        const sp = proj(Math.cos(sa), Math.sin(sa) * st, Math.sin(sa) * ct, rr);
        ctx.fillStyle = sp[2] > 0 ? GOLD : 'rgba(242,194,48,.35)';
        ctx.fillRect(sp[0] - 2, sp[1] - 2, 4, 4);
      });

      // sphere points
      ctx.fillStyle = '#fff';
      for (let i = 0; i < N; i++) {
        const q = pts[i];
        const p = proj(q[0], q[1], q[2]);
        const d = (p[2] + 1) / 2;
        ctx.globalAlpha = 0.05 + 0.8 * d * d;
        const sz = 0.7 + 1.5 * d;
        ctx.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      // nodes
      for (const i of nodeIdx) {
        const q = pts[i], p = proj(q[0], q[1], q[2]);
        if (p[2] < -0.1) continue;
        ctx.fillStyle = `rgba(242,194,48,${0.35 + 0.6 * (p[2] + 0.1)})`;
        ctx.fillRect(p[0] - 1.8, p[1] - 1.8, 3.6, 3.6);
      }

      // arcs (cross-chain messages)
      if (t - lastSpawn > 320 && arcs.length < 16) { spawn(t); lastSpawn = t; }
      for (let k = arcs.length - 1; k >= 0; k--) {
        const A = arcs[k];
        const L = (t - A.t0) / A.dur;
        const head = Math.min(L, 1), tail = clamp(L - 0.55, 0, 1);
        if (tail >= 1) { arcs.splice(k, 1); continue; }
        const lift = 0.1 + 0.32 * (A.om / Math.PI);
        const STEPS = 34;
        let prev = null;
        for (let i = 0; i <= STEPS; i++) {
          const u = tail + (head - tail) * (i / STEPS);
          const v = slerp(A.a, A.b, u, A.om);
          const p = proj(v[0], v[1], v[2], 1 + lift * Math.sin(Math.PI * u));
          if (prev) {
            const f = i / STEPS;
            ctx.strokeStyle = `rgba(242,194,48,${(p[2] > -0.2 ? 0.75 : 0.18) * f})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
          }
          prev = p;
        }
        if (L < 1 && prev) {
          ctx.fillStyle = 'rgba(255,240,200,0.95)';
          ctx.beginPath(); ctx.arc(prev[0], prev[1], 2, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(242,194,48,0.25)';
          ctx.beginPath(); ctx.arc(prev[0], prev[1], 6, 0, 7); ctx.fill();
        }
        if (L >= 1 && L < 1.5) {
          const pb = proj(A.b[0], A.b[1], A.b[2]);
          if (pb[2] > -0.1) {
            const e = (L - 1) / 0.5;
            ctx.strokeStyle = `rgba(242,194,48,${0.8 * (1 - e)})`;
            ctx.beginPath(); ctx.arc(pb[0], pb[1], 3 + e * 22, 0, 7); ctx.stroke();
          }
        }
      }
    });
  }

  /* =========================================================
     01 · ONCHAIN — PEER GRAPH
     ========================================================= */
  function network() {
    const canvas = $('#network'), label = $('#peerCount');
    const NAMES = ['alice.eth', 'bob.eth', 'carol.eth', 'mentor.eth', 'hacker.eth', 'founder.eth', 'validator.eth', 'dave.eth', 'erin.eth', 'frank.eth'];
    let nodes = [], pulses = [], ripples = [], links = [];
    let mouse = null, frame = 0, lastPulse = 0, lastRipple = 0;

    canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    canvas.addEventListener('pointerleave', () => { mouse = null; });

    const build = (s) => {
      const n = clamp(Math.round((s.w * s.h) / 6500), 28, 88);
      nodes = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * s.w, y: Math.random() * s.h,
        vx: rand(-0.28, 0.28), vy: rand(-0.28, 0.28),
        r: rand(1.2, 2.6), label: i < NAMES.length ? NAMES[i] : null, glow: 0,
      }));
    };

    canvasLoop(canvas, (ctx, s, t) => {
      const { w, h } = s;
      if (!nodes.length) build(s);
      ctx.clearRect(0, 0, w, h);
      const D = Math.min(150, w * 0.2);

      for (const n of nodes) {
        if (mouse) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < 180 && d > 1) { n.vx += (dx / d) * 0.012; n.vy += (dy / d) * 0.012; }
        }
        n.vx *= 0.995; n.vy *= 0.995;
        const sp = Math.hypot(n.vx, n.vy);
        if (sp < 0.12) { n.vx += rand(-0.03, 0.03); n.vy += rand(-0.03, 0.03); }
        if (sp > 0.9) { n.vx *= 0.9; n.vy *= 0.9; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) { n.vx *= -1; n.x = clamp(n.x, 0, w); }
        if (n.y < 0 || n.y > h) { n.vy *= -1; n.y = clamp(n.y, 0, h); }
        n.glow *= 0.96;
      }

      links = [];
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < D * D) {
            const al = (1 - Math.sqrt(d2) / D) * 0.32;
            ctx.strokeStyle = `rgba(255,255,255,${al})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            links.push([a, b]);
          }
        }
      }
      if (mouse) {
        for (const n of nodes) {
          const d = Math.hypot(mouse.x - n.x, mouse.y - n.y);
          if (d < 180) {
            ctx.strokeStyle = `rgba(242,194,48,${(1 - d / 180) * 0.6})`;
            ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
        }
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 3.5, 0, 7); ctx.fill();
        ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.fillText('you.eth', mouse.x + 9, mouse.y - 8);
      }

      // handshakes
      if (t - lastPulse > 180 && links.length) {
        const [a, b] = pick(links);
        pulses.push({ a, b, p: 0, sp: rand(0.012, 0.025) }); lastPulse = t;
      }
      for (let k = pulses.length - 1; k >= 0; k--) {
        const P = pulses[k]; P.p += P.sp;
        if (P.p >= 1) { P.b.glow = 1; pulses.splice(k, 1); continue; }
        const x = lerp(P.a.x, P.b.x, P.p), y = lerp(P.a.y, P.b.y, P.p);
        ctx.fillStyle = GOLD; ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }

      // mixers (ripples)
      if (t - lastRipple > 2400) { const n = pick(nodes); ripples.push({ n, r: 0 }); n.glow = 1; lastRipple = t; }
      for (let k = ripples.length - 1; k >= 0; k--) {
        const R = ripples[k]; R.r += 0.9;
        if (R.r > 110) { ripples.splice(k, 1); continue; }
        ctx.strokeStyle = `rgba(242,194,48,${0.5 * (1 - R.r / 110)})`;
        ctx.beginPath(); ctx.arc(R.n.x, R.n.y, R.r, 0, 7); ctx.stroke();
      }

      // nodes + labels
      ctx.font = '10px "JetBrains Mono", monospace';
      for (const n of nodes) {
        const lit = n.glow > 0.05;
        ctx.fillStyle = lit ? `rgba(242,194,48,${0.4 + n.glow * 0.6})` : 'rgba(255,255,255,0.85)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.glow * 2, 0, 7); ctx.fill();
        if (n.label) {
          ctx.fillStyle = lit ? GOLD : 'rgba(255,255,255,0.4)';
          const tw = ctx.measureText(n.label).width;
          ctx.fillText(n.label, n.x + 8 + tw > w - 6 ? n.x - 8 - tw : n.x + 8, n.y + 3);
        }
      }

      if (++frame % 30 === 0) label.textContent = `PEERS ${String(nodes.length + (mouse ? 1 : 0)).padStart(2, '0')} · LINKS ${String(links.length).padStart(2, '0')}`;
    }, (s) => { if (nodes.length) nodes.forEach((n) => { n.x = Math.min(n.x, s.w); n.y = Math.min(n.y, s.h); }); });
  }

  /* =========================================================
     02 · CONSENSUS — MERKLE KNOWLEDGE TREE
     ========================================================= */
  function merkle() {
    const svg = $('#merkle');
    const W = 600;
    const ys = [36, 128, 220, 306];
    const bw = [132, 100, 82, 64], bh = 26;
    const LEAVES = ['paper', 'talk', 'ep.01', 'notes', 'slides', 'code', 'dataset', 'proof'];
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const hashFor = (lvl) => (lvl === 0 ? 'root 0x' + rhex(5) : '0x' + rhex([0, 8, 6, 4][lvl]));

    const gEdges = mk('g', {}, svg), gNodes = mk('g', {}, svg), gPk = mk('g', {}, svg);
    const levels = [];
    for (let L = 0; L < 4; L++) {
      const n = 1 << L, row = [];
      for (let i = 0; i < n; i++) {
        const x = (W * (i + 0.5)) / n, y = ys[L];
        const g = mk('g', { class: 'mk-node' + (L === 0 ? ' mk-root' : '') }, gNodes);
        mk('rect', { x: x - bw[L] / 2, y: y - bh / 2, width: bw[L], height: bh, rx: 3 }, g);
        const text = mk('text', { x, y }, g); text.textContent = hashFor(L);
        row.push({ x, y, g, text, L });
      }
      levels.push(row);
    }
    const edges = {};
    for (let L = 1; L < 4; L++) {
      levels[L].forEach((c, i) => {
        const p = levels[L - 1][i >> 1];
        const y1 = c.y - bh / 2, y2 = p.y + bh / 2, my = (y1 + y2) / 2;
        edges[`${L}-${i}`] = mk('path', { class: 'mk-edge', d: `M${c.x} ${y1} C${c.x} ${my} ${p.x} ${my} ${p.x} ${y2}` }, gEdges);
      });
    }
    const labels = LEAVES.map((l, i) => { const t = mk('text', { class: 'mk-label', x: levels[3][i].x, y: 344 }, svg); t.textContent = l; return t; });

    const reHash = (node) => new Promise((res) => {
      const final = hashFor(node.L); let k = 0;
      const iv = setInterval(() => {
        node.text.textContent = k++ < 7 ? (node.L === 0 ? 'root 0x' : '0x') + rhex(final.length - (node.L === 0 ? 7 : 2)) : final;
        if (k > 7) { clearInterval(iv); res(); }
      }, 45);
    });
    const packet = (path) => new Promise((res) => {
      const len = path.getTotalLength();
      const c = mk('circle', { r: 3, class: 'mk-pkt' }, gPk);
      const t0 = performance.now(), dur = 380;
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const pt = path.getPointAtLength(len * p);
        c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
        if (p < 1) requestAnimationFrame(step); else { c.remove(); res(); }
      };
      requestAnimationFrame(step);
    });

    const vis = watchVisible(svg);
    (async function cycle() {
      while (true) {
        if (!vis.visible || reduced) { await sleep(600); continue; }
        const leaf = irand(0, 7);
        const hot = [];
        labels[leaf].classList.add('hot');
        let idx = leaf;
        for (let L = 3; L >= 0; L--) {
          const node = levels[L][idx];
          node.g.classList.add('hot'); hot.push(node.g);
          await reHash(node);
          if (L > 0) {
            const e = edges[`${L}-${idx}`];
            e.classList.add('hot'); hot.push(e);
            await packet(e);
            idx >>= 1;
          }
        }
        await sleep(1100);
        hot.forEach((h) => h.classList.remove('hot'));
        labels[leaf].classList.remove('hot');
        await sleep(500);
      }
    })();
  }

  /* ---------- podcast waveform ---------- */
  function waveform() {
    const w = $('.wave'); if (!w) return;
    for (let i = 0; i < 48; i++) {
      const b = document.createElement('i');
      b.style.height = `${20 + Math.abs(Math.sin(i * 0.5)) * 60 + Math.random() * 20}%`;
      b.style.animationDelay = `${-Math.random() * 1.2}s`;
      b.style.animationDuration = `${rand(0.8, 1.6)}s`;
      w.appendChild(b);
    }
  }

  /* ---------- tx hashes ---------- */
  function txHashes() { $$('[data-hash]').forEach((el) => { el.textContent = `0x${rhex(6)}…${rhex(4)}`; }); }

  /* =========================================================
     HALL OF FAME — EXEC BASEBALL CARDS
     ========================================================= */
  function cards() {
    const host = $('#cards');
    const DATA = [
      { n: '001', role: 'Founding President', ens: 'president.waterloocrypto.eth', stats: [['EVT', 24], ['PPR', 2], ['MNT', 10]] },
      { n: '002', role: 'Head of Research', ens: 'research.waterloocrypto.eth', stats: [['EVT', 9], ['PPR', 5], ['MNT', 6]] },
      { n: '003', role: 'DeAI Lead', ens: 'deai.waterloocrypto.eth', stats: [['EVT', 7], ['PPR', 3], ['GPU', 8]] },
      { n: '004', role: 'Head of Events', ens: 'events.waterloocrypto.eth', stats: [['EVT', 31], ['PPR', 0], ['MNT', 14]] },
      { empty: true },
    ];

    const art = (seed) => {
      const r = mulberry32(hashStr(seed));
      const cx = 25 + r() * 50, cy = 25 + r() * 50, f = 0.12 + r() * 0.2, ph = r() * 6.28, mode = (r() * 3) | 0;
      const G = 22, st = 100 / G;
      let out = `<svg viewBox="0 0 100 100" xmlns="${NS}"><rect width="100" height="100" fill="#000"/>`;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const x = (i + 0.5) * st, y = (j + 0.5) * st;
        const d = Math.hypot(x - cx, y - cy) / 70;
        let v;
        if (mode === 0) v = (0.5 + 0.5 * Math.sin(d * 22 - ph)) * (1.1 - d);
        else if (mode === 1) v = (0.5 + 0.5 * Math.sin(x * f + ph) * Math.cos(y * f - ph)) * (1.15 - d * 0.8);
        else v = (0.5 + 0.5 * Math.sin((x + y) * f * 0.8 + d * 8 + ph)) * (1.1 - d);
        v = clamp(v, 0, 1);
        const rad = v * st * 0.5;
        if (rad < 0.3) continue;
        const gold = v > 0.8;
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${gold ? GOLD : '#f3f2ee'}" opacity="${gold ? 1 : (0.25 + v * 0.6).toFixed(2)}"/>`;
      }
      out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(14 + r() * 18).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width=".4" opacity=".8"/>`;
      out += `<path d="M${cx.toFixed(1)} 0V100M0 ${cy.toFixed(1)}H100" stroke="#fff" stroke-width=".2" opacity=".35"/>`;
      return out + '</svg>';
    };

    host.innerHTML = DATA.map((c, i) => c.empty ? `
      <div class="card-shell" style="--d:${i}">
        <div class="card empty">
          <div>
            <div class="q">#00?</div>
            <div class="card-role" style="margin-top:14px">Your card here</div>
            <div class="card-ens mono" style="text-align:center">you.eth</div>
            <div class="card-sb mono" style="justify-content:center;margin-top:14px">UNMINTED · JOIN THE EXEC</div>
          </div>
        </div>
      </div>` : `
      <div class="card-shell" style="--d:${i}">
        <div class="card">
          <div class="card-top mono"><span>WC · HALL OF FAME</span><span>’26</span></div>
          <div class="card-art">${art(c.ens)}<span class="card-num">#${c.n}</span></div>
          <div class="card-role">${c.role}</div>
          <div class="card-ens mono">${c.ens}</div>
          <div class="card-stats mono">${c.stats.map(([k, v]) => `<div>${k}<b>${String(v).padStart(2, '0')}</b></div>`).join('')}</div>
          <div class="card-sb mono"><span>1 / 1</span><span>BOUND TO ENS</span></div>
        </div>
      </div>`).join('');

    $$('.card', host).forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.classList.add('tilting');
        card.style.setProperty('--ry', `${(px - 0.5) * 24}deg`);
        card.style.setProperty('--rx', `${(0.5 - py) * 20}deg`);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* =========================================================
     03 · DeAI — ANIMATED GPU
     ========================================================= */
  function gpu() {
    const fans = $('#fans'), fingers = $('#fingers'), stage = $('#gpuStage'), wrap = $('#gpuWrap');
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    const f = (n) => n.toFixed(2);

    // PCIe gold fingers
    mk('rect', { x: 196, y: 311, width: 412, height: 26, fill: '#0c0c0c', stroke: '#2a2a2a' }, fingers);
    for (let x = 202; x < 602; x += 6.4) {
      if (x > 282 && x < 298) continue; // key notch
      mk('rect', { x: f(x), y: 316, width: 3.8, height: 19, rx: 0.6, fill: 'url(#gGold)' }, fingers);
    }

    // fans
    const CY = 176, R0 = 28, R1 = 93;
    const blade = (cx, th) => {
      const P = (r, a) => `${f(cx + r * Math.cos(a))} ${f(CY + r * Math.sin(a))}`;
      return `M${P(R0, th - 0.3)} Q${P(62, th - 0.14)} ${P(R1, th + 0.16)} A${R1} ${R1} 0 0 1 ${P(R1, th + 0.56)} Q${P(62, th + 0.42)} ${P(R0, th + 0.12)} A${R0} ${R0} 0 0 0 ${P(R0, th - 0.3)}Z`;
    };
    [215, 453, 691].forEach((cx, k) => {
      const g = mk('g', {}, fans);
      mk('circle', { cx, cy: CY, r: 106, fill: 'url(#gFanWell)', stroke: '#2a2a2a', 'stroke-width': 1.2 }, g);
      // static struts
      for (let s = 0; s < 4; s++) {
        const a = (s / 4) * Math.PI * 2 + Math.PI / 4;
        mk('line', { x1: f(cx + 30 * Math.cos(a)), y1: f(CY + 30 * Math.sin(a)), x2: f(cx + 100 * Math.cos(a)), y2: f(CY + 100 * Math.sin(a)), stroke: '#1a1a1a', 'stroke-width': 3 }, g);
      }
      mk('circle', { cx, cy: CY, r: 60, class: 'fan-blur' }, g);
      const rotor = mk('g', { class: 'fan-rotor', style: `transform-origin:${cx}px ${CY}px;animation-delay:${-k * 0.37}s` }, g);
      for (let b = 0; b < 9; b++) mk('path', { class: 'fan-blade', d: blade(cx, (b / 9) * Math.PI * 2) }, rotor);
      mk('circle', { cx, cy: CY, r: 100, class: 'fan-ring' }, g);
      const hi = mk('circle', { cx, cy: CY, r: 103.5, class: 'fan-ring-hi' }, g);
      hi.style.cssText = `transform-origin:${cx}px ${CY}px;animation:spin 14s linear infinite reverse`;
      mk('circle', { cx, cy: CY, r: 44, fill: 'url(#gHubGlow)' }, g);
      mk('circle', { cx, cy: CY, r: 26, class: 'fan-hub' }, g);
      // hub logo (static, on top of the spinning rotor)
      const lg = mk('g', { transform: `translate(${cx - 13} ${CY - 13}) scale(0.8125)`, fill: 'none', stroke: '#f3f2ee', 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
      mk('path', { d: 'M16 2.2 28 9.1v13.8L16 29.8 4 22.9V9.1Z', 'stroke-width': 1.3, opacity: 0.6 }, lg);
      mk('path', { d: 'M9.2 11.2 12.6 21 16 14.2 19.4 21l3.4-9.8', stroke: GOLD }, lg);
    });

    // data streams around the card
    const streams = $('#gpuStreams');
    const INS = ['prompt', 'weights · cid', 'shard 03/64', 'dataset · cid', 'job 0x' + rhex(4), 'gradients'];
    const OUTS = ['tokens', 'zk proof ✓', 'attestation', 'settlement'];
    INS.forEach((lbl, i) => {
      const y0 = 70 + i * 92, y1 = 250 + i * 18;
      const id = `sin${i}`;
      mk('path', { id, class: 'stream', d: `M-20 ${y0} C 300 ${y0}, 380 ${y1}, 640 ${y1}` }, streams);
      const t = mk('text', { class: 'stream-lbl', x: 40, y: y0 - 10 }, streams); t.textContent = lbl;
      for (let p = 0; p < 2; p++) {
        const r = mk('rect', { width: 12, height: 2, class: 'pkt', x: -6, y: -1 }, streams);
        const am = mk('animateMotion', { dur: `${rand(2.6, 4.2).toFixed(2)}s`, repeatCount: 'indefinite', begin: `${(-rand(0, 4)).toFixed(2)}s`, rotate: 'auto' }, r);
        mk('mpath', { href: `#${id}` }, am);
      }
    });
    OUTS.forEach((lbl, i) => {
      const y0 = 280 + i * 20, y1 = 110 + i * 130;
      const id = `sout${i}`;
      mk('path', { id, class: 'stream stream-out', d: `M760 ${y0} C 1020 ${y0}, 1080 ${y1}, 1420 ${y1}` }, streams);
      const t = mk('text', { class: 'stream-lbl', x: 1360, y: y1 - 10, 'text-anchor': 'end' }, streams); t.textContent = lbl;
      for (let p = 0; p < 3; p++) {
        const c = mk('circle', { r: 2.6, class: 'pkt-g' }, streams);
        const am = mk('animateMotion', { dur: `${rand(2.2, 3.4).toFixed(2)}s`, repeatCount: 'indefinite', begin: `${(-rand(0, 3.4)).toFixed(2)}s` }, c);
        mk('mpath', { href: `#${id}` }, am);
      }
    });

    // parallax + overclock
    let boost = false;
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty('--ry', `${-16 + px * 22}deg`);
      wrap.style.setProperty('--rx', `${10 - py * 14}deg`);
    });
    wrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { boost = true; stage.classList.add('boost'); } });
    wrap.addEventListener('pointerleave', () => { boost = false; stage.classList.remove('boost'); });
    wrap.addEventListener('click', () => { boost = !boost; stage.classList.toggle('boost', boost); });
    stage.addEventListener('pointerleave', () => { wrap.style.setProperty('--ry', '-16deg'); wrap.style.setProperty('--rx', '10deg'); });

    // HUD telemetry
    const el = { util: $('#hUtil'), bar: $('#hUtilBar'), tok: $('#hTok'), vram: $('#hVram'), temp: $('#hTemp'), proofs: $('#hProofs'), nodes: $('#hNodes'), spark: $('#spark') };
    const hist = Array.from({ length: 18 }, () => rand(0.4, 0.8));
    el.spark.innerHTML = hist.map(() => '<i></i>').join('');
    const bars = $$('i', el.spark);
    let proofs = 18432;
    const vis = watchVisible(stage);
    const tick = () => {
      if (!vis.visible) return;
      const util = boost ? irand(99, 100) : irand(93, 99);
      const tok = Math.round((boost ? rand(2600, 2950) : rand(1180, 1420)));
      el.util.textContent = util; el.bar.style.width = util + '%';
      el.tok.textContent = fmt(tok);
      el.vram.textContent = (boost ? rand(77, 79.6) : rand(70, 74)).toFixed(1);
      el.temp.textContent = boost ? irand(78, 83) : irand(61, 67);
      proofs += boost ? irand(6, 14) : irand(1, 5);
      el.proofs.textContent = fmt(proofs);
      el.nodes.textContent = irand(126, 131);
      hist.shift(); hist.push(clamp(tok / 3000 + rand(-0.06, 0.06), 0.1, 1));
      bars.forEach((b, i) => { b.style.height = (hist[i] * 100).toFixed(0) + '%'; });
    };
    tick(); setInterval(tick, 900);

    // job log terminal
    const term = $('#term');
    const MODELS = ['llama-class-8b', 'mistral-class-7b', 'diffusion-xl', 'whisper-class', 'embed-v3', 'qwen-class-14b'];
    const CITIES = ['waterloo', 'kitchener', 'toronto', 'montreal', 'berlin', 'singapore', 'lisbon', 'sf', 'seoul'];
    const lines = [];
    const now = () => { const d = new Date(); return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0'); };
    const push = (html) => { lines.push(`<div>${html}</div>`); if (lines.length > 16) lines.shift(); term.innerHTML = lines.join(''); };
    const termVis = watchVisible(term);
    (async function run() {
      push(`<span class="lo">[${now()}]</span> <span class="hi">deai-node-01</span> connected · peers 128 · stake bonded`);
      for (let i = 0; i < 3; i++) {
        push(`<span class="lo">[${now()}]</span> job <span class="hi">0x${rhex(4)}…${rhex(4)}</span> → node-${String(irand(1, 128)).padStart(3, '0')}.${pick(CITIES)}`);
        push(`<span class="lo">[${now()}]</span>   inference ${pick(MODELS)} · ${irand(64, 900)} tok · ${rand(0.18, 1.4).toFixed(2)}s`);
        push(`<span class="lo">[${now()}]</span>   <span class="ok">✓ proof verified</span> · block #${fmt((chain.block || 0) - 3 + i)}`);
      }
      while (true) {
        if (!termVis.visible || reduced) { await sleep(700); continue; }
        const job = `0x${rhex(4)}…${rhex(4)}`;
        const model = pick(MODELS);
        push(`<span class="lo">[${now()}]</span> job <span class="hi">${job}</span> → node-${String(irand(1, 128)).padStart(3, '0')}.${pick(CITIES)}`);
        await sleep(rand(350, 700));
        push(`<span class="lo">[${now()}]</span>   inference ${model} · ${irand(64, 900)} tok · ${rand(0.18, 1.4).toFixed(2)}s`);
        await sleep(rand(400, 800));
        const verify = Math.random() > 0.2;
        push(verify
          ? `<span class="lo">[${now()}]</span>   <span class="ok">✓ proof verified</span> · block #${fmt((chain.block || 0) + irand(0, 2))} · fee ${rand(0.0004, 0.003).toFixed(4)} ETH`
          : `<span class="lo">[${now()}]</span>   <span class="ok">◆ optimistic</span> · challenge window 7d · bonded`);
        await sleep(rand(500, 1000));
      }
    })();
  }

  /* ---------- track spotlight ---------- */
  function spotlights() {
    $$('.track').forEach((t) => t.addEventListener('pointermove', (e) => {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--x', `${e.clientX - r.left}px`); t.style.setProperty('--y', `${e.clientY - r.top}px`);
    }));
  }

  /* =========================================================
     04 · ENS RESOLVER DEMO
     ========================================================= */
  function resolver() {
    const nameEl = $('#ensName'), addrEl = $('#ensAddr'), list = $('#ensList');
    const PROFILES = [
      { name: 'alice.eth', items: [['SBT', 'Attendance · Genesis Mixer'], ['NFT', 'Photo · Genesis Mixer #014'], ['SBT', 'Author · WC-2026-001']] },
      { name: 'president.waterloocrypto.eth', items: [['NFT', 'Hall of Fame · Card #001'], ['SBT', 'Author · WC-2026-003'], ['SBT', 'Exec · Class of 2026'], ['SBT', 'Mentor · 10 mentees']] },
      { name: 'bob.eth', items: [['SBT', 'Hackathon · Shipped'], ['NFT', 'Video · Demo Day'], ['SBT', 'Mentee · Office Hours']] },
      { name: 'agent-07.eth', items: [['SBT', 'DeAI · Node Operator'], ['SBT', 'Proof of Inference × 1,024'], ['NFT', 'Compute Unit 01 · Badge']] },
    ];
    const vis = watchVisible(nameEl.closest('.resolver'));
    (async function run() {
      let k = 0;
      while (true) {
        if (!vis.visible) { await sleep(500); continue; }
        const p = PROFILES[k++ % PROFILES.length];
        for (let i = 1; i <= p.name.length; i++) { nameEl.textContent = p.name.slice(0, i); await sleep(reduced ? 0 : rand(40, 90)); }
        await sleep(300);
        addrEl.textContent = 'resolving…';
        await sleep(600);
        addrEl.innerHTML = `→ 0x${rhex(4)}…${rhex(4)} <span class="dim">· ${p.items.length} tokens bound</span>`;
        list.innerHTML = p.items.map(([type, label]) => `<div class="rs-item"><span class="rs-type ${type === 'SBT' ? 'sbt' : ''}">${type}</span><span>${label}</span><span class="rs-check">✓</span></div>`).join('');
        const items = $$('.rs-item', list);
        for (const it of items) { await sleep(220); it.classList.add('in'); }
        await sleep(3200);
        items.forEach((it) => it.classList.remove('in'));
        await sleep(300);
        for (let i = p.name.length; i >= 0; i--) { nameEl.textContent = p.name.slice(0, i); await sleep(reduced ? 0 : 22); }
        addrEl.innerHTML = '&nbsp;'; list.innerHTML = '';
        await sleep(350);
      }
    })();
  }

  /* =========================================================
     JOIN — HALFTONE WAVE FIELD
     ========================================================= */
  function joinField() {
    const canvas = $('#joinCanvas');
    canvasLoop(canvas, (ctx, s, t) => {
      const { w, h } = s;
      ctx.clearRect(0, 0, w, h);
      const gap = w < 720 ? 18 : 22;
      const cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy);
      const T = t * 0.0012;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy);
          const v = 0.5 + 0.5 * Math.sin(d * 0.022 - T * 2 + Math.sin(x * 0.004 + T) * 1.5);
          const fade = Math.pow(d / maxD, 1.3);
          const sz = v * gap * 0.32 * fade;
          if (sz < 0.4) continue;
          ctx.fillStyle = v > 0.86 ? `rgba(242,194,48,${0.9 * fade})` : `rgba(255,255,255,${0.35 * fade * v})`;
          ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        }
      }
    });
  }

  /* =========================================================
     INIT
     ========================================================= */
  $('#yr').textContent = new Date().getFullYear();
  cards(); // inject DOM before the reveal observer attaches
  boot();
  nav();
  reveals();
  blockTicker();
  globe();
  network();
  merkle();
  waveform();
  txHashes();
  gpu();
  spotlights();
  resolver();
  joinField();
})();

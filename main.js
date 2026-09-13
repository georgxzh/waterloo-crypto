/* =========================================================
   WATERLOO CRYPTO — v0.2 (simplified)
   Dependency-free vanilla JS.
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
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

  /* visibility-aware canvas loop */
  function canvasLoop(canvas, draw) {
    const ctx = canvas.getContext('2d');
    const s = { w: 0, h: 0, visible: false, running: false };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = r.width; s.h = r.height;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
  }

  /* ---------- text scramble ---------- */
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&@';
  function scramble(el, duration = 1000) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    if (reduced) return;
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

  /* ---------- intro ---------- */
  function intro() {
    requestAnimationFrame(() => {
      document.body.classList.add('ready');
      $$('.hero-title [data-scramble]').forEach((w, i) => setTimeout(() => scramble(w, 1300), 150 + i * 140));
    });
  }

  /* ---------- nav: scrolled state, progress, active section, rail ---------- */
  function nav() {
    const navEl = $('#nav'), bar = $('#progress'), rail = $('.rail');
    const onScroll = () => {
      const y = window.scrollY;
      navEl.classList.toggle('scrolled', y > 20);
      rail.classList.toggle('show', y > innerHeight * 0.5);
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
    ['top', 'onchain', 'consensus', 'deai', 'join'].forEach((id) => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- reveal + scramble on view ---------- */
  function reveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-scramble]', e.target).forEach((s) => scramble(s, 1000));
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal, .card-shell').forEach((el) => io.observe(el));
  }

  /* =========================================================
     HERO — GLOBE
     ========================================================= */
  function globe() {
    const canvas = $('#globe');
    const N = innerWidth < 760 ? 750 : 1400;
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
      const so = Math.sin(om) || 1e-6, k1 = Math.sin((1 - u) * om) / so, k2 = Math.sin(u * om) / so;
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
      const mobile = w < 760;
      const cx = mobile ? w * 0.5 : w * 0.68;
      const cy = mobile ? h * 0.3 : h * 0.44;
      const R = mobile ? Math.min(w * 0.5, h * 0.3) : Math.min(w * 0.28, h * 0.36);
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

      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
      g.addColorStop(0, 'rgba(242,194,48,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      // orbit rings
      [[1.38, 0.9, 0.2], [1.7, -0.5, 1.1]].forEach(([rr, tilt, phase], ri) => {
        const ct = Math.cos(tilt), st = Math.sin(tilt);
        let prev = null;
        for (let k = 0; k <= 120; k++) {
          const a = (k / 120) * Math.PI * 2;
          const p = proj(Math.cos(a), Math.sin(a) * st, Math.sin(a) * ct, rr);
          if (prev) {
            ctx.strokeStyle = `rgba(255,255,255,${p[2] > 0 ? 0.13 : 0.04})`;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
          }
          prev = p;
        }
        const sa = t * 0.00025 * (ri + 1) + phase;
        const sp = proj(Math.cos(sa), Math.sin(sa) * st, Math.sin(sa) * ct, rr);
        ctx.fillStyle = sp[2] > 0 ? GOLD : 'rgba(242,194,48,.35)';
        ctx.fillRect(sp[0] - 2, sp[1] - 2, 4, 4);
      });

      // sphere
      ctx.fillStyle = '#fff';
      for (let i = 0; i < N; i++) {
        const q = pts[i], p = proj(q[0], q[1], q[2]);
        const d = (p[2] + 1) / 2;
        ctx.globalAlpha = 0.05 + 0.8 * d * d;
        const sz = 0.7 + 1.5 * d;
        ctx.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      for (const i of nodeIdx) {
        const q = pts[i], p = proj(q[0], q[1], q[2]);
        if (p[2] < -0.1) continue;
        ctx.fillStyle = `rgba(242,194,48,${0.35 + 0.6 * (p[2] + 0.1)})`;
        ctx.fillRect(p[0] - 1.8, p[1] - 1.8, 3.6, 3.6);
      }

      // arcs
      if (t - lastSpawn > 360 && arcs.length < 14) { spawn(t); lastSpawn = t; }
      for (let k = arcs.length - 1; k >= 0; k--) {
        const A = arcs[k];
        const L = (t - A.t0) / A.dur;
        const head = Math.min(L, 1), tail = clamp(L - 0.55, 0, 1);
        if (tail >= 1) { arcs.splice(k, 1); continue; }
        const lift = 0.1 + 0.32 * (A.om / Math.PI);
        let prev = null;
        for (let i = 0; i <= 34; i++) {
          const u = tail + (head - tail) * (i / 34);
          const v = slerp(A.a, A.b, u, A.om);
          const p = proj(v[0], v[1], v[2], 1 + lift * Math.sin(Math.PI * u));
          if (prev) {
            ctx.strokeStyle = `rgba(242,194,48,${(p[2] > -0.2 ? 0.75 : 0.18) * (i / 34)})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
          }
          prev = p;
        }
        ctx.lineWidth = 1;
        if (L < 1 && prev) {
          ctx.fillStyle = 'rgba(255,240,200,0.95)'; ctx.beginPath(); ctx.arc(prev[0], prev[1], 2, 0, 7); ctx.fill();
          ctx.fillStyle = 'rgba(242,194,48,0.25)'; ctx.beginPath(); ctx.arc(prev[0], prev[1], 6, 0, 7); ctx.fill();
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
    const canvas = $('#network');
    const NAMES = ['alice.eth', 'bob.eth', 'carol.eth', 'mentor.eth', 'hacker.eth', 'founder.eth', 'validator.eth', 'dave.eth'];
    let nodes = [], pulses = [], ripples = [], links = [];
    let mouse = null, lastPulse = 0, lastRipple = 0;
    canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    canvas.addEventListener('pointerleave', () => { mouse = null; });

    canvasLoop(canvas, (ctx, s, t) => {
      const { w, h } = s;
      if (!nodes.length && w > 0) {
        const n = clamp(Math.round((w * h) / 7000), 24, 70);
        nodes = Array.from({ length: n }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: rand(-0.28, 0.28), vy: rand(-0.28, 0.28), r: rand(1.2, 2.6), label: NAMES[i] || null, glow: 0 }));
      }
      ctx.clearRect(0, 0, w, h);
      const D = Math.min(140, w * 0.22);

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
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
          if (d2 < D * D) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - Math.sqrt(d2) / D) * 0.32})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            links.push([a, b]);
          }
        }
      }
      if (mouse) {
        for (const n of nodes) {
          const d = Math.hypot(mouse.x - n.x, mouse.y - n.y);
          if (d < 180) { ctx.strokeStyle = `rgba(242,194,48,${(1 - d / 180) * 0.6})`; ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(n.x, n.y); ctx.stroke(); }
        }
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 3.5, 0, 7); ctx.fill();
        ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.fillText('you.eth', mouse.x + 9, mouse.y - 8);
      }

      if (t - lastPulse > 180 && links.length) { const [a, b] = pick(links); pulses.push({ a, b, p: 0, sp: rand(0.012, 0.025) }); lastPulse = t; }
      for (let k = pulses.length - 1; k >= 0; k--) {
        const P = pulses[k]; P.p += P.sp;
        if (P.p >= 1) { P.b.glow = 1; pulses.splice(k, 1); continue; }
        ctx.fillStyle = GOLD; ctx.fillRect(lerp(P.a.x, P.b.x, P.p) - 1.5, lerp(P.a.y, P.b.y, P.p) - 1.5, 3, 3);
      }
      if (t - lastRipple > 2400 && nodes.length) { const n = pick(nodes); ripples.push({ n, r: 0 }); n.glow = 1; lastRipple = t; }
      for (let k = ripples.length - 1; k >= 0; k--) {
        const R = ripples[k]; R.r += 0.9;
        if (R.r > 110) { ripples.splice(k, 1); continue; }
        ctx.strokeStyle = `rgba(242,194,48,${0.5 * (1 - R.r / 110)})`;
        ctx.beginPath(); ctx.arc(R.n.x, R.n.y, R.r, 0, 7); ctx.stroke();
      }

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
    });
  }

  /* =========================================================
     02 · HALL OF FAME CARDS
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
        const x = (i + 0.5) * st, y = (j + 0.5) * st, d = Math.hypot(x - cx, y - cy) / 70;
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
      <div class="card-shell" style="--d:${i}"><div class="card empty"><div>
        <div class="q">#00?</div>
        <div class="card-role" style="margin-top:14px">Your card here</div>
        <div class="card-ens mono" style="text-align:center">you.eth</div>
      </div></div></div>` : `
      <div class="card-shell" style="--d:${i}"><div class="card">
        <div class="card-top mono"><span>WC · Hall of Fame</span><span>’26</span></div>
        <div class="card-art">${art(c.ens)}<span class="card-num">#${c.n}</span></div>
        <div class="card-role">${c.role}</div>
        <div class="card-ens mono">${c.ens}</div>
        <div class="card-stats mono">${c.stats.map(([k, v]) => `<div>${k}<b>${String(v).padStart(2, '0')}</b></div>`).join('')}</div>
        <div class="card-sb mono"><span>1 / 1</span><span>Bound to ENS</span></div>
      </div></div>`).join('');

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
      if (x > 282 && x < 298) continue;
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

      // chain-link logo on the hub (static, over the spinning rotor)
      const lg = mk('g', { transform: `translate(${cx - 14.4} ${CY - 14.4}) scale(0.9)` }, g);
      const clipId = `hubClip${k}`;
      const cp = mk('clipPath', { id: clipId }, lg);
      mk('circle', { cx: 16, cy: 12, r: 4.2 }, cp);
      const rot = mk('g', { transform: 'rotate(-45 16 16)', fill: 'none' }, lg);
      const link = (x, stroke, sw, parent) => mk('rect', { x, y: 11, width: 16, height: 10, rx: 5, stroke, 'stroke-width': sw }, parent);
      link(2, '#f3f2ee', 2.2, rot);
      link(14, '#0b0b0b', 5, rot);
      link(14, GOLD, 2.2, rot);
      const over = mk('g', { 'clip-path': `url(#${clipId})` }, rot);
      link(2, '#0b0b0b', 5, over);
      link(2, '#f3f2ee', 2.2, over);
    });

    // data streams
    const streams = $('#gpuStreams');
    for (let i = 0; i < 6; i++) {
      const y0 = 70 + i * 92, y1 = 250 + i * 18, id = `sin${i}`;
      mk('path', { id, class: 'stream', d: `M-20 ${y0} C 300 ${y0}, 380 ${y1}, 640 ${y1}` }, streams);
      for (let p = 0; p < 2; p++) {
        const r = mk('rect', { width: 12, height: 2, class: 'pkt', x: -6, y: -1 }, streams);
        const am = mk('animateMotion', { dur: `${rand(2.6, 4.2).toFixed(2)}s`, repeatCount: 'indefinite', begin: `${(-rand(0, 4)).toFixed(2)}s`, rotate: 'auto' }, r);
        mk('mpath', { href: `#${id}` }, am);
      }
    }
    for (let i = 0; i < 4; i++) {
      const y0 = 280 + i * 20, y1 = 110 + i * 130, id = `sout${i}`;
      mk('path', { id, class: 'stream stream-out', d: `M760 ${y0} C 1020 ${y0}, 1080 ${y1}, 1420 ${y1}` }, streams);
      for (let p = 0; p < 3; p++) {
        const c = mk('circle', { r: 2.6, class: 'pkt-g' }, streams);
        const am = mk('animateMotion', { dur: `${rand(2.2, 3.4).toFixed(2)}s`, repeatCount: 'indefinite', begin: `${(-rand(0, 3.4)).toFixed(2)}s` }, c);
        mk('mpath', { href: `#${id}` }, am);
      }
    }

    // parallax + overclock
    let boost = false;
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty('--ry', `${-16 + px * 22}deg`);
      wrap.style.setProperty('--rx', `${10 - py * 14}deg`);
    });
    stage.addEventListener('pointerleave', () => { wrap.style.setProperty('--ry', '-16deg'); wrap.style.setProperty('--rx', '10deg'); });
    wrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { boost = true; stage.classList.add('boost'); } });
    wrap.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { boost = false; stage.classList.remove('boost'); } });
    wrap.addEventListener('click', (e) => { if (e.pointerType !== 'mouse') { boost = !boost; stage.classList.toggle('boost', boost); } });
  }

  /* =========================================================
     JOIN — HALFTONE WAVE FIELD
     ========================================================= */
  function joinField() {
    canvasLoop($('#joinCanvas'), (ctx, s, t) => {
      const { w, h } = s;
      ctx.clearRect(0, 0, w, h);
      const gap = w < 760 ? 18 : 22;
      const cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy), T = t * 0.0012;
      for (let y = gap / 2; y < h; y += gap) {
        for (let x = gap / 2; x < w; x += gap) {
          const d = Math.hypot(x - cx, y - cy);
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

  /* ---------- init ---------- */
  $('#yr').textContent = new Date().getFullYear();
  cards(); // inject DOM before the reveal observer attaches
  intro();
  nav();
  reveals();
  globe();
  network();
  gpu();
  joinField();
})();

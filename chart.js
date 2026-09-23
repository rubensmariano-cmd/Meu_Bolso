// =====================================================================
// Meu Bolso — gráficos (mini biblioteca, canvas + tooltip)
// =====================================================================
App.reg('charts', () => {
  const paleta = ['#2563eb', '#16a34a', '#dc2626', '#ea580c', '#7c3aed',
    '#0891b2', '#db2777', '#a16207', '#4f46e5', '#64748b', '#65a30d', '#0f766e'];
  const css = 'font:600 10px -apple-system,sans-serif';
  const tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:rgba(17,24,39,.92);color:#fff;' +
    'padding:5px 8px;border-radius:8px;font:11px -apple-system,sans-serif;white-space:nowrap;display:none;';
  document.body.appendChild(tooltip);

  function prep(c) {
    const dpr = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    if (r.width < 2) return null;
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { x, r };
  }

  // barras horizontais — lev: [{label, v, cor, rx}] ; meta.limite opcional (linha tracejada)
  function mbars(c, lev, meta = {}) {
    const g = prep(c); if (!g) return;
    const { x, r } = g;
    const W = r.width, H = r.height;
    const padT = 4, padR = 4, padL = 36, padB = 14;
    const IW = W - padL - padR, IH = H - padT - padB;
    if (IW <= 0 || IH <= 0) return;
    const maxV = Math.max(1, ...lev.map(d => d.v + 1e-6), meta.limite || 0);
    const n = lev.length;
    const sw = Math.max(2, Math.min(18, Math.floor((IW - (n - 1) * 4) / n)));
    const gap = (IW - sw * n) / Math.max(1, n - 1);
    const sc = v => IH * Math.min(1, v / maxV);
    const cy = H - padB;
    x.textAlign = 'right'; x.textBaseline = 'middle';
    x.strokeStyle = 'rgba(0,0,0,0.07)'; x.fillStyle = 'rgba(0,0,0,0.42)'; x.font = '9px -apple-system,sans-serif';
    for (let i = 0; i <= 3; i++) {
      const v = maxV * i / 3, y = cy - sc(v);
      x.beginPath(); x.moveTo(padL, y); x.lineTo(W - padR, y); x.stroke();
      x.fillText(Math.round(v), padL - 3, y);
    }
    if (meta.limite) {
      x.strokeStyle = '#be123c'; x.setLineDash([4, 3]); x.lineWidth = 1;
      x.beginPath(); x.moveTo(padL, cy - sc(meta.limite)); x.lineTo(W - padR, cy - sc(meta.limite)); x.stroke();
      x.setLineDash([]); x.fillStyle = '#be123c'; x.textAlign = 'left';
      x.fillText('sugerido', W - padR - 50, cy - sc(meta.limite) - 3);
    }
    lev.forEach((d, i) => {
      const x0 = padL + i * (sw + gap);
      const h = sc(d.v);
      x.fillStyle = d.cor; x.fillRect(x0, cy - h, sw, h);
      if (n <= 14) {
        x.font = '7px -apple-system,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'top';
        x.fillStyle = '#475569'; x.fillText(d.rx, x0 + sw / 2, cy + 2);
      }
      if (h > 13) {
        x.fillStyle = 'rgba(255,255,255,.85)'; x.textBaseline = 'bottom';
        x.fillText(Math.round(d.v), x0 + sw / 2, cy - h - 2);
      }
    });
    c.onmousemove = e => {
      const i = Math.floor((e.offsetX - padL) / (sw + gap));
      if (i < 0 || i >= lev.length) { tooltip.style.display = 'none'; return; }
      const d = lev[i];
      tooltip.innerHTML = esc(d.label) + '<br>R$ ' + d.v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      tooltip.style.left = (e.clientX + 12) + 'px'; tooltip.style.top = (e.clientY - 10) + 'px';
      tooltip.style.display = 'block';
    };
    c.onmouseleave = () => { tooltip.style.display = 'none'; };
  }

  // rosca — seg: [{label, v, cor}]
  function mpie(c, seg, label = 'Gasto no mês') {
    const g = prep(c); if (!g) return;
    const { x, r } = g;
    const W = r.width, H = r.height;
    const total = seg.reduce((s, d) => s + d.v, 0);
    if (total <= 0) return;
    const cx = 34, cy = H / 2, R = Math.min(30, Math.min(cx - 6, H / 2 - 6));
    let a = -Math.PI / 2;
    seg.forEach(d => {
      const an = a + d.v / total * Math.PI * 2;
      x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, a, an); x.closePath();
      x.fillStyle = d.cor; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke();
      a = an;
    });
    const cx2 = W * 0.44;
    x.fillStyle = '#0f172a'; x.textAlign = 'center';
    x.font = '900 15px -apple-system,sans-serif';
    x.fillText('R$ ' + total.toLocaleString('pt-BR', { maximumFractionDigits: 0 }), cx2, cy - 8);
    x.font = '10px -apple-system,sans-serif'; x.fillStyle = '#64748b'; x.fillText(label, cx2, cy + 5);
    const y0 = 6, minSp = Math.min(15, (H - 8) / seg.length);
    let y = y0;
    seg.forEach(d => {
      const p = (d.v / total * 100).toFixed(0) + '%';
      const dx = cx2 - 56, dw = W - dx;
      x.fillStyle = d.cor; x.fillRect(dx, y + 1, 9, 9);
      const nm = String(d.label).slice(0, 13) + (String(d.label).length > 13 ? '…' : '');
      x.font = css; x.textAlign = 'left'; x.fillStyle = '#334155'; x.fillText(nm, dx + 13, y + 9);
      x.fillStyle = '#64748b'; x.textAlign = 'right'; x.fillText(p, W - 3, y + 9);
      y += minSp;
    });
    c.onmousemove = e => {
      const dx = e.offsetX - cx, dy = e.offsetY - cy, dd = Math.sqrt(dx * dx + dy * dy);
      if (dd > R) { tooltip.style.display = 'none'; return; }
      let an = Math.atan2(dy, dx) + Math.PI / 2; if (an < 0) an += Math.PI * 2;
      let acc = 0, hit = null;
      for (const d of seg) { acc += d.v / total * Math.PI * 2; if (an <= acc) { hit = d; break; } }
      if (!hit) return;
      tooltip.innerHTML = esc(hit.label) + '<br>R$ ' + hit.v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      tooltip.style.left = (e.clientX + 12) + 'px'; tooltip.style.top = (e.clientY - 10) + 'px';
      tooltip.style.display = 'block';
    };
    c.onmouseleave = () => { tooltip.style.display = 'none'; };
  }

  // linha com área — saldo: array de 12 valores
  function mline(c, saldo) {
    const g = prep(c); if (!g) return;
    const { x, r } = g;
    const W = r.width, H = r.height;
    const padT = 10, padR = 4, padL = 36, padB = 12;
    const IW = W - padL - padR, IH = H - padT - padB;
    if (IW <= 0 || IH <= 0) return;
    let min = Math.min(0, ...saldo), max = Math.max(1, ...saldo);
    if (min === max) { min -= 100; max += 100; }
    const X = i => padL + i / 11 * IW;
    const Y = v => H - padB - (v - min) / (max - min) * IH;
    x.textAlign = 'right'; x.textBaseline = 'middle'; x.font = '9px -apple-system,sans-serif';
    x.strokeStyle = 'rgba(0,0,0,0.07)'; x.fillStyle = 'rgba(0,0,0,0.42)';
    for (let i = 0; i <= 3; i++) {
      const v = min + (max - min) * i / 3, y = Y(v);
      x.beginPath(); x.moveTo(padL, y); x.lineTo(W - padR, y); x.stroke();
      x.fillText(Math.abs(v) >= 1000 ? Math.round(v / 1000) + 'k' : Math.round(v), padL - 3, y);
    }
    x.strokeStyle = '#16a34a'; x.lineWidth = 2;
    x.beginPath(); saldo.forEach((v, i) => i ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v))); x.stroke();
    x.fillStyle = 'rgba(22,163,74,.14)';
    x.beginPath(); x.moveTo(X(0), H - padB); saldo.forEach((v, i) => x.lineTo(X(i), Y(v))); x.lineTo(X(11), H - padB); x.closePath(); x.fill();
    const zy = Y(0);
    x.strokeStyle = 'rgba(0,0,0,0.25)'; x.setLineDash([3, 3]); x.lineWidth = 1;
    x.beginPath(); x.moveTo(padL, zy); x.lineTo(W - padR, zy); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#16a34a';
    saldo.forEach((v, i) => { if (v >= 0) x.fillRect(X(i) - 2, Y(v) - 2, 4, 4); });
    x.textBaseline = 'top'; x.textAlign = 'center'; x.fillStyle = '#64748b'; x.font = css;
    [0, 5, 11].forEach(i => x.fillText(MESES_CURTO[i], X(i), H - padB + 1));
  }

  window.CH = { mbars, mpie, mline, paleta };
});

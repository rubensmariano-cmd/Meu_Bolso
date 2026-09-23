// =====================================================================
// Meu Bolso — Painel (visão do mês)
// =====================================================================
App.reg('dashboard', () => {
  const st = Store.state;
  const cf = cfg();
  window.__oculta = window.__oculta || false;

  renderSel();
  render();
  App.modules['dashboard'] = renderAll;

  function renderAll() {
    renderSel();
    render();
  }

  function renderSel() {
    const sel = $('#mes-sel');
    sel.innerHTML = MESES.map((m, i) => `<option value="${i}" ${i === cf.mes ? 'selected' : ''}>${m}</option>`).join('');
    sel.onchange = () => { cf.mes = +sel.value; Store.save(); render(); };

    const a = $('#ano-sel');
    const anos = [...new Set(st.lancamentos.map(L => L.ano).concat(cf.ano))].sort((a, b) => b - a);
    a.innerHTML = anos.map(y => `<option value="${y}" ${y === cf.ano ? 'selected' : ''}>${y}</option>`).join('');
    a.onchange = () => { cf.ano = +a.value; Store.save(); render(); };

    const cb = $('#chk-ocultar');
    cb.checked = !!window.__oculta;
    cb.onchange = () => { window.__oculta = cb.checked; renderResumo(); };

    $('#title-mes').textContent = `${MESES[cf.mes]} ${cf.ano}`;
  }

  function render() {
    const L = M.sel(cf.mes, cf.ano);
    const t = totais(L);
    const saldo = t.rec - t.desp - t.inv;
    const all = M.ano(cf.ano);
    const tAll = totais(all);
    const saldoAll = tAll.rec - tAll.desp - tAll.inv;
    const taxa = t.rec > 0 ? saldo / t.rec : null;
    const taxaAll = tAll.rec > 0 ? saldoAll / tAll.rec : null;
    window.__R = { mes: { t, saldo }, ano: { t: tAll, saldo: saldoAll } };

    renderResumo();
    renderOrcado(L);
    render503020(L);
    renderFormas(L);
    renderGraficos(L);
  }

  function renderResumo() {
    const R = window.__R;
    const t = R.mes.t, saldo = R.mes.saldo, tAll = R.ano.t, saldoAll = R.ano.saldo;
    const taxa = t.rec > 0 ? saldo / t.rec : null;
    const taxaAll = tAll.rec > 0 ? saldoAll / tAll.rec : null;
    const occ = window.__oculta;

    $('#k-rec').textContent = occ ? '•••' : brl(t.rec);
    $('#k-rec').className = 'v big ' + (t.rec >= 0.8 * cf.salario ? 'pos' : 'neg');
    $('#k-desp').textContent = occ ? '•••' : brl(t.desp);
    $('#k-inv').textContent = occ ? '•••' : brl(t.inv);
    $('#k-saldo').textContent = occ ? '•••' : brl(saldo);
    $('#k-saldo').className = 'v ' + (saldo >= 0 ? 'pos' : 'neg');
    $('#k-taxa').textContent = occ ? '•••' : pct(taxa);
    $('#k-taxa').className = 'v ' + ((taxa || 0) >= 0 ? 'pos' : 'neg');
    $('#k-pend').textContent = occ ? '•••' : brl(t.pend);

    const acc = $('#acc');
    acc.textContent = occ
      ? 'valores escondidos'
      : `Acumulado no ano: sobra de ${brl(saldoAll)} · ${pct(taxaAll)} da renda guardada`;
    acc.className = 'acc ' + (saldoAll >= 0 ? '' : 'ruim');
  }

  function renderOrcado(L) {
    const cats = optCats();
    const rows = cats.map(c => {
      const v = somaCat(L, c.id);
      let orc = M.mediaCategoria(c.id, cf.ano);
      if (c.id === 'investimentos') orc = (+cf.metas.fin / 100) * cf.salario;
      const pctU = orc > 0 ? v / orc : (v > 0 ? 1 : 0);
      const cor = pctU > 1 ? 'over' : (pctU > 0.85 ? 'atencao' : 'ok');
      return { c, v, orc, pctU, cor };
    });
    rows.sort((a, b) => b.pctU - a.pctU);

    const html = rows.map(r => `
      <tr>
        <td><i class="cat-dot" style="background:${r.c.cor}"></i>${esc(r.c.nome)}</td>
        <td class="num">${brl(r.orc, true)}</td>
        <td class="num">${brl(r.v, true)}</td>
        <td class="num">${r.orc ? pct(r.pctU) : '—'}</td>
        <td class="num">${r.orc > 0 ? brl(r.orc - r.v, true) : '—'}</td>
        <td>${r.orc > 0 ? `<span class="st st-${r.cor}">${r.pctU > 1 ? 'Estourou' : (r.pctU > 0.85 ? 'Atenção' : 'OK')}</span>` : '<span class="st st-warn">sem base</span>'}</td>
      </tr>`).join('');
    const totV = rows.reduce((s, r) => s + r.v, 0);
    const totO = rows.reduce((s, r) => s + r.orc, 0);
    $('#tb-orcado tbody').innerHTML = html + `
      <tr class="tot"><td>Total</td><td class="num">${brl(totO, true)}</td><td class="num">${brl(totV, true)}</td>
      <td class="num">${totO ? pct(totV / totO) : '—'}</td><td class="num">${totO ? brl(totO - totV, true) : '—'}</td><td></td></tr>`;
    $('#orcado-nota').textContent = 'Limites orientativos = sua média mensal por categoria. Novas categorias: use os totais reais até criar histórico.';
  }

  function render503020(L) {
    const g = M.grupo50(L);
    const m = cf.metas;
    [['#m50', g.nec, +m.nec], ['#m30', g.desejo, +m.desejo], ['#m20', g.fin, +m.fin]].forEach(([sel, real, metaPct]) => {
      const bar = $(sel);
      const base = (cf.salario * metaPct / 100) || 1;
      bar.style.width = Math.min(100, Math.round(real / base * 100)) + '%';
      bar.style.background = real > base ? '#f59e0b' : 'linear-gradient(90deg,#34d399,#059669)';
    });
    const alvo = v => cf.salario * v / 100;
    $('#t50v').textContent = brl(g.nec) + ' de ' + brl(alvo(m.nec), true);
    $('#t50s').textContent = g.nec > alvo(m.nec) ? 'acima da meta' : 'dentro da meta';
    $('#t30v').textContent = brl(g.desejo) + ' de ' + brl(alvo(m.desejo), true);
    $('#t30s').textContent = g.desejo > alvo(m.desejo) ? 'acima da meta' : 'dentro da meta';
    $('#t20v').textContent = brl(g.fin) + ' de ' + brl(alvo(m.fin), true);
    $('#t20s').textContent = g.fin < alvo(m.fin) ? 'abaixo da meta' : 'meta batida';
    $('#meta-satal').textContent = 'renda base ' + brl(cf.salario, true);
  }

  function renderFormas(L) {
    const form = M.porForma(L);
    const tot = form.reduce((s, f) => s + f.v, 0);
    $('#tb-formas tbody').innerHTML = form.map(f => `
      <tr><td>${esc(f.forma)}</td><td class="num">${brl(f.v, true)}</td><td class="num">${pct(tot ? f.v / tot : null)}</td></tr>`).join('')
      || `<tr><td colspan="3" class="muted">Nenhum gasto no mês</td></tr>`;
  }

  function renderGraficos(L) {
    const porC = M.porCat(L).filter(r => r.cat.tipo !== 'receita');
    let seg = porC.slice(0, 8).map((r, i) => ({ label: r.cat.nome, v: r.v, cor: r.cat.cor || CH.paleta[i % CH.paleta.length] }));
    if (porC.length > 8) {
      const rest = porC.slice(7).reduce((s, d) => s + d.v, 0);
      seg = seg.slice(0, 7).concat([{ label: 'Outros', v: rest, cor: '#94a3b8' }]);
    }
    CH.mpie($('#g-pie'), seg, 'gasto no mês');

    const lev = optCats().map(c => ({
      label: c.nome, rx: c.nome.slice(0, 7), v: somaCat(L, c.id), cor: c.cor
    })).sort((a, b) => b.v - a.v).slice(0, 9);
    CH.mbars($('#g-barra'), lev, { limite: null });
  }
});

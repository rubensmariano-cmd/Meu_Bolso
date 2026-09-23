// =====================================================================
// Meu Bolso — Resumo anual
// =====================================================================
App.reg('resumo', () => {
  const st = Store.state;
  if (!st.lancamentos.length) return;
  const cf = cfg();

  const anos = [...new Set(st.lancamentos.map(L => L.ano).concat(cf.ano))].sort((a, b) => b - a);
  $('#ra-ano').innerHTML = anos.map(y => `<option value="${y}" ${y === cf.ano ? 'selected' : ''}>${y}</option>`).join('');
  $('#ra-ano').onchange = () => { cf.ano = +$('#ra-ano').value; Store.save(); render(cf.ano); };

  render(cf.ano);

  App.modules['resumo'] = () => {
    if (!Store.state.lancamentos.length) return;
    refreshAnos();
    render(cfg().ano);
  };
  function refreshAnos() {
    const anos = [...new Set(Store.state.lancamentos.map(L => L.ano).concat(cfg().ano))].sort((a, b) => b - a);
    $('#ra-ano').innerHTML = anos.map(y => `<option value="${y}" ${y === cfg().ano ? 'selected' : ''}>${y}</option>`).join('');
    $('#ra-ano').onchange = () => { cfg().ano = +$('#ra-ano').value; Store.save(); render(cfg().ano); };
  }

  function visaoGeral(y) {
    const linhas = [];
    [['Receitas', 'rec', 'pos'], ['Despesas', 'desp', 'neg'], ['Investimentos', 'inv', 'neg']].forEach(([label, k]) => {
      const vals = MESES.map((_, i) => totais(M.sel(i, y))[k]);
      linhas.push({ label, vals, soma: vals.reduce((a, b) => a + b, 0), kind: k });
    });
    const saldoM = MESES.map((_, i) => { const t = totais(M.sel(i, y)); return t.rec - t.desp - t.inv; });
    let ac = 0;
    const acu = saldoM.map(v => { ac += v; return ac; });
    linhas.push({ label: 'Saldo do mês', vals: saldoM, soma: saldoM.reduce((a, b) => a + b, 0), kind: 'saldo' });
    linhas.push({ label: 'Saldo acumulado', vals: acu, soma: ac, kind: 'acu' });
    const taxa = MESES.map((_, i) => { const t = totais(M.sel(i, y)); return t.rec > 0 ? (t.rec - t.desp - t.inv) / t.rec : null; });
    const tAno = totais(M.ano(y));
    const taxaAno = tAno.rec > 0 ? (tAno.rec - tAno.desp - tAno.inv) / tAno.rec : null;
    linhas.push({ label: 'Taxa de poupança', vals: taxa, soma: taxaAno, kind: 'taxa' });
    return { linhas, saldoM, acu };
  }

  function render(y) {
    const { linhas, acu } = visaoGeral(y);

    $('#ra-thead').innerHTML = ['', ...MESES_CURTO, 'Total', 'Média'].map(t => `<th>${t}</th>`).join('');
    $('#ra-tbody').innerHTML = linhas.map(L => {
      const valsHtml = L.vals.map(v => {
        if (L.kind === 'taxa') return `<td class="num ${v == null ? '' : (v >= 0 ? 'pos' : 'neg')}">${pct(v)}</td>`;
        const cls = (L.kind === 'saldo' || L.kind === 'acu') ? (v >= 0 ? 'pos' : 'neg') : L.kind;
        return `<td class="num ${cls}">${brl(v, true)}</td>`;
      }).join('');
      let soma;
      if (L.kind === 'taxa') soma = `<td class="num tot ${L.soma >= 0 ? 'pos' : 'neg'}">${pct(L.soma)}</td>`;
      else soma = `<td class="num tot ${(L.kind === 'saldo' || L.kind === 'acu') ? (L.soma >= 0 ? 'pos' : 'neg') : ''}">${brl(L.soma, true)}</td>`;
      const media = (L.kind === 'acu' || L.kind === 'taxa')
        ? '<td></td>' : `<td class="num">${brl(L.soma / 12, true)}</td>`;
      return `<tr><td class="lab">${L.label}</td>${valsHtml}${soma}${media}</tr>`;
    }).join('');

    // por categoria (colunas = meses)
    const g = {};
    cfg().categorias.forEach(c => g[c.id] = { nome: c.nome, cor: c.cor, vals: MESES.map(() => 0) });
    for (let m = 0; m < 12; m++) {
      M.sel(m, y).forEach(L => {
        const c = lcat(L);
        if (c) g[c.id].vals[m] += L.valor;
      });
    }
    const catRows = Object.values(g).map(c => ({ ...c, total: c.vals.reduce((a, b) => a + b, 0) }))
      .filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    $('#ra-cat-head').innerHTML = '<th>Categoria</th>' + MESES_CURTO.map(m => `<th>${m}</th>`).join('') + '<th>Total</th>';
    $('#ra-cat-body').innerHTML = catRows.map(c =>
      `<tr><td class="lab"><i class="cat-dot" style="background:${c.cor}"></i>${esc(c.nome)}</td>` +
      c.vals.map(v => `<td class="num">${v ? brl(v, true) : ''}</td>`).join('') +
      `<td class="num tot">${brl(c.total, true)}</td></tr>`).join('');

    // gráficos
    CH.mline($('#g-linha'), acu);
    const seg = catRows.filter(c => catByIdByName(c.nome)?.tipo !== 'receita')
      .slice(0, 8).map(c => ({ label: c.nome, v: c.total, cor: c.cor }));
    CH.mpie($('#g-pie-ra'), seg, 'despesas do ano');
  }
});

function catByIdByName(nome) { return cfg().categorias.find(c => c.nome === nome); }

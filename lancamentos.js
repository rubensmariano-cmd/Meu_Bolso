// =====================================================================
// Meu Bolso — Lançamentos (lista + formulário)
// =====================================================================
App.reg('lancamentos', () => {
  const st = Store.state;
  let filtro = { cat: '*', mes: -1, forma: '*', status: '*', q: '' };
  const mod = { render: null, abrirNovo: null };
  App.modules['lancamentos'] = mod;

  buildFiltros();
  buildFormSelects();
  render();

  function buildFiltros() {
    $('#f-cat').innerHTML = '<option value="*">Todas as categorias</option>' +
      cfg().categorias.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
    $('#f-forma').innerHTML = '<option value="*">Todas as formas</option>' +
      cfg().formas.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('');
    $('#f-mes').innerHTML = '<option value="-1">Todos os meses</option>' +
      MESES.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  }

  function buildFormSelects() {
    $('#l-cat').innerHTML = cfg().categorias.map(c =>
      `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
    $('#l-forma').innerHTML = cfg().formas.map(f =>
      `<option value="${esc(f)}">${esc(f)}</option>`).join('');
    // conforme a categoria muda, filtra os itens e sugere a forma mais usada
    $('#l-cat').onchange = () => { syncItens(); setFomaDefault(); };
    function syncItens() {
      const c = catById($('#l-cat').value);
      const atual = $('#l-item').value;
      $('#l-item').innerHTML = (c ? c.itens : []).map(i =>
        `<option value="${esc(i)}">${esc(i)}</option>`).join('');
      if (c && c.itens.includes(atual)) $('#l-item').value = atual;
    }
    syncItens();
    // filtros
    $('#f-cat').onchange = () => { filtro.cat = $('#f-cat').value; render(); };
    $('#f-mes').onchange = () => { filtro.mes = +$('#f-mes').value; render(); };
    $('#f-forma').onchange = () => { filtro.forma = $('#f-forma').value; render(); };
    $('#f-status').onchange = () => { filtro.status = $('#f-status').value; render(); };
    let t; $('#f-q').oninput = () => { clearTimeout(t); t = setTimeout(() => { filtro.q = $('#f-q').value.toLowerCase(); render(); }, 150); };
    $('#f-limpar').onclick = () => {
      filtro = { cat: '*', mes: -1, forma: '*', status: '*', q: '' };
      $('#f-q').value = ''; $('#f-cat').value = '*'; $('#f-mes').value = '-1';
      $('#f-forma').value = '*'; $('#f-status').value = '*'; render();
    };
  }

  function setFomaDefault() {
    const cId = $('#l-cat').value;
    const usados = st.lancamentos.filter(L => lcat(L)?.id === cId).map(L => L.forma);
    if (usados.length) {
      const cont = {};
      usados.forEach(f => cont[f] = (cont[f] || 0) + 1);
      $('#l-forma').value = Object.entries(cont).sort((a, b) => b[1] - a[1])[0][0];
    } else {
      $('#l-forma').value = cId === 'receitas' ? 'Transferência' : 'Pix';
    }
  }

  mod.abrirNovo = () => abrir(null);
  mod.render = render;

  function listFiltrada() {
    return st.lancamentos.filter(L => {
      if (filtro.cat !== '*' && lcat(L)?.id !== filtro.cat) return false;
      if (filtro.mes >= 0 && L.mes !== filtro.mes) return false;
      if (filtro.forma !== '*' && L.forma !== filtro.forma) return false;
      if (filtro.status === 'pago' && L.pendente) return false;
      if (filtro.status === 'pendente' && !L.pendente) return false;
      if (filtro.q && !(((L.desc || '') + ' ' + L.item).toLowerCase().includes(filtro.q))) return false;
      return true;
    }).sort((a, b) => b.ts - a.ts);
  }

  function render() {
    const l = listFiltrada();
    const list = $('#lanc-list');
    if (!l.length) {
      list.innerHTML = `<div class="empty">${ico('vazio')}<br>Nada por aqui.<br>Toque em <b>+</b> para lançar.</div>`;
      return;
    }
    const tot = l.reduce((s, L) => s + (lcat(L)?.tipo === 'receita' ? L.valor : -L.valor), 0);
    $('#lanc-meta').textContent = `${l.length} lançamento${l.length > 1 ? 's' : ''} · saldo ${tot >= 0 ? '+' : ''}${brl(tot, true)}`;
    list.innerHTML = l.map(L => {
      const c = lcat(L);
      const cls = c?.tipo === 'receita' ? 'pos' : (c?.tipo === 'investimento' ? 'inv' : 'neg');
      const sinal = c?.tipo === 'receita' ? '+' : '−';
      const iniciais = (c?.nome || L.item || '?').replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 2).toUpperCase();
      return `<div class="row ${L.pendente ? 'pend' : ''}" data-id="${L.id}">
        <span class="icone" style="background:${hexFundo(c?.cor || '#94a3b8')};color:${c?.cor || '#475569'}">${esc(iniciais)}</span>
        <div class="grow">
          <div class="t">${esc(L.desc || L.item)}</div>
          <div class="sub">${fmtBR(L.ts)} · ${esc(L.item)} · ${esc(L.forma)}</div>
        </div>
        <div class="end">
          <div class="val ${cls}">
            ${L.pendente ? `<span class="seta">${ico('relogio')}</span>` : (c?.tipo === 'receita' ? `<span class="seta">${ico('setaCima')}</span>` : `<span class="seta">${ico('setaBaixo')}</span>`)}
            ${sinal}R$ ${L.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          ${L.pendente ? '<span class="st st-pend"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>a pagar</span>' : ''}
        </div>
      </div>`;
    }).join('');
    $$('#lanc-list .row').forEach(row => on(row, 'click', () => abrir(row.dataset.id)));
  }

  function abrir(id) {
    const s = $('#sheet');
    $('#veil').style.opacity = '1';
    $('#veil').style.pointerEvents = 'auto';
    s.hidden = false;
    if (id == null) {
      $('#sheet-t').textContent = 'Novo lançamento';
      s.dataset.id = '';
      $('#l-data').value = fmtBR(Date.now());
      $('#l-valor').value = ''; $('#l-desc').value = '';
      $('#l-cat').value = 'subsistencia'; syncItensPublic(); setFomaDefault();
      $('#l-pend').checked = false;
    } else {
      $('#sheet-t').textContent = 'Editar lançamento';
      s.dataset.id = id;
      const L = st.lancamentos.find(x => x.id === id);
      $('#l-data').value = fmtBR(L.ts);
      $('#l-cat').value = lcat(L)?.id || 'outros';
      syncItensPublic();
      $('#l-item').value = L.item;
      $('#l-desc').value = L.desc || '';
      $('#l-forma').value = L.forma;
      $('#l-valor').value = L.valor.toFixed(2);
      $('#l-pend').checked = !!L.pendente;
    }
    setTimeout(() => s.classList.add('show'), 10);
    setTimeout(() => $('#l-valor').focus(), 120);
  }

  function syncItensPublic() {
    const c = catById($('#l-cat').value);
    $('#l-item').innerHTML = (c ? c.itens : []).map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('');
  }

  function fecharSheet() {
    const s = $('#sheet');
    s.classList.remove('show');
    $('#veil').style.opacity = '0';
    $('#veil').style.pointerEvents = 'none';
    setTimeout(() => { s.hidden = true; }, 200);
  }
  on($('#sheet-cancel'), 'click', fecharSheet);
  on($('#veil'), 'click', fecharSheet);
  on($('#sheet-del'), 'click', () => {
    const id = $('#sheet').dataset.id;
    if (!id) return fecharSheet();
    Dialogo.confirmacao('Excluir este lançamento?', () => {
      st.lancamentos = st.lancamentos.filter(x => x.id !== id);
      Store.save(); fecharSheet(); render(); redesenhaDerivados();
    });
  });
  on($('#sheet-save'), 'click', () => {
    const ts = parseBR($('#l-data').value);
    if (!ts) return Dialogo.alerta('Data inválida. Use dd/mm/aaaa.');
    const valor = num($('#l-valor').value);
    if (!(valor > 0)) return Dialogo.alerta('Informe um valor maior que zero.');
    const item = $('#l-item').value;
    const catId = $('#l-cat').value;
    const d = new Date(ts);
    const L = {
      id: $('#sheet').dataset.id || 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      ts, ano: d.getFullYear(), mes: d.getMonth(),
      item, desc: $('#l-desc').value.trim(),
      forma: $('#l-forma').value, valor,
      pendente: $('#l-pend').checked,
      catId
    };
    const i = st.lancamentos.findIndex(x => x.id === L.id);
    if (i >= 0) st.lancamentos[i] = L; else st.lancamentos.push(L);
    Store.save(); fecharSheet(); render(); redesenhaDerivados();
  });

  function redesenhaDerivados() {
    if (App.modules.resumo) App.modules.resumo();
    if (App.modules['dashboard']) App.modules['dashboard']();
  }
});

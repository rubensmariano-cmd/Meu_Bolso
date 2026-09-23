// =====================================================================
// Meu Bolso — Configurações
// =====================================================================
App.reg('config', () => {
  const st = Store.state;
  const cf = cfg();

  $('#cfg-salario').value = cf.salario;
  $('#cfg-mnec').value = cf.metas.nec;
  $('#cfg-mdesejo').value = cf.metas.desejo;
  $('#cfg-mfin').value = cf.metas.fin;
  renderListaCats();
  renderFormas();

  on($('#cfg-salario'), 'change', () => { cf.salario = num($('#cfg-salario').value) || 0; Store.save(); });
  on($('#cfg-mnec'), 'change', () => validarMetas());
  on($('#cfg-mdesejo'), 'change', () => validarMetas());
  on($('#cfg-mfin'), 'change', () => validarMetas());
  on($('#cfg-addcat'), 'click', () => {
    Dialogo.perguntar('Nova categoria', '', nome => {
      if (!nome || !nome.trim()) return;
      const cor = ['#2563eb', '#16a34a', '#dc2626', '#ea580c', '#7c3aed', '#0891b2', '#db2777', '#a16207', '#4f46e5', '#64748b'][cf.categorias.length % 10];
      cf.categorias.push({ id: 'c' + Date.now().toString(36), nome: nome.trim(), tipo: 'despesa', cor, itens: [nome.trim()] });
      Store.save(); renderListaCats();
    });
  });

  function validarMetas() {
    const vals = ['#cfg-mnec', '#cfg-mdesejo', '#cfg-mfin'].map(s => num($(s).value) || 0);
    const soma = vals.reduce((a, b) => a + b, 0);
    $('#cfg-meta-total').textContent = `Total: ${soma}% ${soma === 100 ? '✓' : '(o ideal é somar 100%)'}`;
    if (soma === 100) {
      cf.metas = { nec: vals[0], desejo: vals[1], fin: vals[2] };
      Store.save();
    }
  }
  validarMetas();

  function renderListaCats() {
    $('#cfg-cats').innerHTML = cf.categorias.map(c => `
      <div class="cfg-row">
        <span class="dot" style="background:${c.cor}"></span>
        <span class="grow"><b>${esc(c.nome)}</b><span class="sub">${c.itens.join(' · ')}</span></span>
        <span class="tag ${c.tipo}">${TIPO_TXT[c.tipo]}</span>
      </div>`).join('');
  }

  function renderFormas() {
    $('#cfg-formas').textContent = cf.formas.join(' · ');
  }

  // ------------------------- dados / backup / demo -------------------------
  on($('#btn-exportar'), 'click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `meu-bolso-dados-${cf.ano}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  on($('#btn-importar'), 'click', () => $('#inp-importar').click());
  on($('#inp-importar'), 'change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result);
        if (!data.cfg || !data.lancamentos) throw new Error('formato');
        Dialogo.confirmacao(`Substituir os dados atuais por ${data.lancamentos.length} lançamentos do arquivo?`, () => {
          Store.state = data; Store.save(); location.reload();
        });
      } catch (err) { Dialogo.alerta('Arquivo inválido.'); }
    };
    rd.readAsText(file);
  });
  on($('#btn-demo'), 'click', () => {
    if (st.lancamentos.length) {
      Dialogo.confirmacao('Recarregar a demonstração? Seus lançamentos atuais serão substituídos.', () => { recarregarDemo(); });
    } else recarregarDemo();
  });
  function recarregarDemo() {
    Store.state = { cfg: JSON.parse(JSON.stringify(CFG_DEFAULT)), lancamentos: Demo.gerar() };
    Store.save(); location.reload();
  }
  on($('#btn-limpar'), 'click', () => {
    if (!st.lancamentos.length) return Dialogo.alerta('Não há lançamentos para apagar.');
    Dialogo.confirmacao('Apagar TODOS os lançamentos? (as categorias ficam). Dica: exporte um backup antes.', () => {
      st.lancamentos = []; Store.save(); location.reload();
    });
  });
});

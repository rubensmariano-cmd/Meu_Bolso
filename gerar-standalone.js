// Gera "Meu Bolso - App Autônomo.html" (arquivo único, sem dependências).
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const ler = f => fs.readFileSync(path.join(DIR, f), 'utf8');

const css = ler('estilos.css');
const js = [
  'consts.js', 'util.js', 'demo.js', 'app.js', 'compute.js', 'chart.js',
  'navegacao.js', 'dashboard.js', 'lancamentos.js', 'resumo.js', 'config.js'
].map(ler).join('\n;\n');

const boot = `
(function () {
  if (Store.load()) { /* ok */ }
  App.init();
})();
`;

const iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Meu Bolso · Controle financeiro</title>
<meta name="description" content="Meu Bolso: controle financeiro pessoal offline — lançamentos, painel do mês e resumo anual.">
<meta name="theme-color" content="#059669">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#059669"/><rect x="22" y="36" width="56" height="34" rx="6" fill="#fff"/><rect x="22" y="36" width="56" height="12" fill="#065f46"/></svg>')}">
<style>
${css}
</style>
</head>
<body>

<section id="tela-Painel" data-tela>
  <header class="hdr" style="border-radius:0 0 22px 22px">
    <div class="hdr-top">
      <h1><span class="logo">${iconSVG}</span>Meu Bolso<small>controle financeiro pessoal</small></h1>
      <div class="privacy"><button id="chk-ocultar-lbl" onclick="toggleOcultar()" title="Esconder valores"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
    </div>
    <div class="seletor">
      <select id="mes-sel" aria-label="Mês"></select>
      <select id="ano-sel" aria-label="Ano" style="flex:0 0 96px"></select>
      <label class="oculta"><input type="checkbox" id="chk-ocultar"> esconder</label>
    </div>
  </header>
  <div class="app">
    <h2 id="title-mes" style="font-size:16px;font-weight:800;margin:4px 0 10px"></h2>
    <div class="grid-kpi">
      <div class="kpi"><div class="k">Receitas</div><div class="v pos big" id="k-rec">—</div></div>
      <div class="kpi"><div class="k">Despesas</div><div class="v" id="k-desp">—</div></div>
      <div class="kpi"><div class="k">Investido</div><div class="v" id="k-inv">—</div></div>
      <div class="kpi"><div class="k">Sobra do mês</div><div class="v" id="k-saldo">—</div></div>
      <div class="kpi"><div class="k">Taxa de poupança</div><div class="v" id="k-taxa">—</div></div>
      <div class="kpi"><div class="k">A pagar (pendente)</div><div class="v" id="k-pend">—</div></div>
    </div>
    <div class="acc" id="acc">—</div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="lista"></span> Orçado × Realizado</span><small style="color:var(--tinta3);font-weight:600;font-size:11px">por categoria</small></h2>
      <div class="rolagem">
        <table id="tb-orcado">
          <thead><tr><th>Categoria</th><th>Orçado</th><th>Real</th><th>% usado</th><th>Folga</th><th></th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <p class="nota" id="orcado-nota"></p>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="balanca"></span> Regra 50/30/20</span><small id="meta-satal" style="color:var(--tinta3);font-weight:600;font-size:11px"></small></h2>
      <div class="g50">
        <div class="linha">
          <div class="topo"><b>Necessidades · 50%</b><span class="stado" id="t50s">—</span></div>
          <div class="barra"><i id="m50"></i></div>
          <div class="topo" style="margin-top:4px"><span id="t50v">—</span><span></span></div>
        </div>
        <div class="linha">
          <div class="topo"><b>Desejos · 30%</b><span class="stado" id="t30s">—</span></div>
          <div class="barra"><i id="m30"></i></div>
          <div class="topo" style="margin-top:4px"><span id="t30v">—</span><span></span></div>
        </div>
        <div class="linha">
          <div class="topo"><b>Metas financeiras · 20%</b><span class="stado" id="t20s">—</span></div>
          <div class="barra"><i id="m20"></i></div>
          <div class="topo" style="margin-top:4px"><span id="t20v">—</span><span></span></div>
        </div>
        <p class="tele">Metas = investimentos + pagamento de dívidas. Ajuste os % em Configurações.</p>
      </div>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="cartao"></span> Como você paga</span></h2>
      <table id="tb-formas">
        <thead><tr><th>Forma</th><th>Valor</th><th>%</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="pizza"></span> Para onde foi o dinheiro</span></h2>
      <canvas class="pie" id="g-pie"></canvas>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="grafico"></span> Maiores categorias do mês</span></h2>
      <canvas id="g-barra"></canvas>
    </div>
  </div>
</section>

<section id="tela-Lançamentos" data-tela hidden>
  <header class="hdr"><div class="hdr-top"><h1>Lançamentos</h1></div></header>
  <div class="app">
    <div class="lista-head">
      <span class="meta" id="lanc-meta"></span>
      <button style="font-size:12px;color:var(--tinta3)" onclick="toggleFiltros()">filtros ▾</button>
    </div>
    <div class="filtros" id="filtros" hidden>
      <select id="f-cat"></select>
      <select id="f-mes"></select>
      <select id="f-forma"></select>
      <select id="f-status">
        <option value="*">Todos os status</option>
        <option value="pago">Pagos</option>
        <option value="pendente">Pendentes</option>
      </select>
      <input class="larga" id="f-q" placeholder="Buscar descrição ou categoria…">
      <button class="btn btn-fantasma larga" id="f-limpar">limpar filtros</button>
    </div>
    <div id="lanc-list"></div>
  </div>
</section>

<section id="tela-Resumo" data-tela hidden>
  <header class="hdr">
    <div class="hdr-top"><h1>Resumo do ano</h1><div>
      <select id="ra-ano" style="width:auto;background:#fff;border:none;font-weight:700;padding:6px 10px;border-radius:9px"></select>
    </div></div>
  </header>
  <div class="app">
    <div class="carta">
      <h2><span><span class="ic" data-ico="calend"></span> Visão geral</span></h2>
      <div class="rolagem">
        <table>
          <thead id="ra-thead"></thead>
          <tbody id="ra-tbody"></tbody>
        </table>
      </div>
    </div>
    <div class="carta">
      <h2><span><span class="ic" data-ico="banco"></span> Saldo acumulado</span></h2>
      <canvas class="grande" id="g-linha"></canvas>
    </div>
    <div class="carta">
      <h2><span><span class="ic" data-ico="lista"></span> Gasto por categoria</span></h2>
      <div class="rolagem">
        <table>
          <thead id="ra-cat-head"></thead>
          <tbody id="ra-cat-body"></tbody>
        </table>
      </div>
    </div>
    <div class="carta">
      <h2><span><span class="ic" data-ico="pizza"></span> Despesas do ano</span></h2>
      <canvas class="pie" id="g-pie-ra"></canvas>
    </div>
  </div>
</section>

<section id="tela-Config" data-tela hidden>
  <header class="hdr"><div class="hdr-top"><h1>Configurações</h1></div></header>
  <div class="app">
    <div class="carta">
      <h2><span><span class="ic" data-ico="alvo"></span> Sua renda e metas</span></h2>
      <div class="cfg-campo"><label>Renda mensal de referência (R$)</label><input id="cfg-salario" inputmode="decimal"></div>
      <div class="cfg-campo"><label>Regra 50/30/20 — Necessidades %</label><input id="cfg-mnec" inputmode="numeric"></div>
      <div class="cfg-campo"><label>Desejos %</label><input id="cfg-mdesejo" inputmode="numeric"></div>
      <div class="cfg-campo"><label>Metas financeiras %</label><input id="cfg-mfin" inputmode="numeric"></div>
      <p class="meta-total" id="cfg-meta-total"></p>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="lista"></span> Categorias</span>
        <button class="btn-fantasma" id="cfg-addcat" style="font-size:12px;padding:5px 11px;border-radius:9px;background:#f1f5f9;font-weight:700">+ nova</button></h2>
      <div id="cfg-cats"></div>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="cartao"></span> Formas de pagamento</span></h2>
      <p class="sub" id="cfg-formas" style="font-size:13px;color:var(--tinta2)"></p>
    </div>

    <div class="carta">
      <h2><span><span class="ic" data-ico="vazio"></span> Seus dados</span></h2>
      <p class="nota" style="margin-bottom:10px">Tudo fica salvo só neste aparelho (nada vai pra nuvem). Exporte um backup de vez em quando e leve-o com você.</p>
      <div class="acoes" style="flex-direction:column">
        <button class="btn btn-verde" id="btn-exportar">Exportar backup (.json)</button>
        <button class="btn btn-fantasma" id="btn-importar">Importar backup</button>
        <input type="file" id="inp-importar" accept="application/json" hidden>
        <button class="btn btn-fantasma" id="btn-demo">Recarregar dados de demonstração</button>
        <button class="btn" id="btn-limpar" style="color:var(--vermelho)">Apagar todos os lançamentos</button>
      </div>
    </div>
    <p class="nota" style="text-align:center;margin:4px 0 12px">Meu Bolso · feito à mão, os dados são seus.</p>
  </div>
</section>

<div class="veil" id="veil"></div>
<div class="sheet" id="sheet" hidden>
  <div class="puxa"></div>
  <h3 id="sheet-t">Novo lançamento</h3>
  <div class="campo"><label>Data</label><input id="l-data" placeholder="dd/mm/aaaa" inputmode="numeric"></div>
  <div class="dupla">
    <div class="campo"><label>Categoria</label><select id="l-cat"></select></div>
    <div class="campo"><label>Item</label><select id="l-item"></select></div>
  </div>
  <div class="campo"><label>Descrição (opcional)</label><input id="l-desc" placeholder="ex.: mercado da semana"></div>
  <div class="dupla">
    <div class="campo"><label>Forma de pagamento</label><select id="l-forma"></select></div>
    <div class="campo"><label>Valor (R$)</label><input id="l-valor" inputmode="decimal" placeholder="0,00"></div>
  </div>
  <label style="display:flex;align-items:center;gap:8px;margin:4px 0 14px;font-size:14px;font-weight:600">
    <input type="checkbox" id="l-pend" style="width:auto"> Ainda não paguei (pendente)
  </label>
  <div class="acoes">
    <button class="btn btn-fantasma" id="sheet-cancel">Cancelar</button>
    <button class="btn btn-verde" id="sheet-save">Salvar</button>
  </div>
  <button class="btn-apagar" id="sheet-del">Excluir este lançamento</button>
</div>

<div class="dlg-veu" id="dlg" hidden>
  <div class="dlg">
    <h4 id="dlg-t"></h4>
    <p id="dlg-p"></p>
    <input id="dlg-i" placeholder="Digite aqui" hidden>
    <div class="acao"><button class="btn btn-fantasma" id="dlg-nao">Cancelar</button><button class="btn btn-verde" id="dlg-sim">OK</button></div>
  </div>
</div>

<nav class="tabbar" id="tabbar">
  <button data-tab="Painel"><span class="ti" data-ico="carteira"></span>Painel</button>
  <button data-tab="Lançamentos"><span class="ti" data-ico="lista"></span>Lançamentos</button>
  <button data-tab="Resumo"><span class="ti" data-ico="grafico"></span>Resumo</button>
  <button data-tab="Config"><span class="ti" data-ico="engre"></span>Config</button>
</nav>
<button class="fab hide" id="fab" onclick="abrirNovo()">+</button>

<script>
${js}

${boot}
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(DIR, 'Meu Bolso - App Autônomo.html'), html);
console.log('gerado:', 'Meu Bolso - App Autônomo.html', '(', (html.length / 1024).toFixed(0), 'KB )');

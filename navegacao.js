// =====================================================================
// Meu Bolso — navegação entre telas + comportamentos globais
// =====================================================================
let abaAtiva = 'Painel';

window.toggleOcultar = function () {
  const cb = $('#chk-ocultar');
  cb.checked = !cb.checked;
  window.__oculta = cb.checked;
  App.modules['dashboard'] && App.modules['dashboard']();
};
window.toggleFiltros = function () {
  const f = $('#filtros');
  f.hidden = !f.hidden;
};
window.abrirNovo = function () {
  if (abaAtiva !== 'Lançamentos') trocar('Lançamentos');
  const mod = App.modules['lancamentos'];
  if (mod && mod.abrirNovo) mod.abrirNovo();
};

App.reg('nav', () => {
  const botoes = $$('#tabbar button');
  botoes.forEach(b => b.onclick = () => trocar(b.dataset.tab));
  const fab = $('#fab');

  window.trocar = function trocar(tab, inicial) {
    abaAtiva = tab;
    $$('[data-tela]').forEach(s => s.hidden = true);
    const alvo = $('#tela-' + tab);
    if (alvo) alvo.hidden = false;
    botoes.forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    // o botão "+" fica sempre disponível
    fab.classList.remove('hide');
    if (tab === 'Lançamentos' && App.modules['lancamentos'] && App.modules['lancamentos'].render) {
      App.modules['lancamentos'].render();
    }
    window.scrollTo(0, 0);
  };

  trocar('Painel');
});

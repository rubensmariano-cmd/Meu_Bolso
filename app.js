// =====================================================================
// Meu Bolso — núcleo: registro de módulos, persistência, ícones e diálogos
// =====================================================================
const App = {
  modules: {},
  reg(nome, fn) { this.modules[nome] = fn; },
  init() {
    injetarIcones();
    Object.entries(this.modules).forEach(([n, fn]) => {
      try { fn(); } catch (e) { console.error('[meubolso:' + n + ']', e); }
    });
  }
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// ------------------------------------------------ ícones (SVG stroke)
const S = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONS = {
  carteira: S('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
  lista: S('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>'),
  grafico: S('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
  engre: S('<circle cx="12" cy="12" r="3"/><path d="M12 2a2 2 0 0 1 2 2v1.15a7 7 0 0 1 1.42.59l.86-.49a2 2 0 0 1 2.73.73l.22.38a2 2 0 0 1-.73 2.73l-.29.17a7 7 0 0 1 0 1.48l.29.17a2 2 0 0 1 .73 2.73l-.22.38a2 2 0 0 1-2.73.73l-.86-.49a7 7 0 0 1-1.42.59V20a2 2 0 0 1-2 2h-.45a2 2 0 0 1-2-2v-.85a7 7 0 0 1-1.42-.59l-.86.49a2 2 0 0 1-2.73-.73l-.22-.38a2 2 0 0 1 .73-2.73l.29-.17a7 7 0 0 1 0-1.48l-.29-.17a2 2 0 0 1-.73-2.73l.22-.38a2 2 0 0 1 2.73-.73l.86.49a7 7 0 0 1 1.42-.59V4a2 2 0 0 1 2-2z"/>'),
  balanca: S('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>'),
  alvo: S('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  cartao: S('<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'),
  pizza: S('<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>'),
  banco: S('<path d="m3 21 18 0"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 14v3"/><path d="M12 14v3"/><path d="M16 14v3"/>'),
  calend: S('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  vazio: S('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>'),
  setaCima: S('<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'),
  setaBaixo: S('<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>'),
  relogio: S('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  moeda: S('<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="12" y1="2" x2="12" y2="6"/>'),
  graficoBarras: S('<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>')
};
const ico = id => ICONS[id] || '';
function injetarIcones() {
  document.querySelectorAll('[data-ico]').forEach(el => { el.innerHTML = ico(el.dataset.ico); });
}

// ------------------------------------------------ armazenamento local
// usa localStorage quando disponível; caso contrário (ex.: preview
// restrito), guarda em memória para o app continuar funcionando.
const Store = {
  K: 'meu-bolso-v1',
  state: null,
  memoria: null,
  ler() { try { return localStorage.getItem(this.K); } catch (e) { return this.memoria; } },
  gravar(v) {
    this.memoria = v;
    try { localStorage.setItem(this.K, v); } catch (e) { /* sem persistência */ }
  },
  load() {
    let s = null;
    try { s = this.ler() ? JSON.parse(this.ler()) : null; } catch (e) { s = null; }
    if (!s || !s.cfg || !Array.isArray(s.lancamentos)) {
      s = { cfg: JSON.parse(JSON.stringify(CFG_DEFAULT)), lancamentos: Demo.gerar() };
      this.gravar(JSON.stringify(s));
    }
    s.cfg = Object.assign({}, CFG_DEFAULT, s.cfg || {});
    s.cfg.metas = Object.assign({}, CFG_DEFAULT.metas, s.cfg.metas || {});
    if (!Array.isArray(s.cfg.categorias) || !s.cfg.categorias.length)
      s.cfg.categorias = JSON.parse(JSON.stringify(CFG_DEFAULT.categorias));
    if (!Array.isArray(s.cfg.formas) || !s.cfg.formas.length)
      s.cfg.formas = CFG_DEFAULT.formas.slice();
    s.lancamentos.forEach(L => {
      if (typeof L.valor === 'string') L.valor = num(L.valor);
      if (!L.desc) L.desc = '';
      L.pendente = !!L.pendente;
      if (L.catId == null) L.catId = resolveId(L.item);
    });
    this.state = s;
    return s;
  },
  save() { try { this.gravar(JSON.stringify(this.state)); } catch (e) { /* cheio */ } }
};

// ------------------------------------------------ acesso a config
const cfg = () => Store.state.cfg;
const optCats = () => cfg().categorias.filter(c => c.tipo !== 'receita');
const catById = id => cfg().categorias.find(c => c.id === id);
const lcat = L => {
  if (L && L.catId) { const c = catById(L.catId); if (c) return c; }
  return cfg().categorias.find(c => c.itens.indexOf(L.item) >= 0) || null;
};
function resolveId(item) {
  const c = cfg().categorias.find(c => c.itens.indexOf(item) >= 0);
  return c ? c.id : 'outros';
}

// ------------------------------------------------ diálogos próprios
// (alert/confirm nativos são bloqueados em previews restritos)
const Dialogo = {
  _campos: null,
  _fnOk: null,
  campos() {
    if (this._campos) return this._campos;
    const veu = $('#dlg');
    const c = {
      veu, titulo: $('#dlg-t'), texto: $('#dlg-p'), entrada: $('#dlg-i'),
      sim: $('#dlg-sim'), nao: $('#dlg-nao')
    };
    c.veu.addEventListener('click', e => { if (e.target === c.veu) this.fechar(); });
    this._campos = c;
    return c;
  },
  fechar() { const c = this.campos(); c.veu.hidden = true; this._fnOk = null; },
  abrir(opts, onOk) {
    const c = this.campos();
    c.titulo.textContent = opts.titulo || '';
    c.texto.textContent = opts.texto || '';
    c.entrada.hidden = !opts.entrada;
    if (opts.entrada) c.entrada.value = opts.valor || '';
    c.nao.hidden = !!opts.soOk;
    c.sim.textContent = opts.sim || 'OK';
    c.nao.textContent = opts.nao || 'Cancelar';
    this._fnOk = opts.entrada
      ? () => { const v = c.entrada.value.trim(); this.fechar(); onOk && onOk(v); }
      : () => { this.fechar(); onOk && onOk(); };
    c.sim.onclick = () => this._fnOk && this._fnOk();
    c.nao.onclick = () => this.fechar();
    c.veu.hidden = false;
    if (opts.entrada) setTimeout(() => c.entrada.focus(), 40);
  },
  alerta(msg, onOk) { this.abrir({ titulo: 'Aviso', texto: msg, soOk: true, sim: 'Entendi' }, onOk); },
  confirmacao(msg, onOk) { this.abrir({ titulo: 'Confirmar', texto: msg, sim: 'Sim', nao: 'Não' }, onOk); },
  perguntar(titulo, valorInicial, onOk) {
    this.abrir({ titulo, entrada: true, valor: valorInicial, sim: 'Criar', nao: 'Cancelar' }, onOk);
    const c = this.campos();
    if (c.entrada) c.entrada.placeholder = 'Nome da categoria…';
  }
};

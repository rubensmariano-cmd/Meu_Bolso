// =====================================================================
// Meu Bolso — utilitários (formatação, moeda, parse, data)
// =====================================================================
const brl = (v, md = false) => {
  if (v == null || isNaN(v)) return '—';
  const abs = Math.abs(v);
  const opt = md || abs >= 1000000 || abs < 1;
  return opt
    ? 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const pct = v => (v == null || !isFinite(v)) ? '—' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

const num = s => {
  if (typeof s === 'number') return s;
  if (!s) return NaN;
  const t = String(s).replace(/[R$\s.]/g, '').replace(',', '.');
  const v = parseFloat(t);
  return isNaN(v) ? NaN : v;
};

const hoje = () => {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
};

const dh = x => Math.floor(Math.abs(x) / 86400000);

const parseBR = s => {
  if (!s) return null;
  s = String(s).trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return +new Date(+m[3], +m[2] - 1, +m[1]);
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return +new Date(+m[1], +m[2] - 1, +m[3]);
  const t = Date.parse(s);
  return isNaN(t) ? null : t;
};

const fmtBR = t => {
  const d = new Date(t);
  return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
};

// cria um fundo claro a partir de uma cor hex (#rrggbb) — tom pastel
function hexFundo(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return '#f1f5f9';
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  return `rgba(${r},${g},${b},0.13)`;
}

const key = t => { const d = new Date(t); return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}`; };

const diasNoMes = ano => {
  const n = new Date(ano, 11, 31);
  return Array.from({ length: 366 }, (_, i) => +new Date(ano, 0, 1 + i)).filter(t => t <= +n);
};

const fmtDescricao = (d, item) => `${fmtBR(d)}${item ? ' · ' + item : ''}`;

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

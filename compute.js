// =====================================================================
// Meu Bolso — cálculos e agregadores
// =====================================================================
const ext = (arr, m, y) => arr.filter(L => L.ano === y && L.mes === m);
const extAno = (arr, y) => arr.filter(L => L.ano === y);

// soma os lançamentos de uma categoria (despesas entram positivas)
const somaCat = (arr, catId) => arr.reduce((s, L) => (lcat(L)?.id === catId ? s + L.valor : s), 0);

function totais(arr) {
  let rec = 0, desp = 0, inv = 0, pend = 0;
  arr.forEach(L => {
    const c = lcat(L);
    if (!c) return;
    if (c.tipo === 'receita') rec += L.valor;
    else if (c.tipo === 'investimento') inv += L.valor;
    else if (L.pendente) pend += L.valor;
    else desp += L.valor;
  });
  return { rec, desp, inv, pend };
}

const M = {
  sel(m, y) { return ext(Store.state.lancamentos, m, y); },
  ano(y) { return extAno(Store.state.lancamentos, y); },
  totais: totais,

  porCat(arr) { // total por categoria (todas, inclui receitas)
    const res = [];
    cfg().categorias.forEach(c => {
      const v = somaCat(arr, c.id);
      if (v > 0) res.push({ cat: c, v });
    });
    return res.sort((a, b) => b.v - a.v);
  },

  porForma(arr) {
    const m = new Map();
    arr.forEach(L => { if (!L.pendente) m.set(L.forma, (m.get(L.forma) || 0) + L.valor); });
    return [...m.entries()].map(([forma, v]) => ({ forma, v })).sort((a, b) => b.v - a.v);
  },

  grupo50(arr) {
    const grp = { nec: 0, desejo: 0, fin: 0 };
    cfg().categorias.forEach(c => {
      const g = CFG_50_30_20[c.id];
      if (g && c.tipo !== 'receita') grp[g] += somaCat(arr, c.id);
    });
    return grp;
  },

  // limite orientativo: média mensal da categoria no ano, por catId
  mediaCategoria(catId, y) {
    const total = somaCat(extAno(Store.state.lancamentos, y), catId);
    return total / 12;
  }
};

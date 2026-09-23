// =====================================================================
// Meu Bolso — dados de demonstração (2025 completo + 2026 até hoje)
// Orçamento realista: ~90% da renda em gastos, sobra pequena.
// =====================================================================
const Demo = {
  gerar() {
    const L = [];
    let idn = 0;
    const catDoItem = item => (CFG_DEFAULT.categorias.find(c => c.itens.indexOf(item) >= 0) || {}).id || 'outros';
    const add = (ano, mes, dia, item, desc, forma, valor, pendente = false) => {
      L.push({
        id: 'd' + (++idn), ts: +new Date(ano, mes, dia),
        ano, mes, item, desc, forma, valor, pendente,
        catId: catDoItem(item)
      });
    };
    const r = (min, max) => Math.round(min + Math.random() * (max - min));

    // contas fixas mensais
    const fixas = [
      ['Energia', 8, 210], ['Água', 10, 115], ['Gás', 10, 100], ['Telefone', 12, 62],
      ['Internet', 12, 97], ['Plano de saúde', 10, 425], ['Academia', 11, 90],
      ['Streaming', 12, 58], ['Aplicativos', 12, 25], ['Pet', 14, 130]
    ];

    // gera um mês "normal", sem pendência
    function mesCheio(ano, m, sal, freela) {
      add(ano, m, 5, 'Salário', 'Salário mensal', 'Transferência', sal);
      if (freela) add(ano, m, 7, 'Renda extra', 'Freela', 'Pix', freela);
      add(ano, m, 9, 'Rendimentos', 'CDB / rendimentos', 'Pix', 250);
      if (m === 6) add(ano, m, 15, 'Renda extra', '13º parcial', 'Transferência', 1200);
      if (m === 11) add(ano, m, 15, 'Renda extra', '13º', 'Transferência', 1800);

      // investimento mensal
      add(ano, m, 3, 'Reserva de emergência', 'Aporte mensal', 'Pix', 800);

      // contas fixas
      fixas.forEach(([it, d, v]) => add(ano, m, d, it, 'Conta mensal', 'Débito automático', v + (m % 3) * 8));

      // supermercado e alimentação
      for (let i = 0; i < 5; i++) add(ano, m, 2 + i * 6, 'Mercado', 'Compra do mês', i % 3 === 2 ? 'Cartão de crédito' : 'Pix', r(240, 380));
      for (let i = 0; i < 4; i++) add(ano, m, 3 + i * 7, 'Hortifruti', 'Hortifruti', 'Pix', r(55, 90));
      for (let i = 0; i < 4; i++) add(ano, m, 3 + i * 7, 'Padaria', 'Padaria', 'Pix', r(30, 55));
      for (let i = 0; i < 3; i++) add(ano, m, 5 + i * 8, 'Açougue', 'Açougue', 'Pix', r(85, 130));
      for (let i = 0; i < 5; i++) add(ano, m, 4 + i * 5, 'Alimentação fora', 'Comer fora', 'Cartão de crédito', r(50, 120));
      add(ano, m, 20, 'Delivery', 'Delivery', 'Cartão de crédito', r(90, 180));

      // transporte
      for (let i = 0; i < 3; i++) add(ano, m, 4 + i * 8, 'Gasolina', 'Tanque', 'Cartão de débito', r(210, 280));
      add(ano, m, 12, 'Transporte público', 'Recarga', 'Pix', r(60, 120));

      // saúde, cuidados e lazer
      add(ano, m, 6, 'Farmácia', 'Farmácia', 'Pix', r(90, 170));
      add(ano, m, 19, 'Lazer', 'Lazer do mês', 'Pix', r(120, 260));
      add(ano, m, 22, 'Cuidados pessoais', 'Cuidados', 'Pix', r(80, 160));
      if (m % 2 === 0) add(ano, m, 20, 'Vestuário', 'Roupa / calçado', 'Cartão de crédito', r(150, 320));
      if (m % 4 === 2) add(ano, m, 20, 'Presentes', 'Presente', 'Pix', r(100, 200));

      // educação
      add(ano, m, 10, 'Cursos', 'Curso / idioma', 'Boleto', 350);

      // dívidas (parcelas recorrentes)
      add(ano, m, 5, 'Cartão (fatura em atraso)', 'Parcela do acordo', 'Pix', 480);
      add(ano, m, 16, 'Empréstimo', 'Parcela do empréstimo', 'Boleto', 420);

      // despesas sazonais
      if (m === 0 || m === 1 || m === 2) add(ano, m, 15, 'IPVA', 'IPVA (parcela)', 'Boleto', 290);
      if (m === 11) add(ano, m, 26, 'Presentes', 'Natal', 'Cartão de crédito', 380);
      if (m === 6) add(ano, m, 24, 'Viagem', 'Viagem de férias', 'Cartão de crédito', 1350);
      if (m === 2) add(ano, m, 18, 'Manutenção', 'Revisão do carro', 'Boleto', 520);

      add(ano, m, 27, 'Outros', 'Imprevistos', 'Pix', r(80, 260));
    }

    // 2025 (ano completo)
    for (let m = 0; m < 12; m++) mesCheio(2025, m, 7800, m % 3 === 2 ? 900 : (m % 3 === 1 ? 350 : 0));

    // 2026: só até setembro (meses já vividos)
    for (let m = 0; m < 9; m++) mesCheio(2026, m, 8200, m % 3 === 2 ? 900 : (m % 3 === 1 ? 350 : 0));

    // 2026: outubro–dezembro — renda prevista + contas marcadas como PENDENTES
    for (let m = 9; m < 12; m++) {
      add(2026, m, 5, 'Salário', 'Salário mensal', 'Transferência', 8200);
      add(2026, m, 9, 'Rendimentos', 'CDB / rendimentos', 'Pix', 250);
      ['Internet', 'Telefone', 'Energia', 'Plano de saúde', 'Academia', 'Streaming']
        .forEach(it => add(2026, m, { 'Internet': 12, 'Telefone': 12, 'Energia': 8, 'Plano de saúde': 10, 'Academia': 11, 'Streaming': 12 }[it],
          it, 'Conta mensal', 'Débito automático', (fixas.find(f => f[0] === it) || [, , 0])[2], true));
      add(2026, m, 5, 'Cartão (fatura em atraso)', 'Parcela do acordo', 'Pix', 480, true);
      add(2026, m, 16, 'Empréstimo', 'Parcela do empréstimo', 'Boleto', 420, true);
      add(2026, m, 3, 'Reserva de emergência', 'Aporte mensal', 'Pix', 800, true);
    }

    return L.sort((a, b) => a.ts - b.ts);
  }
};

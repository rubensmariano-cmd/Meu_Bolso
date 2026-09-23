// =====================================================================
// Meu Bolso — constantes e configurações padrão
// =====================================================================
const CFG_DEFAULT = {
  mes: new Date().getMonth(),          // mês ativo no painel
  ano: new Date().getFullYear(),       // ano de referência
  salario: 8200,                       // renda mensal de referência (metas/limites)
  metas: { nec: 50, desejo: 30, fin: 20 },

  categorias: [
    { id: 'receitas', nome: 'Receitas', tipo: 'receita', cor: '#16a34a', itens: ['Salário', 'Renda extra', 'Rendimentos'] },
    { id: 'casa', nome: 'Contas Casa', tipo: 'despesa', cor: '#2563eb', itens: ['Energia', 'Água', 'Gás', 'Telefone', 'Internet'] },
    { id: 'transporte', nome: 'Transporte', tipo: 'despesa', cor: '#0891b2', itens: ['Gasolina', 'Seguro veículo', 'Manutenção', 'IPVA', 'Transporte público', 'Estacionamento'] },
    { id: 'subsistencia', nome: 'Subsistência', tipo: 'despesa', cor: '#22c55e', itens: ['Mercado', 'Hortifruti', 'Padaria', 'Açougue'] },
    { id: 'saude', nome: 'Saúde', tipo: 'despesa', cor: '#dc2626', itens: ['Farmácia', 'Plano de saúde', 'Consultas', 'Dentista'] },
    { id: 'educacao', nome: 'Educação', tipo: 'despesa', cor: '#7c3aed', itens: ['Cursos', 'Livros', 'Mensalidade escolar'] },
    { id: 'lazer', nome: 'Lazer', tipo: 'despesa', cor: '#ea580c', itens: ['Alimentação fora', 'Delivery', 'Lazer', 'Viagem'] },
    { id: 'assinaturas', nome: 'Assinaturas', tipo: 'despesa', cor: '#db2777', itens: ['Streaming', 'Aplicativos', 'Academia'] },
    { id: 'pessoal', nome: 'Pessoal', tipo: 'despesa', cor: '#a16207', itens: ['Compras', 'Vestuário', 'Cuidados pessoais', 'Presentes', 'Pet'] },
    { id: 'dividas', nome: 'Dívidas', tipo: 'despesa', cor: '#be123c', itens: ['Cartão (fatura em atraso)', 'Empréstimo'] },
    { id: 'investimentos', nome: 'Investimentos', tipo: 'investimento', cor: '#4f46e5', itens: ['Reserva de emergência', 'Aportes'] },
    { id: 'outros', nome: 'Outros', tipo: 'despesa', cor: '#64748b', itens: ['Outros'] }
  ],

  formas: ['Pix', 'Cartão de débito', 'Cartão de crédito', 'Dinheiro', 'Boleto', 'Débito automático', 'Transferência']
};

// grupo 50/30/20 por categoria
const CFG_50_30_20 = {
  casa: 'nec', transporte: 'nec', subsistencia: 'nec', saude: 'nec',
  educacao: 'desejo', lazer: 'desejo', assinaturas: 'desejo', pessoal: 'desejo',
  outros: 'desejo', dividas: 'fin', investimentos: 'fin'
};

const TIPO_TXT = { receita: 'Receita', despesa: 'Despesa', investimento: 'Investimento' };
const GRUPO_TXT = { nec: 'Necessidades (50%)', desejo: 'Desejos (30%)', fin: 'Metas financeiras (20%)' };

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

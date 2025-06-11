// Tipos de dados para o sistema de estoque
export interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  quantidadeVendida: number;
  dataCadastro: string;
}

export interface Venda {
  id: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
  data: string;
}

export interface TipoDespesa {
  id: string;
  nome: string;
  dataCadastro: string;
}

export interface Despesa {
  id: string;
  tipoId: string;
  nomeTipo: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface HistoricoEstoque {
  id: string;
  produtoId: string;
  nomeProduto: string;
  tipo: 'adicao' | 'cadastro_inicial';
  quantidade: number;
  estoqueAnterior: number;
  estoqueNovo: number;
  data: string;
  observacao?: string;
}

export interface ResumoFinanceiro {
  receitas: number;
  despesas: number;
  lucro: number;
  mes: string;
}

export type TabAtual = 'dashboard' | 'produtos' | 'vendas' | 'despesas' | 'estoque' | 'historico' | 'backup' | 'sobre';

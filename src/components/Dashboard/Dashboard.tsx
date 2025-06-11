import React from 'react';
import { Package, ShoppingCart, CreditCard, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { Produto, Venda, Despesa } from '../../types';
import { formatCurrency, getCurrentMonth } from '../../utils/formatters';
import { TabAtual } from '../../types';

interface DashboardProps {
  produtos: Produto[];
  vendas: Venda[];
  despesas: Despesa[];
  onMudarTab: (tab: TabAtual) => void;
}

// Componente principal do dashboard
export const Dashboard: React.FC<DashboardProps> = ({ 
  produtos, 
  vendas, 
  despesas, 
  onMudarTab 
}) => {
  const mesAtual = getCurrentMonth();
  
  // Filtrar dados do mês atual
  const vendasMesAtual = vendas.filter(v => v.data.startsWith(mesAtual));
  const despesasMesAtual = despesas.filter(d => d.data.startsWith(mesAtual));
  
  // Calcular totais
  const totalProdutos = produtos.length;
  const receitaTotal = vendasMesAtual.reduce((acc, v) => acc + v.valorTotal, 0);
  const despesaTotal = despesasMesAtual.reduce((acc, d) => acc + d.valor, 0);
  const lucroTotal = receitaTotal - despesaTotal;
  
  // Dados para gráfico de receitas por produto
  const receitasPorProduto = [...new Set(vendasMesAtual.map(v => v.nomeProduto))].map(nomeProduto => {
    const vendasProduto = vendasMesAtual.filter(v => v.nomeProduto === nomeProduto);
    return {
      nome: nomeProduto,
      valor: vendasProduto.reduce((acc, v) => acc + v.valorTotal, 0)
    };
  }).filter(item => item.valor > 0);
  
  // Dados para gráfico de despesas por tipo
  const tiposDespesa = [...new Set(despesasMesAtual.map(d => d.nomeTipo))];
  const despesasPorTipo = tiposDespesa.map(tipo => {
    const despesasTipo = despesasMesAtual.filter(d => d.nomeTipo === tipo);
    return {
      nome: tipo,
      valor: despesasTipo.reduce((acc, d) => acc + d.valor, 0)
    };
  });

  // Configuração dos gráficos
  const dadosReceitasChart = {
    labels: receitasPorProduto.map(r => r.nome),
    datasets: [{
      data: receitasPorProduto.map(r => r.valor),
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'
      ],
      borderColor: [
        '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'
      ],
      borderWidth: 2
    }]
  };

  const dadosDespesasChart = {
    labels: despesasPorTipo.map(d => d.nome),
    datasets: [{
      data: despesasPorTipo.map(d => d.valor),
      backgroundColor: [
        '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#3b82f6'
      ],
      borderColor: [
        '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#059669', '#2563eb'
      ],
      borderWidth: 2
    }]
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">Visão geral do seu negócio</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          titulo="Total de Produtos"
          valor={totalProdutos.toString()}
          icon={Package}
          cor="primary"
          onClick={() => onMudarTab('produtos')}
        />
        <StatCard
          titulo="Receita do Mês"
          valor={formatCurrency(receitaTotal)}
          icon={ShoppingCart}
          cor="success"
          onClick={() => onMudarTab('vendas')}
        />
        <StatCard
          titulo="Despesas do Mês"
          valor={formatCurrency(despesaTotal)}
          icon={CreditCard}
          cor="danger"
          onClick={() => onMudarTab('despesas')}
        />
        <StatCard
          titulo="Lucro do Mês"
          valor={formatCurrency(lucroTotal)}
          icon={TrendingUp}
          cor={lucroTotal >= 0 ? 'success' : 'danger'}
          onClick={() => onMudarTab('historico')}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {receitasPorProduto.length > 0 && (
          <ChartCard
            titulo="Receitas do Mês"
            dados={dadosReceitasChart}
          />
        )}
        {despesasPorTipo.length > 0 && (
          <ChartCard
            titulo="Despesas do Mês"
            dados={dadosDespesasChart}
          />
        )}
      </div>
    </div>
  );
};
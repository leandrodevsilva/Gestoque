import React, { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Venda, Despesa } from '../../types';
import { formatCurrency, getMonthName } from '../../utils/formatters';

interface HistoricoProps {
  vendas: Venda[];
  despesas: Despesa[];
}

// Componente para histórico financeiro
export const Historico: React.FC<HistoricoProps> = ({ vendas, despesas }) => {
  const [mesSelecionado, setMesSelecionado] = useState<string>('');

  // Agrupar dados por mês
  const dadosPorMes = React.useMemo(() => {
    const meses = new Map<string, { receitas: number; despesas: number; vendas: Venda[]; despesasDetalhes: Despesa[] }>();

    // Processar vendas
    vendas.forEach(venda => {
      const mesAno = venda.data.substring(0, 7); // YYYY-MM
      if (!meses.has(mesAno)) {
        meses.set(mesAno, { receitas: 0, despesas: 0, vendas: [], despesasDetalhes: [] });
      }
      const dadosMes = meses.get(mesAno)!;
      dadosMes.receitas += venda.valorTotal;
      dadosMes.vendas.push(venda);
    });

    // Processar despesas
    despesas.forEach(despesa => {
      const mesAno = despesa.data.substring(0, 7); // YYYY-MM
      if (!meses.has(mesAno)) {
        meses.set(mesAno, { receitas: 0, despesas: 0, vendas: [], despesasDetalhes: [] });
      }
      const dadosMes = meses.get(mesAno)!;
      dadosMes.despesas += despesa.valor;
      dadosMes.despesasDetalhes.push(despesa);
    });

    return Array.from(meses.entries())
      .map(([mes, dados]) => ({
        mes,
        nomeMes: getMonthName(mes),
        receitas: dados.receitas,
        despesas: dados.despesas,
        lucro: dados.receitas - dados.despesas,
        vendas: dados.vendas,
        despesasDetalhes: dados.despesasDetalhes
      }))
      .sort((a, b) => b.mes.localeCompare(a.mes));
  }, [vendas, despesas]);

  const dadosDoMes = mesSelecionado 
    ? dadosPorMes.find(d => d.mes === mesSelecionado)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Histórico Financeiro</h2>
        <p className="text-gray-600 dark:text-gray-300">Acompanhe suas receitas e despesas ao longo do tempo</p>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-500 text-white mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {formatCurrency(vendas.reduce((acc, v) => acc + v.valorTotal, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-danger-500 text-white mr-4">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Despesa Total</p>
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
                {formatCurrency(despesas.reduce((acc, d) => acc + d.valor, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-500 text-white mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Lucro Total</p>
              <p className={`text-2xl font-bold ${
                (vendas.reduce((acc, v) => acc + v.valorTotal, 0) - despesas.reduce((acc, d) => acc + d.valor, 0)) >= 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {formatCurrency(
                  vendas.reduce((acc, v) => acc + v.valorTotal, 0) - 
                  despesas.reduce((acc, d) => acc + d.valor, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico por mês */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Histórico Mensal</h3>
        {dadosPorMes.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhum dado financeiro registrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Mês</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Receitas</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Despesas</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Lucro</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dadosPorMes.map((dados) => (
                  <tr key={dados.mes} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-800 dark:text-gray-200">{dados.nomeMes}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-success-600 dark:text-success-400">
                      {formatCurrency(dados.receitas)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-danger-600 dark:text-danger-400">
                      {formatCurrency(dados.despesas)}
                    </td>
                    <td className={`py-3 px-4 font-semibold ${
                      dados.lucro >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {formatCurrency(dados.lucro)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setMesSelecionado(mesSelecionado === dados.mes ? '' : dados.mes)}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      >
                        {mesSelecionado === dados.mes ? 'Ocultar' : 'Ver Detalhes'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalhes do mês selecionado */}
      {dadosDoMes && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Detalhes de {dadosDoMes.nomeMes}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendas do mês */}
            <div className="card">
              <h4 className="font-semibold mb-4 text-success-600 dark:text-success-400">
                Vendas ({dadosDoMes.vendas.length})
              </h4>
              {dadosDoMes.vendas.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma venda neste mês.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dadosDoMes.vendas.map(venda => (
                    <div key={venda.id} className="flex justify-between items-center p-2 bg-success-50 dark:bg-success-900/20 rounded">
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{venda.nomeProduto}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          (Qtd: {venda.quantidade})
                        </span>
                      </div>
                      <span className="font-semibold text-success-600 dark:text-success-400">
                        {formatCurrency(venda.valorTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Despesas do mês */}
            <div className="card">
              <h4 className="font-semibold mb-4 text-danger-600 dark:text-danger-400">
                Despesas ({dadosDoMes.despesasDetalhes.length})
              </h4>
              {dadosDoMes.despesasDetalhes.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa neste mês.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {dadosDoMes.despesasDetalhes.map(despesa => (
                    <div key={despesa.id} className="flex justify-between items-center p-2 bg-danger-50 dark:bg-danger-900/20 rounded">
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{despesa.nomeTipo}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{despesa.descricao}</p>
                      </div>
                      <span className="font-semibold text-danger-600 dark:text-danger-400">
                        {formatCurrency(despesa.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
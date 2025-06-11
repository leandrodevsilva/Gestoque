import React from 'react';
import { Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { Produto } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface EstoqueProps {
  produtos: Produto[];
}

// Componente para controle de estoque
export const Estoque: React.FC<EstoqueProps> = ({ produtos }) => {
  const produtosComEstoqueBaixo = produtos.filter(p => p.quantidadeEstoque <= 3);
  const totalItensEstoque = produtos.reduce((acc, p) => acc + p.quantidadeEstoque, 0);
  const totalItensVendidos = produtos.reduce((acc, p) => acc + p.quantidadeVendida, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Controle de Estoque</h2>
        <p className="text-gray-600 dark:text-gray-300">Monitore seus produtos em estoque e vendidos</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-500 text-white mr-4">
              <Package size={24} />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total em Estoque</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalItensEstoque}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-500 text-white mr-4">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Vendido</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalItensVendidos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-danger-500 text-white mr-4">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{produtosComEstoqueBaixo.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de estoque baixo */}
      {produtosComEstoqueBaixo.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Atenção: Produtos com Estoque Baixo
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-3">
                Os seguintes produtos estão com estoque baixo (3 unidades ou menos):
              </p>
              <ul className="space-y-1">
                {produtosComEstoqueBaixo.map(produto => (
                  <li key={produto.id} className="text-yellow-700 dark:text-yellow-300">
                    • <span className="font-medium">{produto.nome}</span> - 
                    Restam apenas {produto.quantidadeEstoque} unidade(s)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabela detalhada do estoque */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Situação Detalhada do Estoque</h3>
        {produtos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhum produto cadastrado no sistema.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Preço</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Em Estoque</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Vendidos</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Valor Total Estoque</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const valorTotalEstoque = produto.quantidadeEstoque * produto.preco;
                  const statusEstoque = produto.quantidadeEstoque === 0 
                    ? 'Esgotado' 
                    : produto.quantidadeEstoque <= 3 
                    ? 'Baixo' 
                    : 'Normal';
                  
                  const corStatus = produto.quantidadeEstoque === 0
                    ? 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20'
                    : produto.quantidadeEstoque <= 3
                    ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20';

                  return (
                    <tr key={produto.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">{produto.nome}</td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatCurrency(produto.preco)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{produto.quantidadeEstoque}</span>
                          {produto.quantidadeEstoque <= 3 && (
                            <TrendingDown className="text-danger-500 dark:text-danger-400" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{produto.quantidadeVendida}</span>
                          {produto.quantidadeVendida > 0 && (
                            <TrendingUp className="text-success-500 dark:text-success-400" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${corStatus}`}>
                          {statusEstoque}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(valorTotalEstoque)}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatDate(produto.dataCadastro)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">TOTAIS</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">-</td>
                  <td className="py-3 px-4 text-primary-600 dark:text-primary-400">{totalItensEstoque}</td>
                  <td className="py-3 px-4 text-success-600 dark:text-success-400">{totalItensVendidos}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">-</td>
                  <td className="py-3 px-4 text-lg text-gray-800 dark:text-gray-200">
                    {formatCurrency(produtos.reduce((acc, p) => acc + (p.quantidadeEstoque * p.preco), 0))}
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
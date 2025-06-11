import React, { useState } from 'react';
import { Plus, ShoppingCart, Eye, Edit, Trash2, Save, X } from 'lucide-react';
import { ConfirmModal } from '../Layout/ConfirmModal';
import { Produto, Venda } from '../../types';
import { MultiProductSelector } from './MultiProductSelector';
import { formatCurrency, formatDateTime, generateId } from '../../utils/formatters';
import { notify } from '../../utils/formatters';
interface VendasProps {
  produtos: Produto[];
  vendas: Venda[];
  onAtualizarVendas: (vendas: Venda[]) => void;
  onAtualizarProdutos: (produtos: Produto[]) => void;
}
// Componente para gerenciamento de vendas
export const Vendas: React.FC<VendasProps> = ({
  produtos,
  vendas,
  onAtualizarVendas,
  onAtualizarProdutos
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vendaEditando, setVendaEditando] = useState<string | null>(null);
  const [produtosSelecionados, setProdutosSelecionados] = useState<Array<{ produto: Produto; quantidade: number }>>([]);
  const [vendaEdicao, setVendaEdicao] = useState({
    produtoId: '',
    quantidade: ''
  });
  const [resumoVenda, setResumoVenda] = useState<{
    produtos: Array<{ produto: Produto; quantidade: number; valorTotal: number }>;
    valorTotal: number;
  } | null>(null);

  const [produtoAtual, setProdutoAtual] = useState<Produto | null>(null);
  const [quantidadeAtual, setQuantidadeAtual] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    vendaId: string;
    venda: Venda | null;
  }>({ isOpen: false, vendaId: '', venda: null });

  const handleAddProduto = () => {
    if (!produtoAtual || quantidadeAtual <= 0) {
      notify('Selecione um produto e informe a quantidade.', 'error');
      return;
    }

    if (quantidadeAtual > produtoAtual.quantidadeEstoque) {
      notify(`Quantidade solicitada (${quantidadeAtual}) é maior que o estoque disponível (${produtoAtual.quantidadeEstoque})!`, 'error');
      return;
    }

    setProdutosSelecionados([
      ...produtosSelecionados,
      { produto: produtoAtual, quantidade: quantidadeAtual }
    ]);

    // Reset current selection
    setProdutoAtual(null);
    setQuantidadeAtual(0);
  };
  // Função para calcular resumo da venda
  const calcularResumo = () => {
    if (produtosSelecionados.length === 0) {
      notify('Por favor, adicione pelo menos um produto.', 'error');
      return;
    }
    
    let valorTotalVenda = 0;
    let produtosResumo: { produto: Produto; quantidade: number; valorTotal: number }[] = [];

    for (const item of produtosSelecionados) {
      const produto = item.produto;
      const quantidade = item.quantidade;

      if (!produto) {
        notify('Produto não encontrado.', 'error');
        return;
      }

      if (isNaN(quantidade) || quantidade <= 0) {
        notify('Quantidade deve ser um número maior que zero.', 'error');
        return;
      }

      if (quantidade > produto.quantidadeEstoque) {
        notify(`Quantidade solicitada (${quantidade}) para o produto ${produto.nome} é maior que o estoque disponível (${produto.quantidadeEstoque})!`, 'error');
        return;
      }

      const valorTotal = produto.preco * quantidade;
      valorTotalVenda += valorTotal;
      produtosResumo.push({ produto, quantidade, valorTotal });
    }

    setResumoVenda({
      produtos: produtosResumo,
      valorTotal: valorTotalVenda
    });
  };
  // Função para confirmar venda
  const confirmarVenda = () => {
    if (!resumoVenda || !resumoVenda.produtos) return;
    try {
      let novasVendas: Venda[] = [];
      let produtosAtualizados = [...produtos];

      for (const item of resumoVenda.produtos) {
        // Criar nova venda para cada produto
        const novaVenda: Venda = {
          id: generateId(),
          produtoId: item.produto.id,
          nomeProduto: item.produto.nome,
          quantidade: item.quantidade,
          precoUnitario: item.produto.preco,
          valorTotal: item.valorTotal,
          data: new Date().toISOString()
        };
        novasVendas.push(novaVenda);

        // Atualizar estoque do produto
        produtosAtualizados = produtosAtualizados.map(produto =>
          produto.id === item.produto.id
            ? {
                ...produto,
                quantidadeEstoque: produto.quantidadeEstoque - item.quantidade,
                quantidadeVendida: produto.quantidadeVendida + item.quantidade
              }
            : produto
        );
      }

      onAtualizarVendas([...vendas, ...novasVendas]);
      onAtualizarProdutos(produtosAtualizados);
      // Resetar formulário
      setProdutosSelecionados([]);
      setProdutoAtual(null);
      setQuantidadeAtual(0);
      setResumoVenda(null);
      setMostrarFormulario(false);
      notify('Venda registrada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      notify('Erro ao registrar venda. Tente novamente.', 'error');
    }
  };
  // Função para iniciar edição de venda
  const iniciarEdicaoVenda = (venda: Venda) => {
    setVendaEditando(venda.id);
    setVendaEdicao({
      produtoId: venda.produtoId,
      quantidade: venda.quantidade.toString()
    });
  };
  // Função para salvar edição de venda
  const salvarEdicaoVenda = (vendaId: string) => {
    const vendaOriginal = vendas.find(v => v.id === vendaId);
    if (!vendaOriginal) {
      notify('Venda não encontrada.', 'error');
      return;
    }
    if (!vendaEdicao.produtoId || !vendaEdicao.quantidade) {
      notify('Por favor, selecione um produto e informe a quantidade.', 'error');
      return;
    }
    const novoProduto = produtos.find(p => p.id === vendaEdicao.produtoId);
    const novaQuantidade = parseInt(vendaEdicao.quantidade);
    if (!novoProduto) {
      notify('Produto não encontrado.', 'error');
      return;
    }
    if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
      notify('Quantidade deve ser um número maior que zero.', 'error');
      return;
    }
    try {
      // Calcular diferenças para ajuste de estoque
      const produtoOriginal = produtos.find(p => p.id === vendaOriginal.produtoId);
      if (!produtoOriginal) {
        notify('Produto original da venda não encontrado.', 'error');
        return;
      }
      // Reverter estoque da venda original
      let produtosAtualizados = produtos.map(produto => {
        if (produto.id === vendaOriginal.produtoId) {
          return {
            ...produto,
            quantidadeEstoque: produto.quantidadeEstoque + vendaOriginal.quantidade,
            quantidadeVendida: produto.quantidadeVendida - vendaOriginal.quantidade
          };
        }
        return produto;
      });
      // Verificar se há estoque suficiente para a nova quantidade
      const produtoAtualizado = produtosAtualizados.find(p => p.id === vendaEdicao.produtoId);
      if (!produtoAtualizado) {
        notify('Erro ao encontrar produto atualizado.', 'error');
        return;
      }
      if (novaQuantidade > produtoAtualizado.quantidadeEstoque) {
        notify(`Quantidade solicitada (${novaQuantidade}) é maior que o estoque disponível (${produtoAtualizado.quantidadeEstoque}) após reverter a venda original!`, 'error');
        return;
      }
      // Aplicar nova venda
      produtosAtualizados = produtosAtualizados.map(produto => {
        if (produto.id === vendaEdicao.produtoId) {
          return {
            ...produto,
            quantidadeEstoque: produto.quantidadeEstoque - novaQuantidade,
            quantidadeVendida: produto.quantidadeVendida + novaQuantidade
          };
        }
        return produto;
      });
      // Atualizar venda
      const vendaAtualizada: Venda = {
        ...vendaOriginal,
        produtoId: vendaEdicao.produtoId,
        nomeProduto: novoProduto.nome,
        quantidade: novaQuantidade,
        precoUnitario: novoProduto.preco,
        valorTotal: novoProduto.preco * novaQuantidade
      };
      const vendasAtualizadas = vendas.map(v =>
        v.id === vendaId ? vendaAtualizada : v
      );
      onAtualizarVendas(vendasAtualizadas);
      onAtualizarProdutos(produtosAtualizados);
      setVendaEditando(null);
      setVendaEdicao({ produtoId: '', quantidade: '' });
      notify('Venda atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao editar venda:', error);
      notify('Erro ao editar venda. Tente novamente.', 'error');
    }
  };
  // Função para cancelar edição
  const cancelarEdicaoVenda = () => {
    setVendaEditando(null);
    setVendaEdicao({ produtoId: '', quantidade: '' });
  };
  // Função para iniciar exclusão de venda
  const iniciarExclusaoVenda = (vendaId: string) => {
    const venda = vendas.find(v => v.id === vendaId);
    if (!venda) {
      notify('Venda não encontrada.', 'error');
      return;
    }
    setConfirmModal({ isOpen: true, vendaId, venda });
  };

  // Função para excluir venda
  const excluirVenda = (vendaId: string) => {
    const venda = vendas.find(v => v.id === vendaId);
    if (!venda) {
      notify('Venda não encontrada.', 'error');
      return;
    }

    try {
      // Reverter estoque
      const produtosAtualizados = produtos.map(produto => {
        if (produto.id === venda.produtoId) {
          return {
            ...produto,
            quantidadeEstoque: produto.quantidadeEstoque + venda.quantidade,
            quantidadeVendida: produto.quantidadeVendida - venda.quantidade
          };
        }
        return produto;
      });
      // Remover venda
      const vendasAtualizadas = vendas.filter(v => v.id !== vendaId);
      onAtualizarVendas(vendasAtualizadas);
      onAtualizarProdutos(produtosAtualizados);
      notify('Venda excluída com sucesso! O estoque foi restaurado.', 'success');
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      notify('Erro ao excluir venda. Tente novamente.', 'error');
    }
  };
  const produtosDisponiveis = produtos.filter(p => p.quantidadeEstoque > 0);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Vendas</h2>
          <p className="text-gray-600 dark:text-gray-300">Registre suas vendas de produtos</p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="btn-success flex items-center space-x-2"
          disabled={produtosDisponiveis.length === 0}
        >
          <Plus size={20} />
          <span>Nova Venda</span>
        </button>
      </div>
      {/* Aviso se não há produtos disponíveis */}
      {produtosDisponiveis.length === 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            Não há produtos com estoque disponível para venda. Cadastre produtos ou atualize o estoque.
          </p>
        </div>
      )}
      {/* Formulário de nova venda */}
      {mostrarFormulario && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Registrar Nova Venda</h3>
          {!resumoVenda ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Adicionar Produto</h4>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <MultiProductSelector
                      produtos={produtosDisponiveis}
                      onProductChange={(product) => setProdutoAtual(product)}
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantidade:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={produtoAtual?.quantidadeEstoque}
                      value={quantidadeAtual || ''}
                      onChange={(e) => setQuantidadeAtual(parseInt(e.target.value) || 0)}
                      className="input-field w-full"
                      placeholder="Digite a quantidade"
                    />
                  </div>
                </div>
                <div>
                  <button
                    onClick={handleAddProduto}
                    className="btn-primary flex items-center space-x-2"
                    disabled={!produtoAtual || quantidadeAtual <= 0}
                  >
                    <Plus size={20} />
                    <span>Adicionar Produto</span>
                  </button>
                </div>
              </div>

              {produtosSelecionados.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Produtos Selecionados:</h4>
                  {produtosSelecionados.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-800 dark:text-gray-200">
                        {item.produto.nome} - {item.quantidade} un. x {formatCurrency(item.produto.preco)}
                      </span>
                      <button
                        onClick={() => {
                          setProdutosSelecionados(produtosSelecionados.filter((_, i) => i !== index));
                        }}
                        className="text-danger-600 hover:text-danger-700"
                        title="Remover produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={calcularResumo}
                  className="btn-primary flex items-center space-x-2"
                  disabled={produtosSelecionados.length === 0}
                >
                  <Eye size={20} />
                  <span>Ver Resumo</span>
                </button>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setProdutosSelecionados([]);
                    setProdutoAtual(null);
                    setQuantidadeAtual(0);
                    setResumoVenda(null);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Resumo da Venda</h4>
                <div className="space-y-3">
                  {resumoVenda.produtos.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Produto:</span>
                        <span className="font-medium text-gray-800 dark:text-white">{item.produto.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Quantidade:</span>
                        <span className="font-medium text-gray-800 dark:text-white">{item.quantidade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Preço Unitário:</span>
                        <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(item.produto.preco)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                        <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(item.valorTotal)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between text-lg font-bold">
                    <span className="text-gray-800 dark:text-white">Total Geral:</span>
                    <span className="text-success-600 dark:text-success-400">{formatCurrency(resumoVenda.valorTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={confirmarVenda}
                  className="btn-success flex items-center space-x-2"
                >
                  <ShoppingCart size={20} />
                  <span>Confirmar Venda</span>
                </button>
                <button
                  onClick={() => setResumoVenda(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico de vendas */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Histórico de Vendas</h3>
        {vendas.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Nenhuma venda registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data/Hora</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Quantidade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Preço Unit.</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((venda) => (
                    <tr key={venda.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatDateTime(venda.data)}</td>
                      <td className="py-3 px-4">
                        {vendaEditando === venda.id ? (
                          <div onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              salvarEdicaoVenda(venda.id);
                            }
                          }}>
                            <select
                              value={vendaEdicao.produtoId}
                              onChange={(e) => setVendaEdicao({ ...vendaEdicao, produtoId: e.target.value })}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  salvarEdicaoVenda(venda.id);
                                }
                              }}
                              className="input-field text-sm"
                            >
                              <option value="">Selecione um produto</option>
                              {produtos.map(produto => (
                                <option key={produto.id} value={produto.id}>
                                  {produto.nome} - {formatCurrency(produto.preco)}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-gray-800 dark:text-gray-200">{venda.nomeProduto}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {vendaEditando === venda.id ? (
                          <div onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              salvarEdicaoVenda(venda.id);
                            }
                          }}>
                            <input
                              type="number"
                              min="1"
                              value={vendaEdicao.quantidade}
                              onChange={(e) => setVendaEdicao({ ...vendaEdicao, quantidade: e.target.value })}
                              className="input-field text-sm w-20"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-800 dark:text-gray-200">{venda.quantidade}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatCurrency(venda.precoUnitario)}</td>
                      <td className="py-3 px-4 font-semibold text-success-600 dark:text-success-400">
                        {formatCurrency(venda.valorTotal)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {vendaEditando === venda.id ? (
                            <>
                              <button
                                onClick={() => salvarEdicaoVenda(venda.id)}
                                className="text-success-600 hover:text-success-700 dark:text-success-400 dark:hover:text-success-300"
                                title="Salvar alterações"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={cancelarEdicaoVenda}
                                className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                title="Cancelar edição"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => iniciarEdicaoVenda(venda)}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Editar venda"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => iniciarExclusaoVenda(venda.id)}
                                className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                                title="Excluir venda"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, vendaId: '', venda: null })}
        onConfirm={() => {
          excluirVenda(confirmModal.vendaId);
          setConfirmModal({ isOpen: false, vendaId: '', venda: null });
        }}
        title="Excluir Venda"
        message="Tem certeza que deseja excluir esta venda?"
        details={confirmModal.venda ? [
          `Produto: ${confirmModal.venda.nomeProduto}`,
          `Quantidade: ${confirmModal.venda.quantidade}`,
          `Valor: ${formatCurrency(confirmModal.venda.valorTotal)}`,
          'O estoque será automaticamente restaurado.'
        ] : []}
        type="danger"
        confirmText="OK"
        cancelText="Cancelar"
      />
    </div>
  );
};

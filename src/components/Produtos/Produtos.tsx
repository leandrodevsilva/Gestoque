import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, PackagePlus, History, TrendingUp, Package } from 'lucide-react';
import { ConfirmModal } from '../Layout/ConfirmModal';
import { Produto, HistoricoEstoque } from '../../types';
import { formatCurrency, formatDate, formatDateTime, generateId } from '../../utils/formatters';
import { notify } from '../../utils/formatters';

interface ProdutosProps {
  produtos: Produto[];
  onAtualizarProdutos: (produtos: Produto[]) => void;
  historicoEstoque: HistoricoEstoque[];
  onAtualizarHistoricoEstoque: (historico: HistoricoEstoque[]) => void;
}

// Componente para gerenciamento de produtos
export const Produtos: React.FC<ProdutosProps> = ({ 
  produtos, 
  onAtualizarProdutos, 
  historicoEstoque, 
  onAtualizarHistoricoEstoque 
}) => {
  const [abaSelecionada, setAbaSelecionada] = useState<'produtos' | 'historico'>('produtos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormEstoque, setMostrarFormEstoque] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<string | null>(null);
  const [produtoSelecionadoHistorico, setProdutoSelecionadoHistorico] = useState<string>('');
  const [valoresEdicao, setValoresEdicao] = useState<{
    nome: string;
    preco: string;
    quantidadeEstoque: string;
  }>({ nome: '', preco: '', quantidadeEstoque: '' });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    produtoId: string;
    produto: Produto | null;
  }>({ isOpen: false, produtoId: '', produto: null });
  
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    preco: '',
    quantidadeEstoque: ''
  });
  const [adicionarEstoque, setAdicionarEstoque] = useState({
    produtoId: '',
    quantidade: ''
  });

  // Função para registrar histórico de estoque
  const registrarHistoricoEstoque = (
    produtoId: string,
    nomeProduto: string,
    tipo: 'adicao' | 'cadastro_inicial',
    quantidade: number,
    estoqueAnterior: number,
    observacao?: string
  ) => {
    const novoHistorico: HistoricoEstoque = {
      id: generateId(),
      produtoId,
      nomeProduto,
      tipo,
      quantidade,
      estoqueAnterior,
      estoqueNovo: estoqueAnterior + quantidade,
      data: new Date().toISOString(),
      observacao
    };

    onAtualizarHistoricoEstoque([...historicoEstoque, novoHistorico]);
  };

  // Função para adicionar novo produto
  const adicionarProduto = () => {
    if (!novoProduto.nome.trim() || !novoProduto.preco || !novoProduto.quantidadeEstoque) {
      notify('Por favor, preencha todos os campos.', 'error');
      return;
    }

    const preco = parseFloat(novoProduto.preco);
    const quantidade = parseInt(novoProduto.quantidadeEstoque);

    if (isNaN(preco) || preco <= 0) {
      notify('Preço deve ser um número maior que zero.', 'error');
      return;
    }

    if (isNaN(quantidade) || quantidade < 0) {
      notify('Quantidade deve ser um número maior ou igual a zero.', 'error');
      return;
    }

    // Verificar se já existe produto com o mesmo nome
    const produtoExistente = produtos.find(p => 
      p.nome.toLowerCase().trim() === novoProduto.nome.toLowerCase().trim()
    );

    if (produtoExistente) {
      notify('Já existe um produto com este nome.', 'error');
      return;
    }

    try {
      const produto: Produto = {
        id: generateId(),
        nome: novoProduto.nome.trim(),
        preco: preco,
        quantidadeEstoque: quantidade,
        quantidadeVendida: 0,
        dataCadastro: new Date().toISOString()
      };

      onAtualizarProdutos([...produtos, produto]);

      // Registrar histórico de estoque inicial
      if (quantidade > 0) {
        registrarHistoricoEstoque(
          produto.id,
          produto.nome,
          'cadastro_inicial',
          quantidade,
          0,
          'Estoque inicial do produto'
        );
      }

      setNovoProduto({ nome: '', preco: '', quantidadeEstoque: '' });
      setMostrarFormulario(false);
      notify('Produto cadastrado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      notify('Erro ao cadastrar produto. Tente novamente.', 'error');
    }
  };

  // Função para adicionar estoque a produto existente
  const adicionarEstoqueProduto = () => {
    if (!adicionarEstoque.produtoId || !adicionarEstoque.quantidade) {
      notify('Por favor, selecione um produto e informe a quantidade.', 'error');
      return;
    }

    const quantidade = parseInt(adicionarEstoque.quantidade);

    if (isNaN(quantidade) || quantidade <= 0) {
      notify('Quantidade deve ser um número maior que zero.', 'error');
      return;
    }

    const produto = produtos.find(p => p.id === adicionarEstoque.produtoId);
    if (!produto) {
      notify('Produto não encontrado.', 'error');
      return;
    }

    try {
      const estoqueAnterior = produto.quantidadeEstoque;
      
      const produtosAtualizados = produtos.map(p =>
        p.id === adicionarEstoque.produtoId
          ? { ...p, quantidadeEstoque: p.quantidadeEstoque + quantidade }
          : p
      );

      onAtualizarProdutos(produtosAtualizados);

      // Registrar histórico de adição de estoque
      registrarHistoricoEstoque(
        produto.id,
        produto.nome,
        'adicao',
        quantidade,
        estoqueAnterior,
        'Adição manual de estoque'
      );

      setAdicionarEstoque({ produtoId: '', quantidade: '' });
      setMostrarFormEstoque(false);
      notify(`${quantidade} unidade(s) adicionada(s) ao estoque de "${produto.nome}" com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error);
      notify('Erro ao adicionar estoque. Tente novamente.', 'error');
    }
  };

  // Função para iniciar edição de produto
  const iniciarEdicaoProduto = (produto: Produto) => {
    setProdutoEditando(produto.id);
    setValoresEdicao({
      nome: produto.nome,
      preco: produto.preco.toString(),
      quantidadeEstoque: produto.quantidadeEstoque.toString()
    });
  };

  // Função para salvar edição de produto
  const salvarEdicaoProduto = (id: string) => {
    try {
      // Validar nome
      const nomeProcessado = valoresEdicao.nome.trim();
      if (!nomeProcessado) {
        notify('Nome do produto não pode estar vazio.', 'error');
        return;
      }
      
      // Verificar se já existe outro produto com o mesmo nome
      const produtoExistente = produtos.find(p => 
        p.id !== id && p.nome.toLowerCase().trim() === nomeProcessado.toLowerCase()
      );

      if (produtoExistente) {
        notify('Já existe outro produto com este nome.', 'error');
        return;
      }

      // Validar preço
      const preco = parseFloat(valoresEdicao.preco);
      if (isNaN(preco) || preco <= 0) {
        notify('Preço deve ser um número maior que zero.', 'error');
        return;
      }

      // Validar quantidade
      const quantidade = parseInt(valoresEdicao.quantidadeEstoque);
      if (isNaN(quantidade) || quantidade < 0) {
        notify('Quantidade deve ser um número maior ou igual a zero.', 'error');
        return;
      }

      const produtosAtualizados = produtos.map(produto =>
        produto.id === id ? { 
          ...produto, 
          nome: nomeProcessado,
          preco: preco,
          quantidadeEstoque: quantidade
        } : produto
      );
      
      onAtualizarProdutos(produtosAtualizados);
      setProdutoEditando(null);
      setValoresEdicao({ nome: '', preco: '', quantidadeEstoque: '' });
      notify('Produto atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      notify('Erro ao atualizar produto. Tente novamente.', 'error');
    }
  };

  // Função para cancelar edição
  const cancelarEdicaoProduto = () => {
    setProdutoEditando(null);
    setValoresEdicao({ nome: '', preco: '', quantidadeEstoque: '' });
  };


  // Função para iniciar remoção de produto
  const iniciarRemocaoProduto = (id: string) => {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    setConfirmModal({ isOpen: true, produtoId: id, produto });
  };

  // Função para remover produto
  const removerProduto = (id: string) => {
    try {
      const produtosAtualizados = produtos.filter(produto => produto.id !== id);
      onAtualizarProdutos(produtosAtualizados);
      notify('Produto removido com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      notify('Erro ao remover produto. Tente novamente.', 'error');
    }
  };

  // Filtrar histórico por produto selecionado
  const historicoFiltrado = produtoSelecionadoHistorico 
    ? historicoEstoque.filter(h => h.produtoId === produtoSelecionadoHistorico)
    : historicoEstoque;

  // Estatísticas do histórico
  const totalAdicoes = historicoEstoque.filter(h => h.tipo === 'adicao').length;
  const totalQuantidadeAdicionada = historicoEstoque
    .filter(h => h.tipo === 'adicao')
    .reduce((acc, h) => acc + h.quantidade, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Produtos</h2>
          <p className="text-gray-600 dark:text-gray-300">Gerencie seu catálogo de produtos e histórico de estoque</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setMostrarFormEstoque(true)}
            className="btn-primary flex items-center space-x-2"
            disabled={produtos.length === 0}
          >
            <PackagePlus size={20} />
            <span>Adicionar Estoque</span>
          </button>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="btn-success flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        <button
          onClick={() => setAbaSelecionada('produtos')}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
            abaSelecionada === 'produtos'
              ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Package size={16} />
          <span>Produtos</span>
        </button>
        <button
          onClick={() => setAbaSelecionada('historico')}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
            abaSelecionada === 'historico'
              ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <History size={16} />
          <span>Histórico de Estoque</span>
        </button>
      </div>

      {abaSelecionada === 'produtos' ? (
        <>
          {/* Formulário para adicionar estoque */}
          {mostrarFormEstoque && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Adicionar Estoque a Produto Existente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Produto *
                  </label>
                  <select
                    value={adicionarEstoque.produtoId}
                    onChange={(e) => setAdicionarEstoque({ ...adicionarEstoque, produtoId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - Estoque atual: {produto.quantidadeEstoque}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade a Adicionar *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adicionarEstoque.quantidade}
                    onChange={(e) => setAdicionarEstoque({ ...adicionarEstoque, quantidade: e.target.value })}
                    className="input-field"
                    placeholder="Quantidade a adicionar"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button onClick={adicionarEstoqueProduto} className="btn-primary">
                  Adicionar ao Estoque
                </button>
                <button
                  onClick={() => {
                    setMostrarFormEstoque(false);
                    setAdicionarEstoque({ produtoId: '', quantidade: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Formulário de novo produto */}
          {mostrarFormulario && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Cadastrar Novo Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={novoProduto.nome}
                    onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                    className="input-field"
                    placeholder="Ex: Caneca Personalizada"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                    className="input-field"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade em Estoque *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={novoProduto.quantidadeEstoque}
                    onChange={(e) => setNovoProduto({ ...novoProduto, quantidadeEstoque: e.target.value })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button onClick={adicionarProduto} className="btn-success">
                  Cadastrar Produto
                </button>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNovoProduto({ nome: '', preco: '', quantidadeEstoque: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de produtos */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Produtos Cadastrados</h3>
            {produtos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Preço</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estoque</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Vendidos</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data Cadastro</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id} data-produto-id={produto.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          {produtoEditando === produto.id ? (
                            <input
                              type="text"
                              value={valoresEdicao.nome}
                              onChange={(e) => setValoresEdicao({ ...valoresEdicao, nome: e.target.value })}
                              className="input-field"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  salvarEdicaoProduto(produto.id);
                                }
                              }}
                              maxLength={100}
                            />
                          ) : (
                            <span className="text-gray-800 dark:text-gray-200">{produto.nome}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {produtoEditando === produto.id ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={valoresEdicao.preco}
                              onChange={(e) => setValoresEdicao({ ...valoresEdicao, preco: e.target.value })}
                              className="input-field"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  salvarEdicaoProduto(produto.id);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-gray-800 dark:text-gray-200">{formatCurrency(produto.preco)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {produtoEditando === produto.id ? (
                            <input
                              type="number"
                              min="0"
                              value={valoresEdicao.quantidadeEstoque}
                              onChange={(e) => setValoresEdicao({ ...valoresEdicao, quantidadeEstoque: e.target.value })}
                              className="input-field"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  salvarEdicaoProduto(produto.id);
                                }
                              }}
                            />
                          ) : (
                            <span className={produto.quantidadeEstoque <= 3 ? 'text-danger-600 dark:text-danger-400 font-semibold' : 'text-gray-800 dark:text-gray-200'}>
                              {produto.quantidadeEstoque}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{produto.quantidadeVendida}</td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatDate(produto.dataCadastro)}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {produtoEditando === produto.id ? (
                              <>
                                <button
                                  onClick={() => salvarEdicaoProduto(produto.id)}
                                  className="text-success-600 hover:text-success-700 dark:text-success-400 dark:hover:text-success-300"
                                  title="Salvar"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={cancelarEdicaoProduto}
                                  className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  title="Cancelar"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => iniciarEdicaoProduto(produto)}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => iniciarRemocaoProduto(produto.id)}
                              className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                              title="Remover"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Histórico de Estoque */}
          <div className="space-y-6">
            {/* Estatísticas do histórico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-500 text-white mr-4">
                    <History size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total de Registros</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{historicoEstoque.length}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-success-500 text-white mr-4">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Adições de Estoque</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalAdicoes}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
                    <PackagePlus size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Unidades Adicionadas</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalQuantidadeAdicionada}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtro por produto */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Filtrar Histórico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Produto
                  </label>
                  <select
                    value={produtoSelecionadoHistorico}
                    onChange={(e) => setProdutoSelecionadoHistorico(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos os produtos</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>
                {produtoSelecionadoHistorico && (
                  <div className="flex items-end">
                    <button
                      onClick={() => setProdutoSelecionadoHistorico('')}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                    >
                      Limpar Filtro
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabela do histórico */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Histórico de Movimentações de Estoque
                {produtoSelecionadoHistorico && (
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                    - {produtos.find(p => p.id === produtoSelecionadoHistorico)?.nome}
                  </span>
                )}
              </h3>
              {historicoFiltrado.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {produtoSelecionadoHistorico 
                    ? 'Nenhuma movimentação encontrada para este produto.'
                    : 'Nenhuma movimentação de estoque registrada ainda.'
                  }
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data/Hora</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Produto</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Quantidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estoque Anterior</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estoque Novo</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoFiltrado
                        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                        .map((historico) => (
                          <tr key={historico.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                              {formatDateTime(historico.data)}
                            </td>
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                              {historico.nomeProduto}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                historico.tipo === 'cadastro_inicial'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                  : 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200'
                              }`}>
                                {historico.tipo === 'cadastro_inicial' ? 'Cadastro Inicial' : 'Adição'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-semibold">
                              +{historico.quantidade}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {historico.estoqueAnterior}
                            </td>
                            <td className="py-3 px-4 text-success-600 dark:text-success-400 font-semibold">
                              {historico.estoqueNovo}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                              {historico.observacao || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, produtoId: '', produto: null })}
        onConfirm={() => {
          removerProduto(confirmModal.produtoId);
          setConfirmModal({ isOpen: false, produtoId: '', produto: null });
        }}
        title="Remover Produto"
        message="Tem certeza que deseja remover este produto?"
        details={confirmModal.produto ? [
          `Produto: ${confirmModal.produto.nome}`,
          `Preço: ${formatCurrency(confirmModal.produto.preco)}`,
          `Estoque atual: ${confirmModal.produto.quantidadeEstoque}`,
          'Esta ação não pode ser desfeita.'
        ] : []}
        type="danger"
        confirmText="OK"
        cancelText="Cancelar"
      />
    </div>
  );
};

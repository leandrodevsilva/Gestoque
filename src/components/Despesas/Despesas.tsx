import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { ConfirmModal } from '../Layout/ConfirmModal';
import { TipoDespesa, Despesa } from '../../types';
import { formatCurrency, formatDateTime, generateId } from '../../utils/formatters';
import { notify } from '../../utils/formatters';

interface DespesasProps {
  tiposDespesa: TipoDespesa[];
  despesas: Despesa[];
  onAtualizarTiposDespesa: (tipos: TipoDespesa[]) => void;
  onAtualizarDespesas: (despesas: Despesa[]) => void;
}

// Componente para gerenciamento de despesas
export const Despesas: React.FC<DespesasProps> = ({
  tiposDespesa,
  despesas,
  onAtualizarTiposDespesa,
  onAtualizarDespesas
}) => {
  const [abaSelecionada, setAbaSelecionada] = useState<'tipos' | 'despesas'>('tipos');
  const [mostrarFormTipo, setMostrarFormTipo] = useState(false);
  const [mostrarFormDespesa, setMostrarFormDespesa] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<string | null>(null);
  const [confirmModalTipo, setConfirmModalTipo] = useState<{
    isOpen: boolean;
    tipoId: string;
    tipo: TipoDespesa | null;
  }>({ isOpen: false, tipoId: '', tipo: null });
  const [confirmModalDespesa, setConfirmModalDespesa] = useState<{
    isOpen: boolean;
    despesaId: string;
    despesa: Despesa | null;
  }>({ isOpen: false, despesaId: '', despesa: null });
  
  const [novoTipo, setNovoTipo] = useState('');
  const [novaDespesa, setNovaDespesa] = useState({
    tipoId: '',
    valor: ''
  });

  // Funções para tipos de despesa
  const adicionarTipo = () => {
    if (!novoTipo.trim()) {
      notify('Por favor, digite o nome do tipo de despesa.', 'error');
      return;
    }

    // Verificar se já existe tipo com o mesmo nome
    const tipoExistente = tiposDespesa.find(t => 
      t.nome.toLowerCase().trim() === novoTipo.toLowerCase().trim()
    );

    if (tipoExistente) {
      notify('Já existe um tipo de despesa com este nome.', 'error');
      return;
    }

    try {
      const tipo: TipoDespesa = {
        id: generateId(),
        nome: novoTipo.trim(),
        dataCadastro: new Date().toISOString()
      };

      onAtualizarTiposDespesa([...tiposDespesa, tipo]);
      setNovoTipo('');
      setMostrarFormTipo(false);
      notify('Tipo de despesa cadastrado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao cadastrar tipo de despesa:', error);
      notify('Erro ao cadastrar tipo de despesa. Tente novamente.', 'error');
    }
  };

  const atualizarTipo = (id: string, novoNome: string) => {
    const nomeProcessado = novoNome.trim();
    
    if (!nomeProcessado) {
      notify('Nome do tipo de despesa não pode estar vazio.', 'error');
      return;
    }

    // Verificar se já existe outro tipo com o mesmo nome
    const tipoExistente = tiposDespesa.find(t => 
      t.id !== id && t.nome.toLowerCase().trim() === nomeProcessado.toLowerCase()
    );

    if (tipoExistente) {
      notify('Já existe outro tipo de despesa com este nome.', 'error');
      return;
    }

    try {
      const tiposAtualizados = tiposDespesa.map(tipo =>
        tipo.id === id ? { ...tipo, nome: nomeProcessado } : tipo
      );
      
      // Atualizar também o nome nas despesas existentes
      const despesasAtualizadas = despesas.map(despesa =>
        despesa.tipoId === id ? { ...despesa, nomeTipo: nomeProcessado } : despesa
      );

      onAtualizarTiposDespesa(tiposAtualizados);
      onAtualizarDespesas(despesasAtualizadas);
      setTipoEditando(null);
    } catch (error) {
      console.error('Erro ao atualizar tipo de despesa:', error);
      notify('Erro ao atualizar tipo de despesa. Tente novamente.', 'error');
    }
  };

  // Função para iniciar remoção de tipo
  const iniciarRemocaoTipo = (id: string) => {
    const tipo = tiposDespesa.find(t => t.id === id);
    if (!tipo) return;
    setConfirmModalTipo({ isOpen: true, tipoId: id, tipo });
  };

  // Função para remover tipo
  const removerTipo = (id: string) => {
    try {
      const tiposAtualizados = tiposDespesa.filter(tipo => tipo.id !== id);
      onAtualizarTiposDespesa(tiposAtualizados);
      notify('Tipo de despesa removido com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover tipo de despesa:', error);
      notify('Erro ao remover tipo de despesa. Tente novamente.', 'error');
    }
  };

  // Função para iniciar remoção de despesa
  const iniciarRemocaoDespesa = (id: string) => {
    const despesa = despesas.find(d => d.id === id);
    if (!despesa) return;
    setConfirmModalDespesa({ isOpen: true, despesaId: id, despesa });
  };

  // Função para remover despesa
  const removerDespesa = (id: string) => {
    try {
      const despesasAtualizadas = despesas.filter(despesa => despesa.id !== id);
      onAtualizarDespesas(despesasAtualizadas);
      notify('Despesa removida com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover despesa:', error);
      notify('Erro ao remover despesa. Tente novamente.', 'error');
    }
  };

  // Funções para despesas
  const adicionarDespesa = () => {
    if (!novaDespesa.tipoId || !novaDespesa.valor) {
      notify('Por favor, preencha todos os campos.', 'error');
      return;
    }

    const valor = parseFloat(novaDespesa.valor);
    if (isNaN(valor) || valor <= 0) {
      notify('Valor deve ser um número maior que zero.', 'error');
      return;
    }

    const tipo = tiposDespesa.find(t => t.id === novaDespesa.tipoId);
    if (!tipo) {
      notify('Tipo de despesa não encontrado.', 'error');
      return;
    }

    try {
      const despesa: Despesa = {
        id: generateId(),
        tipoId: novaDespesa.tipoId,
        nomeTipo: tipo.nome,
        descricao: '',
        valor: valor,
        data: new Date().toISOString()
      };

      onAtualizarDespesas([...despesas, despesa]);
      setNovaDespesa({ tipoId: '', valor: '' });
      setMostrarFormDespesa(false);
      notify('Despesa registrada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      notify('Erro ao registrar despesa. Tente novamente.', 'error');
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Despesas</h2>
        <p className="text-gray-600 dark:text-gray-300">Gerencie tipos de despesas e registre gastos</p>
      </div>

      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        <button
          onClick={() => setAbaSelecionada('tipos')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            abaSelecionada === 'tipos'
              ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          Tipos de Despesa
        </button>
        <button
          onClick={() => setAbaSelecionada('despesas')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            abaSelecionada === 'despesas'
              ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          Registrar Despesas
        </button>
      </div>

      {abaSelecionada === 'tipos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Tipos de Despesa</h3>
            <button
              onClick={() => setMostrarFormTipo(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Novo Tipo</span>
            </button>
          </div>

          {/* Formulário novo tipo */}
          {mostrarFormTipo && (
            <div className="card">
              <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Cadastrar Novo Tipo de Despesa</h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Ex: Material, Marketing, Transporte..."
                  maxLength={50}
                />
                <button onClick={adicionarTipo} className="btn-success">
                  Cadastrar
                </button>
                <button
                  onClick={() => {
                    setMostrarFormTipo(false);
                    setNovoTipo('');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de tipos */}
          <div className="card">
            {tiposDespesa.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhum tipo de despesa cadastrado. Comece criando categorias para suas despesas.
              </p>
            ) : (
              <div className="space-y-3">
                {tiposDespesa.map((tipo) => (
                  <div key={tipo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      {tipoEditando === tipo.id ? (
                        <input
                          type="text"
                          defaultValue={tipo.nome}
                          className="input-field"
                          onBlur={(e) => atualizarTipo(tipo.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              atualizarTipo(tipo.id, e.currentTarget.value);
                            }
                          }}
                          maxLength={50}
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-gray-800 dark:text-gray-200">{tipo.nome}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {tipoEditando === tipo.id ? (
                        <button
                          onClick={() => setTipoEditando(null)}
                          className="text-success-600 hover:text-success-700 dark:text-success-400 dark:hover:text-success-300"
                          title="Salvar"
                        >
                          <Save size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setTipoEditando(tipo.id)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => iniciarRemocaoTipo(tipo.id)}
                        className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {abaSelecionada === 'despesas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Registrar Despesas</h3>
            <button
              onClick={() => setMostrarFormDespesa(true)}
              className="btn-danger flex items-center space-x-2"
              disabled={tiposDespesa.length === 0}
            >
              <Plus size={20} />
              <span>Nova Despesa</span>
            </button>
          </div>

          {tiposDespesa.length === 0 && (
            <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200">
                Você precisa cadastrar pelo menos um tipo de despesa antes de registrar gastos.
              </p>
            </div>
          )}

          {/* Formulário nova despesa */}
          {mostrarFormDespesa && (
            <div className="card">
              <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Registrar Nova Despesa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Despesa *
                  </label>
                  <select
                    value={novaDespesa.tipoId}
                    onChange={(e) => setNovaDespesa({ ...novaDespesa, tipoId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Selecione o tipo</option>
                    {tiposDespesa.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={novaDespesa.valor}
                    onChange={(e) => setNovaDespesa({ ...novaDespesa, valor: e.target.value })}
                    className="input-field"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-4">
                <button onClick={adicionarDespesa} className="btn-danger">
                  Registrar Despesa
                </button>
                <button
                  onClick={() => {
                    setMostrarFormDespesa(false);
                    setNovaDespesa({ tipoId: '', valor: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de despesas */}
          <div className="card">
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-white">Histórico de Despesas</h4>
            {despesas.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Nenhuma despesa registrada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Data/Hora</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Valor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {despesas
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((despesa) => (
                        <tr key={despesa.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatDateTime(despesa.data)}</td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{despesa.nomeTipo}</td>
                          <td className="py-3 px-4 font-semibold text-danger-600 dark:text-danger-400">
                            {formatCurrency(despesa.valor)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => iniciarRemocaoDespesa(despesa.id)}
                              className="text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                              title="Remover"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão de tipo */}
      <ConfirmModal
        isOpen={confirmModalTipo.isOpen}
        onClose={() => setConfirmModalTipo({ isOpen: false, tipoId: '', tipo: null })}
        onConfirm={() => {
          removerTipo(confirmModalTipo.tipoId);
          setConfirmModalTipo({ isOpen: false, tipoId: '', tipo: null });
        }}
        title="Remover Tipo de Despesa"
        message="Tem certeza que deseja remover este tipo de despesa?"
        details={confirmModalTipo.tipo ? [
          `Tipo: ${confirmModalTipo.tipo.nome}`,
          'Esta ação não pode ser desfeita.',
          'Todas as despesas deste tipo serão mantidas, mas ficarão sem categoria.'
        ] : []}
        type="danger"
        confirmText="Remover"
        cancelText="Cancelar"
      />

      {/* Modal de confirmação de exclusão de despesa */}
      <ConfirmModal
        isOpen={confirmModalDespesa.isOpen}
        onClose={() => setConfirmModalDespesa({ isOpen: false, despesaId: '', despesa: null })}
        onConfirm={() => {
          removerDespesa(confirmModalDespesa.despesaId);
          setConfirmModalDespesa({ isOpen: false, despesaId: '', despesa: null });
        }}
        title="Remover Despesa"
        message="Tem certeza que deseja remover esta despesa?"
        details={confirmModalDespesa.despesa ? [
          `Tipo: ${confirmModalDespesa.despesa.nomeTipo}`,
          `Valor: ${formatCurrency(confirmModalDespesa.despesa.valor)}`,
          `Data: ${formatDateTime(confirmModalDespesa.despesa.data)}`,
          'Esta ação não pode ser desfeita.'
        ] : []}
        type="danger"
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </div>
  );
};

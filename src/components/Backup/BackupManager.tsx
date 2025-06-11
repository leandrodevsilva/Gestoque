import React, { useState } from 'react';
import { Download, Upload, Save, AlertCircle, CheckCircle, FolderOpen, Settings } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { BackupSettings } from './BackupSettings';
import { Produto, Venda, TipoDespesa, Despesa, HistoricoEstoque } from '../../types';
import { formatDateTime, notify } from '../../utils/formatters';

interface BackupManagerProps {
  produtos: Produto[];
  vendas: Venda[];
  tiposDespesa: TipoDespesa[];
  despesas: Despesa[];
  historicoEstoque: HistoricoEstoque[];
  onRestaurarDados: (dados: {
    produtos: Produto[];
    vendas: Venda[];
    tiposDespesa: TipoDespesa[];
    despesas: Despesa[];
    historicoEstoque?: HistoricoEstoque[];
  }) => void;
}

interface BackupData {
  versao: string;
  dataBackup: string;
  dados: {
    produtos: Produto[];
    vendas: Venda[];
    tiposDespesa: TipoDespesa[];
    despesas: Despesa[];
    historicoEstoque: HistoricoEstoque[];
  };
  estatisticas: {
    totalProdutos: number;
    totalVendas: number;
    totalTiposDespesa: number;
    totalDespesas: number;
    totalHistoricoEstoque: number;
  };
}

// Componente para gerenciamento de backup e restauração
export const BackupManager: React.FC<BackupManagerProps> = ({
  produtos,
  vendas,
  tiposDespesa,
  despesas,
  historicoEstoque,
  onRestaurarDados
}) => {
  const [historicosBackup, setHistoricosBackup] = useLocalStorage<Array<{
    id: string;
    nome: string;
    data: string;
    tamanho: string;
  }>>('historicosBackup', []);

  const [mensagem, setMensagem] = useState<{
    tipo: 'success' | 'error' | 'info';
    texto: string;
  } | null>(null);

  const [processando, setProcessando] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState<'backup' | 'configuracoes'>('backup');

  // Função para mostrar mensagem temporária
  const mostrarMensagem = (tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  // Função para gerar dados de backup
  const gerarDadosBackup = (): BackupData => {
    return {
      versao: '1.0.0',
      dataBackup: new Date().toISOString(),
      dados: {
        produtos,
        vendas,
        tiposDespesa,
        despesas,
        historicoEstoque
      },
      estatisticas: {
        totalProdutos: produtos.length,
        totalVendas: vendas.length,
        totalTiposDespesa: tiposDespesa.length,
        totalDespesas: despesas.length,
        totalHistoricoEstoque: historicoEstoque.length
      }
    };
  };

  // Função para calcular tamanho do backup
  const calcularTamanhoBackup = (dados: BackupData): string => {
    const json = JSON.stringify(dados);
    const bytes = new Blob([json]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Função para fazer backup automático
  const fazerBackupAutomatico = async () => {
    try {
      setProcessando(true);
      
      const dadosBackup = gerarDadosBackup();
      const nomeArquivo = `backup-produtos-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      const json = JSON.stringify(dadosBackup, null, 2);
      
      // Criar blob e fazer download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      // Adicionar ao histórico
      const novoHistorico = {
        id: Date.now().toString(),
        nome: nomeArquivo,
        data: new Date().toISOString(),
        tamanho: calcularTamanhoBackup(dadosBackup)
      };

      setHistoricosBackup([novoHistorico, ...historicosBackup.slice(0, 9)]); // Manter apenas os 10 mais recentes
      
      mostrarMensagem('success', 'Backup criado e baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      mostrarMensagem('error', 'Erro ao criar backup. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  // Função para fazer backup com escolha de local (usando File System Access API quando disponível)
  const fazerBackupComEscolha = async () => {
    try {
      setProcessando(true);
      
      const dadosBackup = gerarDadosBackup();
      const nomeArquivo = `backup-produtos-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      const json = JSON.stringify(dadosBackup, null, 2);

      // Verificar se o navegador suporta File System Access API
      if ('showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: nomeArquivo,
            types: [{
              description: 'Arquivo de Backup JSON',
              accept: { 'application/json': ['.json'] }
            }]
          });

          const writable = await fileHandle.createWritable();
          await writable.write(json);
          await writable.close();

          // Adicionar ao histórico
          const novoHistorico = {
            id: Date.now().toString(),
            nome: nomeArquivo,
            data: new Date().toISOString(),
            tamanho: calcularTamanhoBackup(dadosBackup)
          };

          setHistoricosBackup([novoHistorico, ...historicosBackup.slice(0, 9)]);
          
          mostrarMensagem('success', 'Backup salvo no local escolhido com sucesso!');
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            throw error;
          }
          // Usuário cancelou a operação
          mostrarMensagem('info', 'Operação cancelada pelo usuário.');
        }
      } else {
        // Fallback para navegadores que não suportam File System Access API
        await fazerBackupAutomatico();
        mostrarMensagem('info', 'Seu navegador não suporta escolha de local. Backup baixado na pasta padrão.');
      }
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      mostrarMensagem('error', 'Erro ao criar backup. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  // Função para restaurar backup
  const restaurarBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.name.endsWith('.json')) {
      mostrarMensagem('error', 'Por favor, selecione um arquivo JSON válido.');
      return;
    }

    setProcessando(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const conteudo = e.target?.result as string;
        const dadosBackup: BackupData = JSON.parse(conteudo);

        // Validar estrutura do backup
        if (!dadosBackup.dados || !dadosBackup.versao) {
          throw new Error('Arquivo de backup inválido');
        }

        const { 
          produtos: produtosBackup, 
          vendas: vendasBackup, 
          tiposDespesa: tiposBackup, 
          despesas: despesasBackup,
          historicoEstoque: historicoBackup = []
        } = dadosBackup.dados;

        // Validar se os dados são arrays
        if (!Array.isArray(produtosBackup) || !Array.isArray(vendasBackup) || 
            !Array.isArray(tiposBackup) || !Array.isArray(despesasBackup)) {
          throw new Error('Dados do backup estão corrompidos');
        }

        if (confirm(`Tem certeza que deseja restaurar este backup?\n\nEsta ação irá substituir todos os dados atuais:\n- ${produtosBackup.length} produtos\n- ${vendasBackup.length} vendas\n- ${tiposBackup.length} tipos de despesa\n- ${despesasBackup.length} despesas\n- ${historicoBackup.length} registros de histórico de estoque\n\nData do backup: ${formatDateTime(dadosBackup.dataBackup)}`)) {
          onRestaurarDados({
            produtos: produtosBackup,
            vendas: vendasBackup,
            tiposDespesa: tiposBackup,
            despesas: despesasBackup,
            historicoEstoque: historicoBackup
          });

          mostrarMensagem('success', 'Backup restaurado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        notify('Erro ao importar dados. O arquivo pode estar corrompido ou em formato inválido.', 'error');
      } finally {
        setProcessando(false);
        // Limpar o input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      mostrarMensagem('error', 'Erro ao ler o arquivo de backup.');
      setProcessando(false);
    };

    reader.readAsText(arquivo);
  };

  // Função para exportar dados específicos
  const exportarDadosEspecificos = async (tipo: 'produtos' | 'vendas' | 'despesas' | 'historico') => {
    try {
      setProcessando(true);
      
      let dados: any;
      let nomeArquivo: string;

      switch (tipo) {
        case 'produtos':
          dados = produtos;
          nomeArquivo = `produtos-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'vendas':
          dados = vendas;
          nomeArquivo = `vendas-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'despesas':
          dados = { tiposDespesa, despesas };
          nomeArquivo = `despesas-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'historico':
          dados = historicoEstoque;
          nomeArquivo = `historico-estoque-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }

      const json = JSON.stringify(dados, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      mostrarMensagem('success', `Dados de ${tipo} exportados com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      mostrarMensagem('error', 'Erro ao exportar dados. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  const dadosBackup = gerarDadosBackup();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Backup e Restauração</h2>
        <p className="text-gray-600 dark:text-gray-300">Gerencie backups dos seus dados</p>
      </div>

      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        <button
          onClick={() => setAbaSelecionada('backup')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            abaSelecionada === 'backup'
              ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          Backup e Restauração
        </button>
        <button
          onClick={() => setAbaSelecionada('configuracoes')}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
            abaSelecionada === 'configuracoes'
              ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Settings size={16} />
          <span>Configurações</span>
        </button>
      </div>

      {abaSelecionada === 'backup' ? (
        <>
          {/* Mensagens */}
          {mensagem && (
            <div className={`card border-l-4 ${
              mensagem.tipo === 'success' ? 'border-success-500 bg-success-50 dark:bg-success-900/20' :
              mensagem.tipo === 'error' ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/20' :
              'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            }`}>
              <div className="flex items-center space-x-3">
                {mensagem.tipo === 'success' ? (
                  <CheckCircle className="text-success-600\" size={20} />
                ) : (
                  <AlertCircle className={`${
                    mensagem.tipo === 'error' ? 'text-danger-600' : 'text-primary-600'
                  }`} size={20} />
                )}
                <p className={`${
                  mensagem.tipo === 'success' ? 'text-success-800 dark:text-success-200' :
                  mensagem.tipo === 'error' ? 'text-danger-800 dark:text-danger-200' :
                  'text-primary-800 dark:text-primary-200'
                }`}>
                  {mensagem.texto}
                </p>
              </div>
            </div>
          )}

          {/* Resumo dos dados atuais */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Dados Atuais do Sistema</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-primary-600">{produtos.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Produtos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-success-600">{vendas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Vendas</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{tiposDespesa.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tipos Despesa</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-danger-600">{despesas.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Despesas</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{historicoEstoque.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Histórico Estoque</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Tamanho estimado do backup:</strong> {calcularTamanhoBackup(dadosBackup)}
              </p>
            </div>
          </div>

          {/* Ações de backup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Criar backup */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Criar Backup</h3>
              <div className="space-y-3">
                <button
                  onClick={fazerBackupComEscolha}
                  disabled={processando}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <FolderOpen size={20} />
                  <span>Backup com Escolha de Local</span>
                </button>
                <button
                  onClick={fazerBackupAutomatico}
                  disabled={processando}
                  className="w-full btn-success flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Backup Rápido (Downloads)</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  O backup inclui todos os produtos, vendas, tipos de despesa, despesas e histórico de estoque.
                </p>
              </div>
            </div>

            {/* Restaurar backup */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Restaurar Backup</h3>
              <div className="space-y-3">
                <label className="w-full btn-danger flex items-center justify-center space-x-2 cursor-pointer">
                  <Upload size={20} />
                  <span>Selecionar Arquivo de Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={restaurarBackup}
                    disabled={processando}
                    className="hidden"
                  />
                </label>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Atenção:</strong> A restauração irá substituir todos os dados atuais. 
                    Faça um backup antes de restaurar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exportação específica */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Exportar Dados Específicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button
                onClick={() => exportarDadosEspecificos('produtos')}
                disabled={processando || produtos.length === 0}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>Exportar Produtos</span>
              </button>
              <button
                onClick={() => exportarDadosEspecificos('vendas')}
                disabled={processando || vendas.length === 0}
                className="btn-success flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>Exportar Vendas</span>
              </button>
              <button
                onClick={() => exportarDadosEspecificos('despesas')}
                disabled={processando || (despesas.length === 0 && tiposDespesa.length === 0)}
                className="btn-danger flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>Exportar Despesas</span>
              </button>
              <button
                onClick={() => exportarDadosEspecificos('historico')}
                disabled={processando || historicoEstoque.length === 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>Exportar Histórico</span>
              </button>
            </div>
          </div>

          {/* Histórico de backups */}
          {historicosBackup.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Histórico de Backups</h3>
              <div className="space-y-2">
                {historicosBackup.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{backup.nome}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDateTime(backup.data)} • {backup.tamanho}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200 text-xs rounded-full">
                        Concluído
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="card bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Informações sobre Backup</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>• Os backups são salvos em formato JSON e contêm todos os seus dados</p>
              <p>• Recomendamos fazer backups regulares, especialmente antes de grandes alterações</p>
              <p>• Os arquivos de backup podem ser abertos em qualquer editor de texto</p>
              <p>• Para maior segurança, mantenha backups em locais diferentes (nuvem, pen drive, etc.)</p>
              <p>• A restauração substitui completamente os dados atuais</p>
              <p>• O histórico de estoque é incluído nos backups completos</p>
            </div>
          </div>
        </>
      ) : (
        <BackupSettings
          produtos={produtos}
          vendas={vendas}
          tiposDespesa={tiposDespesa}
          despesas={despesas}
          historicoEstoque={historicoEstoque}
          onRestaurarDados={onRestaurarDados}
        />
      )}

      {processando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <p className="text-gray-800 dark:text-white">Processando...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

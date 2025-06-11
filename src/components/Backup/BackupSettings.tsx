import React, { useState } from 'react';
import { Settings, Clock, Shield, Trash2 } from 'lucide-react';
import { useBackupScheduler } from '../../hooks/useBackupScheduler';
import { useElectron } from '../../hooks/useElectron';
import { Produto, Venda, TipoDespesa, Despesa, HistoricoEstoque } from '../../types';
import { formatDateTime, notify } from '../../utils/formatters';

interface BackupSettingsProps {
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

// Componente para configurações de backup
export const BackupSettings: React.FC<BackupSettingsProps> = ({
  produtos,
  vendas,
  tiposDespesa,
  despesas,
  historicoEstoque,
  onRestaurarDados
}) => {
  const { userDataPath, isElectron } = useElectron();
  const {
    backupConfig,
    configureAutoBackup,
    createAutoBackup,
    getEmergencyBackups,
    restoreEmergencyBackup,
    shouldCreateBackup
  } = useBackupScheduler({ produtos, vendas, tiposDespesa, despesas, historicoEstoque });

  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const [backupsEmergencia, setBackupsEmergencia] = useState(getEmergencyBackups());

  // Atualizar lista de backups de emergência
  const atualizarBackupsEmergencia = () => {
    setBackupsEmergencia(getEmergencyBackups());
  };

  // Restaurar backup de emergência
  const restaurarBackupEmergencia = (backupId: string) => {
    const dadosBackup = restoreEmergencyBackup(backupId);
    if (dadosBackup && dadosBackup.dados) {
      if (confirm('Tem certeza que deseja restaurar este backup de emergência? Todos os dados atuais serão substituídos.')) {
        onRestaurarDados(dadosBackup.dados);
        notify('Backup de emergência restaurado com sucesso!', 'success');
      }
    } else {
      notify('Erro ao restaurar backup de emergência.', 'error');
    }
  };

  // Remover backup de emergência
  const removerBackupEmergencia = (backupId: string) => {
    if (confirm('Tem certeza que deseja remover este backup de emergência?')) {
      const backups = getEmergencyBackups().filter((b: any) => b.id !== backupId);
      localStorage.setItem('backupsEmergencia', JSON.stringify(backups));
      atualizarBackupsEmergencia();
    }
  };

  // Criar backup manual de emergência
  const criarBackupEmergencia = async () => {
    const sucesso = await createAutoBackup();
    if (sucesso) {
      atualizarBackupsEmergencia();
      notify('Backup de emergência criado com sucesso!', 'success');
    } else {
      notify('Erro ao criar backup de emergência.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Configurações de backup automático */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
            <Settings size={20} />
            <span>Configurações de Backup</span>
          </h3>
          <button
            onClick={() => setMostrarConfiguracoes(!mostrarConfiguracoes)}
            className="text-primary-600 hover:text-primary-700"
          >
            {mostrarConfiguracoes ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {mostrarConfiguracoes && (
          <div className="space-y-4">
            {/* Backup automático */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">Backup Automático</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Criar backups automaticamente em intervalos regulares
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupConfig.autoBackupEnabled}
                  onChange={(e) => configureAutoBackup({ autoBackupEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Intervalo de backup */}
            {backupConfig.autoBackupEnabled && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intervalo de Backup (dias)
                </label>
                <select
                  value={backupConfig.backupInterval}
                  onChange={(e) => configureAutoBackup({ backupInterval: parseInt(e.target.value) })}
                  className="input-field w-full"
                >
                  <option value={1}>Diário</option>
                  <option value={3}>A cada 3 dias</option>
                  <option value={7}>Semanal</option>
                  <option value={14}>Quinzenal</option>
                  <option value={30}>Mensal</option>
                </select>
              </div>
            )}

            {/* Número máximo de backups */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Máximo de Backups de Emergência
              </label>
              <select
                value={backupConfig.maxBackupsToKeep}
                onChange={(e) => configureAutoBackup({ maxBackupsToKeep: parseInt(e.target.value) })}
                className="input-field w-full"
              >
                <option value={3}>3 backups</option>
                <option value={5}>5 backups</option>
                <option value={10}>10 backups</option>
                <option value={15}>15 backups</option>
              </select>
            </div>

            {/* Status do último backup */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Status do Backup</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {backupConfig.lastBackupDate ? (
                  <>Último backup: {formatDateTime(backupConfig.lastBackupDate)}</>
                ) : (
                  'Nenhum backup automático criado ainda'
                )}
              </p>
              {shouldCreateBackup && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  ⚠️ É recomendado criar um novo backup
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backups de emergência */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
            <Shield size={20} />
            <span>Backups de Emergência</span>
          </h3>
          <button
            onClick={criarBackupEmergencia}
            className="btn-primary text-sm"
          >
            Criar Backup Agora
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Backups salvos localmente no navegador para recuperação rápida em caso de emergência.
        </p>

        {backupsEmergencia.length === 0 ? (
          <div className="text-center py-8">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum backup de emergência encontrado.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backupsEmergencia.map((backup: any) => (
              <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{backup.nome}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDateTime(backup.data)}
                  </p>
                  {backup.dados?.estatisticas && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {backup.dados.estatisticas.totalProdutos} produtos • {' '}
                      {backup.dados.estatisticas.totalVendas} vendas • {' '}
                      {backup.dados.estatisticas.totalDespesas} despesas • {' '}
                      {backup.dados.estatisticas.totalHistoricoEstoque || 0} histórico
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => restaurarBackupEmergencia(backup.id)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => removerBackupEmergencia(backup.id)}
                    className="text-danger-600 hover:text-danger-700"
                    title="Remover backup"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações sobre backups de emergência */}
      {/* Informações sobre backups */}
      <div className="space-y-4">
        {/* Backups de Sistema */}
        <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💾 Sobre os Backups do Sistema
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Os backups automáticos são salvos no diretório de dados do aplicativo</p>
            <p>• Local dos backups: {isElectron ? `${userDataPath}/backups` : 'Não disponível'}</p>
            <p>• São arquivos JSON que podem ser restaurados mesmo em outro computador</p>
            <p>• Mantém um histórico organizado por data</p>
            <p>• Recomendado fazer cópias periódicas destes arquivos</p>
          </div>
        </div>

        {/* Backups de Emergência */}
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ℹ️ Sobre os Backups de Emergência
          </h4>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <p>• Os backups de emergência são salvos no armazenamento local do navegador</p>
            <p>• Eles servem como uma camada extra de proteção contra perda de dados</p>
            <p>• São criados automaticamente quando o backup automático está ativado</p>
            <p>• Você pode criar backups manuais a qualquer momento</p>
            <p>• Estes backups são perdidos se você limpar os dados do navegador</p>
            <p>• Incluem o histórico completo de movimentações de estoque</p>
          </div>
        </div>
      </div>
    </div>
  );
};

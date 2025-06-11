import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Produto, Venda, TipoDespesa, Despesa, HistoricoEstoque } from '../types';

interface BackupConfig {
  autoBackupEnabled: boolean;
  backupInterval: number; // em dias
  lastBackupDate: string | null;
  maxBackupsToKeep: number;
}

interface BackupSchedulerProps {
  produtos: Produto[];
  vendas: Venda[];
  tiposDespesa: TipoDespesa[];
  despesas: Despesa[];
  historicoEstoque: HistoricoEstoque[];
}

// Hook para agendamento automático de backups
export const useBackupScheduler = ({ produtos, vendas, tiposDespesa, despesas, historicoEstoque }: BackupSchedulerProps) => {
  const [backupConfig, setBackupConfig] = useLocalStorage<BackupConfig>('backupConfig', {
    autoBackupEnabled: false,
    backupInterval: 7, // 7 dias por padrão
    lastBackupDate: null,
    maxBackupsToKeep: 5
  });

  // Função para verificar se é necessário fazer backup
  const shouldCreateBackup = useCallback(() => {
    if (!backupConfig.autoBackupEnabled) return false;
    if (!backupConfig.lastBackupDate) return true;

    const lastBackup = new Date(backupConfig.lastBackupDate);
    const now = new Date();
    const daysSinceLastBackup = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceLastBackup >= backupConfig.backupInterval;
  }, [backupConfig]);

  // Função para criar backup automático
  const createAutoBackup = useCallback(async () => {
    try {
      const backupData = {
        versao: '1.0.0',
        dataBackup: new Date().toISOString(),
        tipo: 'automatico',
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

      const nomeArquivo = `backup-auto-produtos-${new Date().toISOString().split('T')[0]}.json`;
      const json = JSON.stringify(backupData, null, 2);
      
      // Salvar o arquivo no sistema usando Electron
      if (window.electron) {
        const userDataPath = await window.electron.getUserDataPath();
        const backupPath = `${userDataPath}/backups`;
        await window.electron.saveBackup(backupPath, nomeArquivo, json);
      }
      
      // Salvar no localStorage como backup de emergência
      const backupsEmergencia = JSON.parse(localStorage.getItem('backupsEmergencia') || '[]');
      backupsEmergencia.unshift({
        id: Date.now().toString(),
        nome: nomeArquivo,
        data: new Date().toISOString(),
        dados: backupData
      });

      // Manter apenas os últimos backups conforme configuração
      const backupsLimitados = backupsEmergencia.slice(0, backupConfig.maxBackupsToKeep);
      localStorage.setItem('backupsEmergencia', JSON.stringify(backupsLimitados));

      // Atualizar data do último backup
      setBackupConfig(prev => ({
        ...prev,
        lastBackupDate: new Date().toISOString()
      }));

      console.log('Backup automático criado com sucesso:', nomeArquivo);
      return true;
    } catch (error) {
      console.error('Erro ao criar backup automático:', error);
      return false;
    }
  }, [produtos, vendas, tiposDespesa, despesas, historicoEstoque, backupConfig.maxBackupsToKeep, setBackupConfig]);

  // Verificar e criar backup automático quando necessário
  useEffect(() => {
    if (shouldCreateBackup()) {
      createAutoBackup();
    }
  }, [shouldCreateBackup, createAutoBackup]);

  // Função para configurar backup automático
  const configureAutoBackup = useCallback((config: Partial<BackupConfig>) => {
    setBackupConfig(prev => ({ ...prev, ...config }));
  }, [setBackupConfig]);

  // Função para obter backups de emergência
  const getEmergencyBackups = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('backupsEmergencia') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Função para restaurar backup de emergência
  const restoreEmergencyBackup = useCallback((backupId: string) => {
    try {
      const backups = getEmergencyBackups();
      const backup = backups.find((b: any) => b.id === backupId);
      return backup ? backup.dados : null;
    } catch {
      return null;
    }
  }, [getEmergencyBackups]);

  return {
    backupConfig,
    configureAutoBackup,
    createAutoBackup,
    getEmergencyBackups,
    restoreEmergencyBackup,
    shouldCreateBackup: shouldCreateBackup()
  };
};
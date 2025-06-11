import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Produtos } from './components/Produtos/Produtos';
import { Vendas } from './components/Vendas/Vendas';
import { Despesas } from './components/Despesas/Despesas';
import { Estoque } from './components/Estoque/Estoque';
import { Historico } from './components/Historico/Historico';
import { BackupManager } from './components/Backup/BackupManager';
import { Sobre } from './components/Layout/Sobre';
import { ThemeProvider } from './contexts/ThemeContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TabAtual, Produto, Venda, TipoDespesa, Despesa, HistoricoEstoque } from './types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente principal da aplicação
function App() {
  const [tabAtual, setTabAtual] = useState<TabAtual>('dashboard');
  
  // Estados usando hook personalizado para localStorage
  const [produtos, setProdutos] = useLocalStorage<Produto[]>('produtos', []);
  const [vendas, setVendas] = useLocalStorage<Venda[]>('vendas', []);
  const [tiposDespesa, setTiposDespesa] = useLocalStorage<TipoDespesa[]>('tiposDespesa', []);
  const [despesas, setDespesas] = useLocalStorage<Despesa[]>('despesas', []);
  const [historicoEstoque, setHistoricoEstoque] = useLocalStorage<HistoricoEstoque[]>('historicoEstoque', []);

  // Função para restaurar dados do backup
  const restaurarDados = (dadosBackup: {
    produtos: Produto[];
    vendas: Venda[];
    tiposDespesa: TipoDespesa[];
    despesas: Despesa[];
    historicoEstoque?: HistoricoEstoque[];
  }) => {
    setProdutos(dadosBackup.produtos);
    setVendas(dadosBackup.vendas);
    setTiposDespesa(dadosBackup.tiposDespesa);
    setDespesas(dadosBackup.despesas);
    if (dadosBackup.historicoEstoque) {
      setHistoricoEstoque(dadosBackup.historicoEstoque);
    }
  };

  // Função para renderizar o conteúdo da aba atual
  const renderizarConteudo = () => {
    switch (tabAtual) {
      case 'dashboard':
        return (
          <Dashboard
            produtos={produtos}
            vendas={vendas}
            despesas={despesas}
            onMudarTab={setTabAtual}
          />
        );
      case 'produtos':
        return (
          <Produtos
            produtos={produtos}
            onAtualizarProdutos={setProdutos}
            historicoEstoque={historicoEstoque}
            onAtualizarHistoricoEstoque={setHistoricoEstoque}
          />
        );
      case 'vendas':
        return (
          <Vendas
            produtos={produtos}
            vendas={vendas}
            onAtualizarVendas={setVendas}
            onAtualizarProdutos={setProdutos}
          />
        );
      case 'despesas':
        return (
          <Despesas
            tiposDespesa={tiposDespesa}
            despesas={despesas}
            onAtualizarTiposDespesa={setTiposDespesa}
            onAtualizarDespesas={setDespesas}
          />
        );
      case 'estoque':
        return <Estoque produtos={produtos} />;
      case 'historico':
        return <Historico vendas={vendas} despesas={despesas} />;
      case 'backup':
        return (
          <BackupManager
            produtos={produtos}
            vendas={vendas}
            tiposDespesa={tiposDespesa}
            despesas={despesas}
            historicoEstoque={historicoEstoque}
            onRestaurarDados={restaurarDados}
          />
        );
      case 'sobre':
        return <Sobre />;
      default:
        return <Dashboard produtos={produtos} vendas={vendas} despesas={despesas} onMudarTab={setTabAtual} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar tabAtual={tabAtual} onMudarTab={setTabAtual} />
        
        <div className="ml-64 min-h-screen">
          <div className="p-8">
            {renderizarConteudo()}
          </div>
        </div>
      </div>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;

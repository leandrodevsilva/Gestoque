import React from 'react';
import { Mail, Phone, Github, Info } from 'lucide-react';

export const Sobre: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Sobre o Sistema</h2>
        <p className="text-gray-600 dark:text-gray-300">Instruções básicas e informações de suporte</p>
      </div>

      {/* Instruções básicas */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Instruções de Uso</h3>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h4 className="font-medium mb-2">Produtos</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Cadastre seus produtos com nome, preço e quantidade inicial em estoque</li>
              <li>Gerencie o estoque adicionando novas quantidades quando necessário</li>
              <li>Acompanhe o histórico de movimentações do estoque</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Vendas</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Registre vendas selecionando produtos e suas quantidades</li>
              <li>O sistema atualiza automaticamente o estoque após cada venda</li>
              <li>Visualize o histórico completo de vendas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Despesas</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Cadastre tipos de despesas para melhor organização</li>
              <li>Registre despesas informando tipo, descrição e valor</li>
              <li>Acompanhe todos os gastos em um só lugar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Backup</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Configure backups automáticos para maior segurança</li>
              <li>Escolha a frequência e o local de salvamento dos backups</li>
              <li>Restaure dados facilmente quando necessário</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Informações de Suporte */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Suporte</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span>Telefone: (35) 99262-3852</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span>Email: lasmg93@hotmail.com</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
            <Github className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <a 
              href="https://github.com/leandrodevsilva" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              github.com/leandrodevsilva
            </a>
          </div>
        </div>
      </div>

      {/* Versão do Sistema */}
      <div className="card">
        <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
          <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span>Versão 1.0.0</span>
        </div>
      </div>
    </div>
  );
};

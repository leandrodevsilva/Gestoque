import React from 'react';
import { TabAtual } from '../../types';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  History,
  HardDrive,
  Info
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import logoImg from '/logo.png';

interface SidebarProps {
  tabAtual: TabAtual;
  onMudarTab: (tab: TabAtual) => void;
}

// Componente da barra lateral de navegação
export const Sidebar: React.FC<SidebarProps> = ({ tabAtual, onMudarTab }) => {
  const menuItems = [
    { id: 'dashboard' as TabAtual, label: 'Dashboard', icon: Home },
    { id: 'produtos' as TabAtual, label: 'Produtos', icon: Package },
    { id: 'vendas' as TabAtual, label: 'Vendas', icon: ShoppingCart },
    { id: 'despesas' as TabAtual, label: 'Despesas', icon: CreditCard },
    { id: 'estoque' as TabAtual, label: 'Estoque', icon: BarChart3 },
    { id: 'historico' as TabAtual, label: 'Histórico', icon: History },
    { id: 'backup' as TabAtual, label: 'Backup', icon: HardDrive },
    { id: 'sobre' as TabAtual, label: 'Sobre', icon: Info },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 z-10 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-center mb-8">
          <img src={logoImg} alt="Logo" className="h-10 w-auto" style={{ width: '100%', height: 'auto' }} />
        </div>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onMudarTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  tabAtual === item.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  titulo: string;
  valor: string;
  icon: LucideIcon;
  cor: 'primary' | 'success' | 'danger';
  onClick?: () => void;
}

// Componente de card para estatísticas no dashboard
export const StatCard: React.FC<StatCardProps> = ({ 
  titulo, 
  valor, 
  icon: Icon, 
  cor, 
  onClick 
}) => {
  const cores = {
    primary: 'bg-primary-500 text-white',
    success: 'bg-success-500 text-white',
    danger: 'bg-danger-500 text-white'
  };

  return (
    <div 
      className={`card cursor-pointer transform hover:scale-105 transition-transform duration-200 ${onClick ? 'hover:shadow-xl' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${cores[cor]} mr-4`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{titulo}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{valor}</p>
        </div>
      </div>
    </div>
  );
};
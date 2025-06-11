import React, { useState } from 'react';
import { Produto } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Minus } from 'lucide-react';

interface MultiProductSelectorProps {
  produtos: Produto[];
  onProductChange: (product: Produto | null) => void;
}

export const MultiProductSelector: React.FC<MultiProductSelectorProps> = ({ produtos, onProductChange }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setSelectedProductId(productId);
    const selectedProduct = produtos.find(p => p.id === productId) || null;
    onProductChange(selectedProduct);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Produto:
      </label>
      <select
        value={selectedProductId}
        onChange={handleProductChange}
        className="input-field"
      >
        <option value="">Selecione um produto</option>
        {produtos.map(produto => (
          <option key={produto.id} value={produto.id}>
            {produto.nome} - Estoque: {produto.quantidadeEstoque} - {formatCurrency(produto.preco)}
          </option>
        ))}
      </select>
    </div>
  );
};

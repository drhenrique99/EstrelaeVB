import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface Props {
  quantity: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<Props> = ({ quantity, onChange, disabled }) => {
  const decrease = () => {
    if (quantity > 1) onChange(quantity - 1);
  };

  const increase = () => {
    onChange(quantity + 1);
  };

  return (
    <div className={`flex items-center border rounded-md bg-white ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <button 
        onClick={(e) => { e.stopPropagation(); decrease(); }}
        className="p-1 hover:bg-gray-100 text-gray-600 rounded-l-md transition-colors"
        type="button"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-medium text-gray-900 select-none">
        {quantity}
      </span>
      <button 
        onClick={(e) => { e.stopPropagation(); increase(); }}
        className="p-1 hover:bg-gray-100 text-gray-600 rounded-r-md transition-colors"
        type="button"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

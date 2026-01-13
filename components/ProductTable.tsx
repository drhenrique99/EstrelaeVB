import React from 'react';
import { SheetData, ProductRow } from '../types';
import { QuantitySelector } from './QuantitySelector';

interface Props {
  data: SheetData;
  selectedItems: Record<string, number>;
  onToggleSelect: (row: ProductRow) => void;
  onUpdateQuantity: (row: ProductRow, qty: number) => void;
}

export const ProductTable: React.FC<Props> = ({ 
  data, 
  selectedItems, 
  onToggleSelect, 
  onUpdateQuantity 
}) => {
  if (!data.rows.length) return null;

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/90 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Selecionar</th>
              {data.headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 whitespace-nowrap min-w-[150px]">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 w-32 text-center">Qtd.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.map((row) => {
              const isSelected = !!selectedItems[row.id];
              const quantity = selectedItems[row.id] || 1;

              return (
                <tr 
                  key={row.id} 
                  className={`hover:bg-blue-50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                  onClick={() => onToggleSelect(row)}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      // IMPORTANTE: stopPropagation impede que o clique no checkbox acione o clique da linha duas vezes
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(row);
                      }}
                      onChange={() => {}} 
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  {data.headers.map((header, idx) => (
                    <td key={idx} className="px-4 py-3 whitespace-nowrap text-gray-900">
                      {row.data[header]}
                    </td>
                  ))}
                  <td className="px-4 py-3 flex justify-center">
                    <div onClick={(e) => e.stopPropagation()}>
                       <QuantitySelector 
                          quantity={quantity} 
                          onChange={(qty) => onUpdateQuantity(row, qty)}
                          disabled={!isSelected}
                        />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShoppingCart, Send, ChevronUp, ChevronDown, User, Users } from 'lucide-react';
import { CartItem, SheetData } from '../types';
import { formatCurrency, parseCurrency } from '../utils/formatter';
import { 
    WHATSAPP_NUMBER_1, WHATSAPP_LABEL_1,
    WHATSAPP_NUMBER_2, WHATSAPP_LABEL_2,
    MEDICINE_COLUMN_KEYWORDS, LAB_COLUMN_KEYWORDS 
} from '../constants';

interface Props {
  items: CartItem[];
  sheetData: SheetData;
}

export const CartSummary: React.FC<Props> = ({ items, sheetData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);

  // Helper para encontrar coluna por keywords
  const findColumn = (keywords: string[]) => {
    return sheetData.headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));
  };

  const medCol = findColumn(MEDICINE_COLUMN_KEYWORDS) || sheetData.headers[0];
  const labCol = findColumn(LAB_COLUMN_KEYWORDS);
  const priceColIndex = sheetData.priceColumnIndex;

  // Calculate totals for Display
  const totalAmount = items.reduce((acc, item) => {
    if (priceColIndex === -1) return 0;
    const priceHeader = sheetData.headers[priceColIndex];
    const unitPrice = parseCurrency(item.data[priceHeader]);
    return acc + (unitPrice * item.quantity);
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSendWhatsApp = (targetNumber: string | null) => {
    if (items.length === 0) return;

    // Recalcula o total dentro da função para garantir consistência
    let calculatedTotal = 0;

    // Cabeçalho da Mensagem
    let message = `🚀 *NOVO PEDIDO - Estrela da Leste / Dr. VB*\n`;
    message += `📅 Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}\n`;
    message += `--------------------------------\n`;
    
    items.forEach((item, index) => {
      const nome = item.data[medCol] || 'Item sem nome';
      const laboratorio = labCol ? (item.data[labCol] || '-') : '';
      
      let unitPrice = 0;
      let subtotal = 0;

      if (priceColIndex !== -1) {
        const priceHeader = sheetData.headers[priceColIndex];
        unitPrice = parseCurrency(item.data[priceHeader]);
        subtotal = unitPrice * item.quantity;
        calculatedTotal += subtotal;
      }

      message += `*${index + 1}. ${nome}*\n`;
      if (laboratorio) {
        message += `   🏭 Lab: ${laboratorio}\n`;
      }
      message += `   📦 Qtd: ${item.quantity}`;
      
      if (unitPrice > 0) {
        message += ` x ${formatCurrency(unitPrice)}\n`;
        message += `   💰 *Subtotal: ${formatCurrency(subtotal)}*\n`;
      } else {
        message += `\n`;
      }
      message += `\n`;
    });

    message += `--------------------------------\n`;
    if (priceColIndex !== -1) {
      message += `💲 *TOTAL DO PEDIDO: ${formatCurrency(calculatedTotal)}*`;
    } else {
      message += `📦 *Total de Itens: ${totalItems}*`;
    }

    const encodedMessage = encodeURIComponent(message);
    
    // Se targetNumber for null, usa link genérico (abre seletor do usuário)
    // Se tiver número, manda direto
    const url = targetNumber 
        ? `https://wa.me/${targetNumber}?text=${encodedMessage}`
        : `https://wa.me/?text=${encodedMessage}`;
        
    window.open(url, '_blank');
    setShowSendOptions(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50">
        
        {/* Menu de Opções de Envio (Pop-up) */}
        {showSendOptions && (
            <div className="absolute bottom-full right-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-100 w-64 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                <div className="p-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    Escolha o destino
                </div>
                <div className="flex flex-col">
                    {WHATSAPP_NUMBER_1 && (
                        <button 
                            onClick={() => handleSendWhatsApp(WHATSAPP_NUMBER_1)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left transition-colors border-b border-gray-100"
                        >
                            <div className="bg-green-100 p-2 rounded-full text-green-700"><User size={16}/></div>
                            <span className="font-medium text-gray-800">{WHATSAPP_LABEL_1}</span>
                        </button>
                    )}
                    
                    {WHATSAPP_NUMBER_2 && (
                        <button 
                            onClick={() => handleSendWhatsApp(WHATSAPP_NUMBER_2)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left transition-colors border-b border-gray-100"
                        >
                            <div className="bg-blue-100 p-2 rounded-full text-blue-700"><User size={16}/></div>
                            <span className="font-medium text-gray-800">{WHATSAPP_LABEL_2}</span>
                        </button>
                    )}

                    <button 
                        onClick={() => handleSendWhatsApp(null)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                         <div className="bg-gray-100 p-2 rounded-full text-gray-700"><Users size={16}/></div>
                         <span className="font-medium text-gray-800">Enviar para Grupo / Outro</span>
                    </button>
                </div>
                {/* Cancel overlay click */}
                <div 
                    className="fixed inset-0 -z-10" 
                    onClick={() => setShowSendOptions(false)} 
                />
            </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">    
          <div 
            className="flex flex-col cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <ShoppingCart size={20} />
                <span>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
            <div className="text-gray-900 font-bold text-lg">
                {priceColIndex !== -1 ? formatCurrency(totalAmount) : 'Sob Consulta'}
            </div>
          </div>

          <button
            onClick={() => setShowSendOptions(!showSendOptions)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
          >
            <span>Finalizar Pedido</span>
            <Send size={18} />
          </button>
        </div>

        {/* Resumo Detalhado (Drawer) */}
        {isOpen && (
            <div className="border-t border-gray-100 bg-gray-50 max-h-[60vh] overflow-y-auto p-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Resumo Detalhado</h3>
                <ul className="space-y-3">
                    {items.map(item => {
                         const nome = item.data[medCol] || 'Item';
                         const priceHeader = priceColIndex !== -1 ? sheetData.headers[priceColIndex] : '';
                         const unitPrice = priceHeader ? parseCurrency(item.data[priceHeader]) : 0;
                         const subtotal = unitPrice * item.quantity;

                        return (
                            <li key={item.id} className="flex justify-between items-start bg-white p-3 rounded shadow-sm">
                                <div>
                                    <div className="font-medium text-gray-900">{nome}</div>
                                    <div className="text-xs text-gray-500">
                                      {labCol && item.data[labCol] ? `${item.data[labCol]} • ` : ''} 
                                      Qtd: {item.quantity}
                                    </div>
                                </div>
                                <div className="font-semibold text-gray-700">
                                    {unitPrice > 0 ? formatCurrency(subtotal) : '-'}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )}
      </div>
    </>
  );
};

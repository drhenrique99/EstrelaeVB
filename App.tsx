import React, { useEffect, useState } from 'react';
import { fetchSheetData } from './services/sheetService';
import { SheetData, ProductRow, CartItem } from './types';
import { ProductTable } from './components/ProductTable';
import { CartSummary } from './components/CartSummary';
import { Loader2, AlertCircle, Users, RefreshCw, Smartphone, Ticket, Package, Pill, ArrowLeft } from 'lucide-react';
import { 
  WHATSAPP_GROUP_URL, 
  SHEET_ID_MEDICAMENTOS, 
  SHEET_ID_DIVERSOS, 
  WHATSAPP_NUMBER_1,
  WHATSAPP_LABEL_1,
  DASHBOARD_VS_IMAGE_URL
} from './constants';

type ViewState = 'dashboard' | 'medicamentos' | 'diversos';

const App: React.FC = () => {
  // Estado da Navegação
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [activeSheetId, setActiveSheetId] = useState<string>(SHEET_ID_MEDICAMENTOS);
  const [activeSheetName, setActiveSheetName] = useState<string | undefined>(undefined);
  const [activeTitle, setActiveTitle] = useState<string>('');

  // Estados de Dados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SheetData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Carrinho
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});

  // Carregar dados quando a View ou SheetId mudar (exceto Dashboard)
  useEffect(() => {
    if (currentView !== 'dashboard') {
      loadData();
    }
  }, [currentView, activeSheetId, activeSheetName]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Passa o ID da planilha ativa e o nome da aba (se houver)
      const sheetData = await fetchSheetData(activeSheetId, activeSheetName);
      setData(sheetData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Não foi possível carregar os dados. Verifique a conexão e se a planilha é pública.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type: number) => {
    if (type === 1) {
      // Recarga Claro Tim -> Vendedor 1
      const msg = encodeURIComponent("Olá, gostaria de fazer uma Recarga Claro/Tim.");
      window.open(`https://wa.me/${WHATSAPP_NUMBER_1}?text=${msg}`, '_blank');
    } else if (type === 2) {
      // Bilhete Único -> Vendedor 1
      const msg = encodeURIComponent("Olá, gostaria de falar sobre Bilhete Único.");
      window.open(`https://wa.me/${WHATSAPP_NUMBER_1}?text=${msg}`, '_blank');
    } else if (type === 3) {
      // Produtos Diversos -> Nova Planilha / Aba Diversos
      setActiveSheetId(SHEET_ID_DIVERSOS);
      setActiveSheetName('Diversos'); // Define o nome da aba
      setActiveTitle('Produtos Diversos');
      setSelectedMap({}); // Limpa carrinho ao trocar de setor
      setCurrentView('diversos');
    } else if (type === 4) {
      // Medicamentos -> Planilha Original / Aba Padrão
      setActiveSheetId(SHEET_ID_MEDICAMENTOS);
      setActiveSheetName(undefined); // Remove nome da aba para usar a padrão (primeira)
      setActiveTitle('Medicamentos');
      setSelectedMap({}); // Limpa carrinho ao trocar de setor
      setCurrentView('medicamentos');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setData(null); // Opcional: limpar dados para economizar memória
  };

  const handleToggleSelect = (row: ProductRow) => {
    setSelectedMap(prev => {
      const newMap = { ...prev };
      if (newMap[row.id]) {
        delete newMap[row.id];
      } else {
        newMap[row.id] = 1;
      }
      return newMap;
    });
  };

  const handleUpdateQuantity = (row: ProductRow, qty: number) => {
    setSelectedMap(prev => {
        if (!prev[row.id]) return prev;
        return { ...prev, [row.id]: qty };
    });
  };

  const cartItems: CartItem[] = data ? Object.keys(selectedMap).map(rowId => {
      const row = data.rows.find(r => r.id === rowId);
      if (!row) return null;
      return { ...row, quantity: selectedMap[rowId] };
  }).filter(Boolean) as CartItem[] : [];

  const backgroundImageUrl = "https://images.unsplash.com/photo-1620641788421-7f1c91ade383?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen pb-24 flex flex-col relative bg-gray-900 font-sans">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-45 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
      />
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col flex-grow">
        
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentView !== 'dashboard' && (
                    <button 
                      onClick={handleBackToDashboard}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                  )}
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight uppercase leading-none">
                      {currentView === 'dashboard' ? (
                        <>Estrela da Leste <span className="text-red-600">&</span> Dr. VB</>
                      ) : (
                        activeTitle
                      )}
                    </h1>
                    {currentView === 'dashboard' && (
                       <p className="text-xs text-gray-500 mt-1">Selecione uma categoria abaixo</p>
                    )}
                  </div>
                </div>

                {/* Botões do Topo */}
                <div className="flex items-center gap-2">
                  {currentView === 'dashboard' ? (
                    null
                  ) : (
                    <button 
                      onClick={loadData}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 text-xs font-medium"
                    >
                      <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                      {loading ? "..." : "Atualizar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="relative mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
              
              {/* GRID 2x2 com espaçamento para o centro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* CARD 1 (Novo): Produtos Diversos (Esquerda) */}
                <button 
                  onClick={() => handleCardClick(3)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-left shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 min-h-[160px]"
                >
                  <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm">
                      <Package className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Produtos Diversos</h3>
                      <p className="text-emerald-100 text-sm">Variedades e Ofertas</p>
                      <div className="mt-3 text-xs font-semibold text-white/80 bg-white/20 w-fit px-2 py-1 rounded">
                        Ver Catálogo
                      </div>
                    </div>
                  </div>
                </button>

                {/* CARD 2 (Novo): Medicamentos (Direita) */}
                <button 
                  onClick={() => handleCardClick(4)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-6 text-right shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 min-h-[160px]"
                >
                  <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm ml-auto">
                      <Pill className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Medicamentos</h3>
                      <p className="text-blue-100 text-sm">Pedido Mínimo 3 itens diversos</p>
                      <div className="mt-3 text-xs font-semibold text-white/80 bg-white/20 w-fit px-2 py-1 rounded ml-auto">
                        Ver Tabela
                      </div>
                    </div>
                  </div>
                </button>

                {/* ELEMENTO CENTRAL PARA MOBILE (VS - Losango) */}
                {/* Visível apenas em mobile, inserido no fluxo do grid */}
                <div className="sm:hidden flex justify-center items-center py-2 -my-2 z-10">
                   <div className="w-32 h-32 bg-gray-900/60 backdrop-blur-md border border-white/20 shadow-lg rotate-45 rounded-xl overflow-hidden flex items-center justify-center">
                      <div className="-rotate-45 w-[140%] h-[140%] flex items-center justify-center">
                          <img 
                            src={DASHBOARD_VS_IMAGE_URL} 
                            alt="VS" 
                            className="object-cover w-full h-full scale-110" 
                          />
                      </div>
                   </div>
                </div>

                {/* CARD 3 (Novo): Recarga (Esquerda - Baixo) */}
                <button 
                  onClick={() => handleCardClick(1)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-left shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 min-h-[160px]"
                >
                  <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm">
                      <Smartphone className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Recarga</h3>
                      <p className="text-purple-100 text-sm">Claro & Tim</p>
                      <div className="mt-3 text-xs font-semibold text-white/80 flex items-center gap-1">
                        Falar com {WHATSAPP_LABEL_1} →
                      </div>
                    </div>
                  </div>
                </button>

                {/* CARD 4 (Novo): Bilhete Único (Direita - Baixo) */}
                <button 
                  onClick={() => handleCardClick(2)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-right shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl border border-white/10 min-h-[160px]"
                >
                  <div className="absolute right-0 top-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20"></div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-sm ml-auto">
                      <Ticket className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Bilhete Único</h3>
                      <p className="text-pink-100 text-sm">Serviços e Recargas</p>
                       <div className="mt-3 text-xs font-semibold text-white/80 flex items-center justify-end gap-1">
                        Falar com {WHATSAPP_LABEL_1} →
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* CARD LOSANGO CENTRAL ABSOLUTO (DESKTOP) */}
              {/* Visível apenas em telas SM ou maiores, posicionado absolutamente no centro */}
              <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 justify-center items-center pointer-events-none">
                 <div className="w-44 h-44 bg-black/40 backdrop-blur-md border border-white/30 shadow-[0_0_25px_rgba(0,0,0,0.5)] rotate-45 rounded-2xl overflow-hidden flex items-center justify-center pointer-events-auto transition-transform hover:scale-105 hover:border-white/50">
                    <div className="-rotate-45 w-[150%] h-[150%] flex items-center justify-center">
                        <img 
                          src={DASHBOARD_VS_IMAGE_URL} 
                          alt="VS" 
                          className="object-contain w-full h-full" 
                        />
                    </div>
                 </div>
              </div>

            </div>
          )}

          {/* LIST VIEWS (Medicamentos ou Diversos) */}
          {currentView !== 'dashboard' && (
            <>
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white/80 rounded-lg backdrop-blur-sm shadow-lg animate-in fade-in">
                  <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                  <p className="font-medium">Carregando {activeTitle}...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700 shadow-sm animate-in fade-in">
                  <AlertCircle className="mx-auto mb-2" size={32} />
                  <p className="font-medium">{error}</p>
                  <button 
                      onClick={loadData}
                      className="mt-4 text-sm underline hover:text-red-800"
                  >
                      Tentar novamente
                  </button>
                </div>
              )}

              {!loading && !error && data && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="mb-4 text-sm text-gray-800 bg-white/90 backdrop-blur-sm p-3 rounded-md border-l-4 border-blue-600 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span><span className="font-bold">Catálogo:</span> {activeTitle}</span>
                          <span className="text-xs text-gray-500">Última atualização: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <ProductTable 
                          data={data}
                          selectedItems={selectedMap}
                          onToggleSelect={handleToggleSelect}
                          onUpdateQuantity={handleUpdateQuantity}
                      />
                  </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Sticky Cart (Only shows when in a product view and data is loaded) */}
      {currentView !== 'dashboard' && !loading && !error && data && (
        <div className="relative z-50">
           <CartSummary items={cartItems} sheetData={data} />
        </div>
      )}
    </div>
  );
};

export default App;
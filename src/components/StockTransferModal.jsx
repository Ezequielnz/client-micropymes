import React, { useState, useEffect } from 'react';
import { stockTransferAPI } from '../utils/api';
import { Search } from 'lucide-react';

const StockTransferModal = ({
  isOpen,
  onClose,
  businessId,
  branches,
  products,
  onTransferSuccess
}) => {
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOrigenId('');
      setDestinoId('');
      setSearchTerm('');
      setSelectedProducts([]);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProductSelect = (product) => {
    if (!origenId) {
      alert('Selecciona una sucursal de origen primero');
      return;
    }
    
    const maxStock = product.stock_por_sucursal?.[origenId] || 0;
    if (maxStock <= 0) {
      alert('El producto no tiene stock en la sucursal de origen');
      return;
    }

    if (!selectedProducts.find((p) => p.producto_id === product.id)) {
      setSelectedProducts([...selectedProducts, { 
        producto_id: product.id, 
        nombre: product.nombre,
        cantidad: 1,
        maxStock: maxStock
      }]);
    }
    setSearchTerm('');
  };

  const handleQuantityChange = (id, value) => {
    const val = parseInt(value, 10);
    setSelectedProducts(selectedProducts.map(p => {
      if (p.producto_id === id) {
        return { ...p, cantidad: isNaN(val) ? '' : val };
      }
      return p;
    }));
  };

  const removeProduct = (id) => {
    setSelectedProducts(selectedProducts.filter((p) => p.producto_id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origenId || !destinoId) {
      alert('Selecciona las sucursales de origen y destino');
      return;
    }
    if (origenId === destinoId) {
      alert('El origen y destino no pueden ser iguales');
      return;
    }
    
    const validProducts = selectedProducts.filter(p => typeof p.cantidad === 'number' && p.cantidad > 0);
    
    if (validProducts.length === 0) {
      alert('Añade al menos un producto con cantidad válida');
      return;
    }

    // Validate stock
    for (const p of validProducts) {
      if (p.cantidad > p.maxStock) {
        alert(`Cantidad excede el stock para ${p.nombre} (Max: ${p.maxStock})`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        origen_sucursal_id: origenId,
        destino_sucursal_id: destinoId,
        detalles: validProducts.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad
        }))
      };
      
      const draft = await stockTransferAPI.create(businessId, payload);
      
      // Intentar confirmarla automáticamente
      try {
        await stockTransferAPI.confirm(businessId, draft.id);
        
        // Dependiendo de la config del backend "confirmar_transferencias_automaticamente",
        // podría estar ya en 'recibido'. Si sigue en 'transito' (o similar), lo recibimos
        // Aunque recibir puede dar error si ya se recibió o requiere permisos.
        // Hacemos el receive en un try-catch silencioso por si falla por la config.
        try {
          await stockTransferAPI.receive(businessId, draft.id);
        } catch(receiveErr) {
          // It might fail if already received or if branch config disables direct receiving, ignore it
          console.log("Receive step status:", receiveErr.message);
        }
        alert('Transferencia realizada con éxito');
        onTransferSuccess();
        onClose();
      } catch (confirmError) {
        // We created it, but couldn't confirm
        alert('Transferencia creada como borrador (no se pudo confirmar automáticamente)');
        onTransferSuccess();
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al crear la transferencia');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) => product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
      
      <div className="relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full w-[90%]">
        <form onSubmit={handleSubmit}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Transferir Stock Rápido
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Origen</label>
                        <select
                          value={origenId}
                          onChange={(e) => setOrigenId(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-gray-900"
                        >
                          <option value="">Selecciona sucursal</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Destino</label>
                        <select
                          value={destinoId}
                          onChange={(e) => setDestinoId(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white text-gray-900"
                        >
                          <option value="">Selecciona sucursal</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id}>{b.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400"
                        placeholder="Buscar producto para transferir..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={!origenId}
                      />
                    </div>
                    
                    {searchTerm && origenId && (
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {filteredProducts.map((product) => {
                          const maxStock = product.stock_por_sucursal?.[origenId] || 0;
                          return (
                            <div
                              key={product.id}
                              className={`p-2 cursor-pointer hover:bg-gray-100 flex justify-between ${maxStock <= 0 ? 'opacity-50' : ''}`}
                              onClick={() => maxStock > 0 && handleProductSelect(product)}
                            >
                              <span className="text-gray-900">{product.nombre}</span>
                              <span className="text-sm text-gray-500">Disp: {maxStock}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Productos a transferir:</h4>
                      {selectedProducts.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay productos seleccionados.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedProducts.map((p) => (
                            <div key={p.producto_id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                              <span className="text-sm text-gray-900 flex-1">{p.nombre} (Máx: {p.maxStock})</span>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  max={p.maxStock}
                                  value={p.cantidad}
                                  onChange={(e) => handleQuantityChange(p.producto_id, e.target.value)}
                                  className="w-20 p-1 text-sm border border-gray-300 rounded bg-white text-gray-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeProduct(p.producto_id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-500"
            >
              {isLoading ? 'Transfiriendo...' : 'Transferir'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
          </form>
      </div>
    </div>
  );
};

export default StockTransferModal;

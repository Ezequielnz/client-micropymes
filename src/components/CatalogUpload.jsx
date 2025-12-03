import React, { useState } from 'react';
import { productAPI } from '../utils/api';

/**
 * Component for uploading and processing PDF product catalogs.
 * 
 * Allows users to:
 * 1. Select a PDF file.
 * 2. Preview extracted products.
 * 3. Edit extracted data (code, description, price, stock).
 * 4. Select price type (Cost vs Sale).
 * 5. Confirm bulk import.
 * 
 * @param {object} props
 * @param {string} props.businessId - The ID of the current business.
 * @param {function} props.onClose - Callback to close the modal/view.
 * @param {function} props.onSuccess - Callback after successful import.
 */
const CatalogUpload = ({ businessId, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [parsedProducts, setParsedProducts] = useState([]);
    const [step, setStep] = useState('upload'); // 'upload', 'review', 'processing'
    const [priceType, setPriceType] = useState('costo'); // 'costo' or 'venta'
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Por favor selecciona un archivo PDF.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const products = await productAPI.uploadCatalog(businessId, file);
            if (products.length === 0) {
                setError("No se detectaron productos en el archivo. Asegúrate de que sea un catálogo válido.");
                setLoading(false);
                return;
            }

            // Add default stock and internal ID for key
            const productsWithMeta = products.map((p, index) => ({
                ...p,
                id: index,
                stock: 0, // Default stock
                unidades: '', // Default units
                selected: true
            }));

            setParsedProducts(productsWithMeta);
            setStep('review');
        } catch (err) {
            console.error(err);
            setError("Error al procesar el archivo. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = (id, field, value) => {
        setParsedProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const handleRemoveProduct = (id) => {
        setParsedProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleConfirmImport = async () => {
        setLoading(true);
        setStep('processing');

        try {
            // Prepare data for backend
            const productsToImport = parsedProducts.map(p => ({
                codigo: p.codigo,
                nombre: p.descripcion, // Use description as name
                descripcion: p.descripcion,
                precio: parseFloat(p.precio_detectado),
                stock: parseInt(p.stock) || 0,
                unidades: p.unidades || ''
            }));

            const importData = {
                productos: productsToImport,
                tipo_precio: priceType
            };

            const result = await productAPI.bulkUpsertProducts(businessId, importData);

            if (onSuccess) onSuccess(result);
            if (onClose) onClose();

        } catch (err) {
            console.error(err);
            setError("Error al guardar los productos. " + (err.response?.data?.detail || err.message));
            setStep('review'); // Go back to review on error
        } finally {
            setLoading(false);
        }
    };

    if (step === 'upload') {
        return (
            <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Cargar Catálogo PDF</h2>
                <p className="mb-6 text-gray-600">
                    Sube tu lista de precios en PDF. El sistema detectará automáticamente los códigos y precios.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Archivo PDF
                    </label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className={`px-4 py-2 rounded-md text-white font-medium
              ${!file || loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Procesando...' : 'Analizar PDF'}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'review') {
        return (
            <div className="p-6 bg-white rounded-lg shadow-xl max-w-6xl mx-auto h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Revisar Productos Detectados</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Los precios son:</span>
                        <div className="flex bg-gray-100 p-1 rounded-md gap-1">
                            <button
                                onClick={() => setPriceType('costo')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${priceType === 'costo'
                                    ? 'bg-white shadow text-blue-600 font-medium'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                            >
                                Costo (Proveedor)
                            </button>
                            <button
                                onClick={() => setPriceType('venta')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${priceType === 'venta'
                                    ? 'bg-white shadow text-green-600 font-medium'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                            >
                                Venta (Público)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <p><strong>Importante:</strong> Revisa que los códigos y precios sean correctos. Puedes editar cualquier campo antes de confirmar.</p>
                    <p>Se detectaron <strong>{parsedProducts.length}</strong> productos.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Detectado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock (Opcional)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {parsedProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            value={product.codigo || ''}
                                            onChange={(e) => handleProductChange(product.id, 'codigo', e.target.value)}
                                            className="border-gray-300 rounded-md text-sm w-32 focus:ring-blue-500 focus:border-blue-500 text-black"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={product.descripcion || ''}
                                            onChange={(e) => handleProductChange(product.id, 'descripcion', e.target.value)}
                                            className="border-gray-300 rounded-md text-sm w-full focus:ring-blue-500 focus:border-blue-500 text-black"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-1">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={product.precio_detectado}
                                                onChange={(e) => handleProductChange(product.id, 'precio_detectado', e.target.value)}
                                                className="border-gray-300 rounded-md text-sm w-24 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Raw: {product.precio_raw}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            value={product.stock}
                                            onChange={(e) => handleProductChange(product.id, 'stock', e.target.value)}
                                            className="border-gray-300 rounded-md text-sm w-20 focus:ring-blue-500 focus:border-blue-500 text-black"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            value={product.unidades || ''}
                                            onChange={(e) => handleProductChange(product.id, 'unidades', e.target.value)}
                                            className="border-gray-300 rounded-md text-sm w-20 focus:ring-blue-500 focus:border-blue-500 text-black"
                                            placeholder="Unidad"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="bg-white border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 rounded shadow-sm transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button
                        onClick={() => setStep('upload')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Atrás
                    </button>
                    <button
                        onClick={handleConfirmImport}
                        disabled={loading || parsedProducts.length === 0}
                        className={`px-6 py-2 rounded-md text-white font-medium shadow-sm
              ${loading || parsedProducts.length === 0 ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {loading ? 'Guardando...' : `Confirmar e Importar (${parsedProducts.length})`}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'processing') {
        return (
            <div className="p-10 bg-white rounded-lg shadow-xl max-w-md mx-auto text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900">Guardando productos...</h3>
                <p className="text-gray-500 mt-2">Esto puede tomar unos momentos.</p>
            </div>
        );
    }

    return null;
};

export default CatalogUpload;

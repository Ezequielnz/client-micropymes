import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '../contexts/BusinessContext';
import { paymentMethodsAPI } from '../utils/api';
import Layout from '../components/Layout';
import { Plus, Trash2, Edit2, Check, X, DollarSign, Percent } from 'lucide-react';

const PaymentMethods = () => {
    const { currentBusiness } = useBusinessContext();
    const businessId = currentBusiness?.id;

    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMethod, setCurrentMethod] = useState(null); // If set, we are editing
    const [formData, setFormData] = useState({ nombre: '', descuento_porcentaje: 0, activo: true });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (businessId) {
            fetchMethods();
        }
    }, [businessId]);

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const data = await paymentMethodsAPI.getPaymentMethods(businessId);
            setMethods(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar métodos de pago.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentMethod(null);
        setFormData({ nombre: '', descuento_porcentaje: 0, activo: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (method) => {
        setCurrentMethod(method);
        setFormData({
            nombre: method.nombre,
            descuento_porcentaje: method.descuento_porcentaje || 0,
            activo: method.activo
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este método de pago?')) return;
        try {
            await paymentMethodsAPI.deletePaymentMethod(businessId, id);
            setMethods(methods.filter(m => m.id !== id));
        } catch (err) {
            console.error(err);
            alert('Error al eliminar el método de pago.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (currentMethod) {
                const updated = await paymentMethodsAPI.updatePaymentMethod(businessId, currentMethod.id, formData);
                setMethods(methods.map(m => m.id === currentMethod.id ? updated : m));
            } else {
                const created = await paymentMethodsAPI.createPaymentMethod(businessId, formData);
                setMethods([...methods, created]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Error al guardar el método de pago.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Métodos de Pago</h1>
                        <p className="text-gray-600">Configura los métodos de pago y sus descuentos automáticos.</p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Nuevo Método
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10">Cargando...</div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {methods.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                            No hay métodos de pago configurados.
                                        </td>
                                    </tr>
                                ) : (
                                    methods.map((method) => (
                                        <tr key={method.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                {method.nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {method.descuento_porcentaje > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {method.descuento_porcentaje}% OFF
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {method.activo ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenEdit(method)}
                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(method.id)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSubmit}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                                    {currentMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
                                                </h3>
                                                <div className="mt-4 space-y-4">
                                                    <div>
                                                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                                                        <input
                                                            type="text"
                                                            name="nombre"
                                                            id="nombre"
                                                            required
                                                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                                            value={formData.nombre}
                                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                            placeholder="Ej. Efectivo"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="descuento" className="block text-sm font-medium text-gray-700">Descuento (%)</label>
                                                        <div className="mt-1 relative rounded-md shadow-sm">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Percent className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                            <input
                                                                type="number"
                                                                name="descuento"
                                                                id="descuento"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                                                                value={formData.descuento_porcentaje}
                                                                onChange={(e) => setFormData({ ...formData, descuento_porcentaje: parseFloat(e.target.value) || 0 })}
                                                            />
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">Porcentaje de descuento que se aplicará automáticamente.</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            id="activo"
                                                            name="activo"
                                                            type="checkbox"
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            checked={formData.activo}
                                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                                        />
                                                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                                            Habilitado
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                        >
                                            {submitting ? 'Guardando...' : 'Guardar'}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PaymentMethods;

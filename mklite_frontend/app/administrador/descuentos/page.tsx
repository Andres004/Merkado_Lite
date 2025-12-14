"use client";

import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { PlusCircle, X } from 'lucide-react';
import { CategoryModel, ProductModel } from '../../models/product.model';
import { createDiscount, deleteDiscount, getDiscounts, updateDiscount } from '../../services/discount.service';
import { getAllProducts } from '../../services/product.service';
import api from '../../utils/axios';
import { CreateDiscountDto, DiscountModel, DiscountScope } from '../../models/discount.model';

const fetchCategories = async (): Promise<CategoryModel[]> => {
    const response = await api.get<CategoryModel[]>('/category');
    return response.data;
};
type DiscountKind = 'CUPON' | 'PERCENTAGE' | 'MONTO_FIJO';

const defaultFormState = {
    nombre: '',
    fecha_inicio: '',
    fecha_final: '',
    codigo_cupon: '',
    porcentaje_descuento: '',
    monto_fijo: '',
    monto_minimo_compra: '',
    estado_de_oferta: true,
    aplica_a: 'ALL' as DiscountScope,
    target_ids: [] as number[],
    tipo: 'CUPON' as DiscountKind,
};


const formatDateInput = (value: string | Date | undefined) => {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toISOString().slice(0, 10);
};

const buildDto = (form: typeof defaultFormState): CreateDiscountDto => {
    const fecha_inicio = `${form.fecha_inicio}T00:00:00`;
    const fecha_final = `${form.fecha_final}T00:00:00`;

    const payload: CreateDiscountDto = {
        nombre: form.nombre,
        fecha_inicio,
        fecha_final,
        codigo_cupon: form.codigo_cupon || undefined,
        monto_minimo_compra: form.monto_minimo_compra ? Number(form.monto_minimo_compra) : undefined,
        estado_de_oferta: form.estado_de_oferta,
        aplica_a: form.aplica_a,
    } as CreateDiscountDto;

    if (form.tipo === 'PERCENTAGE') {
        payload.porcentaje_descuento = form.porcentaje_descuento ? Number(form.porcentaje_descuento) : undefined;
    } else if (form.tipo === 'MONTO_FIJO') {
        payload.monto_fijo = form.monto_fijo ? Number(form.monto_fijo) : undefined;
    } else {
        payload.porcentaje_descuento = form.porcentaje_descuento ? Number(form.porcentaje_descuento) : undefined;
        payload.monto_fijo = form.monto_fijo ? Number(form.monto_fijo) : undefined;
    }

    if (form.aplica_a !== 'ALL') {
        payload.target_ids = form.target_ids;
    }

    return payload;
};

export default function AdminDescuentosPage() {
    const [discounts, setDiscounts] = useState<DiscountModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...defaultFormState });
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [products, setProducts] = useState<ProductModel[]>([]);
    const [selectedProductSearch, setSelectedProductSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountModel | null>(null);

    const filteredProducts = useMemo(() => {
        if (!selectedProductSearch) return products;
        return products.filter((p) => p.nombre.toLowerCase().includes(selectedProductSearch.toLowerCase()));
    }, [products, selectedProductSearch]);
    const loadDiscounts = async () => {
        try {
            const data = await getDiscounts();
            setDiscounts(data);
        } catch (error) {
            console.error('Error al cargar descuentos', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCatalogs = async () => {
        try {
            const [cats, prods] = await Promise.all([fetchCategories(), getAllProducts()]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error('Error al cargar catálogos', error);
        }
    };

    useEffect(() => {
        loadDiscounts();
        loadCatalogs();
    }, []);

    const resetForm = () => {
        setForm({ ...defaultFormState });
        setEditingDiscount(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (discount: DiscountModel) => {
        const tipo: DiscountKind = discount.porcentaje_descuento ? 'PERCENTAGE' : discount.monto_fijo ? 'MONTO_FIJO' : 'CUPON';
        setForm({
            ...defaultFormState,
            nombre: discount.nombre,
            fecha_inicio: formatDateInput(discount.fecha_inicio),
            fecha_final: formatDateInput(discount.fecha_final),
            codigo_cupon: discount.codigo_cupon || '',
            porcentaje_descuento: discount.porcentaje_descuento?.toString() || '',
            monto_fijo: discount.monto_fijo?.toString() || '',
            monto_minimo_compra: discount.monto_minimo_compra?.toString() || '',
            estado_de_oferta: discount.estado_de_oferta,
            aplica_a: discount.aplica_a,
            target_ids:
                discount.aplica_a === 'CATEGORY'
                    ? (discount.categorias || []).map((c) => c.id_categoria)
                    : discount.aplica_a === 'PRODUCT'
                    ? (discount.productos || []).map((p) => p.id_producto)
                    : [],
            tipo,
        });
        setEditingDiscount(discount);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = buildDto(form);
            if (editingDiscount) {
                await updateDiscount(editingDiscount.id_descuento, payload);
            } else {
                await createDiscount(payload);
            }
            await loadDiscounts();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error al guardar descuento', error);
            alert('Ocurrió un error al guardar el descuento. Revisa la consola para más detalles.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (discount: DiscountModel) => {
        const confirmed = confirm(`¿Eliminar el descuento "${discount.nombre}"?`);
        if (!confirmed) return;
        try {
            await deleteDiscount(discount.id_descuento);
            await loadDiscounts();
        } catch (error) {
            console.error('Error al eliminar descuento', error);
            alert('No se pudo eliminar el descuento');
        }
    };

    const toggleTarget = (id: number) => {
        setForm((prev) => ({
            ...prev,
            target_ids: prev.target_ids.includes(id)
                ? prev.target_ids.filter((t) => t !== id)
                : [...prev.target_ids, id],
        }));
    };

    const handleScopeChange = (scope: DiscountScope) => {
        setForm((prev) => ({ ...prev, aplica_a: scope, target_ids: [] }));
    };

    const generateCode = () => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        setForm((prev) => ({ ...prev, codigo_cupon: `MK${random}` }));
    };

    const renderTargets = () => {
        if (form.aplica_a === 'CATEGORY') {
            return (
                <div className="space-y-2">
                    <p className="text-sm text-gray-700">Elige categorías:</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const active = form.target_ids.includes(cat.id_categoria);
                            return (
                                <button
                                    type="button"
                                    key={cat.id_categoria}
                                    onClick={() => toggleTarget(cat.id_categoria)}
                                    className={`px-3 py-1 rounded-full border text-sm ${
                                        active ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-gray-700 border-gray-300'
                                    }`}
                                >
                                    {cat.nombre}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (form.aplica_a === 'PRODUCT') {
            return (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Buscar producto por nombre:</label>
                    <input
                        type="text"
                        value={selectedProductSearch}
                        onChange={(e) => setSelectedProductSearch(e.target.value)}
                        placeholder="Ej. leche, coca, pollo"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                        {filteredProducts.map((product) => {
                            const active = form.target_ids.includes(product.id_producto);
                            return (
                                <button
                                    type="button"
                                    key={product.id_producto}
                                    onClick={() => toggleTarget(product.id_producto)}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center ${
                                        active ? 'bg-red-100 text-red-700' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{product.nombre}</span>
                                    {active && <span className="text-xs font-semibold">Seleccionado</span>}
                                </button>
                            );
                        })}
                    </div>
                    {form.target_ids.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.target_ids.map((id) => {
                                const product = products.find((p) => p.id_producto === id);
                                return (
                                    <span
                                        key={id}
                                        className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                                    >
                                        {product?.nombre || `Producto ${id}`}
                                        <button type="button" onClick={() => toggleTarget(id)}>
                                            <X size={14} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    const renderDiscountInputs = () => {
        if (form.tipo === 'PERCENTAGE') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Porcentaje de descuento (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.porcentaje_descuento}
                        onChange={(e) => setForm({ ...form, porcentaje_descuento: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej. 15"
                    />
                </div>
            );
        }

        if (form.tipo === 'MONTO_FIJO') {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monto fijo (Bs.)</label>
                    <input
                        type="number"
                        min="0"
                        value={form.monto_fijo}
                        onChange={(e) => setForm({ ...form, monto_fijo: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej. 10"
                    />
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Porcentaje de descuento (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.porcentaje_descuento}
                        onChange={(e) => setForm({ ...form, porcentaje_descuento: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej. 15"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Monto fijo (Bs.)</label>
                    <input
                        type="number"
                        min="0"
                        value={form.monto_fijo}
                        onChange={(e) => setForm({ ...form, monto_fijo: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Ej. 10"
                    />
                </div>
            </div>
        );
    };

    const renderModal = () => {
        if (!showModal) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {editingDiscount ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del descuento</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Cupón de Bienvenida"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de descuento</label>
                                <select
                                    value={form.tipo}
                                    onChange={(e) => setForm({ ...form, tipo: e.target.value as DiscountKind })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="CUPON">Cupón</option>
                                    <option value="PERCENTAGE">Porcentaje</option>
                                    <option value="MONTO_FIJO">Monto fijo</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    id="estadoOferta"
                                    type="checkbox"
                                    checked={form.estado_de_oferta}
                                    onChange={(e) => setForm({ ...form, estado_de_oferta: e.target.checked })}
                                    className="h-5 w-5 text-red-600"
                                />
                                <label htmlFor="estadoOferta" className="text-sm font-medium text-gray-700">
                                    Activar descuento al guardar
                                </label>
                            </div>
                        </div>

                        {renderDiscountInputs()}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
                                <input
                                    type="date"
                                    value={form.fecha_inicio}
                                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de fin</label>
                                <input
                                    type="date"
                                    value={form.fecha_final}
                                    onChange={(e) => setForm({ ...form, fecha_final: e.target.value })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monto mínimo de compra (Bs.)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.monto_minimo_compra}
                                onChange={(e) => setForm({ ...form, monto_minimo_compra: e.target.value })}
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="100 (para válido en compras mayores a 100 Bs.)"
                            />
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Aplicar a:</p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 text-gray-800">
                                    <input
                                        type="radio"
                                        checked={form.aplica_a === 'ALL'}
                                        onChange={() => handleScopeChange('ALL')}
                                        className="text-red-600"
                                    />
                                    Todos los productos
                                </label>
                                <label className="flex items-center gap-3 text-gray-800">
                                    <input
                                        type="radio"
                                        checked={form.aplica_a === 'CATEGORY'}
                                        onChange={() => handleScopeChange('CATEGORY')}
                                        className="text-red-600"
                                    />
                                    Categorías específicas
                                </label>
                                <label className="flex items-center gap-3 text-gray-800">
                                    <input
                                        type="radio"
                                        checked={form.aplica_a === 'PRODUCT'}
                                        onChange={() => handleScopeChange('PRODUCT')}
                                        className="text-red-600"
                                    />
                                    Productos específicos
                                </label>
                            </div>
                            {renderTargets()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Código del cupón</label>
                                <input
                                    type="text"
                                    value={form.codigo_cupon}
                                    onChange={(e) => setForm({ ...form, codigo_cupon: e.target.value })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="MERKADO25"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={generateCode}
                                className="h-11 md:mb-1 inline-flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200"
                            >
                                Generar código aleatorio
                            </button>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-[#F40009] text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : editingDiscount ? 'Actualizar Descuento' : 'Guardar Descuento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderScopeLabel = (discount: DiscountModel) => {
        if (discount.aplica_a === 'ALL') return 'Todos los productos';
        if (discount.aplica_a === 'CATEGORY') return `Categorías: ${(discount.categorias || []).map((c) => c.nombre).join(', ')}`;
        return `Productos: ${(discount.productos || []).map((p) => p.nombre).join(', ')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Estructura de Contenido: Sidebar + Contenido Principal */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Columna Izquierda: Menú de Navegación */}
                    <aside className="hidden lg:block lg:w-64">
                        <AdminSidebar />
                    </aside>

                    {/* Columna Derecha: Contenido de Gestión de Descuentos */}
                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">
                        
                        <div className="flex justify-between items-center mb-6 border-b pb-3">
                            <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Descuentos</h1>
                            
                            {/* Botón Crear Nuevo Descuento */}
                            <button
                                
                                onClick={openCreateModal}
                                className="flex items-center bg-[#F40009] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Crear Nuevo Descuento
                            </button>
                        </div>

                    {loading ? (
                            <p className="text-gray-600">Cargando descuentos...</p>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vigencia</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aplica a</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {discounts.map((d) => (
                                            <tr key={d.id_descuento} className="hover:bg-red-50 transition duration-150">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{d.nombre}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDateInput(d.fecha_inicio)} - {formatDateInput(d.fecha_final)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {d.codigo_cupon ? 'Cupón' : d.porcentaje_descuento ? 'Porcentaje' : 'Monto fijo'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 max-w-xs">
                                                    {renderScopeLabel(d)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span
                                                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                                            d.estado_de_oferta ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {d.estado_de_oferta ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => openEditModal(d)}
                                                            className="text-gray-500 hover:text-gray-700 transition duration-150 whitespace-nowrap"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(d)}
                                                            className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {renderModal()}
        </div>
    );
}


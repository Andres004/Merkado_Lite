"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { AlertTriangle, PlusCircle, X } from 'lucide-react';
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
    const [deleteTarget, setDeleteTarget] = useState<DiscountModel | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const cancelDeleteButtonRef = useRef<HTMLButtonElement | null>(null);

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

    useEffect(() => {
        const shouldLockScroll = showModal || isDeleteModalOpen;
        const previousOverflow = document.body.style.overflow;

        if (shouldLockScroll) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isDeleteModalOpen, showModal]);

    useEffect(() => {
        if (!isDeleteModalOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeDeleteModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        cancelDeleteButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDeleteModalOpen]);


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

    const openDeleteConfirmation = (discount: DiscountModel) => {
        setDeleteTarget(discount);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        setDeleting(false);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            //await deleteDiscount(discount.id_descuento);
            await deleteDiscount(deleteTarget.id_descuento);
            await loadDiscounts();
            closeDeleteModal();
        } catch (error) {
            console.error('Error al eliminar descuento', error);
            alert('No se pudo eliminar el descuento');
            setDeleting(false);
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
                    <p className="text-sm font-bold text-gray-900">Elige categorías:</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const active = form.target_ids.includes(cat.id_categoria);
                            return (
                                <button
                                    type="button"
                                    key={cat.id_categoria}
                                    onClick={() => toggleTarget(cat.id_categoria)}
                                    className={`px-3 py-1 rounded-full border text-sm font-medium ${
                                        active ? 'bg-red-100 text-red-800 border-red-300' : 'bg-white text-gray-800 border-gray-300'
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
                    <label className="block text-sm font-bold text-gray-900">Buscar producto por nombre:</label>
                    <input
                        type="text"
                        value={selectedProductSearch}
                        onChange={(e) => setSelectedProductSearch(e.target.value)}
                        placeholder="Ej. leche, coca, pollo"
                        className="w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
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
                                        active ? 'bg-red-100 text-red-800' : 'hover:bg-gray-50 text-gray-800'
                                    }`}
                                >
                                    <span className="font-medium">{product.nombre}</span>
                                    {active && <span className="text-xs font-bold text-red-700">Seleccionado</span>}
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
                                        className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {product?.nombre || `Producto ${id}`}
                                        <button type="button" onClick={() => toggleTarget(id)}>
                                            <X size={14} className="text-red-900" />
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
                    <label className="block text-sm font-bold text-gray-900">Porcentaje de descuento (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.porcentaje_descuento}
                        onChange={(e) => setForm({ ...form, porcentaje_descuento: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                        placeholder="Ej. 15"
                    />
                </div>
            );
        }

        if (form.tipo === 'MONTO_FIJO') {
            return (
                <div>
                    <label className="block text-sm font-bold text-gray-900">Monto fijo (Bs.)</label>
                    <input
                        type="number"
                        min="0"
                        value={form.monto_fijo}
                        onChange={(e) => setForm({ ...form, monto_fijo: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                        placeholder="Ej. 10"
                    />
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900">Porcentaje de descuento (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.porcentaje_descuento}
                        onChange={(e) => setForm({ ...form, porcentaje_descuento: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                        placeholder="Ej. 15"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900">Monto fijo (Bs.)</label>
                    <input
                        type="number"
                        min="0"
                        value={form.monto_fijo}
                        onChange={(e) => setForm({ ...form, monto_fijo: e.target.value })}
                        className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                        placeholder="Ej. 10"
                    />
                </div>
            </div>
        );
    };

    const renderModal = () => {
        if (!showModal) return null;

        return (
            // CAMBIO: Blur effect
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] border border-gray-200">
                    <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-100">
                        <h2 className="text-2xl font-bold text-black">
                            {editingDiscount ? 'Editar Descuento' : 'Crear Nuevo Descuento'}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                            <X size={20} />
                        </button>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-gray-900">Nombre del descuento</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                                placeholder="Cupón de Bienvenida"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900">Tipo de descuento</label>
                                <select
                                    value={form.tipo}
                                    onChange={(e) => setForm({ ...form, tipo: e.target.value as DiscountKind })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
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
                                    className="h-5 w-5 text-[#F40009] rounded border-gray-300 focus:ring-[#F40009]"
                                />
                                <label htmlFor="estadoOferta" className="text-sm font-bold text-gray-900">
                                    Activar descuento al guardar
                                </label>
                            </div>
                        </div>

                        {renderDiscountInputs()}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900">Fecha de inicio</label>
                                <input
                                    type="date"
                                    value={form.fecha_inicio}
                                    onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900">Fecha de fin</label>
                                <input
                                    type="date"
                                    value={form.fecha_final}
                                    onChange={(e) => setForm({ ...form, fecha_final: e.target.value })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900">Monto mínimo de compra (Bs.)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.monto_minimo_compra}
                                onChange={(e) => setForm({ ...form, monto_minimo_compra: e.target.value })}
                                className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                                placeholder="100 (para válido en compras mayores a 100 Bs.)"
                            />
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-bold text-gray-900">Aplicar a:</p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 text-gray-900 font-medium">
                                    <input
                                        type="radio"
                                        checked={form.aplica_a === 'ALL'}
                                        onChange={() => handleScopeChange('ALL')}
                                        className="text-[#F40009] focus:ring-[#F40009]"
                                    />
                                    Todos los productos
                                </label>
                                <label className="flex items-center gap-3 text-gray-900 font-medium">
                                    <input
                                        type="radio"
                                        checked={form.aplica_a === 'CATEGORY'}
                                        onChange={() => handleScopeChange('CATEGORY')}
                                        className="text-[#F40009] focus:ring-[#F40009]"
                                    />
                                    Categorías específicas
                                </label>
                                <label className="flex items-center gap-3 text-gray-900 font-medium">
                                    <input
                                        type="radio"
                                        checked={form.aplica_a === 'PRODUCT'}
                                        onChange={() => handleScopeChange('PRODUCT')}
                                        className="text-[#F40009] focus:ring-[#F40009]"
                                    />
                                    Productos específicos
                                </label>
                            </div>
                            {renderTargets()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-bold text-gray-900">Código del cupón</label>
                                <input
                                    type="text"
                                    value={form.codigo_cupon}
                                    onChange={(e) => setForm({ ...form, codigo_cupon: e.target.value })}
                                    className="mt-1 w-full border rounded-lg px-3 py-2 text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#F40009]"
                                    placeholder="MERKADO25"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={generateCode}
                                className="h-11 md:mb-1 inline-flex items-center justify-center bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-200"
                            >
                                Generar código aleatorio
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-bold hover:bg-gray-100 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 rounded-lg bg-[#F40009] text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : editingDiscount ? 'Actualizar Descuento' : 'Guardar Descuento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderDeleteModal = () => {
        if (!isDeleteModalOpen || !deleteTarget) return null;

        return (
            // CAMBIO: Blur effect
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                onClick={closeDeleteModal}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="text-[#F40009]" size={36} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">¿Estás seguro?</h3>
                    <p className="text-gray-800 font-medium mb-1">
                        Estás a punto de eliminar permanentemente el descuento “{deleteTarget.nombre}”.
                    </p>
                    <p className="text-sm text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="flex-1 rounded-full bg-[#F40009] text-white font-bold py-3 shadow hover:bg-red-700 transition disabled:opacity-60"
                        >
                            {deleting ? 'Eliminando…' : 'Sí, Eliminar'}
                        </button>
                        <button
                            ref={cancelDeleteButtonRef}
                            onClick={closeDeleteModal}
                            disabled={deleting}
                            className="flex-1 rounded-full border border-gray-300 text-gray-800 font-bold py-3 bg-white hover:bg-gray-50 transition disabled:opacity-60"
                        >
                            No, Cancelar
                        </button>
                    </div>
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
                
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    <aside className="hidden lg:block lg:w-64">
                        <AdminSidebar />
                    </aside>

                    <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                            <h1 className="text-3xl font-extrabold text-black">Gestión de Descuentos</h1>
                            
                            <button
                                onClick={openCreateModal}
                                className="flex items-center bg-[#F40009] text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Crear Nuevo Descuento
                            </button>
                        </div>

                    {loading ? (
                            <p className="text-gray-600 text-center py-4 font-medium">Cargando descuentos...</p>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        {/* CAMBIO: Headers negros */}
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Nombre</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Vigencia</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Aplica a</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {discounts.map((d) => (
                                            <tr key={d.id_descuento} className="hover:bg-red-50 transition duration-150">
                                                {/* CAMBIO: Texto oscuro */}
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-black">{d.nombre}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                                                    {formatDateInput(d.fecha_inicio)} - {formatDateInput(d.fecha_final)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">
                                                    {d.codigo_cupon ? 'Cupón' : d.porcentaje_descuento ? 'Porcentaje' : 'Monto fijo'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium max-w-xs truncate">
                                                    {renderScopeLabel(d)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span
                                                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                                                            d.estado_de_oferta ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'
                                                        }`}
                                                    >
                                                        {d.estado_de_oferta ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-3">
                                                        <button
                                                            onClick={() => openEditModal(d)}
                                                            className="text-gray-600 hover:text-black font-semibold transition duration-150 whitespace-nowrap"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteConfirmation(d)}
                                                            className="text-red-600 hover:text-red-800 font-semibold transition duration-150 whitespace-nowrap"
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
            {renderDeleteModal()}
        </div>
    );
}
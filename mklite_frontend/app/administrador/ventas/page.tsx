"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, RefreshCcw, Search, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import Modal from '../../components/Modal';
import { ProductModel } from '../../models/product.model';
import { DiscountModel } from '../../models/discount.model';
import { getOrders, getOrderDetail } from '../../services/order.service';
import { getRefunds, createRefund, createRefundItem } from '../../services/refund.service';
import {
    fetchDiscounts,
    fetchProductCategories,
    fetchProductsForSale,
    validateCouponCode,
    createSale,
} from '../../services/sale.service';

interface TransactionRow {
    id: string;
    tipo: 'Venta Online' | 'Venta Presencial' | 'Devolución';
    fechaHora: string;
    cliente: string;
    idPedido: string;
    total: number;
    numProductos: number;
}

interface SaleItemState {
    product: ProductModel;
    quantity: number;
    unitPrice: number;
    discountPerUnit: number;
    discountLabel?: string;
    discountId?: number;
}

interface OrderDetailItem {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    product?: ProductModel;
}

const isDiscountActive = (discount: DiscountModel) => {
    const now = new Date();
    const start = new Date(discount.fecha_inicio);
    const end = new Date(discount.fecha_final);
    return discount.estado_de_oferta && now >= start && now <= end;
};

const getCategoryIdsByProduct = (assignments: Array<{ id_producto: number; id_categoria: number }>, id_producto: number) =>
    assignments.filter((a) => a.id_producto === id_producto).map((a) => a.id_categoria);

const calculateProductDiscount = (
    product: ProductModel,
    discounts: DiscountModel[],
    assignments: Array<{ id_producto: number; id_categoria: number; categoria?: { id_categoria: number; nombre: string } }>,
) => {
    const activeDiscounts = discounts.filter(isDiscountActive);
    const categoryIds = getCategoryIdsByProduct(assignments, product.id_producto);

    let selected: { amount: number; discount: DiscountModel | null } = { amount: 0, discount: null };

    for (const discount of activeDiscounts) {
        const appliesToProduct =
            discount.aplica_a === 'ALL' ||
            (discount.aplica_a === 'PRODUCT' && discount.productos?.some((p) => p.id_producto === product.id_producto)) ||
            (discount.aplica_a === 'CATEGORY' && discount.categorias?.some((c) => categoryIds.includes(c.id_categoria)));

        if (!appliesToProduct) continue;

        const percAmount = discount.porcentaje_descuento
            ? (product.precio_venta * discount.porcentaje_descuento) / 100
            : 0;
        const fixedAmount = discount.monto_fijo ?? 0;
        const amount = Math.max(percAmount, fixedAmount);

        if (amount > selected.amount) {
            selected = { amount, discount };
        }
    }

    return {
        discountPerUnit: Number(selected.amount.toFixed(2)),
        discountId: selected.discount?.id_descuento,
        discountLabel: selected.discount?.nombre,
    };
};

const SaleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCompleted: () => void;
    currentUserId?: number;
}> = ({ isOpen, onClose, onCompleted, currentUserId }) => {
    const [products, setProducts] = useState<ProductModel[]>([]);
    const [discounts, setDiscounts] = useState<DiscountModel[]>([]);
    const [assignments, setAssignments] = useState<Array<{ id_producto: number; id_categoria: number }>>([]);
    const [items, setItems] = useState<SaleItemState[]>([]);
    const [query, setQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [coupon, setCoupon] = useState<DiscountModel | null>(null);
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            setLoading(true);
            try {
                const [productData, discountData, categoryData] = await Promise.all([
                    fetchProductsForSale(),
                    fetchDiscounts(),
                    fetchProductCategories(),
                ]);
                setProducts(productData);
                setDiscounts(discountData);
                setAssignments(categoryData);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isOpen]);

    const filteredProducts = useMemo(() => {
        return products.filter((p) =>
            `${p.nombre} ${p.id_producto}`.toLowerCase().includes(query.toLowerCase())
        );
    }, [products, query]);

    const handleAddProduct = (product: ProductModel) => {
        const already = items.find((i) => i.product.id_producto === product.id_producto);
        if (already) return;
        const discountData = calculateProductDiscount(product, discounts, assignments);
        setItems((prev) => [
            ...prev,
            {
                product,
                quantity: 1,
                unitPrice: product.precio_venta,
                discountPerUnit: discountData.discountPerUnit,
                discountLabel: discountData.discountLabel,
                discountId: discountData.discountId,
            },
        ]);
    };

    const updateQuantity = (id_producto: number, quantity: number) => {
        setItems((prev) => prev.map((i) => (i.product.id_producto === id_producto ? { ...i, quantity } : i)));
    };

    const removeItem = (id_producto: number) => {
        setItems((prev) => prev.filter((i) => i.product.id_producto !== id_producto));
    };

    const subtotal = useMemo(
        () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
        [items],
    );

    const discountFromItems = useMemo(
        () => items.reduce((sum, i) => sum + i.discountPerUnit * i.quantity, 0),
        [items],
    );

    const couponDiscount = useMemo(() => {
        if (!coupon) return 0;
        const base = subtotal - discountFromItems;
        if (coupon.porcentaje_descuento) return (base * coupon.porcentaje_descuento) / 100;
        if (coupon.monto_fijo) return coupon.monto_fijo;
        return 0;
    }, [coupon, subtotal, discountFromItems]);

    const total = Math.max(subtotal - discountFromItems - couponDiscount, 0);

    const applyCoupon = async () => {
        try {
            setCouponError('');
            const data = await validateCouponCode(couponInput.trim());
            setCoupon(data);
        } catch (error: any) {
            const msg = error?.response?.data?.message ?? 'Cupón inválido';
            setCoupon(null);
            setCouponError(msg);
        }
    };

    const handleFinalize = async () => {
        if (!items.length) return;
        setSaving(true);
        try {
            await createSale({
                id_usuario_cliente: currentUserId ?? 1,
                tipo_pedido: 'presencial',
                metodo_pago: paymentMethod,
                direccion_entrega: 'Venta en tienda',
                tipo_entrega: 'tienda',
                es_reserva: false,
                id_descuento_aplicado: coupon?.id_descuento ?? items.find((i) => i.discountId)?.discountId,
                subtotal_override: Number((subtotal - discountFromItems).toFixed(2)),
                total_override: Number(total.toFixed(2)),
                items: items.map((i) => ({
                    id_producto: i.product.id_producto,
                    cantidad: i.quantity,
                    precio_unitario: Number((i.unitPrice - i.discountPerUnit).toFixed(2)),
                })),
            });
            onCompleted();
            onClose();
            setItems([]);
            setCoupon(null);
            setCouponInput('');
        } catch (error: any) {
            alert(error?.response?.data?.message ?? 'No se pudo registrar la venta');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Venta Presencial">
            {loading ? (
                <p className="text-center text-gray-500">Cargando productos...</p>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                                placeholder="Buscar por nombre o ID"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{filteredProducts.length} productos</span>
                    </div>

                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id_producto}
                                onClick={() => handleAddProduct(product)}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-50"
                            >
                                <div>
                                    <p className="text-sm font-semibold">{product.nombre}</p>
                                    
                                    <p className="text-xs text-gray-500">
                                    Bs. {Number(product.precio_venta ?? 0).toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-xs text-red-600 font-semibold">Agregar</span>
                            </button>
                        ))}
                        {!filteredProducts.length && (
                            <p className="text-center text-xs text-gray-400 py-3">Sin resultados</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.product.id_producto}
                                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                            >
                                <div>
                                    <p className="font-semibold">{item.product.nombre}</p>
                                    
                                    <p className="text-xs text-gray-500">
                                    Bs. {Number(item.unitPrice ?? 0).toFixed(2)}
                                    </p>
                                    {item.discountPerUnit > 0 && (
                                        <p className="text-xs text-green-600">Descuento: -Bs. {item.discountPerUnit.toFixed(2)} ({item.discountLabel})</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.product.id_producto, Math.max(1, Number(e.target.value)))}
                                        className="w-16 rounded border px-2 py-1 text-sm"
                                    />
                                    <span className="font-semibold">Bs. {((item.unitPrice - item.discountPerUnit) * item.quantity).toFixed(2)}</span>
                                    <button onClick={() => removeItem(item.product.id_producto)} className="text-gray-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!items.length && <p className="text-xs text-gray-400 text-center">No hay productos en la venta</p>}
                    </div>

                    <div className="space-y-3 rounded-lg bg-gray-50 p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span>Subtotal</span>
                            <span className="font-semibold">Bs. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-green-700">
                            <span>Descuentos</span>
                            
                            <span className="font-semibold">
                                - Bs. {(
                                    Number(discountFromItems ?? 0) +
                                    Number(couponDiscount ?? 0)
                                ).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total a pagar</span>
                            <span>Bs. {total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <label className="space-y-1">
                            <span className="text-gray-700">Método de pago</span>
                            <select
                                className="w-full rounded-lg border px-3 py-2"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </label>

                        <label className="space-y-1">
                            <span className="text-gray-700">Cupón de descuento (opcional)</span>
                            <div className="flex gap-2">
                                <input
                                    className="w-full rounded-lg border px-3 py-2"
                                    placeholder="Código de cupón"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={applyCoupon}
                                    className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
                                >
                                    Validar
                                </button>
                            </div>
                            {coupon && <p className="text-xs text-green-700">Cupón aplicado: {coupon.nombre}</p>}
                            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                        </label>
                    </div>

                    <button
                        onClick={handleFinalize}
                        disabled={saving || !items.length}
                        className="w-full rounded-lg bg-[#F40009] px-4 py-3 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                        {saving ? 'Guardando...' : 'Finalizar Venta'}
                    </button>
                </div>
            )}
        </Modal>
    );
};

const RefundModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCompleted: () => void;
    currentUserId?: number;
}> = ({ isOpen, onClose, onCompleted, currentUserId }) => {
    const [searchId, setSearchId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('producto defectuoso');
    const [reingresar, setReingresar] = useState(true);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setOrder(null);
            setSelectedProduct(null);
            setQuantity(1);
            setSearchId('');
        }
    }, [isOpen]);

    const fetchOrder = async () => {
        if (!searchId) return;
        setLoading(true);
        try {
            const detail = await getOrderDetail(Number(searchId));
            setOrder(detail);
            if (detail.items?.length) setSelectedProduct(detail.items[0].id_producto);
        } catch (error: any) {
            alert(error?.response?.data?.message ?? 'Pedido no encontrado');
        } finally {
            setLoading(false);
        }
    };

    const selectedItem: OrderDetailItem | undefined = useMemo(() => {
        return order?.items?.find((i: any) => i.id_producto === selectedProduct);
    }, [order, selectedProduct]);

    const maxQuantity = selectedItem?.cantidad ?? 1;
    const refundAmount = selectedItem ? Number((selectedItem.precio_unitario * quantity).toFixed(2)) : 0;

    const handleConfirm = async () => {
        if (!order || !selectedItem) return;
        if (quantity > maxQuantity) {
            alert('La cantidad supera lo vendido');
            return;
        }
        setSaving(true);
        try {
            const refund = await createRefund({
                id_pedido: order.id_pedido,
                id_usuario_vendedor: currentUserId ?? 1,
                motivo: reason,
                monto_total: refundAmount,
            });

            await createRefundItem({
                id_devolucion: refund.id_devolucion,
                id_producto: selectedItem.id_producto,
                cantidad: quantity,
                precio_unitario: selectedItem.precio_unitario,
                reingresar_stock: reingresar,
            });

            onCompleted();
            onClose();
        } catch (error: any) {
            alert(error?.response?.data?.message ?? 'No se pudo registrar la devolución');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gestionar devolución">
            <div className="space-y-4 text-sm">
                <div className="flex gap-2">
                    <input
                        className="w-full rounded-lg border px-3 py-2"
                        placeholder="ID de pedido"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button
                        onClick={fetchOrder}
                        className="rounded-lg bg-gray-200 px-4 py-2 font-semibold hover:bg-gray-300"
                    >
                        Buscar
                    </button>
                </div>

                {loading && <p className="text-center text-gray-500">Buscando pedido...</p>}

                {order && (
                    <div className="space-y-3">
                        <div className="rounded-lg bg-gray-50 p-3">
                            <p className="font-semibold">Pedido #{order.id_pedido}</p>
                            <p className="text-xs text-gray-500">{new Date(order.fecha_creacion).toLocaleString()}</p>
                        </div>

                        <label className="space-y-1">
                            <span className="text-gray-700">Producto a devolver</span>
                            <select
                                className="w-full rounded-lg border px-3 py-2"
                                value={selectedProduct ?? ''}
                                onChange={(e) => setSelectedProduct(Number(e.target.value))}
                            >
                                {order.items?.map((item: any) => (
                                    <option key={item.id_producto} value={item.id_producto}>
                                        {item.product?.nombre ?? `Producto ${item.id_producto}`} - {item.cantidad} uds.
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="space-y-1">
                                <span className="text-gray-700">Cantidad</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={maxQuantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value))))}
                                    className="w-full rounded-lg border px-3 py-2"
                                />
                            </label>

                            <label className="space-y-1">
                                <span className="text-gray-700">Motivo</span>
                                <select
                                    className="w-full rounded-lg border px-3 py-2"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option value="producto defectuoso">Producto defectuoso</option>
                                    <option value="inconformidad">Inconformidad del cliente</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </label>
                        </div>

                        <label className="flex items-center gap-2 text-gray-700">
                            <input
                                type="checkbox"
                                checked={reingresar}
                                onChange={(e) => setReingresar(e.target.checked)}
                                className="h-4 w-4"
                            />
                            Reingresar producto al stock
                        </label>

                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                                <span>Monto a reembolsar</span>
                                <span className="text-lg font-bold">Bs. {refundAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={saving}
                            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white font-semibold hover:bg-black disabled:opacity-60"
                        >
                            {saving ? 'Guardando...' : 'Confirmar devolución'}
                        </button>
                    </div>
                )}

                {!order && !loading && (
                    <p className="text-xs text-gray-400 text-center">Busca un pedido para iniciar una devolución</p>
                )}
            </div>
        </Modal>
    );
};

export default function AdminVentasPage() {

    const [busqueda, setBusqueda] = React.useState('');
    const [paginaActual, setPaginaActual] = React.useState(1);
    const transaccionesPorPagina = 10;
    const [orders, setOrders] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saleModalOpen, setSaleModalOpen] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const stored = localStorage.getItem('userData');
        if (stored) {
            const parsed = JSON.parse(stored);
            setCurrentUserId(parsed.id_usuario);
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [ordersData, refundsData] = await Promise.all([getOrders(), getRefunds().catch(() => [])]);
            setOrders(ordersData ?? []);
            setRefunds(refundsData ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const transacciones: TransactionRow[] = useMemo(() => {
        const orderRows: (TransactionRow & { rawDate: Date | null })[] = orders.map((o: any) => {
            const rawDate = o.fecha_creacion ? new Date(o.fecha_creacion) : null;
            return {
                id: `O-${o.id_pedido}`,
                tipo: o.tipo_pedido?.toLowerCase() === 'presencial' ? 'Venta Presencial' : 'Venta Online',
                fechaHora: rawDate ? rawDate.toLocaleString() : '',
                cliente: o.client?.nombre ?? 'Cliente',
                idPedido: `#${o.id_pedido}`,
                total: Number(o.total ?? 0),
                numProductos: o.items?.length ?? 0,
                rawDate,
            };
        });

        const refundRows: (TransactionRow & { rawDate: Date | null })[] = refunds.map((r: any) => {
            const rawDate = r.fecha ? new Date(r.fecha) : null;
            return {
                id: `R-${r.id_devolucion}`,
                tipo: 'Devolución',
                fechaHora: rawDate ? rawDate.toLocaleString() : '',
                cliente: r.order?.client?.nombre ?? 'Cliente',
                idPedido: `#${r.id_pedido ?? r.order?.id_pedido ?? ''}`,
                total: Number(r.monto_total ?? 0),
                numProductos: r.refundItems?.length ?? 1,
                rawDate,
            };
        });

        return [...orderRows, ...refundRows]
            .sort((a, b) => {
                const aDate = a.rawDate ? a.rawDate.getTime() : 0;
                const bDate = b.rawDate ? b.rawDate.getTime() : 0;
                return bDate - aDate;
            })
            .map(({ rawDate, ...rest }) => rest as TransactionRow);
    }, [orders, refunds]);

    const transaccionesFiltradas = transacciones.filter((t) =>
        t.id.toLowerCase().includes(busqueda.toLowerCase()) || t.idPedido.toLowerCase().includes(busqueda.toLowerCase()),
    );

    const totalPaginas = Math.ceil(transaccionesFiltradas.length / transaccionesPorPagina) || 1;
    const inicio = (paginaActual - 1) * transaccionesPorPagina;
    const fin = inicio + transaccionesPorPagina;
    const transaccionesPagina = transaccionesFiltradas.slice(inicio, fin);

    const handleVerDetalle = (id: string) => console.log(`Viendo detalle de la transacción: ${id}`);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-16">

            <div className="max-w-7xl mx-auto px-4">

                <div className="flex flex-col lg:flex-row gap-6">

                    <aside className="hidden lg:block lg:w-64">

                        <AdminSidebar />
                    </aside>

                    <main className="flex-1 bg-white rounded-lg shadow-md p-6">

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3 space-y-4 sm:space-y-0">
                            <h1 className="text-3xl font-extrabold text-gray-900">Registro de Transacciones</h1>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSaleModalOpen(true)}
                                    className="flex items-center bg-[#F40009] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150 text-sm whitespace-nowrap"
                                >
                                    <PlusCircle size={18} className="mr-1 hidden sm:inline" />
                                    Registrar Venta Presencial
                                </button>
                                <button
                                    onClick={() => setRefundModalOpen(true)}
                                    className="flex items-center bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-300 transition duration-150 text-sm whitespace-nowrap"
                                >
                                    <RefreshCcw size={18} className="mr-1 hidden sm:inline" />
                                    Registrar Devolución
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar por ID de Transacción o Pedido..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1);
                                }}
                                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 shadow-sm"
                            />
                        </div>

                        {loading ? (
                            <p className="text-center text-gray-500">Cargando transacciones...</p>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID TRANSACCIÓN</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TIPO</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">FECHA/HORA</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CLIENTE</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID PEDIDO</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">TOTAL</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transaccionesPagina.map((t, index) => (
                                            <tr key={index} className="hover:bg-red-50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                                        t.tipo === 'Venta Online'
                                                            ? 'bg-green-100 text-green-700'
                                                            : t.tipo === 'Venta Presencial'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {t.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.fechaHora}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.cliente}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.idPedido}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                    Bs. {t.total.toFixed(2)} ({t.numProductos} Productos)
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => handleVerDetalle(t.id)}
                                                        className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap"
                                                    >
                                                        Ver Detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-6 flex justify-center items-center text-sm">
                            <nav className="flex items-center space-x-1">
                                <button
                                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                                    disabled={paginaActual === 1}
                                    className="p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    &lt;
                                </button>

                                <span className="px-4 py-2 font-semibold bg-[#F40009] text-white rounded-full">
                                    Página {paginaActual} de {totalPaginas}
                                </span>

                                <button
                                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                                    disabled={paginaActual === totalPaginas}
                                    className="p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    &gt;
                                </button>
                            </nav>
                        </div>
                    </main>
                </div>
            </div>

            <SaleModal isOpen={saleModalOpen} onClose={() => setSaleModalOpen(false)} onCompleted={loadData} currentUserId={currentUserId} />
            <RefundModal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} onCompleted={loadData} currentUserId={currentUserId} />
        </div>
    );
}
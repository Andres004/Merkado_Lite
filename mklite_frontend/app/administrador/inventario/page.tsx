"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, PlusCircle, X, XCircle } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import {
  createBatchService,
  getAllInventoryService,
  getBatchesByProductService,
  getProductsListService,
  getSuppliersListService,
  updateThresholdService,
} from "../../services/inventory.service";
import {
  BatchModel,
  InventoryModel,
  ProductShort,
  SupplierModel,
} from "../../models/inventory.model";

interface InventoryItemUI {
  id_producto: number;
  nombre: string;
  stock_disponible: number;
  stock_minimo: number;
}

interface AddBatchForm {
  id_producto: number | "";
  id_proveedor: number | "";
  cantidad: number | "";
  costo_unitario: number | "";
  fecha_vencimiento: string;
}

type StockStatus = "OK" | "Bajo Stock" | "Crítico";

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const getStockStatus = (stock: number, min: number): StockStatus => {
  if (stock <= 0) return "Crítico";
  if (stock <= min) return "Bajo Stock";
  return "OK";
};

const StockBadge: React.FC<{ status: StockStatus }> = ({ status }) => {
  // CAMBIO: Colores de texto más oscuros (800) para mejor lectura
  const styles = {
    OK: "bg-green-100 text-green-800",
    "Bajo Stock": "bg-yellow-100 text-yellow-800",
    "Crítico": "bg-red-100 text-red-800",
  }[status];

  const Icon = status === "OK" ? CheckCircle : status === "Bajo Stock" ? AlertTriangle : XCircle;

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${styles}`}>
      <Icon size={14} className="mr-1" />
      {status}
    </span>
  );
};

export default function AdminInventarioPage() {
    const [inventory, setInventory] = useState<InventoryItemUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showBatches, setShowBatches] = useState(false);
  const [showThreshold, setShowThreshold] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<InventoryItemUI | null>(null);
  const [batches, setBatches] = useState<BatchModel[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState<string | null>(null);

  const [productsOptions, setProductsOptions] = useState<ProductShort[]>([]);
  const [suppliersOptions, setSuppliersOptions] = useState<SupplierModel[]>([]);
  const [addBatchForm, setAddBatchForm] = useState<AddBatchForm>({
    id_producto: "",
    id_proveedor: "",
    cantidad: "",
    costo_unitario: "",
    fecha_vencimiento: "",
  });
  const [addBatchError, setAddBatchError] = useState<string | null>(null);
  const [addBatchLoading, setAddBatchLoading] = useState(false);

  const [thresholdValue, setThresholdValue] = useState<number | "">("");
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [thresholdLoading, setThresholdLoading] = useState(false);

  const totalPages = useMemo(() => Math.ceil(inventory.length / perPage) || 1, [inventory.length]);
  const paginatedInventory = useMemo(
    () => inventory.slice((page - 1) * perPage, page * perPage),
    [inventory, page]
  );

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllInventoryService();
      const mapped = data.map((item: InventoryModel): InventoryItemUI => ({
        id_producto: item.id_producto,
        nombre: item.product?.nombre ?? "Producto",
        stock_disponible: item.stock_disponible ?? 0,
        stock_minimo: item.stock_minimo ?? 0,
      }));
      setInventory(mapped);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (showAddBatch) {
      getProductsListService().then(setProductsOptions).catch(() => setAddBatchError("No se pudo cargar productos."));
      getSuppliersListService()
        .then(setSuppliersOptions)
        .catch(() => setAddBatchError("No se pudo cargar proveedores."));
    }
  }, [showAddBatch]);

  useEffect(() => {
    if (showBatches && selectedProduct) {
      const loadBatches = async () => {
        setBatchesLoading(true);
        setBatchesError(null);
        try {
          const response = await getBatchesByProductService(selectedProduct.id_producto);
          setBatches(response);
        } catch (err: any) {
          setBatchesError(err?.message || "No se pudieron cargar los lotes.");
        } finally {
          setBatchesLoading(false);
        }
      };
      loadBatches();
    }
  }, [showBatches, selectedProduct]);

  const openAddBatchModal = () => {
    setAddBatchForm({ id_producto: "", id_proveedor: "", cantidad: "", costo_unitario: "", fecha_vencimiento: "" });
    setAddBatchError(null);
    setShowAddBatch(true);
  };

  const handleCreateBatch = async () => {
    setAddBatchError(null);
    if (!addBatchForm.id_producto || !addBatchForm.cantidad || !addBatchForm.costo_unitario || !addBatchForm.fecha_vencimiento) {
      setAddBatchError("Completa todos los campos obligatorios.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const dto = {
      id_producto: Number(addBatchForm.id_producto),
      id_proveedor: addBatchForm.id_proveedor ? Number(addBatchForm.id_proveedor) : 0,
      fecha_recepcion: today,
      fecha_vencimiento: addBatchForm.fecha_vencimiento,
      costo_unitario: Number(addBatchForm.costo_unitario),
      cantidad_inicial: Number(addBatchForm.cantidad),
      cantidad_disponible: Number(addBatchForm.cantidad),
      estado_lote: "Activo",
    };
    
    
    setAddBatchLoading(true);
    try {
      await createBatchService(dto);
      setShowAddBatch(false);
      setAddBatchForm({ id_producto: "", id_proveedor: "", cantidad: "", costo_unitario: "", fecha_vencimiento: "" });
      await fetchInventory();
    } catch (err: any) {
      setAddBatchError(err?.message || "No se pudo registrar el lote.");
    } finally {
      setAddBatchLoading(false);
    }
  };

  const openThresholdModal = (product: InventoryItemUI) => {
    setSelectedProduct(product);
    setThresholdValue(product.stock_minimo);
    setThresholdError(null);
    setShowThreshold(true);
  };

  const handleThresholdSave = async () => {
    if (thresholdValue === "" || thresholdValue < 0) {
      setThresholdError("Ingresa un umbral válido (>= 0).");
      return;
    }
    if (!selectedProduct) return;

    setThresholdLoading(true);
    setThresholdError(null);
    try {
      await updateThresholdService(selectedProduct.id_producto, Number(thresholdValue));
      setShowThreshold(false);
      await fetchInventory();
    } catch (err: any) {
      setThresholdError(err?.message || "No se pudo actualizar el umbral.");
    } finally {
      setThresholdLoading(false);
    }
  };

  const openBatchesModal = (product: InventoryItemUI) => {
    setSelectedProduct(product);
    setShowBatches(true);
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
              {/* CAMBIO: Texto negro */}
              <h1 className="text-3xl font-extrabold text-black">Gestión de Inventario</h1>
              <button
                onClick={openAddBatchModal}
                className="flex items-center bg-[#F40009] text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
              >
                <PlusCircle size={20} className="mr-2" />
                Registrar Nuevo Lote
              </button>
            </div>

            {loading && <p className="text-gray-600 font-medium text-center">Cargando inventario...</p>}
            {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}

            {!loading && (
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {/* CAMBIO: Headers negros */}
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Stock Disponible</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Umbral Mínimo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedInventory.map((item) => {
                      const status = getStockStatus(item.stock_disponible, item.stock_minimo);
                      return (
                        <tr key={item.id_producto} className="hover:bg-red-50 transition duration-150">
                          {/* CAMBIO: Texto negro en celdas */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-black">{item.nombre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{item.stock_disponible} uds</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{item.stock_minimo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StockBadge status={status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-4">
                              <button
                                onClick={() => openBatchesModal(item)}
                                className="text-[#F40009] hover:text-red-800 font-bold transition duration-150 whitespace-nowrap"
                              >
                                Ver Lotes
                              </button>
                              <button
                                onClick={() => openThresholdModal(item)}
                                className="text-gray-600 hover:text-black font-semibold transition duration-150 whitespace-nowrap"
                              >
                                Editar Umbral
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-center items-center text-sm">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-full font-bold transition-colors duration-150 ${
                      page === p ? "bg-[#F40009] text-white shadow-md" : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  &gt;
                </button>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL: REGISTRAR LOTE */}
      {showAddBatch && (
        // CAMBIO: Blur effect
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative border border-gray-200">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowAddBatch(false)}>
              <X />
            </button>
            <h2 className="text-xl font-bold text-center mb-6 text-black">Registrar Nuevo Lote</h2>

            {addBatchError && <p className="text-red-600 text-sm mb-3 font-medium">{addBatchError}</p>}

            <div className="space-y-4">
              <div>
                {/* CAMBIO: Labels negros y negrita */}
                <label className="block text-sm font-bold text-gray-900 mb-1">Producto</label>
                <select
                  value={addBatchForm.id_producto}
                  onChange={(e) => setAddBatchForm({ ...addBatchForm, id_producto: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
                >
                  <option value="">Selecciona un producto</option>
                  {productsOptions.map((product) => (
                    <option key={product.id_producto} value={product.id_producto}>
                      {product.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Proveedor</label>
                <select
                  value={addBatchForm.id_proveedor}
                  onChange={(e) => setAddBatchForm({ ...addBatchForm, id_proveedor: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
                >
                  <option value="">Selecciona un proveedor</option>
                  {suppliersOptions.map((supplier) => (
                    <option key={supplier.id_proveedor} value={supplier.id_proveedor}>
                      {supplier.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Cantidad de Unidades</label>
                <input
                  type="number"
                  min={0}
                  value={addBatchForm.cantidad}
                  onChange={(e) => setAddBatchForm({ ...addBatchForm, cantidad: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Costo por Unidad</label>
                  <input
                    type="number"
                    min={0}
                    value={addBatchForm.costo_unitario}
                    onChange={(e) =>
                      setAddBatchForm({ ...addBatchForm, costo_unitario: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={addBatchForm.fecha_vencimiento}
                    onChange={(e) => setAddBatchForm({ ...addBatchForm, fecha_vencimiento: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateBatch}
              disabled={addBatchLoading}
              className="mt-6 w-full bg-[#F40009] text-white py-3 rounded-full font-bold shadow-md hover:bg-red-700 transition disabled:opacity-60"
            >
              {addBatchLoading ? "Guardando..." : "Guardar Lote"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VER LOTES */}
      {showBatches && selectedProduct && (
        // CAMBIO: Blur effect
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative border border-gray-200">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowBatches(false)}>
              <X />
            </button>
            {/* CAMBIO: Texto negro */}
            <h2 className="text-xl font-bold mb-4 text-black">Lotes de: <span className="text-[#F40009]">{selectedProduct.nombre}</span></h2>

            {batchesLoading && <p className="text-gray-600 text-center py-4">Cargando lotes...</p>}
            {batchesError && <p className="text-red-600 mb-3 font-medium">{batchesError}</p>}

            {!batchesLoading && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {/* CAMBIO: Headers negros */}
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">ID Lote</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Fecha Vencimiento</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Costo Adq.</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Stock lote</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase">Estado lote</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch.id_lote} className="hover:bg-gray-50">
                        {/* CAMBIO: Texto oscuro en celdas */}
                        <td className="px-4 py-3 text-sm font-bold text-black">{batch.id_lote}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatDate(batch.fecha_vencimiento)}</td>
                        
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            Bs. {Number(batch.costo_unitario ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {batch.cantidad_disponible}/{batch.cantidad_inicial}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">
                          <span
                            className={
                              batch.estado_lote === "Activo"
                                ? "text-green-700"
                                : batch.estado_lote === "Vencido"
                                ? "text-red-700"
                                : "text-yellow-700"
                            }
                          >
                            {batch.estado_lote}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-500 italic font-medium">{/* TODO: endpoint mark defective */}Marcar Defectuoso</td>
                      </tr>
                    ))}
                    {batches.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-600 font-medium">
                          No hay lotes para este producto.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowBatches(false)}
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-800 font-bold hover:bg-gray-100 transition"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
     )}

      {/* MODAL: DEFINIR UMBRAL */}
      {showThreshold && selectedProduct && (
        // CAMBIO: Blur effect
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-gray-200">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowThreshold(false)}>
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Definir Umbral Mínimo</h2>

            {thresholdError && <p className="text-red-600 text-sm mb-3 font-medium">{thresholdError}</p>}

            <p className="text-sm text-gray-800 mb-1 font-medium">
              <span className="font-bold text-black">Producto:</span> {selectedProduct.nombre}
            </p>
            <p className="text-sm text-gray-800 mb-4 font-medium">
              <span className="font-bold text-black">Stock Total Actual:</span> {selectedProduct.stock_disponible} uds.
            </p>

            <label className="block text-sm font-bold text-gray-900 mb-1">Umbral de Alerta Mínimo:</label>
            <input
              type="number"
              min={0}
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 text-black font-medium focus:ring-[#F40009] focus:border-[#F40009]"
            />

            <div className="flex gap-3">
              <button
                onClick={handleThresholdSave}
                disabled={thresholdLoading}
                className="flex-1 bg-[#F40009] text-white py-3 rounded-full font-bold shadow-md hover:bg-red-700 transition disabled:opacity-60"
              >
                {thresholdLoading ? "Guardando..." : "Guardar Umbral"}
              </button>
              <button
                onClick={() => setShowThreshold(false)}
                className="flex-1 bg-gray-100 border border-gray-200 text-gray-800 py-3 rounded-full font-bold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
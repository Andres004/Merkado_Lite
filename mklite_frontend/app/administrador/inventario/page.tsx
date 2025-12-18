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
  const styles = {
    OK: "bg-green-100 text-green-700",
    "Bajo Stock": "bg-yellow-100 text-yellow-700",
    "Crítico": "bg-red-100 text-red-700",
  }[status];

  const Icon = status === "OK" ? CheckCircle : status === "Bajo Stock" ? AlertTriangle : XCircle;

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${styles}`}>
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

          <main className="flex-1 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Inventario</h1>
              <button
                onClick={openAddBatchModal}
                className="flex items-center bg-[#F40009] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
              >
                <PlusCircle size={20} className="mr-2" />
                Registrar Nuevo Lote
              </button>
            </div>

            {loading && <p className="text-gray-600">Cargando inventario...</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {!loading && (
              <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Disponible</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Umbral Mínimo</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedInventory.map((item) => {
                      const status = getStockStatus(item.stock_disponible, item.stock_minimo);
                      return (
                        <tr key={item.id_producto} className="hover:bg-red-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nombre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{item.stock_disponible} uds</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.stock_minimo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StockBadge status={status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex justify-center space-x-4">
                              <button
                                onClick={() => openBatchesModal(item)}
                                className="text-red-500 hover:text-red-700 transition duration-150 whitespace-nowrap"
                              >
                                Ver Lotes
                              </button>
                              <button
                                onClick={() => openThresholdModal(item)}
                                className="text-gray-500 hover:text-gray-700 transition duration-150 whitespace-nowrap"
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
                  className="p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors duration-150 ${
                      page === p ? "bg-[#F40009] text-white shadow-md" : "bg-white text-gray-700 hover:bg-red-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  &gt;
                </button>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {showAddBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setShowAddBatch(false)}>
              <X />
            </button>
            <h2 className="text-xl font-bold text-center mb-4">Registrar Nuevo Lote</h2>

            {addBatchError && <p className="text-red-600 text-sm mb-3">{addBatchError}</p>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                <select
                  value={addBatchForm.id_producto}
                  onChange={(e) => setAddBatchForm({ ...addBatchForm, id_producto: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full border rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                <select
                  value={addBatchForm.id_proveedor}
                  onChange={(e) => setAddBatchForm({ ...addBatchForm, id_proveedor: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full border rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Unidades</label>
                <input
                  type="number"
                  min={0}
                  value={addBatchForm.cantidad}
                  onChange={(e) => setAddBatchForm({ ...addBatchForm, cantidad: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo por Unidad</label>
                  <input
                    type="number"
                    min={0}
                    value={addBatchForm.costo_unitario}
                    onChange={(e) =>
                      setAddBatchForm({ ...addBatchForm, costo_unitario: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={addBatchForm.fecha_vencimiento}
                    onChange={(e) => setAddBatchForm({ ...addBatchForm, fecha_vencimiento: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateBatch}
              disabled={addBatchLoading}
              className="mt-6 w-full bg-[#F40009] text-white py-3 rounded-full font-semibold shadow-md hover:bg-red-700 transition disabled:opacity-60"
            >
              {addBatchLoading ? "Guardando..." : "Guardar Lote"}
            </button>
          </div>
        </div>
      )}

      {showBatches && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 relative">
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setShowBatches(false)}>
              <X />
            </button>
            <h2 className="text-lg font-semibold mb-4">Lotes de : {selectedProduct.nombre}</h2>

            {batchesLoading && <p className="text-gray-600">Cargando lotes...</p>}
            {batchesError && <p className="text-red-600 mb-3">{batchesError}</p>}

            {!batchesLoading && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">ID Lote</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Fecha Vencimiento</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Costo Adq.</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Stock lote</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Estado lote</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batches.map((batch) => (
                      <tr key={batch.id_lote}>
                        <td className="px-4 py-3 text-sm text-gray-800">{batch.id_lote}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(batch.fecha_vencimiento)}</td>
                        
                        <td className="px-4 py-3 text-sm text-gray-700">
                            Bs. {Number(batch.costo_unitario ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {batch.cantidad_disponible}/{batch.cantidad_inicial}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span
                            className={
                              batch.estado_lote === "Activo"
                                ? "text-green-600"
                                : batch.estado_lote === "Vencido"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                          >
                            {batch.estado_lote}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-400">{/* TODO: endpoint mark defective */}Marcar Defectuoso</td>
                      </tr>
                    ))}
                    {batches.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-600">
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
                className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
     )}

      {showThreshold && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button className="absolute top-3 right-3 text-gray-500" onClick={() => setShowThreshold(false)}>
              <X />
            </button>
            <h2 className="text-lg font-semibold mb-4">Definir Umbral Mínimo</h2>

            {thresholdError && <p className="text-red-600 text-sm mb-3">{thresholdError}</p>}

            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Producto:</span> {selectedProduct.nombre}
            </p>
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-semibold">Stock Total Actual:</span> {selectedProduct.stock_disponible} uds.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Umbral de Alerta Mínimo:</label>
            <input
              type="number"
              min={0}
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={handleThresholdSave}
                disabled={thresholdLoading}
                className="flex-1 bg-[#F40009] text-white py-3 rounded-full font-semibold shadow-md hover:bg-red-700 transition disabled:opacity-60"
              >
                {thresholdLoading ? "Guardando..." : "Guardar Umbral"}
              </button>
              <button
                onClick={() => setShowThreshold(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-300 transition"
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

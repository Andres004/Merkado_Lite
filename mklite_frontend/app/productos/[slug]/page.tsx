"use client";

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Minus, Plus, Heart, ShoppingCart, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

// IMPORTACIONES
import { getProductById, getProductsByCategoryId } from '../../services/product.service';
import { addToCartService } from '../../services/cart.service';
import { ProductModel } from '../../models/product.model';
import ProductCard from '../../components/ProductCard';
import { useFavorites } from '../../context/FavoriteContext';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug } = use(params);
  
  // Estados
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productId = Number(String(slug).split('-')[0]);
        
        if (isNaN(productId)) return; 

        const productData = await getProductById(productId);
        setProduct(productData);

        if (productData) {
            const categoryId = productData.productCategories?.[0]?.categoria?.id_categoria;

            if (categoryId) {
                const related = await getProductsByCategoryId(categoryId);
                const filteredRelated = related
                    .filter(p => p.id_producto !== productId)
                    .slice(0, 4);
                setRelatedProducts(filteredRelated);
            }
        }
      } catch (error) {
        console.error("Error cargando producto", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // --- LÓGICA DE STOCK ---
  const currentStock = product?.inventory?.stock_disponible || 0;
  const isOutOfStock = currentStock === 0;

  const renderStockBadge = () => {
    if (isOutOfStock) {
        return (
            <span className="flex items-center bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-red-100">
                <AlertCircle size={14} className="mr-1" /> Agotado
            </span>
        );
    } 
    if (currentStock < 10) {
        return (
            <span className="flex items-center bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-orange-100">
                <AlertCircle size={14} className="mr-1" /> ¡Solo quedan {currentStock}!
            </span>
        );
    }
    return (
        <span className="flex items-center bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-100">
            <CheckCircle size={14} className="mr-1" /> En stock ({currentStock})
        </span>
    );
  };

  const handleAddToCart = async () => {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) {
      alert('Debes iniciar sesión para comprar.');
      return;
    }
    if (isOutOfStock) {
        alert('Lo sentimos, este producto está agotado.');
        return;
    }
    const user = JSON.parse(storedUser);
    if (!product) return;

    try {
      await addToCartService({
        id_usuario: user.id_usuario,
        id_producto: product.id_producto,
        cantidad: qty 
      });
      alert(`¡${qty} ${product.nombre}(s) agregado(s) al carrito!`);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Error al agregar al carrito';
      alert(msg);
    }
  };

  const increaseQty = () => {
      if (qty < currentStock) setQty(q => q + 1);
      else alert('No puedes agregar más productos de los disponibles en stock.');
  };

  const decreaseQty = () => setQty(q => Math.max(1, q - 1));


  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-4 bg-[#F40009] rounded-full mb-2 animate-bounce"></div>
                <p className="text-gray-500">Cargando producto...</p>
            </div>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Producto no encontrado</h1>
            <Link href="/" className="mt-4 text-[#F40009] hover:underline">Volver al inicio</Link>
        </div>
    );
  }

  const categoryName = product.productCategories?.[0]?.categoria?.nombre || "General";
  const favorite = product ? isFavorite(product.id_producto) : false;

  const handleFavoriteToggle = async () => {
    if (!product) return;
    await toggleFavorite(product);
  };

  return (
    <div className="bg-gray-50 pb-16 font-sans">
    
      {/* HEADER / BREADCRUMBS (Estilo limpio, sin barra negra) */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
            <div className="flex items-center text-sm text-gray-500">
                <Link href="/" className="flex items-center hover:text-[#F40009] transition-colors">
                    <Home size={18} className="mr-2" /> Inicio
                </Link>
                <ChevronRight size={18} className="mx-2 text-gray-400" />
                <span className="hover:text-[#F40009] cursor-pointer transition-colors">
                    {categoryName}
                </span>
                <ChevronRight size={18} className="mx-2 text-gray-400" />
                <span className="font-bold !text-[#F40009] tracking-wide line-clamp-1" style={{ color: '#F40009' }}>
                    {product.nombre}
                </span>
            </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Imagen (TAMAÑO REDUCIDO) */}
          {/* Se redujo h-[450px] a h-[400px] y el padding */}
          <div className="relative h-[400px] flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <Image
              src={product.imagen_url || '/images/placeholder.jpg'}
              alt={product.nombre || "Producto"}
              width={350}  // Reducido de 400
              height={350} // Reducido de 400
              style={{ objectFit: 'contain' }}
              priority
              className="hover:scale-105 transition-transform duration-300"
            />
             {/* Botón de Favoritos Flotante */}
             <button
                onClick={handleFavoriteToggle}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-sm border transition-all z-10
                    ${favorite ? 'bg-red-50 text-[#F40009] border-red-100' : 'bg-white text-gray-400 border-gray-200 hover:text-[#F40009] hover:border-red-100'}`}
            >
                <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Información */}
          <div className="flex flex-col space-y-6 justify-center">
            <div>
                <div className="flex items-center space-x-4 text-sm mb-3">
                    {renderStockBadge()}
                    <p className="text-gray-400 font-medium">COD: {product.id_producto}</p>
                </div>
                
                {/* TÍTULO FORZADO A ROJO (Opción Nuclear) */}
                <h1 className="text-3xl md:text-4xl font-extrabold !text-[#F40009] tracking-tight leading-tight" style={{ color: '#F40009' }}>
                    {product.nombre}
                </h1>
            </div>
            
            {/* Descripción */}
            <p className="text-gray-600 text-lg leading-relaxed">{product.descripcion}</p>

            {/* Precios (También forzado a rojo para consistencia) */}
            <div className="flex items-baseline space-x-2 pb-4 border-b border-gray-100">
                <span className="text-3xl font-bold !text-[#F40009]" style={{ color: '#F40009' }}>
                    Bs. {product.precio_venta}
                </span>
            </div>

            {/* Cantidad y Botones */}
            <div className="pt-4 space-y-4">
                <span className="text-sm font-bold text-gray-900 uppercase">Cantidad:</span>
                <div className="flex gap-4">
                    {/* Selector de Cantidad (Estilo limpio) */}
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button 
                            onClick={decreaseQty}
                            disabled={isOutOfStock}
                            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-[#F40009] hover:bg-gray-100 rounded-l-lg transition-colors disabled:opacity-30"
                        >
                            <Minus size={20} />
                        </button>
                        <span className="w-16 text-center font-bold text-xl text-gray-900 bg-white h-12 flex items-center justify-center border-l border-r border-gray-200">
                            {qty}
                        </span>
                        <button 
                            onClick={increaseQty}
                            disabled={isOutOfStock}
                            className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-[#F40009] hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-30"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Botón Añadir al Carrito (ROJO) */}
                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 py-3 px-6 rounded-lg shadow-md text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95
                            ${isOutOfStock 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                                : 'bg-[#F40009] hover:bg-red-700 text-white hover:shadow-red-200'
                            }`}
                    >
                        <ShoppingCart size={24} />
                        <span>{isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito'}</span>
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* INFORMACIÓN ADICIONAL (Estilo mejorado) */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 inline-block">Información Adicional</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
            <div className="flex flex-col">
                <span className="font-semibold text-gray-500 mb-1">Categoría:</span>
                <span className="text-gray-900 font-medium text-base">{categoryName}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-500 mb-1">Disponibilidad:</span>
                <span className={`font-medium text-base ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutOfStock ? 'Agotado temporalmente' : 'En Stock para envío inmediato'}
                </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* RELACIONADOS */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900">Productos relacionados</h2>
                <div className="w-20 h-1 bg-[#F40009] mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id_producto} product={relatedProduct} />
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
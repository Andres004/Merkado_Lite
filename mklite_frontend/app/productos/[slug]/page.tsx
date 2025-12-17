"use client";

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Minus, Plus, Heart, ShoppingCart, ChevronRight } from 'lucide-react';

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
        // Manejo del slug (por si usas id-nombre o solo id)
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
  // Obtenemos el stock real o 0 si no hay dato
  const currentStock = product?.inventory?.stock_disponible || 0;
  const isOutOfStock = currentStock === 0;

  // Renderizado del Badge de Stock
  const renderStockBadge = () => {
    if (isOutOfStock) {
        return (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Agotado
            </span>
        );
    } 
    if (currentStock < 10) {
        return (
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                ¡Solo quedan {currentStock}!
            </span>
        );
    }
    return (
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {currentStock} Unidades en stock
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

  // Manejadores de incremento con límite de stock
  const increaseQty = () => {
      if (qty < currentStock) {
          setQty(q => q + 1);
      } else {
          alert('No puedes agregar más productos de los disponibles en stock.');
      }
  };

  const decreaseQty = () => {
      setQty(q => Math.max(1, q - 1));
  };


  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 animate-pulse">Cargando producto...</p>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Producto no encontrado</h1>
            <Link href="/" className="mt-4 text-red-600 hover:underline">Volver al inicio</Link>
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
    <div className="bg-gray-50 pb-16">
    
      {/* HEADER / BREADCRUMBS */}
      <div className="relative bg-black border-b border-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
            <div className="flex items-center text-lg text-gray-300">
                <Link href="/" className="flex items-center hover:text-[#F40009] transition-colors">
                    <Home size={20} className="mr-2" />
                    Casa
                </Link>
                <ChevronRight size={20} className="mx-3 text-gray-600" />
                <span className="hover:text-[#F40009] cursor-pointer transition-colors">
                    {categoryName}
                </span>
                <ChevronRight size={20} className="mx-3 text-gray-600" />
                <span className="font-bold text-[#F40009] tracking-wide line-clamp-1">
                    {product.nombre}
                </span>
            </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-md">
          
          {/* Imagen */}
          <div className="relative h-[450px] flex items-center justify-center">
            <Image
              src={product.imagen_url || '/images/placeholder.jpg'}
              alt={product.nombre || "Producto"}
              width={400} 
              height={400} 
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Información */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-800">{product.nombre}</h1>
            
            {/* SKU y Stock (LÓGICA NUEVA) */}
            <div className="flex items-center space-x-4 text-sm">
                <p className="text-gray-500">COD: {product.id_producto}</p>
                {renderStockBadge()}
            </div>

            {/* Precios */}
            <div className="flex items-center space-x-4 border-b pb-4">
                <span className="text-2xl font-bold text-gray-800">
                    Bs. {product.precio_venta}
                </span>
            </div>

            {/* Descripción */}
            <p className="text-gray-600">{product.descripcion}</p>
            
            <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-500'>Categoría:</span>
                <span className='font-semibold text-gray-800'>{categoryName}</span>
            </div>

            {/* Cantidad y Botones */}
            <div className="flex items-center space-x-4 pt-4">
              
              {/* Selector de Cantidad (BOTONES NEGROS) */}
              <div className="flex items-center">
                <button 
                    onClick={decreaseQty}
                    disabled={isOutOfStock}
                    className="w-10 h-10 bg-black text-white rounded-l-md hover:bg-gray-800 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Minus size={16} />
                </button>
                <div className="h-10 w-16 border-t border-b border-gray-300 flex items-center justify-center bg-white">
                    <span className="font-bold text-lg text-gray-900">{qty}</span>
                </div>
                <button 
                    onClick={increaseQty}
                    disabled={isOutOfStock}
                    className="w-10 h-10 bg-black text-white rounded-r-md hover:bg-gray-800 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={16} />
                </button>
              </div>

              {/* Botón Añadir al Carrito */}
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 font-semibold py-3 rounded-md shadow-md transition duration-150 flex items-center justify-center space-x-2
                    ${isOutOfStock 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito'}</span>
              </button>

              {/* Botón de Favoritos */}
              <button
                onClick={handleFavoriteToggle}
                className={`p-3 border rounded-md transition ${favorite ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600'}`}
              >
                <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* INFORMACIÓN ADICIONAL */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Información Adicional</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 text-sm">
            <p className="font-semibold text-gray-600">Nombre del Producto:</p>
            <p className="col-span-2 text-gray-800">{product.nombre}</p>
            
            <p className="font-semibold text-gray-600">Categoría:</p>
            <p className="col-span-2 text-gray-800">{categoryName}</p>

            <p className="font-semibold text-gray-600">Estado:</p>
            <p className="col-span-2 text-gray-800">{isOutOfStock ? 'No Disponible' : 'Disponible'}</p>
          
            <p className="font-semibold text-gray-600">Detalle:</p>
            <p className="col-span-2 text-gray-800 italic">
                Producto de calidad garantizada por Merkado Lite.
            </p>
          </div>
        </div>
      </div>
      
      {/* RELACIONADOS */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Productos relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id_producto} product={relatedProduct} />
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
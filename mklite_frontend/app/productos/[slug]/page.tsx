"use client";

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Minus, Plus, Heart, ShoppingCart, ChevronRight } from 'lucide-react';

// IMPORTACIONES DE SERVICIOS Y MODELOS
// Asegúrate de que estas rutas sean correctas según tu estructura de carpetas
import { getProductById, getProductsByCategoryId } from '../../services/product.service';
import { addToCartService } from '../../services/cart.service'; // <--- NUEVO SERVICIO
import { ProductModel } from '../../models/product.model';
import ProductCard from '../../components/ProductCard';

// 2. IMPORTAMOS EL CONTEXTO DEL CARRITO
import { useCart } from '../../context/CartContext';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // 1. DESEMPAQUETAMOS EL ID DE LA URL
  const { slug } = use(params);
  
  // Estados
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1); // Estado para la cantidad a comprar

  // 2. CARGA DE DATOS
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const productId = Number(slug);
        
        if (isNaN(productId)) return; 

        const productData = await getProductById(productId);
        setProduct(productData);

        if (productData) {
            // Buscamos la categoría de forma segura
            const categoryId = productData.productCategories?.[0]?.categoria?.id_categoria;

            if (categoryId) {
                const related = await getProductsByCategoryId(categoryId);
                // Filtramos para no mostrar el mismo producto y limitamos a 4
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

  // 3. FUNCIÓN PARA AGREGAR AL CARRITO
  const handleAddToCart = async () => {
    // Verificar si hay usuario logueado en el navegador
    const storedUser = localStorage.getItem('userData');
    
    if (!storedUser) {
      alert('Debes iniciar sesión para comprar.');
      return;
    }

    const user = JSON.parse(storedUser);

    if (!product) return;

    try {
      // Llamar al backend
      await addToCartService({
        id_usuario: user.id_usuario,
        id_producto: product.id_producto,
        cantidad: qty // Usamos la cantidad del estado
      });
      
      alert(`¡${qty} ${product.nombre}(s) agregado(s) al carrito!`);
      
    } catch (error: any) {
      console.error(error);
      // Manejo de errores del backend (ej: Stock insuficiente)
      const msg = error.response?.data?.message || 'Error al agregar al carrito';
      alert(msg);
    }
  };

  // 4. PANTALLA DE CARGA
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 animate-pulse">Cargando detalles...</p>
            </div>
        </div>
    );
  }

  // 5. PANTALLA NO ENCONTRADO
  if (!product) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800">Producto no encontrado</h1>
            <Link href="/" className="mt-4 text-red-600 hover:underline">Volver al inicio</Link>
        </div>
    );
  }

  // 6. RENDERIZADO DE LA UI
  const categoryName = product.productCategories?.[0]?.categoria?.nombre || "General";

  return (
    <div className="bg-gray-50 pb-16 min-h-screen">
    
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

      {/* SECCIÓN PRINCIPAL: IMAGEN Y DETALLES */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-md">
          
          {/* Columna Izquierda: Imagen */}
          <div className="relative h-[450px] flex items-center justify-center group">
            <Image
              src={product.imagen_url || '/images/placeholder.jpg'}
              alt={product.nombre || "Producto"}
              fill
              style={{ objectFit: 'contain' }}
              className="transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          {/* Columna Derecha: Información de Compra */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-800">{product.nombre}</h1>
            
            {/* SKU y Stock */}
            <div className="flex items-center space-x-4 text-sm">
                <p className="text-gray-500">COD: {product.id_producto}</p>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Disponible
                </span>
            </div>

            {/* Precios */}
            <div className="flex items-center space-x-4 border-b pb-4">
                <span className="text-3xl font-bold text-gray-800">
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
              
              {/* Selector de Cantidad */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-gray-100 rounded-l-md text-gray-600"
                >
                    <Minus size={18} />
                </button>
                <span className="px-4 py-2 font-semibold text-lg w-12 text-center">{qty}</span>
                <button 
                    onClick={() => setQty(q => q + 1)}
                    className="p-3 hover:bg-gray-100 rounded-r-md text-gray-600"
                >
                    <Plus size={18} />
                </button>
              </div>

              {/* Botón Añadir al Carrito CONECTADO AL BACKEND */}
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md shadow-md transition duration-150 flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>Añadir al Carrito</span>
              </button>

              {/* Botón de Favoritos (Visual) */}
              <button className="p-3 border border-gray-300 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition">
                <Heart size={20} />
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

            <p className="font-semibold text-gray-600">Disponibilidad:</p>
            <p className="col-span-2 text-gray-800 text-green-600 font-semibold">En Stock</p>
          
            <p className="font-semibold text-gray-600">Detalle:</p>
            <p className="col-span-2 text-gray-800 italic">
                Producto de calidad garantizada por Merkado Lite.
            </p>
          </div>
        </div>
      </div>
      
      {/* PRODUCTOS RELACIONADOS */}
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
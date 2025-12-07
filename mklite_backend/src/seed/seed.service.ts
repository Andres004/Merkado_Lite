import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../productcategory/productcategory.service';
import { InventoryService } from '../inventory/inventory.service'; // <--- IMPORTANTE
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity'; 
import { AppDataSource } from 'src/data-source'; 

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly inventoryService: InventoryService, // <--- INYECCIÓN
  ) {}

  // Se ejecuta automáticamente al iniciar el servidor
  async onModuleInit() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await this.seedDatabase();
  }

  async seedDatabase() {
    // Si ya hay productos, no hace nada.
    const products = await this.productService.getAllProducts();
    if (products.length > 0) {
      console.log('La base de datos ya tiene datos. Seed omitido.');
      return;
    }

    console.log('Iniciando Sembrado (Seed) completo...');

    // repositorio directamente del DataSource
    const categoryRepo = AppDataSource.getRepository(Category);

    // DATOS MAESTROS (Categorías + Sus Productos + Stock Inicial)
    const dataToInsert = [
      {
        categoria: { nombre: 'Frutas y Verduras', descripcion: 'Productos frescos del campo.' },
        productos: [
          { nombre: 'Manzana Roja 1kg', descripcion: 'Manzana fresca por kilogramo.', precio_venta: 10.00, imagen_url: '/images/frutas/manzana.jpg', stock_inicial: 50 },
          { nombre: 'Banana 1kg', descripcion: 'Bananas frescas por kg.', precio_venta: 8.00, imagen_url: '/images/frutas/banana.jpg', stock_inicial: 60 },
          { nombre: 'Tomate 1kg', descripcion: 'Tomate fresco de huerta.', precio_venta: 6.50, imagen_url: '/images/frutas/tomate.jpg', stock_inicial: 40 },
          { nombre: 'Lechuga', descripcion: 'Lechuga fresca lista para ensaladas.', precio_venta: 5.00, imagen_url: '/images/frutas/lechuga.jpg', stock_inicial: 30 },
          { nombre: 'Cebolla 1kg', descripcion: 'Cebolla blanca por kilogramo.', precio_venta: 4.50, imagen_url: '/images/frutas/cebolla.jpg', stock_inicial: 45 },
        ]
      },
      {
        categoria: { nombre: 'Fiambres y Embutidos', descripcion: 'Jamones, salchichas y más.' },
        productos: [
          { nombre: 'Jamón Cerdo 200g', descripcion: 'Rebanado.', precio_venta: 16.50, imagen_url: '/images/fiambres/jamon.jpg', stock_inicial: 20 },
          { nombre: 'Salchicha Vienesa 1kg', descripcion: 'Paquete familiar.', precio_venta: 22.00, imagen_url: '/images/fiambres/salchicha.jpg', stock_inicial: 25 },
          { nombre: 'Mortadela 500g', descripcion: 'Familiar.', precio_venta: 14.00, imagen_url: '/images/fiambres/mortadela.jpg', stock_inicial: 30 },
          { nombre: 'Chorizo parrillero', descripcion: 'Para asados.', precio_venta: 18.00, imagen_url: '/images/fiambres/chorizo.jpg', stock_inicial: 15 },
          { nombre: 'Tocino', descripcion: 'Ahumado.', precio_venta: 20.00, imagen_url: '/images/fiambres/tocino.jpg', stock_inicial: 10 },
        ]
      },
      {
        categoria: { nombre: 'Lácteos', descripcion: 'Leche, quesos, yogures y huevos.' },
        productos: [
          { nombre: 'Leche Pil 1L', descripcion: 'Leche entera pasteurizada.', precio_venta: 7.00, imagen_url: '/images/lacteos/leche.jpg', stock_inicial: 100 },
          { nombre: 'Queso cheddar 200g', descripcion: 'Queso cheddar en láminas.', precio_venta: 18.00, imagen_url: '/images/fiambres/cheddar.jpg', stock_inicial: 40 },
          { nombre: 'Yogurt Bebible 1L', descripcion: 'Sabor frutilla.', precio_venta: 10.00, imagen_url: '/images/lacteos/yogurt.jpg', stock_inicial: 60 },
          { nombre: 'Mantequilla Pil 200g', descripcion: 'Mantequilla con sal.', precio_venta: 12.00, imagen_url: '/images/lacteos/mantequilla.jpg', stock_inicial: 35 },
        ]
      },
      {
        categoria: { nombre: 'Bebidas', descripcion: 'Gaseosas, jugos, agua y bebidas energizantes.' },
        productos: [
          { nombre: 'Coca-Cola 3L', descripcion: 'Refresco gaseoso sabor cola.', precio_venta: 13.00, imagen_url: '/images/bebidas/CocaCola-3l.png', stock_inicial: 120 },
          { nombre: 'Sprite 2L', descripcion: 'Refresco sabor lima-limón.', precio_venta: 10.00, imagen_url: '/images/bebidas/sprite.jpg', stock_inicial: 80 },
          { nombre: 'Jugos del Valle 1L', descripcion: 'Jugo sabor durazno.', precio_venta: 12.00, imagen_url: '/images/bebidas/valle.jpg', stock_inicial: 60 },
        ]
      },
      // ... puedes agregar el resto de categorías aquí siguiendo el mismo formato ...
    ];

    // BUCLE DE INSERCIÓN
    for (const group of dataToInsert) {
      // 1. Crear la Categoría
      const newCat = categoryRepo.create(group.categoria);
      const savedCat = await categoryRepo.save(newCat);
      console.log(` Categoría creada: ${savedCat.nombre}`);

      for (const prodData of group.productos) {
        // 2. Crear el Producto (Sin el campo stock_inicial, ese lo separamos)
        const { stock_inicial, ...productOnlyData } = prodData;
        
        const newProd = new Product();
        Object.assign(newProd, productOnlyData);
        
        const savedProd = await this.productService.createProduct(newProd);

        // 3. Asignar Categoría
        await this.productCategoryService.assignCategoryToProduct({
            id_producto: savedProd.id_producto,
            id_categoria: savedCat.id_categoria
        });
        
        // 4. Crear Inventario Inicial (CORRECCIÓN CLAVE)
        if (stock_inicial !== undefined) {
            await this.inventoryService.setInventory(savedProd.id_producto, {
                stock_disponible: stock_inicial,
                stock_reservado: 0,
                stock_minimo: 5, // Valor por defecto
                stock_vencido: 0,
                stock_danado: 0
            });
        }
        
        console.log(`   -> Producto "${savedProd.nombre}" creado con stock: ${stock_inicial}`);
      }
    }

    console.log('Seed completado con éxito. Base de datos lista.');
  }
}
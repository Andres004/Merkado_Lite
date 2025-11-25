{/*
    import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../productcategory/productcategory.service';
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const products = await this.productService.getAllProducts();
    if (products.length > 0) {
      console.log('✅ Base de datos ya contiene productos. Seed omitido.');
      return;
    }

    console.log('🌱 Iniciando seed...');

    const categoryRepo = this.dataSource.getRepository(Category);

    // LISTA CORRECTA DE TUS 12 CATEGORÍAS
    const dataToInsert = [
      {
        categoria: { nombre: 'Frutas y Verduras', descripcion: 'Productos frescos.' },
        productos: [
          { nombre: 'Manzana Roja 1kg', descripcion: 'Manzana fresca.', precio_venta: 10.00, imagen_url: '/img/frutas/manzana.jpg' },
          { nombre: 'Banana 1kg', descripcion: 'Banana fresca.', precio_venta: 8.00, imagen_url: '/img/frutas/banana.jpg' },
          { nombre: 'Tomate 1kg', descripcion: 'Tomate fresco.', precio_venta: 6.50, imagen_url: '/img/frutas/tomate.jpg' },
          { nombre: 'Lechuga Crespa', descripcion: 'Lechuga fresca.', precio_venta: 5.00, imagen_url: '/img/frutas/lechuga.jpg' },
          { nombre: 'Cebolla 1kg', descripcion: 'Cebolla blanca.', precio_venta: 4.50, imagen_url: '/img/frutas/cebolla.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Fiambres y Embutidos', descripcion: 'Jamones, salchichas y más.' },
        productos: [
          { nombre: 'Jamón Cerdo 200g', descripcion: 'Rebanado.', precio_venta: 16.50, imagen_url: '/img/fiambres/jamon.jpg' },
          { nombre: 'Salchicha Vienesa 1kg', descripcion: 'Paquete familiar.', precio_venta: 22.00, imagen_url: '/img/fiambres/salchicha.jpg' },
          { nombre: 'Mortadela 500g', descripcion: 'Familiar.', precio_venta: 14.00, imagen_url: '/img/fiambres/mortadela.jpg' },
          { nombre: 'Chorizo parrillero', descripcion: 'Para asados.', precio_venta: 18.00, imagen_url: '/img/fiambres/chorizo.jpg' },
          { nombre: 'Tocino', descripcion: 'Ahumado.', precio_venta: 20.00, imagen_url: '/img/fiambres/tocino.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Carnes', descripcion: 'Carne de res, pollo y cerdo.' },
        productos: [
          { nombre: 'Pollo entero', descripcion: 'Pollo congelado.', precio_venta: 28.00, imagen_url: '/img/carnes/pollo.jpg' },
          { nombre: 'Carne Molida 1kg', descripcion: 'De res.', precio_venta: 35.00, imagen_url: '/img/carnes/molida.jpg' },
          { nombre: 'Costilla de res', descripcion: 'Para asado.', precio_venta: 42.00, imagen_url: '/img/carnes/costilla.jpg' },
          { nombre: 'Bistec 1kg', descripcion: 'Corte fino.', precio_venta: 38.00, imagen_url: '/img/carnes/bistec.jpg' },
          { nombre: 'Pierna de cerdo', descripcion: 'Corte fresco.', precio_venta: 33.00, imagen_url: '/img/carnes/cerdo.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Mascotas', descripcion: 'Cuidado animal.' },
        productos: [
          { nombre: 'Alimento perro 3kg', descripcion: 'Sabor carne.', precio_venta: 45.00, imagen_url: '/img/mascotas/perro.jpg' },
          { nombre: 'Alimento gato 1.5kg', descripcion: 'Adultos.', precio_venta: 38.00, imagen_url: '/img/mascotas/gato.jpg' },
          { nombre: 'Arena para gatos 5kg', descripcion: 'Absorbente.', precio_venta: 30.00, imagen_url: '/img/mascotas/arena.jpg' },
          { nombre: 'Snacks para perro', descripcion: 'Premios.', precio_venta: 12.00, imagen_url: '/img/mascotas/snack.jpg' },
          { nombre: 'Collar para perro', descripcion: 'Talla M.', precio_venta: 20.00, imagen_url: '/img/mascotas/collar.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Cuidado Personal', descripcion: 'Belleza e higiene.' },
        productos: [
          { nombre: 'Shampoo H&S', descripcion: 'Anticaspa.', precio_venta: 25.00, imagen_url: '/img/personal/shampoo.jpg' },
          { nombre: 'Jabón Dove', descripcion: 'Hidratante.', precio_venta: 7.00, imagen_url: '/img/personal/dove.jpg' },
          { nombre: 'Crema Nivea', descripcion: 'Hidratante corporal.', precio_venta: 18.00, imagen_url: '/img/personal/nivea.jpg' },
          { nombre: 'Desodorante Rexona', descripcion: 'Spray.', precio_venta: 16.00, imagen_url: '/img/personal/rexona.jpg' },
          { nombre: 'Cepillo dental Colgate', descripcion: 'Ultra suave.', precio_venta: 6.00, imagen_url: '/img/personal/cepillo.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Cuidado del Hogar', descripcion: 'Limpieza y mantenimiento.' },
        productos: [
          { nombre: 'Lavandina 1L', descripcion: 'Desinfectante.', precio_venta: 9.00, imagen_url: '/img/hogar/lavandina.jpg' },
          { nombre: 'Detergente líquido', descripcion: '1L.', precio_venta: 12.00, imagen_url: '/img/hogar/detergente.jpg' },
          { nombre: 'Esponja doble', descripcion: 'Suave y abrasiva.', precio_venta: 4.00, imagen_url: '/img/hogar/esponja.jpg' },
          { nombre: 'Desodorante ambiental', descripcion: 'Lavanda.', precio_venta: 13.00, imagen_url: '/img/hogar/ambiental.jpg' },
          { nombre: 'Jabón para ropa OMO', descripcion: '3L.', precio_venta: 35.00, imagen_url: '/img/hogar/omo.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Panadería', descripcion: 'Pan fresco y dulces.' },
        productos: [
          { nombre: 'Marraqueta', descripcion: 'Unidad.', precio_venta: 0.50, imagen_url: '/img/panaderia/marraqueta.jpg' },
          { nombre: 'Torta chocolate', descripcion: 'Porción.', precio_venta: 8.00, imagen_url: '/img/panaderia/torta.jpg' },
          { nombre: 'Rollos de canela', descripcion: 'Paquete.', precio_venta: 12.00, imagen_url: '/img/panaderia/rollo.jpg' },
          { nombre: 'Pan integral', descripcion: 'Medio kilo.', precio_venta: 6.00, imagen_url: '/img/panaderia/integral.jpg' },
          { nombre: 'Empanada horno', descripcion: 'Carne.', precio_venta: 5.00, imagen_url: '/img/panaderia/empanada.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Bebidas', descripcion: 'Refrescos y aguas.' },
        productos: [
          { nombre: 'Coca-Cola 3L', descripcion: 'Gaseosa.', precio_venta: 13.00, imagen_url: '/img/bebidas/coca.jpg' },
          { nombre: 'Sprite 2L', descripcion: 'Gaseosa.', precio_venta: 10.00, imagen_url: '/img/bebidas/sprite.jpg' },
          { nombre: 'Jugo del Valle 1L', descripcion: 'Durazno.', precio_venta: 12.00, imagen_url: '/img/bebidas/valle.jpg' },
          { nombre: 'Agua Vital 2L', descripcion: 'Sin gas.', precio_venta: 7.00, imagen_url: '/img/bebidas/vital.jpg' },
          { nombre: 'Fanta 2L', descripcion: 'Naranja.', precio_venta: 10.00, imagen_url: '/img/bebidas/fanta.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Snacks', descripcion: 'Piqueos y dulces.' },
        productos: [
          { nombre: 'Doritos 90g', descripcion: 'Queso.', precio_venta: 8.00, imagen_url: '/img/snacks/doritos.jpg' },
          { nombre: 'Maní salado 200g', descripcion: 'Bolsa.', precio_venta: 7.00, imagen_url: '/img/snacks/mani.jpg' },
          { nombre: 'Oreo 120g', descripcion: 'Clásicas.', precio_venta: 6.00, imagen_url: '/img/snacks/oreo.jpg' },
          { nombre: 'Chizitos 90g', descripcion: 'Queso.', precio_venta: 5.00, imagen_url: '/img/snacks/chizitos.jpg' },
          { nombre: 'Pringles', descripcion: 'Original.', precio_venta: 16.00, imagen_url: '/img/snacks/pringles.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Lácteos', descripcion: 'Quesos, yogures y leche.' },
        productos: [
          { nombre: 'Leche Pil 1L', descripcion: 'Entera.', precio_venta: 7.00, imagen_url: '/img/lacteos/leche.jpg' },
          { nombre: 'Yogurt Pil 1L', descripcion: 'Frutilla.', precio_venta: 10.00, imagen_url: '/img/lacteos/yogurt.jpg' },
          { nombre: 'Queso mozzarella 1kg', descripcion: 'Fresco.', precio_venta: 40.00, imagen_url: '/img/lacteos/mozzarella.jpg' },
          { nombre: 'Mantequilla Pil', descripcion: '200g.', precio_venta: 12.00, imagen_url: '/img/lacteos/mantequilla.jpg' },
          { nombre: 'Queso criollo', descripcion: 'Medio kilo.', precio_venta: 25.00, imagen_url: '/img/lacteos/criollo.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Cuidado del Bebé', descripcion: 'Productos para bebés.' },
        productos: [
          { nombre: 'Pañales Huggies G', descripcion: '30 unidades.', precio_venta: 40.00, imagen_url: '/img/bebe/panales.jpg' },
          { nombre: 'Toallitas húmedas', descripcion: '80 unidades.', precio_venta: 12.00, imagen_url: '/img/bebe/toallitas.jpg' },
          { nombre: 'Shampoo bebé', descripcion: 'Suave.', precio_venta: 14.00, imagen_url: '/img/bebe/shampoo.jpg' },
          { nombre: 'Crema para bebé', descripcion: 'Suavizante.', precio_venta: 18.00, imagen_url: '/img/bebe/crema.jpg' },
          { nombre: 'Talco para bebé', descripcion: 'Clásico.', precio_venta: 10.00, imagen_url: '/img/bebe/talco.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Congelados', descripcion: 'Productos congelados.' },
        productos: [
          { nombre: 'Pizza congelada', descripcion: 'Familiar.', precio_venta: 35.00, imagen_url: '/img/congelados/pizza.jpg' },
          { nombre: 'Nuggets Dino 1kg', descripcion: 'Congelados.', precio_venta: 65.00, imagen_url: '/img/congelados/nuggets.jpg' },
          { nombre: 'Papas fritas 1kg', descripcion: 'Precocidas.', precio_venta: 18.00, imagen_url: '/img/congelados/papas.jpg' },
          { nombre: 'Verduras mixtas 1kg', descripcion: 'Congeladas.', precio_venta: 14.00, imagen_url: '/img/congelados/verduras.jpg' },
          { nombre: 'Helado vainilla 1L', descripcion: 'Clásico.', precio_venta: 20.00, imagen_url: '/img/congelados/helado.jpg' },
        ]
      }
    ];

    // RECORRER Y GUARDAR TODO
    for (const group of dataToInsert) {
      const savedCat = await categoryRepo.save(group.categoria);

      for (const prodData of group.productos) {
        const newProd = new Product();
        Object.assign(newProd, prodData);
        const savedProd = await this.productService.createProduct(newProd);

        await this.productCategoryService.assignCategoryToProduct({
          id_producto: savedProd.id_producto,
          id_categoria: savedCat.id_categoria
        });
      }
    }

    console.log('✨ Seed completo.');
  }
}
 */}



import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../productcategory/productcategory.service';
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity'; 
import { AppDataSource } from 'src/data-source'; // ⬅️ Usamos TU conexión

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  // Se ejecuta automáticamente al iniciar el servidor
  async onModuleInit() {
    // Esperamos un momento para asegurar que la BD conectó
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await this.seedDatabase();
  }

  async seedDatabase() {
    // 1. Verificación: Si ya hay productos, no hacemos nada.
    const products = await this.productService.getAllProducts();
    if (products.length > 0) {
      console.log('✅ La base de datos ya tiene datos. Seed omitido.');
      return;
    }

    console.log('🌱 Iniciando Sembrado (Seed) completo...');

    // 2. Obtenemos el repositorio directamente de tu DataSource
    const categoryRepo = AppDataSource.getRepository(Category);

    // 📦 DATOS MAESTROS (Categorías + Sus Productos)
    const dataToInsert = [
      {
        categoria: { nombre: 'Frutas y Verduras', descripcion: 'Productos frescos del campo.' },
        productos: [
          { nombre: 'Manzana Roja 1kg', descripcion: 'Manzana fresca por kilogramo.', precio_venta: 10.00, imagen_url: '/images/frutas/manzana.jpg', stock_actual: 50, estado_producto: true },
          { nombre: 'Banana 1kg', descripcion: 'Bananas frescas por kg.', precio_venta: 8.00, imagen_url: '/images/frutas/banana.jpg', stock_actual: 60, estado_producto: true },
          { nombre: 'Tomate 1kg', descripcion: 'Tomate fresco de huerta.', precio_venta: 6.50, imagen_url: '/images/frutas/tomate.jpg', stock_actual: 40, estado_producto: true },
          { nombre: 'Lechuga', descripcion: 'Lechuga fresca lista para ensaladas.', precio_venta: 5.00, imagen_url: '/images/frutas/lechuga.jpg', stock_actual: 30, estado_producto: true },
          { nombre: 'Cebolla 1kg', descripcion: 'Cebolla blanca por kilogramo.', precio_venta: 4.50, imagen_url: '/images/frutas/cebolla.jpg', stock_actual: 45, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Carnes y Embutidos', descripcion: 'Carnes rojas, pollo, pescado y embutidos frescos.' },
        productos: [
          { nombre: 'Pollo entero', descripcion: 'Pollo entero congelado.', precio_venta: 28.00, imagen_url: '/images/carnes/pollo.jpg', stock_actual: 20, estado_producto: true },
          { nombre: 'Carne molida 1kg', descripcion: 'Carne molida de res premium.', precio_venta: 35.00, imagen_url: '/images/carnes/molida.jpg', stock_actual: 25, estado_producto: true },
          { nombre: 'Bife de res 1kg', descripcion: 'Corte especial para parrilla.', precio_venta: 52.00, imagen_url: '/images/carnes/bife.jpg', stock_actual: 15, estado_producto: true },
          { nombre: 'Jamón de cerdo 200g', descripcion: 'Jamón rebanado ideal para sándwich.', precio_venta: 16.50, imagen_url: '/images/fiambres/jamon.jpg', stock_actual: 50, estado_producto: true },
          { nombre: 'Salchicha Vienesa 1kg', descripcion: 'Paquete familiar de salchichas.', precio_venta: 22.00, imagen_url: '/images/fiambres/salchicha.jpg', stock_actual: 30, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Lácteos y Huevos', descripcion: 'Leche, quesos, yogures y huevos.' },
        productos: [
          { nombre: 'Leche Pil 1L', descripcion: 'Leche entera pasteurizada.', precio_venta: 7.00, imagen_url: '/images/lacteos/leche.jpg', stock_actual: 100, estado_producto: true },
          { nombre: 'Queso cheddar 200g', descripcion: 'Queso cheddar en láminas.', precio_venta: 18.00, imagen_url: '/images/fiambres/cheddar.jpg', stock_actual: 40, estado_producto: true },
          { nombre: 'Yogurt Bebible 1L', descripcion: 'Sabor frutilla.', precio_venta: 10.00, imagen_url: '/images/lacteos/yogurt.jpg', stock_actual: 60, estado_producto: true },
          { nombre: 'Mantequilla Pil 200g', descripcion: 'Mantequilla con sal.', precio_venta: 12.00, imagen_url: '/images/lacteos/mantequilla.jpg', stock_actual: 35, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Bebidas y Refrescos', descripcion: 'Gaseosas, jugos, agua y bebidas energizantes.' },
        productos: [
          { nombre: 'Coca-Cola 3L', descripcion: 'Refresco gaseoso sabor cola.', precio_venta: 13.00, imagen_url: '/images/bebidas/coca.jpg', stock_actual: 120, estado_producto: true },
          { nombre: 'Sprite 2L', descripcion: 'Refresco sabor lima-limón.', precio_venta: 10.00, imagen_url: '/images/bebidas/sprite.jpg', stock_actual: 80, estado_producto: true },
          { nombre: 'Jugos del Valle 1L', descripcion: 'Jugo sabor durazno.', precio_venta: 12.00, imagen_url: '/images/bebidas/valle.jpg', stock_actual: 60, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Limpieza del Hogar', descripcion: 'Detergentes, jabones y utensilios de limpieza.' },
        productos: [
          { nombre: 'Lavandina 1L', descripcion: 'Desinfectante multiuso.', precio_venta: 9.00, imagen_url: '/images/hogar/lavandina.jpg', stock_actual: 50, estado_producto: true },
          { nombre: 'Detergente líquido 1L', descripcion: 'Para ropa y superficies.', precio_venta: 12.00, imagen_url: '/images/hogar/detergente.jpg', stock_actual: 45, estado_producto: true },
          { nombre: 'Ambientador Glade', descripcion: 'Aroma lavanda en aerosol.', precio_venta: 18.00, imagen_url: '/images/hogar/glade.jpg', stock_actual: 30, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Mascotas', descripcion: 'Alimento y cuidado para perros y gatos.' },
        productos: [
          { nombre: 'Alimento perro 3kg', descripcion: 'Croquetas sabor carne para adultos.', precio_venta: 45.00, imagen_url: '/images/mascotas/perro.jpg', stock_actual: 20, estado_producto: true },
          { nombre: 'Alimento gato 1.5kg', descripcion: 'Alimento balanceado para gatos.', precio_venta: 38.00, imagen_url: '/images/mascotas/gato.jpg', stock_actual: 20, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Panadería', descripcion: 'Pan fresco, tortas y masitas.' },
        productos: [
          { nombre: 'Pan marraqueta', descripcion: 'Pan de batalla tradicional (Unidad).', precio_venta: 0.50, imagen_url: '/images/panaderia/marraqueta.jpg', stock_actual: 200, estado_producto: true },
          { nombre: 'Pan molde 500g', descripcion: 'Pan blanco para sándwich.', precio_venta: 12.00, imagen_url: '/images/panaderia/molde.jpg', stock_actual: 30, estado_producto: true },
          { nombre: 'Torta de chocolate', descripcion: 'Porción individual de torta.', precio_venta: 8.00, imagen_url: '/images/panaderia/torta.jpg', stock_actual: 15, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Congelados', descripcion: 'Alimentos listos para calentar o cocinar.' },
        productos: [
          { nombre: 'Nuggets Dino 1kg', descripcion: 'Nuggets de pollo congelados.', precio_venta: 65.00, imagen_url: '/images/congelados/nuggets.jpg', stock_actual: 25, estado_producto: true },
          { nombre: 'Pizza congelada', descripcion: 'Pizza de jamón y queso lista para hornear.', precio_venta: 35.00, imagen_url: '/images/congelados/pizza.jpg', stock_actual: 15, estado_producto: true },
          { nombre: 'Helado vainilla 1L', descripcion: 'Postre helado familiar.', precio_venta: 22.00, imagen_url: '/images/congelados/helado.jpg', stock_actual: 20, estado_producto: true },
        ]
      }
    ];

    // 🔄 BUCLE DE INSERCIÓN
    for (const group of dataToInsert) {
      // PASO 1: Crear la Categoría
      // Usamos el repositorio manual, no inyectado
      const newCat = categoryRepo.create(group.categoria);
      const savedCat = await categoryRepo.save(newCat);
      console.log(`📂 Categoría creada: ${savedCat.nombre} (ID: ${savedCat.id_categoria})`);

      // PASO 2: Crear los Productos de esa categoría
      for (const prodData of group.productos) {
        
        // Creamos una instancia de Product y asignamos los datos
        const newProd = new Product();
        Object.assign(newProd, prodData);
        
        // Guardamos el producto usando ProductService (que ya usa AppDataSource internamente)
        const savedProd = await this.productService.createProduct(newProd);

        // PASO 3: Vincular Producto con Categoría
        await this.productCategoryService.assignCategoryToProduct({
            id_producto: savedProd.id_producto,
            id_categoria: savedCat.id_categoria
        });
        
        console.log(`   ➞ Producto "${savedProd.nombre}" vinculado a "${savedCat.nombre}"`);
      }
    }

    console.log('✨ Seed completado con éxito. Base de datos lista para usar.');
  }
}
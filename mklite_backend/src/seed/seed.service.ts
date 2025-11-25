import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../productcategory/productcategory.service';
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity'; 
import { AppDataSource } from 'src/data-source'; 

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly productCategoryService: ProductCategoryService,
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

    // dATOS MAESTROS (Categorías + Sus Productos)
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
        categoria: { nombre: 'Fiambres y Embutidos', descripcion: 'Jamones, salchichas y más.' },
        productos: [
          { nombre: 'Jamón Cerdo 200g', descripcion: 'Rebanado.', precio_venta: 16.50, imagen_url: '/images/fiambres/jamon.jpg' },
          { nombre: 'Salchicha Vienesa 1kg', descripcion: 'Paquete familiar.', precio_venta: 22.00, imagen_url: '/images/fiambres/salchicha.jpg' },
          { nombre: 'Mortadela 500g', descripcion: 'Familiar.', precio_venta: 14.00, imagen_url: '/images/fiambres/mortadela.jpg' },
          { nombre: 'Chorizo parrillero', descripcion: 'Para asados.', precio_venta: 18.00, imagen_url: '/images/fiambres/chorizo.jpg' },
          { nombre: 'Tocino', descripcion: 'Ahumado.', precio_venta: 20.00, imagen_url: '/images/fiambres/tocino.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Lácteos', descripcion: 'Leche, quesos, yogures y huevos.' },
        productos: [
          { nombre: 'Leche Pil 1L', descripcion: 'Leche entera pasteurizada.', precio_venta: 7.00, imagen_url: '/images/lacteos/leche.jpg', stock_actual: 100, estado_producto: true },
          { nombre: 'Queso cheddar 200g', descripcion: 'Queso cheddar en láminas.', precio_venta: 18.00, imagen_url: '/images/fiambres/cheddar.jpg', stock_actual: 40, estado_producto: true },
          { nombre: 'Yogurt Bebible 1L', descripcion: 'Sabor frutilla.', precio_venta: 10.00, imagen_url: '/images/lacteos/yogurt.jpg', stock_actual: 60, estado_producto: true },
          { nombre: 'Mantequilla Pil 200g', descripcion: 'Mantequilla con sal.', precio_venta: 12.00, imagen_url: '/images/lacteos/mantequilla.jpg', stock_actual: 35, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Bebidas', descripcion: 'Gaseosas, jugos, agua y bebidas energizantes.' },
        productos: [
          { nombre: 'Coca-Cola 3L', descripcion: 'Refresco gaseoso sabor cola.', precio_venta: 13.00, imagen_url: '/images/bebidas/CocaCola-3l.png', stock_actual: 120, estado_producto: true },
          { nombre: 'Sprite 2L', descripcion: 'Refresco sabor lima-limón.', precio_venta: 10.00, imagen_url: '/images/bebidas/sprite.jpg', stock_actual: 80, estado_producto: true },
          { nombre: 'Jugos del Valle 1L', descripcion: 'Jugo sabor durazno.', precio_venta: 12.00, imagen_url: '/images/bebidas/valle.jpg', stock_actual: 60, estado_producto: true },
        ]
      },
      {
        categoria: { nombre: 'Cuidado del Hogar', descripcion: 'Detergentes, jabones y utensilios de limpieza.' },
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
        categoria: { nombre: 'Panaderia', descripcion: 'Pan fresco, tortas y masitas.' },
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
      },
      {
        categoria: { nombre: 'Snacks', descripcion: 'Piqueos y dulces.' },
        productos: [
          { nombre: 'Doritos 90g', descripcion: 'Queso.', precio_venta: 8.00, imagen_url: '/images/snacks/doritos.jpg' },
          { nombre: 'Maní salado 200g', descripcion: 'Bolsa.', precio_venta: 7.00, imagen_url: '/images/snacks/mani.jpg' },
          { nombre: 'Oreo 120g', descripcion: 'Clásicas.', precio_venta: 6.00, imagen_url: '/images/snacks/oreo.jpg' },
          { nombre: 'Chizitos 90g', descripcion: 'Queso.', precio_venta: 5.00, imagen_url: '/images/snacks/chizitos.jpg' },
          { nombre: 'Pringles', descripcion: 'Original.', precio_venta: 16.00, imagen_url: '/images/snacks/pringles.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Carnes', descripcion: 'Carne de res, pollo y cerdo.' },
        productos: [
          { nombre: 'Pollo entero', descripcion: 'Pollo congelado.', precio_venta: 28.00, imagen_url: '/images/carnes/pollo.jpg' },
          { nombre: 'Carne Molida 1kg', descripcion: 'De res.', precio_venta: 35.00, imagen_url: '/images/carnes/molida.jpg' },
          { nombre: 'Costilla de res', descripcion: 'Para asado.', precio_venta: 42.00, imagen_url: '/images/carnes/costilla.jpg' },
          { nombre: 'Bistec 1kg', descripcion: 'Corte fino.', precio_venta: 38.00, imagen_url: '/images/carnes/bistec.jpg' },
          { nombre: 'Pierna de cerdo', descripcion: 'Corte fresco.', precio_venta: 33.00, imagen_url: '/images/carnes/cerdo.jpg' },
        ]
      },
      {
        categoria: { nombre: 'Cuidado Personal', descripcion: 'Belleza e higiene.' },
        productos: [
          { nombre: 'Shampoo H&S', descripcion: 'Anticaspa.', precio_venta: 25.00, imagen_url: '/images/personal/shampoo.jpg' },
          { nombre: 'Jabón Dove', descripcion: 'Hidratante.', precio_venta: 7.00, imagen_url: '/images/personal/dove.jpg' },
          { nombre: 'Crema Nivea', descripcion: 'Hidratante corporal.', precio_venta: 18.00, imagen_url: '/images/personal/nivea.jpg' },
          { nombre: 'Desodorante Rexona', descripcion: 'Spray.', precio_venta: 16.00, imagen_url: '/images/personal/rexona.jpg' },
          { nombre: 'Cepillo dental Colgate', descripcion: 'Ultra suave.', precio_venta: 6.00, imagen_url: '/images/personal/cepillo.jpg' },
        ]
      },
       {
        categoria: { nombre: 'Cuidado del Bebé', descripcion: 'Productos para bebés.' },
        productos: [
          { nombre: 'Pañales Huggies G', descripcion: '30 unidades.', precio_venta: 40.00, imagen_url: '/images/bebe/panales.jpg' },
          { nombre: 'Toallitas húmedas', descripcion: '80 unidades.', precio_venta: 12.00, imagen_url: '/images/bebe/toallitas.jpg' },
          { nombre: 'Shampoo bebé', descripcion: 'Suave.', precio_venta: 14.00, imagen_url: '/images/bebe/shampoo.jpg' },
          { nombre: 'Crema para bebé', descripcion: 'Suavizante.', precio_venta: 18.00, imagen_url: '/images/bebe/crema.jpg' },
          { nombre: 'Talco para bebé', descripcion: 'Clásico.', precio_venta: 10.00, imagen_url: '/images/bebe/talco.jpg' },
        ]
      },
    ];

    // BUCLE DE INSERCIÓN
    for (const group of dataToInsert) {
      // Crear la Categoría
      const newCat = categoryRepo.create(group.categoria);
      const savedCat = await categoryRepo.save(newCat);
      console.log(` Categoría creada: ${savedCat.nombre} (ID: ${savedCat.id_categoria})`);

      for (const prodData of group.productos) {
        const newProd = new Product();
        Object.assign(newProd, prodData);
        
        // guarda el producto usando ProductService (que ya usa AppDataSource internamente)
        const savedProd = await this.productService.createProduct(newProd);

       
        await this.productCategoryService.assignCategoryToProduct({
            id_producto: savedProd.id_producto,
            id_categoria: savedCat.id_categoria
        });
        
        console.log(` Producto "${savedProd.nombre}" vinculado a "${savedCat.nombre}"`);
      }
    }

    console.log('Seed completado con éxito. Base de datos lista para usar.');
  }
}
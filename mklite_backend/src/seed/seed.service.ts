import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProductService } from '../product/product.service';
import { ProductCategoryService } from '../productcategory/productcategory.service';
import { InventoryService } from '../inventory/inventory.service';
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity';
import { AppDataSource } from 'src/data-source';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly productService: ProductService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly inventoryService: InventoryService,
  ) {}

  async onModuleInit() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await this.seedDatabase();
  }

  async seedDatabase() {
    console.log('Iniciando Sembrado (Seed) completo...');

    // 1) Productos, categorías, inventario (tu lógica actual)
    await this.seedProductsCategoriesInventory();

    // 2) Usuarios, roles y relación
    await this.seedUsersAndRoles();

    // 3) Proveedores y lotes
    await this.seedProveedoresYLotes();

    // 4) Descuentos y relación con producto
    await this.seedDescuentos();

    // 5) Carrito + carrito_item
    await this.seedCarrito();

    // 6) Favoritos de usuario
    await this.seedFavoritos();

    // 7) Pedido + pedido_item + envio
    await this.seedPedidoYEnvio();

    // 8) Reembolso + devolucion_item
    await this.seedReembolsoYDevolucion();

    // 9) Chat + mensajes
    await this.seedChatYMensajes();

    // 10) Sanción de usuario
    await this.seedSancionUsuario();

    // 11) Alertas de stock
    await this.seedAlertasStock();

    console.log('Seed completado con éxito. Base de datos lista.');
  }

  // ----------------------------------------------------------------
  // 1) Productos, categorías, inventario (TU CÓDIGO, solo sin return)
  // ----------------------------------------------------------------
  private async seedProductsCategoriesInventory() {
    const products = await this.productService.getAllProducts();
    if (products.length > 0) {
      console.log('La base de datos ya tiene productos. Seed de productos omitido.');
      return;
    }

    console.log('Sembrando categorías, productos e inventario...');

    const categoryRepo = AppDataSource.getRepository(Category);

    
    const dataToInsert = [
    {
      categoria: { nombre: 'Frutas y Verduras', descripcion: 'Productos frescos del campo.' },
      productos: [
        { nombre: 'Manzana Roja 1kg', descripcion: 'Manzana fresca por kilogramo.', precio_venta: 10.00, imagen_url: '/images/frutas/manzana.jpg', stock_inicial: 50 },
        { nombre: 'Banana 1kg', descripcion: 'Bananas frescas por kg.', precio_venta: 8.00, imagen_url: '/images/frutas/banana.jpg', stock_inicial: 60 },
        { nombre: 'Tomate 1kg', descripcion: 'Tomate fresco de huerta.', precio_venta: 6.50, imagen_url: '/images/frutas/tomate.jpg', stock_inicial: 40 },
        { nombre: 'Lechuga', descripcion: 'Lechuga fresca lista para ensaladas.', precio_venta: 5.00, imagen_url: '/images/frutas/lechuga.jpg', stock_inicial: 30 },
        { nombre: 'Cebolla 1kg', descripcion: 'Cebolla blanca por kilogramo.', precio_venta: 4.50, imagen_url: '/images/frutas/cebolla.jpg', stock_inicial: 45 },
      ],
    },
    {
      categoria: { nombre: 'Fiambres y Embutidos', descripcion: 'Jamones, salchichas y más.' },
      productos: [
        { nombre: 'Jamón Cerdo 200g', descripcion: 'Rebanado.', precio_venta: 16.50, imagen_url: '/images/fiambres/jamon.jpg', stock_inicial: 20 },
        { nombre: 'Salchicha Vienesa 1kg', descripcion: 'Paquete familiar.', precio_venta: 22.00, imagen_url: '/images/fiambres/salchicha.jpg', stock_inicial: 25 },
        { nombre: 'Mortadela 500g', descripcion: 'Familiar.', precio_venta: 14.00, imagen_url: '/images/fiambres/mortadela.jpg', stock_inicial: 30 },
        { nombre: 'Chorizo parrillero', descripcion: 'Para asados.', precio_venta: 18.00, imagen_url: '/images/fiambres/chorizo.jpg', stock_inicial: 15 },
        { nombre: 'Tocino', descripcion: 'Ahumado.', precio_venta: 20.00, imagen_url: '/images/fiambres/tocino.jpg', stock_inicial: 10 },
      ],
    },
    {
      categoria: { nombre: 'Lácteos', descripcion: 'Leche, quesos, yogures y huevos.' },
      productos: [
        { nombre: 'Leche Pil 1L', descripcion: 'Leche entera pasteurizada.', precio_venta: 7.00, imagen_url: '/images/lacteos/leche.jpg', stock_inicial: 100 },
        { nombre: 'Queso cheddar 200g', descripcion: 'Queso cheddar en láminas.', precio_venta: 18.00, imagen_url: '/images/fiambres/cheddar.jpg', stock_inicial: 40 },
        { nombre: 'Yogurt Bebible 1L', descripcion: 'Sabor frutilla.', precio_venta: 10.00, imagen_url: '/images/lacteos/yogurt.jpg', stock_inicial: 60 },
        { nombre: 'Mantequilla Pil 200g', descripcion: 'Mantequilla con sal.', precio_venta: 12.00, imagen_url: '/images/lacteos/mantequilla.jpg', stock_inicial: 35 },
      ],
    },
    {
      categoria: { nombre: 'Bebidas', descripcion: 'Gaseosas, jugos, agua y bebidas energizantes.' },
      productos: [
        { nombre: 'Coca-Cola 3L', descripcion: 'Refresco gaseoso sabor cola.', precio_venta: 13.00, imagen_url: '/images/bebidas/CocaCola-3l.png', stock_inicial: 120 },
        { nombre: 'Sprite 2L', descripcion: 'Refresco sabor lima-limón.', precio_venta: 10.00, imagen_url: '/images/bebidas/sprite.jpg', stock_inicial: 80 },
        { nombre: 'Jugos del Valle 1L', descripcion: 'Jugo sabor durazno.', precio_venta: 12.00, imagen_url: '/images/bebidas/valle.jpg', stock_inicial: 60 },
      ],
    },

    // ---------------- SNACKS ----------------
    {
      categoria: { nombre: 'Snacks', descripcion: 'Tus piqueos favoritos para cualquier momento.' },
      productos: [
        { nombre: 'Doritos 90g', descripcion: 'Nachos sabor queso.', precio_venta: 8.00, imagen_url: '/images/snacks/doritos.jpg', stock_inicial: 40 },
        { nombre: 'Maní salado 200g', descripcion: 'Bolsa de maní salado.', precio_venta: 7.00, imagen_url: '/images/snacks/mani.jpg', stock_inicial: 35 },
        { nombre: 'Oreo 120g', descripcion: 'Galletas Oreo clásicas.', precio_venta: 6.00, imagen_url: '/images/snacks/oreo.jpg', stock_inicial: 50 },
        { nombre: 'Chizitos 90g', descripcion: 'Snacks de queso.', precio_venta: 5.00, imagen_url: '/images/snacks/chizitos.jpg', stock_inicial: 45 },
        { nombre: 'Pringles', descripcion: 'Papas fritas en tubo, sabor original.', precio_venta: 16.00, imagen_url: '/images/snacks/pringles.jpg', stock_inicial: 30 },
      ],
    },

    // ---------------- MASCOTAS ----------------
    {
      categoria: { nombre: 'Mascotas', descripcion: 'Lo mejor para tus amigos peludos.' },
      productos: [
        { nombre: 'Alimento perro 3kg', descripcion: 'Croquetas sabor carne para perros adultos.', precio_venta: 45.00, imagen_url: '/images/mascotas/perro.jpg', stock_inicial: 25 },
        { nombre: 'Alimento gato 1.5kg', descripcion: 'Alimento balanceado para gatos.', precio_venta: 38.00, imagen_url: '/images/mascotas/gato.jpg', stock_inicial: 20 },
      ],
    },

    // ---------------- PANADERÍA ----------------
    {
      categoria: { nombre: 'Panadería', descripcion: 'Pan fresco y horneados deliciosos.' },
      productos: [
        { nombre: 'Pan marraqueta', descripcion: 'Pan de batalla tradicional (unidad).', precio_venta: 0.50, imagen_url: '/images/panaderia/marraqueta.jpg', stock_inicial: 200 },
        { nombre: 'Pan molde 500g', descripcion: 'Pan blanco para sándwich.', precio_venta: 12.00, imagen_url: '/images/panaderia/molde.jpg', stock_inicial: 60 },
        { nombre: 'Torta de chocolate', descripcion: 'Porción individual de torta de chocolate.', precio_venta: 8.00, imagen_url: '/images/panaderia/torta.jpg', stock_inicial: 30 },
      ],
    },

    // ---------------- CUIDADO DEL HOGAR ----------------
    {
      categoria: { nombre: 'Cuidado del Hogar', descripcion: 'Mantén tu espacio limpio y fresco.' },
      productos: [
        { nombre: 'Lavandina 1L', descripcion: 'Desinfectante multiuso.', precio_venta: 9.00, imagen_url: '/images/hogar/lavandina.jpg', stock_inicial: 40 },
        { nombre: 'Detergente líquido 1L', descripcion: 'Detergente líquido para ropa y superficies.', precio_venta: 12.00, imagen_url: '/images/hogar/detergente.jpg', stock_inicial: 35 },
        { nombre: 'Ambientador Glade', descripcion: 'Aroma lavanda en aerosol.', precio_venta: 18.00, imagen_url: '/images/hogar/glade.jpg', stock_inicial: 25 },
      ],
    },

    // ---------------- CUIDADO PERSONAL ----------------
    {
      categoria: { nombre: 'Cuidado Personal', descripcion: 'Productos para tu higiene diaria.' },
      productos: [
        { nombre: 'Shampoo H&S', descripcion: 'Anticaspa.', precio_venta: 25.00, imagen_url: '/images/personal/shampoo.jpg', stock_inicial: 40 },
        { nombre: 'Jabón Dove', descripcion: 'Hidratante.', precio_venta: 7.00, imagen_url: '/images/personal/dove.jpg', stock_inicial: 60 },
        { nombre: 'Crema Nivea', descripcion: 'Hidratante corporal.', precio_venta: 18.00, imagen_url: '/images/personal/nivea.jpg', stock_inicial: 30 },
        { nombre: 'Desodorante Rexona', descripcion: 'Spray.', precio_venta: 16.00, imagen_url: '/images/personal/rexona.jpg', stock_inicial: 45 },
        { nombre: 'Cepillo dental Colgate', descripcion: 'Ultra suave.', precio_venta: 6.00, imagen_url: '/images/personal/cepillo.jpg', stock_inicial: 70 }
      ],
    },

    // ---------------- CONGELADOS ----------------
    {
      categoria: { nombre: 'Congelados', descripcion: 'Soluciones rápidas y ricas.' },
      productos: [
        { nombre: 'Nuggets Dino 1kg', descripcion: 'Nuggets de pollo congelados.', precio_venta: 65.00, imagen_url: '/images/congelados/nuggets.jpg', stock_inicial: 35 },
        { nombre: 'Pizza congelada', descripcion: 'Pizza de jamón y queso lista para hornear.', precio_venta: 35.00, imagen_url: '/images/congelados/pizza.jpg', stock_inicial: 40 },
        { nombre: 'Helado vainilla 1L', descripcion: 'Postre helado familiar.', precio_venta: 22.00, imagen_url: '/images/congelados/helado.jpg', stock_inicial: 50 }
      ],
    },

    // CUIDADO DEL BEBE
    {
      categoria: { nombre: 'Cuidado del Bebé', descripcion: 'Productos delicados para tu bebé.' },
      productos: [
        { nombre: 'Pañales Huggies G', descripcion: '30 unidades.', precio_venta: 40.00, imagen_url: '/images/bebe/panales.jpg', stock_inicial: 50 },
        { nombre: 'Toallitas húmedas', descripcion: '80 unidades.', precio_venta: 12.00, imagen_url: '/images/bebe/toallitas.jpg', stock_inicial: 70 },
        { nombre: 'Shampoo bebé', descripcion: 'Suave.', precio_venta: 14.00, imagen_url: '/images/bebe/shampoo.jpg', stock_inicial: 45 },
        { nombre: 'Crema para bebé', descripcion: 'Suavizante.', precio_venta: 18.00, imagen_url: '/images/bebe/crema.jpg', stock_inicial: 35 },
        { nombre: 'Talco para bebé', descripcion: 'Clásico.', precio_venta: 10.00, imagen_url: '/images/bebe/talco.jpg', stock_inicial: 60 }
      ],
    },

    //CARNES
    {
      categoria: { nombre: 'Carnes', descripcion: 'Productos frescos cárnicos y avícolas.' },
      productos: [
        {
          nombre: 'Pollo entero',
          descripcion: 'Pollo congelado.',
          precio_venta: 28.00,
          imagen_url: '/images/carnes/pollo.jpg',
          stock_inicial: 40
        },
        {
          nombre: 'Carne Molida 1kg',
          descripcion: 'De res.',
          precio_venta: 35.00,
          imagen_url: '/images/carnes/molida.jpg',
          stock_inicial: 50
        },
        {
          nombre: 'Costilla de res',
          descripcion: 'Para asado.',
          precio_venta: 42.00,
          imagen_url: '/images/carnes/costilla.jpg',
          stock_inicial: 30
        },
        {
          nombre: 'Bistec 1kg',
          descripcion: 'Corte fino.',
          precio_venta: 38.00,
          imagen_url: '/images/carnes/bistec.jpg',
          stock_inicial: 25
        },
        {
          nombre: 'Pierna de cerdo',
          descripcion: 'Corte fresco.',
          precio_venta: 33.00,
          imagen_url: '/images/carnes/cerdo.jpg',
          stock_inicial: 35
        }
      ],
    },

  ];


    for (const group of dataToInsert) {
      const newCat = categoryRepo.create(group.categoria);
      const savedCat = await categoryRepo.save(newCat);
      console.log(` Categoría creada: ${savedCat.nombre}`);

      for (const prodData of group.productos) {
        const { stock_inicial, ...productOnlyData } = prodData;

        const newProd = new Product();
        Object.assign(newProd, productOnlyData);

        const savedProd = await this.productService.createProduct(newProd);

        await this.productCategoryService.assignCategoryToProduct({
          id_producto: savedProd.id_producto,
          id_categoria: savedCat.id_categoria,
        });

        if (stock_inicial !== undefined) {
          await this.inventoryService.setInventory(savedProd.id_producto, {
            stock_disponible: stock_inicial,
            stock_reservado: 0,
            stock_minimo: 5,
            stock_vencido: 0,
            stock_danado: 0,
          });
        }

        console.log(`   -> Producto "${savedProd.nombre}" creado con stock: ${stock_inicial}`);
      }
    }

    console.log('Seed de productos/categorías/inventario completado.');
  }

  // ----------------------------------------------------------------
  // 2) Usuarios, roles, usuario_rol
  // ----------------------------------------------------------------
 private async seedUsersAndRoles() {
  console.log('Sembrando roles y usuarios...');

  // Crear los hashes
  const adminPass = await bcrypt.hash('Admin123!', 10);
  const repartidorPass = await bcrypt.hash('Repartidor123!', 10);
  const clientePass = await bcrypt.hash('Cliente123!', 10);

  await AppDataSource.query(`
    INSERT INTO rol (id_rol, nombre) VALUES
      (1, 'ADMIN'),
      (2, 'REPARTIDOR'),
      (3, 'CLIENTE')
    ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
  `);

  await AppDataSource.query(
    `
      INSERT INTO usuario (
        id_usuario, nombre, apellido, ci, email, password,
        telefono, direccion, estado_cuenta, es_admin_principal, fecha_registro
      ) VALUES
        (1, 'Admin', 'Principal', '10000001', 'admin@mklite.com', ?, '70000001', 'Calle Admin 123', 'activo', 1, NOW()),
        (2, 'Carlos', 'Repartidor', '10000002', 'repartidor@mklite.com', ?, '70000002', 'Zona Repartidores', 'activo', 0, NOW()),
        (3, 'Lucía', 'Cliente', '10000003', 'cliente@mklite.com', ?, '70000003', 'Zona Clientes', 'activo', 0, NOW()),
        (4, 'Andrés', 'Mendoza', '10000004', 'andres@mklite.com', ?, '70000004', 'Barrio Lomas 55', 'activo', 0, NOW()),
        (5, 'Valeria', 'Soto', '10000005', 'valeria@mklite.com', ?, '70000005', 'Residencial Norte 22', 'activo', 0, NOW()),
        (6, 'Diego', 'Rivas', '10000006', 'diego@mklite.com', ?, '70000006', 'Condominio Central 3B', 'activo', 0, NOW()),
        (7, 'Mariana', 'Quispe', '10000007', 'repartidor1@mklite.com', ?, '70000007', 'Av. Libertad 123', 'activo', 0, NOW()),
        (8, 'Luis', 'Torres', '10000008', 'repartidor2@mklite.com', ?, '70000008', 'Calle Mayor 88', 'activo', 0, NOW()),
        (9, 'Ana', 'Paredes', '10000009', 'repartidor3@mklite.com', ?, '70000009', 'Zona Sur 101', 'activo', 0, NOW()),
        (10, 'Jorge', 'Vega', '10000010', 'repartidor4@mklite.com', ?, '70000010', 'Villa Nueva 45', 'activo', 0, NOW())
      ON DUPLICATE KEY UPDATE email = VALUES(email);
    `,

    
    [
      adminPass,
      repartidorPass,
      clientePass,
      clientePass,
      clientePass,
      clientePass,
      repartidorPass,
      repartidorPass,
      repartidorPass,
      repartidorPass,
    ],
  );

  await AppDataSource.query(`
    INSERT INTO usuario_rol (id_usuario, id_rol) VALUES
      (1, 1),
      (2, 2),
      (3, 3),
      (4, 3),
      (5, 3),
      (6, 3),
      (7, 2),
      (8, 2),
      (9, 2),
      (10, 2)
    ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);
  `);

  console.log('Roles y usuarios sembrados.');
}

  ////fin seeduserandroles

  // ----------------------------------------------------------------
  // 3) Proveedores y lotes
  // ----------------------------------------------------------------
  private async seedProveedoresYLotes() {
    console.log('Sembrando proveedores y lotes...');

    await AppDataSource.query(`
      INSERT INTO proveedor (id_proveedor, nombre, telefono, email, direccion) VALUES
        (1, 'Distribuidora Central', '29000001', 'central@proveedores.com', 'Av. Principal 123'),
        (2, 'Lácteos Andinos',      '29000002', 'lacteos@proveedores.com',  'Av. Lechera 456')
      ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
    `);

    // necesitamos algunos productos específicos ya creados
    const manzana = await this.findProductByName('Manzana Roja 1kg');
    const leche = await this.findProductByName('Leche Pil 1L');
    const coca = await this.findProductByName('Coca-Cola 3L');
    const jamon = await this.findProductByName('Jamón Cerdo 200g');
    const yogurt = await this.findProductByName('Yogurt Bebible 1L');

    if (!manzana || !leche || !coca || !jamon || !yogurt) {
      console.log('Algunos productos base no encontrados para lotes. Lotes omitidos.');
      return;
    }

    await AppDataSource.query(
      `
      INSERT INTO lote (
        id_lote, id_producto, id_proveedor, fecha_recepcion, fecha_vencimiento,
        costo_unitario, cantidad_inicial, cantidad_disponible, estado_lote
      ) VALUES
        (1, ?, 1, '2025-01-01', '2025-03-01', 6.00, 50, 50, 'activo'),
        (2, ?, 2, '2025-01-05', '2025-04-01', 4.50, 100,100,'activo'),
        (3, ?, 1, '2025-01-02', '2025-06-01', 8.00, 80, 80,'activo'),
        (4, ?, 1, '2025-01-03', '2025-05-01',10.00, 30, 30,'activo'),
        (5, ?, 2, '2025-01-04', '2025-04-15', 6.50, 60, 60,'activo')
      ON DUPLICATE KEY UPDATE estado_lote = VALUES(estado_lote);
      `,
      [manzana.id_producto, leche.id_producto, coca.id_producto, jamon.id_producto, yogurt.id_producto],
    );

    console.log('Proveedores y lotes sembrados.');
  }

  // ----------------------------------------------------------------
  // 4) Descuentos y relación con producto
  // ----------------------------------------------------------------
  private async seedDescuentos() {
    console.log('Sembrando descuentos...');

    await AppDataSource.query(`
      INSERT INTO descuento (
        id_descuento, nombre, fecha_inicio, fecha_final, codigo_cupon,
        porcentaje_descuento, monto_fijo, monto_minimo_compra,
        estado_de_oferta, aplica_a
      ) VALUES
        (1, 'Cupón Verano', '2025-02-01 00:00:00', '2025-03-01 23:59:59', 'VERANO10',
         10.00, 0.00, 0.00, 1, 'ALL')
      ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        fecha_inicio = VALUES(fecha_inicio),
        fecha_final = VALUES(fecha_final),
        codigo_cupon = VALUES(codigo_cupon),
        porcentaje_descuento = VALUES(porcentaje_descuento),
        monto_fijo = VALUES(monto_fijo),
        monto_minimo_compra = VALUES(monto_minimo_compra),
        estado_de_oferta = VALUES(estado_de_oferta),
        aplica_a = VALUES(aplica_a);
    `);

    
    console.log('Descuentos sembrados.');
  }

  // ----------------------------------------------------------------
  // 5) Carrito + carrito_item
  // ----------------------------------------------------------------
  private async seedCarrito() {
    console.log('Sembrando carrito...');

    // carrito de la usuaria cliente (id_usuario = 3)
    await AppDataSource.query(`
      INSERT INTO carrito (
        id_carrito, id_usuario, fecha_creacion, estado, descuento_aplicado
      ) VALUES
        (1, 3, '2025-02-01 09:30:00', 1, 0)
      ON DUPLICATE KEY UPDATE fecha_creacion = VALUES(fecha_creacion);
    `);

    const manzana = await this.findProductByName('Manzana Roja 1kg');
    const coca = await this.findProductByName('Coca-Cola 3L');
    if (!manzana || !coca) {
      console.log('Productos base no encontrados para carrito_item.');
      return;
    }

    await AppDataSource.query(
      `
      INSERT INTO carrito_item (
        id_carrito, id_producto, cantidad, precio_unitario
      ) VALUES
        (1, ?, 2, 10.00),
        (1, ?, 1, 13.00)
      ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad);
      `,
      [manzana.id_producto, coca.id_producto],
    );

    console.log('Carrito sembrado.');
  }

  // ----------------------------------------------------------------
  // 6) Favoritos de usuario
  // ----------------------------------------------------------------
  private async seedFavoritos() {
    console.log('Sembrando favoritos...');

    const manzana = await this.findProductByName('Manzana Roja 1kg');
    const coca = await this.findProductByName('Coca-Cola 3L');
    const pizza = await this.findProductByName('Pizza congelada');
    const yogurt = await this.findProductByName('Yogurt Bebible 1L');
    const pringles = await this.findProductByName('Pringles');
    const lavandina = await this.findProductByName('Lavandina 1L');
    const chorizo = await this.findProductByName('Chorizo parrillero');

    if (!manzana || !coca || !pizza || !yogurt || !pringles || !lavandina || !chorizo) {
      console.log('No se encontraron todos los productos necesarios para favoritos.');
      return;
    }

    await AppDataSource.query(
      `
      INSERT INTO favorito (
        id_favorito, id_usuario, id_producto, fecha_creacion
      ) VALUES
        (1, 3, ?, '2025-02-02 09:00:00'),
        (2, 3, ?, '2025-02-02 09:05:00'),
        (3, 3, ?, '2025-02-02 09:10:00'),
        (4, 2, ?, '2025-02-03 08:00:00'),
        (5, 2, ?, '2025-02-03 08:05:00'),
        (6, 1, ?, '2025-02-04 10:00:00'),
        (7, 1, ?, '2025-02-04 10:05:00')
      ON DUPLICATE KEY UPDATE fecha_creacion = VALUES(fecha_creacion);
      `,
      [
        manzana.id_producto,
        coca.id_producto,
        pizza.id_producto,
        yogurt.id_producto,
        pringles.id_producto,
        lavandina.id_producto,
        chorizo.id_producto,
      ],
    );

    await AppDataSource.query(
      `UPDATE inventario SET stock_disponible = 0 WHERE id_producto = ?;`,
      [pizza.id_producto],
    );

    console.log('Favoritos sembrados.');
  }

  // ----------------------------------------------------------------
  // 7) Pedido + pedido_item + envio
  // ----------------------------------------------------------------
  private async seedPedidoYEnvio() {
    console.log('Sembrando pedido y envío...');

    const manzana = await this.findProductByName('Manzana Roja 1kg');
    const coca = await this.findProductByName('Coca-Cola 3L');
    const jamon = await this.findProductByName('Jamón Cerdo 200g');
    const leche = await this.findProductByName('Leche Pil 1L');
    const yogurt = await this.findProductByName('Yogurt Bebible 1L');
    if (!manzana || !coca || !jamon || !leche || !yogurt) {
    console.log('Productos base no encontrados para pedido_item.');
      return;
    }


    // 6.2) Obtener lotes usados
    const [loteManzana] = await AppDataSource.query(`SELECT id_lote FROM lote WHERE id_producto = ? LIMIT 1`, [
      manzana.id_producto,
    ]);
    const [loteCoca] = await AppDataSource.query(`SELECT id_lote FROM lote WHERE id_producto = ? LIMIT 1`, [
      coca.id_producto,
    ]);

    const [loteJamon] = await AppDataSource.query(`SELECT id_lote FROM lote WHERE id_producto = ? LIMIT 1`, [
      jamon.id_producto,
    ]);
    const [loteLeche] = await AppDataSource.query(`SELECT id_lote FROM lote WHERE id_producto = ? LIMIT 1`, [
      leche.id_producto,
    ]);
    const [loteYogurt] = await AppDataSource.query(`SELECT id_lote FROM lote WHERE id_producto = ? LIMIT 1`, [
      yogurt.id_producto,
    ]);

    if (!loteManzana || !loteCoca || !loteJamon || !loteLeche || !loteYogurt) {
      console.log('Lotes no encontrados para pedido_item.');
      return;
    }

     const today = new Date();
    const formatTodayTime = (hour: number, minute: number) => {
      const date = new Date(today);
      date.setHours(hour, minute, 0, 0);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };


    const pedidos = [
      {
        id: 1,
        clienteId: 3,
        estado: 'en_camino',
        fecha_creacion: '2025-02-01 10:00:00',
        fecha_actualizacion: '2025-02-01 10:15:00',
        subtotal: 33,
        costo_envio: 5,
        total: 38,
        direccion: 'Zona Clientes, Calle Falsa 123',
        envio: {
          id: 1,
          sector: 'Zona Sur',
          estado: 'en_camino',
          fecha_salida: '2025-02-01 10:20:00',
          fecha_entrega: null,
          minutos_espera: 5,
          calificacion: null,
        },
      },
      {
        id: 2,
        clienteId: 4,
        estado: 'entregado',
        fecha_creacion: '2025-01-20 09:00:00',
        fecha_actualizacion: '2025-01-20 12:45:00',
        subtotal: 45,
        costo_envio: 5,
        total: 50,
        direccion: 'Barrio Lomas 55',
        envio: {
          id: 2,
          sector: 'Zona Norte',
          estado: 'entregado',
          fecha_salida: '2025-01-20 09:30:00',
          fecha_entrega: '2025-01-20 12:30:00',
          minutos_espera: 3,
          calificacion: 5,
        },
      },
      {
        id: 3,
        clienteId: 5,
        estado: 'fallido',
        fecha_creacion: '2025-01-22 08:30:00',
        fecha_actualizacion: '2025-01-22 11:10:00',
        subtotal: 28,
        costo_envio: 5,
        total: 33,
        direccion: 'Residencial Norte 22',
        envio: {
          id: 3,
          sector: 'Zona Norte',
          estado: 'fallido',
          fecha_salida: '2025-01-22 09:00:00',
          fecha_entrega: '2025-01-22 10:55:00',
          minutos_espera: 10,
          calificacion: null,
        },
      },
      {
        id: 4,
        clienteId: 6,
        estado: 'entregado',
        fecha_creacion: '2025-01-25 14:00:00',
        fecha_actualizacion: '2025-01-25 16:45:00',
        subtotal: 52,
        costo_envio: 5,
        total: 57,
        direccion: 'Condominio Central 3B',
        envio: {
          id: 4,
          sector: 'Zona Centro',
          estado: 'entregado',
          fecha_salida: '2025-01-25 14:20:00',
          fecha_entrega: '2025-01-25 16:30:00',
          minutos_espera: 4,
          calificacion: 4,
        },
      },
      {
        id: 5,
        clienteId: 4,
        estado: 'asignado',
        fecha_creacion: '2025-02-02 09:10:00',
        fecha_actualizacion: '2025-02-02 09:35:00',
        subtotal: 30,
        costo_envio: 5,
        total: 35,
        direccion: 'Barrio Lomas 55',
        envio: {
          id: 5,
          sector: 'Zona Norte',
          estado: 'asignado',
          fecha_salida: '2025-02-02 09:40:00',
          fecha_entrega: null,
          minutos_espera: 2,
          calificacion: null,
        },
      },
      {
        id: 6,
        clienteId: 5,
        estado: 'entregado',
        fecha_creacion: '2025-01-28 17:00:00',
        fecha_actualizacion: '2025-01-28 19:20:00',
        subtotal: 36,
        costo_envio: 5,
        total: 41,
        direccion: 'Residencial Norte 22',
        envio: {
          id: 6,
          sector: 'Zona Norte',
          estado: 'entregado',
          fecha_salida: '2025-01-28 17:20:00',
          fecha_entrega: '2025-01-28 18:50:00',
          minutos_espera: 6,
          calificacion: 5,
        },
      },
      {
        id: 7,
        clienteId: 3,
        estado: 'pendiente',
        fecha_creacion: '2025-02-10 09:15:00',
        fecha_actualizacion: '2025-02-10 09:15:00',
        subtotal: 33,
        costo_envio: 5,
        total: 38,
        direccion: 'Av. Siempre Viva 742',
        envio: {
          id: 7,
          sector: 'Zona Centro',
          estado: 'pendiente',
          fecha_salida: null,
          fecha_entrega: null,
          minutos_espera: null,
          calificacion: null,
          repartidorId: null,
        },
      },
      {
        id: 8,
        clienteId: 3,
        estado: 'pendiente',
        fecha_creacion: '2025-02-10 11:30:00',
        fecha_actualizacion: '2025-02-10 11:30:00',
        subtotal: 33,
        costo_envio: 5,
        total: 38,
        direccion: 'Residencial Norte 22',
        envio: {
          id: 8,
          sector: 'Zona Norte',
          estado: 'pendiente',
          fecha_salida: null,
          fecha_entrega: null,
          minutos_espera: null,
          calificacion: null,
          repartidorId: null,
        },
      },
      {
        id: 9,
        clienteId: 3,
        estado: 'pendiente',
        fecha_creacion: '2025-02-11 08:45:00',
        fecha_actualizacion: '2025-02-11 08:45:00',
        subtotal: 33,
        costo_envio: 5,
        total: 38,
        direccion: 'Barrio Lomas 55',
        envio: {
          id: 9,
          sector: 'Zona Sur',
          estado: 'pendiente',
          fecha_salida: null,
          fecha_entrega: null,
          minutos_espera: null,
          calificacion: null,
          repartidorId: null,
        },
      },
      {
        id: 10,
        clienteId: 3,
        estado: 'pendiente',
        fecha_creacion: formatTodayTime(8, 30),
        fecha_actualizacion: formatTodayTime(8, 30),
        subtotal: 48,
        costo_envio: 5,
        total: 53,
        direccion: 'Zona Clientes, Calle Falsa 123',
        envio: {
          id: 10,
          sector: 'Zona Centro',
          estado: 'pendiente',
          fecha_salida: null,
          fecha_entrega: null,
          minutos_espera: null,
          calificacion: null,
          repartidorId: null,
        },
        items: [
          { productoId: manzana.id_producto, loteId: loteManzana.id_lote, cantidad: 3, precio: 10.0 },
          { productoId: coca.id_producto, loteId: loteCoca.id_lote, cantidad: 1, precio: 13.0 },
        ],
      },
      {
        id: 11,
        clienteId: 4,
        estado: 'procesando',
        fecha_creacion: formatTodayTime(11, 15),
        fecha_actualizacion: formatTodayTime(11, 25),
        subtotal: 64,
        costo_envio: 5,
        total: 69,
        direccion: 'Barrio Lomas 55',
        envio: {
          id: 11,
          sector: 'Zona Sur',
          estado: 'pendiente',
          fecha_salida: null,
          fecha_entrega: null,
          minutos_espera: null,
          calificacion: null,
          repartidorId: null,
        },
        items: [
          { productoId: leche.id_producto, loteId: loteLeche.id_lote, cantidad: 4, precio: 7.0 },
          { productoId: jamon.id_producto, loteId: loteJamon.id_lote, cantidad: 2, precio: 16.5 },
        ],
      },
      {
        id: 12,
        clienteId: 5,
        estado: 'entregado',
        fecha_creacion: formatTodayTime(14, 5),
        fecha_actualizacion: formatTodayTime(15, 0),
        subtotal: 72,
        costo_envio: 5,
        total: 77,
        direccion: 'Residencial Norte 22',
        envio: {
          id: 12,
          sector: 'Zona Norte',
          estado: 'entregado',
          fecha_salida: formatTodayTime(14, 15),
          fecha_entrega: formatTodayTime(15, 0),
          minutos_espera: 6,
          calificacion: 5,
          repartidorId: 2,
        },
        items: [
          { productoId: yogurt.id_producto, loteId: loteYogurt.id_lote, cantidad: 3, precio: 10.0 },
          { productoId: coca.id_producto, loteId: loteCoca.id_lote, cantidad: 2, precio: 13.0 },
        ],
      },
      {
        id: 13,
        clienteId: 6,
        estado: 'entregado',
        fecha_creacion: formatTodayTime(17, 30),
        fecha_actualizacion: formatTodayTime(17, 55),
        subtotal: 90,
        costo_envio: 5,
        total: 95,
        direccion: 'Condominio Central 3B',
        envio: {
          id: 13,
          sector: 'Zona Centro',
          estado: 'entregado',
          fecha_salida: formatTodayTime(17, 40),
          fecha_entrega: formatTodayTime(18, 15),
          minutos_espera: 4,
          calificacion: 4,
          repartidorId: 2,
        },
        items: [
          { productoId: manzana.id_producto, loteId: loteManzana.id_lote, cantidad: 4, precio: 10.0 },
          { productoId: jamon.id_producto, loteId: loteJamon.id_lote, cantidad: 2, precio: 16.5 },
        ],
      },
    ];

    for (const pedido of pedidos) {
      await AppDataSource.query(
        `
        INSERT INTO pedido (
          id_pedido, id_usuario_cliente, tipo_pedido, metodo_pago, estado,
          fecha_creacion, fecha_actualizacion, subtotal, costo_envio, total,
          direccion_entrega, tipo_entrega, es_reserva, fecha_hora_programada,
          id_descuento_aplicado
        ) VALUES
          (?, ?, 'delivery', 'tarjeta', ?,
           ?, ?,
           ?, ?, ?,
           ?, 'express', 0, NULL, 1)
        ON DUPLICATE KEY UPDATE
          estado = VALUES(estado),
          fecha_actualizacion = VALUES(fecha_actualizacion);
        `,
        [
          pedido.id,
          pedido.clienteId,
          pedido.estado,
          pedido.fecha_creacion,
          pedido.fecha_actualizacion,
          pedido.subtotal,
          pedido.costo_envio,
          pedido.total,
          pedido.direccion,
        ],
      );

       const itemsToInsert = pedido.items ?? [
        { productoId: manzana.id_producto, loteId: loteManzana.id_lote, cantidad: 2, precio: 10.0 },
        { productoId: coca.id_producto, loteId: loteCoca.id_lote, cantidad: 1, precio: 13.0 },
      ];

      for (const item of itemsToInsert) {
        await AppDataSource.query(
          `
          INSERT INTO pedido_item (
            id_pedido, id_producto, id_lote, cantidad, precio_unitario
          ) VALUES
            (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), precio_unitario = VALUES(precio_unitario);
          `,
          [
            pedido.id,
            item.productoId,
            item.loteId,
            item.cantidad,
            item.precio,
          ],
        );
      }

      await AppDataSource.query(
        `
        INSERT INTO envio (
          id_envio, id_pedido, id_repartidor, sector, estado_envio,
          fecha_salida, fecha_entrega, minutos_espera, calificacion_cliente
        ) VALUES
          (?, ?, ?, ?, ?,
           ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE estado_envio = VALUES(estado_envio), fecha_entrega = VALUES(fecha_entrega);
        `,
        [
          pedido.envio.id,
          pedido.id,
          pedido.envio.repartidorId === undefined ? 2 : pedido.envio.repartidorId,
          pedido.envio.sector,
          pedido.envio.estado,
          pedido.envio.fecha_salida,
          pedido.envio.fecha_entrega,
          pedido.envio.minutos_espera,
          pedido.envio.calificacion,
        ],
      );
    }

    console.log('Pedido y envío sembrados.');
  }

  // ----------------------------------------------------------------
  // 7) Reembolso + devolucion_item
  // ----------------------------------------------------------------
  private async seedReembolsoYDevolucion() {
    console.log('Sembrando reembolso y devoluciones...');

    const manzana = await this.findProductByName('Manzana Roja 1kg');
    if (!manzana) {
      console.log('Producto base no encontrado para devolucion_item.');
      return;
    }

    const today = new Date();
    const refundDate = new Date(today);
    refundDate.setHours(16, 0, 0, 0);
    const refundDateStr = refundDate.toISOString().slice(0, 19).replace('T', ' ');

    await AppDataSource.query(`
      INSERT INTO reembolso (
        id_devolucion, id_usuario_vendedor, fecha, motivo,
        monto_total, id_pedido
      ) VALUES
        (1, 1, '2025-02-02 11:00:00', 'Producto dañado en el envío',
         10.00, 1)
      ON DUPLICATE KEY UPDATE motivo = VALUES(motivo);
    `);

     await AppDataSource.query(
      `
      INSERT INTO reembolso (
        id_devolucion, id_usuario_vendedor, fecha, motivo,
        monto_total, id_pedido
      ) VALUES
        (2, 1, ?, 'Cliente solicitó devolución parcial', 15.00, 11)
      ON DUPLICATE KEY UPDATE fecha = VALUES(fecha), motivo = VALUES(motivo), monto_total = VALUES(monto_total);
      `,
      [refundDateStr],
    );


    await AppDataSource.query(
      `
      INSERT INTO devolucion_item (
        id_devolucion, id_producto, cantidad, precio_unitario
      ) VALUES
        (1, ?, 1, 10.00)
      ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad);
      `,
      [manzana.id_producto],
    );

    await AppDataSource.query(
      `
      INSERT INTO devolucion_item (
        id_devolucion, id_producto, cantidad, precio_unitario
      ) VALUES
        (2, ?, 1, 7.00)
      ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), precio_unitario = VALUES(precio_unitario);
      `,
      [manzana.id_producto],
    );

    console.log('Reembolso y devoluciones sembrados.');
  }

  // ----------------------------------------------------------------
  // 8) Chat + mensajes
  // ----------------------------------------------------------------
  private async seedChatYMensajes() {
    console.log('Sembrando chat y mensajes...');

    await AppDataSource.query(`
      INSERT INTO chat (
        id_chat, id_cliente, id_agente_soporte, id_pedido,
        fecha_inicio, estado
      ) VALUES
        (1, 3, 1, 1,
         '2025-02-01 10:30:00', 'abierto')
      ON DUPLICATE KEY UPDATE estado = VALUES(estado);
    `);

    await AppDataSource.query(`
      INSERT INTO mensaje (
        id_mensaje, id_chat, id_remitente, fecha_hora, contenido, leido
      ) VALUES
        (1, 1, 3, '2025-02-01 10:31:00', 'Hola, mi pedido está demorando.', 0),
        (2, 1, 1, '2025-02-01 10:32:00', 'Hola Lucía, ya está en camino.', 0)
      ON DUPLICATE KEY UPDATE contenido = VALUES(contenido);
    `);

    console.log('Chat y mensajes sembrados.');
  }

  // ----------------------------------------------------------------
  // 9) Sanción de usuario
  // ----------------------------------------------------------------
  private async seedSancionUsuario() {
    console.log('Sembrando sanción de usuario...');

    await AppDataSource.query(`
      INSERT INTO sancion_usuario (
        id_sancion, id_usuario, id_envio, motivo,
        fecha_inicio, fecha_fin, estado
      ) VALUES
        (1, 2, 1, 'Retraso en la entrega sin justificar.',
         '2025-02-02 09:00:00', '2025-02-05 09:00:00', 'activa')
      ON DUPLICATE KEY UPDATE estado = VALUES(estado);
    `);

    console.log('Sanción de usuario sembrada.');
  }

  // ----------------------------------------------------------------
  // 10) Alertas de stock
  // ----------------------------------------------------------------
  private async seedAlertasStock() {
    console.log('Sembrando alertas de stock...');

    const manzana = await this.findProductByName('Manzana Roja 1kg');
    const jamon = await this.findProductByName('Jamón Cerdo 200g');

    if (!manzana || !jamon) {
      console.log('Productos base no encontrados para alerta_stock.');
      return;
    }

     await AppDataSource.query(
      `UPDATE inventario SET stock_disponible = 3, stock_minimo = 10 WHERE id_producto IN (?, ?);`,
      [manzana.id_producto, jamon.id_producto],
    );

    await AppDataSource.query(
      `
      INSERT INTO alerta_stock (
        id_alerta, id_producto, tipo_alerta, fecha_alerta, mensaje
      ) VALUES
        (1, ?, 'BAJO_STOCK', '2025-02-01 10:00:00', 'El stock de Manzana Roja 1kg está por debajo del mínimo.'),
        (2, ?, 'BAJO_STOCK', '2025-02-01 11:00:00', 'El stock de Jamón Cerdo 200g está por debajo del mínimo.')
      ON DUPLICATE KEY UPDATE mensaje = VALUES(mensaje);
      `,
      [manzana.id_producto, jamon.id_producto],
    );

    console.log('Alertas de stock sembradas.');
  }

  // ----------------------------------------------------------------
  // Helper: encontrar producto por nombre
  // ----------------------------------------------------------------
  private async findProductByName(nombre: string): Promise<Product | null> {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({ where: { nombre } });
    return product ?? null;
  }
}

USE mklite;

-- Desactivar chequeos para insertar sin problemas de orden
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES
TRUNCATE TABLE rol;
INSERT INTO rol (id_rol, nombre) VALUES 
(1, 'Cliente'),
(2, 'Repartidor'),
(3, 'Administrador');

-- 2. USUARIOS (Password: 123 encriptado simulado o texto plano si no usas bcrypt en seed manual)
-- Nota: Si tu backend encripta, estos usuarios no podran loguearse con '123' a menos que crees uno via Postman.
-- Pero sirven para poblar las relaciones de pedidos.
TRUNCATE TABLE usuario;
INSERT INTO usuario (id_usuario, nombre, apellido, ci, email, password, telefono, direccion, estado_cuenta, es_admin_principal, fecha_registro) VALUES
(1, 'Juan', 'Perez', '1111111', 'cliente@test.com', '$2b$10$X7...', '70000001', 'Av. Siempre Viva 123', 'activo', 0, NOW()),
(2, 'Mario', 'Speed', '2222222', 'driver@test.com', '$2b$10$X7...', '70000002', 'Central de Reparto', 'activo', 0, NOW()),
(3, 'Admin', 'Jefe', '3333333', 'admin@test.com', '$2b$10$X7...', '70000003', 'Oficina', 'activo', 1, NOW());

-- 3. ASIGNAR ROLES
TRUNCATE TABLE usuario_rol;
INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (1, 1), (2, 2), (3, 3);

-- 4. CATEGORIAS
TRUNCATE TABLE categoria;
INSERT INTO categoria (id_categoria, nombre, descripcion) VALUES
(1, 'Bebidas', 'Gaseosas, jugos y aguas'),
(2, 'Lacteos', 'Leches, yogures y quesos'),
(3, 'Despensa', 'Arroz, fideo, aceite y granos'),
(4, 'Snacks', 'Papas fritas, galletas y dulces');

-- 5. PROVEEDORES
TRUNCATE TABLE proveedor;
INSERT INTO proveedor (id_proveedor, nombre, telefono, email, direccion) VALUES
(1, 'Coca Cola Company', '800100200', 'ventas@coca.com', 'Parque Industrial Mz 5'),
(2, 'Pil Andina', '800104050', 'pedidos@pil.com', 'Carretera a Viacha km 10'),
(3, 'Fino S.A.', '33450000', 'ventas@fino.com.bo', 'Av. Blanco Galindo');

-- 6. PRODUCTOS (Con imágenes reales de Unsplash)
TRUNCATE TABLE producto;
INSERT INTO producto (id_producto, nombre, descripcion, precio_venta, imagen_url) VALUES
(1, 'Coca Cola 3L', 'Gaseosa sabor cola retornable', 13.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'),
(2, 'Leche Pil Entera 1L', 'Leche fluida natural pasteurizada', 6.50, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80'),
(3, 'Aceite Fino 900ml', 'Aceite 100% vegetal de soya', 11.00, 'https://images.unsplash.com/photo-1474979266404-7cadd2592500?auto=format&fit=crop&w=500&q=80'),
(4, 'Papas Pringles', 'Sabor original 124g', 18.00, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80');

-- 7. RELACION PRODUCTO-CATEGORIA
TRUNCATE TABLE producto_categoria;
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES
(1, 1), -- Coca -> Bebidas
(2, 2), -- Leche -> Lacteos
(3, 3), -- Aceite -> Despensa
(4, 4); -- Papas -> Snacks

-- 8. LOTES (Entrada de Mercadería)
TRUNCATE TABLE lote;
INSERT INTO lote (id_lote, id_producto, id_proveedor, fecha_recepcion, fecha_vencimiento, costo_unitario, cantidad_inicial, cantidad_disponible, estado_lote) VALUES
(1, 1, 1, '2023-11-01', '2024-12-31', 9.50, 100, 100, 'activo'), -- 100 Cocas
(2, 2, 2, '2023-11-05', '2023-12-05', 4.00, 50, 50, 'activo'),   -- 50 Leches
(3, 3, 3, '2023-10-20', '2025-01-01', 7.50, 200, 200, 'activo'), -- 200 Aceites
(4, 4, 1, '2023-11-10', '2024-06-30', 12.00, 30, 30, 'activo');  -- 30 Papas

-- 9. INVENTARIO (Debe coincidir con la suma de los lotes)
TRUNCATE TABLE inventario;
INSERT INTO inventario (id_producto, stock_disponible, stock_reservado, stock_minimo, stock_vencido, stock_danado, ultima_actualizacion) VALUES
(1, 100, 0, 10, 0, 0, NOW()), -- Coincide con Lote 1
(2, 50, 0, 5, 0, 0, NOW()),   -- Coincide con Lote 2
(3, 200, 0, 20, 0, 0, NOW()), -- Coincide con Lote 3
(4, 30, 0, 5, 0, 0, NOW());   -- Coincide con Lote 4

-- Limpieza de tablas transaccionales para empezar de cero
TRUNCATE TABLE carrito_item;
TRUNCATE TABLE carrito;
TRUNCATE TABLE pedido_item;
TRUNCATE TABLE envio;
TRUNCATE TABLE pedido;
TRUNCATE TABLE mensaje;
TRUNCATE TABLE chat;

SET FOREIGN_KEY_CHECKS = 1;
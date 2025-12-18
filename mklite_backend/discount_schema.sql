-- DDL para el módulo de descuentos
-- Ejecutar sobre la base de datos mklite si no se usa synchronize:true

ALTER TABLE descuento
  ADD COLUMN IF NOT EXISTS nombre VARCHAR(150) NOT NULL AFTER id_descuento,
  ADD COLUMN IF NOT EXISTS monto_minimo_compra DECIMAL(10,2) NULL AFTER monto_fijo,
  ADD COLUMN IF NOT EXISTS aplica_a ENUM('ALL','CATEGORY','PRODUCT') NOT NULL DEFAULT 'ALL' AFTER estado_de_oferta,
  MODIFY COLUMN codigo_cupon VARCHAR(50) NULL,
  MODIFY COLUMN porcentaje_descuento DECIMAL(5,2) NULL,
  MODIFY COLUMN monto_fijo DECIMAL(10,2) NULL;

CREATE TABLE IF NOT EXISTS descuento_categoria (
  id_descuento INT NOT NULL,
  id_categoria INT NOT NULL,
  PRIMARY KEY (id_descuento, id_categoria),
  CONSTRAINT fk_descuento_categoria_descuento FOREIGN KEY (id_descuento) REFERENCES descuento(id_descuento) ON DELETE CASCADE,
  CONSTRAINT fk_descuento_categoria_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE
);
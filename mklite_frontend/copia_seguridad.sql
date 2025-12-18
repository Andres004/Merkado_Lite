-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: mklite
-- ------------------------------------------------------
-- Server version	8.0.44-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alerta_stock`
--

DROP TABLE IF EXISTS `alerta_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerta_stock` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `tipo_alerta` varchar(50) NOT NULL,
  `fecha_alerta` datetime NOT NULL,
  `mensaje` text NOT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `FK_42046c4f8a4aa606cebff5f33fe` (`id_producto`),
  CONSTRAINT `FK_42046c4f8a4aa606cebff5f33fe` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerta_stock`
--

LOCK TABLES `alerta_stock` WRITE;
/*!40000 ALTER TABLE `alerta_stock` DISABLE KEYS */;
INSERT INTO `alerta_stock` VALUES (1,1,'BAJO_STOCK','2025-02-01 10:00:00','El stock de Manzana Roja 1kg está por debajo del mínimo.'),(2,6,'BAJO_STOCK','2025-02-01 11:00:00','El stock de Jamón Cerdo 200g está por debajo del mínimo.');
/*!40000 ALTER TABLE `alerta_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrito`
--

DROP TABLE IF EXISTS `carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  `descuento_aplicado` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_carrito`),
  KEY `FK_2f59229fe3184c1a775de06d16c` (`id_usuario`),
  CONSTRAINT `FK_2f59229fe3184c1a775de06d16c` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito`
--

LOCK TABLES `carrito` WRITE;
/*!40000 ALTER TABLE `carrito` DISABLE KEYS */;
INSERT INTO `carrito` VALUES (1,3,'2025-02-01 09:30:00',1,0);
/*!40000 ALTER TABLE `carrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrito_item`
--

DROP TABLE IF EXISTS `carrito_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrito_item` (
  `id_carrito` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_carrito`,`id_producto`),
  KEY `FK_724c7a415e46b31bf0a585f7498` (`id_producto`),
  CONSTRAINT `FK_5298c1191dd1102005e0474f0bb` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`),
  CONSTRAINT `FK_724c7a415e46b31bf0a585f7498` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito_item`
--

LOCK TABLES `carrito_item` WRITE;
/*!40000 ALTER TABLE `carrito_item` DISABLE KEYS */;
INSERT INTO `carrito_item` VALUES (1,1,2,10.00),(1,15,1,13.00);
/*!40000 ALTER TABLE `carrito_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Frutas y Verduras','Productos frescos del campo.'),(2,'Fiambres y Embutidos','Jamones, salchichas y más.'),(3,'Lácteos','Leche, quesos, yogures y huevos.'),(4,'Bebidas','Gaseosas, jugos, agua y bebidas energizantes.'),(5,'Snacks','Tus piqueos favoritos para cualquier momento.'),(6,'Mascotas','Lo mejor para tus amigos peludos.'),(7,'Panadería','Pan fresco y horneados deliciosos.'),(8,'Cuidado del Hogar','Mantén tu espacio limpio y fresco.'),(9,'Cuidado Personal','Productos para tu higiene diaria.'),(10,'Congelados','Soluciones rápidas y ricas.'),(11,'Cuidado del Bebé','Productos delicados para tu bebé.'),(12,'Carnes','Productos frescos cárnicos y avícolas.');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat`
--

DROP TABLE IF EXISTS `chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat` (
  `id_chat` int NOT NULL AUTO_INCREMENT,
  `id_cliente` int NOT NULL,
  `id_agente_soporte` int DEFAULT NULL,
  `id_pedido` int DEFAULT NULL,
  `fecha_inicio` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_chat`),
  KEY `FK_0b9f7cff5ab41e2e1b954a10e68` (`id_cliente`),
  KEY `FK_2cd4fea6a1f06fdbe2aea4ae532` (`id_agente_soporte`),
  CONSTRAINT `FK_0b9f7cff5ab41e2e1b954a10e68` FOREIGN KEY (`id_cliente`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `FK_2cd4fea6a1f06fdbe2aea4ae532` FOREIGN KEY (`id_agente_soporte`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat`
--

LOCK TABLES `chat` WRITE;
/*!40000 ALTER TABLE `chat` DISABLE KEYS */;
INSERT INTO `chat` VALUES (1,3,1,1,'2025-02-01 10:30:00.000000','abierto'),(2,1,NULL,NULL,'2025-12-18 05:20:14.161000','abierto');
/*!40000 ALTER TABLE `chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descuento`
--

DROP TABLE IF EXISTS `descuento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descuento` (
  `id_descuento` int NOT NULL AUTO_INCREMENT,
  `fecha_inicio` datetime NOT NULL,
  `fecha_final` datetime NOT NULL,
  `codigo_cupon` varchar(50) DEFAULT NULL,
  `porcentaje_descuento` decimal(5,2) DEFAULT NULL,
  `monto_fijo` decimal(10,2) DEFAULT NULL,
  `estado_de_oferta` tinyint NOT NULL DEFAULT '1',
  `nombre` varchar(150) NOT NULL,
  `monto_minimo_compra` decimal(10,2) DEFAULT NULL,
  `aplica_a` enum('ALL','CATEGORY','PRODUCT') NOT NULL DEFAULT 'ALL',
  PRIMARY KEY (`id_descuento`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuento`
--

LOCK TABLES `descuento` WRITE;
/*!40000 ALTER TABLE `descuento` DISABLE KEYS */;
INSERT INTO `descuento` VALUES (1,'2025-02-01 00:00:00','2025-03-01 23:59:59','VERANO10',10.00,0.00,1,'Cupón Verano',0.00,'ALL');
/*!40000 ALTER TABLE `descuento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descuento_categoria`
--

DROP TABLE IF EXISTS `descuento_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descuento_categoria` (
  `id_descuento` int NOT NULL,
  `id_categoria` int NOT NULL,
  PRIMARY KEY (`id_descuento`,`id_categoria`),
  KEY `FK_d483517500579b22c4f0e519458` (`id_categoria`),
  CONSTRAINT `FK_d483517500579b22c4f0e519458` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE,
  CONSTRAINT `FK_e5d30c0507793c66eafa908eb18` FOREIGN KEY (`id_descuento`) REFERENCES `descuento` (`id_descuento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuento_categoria`
--

LOCK TABLES `descuento_categoria` WRITE;
/*!40000 ALTER TABLE `descuento_categoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `descuento_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descuento_producto`
--

DROP TABLE IF EXISTS `descuento_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descuento_producto` (
  `id_descuento` int NOT NULL,
  `id_producto` int NOT NULL,
  PRIMARY KEY (`id_descuento`,`id_producto`),
  KEY `FK_99b2037f1ab696541e0144817fc` (`id_producto`),
  CONSTRAINT `FK_15af3d7e71b13a6b75cca7662ef` FOREIGN KEY (`id_descuento`) REFERENCES `descuento` (`id_descuento`) ON DELETE CASCADE,
  CONSTRAINT `FK_99b2037f1ab696541e0144817fc` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descuento_producto`
--

LOCK TABLES `descuento_producto` WRITE;
/*!40000 ALTER TABLE `descuento_producto` DISABLE KEYS */;
/*!40000 ALTER TABLE `descuento_producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devolucion_item`
--

DROP TABLE IF EXISTS `devolucion_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devolucion_item` (
  `id_devolucion` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_devolucion`,`id_producto`),
  KEY `FK_f6251ac293978db3017f2690445` (`id_producto`),
  CONSTRAINT `FK_935ebf204eeac86ce9ba07494b6` FOREIGN KEY (`id_devolucion`) REFERENCES `reembolso` (`id_devolucion`) ON DELETE CASCADE,
  CONSTRAINT `FK_f6251ac293978db3017f2690445` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devolucion_item`
--

LOCK TABLES `devolucion_item` WRITE;
/*!40000 ALTER TABLE `devolucion_item` DISABLE KEYS */;
INSERT INTO `devolucion_item` VALUES (1,1,1,10.00),(2,1,1,7.00);
/*!40000 ALTER TABLE `devolucion_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `envio`
--

DROP TABLE IF EXISTS `envio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `envio` (
  `id_envio` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_repartidor` int DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `estado_envio` varchar(30) NOT NULL,
  `fecha_salida` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `minutos_espera` int DEFAULT NULL,
  `calificacion_cliente` int DEFAULT NULL,
  PRIMARY KEY (`id_envio`),
  UNIQUE KEY `IDX_f5370ac15ea326e9c6d56d6b46` (`id_pedido`),
  UNIQUE KEY `REL_f5370ac15ea326e9c6d56d6b46` (`id_pedido`),
  CONSTRAINT `FK_f5370ac15ea326e9c6d56d6b464` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `envio`
--

LOCK TABLES `envio` WRITE;
/*!40000 ALTER TABLE `envio` DISABLE KEYS */;
INSERT INTO `envio` VALUES (1,1,2,'Zona Sur','en_camino','2025-02-01 10:20:00',NULL,5,NULL),(2,2,2,'Zona Norte','entregado','2025-01-20 09:30:00','2025-01-20 12:30:00',3,5),(3,3,2,'Zona Norte','fallido','2025-01-22 09:00:00','2025-01-22 10:55:00',10,NULL),(4,4,2,'Zona Centro','entregado','2025-01-25 14:20:00','2025-01-25 16:30:00',4,4),(5,5,2,'Zona Norte','asignado','2025-02-02 09:40:00',NULL,2,NULL),(6,6,2,'Zona Norte','entregado','2025-01-28 17:20:00','2025-01-28 18:50:00',6,5),(7,7,NULL,'Zona Centro','pendiente',NULL,NULL,NULL,NULL),(8,8,NULL,'Zona Norte','pendiente',NULL,NULL,NULL,NULL),(9,9,NULL,'Zona Sur','pendiente',NULL,NULL,NULL,NULL),(10,10,NULL,'Zona Centro','pendiente',NULL,NULL,NULL,NULL),(11,11,NULL,'Zona Sur','pendiente',NULL,NULL,NULL,NULL),(12,12,2,'Zona Norte','entregado','2025-12-18 18:15:00','2025-12-18 19:00:00',6,5),(13,13,2,'Zona Centro','entregado','2025-12-18 21:40:00','2025-12-18 22:15:00',4,4);
/*!40000 ALTER TABLE `envio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorito`
--

DROP TABLE IF EXISTS `favorito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorito` (
  `id_favorito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_producto` int NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_favorito`),
  UNIQUE KEY `IDX_10d6f2c664c02973cce97ca459` (`id_usuario`,`id_producto`),
  KEY `FK_9feafb830a120b7db1bb2148673` (`id_producto`),
  CONSTRAINT `FK_9feafb830a120b7db1bb2148673` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE,
  CONSTRAINT `FK_b3aee3da2143ec261a3c77b750c` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorito`
--

LOCK TABLES `favorito` WRITE;
/*!40000 ALTER TABLE `favorito` DISABLE KEYS */;
INSERT INTO `favorito` VALUES (1,3,1,'2025-02-02 09:00:00.000000'),(2,3,15,'2025-02-02 09:05:00.000000'),(3,3,37,'2025-02-02 09:10:00.000000'),(4,2,13,'2025-02-03 08:00:00.000000'),(5,2,22,'2025-02-03 08:05:00.000000'),(6,1,28,'2025-02-04 10:00:00.000000'),(7,1,9,'2025-02-04 10:05:00.000000');
/*!40000 ALTER TABLE `favorito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_producto` int NOT NULL,
  `stock_disponible` int NOT NULL DEFAULT '0',
  `stock_reservado` int NOT NULL DEFAULT '0',
  `stock_minimo` int NOT NULL DEFAULT '0',
  `ultima_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `stock_vencido` int NOT NULL DEFAULT '0',
  `stock_danado` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_producto`),
  CONSTRAINT `FK_467c42d673222f61151a26570fa` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,3,0,10,'2025-12-18 05:15:43',0,0),(2,60,0,5,'2025-12-18 05:15:43',0,0),(3,40,0,5,'2025-12-18 05:15:43',0,0),(4,30,0,5,'2025-12-18 05:15:43',0,0),(5,45,0,5,'2025-12-18 05:15:43',0,0),(6,3,0,10,'2025-12-18 05:15:43',0,0),(7,25,0,5,'2025-12-18 05:15:43',0,0),(8,30,0,5,'2025-12-18 05:15:43',0,0),(9,15,0,5,'2025-12-18 05:15:43',0,0),(10,10,0,5,'2025-12-18 05:15:43',0,0),(11,100,0,5,'2025-12-18 05:15:43',0,0),(12,40,0,5,'2025-12-18 05:15:43',0,0),(13,60,0,5,'2025-12-18 05:15:43',0,0),(14,35,0,5,'2025-12-18 05:15:43',0,0),(15,120,0,5,'2025-12-18 05:15:43',0,0),(16,80,0,5,'2025-12-18 05:15:43',0,0),(17,60,0,5,'2025-12-18 05:15:43',0,0),(18,40,0,5,'2025-12-18 05:15:43',0,0),(19,35,0,5,'2025-12-18 05:15:43',0,0),(20,50,0,5,'2025-12-18 05:15:43',0,0),(21,45,0,5,'2025-12-18 05:15:43',0,0),(22,30,0,5,'2025-12-18 05:15:43',0,0),(23,25,0,5,'2025-12-18 05:15:43',0,0),(24,20,0,5,'2025-12-18 05:15:44',0,0),(25,200,0,5,'2025-12-18 05:15:44',0,0),(26,60,0,5,'2025-12-18 05:15:44',0,0),(27,30,0,5,'2025-12-18 05:15:44',0,0),(28,40,0,5,'2025-12-18 05:15:44',0,0),(29,35,0,5,'2025-12-18 05:15:44',0,0),(30,25,0,5,'2025-12-18 05:15:44',0,0),(31,40,0,5,'2025-12-18 05:15:44',0,0),(32,60,0,5,'2025-12-18 05:15:44',0,0),(33,30,0,5,'2025-12-18 05:15:44',0,0),(34,45,0,5,'2025-12-18 05:15:44',0,0),(35,70,0,5,'2025-12-18 05:15:44',0,0),(36,35,0,5,'2025-12-18 05:15:44',0,0),(37,0,0,5,'2025-12-18 05:15:44',0,0),(38,50,0,5,'2025-12-18 05:15:44',0,0),(39,50,0,5,'2025-12-18 05:15:44',0,0),(40,70,0,5,'2025-12-18 05:15:44',0,0),(41,45,0,5,'2025-12-18 05:15:44',0,0),(42,35,0,5,'2025-12-18 05:15:44',0,0),(43,60,0,5,'2025-12-18 05:15:44',0,0),(44,40,0,5,'2025-12-18 05:15:44',0,0),(45,50,0,5,'2025-12-18 05:15:44',0,0),(46,30,0,5,'2025-12-18 05:15:44',0,0),(47,25,0,5,'2025-12-18 05:15:44',0,0),(48,35,0,5,'2025-12-18 05:15:44',0,0);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lote`
--

DROP TABLE IF EXISTS `lote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lote` (
  `id_lote` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `fecha_recepcion` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_disponible` int NOT NULL,
  `estado_lote` varchar(20) NOT NULL,
  PRIMARY KEY (`id_lote`),
  KEY `FK_d12890bdb55511c6f1c5e6545ae` (`id_producto`),
  KEY `FK_9a1bdc3c26fdb5c44c2ffe86745` (`id_proveedor`),
  CONSTRAINT `FK_9a1bdc3c26fdb5c44c2ffe86745` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`) ON DELETE CASCADE,
  CONSTRAINT `FK_d12890bdb55511c6f1c5e6545ae` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lote`
--

LOCK TABLES `lote` WRITE;
/*!40000 ALTER TABLE `lote` DISABLE KEYS */;
INSERT INTO `lote` VALUES (1,1,1,'2025-01-01','2025-03-01',6.00,50,50,'activo'),(2,11,2,'2025-01-05','2025-04-01',4.50,100,100,'activo'),(3,15,1,'2025-01-02','2025-06-01',8.00,80,80,'activo'),(4,6,1,'2025-01-03','2025-05-01',10.00,30,30,'activo'),(5,13,2,'2025-01-04','2025-04-15',6.50,60,60,'activo');
/*!40000 ALTER TABLE `lote` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensaje`
--

DROP TABLE IF EXISTS `mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensaje` (
  `id_mensaje` int NOT NULL AUTO_INCREMENT,
  `id_chat` int NOT NULL,
  `id_remitente` int NOT NULL,
  `fecha_hora` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `contenido` text NOT NULL,
  `leido` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_mensaje`),
  KEY `FK_20f8bdf3c0badfc9e16bb24f0b5` (`id_chat`),
  KEY `FK_6e8b0ecb05a39d3ce3207edbc81` (`id_remitente`),
  CONSTRAINT `FK_20f8bdf3c0badfc9e16bb24f0b5` FOREIGN KEY (`id_chat`) REFERENCES `chat` (`id_chat`) ON DELETE CASCADE,
  CONSTRAINT `FK_6e8b0ecb05a39d3ce3207edbc81` FOREIGN KEY (`id_remitente`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensaje`
--

LOCK TABLES `mensaje` WRITE;
/*!40000 ALTER TABLE `mensaje` DISABLE KEYS */;
INSERT INTO `mensaje` VALUES (1,1,3,'2025-02-01 10:31:00.000000','Hola, mi pedido está demorando.',0),(2,1,1,'2025-02-01 10:32:00.000000','Hola Lucía, ya está en camino.',0),(3,1,1,'2025-12-18 05:20:44.263000','Tuvimos un inconveniente en la entrega',0),(4,1,3,'2025-12-18 05:21:03.697000','esta bien muchas gracias',0);
/*!40000 ALTER TABLE `mensaje` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido`
--

DROP TABLE IF EXISTS `pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario_cliente` int NOT NULL,
  `tipo_pedido` varchar(20) NOT NULL,
  `metodo_pago` varchar(20) NOT NULL,
  `estado` varchar(30) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `fecha_actualizacion` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `subtotal` decimal(10,2) NOT NULL,
  `costo_envio` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `direccion_entrega` varchar(255) NOT NULL,
  `tipo_entrega` varchar(20) NOT NULL,
  `es_reserva` tinyint NOT NULL DEFAULT '0',
  `fecha_hora_programada` datetime DEFAULT NULL,
  `id_descuento_aplicado` int DEFAULT NULL,
  `latitud_entrega` decimal(10,8) DEFAULT NULL,
  `longitud_entrega` decimal(10,8) DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `FK_775ddcd7bea51f893c1b8ec428b` (`id_usuario_cliente`),
  CONSTRAINT `FK_775ddcd7bea51f893c1b8ec428b` FOREIGN KEY (`id_usuario_cliente`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido`
--

LOCK TABLES `pedido` WRITE;
/*!40000 ALTER TABLE `pedido` DISABLE KEYS */;
INSERT INTO `pedido` VALUES (1,3,'delivery','tarjeta','en_camino','2025-02-01 10:00:00.000000','2025-02-01 10:15:00.000000',33.00,5.00,38.00,'Zona Clientes, Calle Falsa 123','a domicilio',0,NULL,1,NULL,NULL),(2,4,'delivery','tarjeta','entregado','2025-01-20 09:00:00.000000','2025-01-20 12:45:00.000000',45.00,5.00,50.00,'Barrio Lomas 55','a domicilio',0,NULL,1,NULL,NULL),(3,5,'delivery','tarjeta','fallido','2025-01-22 08:30:00.000000','2025-01-22 11:10:00.000000',28.00,5.00,33.00,'Residencial Norte 22','a domicilio',0,NULL,1,NULL,NULL),(4,6,'delivery','tarjeta','entregado','2025-01-25 14:00:00.000000','2025-01-25 16:45:00.000000',52.00,5.00,57.00,'Condominio Central 3B','a domicilio',0,NULL,1,NULL,NULL),(5,4,'delivery','tarjeta','asignado','2025-02-02 09:10:00.000000','2025-02-02 09:35:00.000000',30.00,5.00,35.00,'Barrio Lomas 55','a domicilio',0,NULL,1,NULL,NULL),(6,5,'delivery','tarjeta','entregado','2025-01-28 17:00:00.000000','2025-01-28 19:20:00.000000',36.00,5.00,41.00,'Residencial Norte 22','a domicilio',0,NULL,1,NULL,NULL),(7,3,'delivery','tarjeta','pendiente','2025-02-10 09:15:00.000000','2025-02-10 09:15:00.000000',33.00,5.00,38.00,'Av. Siempre Viva 742','a domicilio',0,NULL,1,NULL,NULL),(8,3,'delivery','tarjeta','pendiente','2025-02-10 11:30:00.000000','2025-02-10 11:30:00.000000',33.00,5.00,38.00,'Residencial Norte 22','a domicilio',0,NULL,1,NULL,NULL),(9,3,'delivery','tarjeta','pendiente','2025-02-11 08:45:00.000000','2025-02-11 08:45:00.000000',33.00,5.00,38.00,'Barrio Lomas 55','a domicilio',0,NULL,1,NULL,NULL),(10,3,'delivery','tarjeta','pendiente','2025-12-18 12:30:00.000000','2025-12-18 12:30:00.000000',48.00,5.00,53.00,'Zona Clientes, Calle Falsa 123','a domicilio',0,NULL,1,NULL,NULL),(11,4,'delivery','tarjeta','procesando','2025-12-18 15:15:00.000000','2025-12-18 15:25:00.000000',64.00,5.00,69.00,'Barrio Lomas 55','a domicilio',0,NULL,1,NULL,NULL),(12,5,'delivery','tarjeta','entregado','2025-12-18 18:05:00.000000','2025-12-18 19:00:00.000000',72.00,5.00,77.00,'Residencial Norte 22','a domicilio',0,NULL,1,NULL,NULL),(13,6,'delivery','tarjeta','entregado','2025-12-18 21:30:00.000000','2025-12-18 21:55:00.000000',90.00,5.00,95.00,'Condominio Central 3B','a domicilio',0,NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedido_item`
--

DROP TABLE IF EXISTS `pedido_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedido_item` (
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `id_lote` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_pedido`,`id_producto`,`id_lote`),
  KEY `FK_6bd02654b260aad181db6794602` (`id_producto`),
  KEY `FK_b7d8b7c9229f6546aa7f789770a` (`id_lote`),
  CONSTRAINT `FK_6bd02654b260aad181db6794602` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`),
  CONSTRAINT `FK_b7d8b7c9229f6546aa7f789770a` FOREIGN KEY (`id_lote`) REFERENCES `lote` (`id_lote`),
  CONSTRAINT `FK_c33c2df3ca04bbfb5698af13ecb` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedido_item`
--

LOCK TABLES `pedido_item` WRITE;
/*!40000 ALTER TABLE `pedido_item` DISABLE KEYS */;
INSERT INTO `pedido_item` VALUES (1,1,1,2,10.00),(1,15,3,1,13.00),(2,1,1,2,10.00),(2,15,3,1,13.00),(3,1,1,2,10.00),(3,15,3,1,13.00),(4,1,1,2,10.00),(4,15,3,1,13.00),(5,1,1,2,10.00),(5,15,3,1,13.00),(6,1,1,2,10.00),(6,15,3,1,13.00),(7,1,1,2,10.00),(7,15,3,1,13.00),(8,1,1,2,10.00),(8,15,3,1,13.00),(9,1,1,2,10.00),(9,15,3,1,13.00),(10,1,1,3,10.00),(10,15,3,1,13.00),(11,6,4,2,16.50),(11,11,2,4,7.00),(12,13,5,3,10.00),(12,15,3,2,13.00),(13,1,1,4,10.00),(13,6,4,2,16.50);
/*!40000 ALTER TABLE `pedido_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `imagen_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Manzana Roja 1kg','Manzana fresca por kilogramo.',10.00,'/images/frutas/manzana.jpg'),(2,'Banana 1kg','Bananas frescas por kg.',8.00,'/images/frutas/banana.jpg'),(3,'Tomate 1kg','Tomate fresco de huerta.',6.50,'/images/frutas/tomate.jpg'),(4,'Lechuga','Lechuga fresca lista para ensaladas.',5.00,'/images/frutas/lechuga.jpg'),(5,'Cebolla 1kg','Cebolla blanca por kilogramo.',4.50,'/images/frutas/cebolla.jpg'),(6,'Jamón Cerdo 200g','Rebanado.',16.50,'/images/fiambres/jamon.jpg'),(7,'Salchicha Vienesa 1kg','Paquete familiar.',22.00,'/images/fiambres/salchicha.jpg'),(8,'Mortadela 500g','Familiar.',14.00,'/images/fiambres/mortadela.jpg'),(9,'Chorizo parrillero','Para asados.',18.00,'/images/fiambres/chorizo.jpg'),(10,'Tocino','Ahumado.',20.00,'/images/fiambres/tocino.jpg'),(11,'Leche Pil 1L','Leche entera pasteurizada.',7.00,'/images/lacteos/leche.jpg'),(12,'Queso cheddar 200g','Queso cheddar en láminas.',18.00,'/images/fiambres/cheddar.jpg'),(13,'Yogurt Bebible 1L','Sabor frutilla.',10.00,'/images/lacteos/yogurt.jpg'),(14,'Mantequilla Pil 200g','Mantequilla con sal.',12.00,'/images/lacteos/mantequilla.jpg'),(15,'Coca-Cola 3L','Refresco gaseoso sabor cola.',13.00,'/images/bebidas/CocaCola-3l.png'),(16,'Sprite 2L','Refresco sabor lima-limón.',10.00,'/images/bebidas/sprite.jpg'),(17,'Jugos del Valle 1L','Jugo sabor durazno.',12.00,'/images/bebidas/valle.jpg'),(18,'Doritos 90g','Nachos sabor queso.',8.00,'/images/snacks/doritos.jpg'),(19,'Maní salado 200g','Bolsa de maní salado.',7.00,'/images/snacks/mani.jpg'),(20,'Oreo 120g','Galletas Oreo clásicas.',6.00,'/images/snacks/oreo.jpg'),(21,'Chizitos 90g','Snacks de queso.',5.00,'/images/snacks/chizitos.jpg'),(22,'Pringles','Papas fritas en tubo, sabor original.',16.00,'/images/snacks/pringles.jpg'),(23,'Alimento perro 3kg','Croquetas sabor carne para perros adultos.',45.00,'/images/mascotas/perro.jpg'),(24,'Alimento gato 1.5kg','Alimento balanceado para gatos.',38.00,'/images/mascotas/gato.jpg'),(25,'Pan marraqueta','Pan de batalla tradicional (unidad).',0.50,'/images/panaderia/marraqueta.jpg'),(26,'Pan molde 500g','Pan blanco para sándwich.',12.00,'/images/panaderia/molde.jpg'),(27,'Torta de chocolate','Porción individual de torta de chocolate.',8.00,'/images/panaderia/torta.jpg'),(28,'Lavandina 1L','Desinfectante multiuso.',9.00,'/images/hogar/lavandina.jpg'),(29,'Detergente líquido 1L','Detergente líquido para ropa y superficies.',12.00,'/images/hogar/detergente.jpg'),(30,'Ambientador Glade','Aroma lavanda en aerosol.',18.00,'/images/hogar/glade.jpg'),(31,'Shampoo H&S','Anticaspa.',25.00,'/images/personal/shampoo.jpg'),(32,'Jabón Dove','Hidratante.',7.00,'/images/personal/dove.jpg'),(33,'Crema Nivea','Hidratante corporal.',18.00,'/images/personal/nivea.jpg'),(34,'Desodorante Rexona','Spray.',16.00,'/images/personal/rexona.jpg'),(35,'Cepillo dental Colgate','Ultra suave.',6.00,'/images/personal/cepillo.jpg'),(36,'Nuggets Dino 1kg','Nuggets de pollo congelados.',65.00,'/images/congelados/nuggets.jpg'),(37,'Pizza congelada','Pizza de jamón y queso lista para hornear.',35.00,'/images/congelados/pizza.jpg'),(38,'Helado vainilla 1L','Postre helado familiar.',22.00,'/images/congelados/helado.jpg'),(39,'Pañales Huggies G','30 unidades.',40.00,'/images/bebe/panales.jpg'),(40,'Toallitas húmedas','80 unidades.',12.00,'/images/bebe/toallitas.jpg'),(41,'Shampoo bebé','Suave.',14.00,'/images/bebe/shampoo.jpg'),(42,'Crema para bebé','Suavizante.',18.00,'/images/bebe/crema.jpg'),(43,'Talco para bebé','Clásico.',10.00,'/images/bebe/talco.jpg'),(44,'Pollo entero','Pollo congelado.',28.00,'/images/carnes/pollo.jpg'),(45,'Carne Molida 1kg','De res.',35.00,'/images/carnes/molida.jpg'),(46,'Costilla de res','Para asado.',42.00,'/images/carnes/costilla.jpg'),(47,'Bistec 1kg','Corte fino.',38.00,'/images/carnes/bistec.jpg'),(48,'Pierna de cerdo','Corte fresco.',33.00,'/images/carnes/cerdo.jpg');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto_categoria`
--

DROP TABLE IF EXISTS `producto_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto_categoria` (
  `id_producto` int NOT NULL,
  `id_categoria` int NOT NULL,
  PRIMARY KEY (`id_producto`,`id_categoria`),
  KEY `FK_9f04ed1e2a63eae51ee64a29abe` (`id_categoria`),
  CONSTRAINT `FK_929b39d1a55be11b61ec1ade205` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`) ON DELETE CASCADE,
  CONSTRAINT `FK_9f04ed1e2a63eae51ee64a29abe` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto_categoria`
--

LOCK TABLES `producto_categoria` WRITE;
/*!40000 ALTER TABLE `producto_categoria` DISABLE KEYS */;
INSERT INTO `producto_categoria` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,2),(7,2),(8,2),(9,2),(10,2),(11,3),(12,3),(13,3),(14,3),(15,4),(16,4),(17,4),(18,5),(19,5),(20,5),(21,5),(22,5),(23,6),(24,6),(25,7),(26,7),(27,7),(28,8),(29,8),(30,8),(31,9),(32,9),(33,9),(34,9),(35,9),(36,10),(37,10),(38,10),(39,11),(40,11),(41,11),(42,11),(43,11),(44,12),(45,12),(46,12),(47,12),(48,12);
/*!40000 ALTER TABLE `producto_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'Distribuidora Central','29000001','central@proveedores.com','Av. Principal 123'),(2,'Lácteos Andinos','29000002','lacteos@proveedores.com','Av. Lechera 456');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reembolso`
--

DROP TABLE IF EXISTS `reembolso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reembolso` (
  `id_devolucion` int NOT NULL AUTO_INCREMENT,
  `id_usuario_vendedor` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` varchar(255) NOT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `id_pedido` int NOT NULL,
  PRIMARY KEY (`id_devolucion`),
  KEY `FK_85d471528ec8bf65b49398839cd` (`id_usuario_vendedor`),
  KEY `FK_4ddb4847a08c41b8781ecd0bfd6` (`id_pedido`),
  CONSTRAINT `FK_4ddb4847a08c41b8781ecd0bfd6` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  CONSTRAINT `FK_85d471528ec8bf65b49398839cd` FOREIGN KEY (`id_usuario_vendedor`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reembolso`
--

LOCK TABLES `reembolso` WRITE;
/*!40000 ALTER TABLE `reembolso` DISABLE KEYS */;
INSERT INTO `reembolso` VALUES (1,1,'2025-02-02 11:00:00','Producto dañado en el envío',10.00,1),(2,1,'2025-12-18 20:00:00','Cliente solicitó devolución parcial',15.00,11);
/*!40000 ALTER TABLE `reembolso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'ADMIN'),(2,'REPARTIDOR'),(3,'CLIENTE');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sancion_usuario`
--

DROP TABLE IF EXISTS `sancion_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sancion_usuario` (
  `id_sancion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_envio` int NOT NULL,
  `motivo` text NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`id_sancion`),
  KEY `FK_27d17ad076e708d9b6f779e0e7d` (`id_usuario`),
  KEY `FK_5780bc20488ecae5b435c2b4fb9` (`id_envio`),
  CONSTRAINT `FK_27d17ad076e708d9b6f779e0e7d` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `FK_5780bc20488ecae5b435c2b4fb9` FOREIGN KEY (`id_envio`) REFERENCES `envio` (`id_envio`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sancion_usuario`
--

LOCK TABLES `sancion_usuario` WRITE;
/*!40000 ALTER TABLE `sancion_usuario` DISABLE KEYS */;
INSERT INTO `sancion_usuario` VALUES (1,2,1,'Retraso en la entrega sin justificar.','2025-02-02 09:00:00','2025-02-05 09:00:00','activa');
/*!40000 ALTER TABLE `sancion_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `ci` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`ci`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `direccion` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `ci` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `estado_cuenta` varchar(20) NOT NULL DEFAULT 'activo',
  `es_admin_principal` tinyint NOT NULL DEFAULT '0',
  `fecha_registro` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `IDX_2863682842e688ca198eb25c12` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Calle Admin 123','$2b$10$OUr6pZUawJEgk6I4nvWiDeYLwWtFoCnmAJC2ZjwazmwWDqbZI1cN2','Admin','Principal','10000001','admin@mklite.com','70000001','activo',1,'2025-12-18 05:15:45.000000'),(2,'Zona Repartidores','$2b$10$S08rTjAAv5o.aX..FJJjKufxku8d8G.unBsN7qx6l46xHzbN7M.fO','Carlos','Repartidor','10000002','repartidor@mklite.com','70000002','activo',0,'2025-12-18 05:15:45.000000'),(3,'Zona Clientes','$2b$10$WZqwp5swVULFlkYFFuwQ.ebrvG9tZlU1kVkrxmZjjl.LYKdvIz7F.','Lucía','Cliente','10000003','cliente@mklite.com','70000003','activo',0,'2025-12-18 05:15:45.000000'),(4,'Barrio Lomas 55','$2b$10$WZqwp5swVULFlkYFFuwQ.ebrvG9tZlU1kVkrxmZjjl.LYKdvIz7F.','Andrés','Mendoza','10000004','andres@mklite.com','70000004','activo',0,'2025-12-18 05:15:45.000000'),(5,'Residencial Norte 22','$2b$10$WZqwp5swVULFlkYFFuwQ.ebrvG9tZlU1kVkrxmZjjl.LYKdvIz7F.','Valeria','Soto','10000005','valeria@mklite.com','70000005','activo',0,'2025-12-18 05:15:45.000000'),(6,'Condominio Central 3B','$2b$10$WZqwp5swVULFlkYFFuwQ.ebrvG9tZlU1kVkrxmZjjl.LYKdvIz7F.','Diego','Rivas','10000006','diego@mklite.com','70000006','activo',0,'2025-12-18 05:15:45.000000'),(7,'Av. Libertad 123','$2b$10$S08rTjAAv5o.aX..FJJjKufxku8d8G.unBsN7qx6l46xHzbN7M.fO','Mariana','Quispe','10000007','repartidor1@mklite.com','70000007','activo',0,'2025-12-18 05:15:45.000000'),(8,'Calle Mayor 88','$2b$10$S08rTjAAv5o.aX..FJJjKufxku8d8G.unBsN7qx6l46xHzbN7M.fO','Luis','Torres','10000008','repartidor2@mklite.com','70000008','activo',0,'2025-12-18 05:15:45.000000'),(9,'Zona Sur 101','$2b$10$S08rTjAAv5o.aX..FJJjKufxku8d8G.unBsN7qx6l46xHzbN7M.fO','Ana','Paredes','10000009','repartidor3@mklite.com','70000009','activo',0,'2025-12-18 05:15:45.000000'),(10,'Villa Nueva 45','$2b$10$S08rTjAAv5o.aX..FJJjKufxku8d8G.unBsN7qx6l46xHzbN7M.fO','Jorge','Vega','10000010','repartidor4@mklite.com','70000010','activo',0,'2025-12-18 05:15:45.000000');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_rol`
--

DROP TABLE IF EXISTS `usuario_rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_rol` (
  `id_usuario` int NOT NULL,
  `id_rol` int NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `FK_96d2a6ecb2ad0931416610845cf` (`id_rol`),
  CONSTRAINT `FK_6adca3617fc69b2864e67196f2a` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `FK_96d2a6ecb2ad0931416610845cf` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_rol`
--

LOCK TABLES `usuario_rol` WRITE;
/*!40000 ALTER TABLE `usuario_rol` DISABLE KEYS */;
INSERT INTO `usuario_rol` VALUES (1,1),(2,2),(7,2),(8,2),(9,2),(10,2),(3,3),(4,3),(5,3),(6,3);
/*!40000 ALTER TABLE `usuario_rol` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18  6:59:36

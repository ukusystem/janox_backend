-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: general
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `general`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `general` /*!40100 DEFAULT CHARACTER SET utf8mb4 */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `general`;

--
-- Table structure for table `acceso`
--

DROP TABLE IF EXISTS `acceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acceso` (
  `a_id` int NOT NULL AUTO_INCREMENT,
  `serie` bigint unsigned NOT NULL,
  `administrador` tinyint NOT NULL,
  `p_id` int NOT NULL,
  `ea_id` int NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`a_id`),
  KEY `fk_acceso_equipoacceso_ea_id_idx` (`ea_id`) /*!80000 INVISIBLE */,
  KEY `fk_acceso_personal_p_id_idx` (`p_id`),
  CONSTRAINT `fk_acceso_equipoacceso_ea_id` FOREIGN KEY (`ea_id`) REFERENCES `equipoacceso` (`ea_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_acceso_personal_p_id` FOREIGN KEY (`p_id`) REFERENCES `personal` (`p_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acceso`
--

LOCK TABLES `acceso` WRITE;
/*!40000 ALTER TABLE `acceso` DISABLE KEYS */;
INSERT INTO `acceso` VALUES (1,1,0,1,1,0),(2,1,0,1,1,0),(3,1,0,1,1,0),(4,1,0,1,1,0),(5,1,0,1,1,0),(6,1,0,1,1,0),(7,1,0,1,1,0),(8,1,0,1,1,0),(9,1,0,1,1,0),(10,1,0,1,1,0),(11,1,0,1,1,0),(12,1,0,1,1,0),(13,1,0,1,1,0),(14,1,0,1,1,0),(15,1,0,1,1,0),(16,1,0,1,1,0),(17,1,0,1,1,0),(18,1,0,1,1,0),(19,1,0,1,1,0),(20,1,0,1,1,0),(21,1,0,1,1,0),(22,1,0,1,1,0),(23,1,0,1,1,0),(24,1,0,1,1,0),(25,1,0,1,1,0),(26,1,0,1,1,0),(27,1,0,1,1,0),(28,1,0,1,1,0),(29,1,0,1,1,0),(30,1,0,1,1,0),(31,1,0,1,1,0),(32,1,0,1,1,0),(33,1,0,1,1,0),(34,1,0,1,1,0),(35,1,0,1,1,0),(36,1,0,1,1,0),(37,1,0,1,1,0),(38,1,0,1,1,0),(39,1,0,1,1,0),(40,1,0,1,1,0),(41,1,0,1,1,0),(42,1,0,1,1,0),(43,1,0,1,1,0),(44,1,0,1,1,0),(45,1,0,1,1,0),(46,1,0,1,1,0),(47,1,0,1,1,0),(48,1,0,1,1,0),(49,1,0,1,1,0),(50,1,0,1,1,0),(51,1,0,1,1,0),(52,1,0,1,1,0),(53,1,0,1,1,0),(54,1,0,1,1,0),(55,1,0,1,1,0),(56,1,0,1,1,0),(57,1,0,1,1,0),(58,1,0,1,1,0),(59,1,0,1,1,0),(60,1,0,1,1,0),(61,1,0,1,1,0),(62,1,0,1,1,0),(63,1,0,1,1,0),(64,1,0,1,1,0),(65,1,0,1,1,0),(66,1,0,1,1,0),(67,1,0,1,1,0),(68,1,0,1,1,0),(69,1,0,1,1,0),(70,1,0,1,1,0),(71,1,0,1,1,0),(72,1,0,1,1,0),(73,1,0,1,1,0),(74,1,0,1,1,0),(75,1,0,1,1,0),(76,1,0,1,1,0),(77,1,0,1,1,0),(78,1,0,1,1,0),(79,1,0,1,1,0),(80,1,0,1,1,0),(81,1,0,1,1,0),(82,1,0,1,1,0),(83,1,0,1,1,0),(84,1,0,1,1,0),(85,1,0,1,1,0),(86,1,0,1,1,0),(87,1,0,1,1,0),(88,1,0,1,1,0),(89,1,0,1,1,0),(90,1,0,1,1,0),(91,1,0,1,1,0),(92,1,0,1,1,0),(93,1,0,1,1,0),(94,1,0,1,1,0),(95,1,0,1,1,0),(96,1,0,1,1,0),(97,1,0,1,1,0),(98,1,0,1,1,0),(99,1,0,1,1,0),(100,1,0,1,1,0);
/*!40000 ALTER TABLE `acceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargo`
--

DROP TABLE IF EXISTS `cargo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargo` (
  `c_id` int NOT NULL AUTO_INCREMENT,
  `cargo` varchar(100) NOT NULL,
  PRIMARY KEY (`c_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargo`
--

LOCK TABLES `cargo` WRITE;
/*!40000 ALTER TABLE `cargo` DISABLE KEYS */;
INSERT INTO `cargo` VALUES (1,'Gerente de proyecto'),(2,'Supervisor de Seguridad'),(3,'Técnico de Instalación'),(4,'Analista de Seguridad'),(5,'Operador de Monitoreo'),(6,'Consultora de Seguridad'),(7,'Técnico de Mantenimiento'),(8,'Especialista en Seguridad'),(9,'Coordinador de Seguridad'),(10,'Analista de Riesgos'),(11,'Diseñador UI/UX'),(12,'Desarrollador de software'),(13,'Jefe de desarrollo'),(14,'Analista QA'),(15,'Desarrollador web');
/*!40000 ALTER TABLE `cargo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `conf_id` int NOT NULL AUTO_INCREMENT,
  `nombreempresa` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `correoadministrador` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `celular` int NOT NULL DEFAULT '0',
  `com` varchar(6) NOT NULL DEFAULT '',
  PRIMARY KEY (`conf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,'Everytel','admin@gmail.com',0,'');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrata`
--

DROP TABLE IF EXISTS `contrata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrata` (
  `co_id` int NOT NULL AUTO_INCREMENT,
  `contrata` varchar(100) NOT NULL,
  `r_id` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  `updated_at` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`co_id`),
  KEY `fk_contrata_rubro_r_id_idx` (`r_id`),
  CONSTRAINT `fk_contrata_rubro_r_id` FOREIGN KEY (`r_id`) REFERENCES `rubro` (`r_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrata`
--

LOCK TABLES `contrata` WRITE;
/*!40000 ALTER TABLE `contrata` DISABLE KEYS */;
INSERT INTO `contrata` VALUES (1,'Contrata A',1,'Descripción',1,'2025-05-13 21:05:09','2025-01-01 00:00:00');
/*!40000 ALTER TABLE `contrata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `controlador`
--

DROP TABLE IF EXISTS `controlador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `controlador` (
  `ctrl_id` int NOT NULL AUTO_INCREMENT,
  `nodo` varchar(100) NOT NULL,
  `rgn_id` int NOT NULL,
  `direccion` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `serie` varchar(100) NOT NULL,
  `ip` varchar(15) NOT NULL,
  `mascara` varchar(15) NOT NULL,
  `puertaenlace` varchar(15) NOT NULL,
  `puerto` smallint unsigned NOT NULL,
  `personalgestion` varchar(100) NOT NULL,
  `personalimplementador` varchar(100) NOT NULL,
  `seguridad` tinyint NOT NULL,
  `conectado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  `modo` tinyint NOT NULL DEFAULT '0',
  `motionrecordseconds` int NOT NULL DEFAULT '30',
  `res_id_motionrecord` int NOT NULL DEFAULT '3',
  `motionrecordfps` int NOT NULL DEFAULT '30',
  `motionsnapshotseconds` int NOT NULL DEFAULT '30',
  `res_id_motionsnapshot` int NOT NULL DEFAULT '3',
  `motionsnapshotinterval` int NOT NULL DEFAULT '5',
  `res_id_streamprimary` int NOT NULL DEFAULT '3',
  `streamprimaryfps` int NOT NULL DEFAULT '30',
  `res_id_streamsecondary` int NOT NULL DEFAULT '2',
  `streamsecondaryfps` int NOT NULL DEFAULT '30',
  `res_id_streamauxiliary` int NOT NULL DEFAULT '1',
  `streamauxiliaryfps` int NOT NULL DEFAULT '30',
  `celular` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ctrl_id`),
  KEY `fk_controlador_region_rgn_id_idx` (`rgn_id`) USING BTREE,
  KEY `fk_controlador_resolucion_res_id_1_idx` (`res_id_motionrecord`),
  KEY `fk_controlador_resolucion_res_id_2_idx` (`res_id_motionsnapshot`),
  KEY `fk_controlador_resolucion_res_id_3_idx` (`res_id_streamprimary`),
  KEY `fk_controlador_resolucion_res_id_4_idx` (`res_id_streamsecondary`),
  KEY `fk_controlador_resolucion_res_id_5_idx` (`res_id_streamauxiliary`),
  CONSTRAINT `fk_controlador_region_rgn_id` FOREIGN KEY (`rgn_id`) REFERENCES `region` (`rgn_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_1` FOREIGN KEY (`res_id_motionrecord`) REFERENCES `resolucion` (`res_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_controlador_resolucion_res_id_2` FOREIGN KEY (`res_id_motionsnapshot`) REFERENCES `resolucion` (`res_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_3` FOREIGN KEY (`res_id_streamprimary`) REFERENCES `resolucion` (`res_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_4` FOREIGN KEY (`res_id_streamsecondary`) REFERENCES `resolucion` (`res_id`),
  CONSTRAINT `fk_controlador_resolucion_res_id_5` FOREIGN KEY (`res_id_streamauxiliary`) REFERENCES `resolucion` (`res_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `controlador`
--

LOCK TABLES `controlador` WRITE;
/*!40000 ALTER TABLE `controlador` DISABLE KEYS */;
/*!40000 ALTER TABLE `controlador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipoacceso`
--

DROP TABLE IF EXISTS `equipoacceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipoacceso` (
  `ea_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`ea_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipoacceso`
--

LOCK TABLES `equipoacceso` WRITE;
/*!40000 ALTER TABLE `equipoacceso` DISABLE KEYS */;
INSERT INTO `equipoacceso` VALUES (1,'Tarjeta'),(2,'Teclado'),(3,'Biometrica');
/*!40000 ALTER TABLE `equipoacceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipoentrada`
--

DROP TABLE IF EXISTS `equipoentrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipoentrada` (
  `ee_id` int NOT NULL AUTO_INCREMENT,
  `detector` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`ee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipoentrada`
--

LOCK TABLES `equipoentrada` WRITE;
/*!40000 ALTER TABLE `equipoentrada` DISABLE KEYS */;
INSERT INTO `equipoentrada` VALUES (1,'General','D1',1),(2,'Detector de movimiento','D2',1),(3,'Detector de calor','D3',1),(4,'Detector de gas','D4',1),(5,'Detector de intrusión','D5',1),(6,'Detector de vibración','D6',1),(7,'Detector de agua','D7',1),(8,'Detector de luz','D8',1),(9,'Detector de sonido','D9',1),(10,'Detector de proximidad','D10',1),(11,'Boton','D11',1),(12,'Interruptor','D12',1),(13,'Contacto magnético','D13',1),(14,'Detector de rotura de vidrio','D14',1),(15,'Detector de humo','D15',1),(16,'Pulsador de incendio','D16',1),(17,'Tapa de buzón','D17',1),(18,'Detector de energía','D18',1);
/*!40000 ALTER TABLE `equipoentrada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equiposalida`
--

DROP TABLE IF EXISTS `equiposalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equiposalida` (
  `es_id` int NOT NULL AUTO_INCREMENT,
  `actuador` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`es_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equiposalida`
--

LOCK TABLES `equiposalida` WRITE;
/*!40000 ALTER TABLE `equiposalida` DISABLE KEYS */;
INSERT INTO `equiposalida` VALUES (1,'General','A1',1),(2,'Iluminación (Control de luz)','A2',1),(3,'Ventilación (Aire acondicionado)','A3',1),(4,'Calefacción (Control de temperatura)','A4',1),(5,'Persianas (Control de apertura/cierre)','A5',1),(6,'Alarma (Activación/desactivación)','A6',1),(7,'Riego automático','A7',1),(8,'Audio (Control de altavoces)','A8',1),(9,'Video (Control de cámaras)','A9',1),(10,'Control de humedad','A10',1),(11,'Control de gas','A11',1),(12,'Control de agua','A12',1),(13,'Control de energía','A13',1),(14,'Control de movimiento','A14',1),(15,'Control de acceso','A15',1),(16,'Control de seguridad','A16',1),(17,'Control de emergencia','A17',1),(18,'Control de tráfico','A18',1),(19,'Control de elevadores','A19',1),(20,'Control de ascensores','A20',1),(21,'Alarma contra incendio','A21',1),(22,'Acceso (Apertura de puerta)','A22',1),(23,'Alarma de energía','A23',1);
/*!40000 ALTER TABLE `equiposalida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `estd_id` int NOT NULL AUTO_INCREMENT,
  `estado` varchar(100) NOT NULL,
  PRIMARY KEY (`estd_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,'Esperando'),(2,'Aceptado'),(3,'Cancelado'),(4,'Rechazado'),(5,'Completado'),(6,'Error'),(7,'Montado'),(8,'Desmontado'),(9,'Expulsado'),(10,'Timeout'),(11,'Ejecutado'),(12,'Desconectado'),(13,'MalFormato'),(14,'Inexistente'),(15,'Invalido'),(16,'Finalizado'),(17,'Anulado'),(18,'NoAtendido'),(19,'Montando'),(20,'Expulsado'),(21,'Asistido'),(22,'Inasistencia');
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firmware`
--

DROP TABLE IF EXISTS `firmware`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `firmware` (
  `f_id` int NOT NULL AUTO_INCREMENT,
  `archivo` varchar(200) NOT NULL,
  `mayor` int unsigned NOT NULL,
  `menor` int unsigned NOT NULL,
  `parche` int unsigned NOT NULL,
  PRIMARY KEY (`f_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmware`
--

LOCK TABLES `firmware` WRITE;
/*!40000 ALTER TABLE `firmware` DISABLE KEYS */;
/*!40000 ALTER TABLE `firmware` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `general_audit`
--

DROP TABLE IF EXISTS `general_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `general_audit` (
  `ga_id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` varchar(250) NOT NULL,
  `new_value` varchar(250) NOT NULL,
  `personal` varchar(250) NOT NULL,
  `datetime` timestamp NOT NULL,
  PRIMARY KEY (`ga_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `general_audit`
--

LOCK TABLES `general_audit` WRITE;
/*!40000 ALTER TABLE `general_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `general_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `m_id` int NOT NULL AUTO_INCREMENT,
  `marca` varchar(100) NOT NULL,
  PRIMARY KEY (`m_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES (1,'Dahua'),(2,'Hikvision'),(3,'Axis');
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `n_id` int NOT NULL AUTO_INCREMENT,
  `n_uuid` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `evento` varchar(250) NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `mensaje` varchar(250) NOT NULL,
  `data` json DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`n_id`),
  UNIQUE KEY `n_uuid` (`n_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion_usuario`
--

DROP TABLE IF EXISTS `notificacion_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion_usuario` (
  `nu_id` varchar(250) NOT NULL,
  `u_id` int NOT NULL,
  `n_uuid` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` timestamp NOT NULL,
  `fecha_entrega` timestamp NOT NULL,
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  `leido` tinyint NOT NULL,
  PRIMARY KEY (`nu_id`),
  UNIQUE KEY `unique_user_notification` (`u_id`,`n_uuid`),
  KEY `n_uuid` (`n_uuid`),
  KEY `u_id` (`u_id`),
  CONSTRAINT `notificacion_usuario_ibfk_1` FOREIGN KEY (`n_uuid`) REFERENCES `notificacion` (`n_uuid`),
  CONSTRAINT `notificacion_usuario_ibfk_2` FOREIGN KEY (`u_id`) REFERENCES `usuario` (`u_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion_usuario`
--

LOCK TABLES `notificacion_usuario` WRITE;
/*!40000 ALTER TABLE `notificacion_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacion_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal`
--

DROP TABLE IF EXISTS `personal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal` (
  `p_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `apellido` varchar(30) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `dni` varchar(12) NOT NULL,
  `c_id` int NOT NULL,
  `co_id` int NOT NULL,
  `foto` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`p_id`),
  KEY `fk_personal_contrata_co_id_idx` (`co_id`),
  KEY `fk_personal_cargo_c_id_idx` (`c_id`),
  CONSTRAINT `fk_personal_cargo_c_id` FOREIGN KEY (`c_id`) REFERENCES `cargo` (`c_id`),
  CONSTRAINT `fk_personal_contrata_co_id` FOREIGN KEY (`co_id`) REFERENCES `contrata` (`co_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal`
--

LOCK TABLES `personal` WRITE;
/*!40000 ALTER TABLE `personal` DISABLE KEYS */;
INSERT INTO `personal` VALUES (1,'Nombre','Apellido','987654321','87654321',1,1,'photos/registered/foto1.png','user@gmail.com',1);
/*!40000 ALTER TABLE `personal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferenciasvms`
--

DROP TABLE IF EXISTS `preferenciasvms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferenciasvms` (
  `prfvms_id` int NOT NULL AUTO_INCREMENT,
  `preferencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `u_id` int NOT NULL,
  `configdata` json NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`prfvms_id`),
  KEY `fk_preferenciasvms_usuario_u_id_idx` (`u_id`),
  CONSTRAINT `fk_preferenciasvms_usuario_u_id` FOREIGN KEY (`u_id`) REFERENCES `usuario` (`u_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferenciasvms`
--

LOCK TABLES `preferenciasvms` WRITE;
/*!40000 ALTER TABLE `preferenciasvms` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferenciasvms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `region`
--

DROP TABLE IF EXISTS `region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `region` (
  `rgn_id` int NOT NULL AUTO_INCREMENT,
  `region` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`rgn_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `region`
--

LOCK TABLES `region` WRITE;
/*!40000 ALTER TABLE `region` DISABLE KEYS */;
/*!40000 ALTER TABLE `region` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_actividad`
--

DROP TABLE IF EXISTS `registro_actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_actividad` (
  `id_actividad` int NOT NULL AUTO_INCREMENT,
  `nombre_tabla` varchar(255) NOT NULL,
  `id_registro` int NOT NULL,
  `tipo_operacion` enum('INSERCION','ACTUALIZACION','ELIMINACION') NOT NULL,
  `valores_anteriores` json DEFAULT NULL,
  `valores_nuevos` json DEFAULT NULL,
  `realizado_por` varchar(255) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_actividad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_actividad`
--

LOCK TABLES `registro_actividad` WRITE;
/*!40000 ALTER TABLE `registro_actividad` DISABLE KEYS */;
/*!40000 ALTER TABLE `registro_actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrored`
--

DROP TABLE IF EXISTS `registrored`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrored` (
  `rr_id` int NOT NULL AUTO_INCREMENT,
  `ctrl_id` int NOT NULL,
  `fecha` timestamp NOT NULL,
  `estado` tinyint NOT NULL,
  PRIMARY KEY (`rr_id`),
  KEY `fk_registrored_controlador_co_id_idx` (`ctrl_id`),
  CONSTRAINT `fk_registrored_controlador_co_id` FOREIGN KEY (`ctrl_id`) REFERENCES `controlador` (`ctrl_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrored`
--

LOCK TABLES `registrored` WRITE;
/*!40000 ALTER TABLE `registrored` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrored` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resolucion`
--

DROP TABLE IF EXISTS `resolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resolucion` (
  `res_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `relacionaspecto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ancho` int NOT NULL,
  `altura` int NOT NULL,
  PRIMARY KEY (`res_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resolucion`
--

LOCK TABLES `resolucion` WRITE;
/*!40000 ALTER TABLE `resolucion` DISABLE KEYS */;
INSERT INTO `resolucion` VALUES (1,'SD (Standard Definition)','4:3',640,480),(2,'HD (High Definition)','16:9',960,540),(3,'Full HD (FHD)','16:9',1600,900);
/*!40000 ALTER TABLE `resolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `rl_id` int NOT NULL AUTO_INCREMENT,
  `rol` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`rl_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Invitado','Acceso de solo lectura',1),(2,'Usuario','Acceso limitado a funciones específicas',1),(3,'Supervisor','Gestión y supervisión de contenidos',1),(4,'Editor','Edición y publicación de contenidos',1),(5,'Administrador','Acceso completo a la administración del sitio',1),(6,'Desarrollador','Desarrollo y pruebas de la plataforma web',1),(7,'Analista','Análisis de datos y generación de informes',1),(8,'Consultor','Asesoramiento y recomendaciones de mejoras',1),(9,'Moderador','Moderación de comentarios y foros',1),(10,'Suscriptor','Acceso a contenido premium',1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rubro`
--

DROP TABLE IF EXISTS `rubro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rubro` (
  `r_id` int NOT NULL AUTO_INCREMENT,
  `rubro` varchar(100) NOT NULL,
  PRIMARY KEY (`r_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rubro`
--

LOCK TABLES `rubro` WRITE;
/*!40000 ALTER TABLE `rubro` DISABLE KEYS */;
INSERT INTO `rubro` VALUES (1,'Telecomunicaciones'),(2,'Eléctrica'),(3,'Industrial'),(4,'Comercial'),(5,'Residencial'),(6,'Educación'),(7,'Salud'),(8,'Transporte'),(9,'Gobierno'),(10,'Financiero'),(11,'Agricultura'),(12,'Manufactura'),(13,'Turismo'),(14,'Energía'),(15,'Medios de Comunicación'),(16,'Tecnología'),(17,'Construcción'),(18,'Entretenimiento'),(19,'Servicios'),(20,'Alimentación');
/*!40000 ALTER TABLE `rubro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipocamara`
--

DROP TABLE IF EXISTS `tipocamara`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipocamara` (
  `tc_id` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) NOT NULL,
  PRIMARY KEY (`tc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipocamara`
--

LOCK TABLES `tipocamara` WRITE;
/*!40000 ALTER TABLE `tipocamara` DISABLE KEYS */;
INSERT INTO `tipocamara` VALUES (1,'Bullet'),(2,'Domo'),(3,'Domo PTZ');
/*!40000 ALTER TABLE `tipocamara` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipotrabajo`
--

DROP TABLE IF EXISTS `tipotrabajo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipotrabajo` (
  `tt_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`tt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipotrabajo`
--

LOCK TABLES `tipotrabajo` WRITE;
/*!40000 ALTER TABLE `tipotrabajo` DISABLE KEYS */;
INSERT INTO `tipotrabajo` VALUES (1,'Telecomunicaciones'),(2,'Electricidad'),(3,'Visita'),(4,'Mantenimiento');
/*!40000 ALTER TABLE `tipotrabajo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_token`
--

DROP TABLE IF EXISTS `user_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_token` (
  `ut_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `refresh_token` varchar(500) NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `revoked` tinyint NOT NULL DEFAULT '0',
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ut_id`),
  KEY `fk_user_token_user_u_id_idx` (`user_id`),
  CONSTRAINT `fk_user_token_user_u_id` FOREIGN KEY (`user_id`) REFERENCES `usuario` (`u_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_token`
--

LOCK TABLES `user_token` WRITE;
/*!40000 ALTER TABLE `user_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `u_id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `rl_id` int NOT NULL,
  `fecha` timestamp NOT NULL,
  `p_id` int NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`u_id`),
  KEY `fk_usuario_rol_rl_id_idx` (`rl_id`),
  KEY `fk_usuario_personal_p_id_idx` (`p_id`),
  CONSTRAINT `fk_usuario_personal_p_id` FOREIGN KEY (`p_id`) REFERENCES `personal` (`p_id`),
  CONSTRAINT `fk_usuario_rol_rl_id` FOREIGN KEY (`rl_id`) REFERENCES `rol` (`rl_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin','$2a$12$WWEt2QddX66H7DWQc/3MAe4.ObsbliHdIDMU0QKWuTPJMh59K01eC',5,'2024-01-01 05:00:00',1,1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `nodo`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `nodo` /*!40100 DEFAULT CHARACTER SET utf8mb4 */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `nodo`;

--
-- Table structure for table `actividadpersonal`
--

DROP TABLE IF EXISTS `actividadpersonal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividadpersonal` (
  `ap_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `apellido` varchar(30) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `dni` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `c_id` int NOT NULL,
  `co_id` int NOT NULL,
  `rt_id` int NOT NULL,
  `foto` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ap_id`),
  KEY `fk_actividadpersonal_registroticket_rt_id_idx` (`rt_id`),
  KEY `fk_actividadpersonal_contrata_co_id_idx` (`co_id`),
  KEY `fk_actividadpersonal_cargo_c_id_idx` (`c_id`),
  CONSTRAINT `fk_actividadpersonal_cargo_c_id` FOREIGN KEY (`c_id`) REFERENCES `general`.`cargo` (`c_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_actividadpersonal_contrata_co_id` FOREIGN KEY (`co_id`) REFERENCES `general`.`contrata` (`co_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_actividadpersonal_registroticket_rt_id` FOREIGN KEY (`rt_id`) REFERENCES `registroticket` (`rt_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividadpersonal`
--

LOCK TABLES `actividadpersonal` WRITE;
/*!40000 ALTER TABLE `actividadpersonal` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividadpersonal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archivoticket`
--

DROP TABLE IF EXISTS `archivoticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archivoticket` (
  `at_id` int NOT NULL AUTO_INCREMENT,
  `ruta` varchar(100) NOT NULL,
  `nombreoriginal` varchar(100) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `rt_id` int NOT NULL,
  `tamaño` int NOT NULL,
  `thumbnail` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`at_id`),
  KEY `fk_archivoticket_registroticket_rt_id_idx` (`rt_id`),
  CONSTRAINT `fk_archivoticket_registroticket_rt_id` FOREIGN KEY (`rt_id`) REFERENCES `registroticket` (`rt_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivoticket`
--

LOCK TABLES `archivoticket` WRITE;
/*!40000 ALTER TABLE `archivoticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `archivoticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camara`
--

DROP TABLE IF EXISTS `camara`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camara` (
  `cmr_id` int NOT NULL AUTO_INCREMENT,
  `serie` varchar(100) NOT NULL,
  `tc_id` int NOT NULL,
  `m_id` int NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `ip` varchar(15) NOT NULL,
  `puerto` smallint unsigned NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `puertows` smallint unsigned NOT NULL,
  `mascara` varchar(15) NOT NULL,
  `puertaenlace` varchar(15) NOT NULL,
  `conectado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`cmr_id`),
  KEY `fk_camara_tipocamara_tc_id_idx` (`tc_id`),
  KEY `fk_camara_marca_m_id_idx` (`m_id`),
  CONSTRAINT `fk_camara_marca_m_id` FOREIGN KEY (`m_id`) REFERENCES `general`.`marca` (`m_id`),
  CONSTRAINT `fk_camara_tipocamara_tc_id` FOREIGN KEY (`tc_id`) REFERENCES `general`.`tipocamara` (`tc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camara`
--

LOCK TABLES `camara` WRITE;
/*!40000 ALTER TABLE `camara` DISABLE KEYS */;
/*!40000 ALTER TABLE `camara` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lectortarjeta`
--

DROP TABLE IF EXISTS `lectortarjeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lectortarjeta` (
  `lt_id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`lt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lectortarjeta`
--

LOCK TABLES `lectortarjeta` WRITE;
/*!40000 ALTER TABLE `lectortarjeta` DISABLE KEYS */;
INSERT INTO `lectortarjeta` VALUES (1,'Lector 1');
/*!40000 ALTER TABLE `lectortarjeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medidorenergia`
--

DROP TABLE IF EXISTS `medidorenergia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medidorenergia` (
  `me_id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  PRIMARY KEY (`me_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medidorenergia`
--

LOCK TABLES `medidorenergia` WRITE;
/*!40000 ALTER TABLE `medidorenergia` DISABLE KEYS */;
INSERT INTO `medidorenergia` VALUES (1,'Medidor 1',0),(2,'Medidor 2',0),(3,'Medidor 3',0),(4,'Medidor 4',0),(5,'Medidor 5',0),(6,'Medidor 6',0),(7,'Medidor 7',0),(8,'Medidor 8',0);
/*!40000 ALTER TABLE `medidorenergia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nvrpreferencia`
--

DROP TABLE IF EXISTS `nvrpreferencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nvrpreferencia` (
  `nvrpref_id` int NOT NULL AUTO_INCREMENT,
  `dia` tinyint unsigned NOT NULL,
  `tiempo_inicio` time NOT NULL,
  `tiempo_final` time NOT NULL,
  `cmr_id` int NOT NULL,
  `activo` tinyint unsigned NOT NULL,
  PRIMARY KEY (`nvrpref_id`),
  KEY `cmr_id` (`cmr_id`),
  CONSTRAINT `nvrpreferencia_ibfk_1` FOREIGN KEY (`cmr_id`) REFERENCES `camara` (`cmr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nvrpreferencia`
--

LOCK TABLES `nvrpreferencia` WRITE;
/*!40000 ALTER TABLE `nvrpreferencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `nvrpreferencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pinesentrada`
--

DROP TABLE IF EXISTS `pinesentrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinesentrada` (
  `pe_id` int NOT NULL AUTO_INCREMENT,
  `pin` tinyint unsigned NOT NULL,
  `ee_id` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longuitud` decimal(10,7) DEFAULT NULL,
  PRIMARY KEY (`pe_id`),
  KEY `fk_pinesentrada_equipoentrada_ee_id_idx` (`ee_id`),
  CONSTRAINT `fk_pinesentrada_equipoentrada_ee_id` FOREIGN KEY (`ee_id`) REFERENCES `general`.`equipoentrada` (`ee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pinesentrada`
--

LOCK TABLES `pinesentrada` WRITE;
/*!40000 ALTER TABLE `pinesentrada` DISABLE KEYS */;
INSERT INTO `pinesentrada` VALUES (1,1,1,'Entrada 1',0,0,NULL,NULL),(2,2,1,'Entrada 2',0,0,NULL,NULL),(3,3,1,'Entrada 3',0,0,NULL,NULL),(4,4,1,'Entrada 4',0,0,NULL,NULL),(5,5,1,'Entrada 5',0,0,NULL,NULL),(6,6,1,'Entrada 6',0,0,NULL,NULL),(7,7,1,'Entrada 7',0,0,NULL,NULL),(8,8,1,'Entrada 8',0,0,NULL,NULL),(9,9,1,'Entrada 9',0,0,NULL,NULL),(10,10,1,'Entrada 10',0,0,NULL,NULL),(11,11,1,'Entrada 11',0,0,NULL,NULL),(12,12,1,'Entrada 12',0,0,NULL,NULL),(13,13,1,'Entrada 13',0,0,NULL,NULL),(14,14,1,'Entrada 14',0,0,NULL,NULL),(15,15,1,'Entrada 15',0,0,NULL,NULL),(16,16,1,'Entrada 16',0,0,NULL,NULL),(17,17,1,'Entrada 17',0,0,NULL,NULL),(18,18,1,'Entrada 18',0,0,NULL,NULL),(19,19,1,'Entrada 19',0,0,NULL,NULL),(20,20,1,'Entrada 20',0,0,NULL,NULL),(21,21,1,'Entrada 21',0,0,NULL,NULL),(22,22,1,'Entrada 22',0,0,NULL,NULL),(23,23,1,'Entrada 23',0,0,NULL,NULL),(24,24,1,'Entrada 24',0,0,NULL,NULL),(25,25,1,'Entrada 25',0,0,NULL,NULL),(26,26,1,'Entrada 26',0,0,NULL,NULL),(27,27,1,'Entrada 27',0,0,NULL,NULL),(28,28,1,'Entrada 28',0,0,NULL,NULL),(29,29,1,'Entrada 29',0,0,NULL,NULL),(30,30,1,'Entrada 30',0,0,NULL,NULL),(31,31,1,'Entrada 31',0,0,NULL,NULL),(32,32,1,'Entrada 32',0,0,NULL,NULL),(33,33,1,'Entrada 33',0,0,NULL,NULL),(34,34,1,'Entrada 34',0,0,NULL,NULL),(35,35,1,'Entrada 35',0,0,NULL,NULL),(36,36,1,'Entrada 36',0,0,NULL,NULL),(37,37,1,'Entrada 37',0,0,NULL,NULL),(38,38,1,'Entrada 38',0,0,NULL,NULL),(39,39,1,'Entrada 39',0,0,NULL,NULL),(40,40,1,'Entrada 40',0,0,NULL,NULL),(41,41,1,'Entrada 41',0,0,NULL,NULL),(42,42,1,'Entrada 42',0,0,NULL,NULL),(43,43,1,'Entrada 43',0,0,NULL,NULL),(44,44,1,'Entrada 44',0,0,NULL,NULL),(45,45,1,'Entrada 45',0,0,NULL,NULL),(46,46,1,'Entrada 46',0,0,NULL,NULL);
/*!40000 ALTER TABLE `pinesentrada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pinessalida`
--

DROP TABLE IF EXISTS `pinessalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pinessalida` (
  `ps_id` int NOT NULL AUTO_INCREMENT,
  `pin` tinyint unsigned NOT NULL,
  `es_id` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `estado` tinyint NOT NULL,
  `activo` tinyint NOT NULL,
  `notificar` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`ps_id`),
  KEY `fk_pinessalida_equiposalida_es_id_idx` (`es_id`),
  CONSTRAINT `fk_pinessalida_equiposalida_es_id` FOREIGN KEY (`es_id`) REFERENCES `general`.`equiposalida` (`es_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pinessalida`
--

LOCK TABLES `pinessalida` WRITE;
/*!40000 ALTER TABLE `pinessalida` DISABLE KEYS */;
INSERT INTO `pinessalida` VALUES (1,1,1,'Salida 1',0,0,0),(2,2,1,'Salida 2',0,0,0),(3,3,1,'Salida 3',0,0,0),(4,4,1,'Salida 4',0,0,0),(5,5,1,'Salida 5',0,0,0),(6,6,1,'Salida 6',0,0,0),(7,7,1,'Salida 7',0,0,0),(8,8,1,'Salida 8',0,0,0),(9,9,1,'Salida 9',0,0,0),(10,10,1,'Salida 10',0,0,0),(11,11,1,'Salida 11',0,0,0),(12,12,1,'Salida 12',0,0,0),(13,13,1,'Salida 13',0,0,0),(14,14,1,'Salida 14',0,0,0),(15,15,1,'Salida 15',0,0,0),(16,16,1,'Salida 16',0,0,0),(17,17,1,'Salida 17',0,0,0),(18,18,1,'Salida 18',0,0,0),(19,19,1,'Salida 19',0,0,0),(20,20,1,'Salida 20',0,0,0),(21,21,1,'Salida 21',0,0,0),(22,22,1,'Salida 22',0,0,0),(23,23,1,'Salida 23',0,0,0),(24,24,1,'Salida 24',0,0,0),(25,25,1,'Salida 25',0,0,0),(26,26,1,'Salida 26',0,0,0),(27,27,1,'Salida 27',0,0,0),(28,28,1,'Salida 28',0,0,0),(29,29,1,'Salida 29',0,0,0),(30,30,1,'Salida 30',0,0,0),(31,31,1,'Salida 31',0,0,0),(32,32,1,'Salida 32',0,0,0),(33,33,1,'Salida 33',0,0,0),(34,34,1,'Salida 34',0,0,0),(35,35,1,'Salida 35',0,0,0),(36,36,1,'Salida 36',0,0,0),(37,37,1,'Salida 37',0,0,0),(38,38,1,'Salida 38',0,0,0),(39,39,1,'Salida 39',0,0,0),(40,40,1,'Salida 40',0,0,0),(41,41,1,'Salida 41',0,0,0),(42,42,1,'Salida 42',0,0,0),(43,43,1,'Salida 43',0,0,0),(44,44,1,'Salida 44',0,0,0),(45,45,1,'Salida 45',0,0,0),(46,46,1,'Salida 46',0,0,0),(47,47,1,'Salida 47',0,0,0),(48,48,1,'Salida 48',0,0,0),(49,49,1,'Salida 49',0,0,0),(50,50,1,'Salida 50',0,0,0),(51,51,1,'Salida 51',0,0,0),(52,52,1,'Salida 52',0,0,0),(53,53,1,'Salida 53',0,0,0),(54,54,1,'Salida 54',0,0,0),(55,55,1,'Salida 55',0,0,0),(56,56,1,'Salida 56',0,0,0);
/*!40000 ALTER TABLE `pinessalida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroacceso`
--

DROP TABLE IF EXISTS `registroacceso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroacceso` (
  `ra_id` int NOT NULL AUTO_INCREMENT,
  `serie` bigint NOT NULL,
  `administrador` tinyint NOT NULL,
  `autorizacion` tinyint NOT NULL,
  `fecha` timestamp NOT NULL,
  `p_id` int NOT NULL COMMENT 'Esta columna y ''ea_id'' ya no están relacionados porque se debe poder registrar tarjetas que no necesariamente están en ''general''.''acceso''. En esos casos, estas columnas tendrán valor 0.',
  `ea_id` int NOT NULL COMMENT 'Ver la descripción de la columna ''p_id''.',
  `tipo` tinyint NOT NULL,
  `sn_id` int NOT NULL,
  PRIMARY KEY (`ra_id`),
  KEY `fk_registroacceso_subnodo_sn_id_idx` (`sn_id`),
  CONSTRAINT `fk_registroacceso_subnodo_sn_id` FOREIGN KEY (`sn_id`) REFERENCES `subnodo` (`sn_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroacceso`
--

LOCK TABLES `registroacceso` WRITE;
/*!40000 ALTER TABLE `registroacceso` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroacceso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroarchivocamara`
--

DROP TABLE IF EXISTS `registroarchivocamara`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroarchivocamara` (
  `rac_id` int NOT NULL AUTO_INCREMENT,
  `cmr_id` int NOT NULL,
  `tipo` tinyint NOT NULL,
  `ruta` varchar(100) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rac_id`),
  KEY `fk_registroarchivocamara_camara_cmr_id_idx` (`cmr_id`),
  CONSTRAINT `fk_registroarchivocamara_camara_cmr_id` FOREIGN KEY (`cmr_id`) REFERENCES `camara` (`cmr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroarchivocamara`
--

LOCK TABLES `registroarchivocamara` WRITE;
/*!40000 ALTER TABLE `registroarchivocamara` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroarchivocamara` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroenergia`
--

DROP TABLE IF EXISTS `registroenergia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroenergia` (
  `re_id` bigint NOT NULL AUTO_INCREMENT,
  `me_id` int NOT NULL,
  `voltaje` float NOT NULL,
  `amperaje` float NOT NULL,
  `fdp` float NOT NULL,
  `frecuencia` float NOT NULL,
  `potenciaw` float NOT NULL,
  `potenciakwh` double NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`re_id`,`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
/*!50100 PARTITION BY HASH (year(`fecha`))
PARTITIONS 50 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroenergia`
--

LOCK TABLES `registroenergia` WRITE;
/*!40000 ALTER TABLE `registroenergia` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroenergia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroentrada`
--

DROP TABLE IF EXISTS `registroentrada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroentrada` (
  `rentd_id` bigint NOT NULL AUTO_INCREMENT,
  `pin` tinyint NOT NULL,
  `estado` tinyint NOT NULL,
  `fecha` datetime NOT NULL,
  `ee_id` int NOT NULL,
  PRIMARY KEY (`rentd_id`,`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
/*!50100 PARTITION BY HASH (year(`fecha`))
PARTITIONS 50 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroentrada`
--

LOCK TABLES `registroentrada` WRITE;
/*!40000 ALTER TABLE `registroentrada` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroentrada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroestadocamara`
--

DROP TABLE IF EXISTS `registroestadocamara`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroestadocamara` (
  `rec_id` int NOT NULL AUTO_INCREMENT,
  `cmr_id` int NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `conectado` tinyint NOT NULL,
  PRIMARY KEY (`rec_id`),
  KEY `fk_registroestadocamara_camara_cmr_id_idx` (`cmr_id`),
  CONSTRAINT `fk_registroestadocamara_camara_cmr_id` FOREIGN KEY (`cmr_id`) REFERENCES `camara` (`cmr_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroestadocamara`
--

LOCK TABLES `registroestadocamara` WRITE;
/*!40000 ALTER TABLE `registroestadocamara` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroestadocamara` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registromicrosd`
--

DROP TABLE IF EXISTS `registromicrosd`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registromicrosd` (
  `rmsd_id` int NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NOT NULL,
  `estd_id` int NOT NULL,
  PRIMARY KEY (`rmsd_id`),
  KEY `fk_registromicrosd_estado_estd_id_idx` (`estd_id`),
  CONSTRAINT `fk_registromicrosd_estado_estd_id` FOREIGN KEY (`estd_id`) REFERENCES `general`.`estado` (`estd_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registromicrosd`
--

LOCK TABLES `registromicrosd` WRITE;
/*!40000 ALTER TABLE `registromicrosd` DISABLE KEYS */;
/*!40000 ALTER TABLE `registromicrosd` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registropeticion`
--

DROP TABLE IF EXISTS `registropeticion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registropeticion` (
  `rp_id` int NOT NULL AUTO_INCREMENT,
  `pin` tinyint unsigned NOT NULL,
  `orden` tinyint NOT NULL,
  `fecha` timestamp NOT NULL,
  `estd_id` int NOT NULL,
  `acceso_remoto` int NOT NULL,
  PRIMARY KEY (`rp_id`),
  KEY `fk_registropeticion_estado_estd_id_idx` (`estd_id`),
  CONSTRAINT `fk_registropeticion_estado_estd_id` FOREIGN KEY (`estd_id`) REFERENCES `general`.`estado` (`estd_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registropeticion`
--

LOCK TABLES `registropeticion` WRITE;
/*!40000 ALTER TABLE `registropeticion` DISABLE KEYS */;
/*!40000 ALTER TABLE `registropeticion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrosalida`
--

DROP TABLE IF EXISTS `registrosalida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrosalida` (
  `rs_id` bigint NOT NULL AUTO_INCREMENT,
  `pin` tinyint NOT NULL,
  `estado` tinyint NOT NULL,
  `fecha` datetime NOT NULL,
  `es_id` int NOT NULL,
  `alarma` tinyint NOT NULL,
  PRIMARY KEY (`rs_id`,`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
/*!50100 PARTITION BY HASH (year(`fecha`))
PARTITIONS 50 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrosalida`
--

LOCK TABLES `registrosalida` WRITE;
/*!40000 ALTER TABLE `registrosalida` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrosalida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroseguridad`
--

DROP TABLE IF EXISTS `registroseguridad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroseguridad` (
  `rsg_id` int NOT NULL AUTO_INCREMENT,
  `estado` tinyint NOT NULL,
  `fecha` timestamp NOT NULL,
  PRIMARY KEY (`rsg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroseguridad`
--

LOCK TABLES `registroseguridad` WRITE;
/*!40000 ALTER TABLE `registroseguridad` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroseguridad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrotemperatura`
--

DROP TABLE IF EXISTS `registrotemperatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrotemperatura` (
  `rtmp_id` bigint NOT NULL AUTO_INCREMENT,
  `st_id` int NOT NULL,
  `valor` float NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`rtmp_id`,`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
/*!50100 PARTITION BY HASH (year(`fecha`))
PARTITIONS 50 */;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrotemperatura`
--

LOCK TABLES `registrotemperatura` WRITE;
/*!40000 ALTER TABLE `registrotemperatura` DISABLE KEYS */;
/*!40000 ALTER TABLE `registrotemperatura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registroticket`
--

DROP TABLE IF EXISTS `registroticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registroticket` (
  `rt_id` int NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `fechacomienzo` timestamp NOT NULL,
  `fechatermino` timestamp NOT NULL,
  `estd_id` int NOT NULL,
  `fechaestadofinal` timestamp NULL DEFAULT NULL,
  `fechacreacion` timestamp NOT NULL,
  `prioridad` tinyint NOT NULL,
  `p_id` int NOT NULL,
  `tt_id` int NOT NULL,
  `sn_id` int NOT NULL,
  `enviado` tinyint NOT NULL,
  `co_id` int NOT NULL,
  `asistencia` tinyint NOT NULL,
  PRIMARY KEY (`rt_id`),
  KEY `fk_registroticket_estado_estd_id_idx` (`estd_id`),
  KEY `fk_registroticket_personal_p_id_idx` (`p_id`),
  KEY `fk_registroticket_tipotrabajo_tt_id_idx` (`tt_id`),
  KEY `fk_registroticket_subnodo_sn_id_idx` (`sn_id`),
  KEY `fk_registroticket_contrata_co_id_idx` (`co_id`),
  CONSTRAINT `fk_registroticket_contrata_co_id` FOREIGN KEY (`co_id`) REFERENCES `general`.`contrata` (`co_id`),
  CONSTRAINT `fk_registroticket_estado_estd_id` FOREIGN KEY (`estd_id`) REFERENCES `general`.`estado` (`estd_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_registroticket_personal_p_id` FOREIGN KEY (`p_id`) REFERENCES `general`.`personal` (`p_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_registroticket_subnodo_sn_id` FOREIGN KEY (`sn_id`) REFERENCES `subnodo` (`sn_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_registroticket_tipotrabajo_tt_id` FOREIGN KEY (`tt_id`) REFERENCES `general`.`tipotrabajo` (`tt_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registroticket`
--

LOCK TABLES `registroticket` WRITE;
/*!40000 ALTER TABLE `registroticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `registroticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensortemperatura`
--

DROP TABLE IF EXISTS `sensortemperatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensortemperatura` (
  `st_id` int NOT NULL AUTO_INCREMENT,
  `serie` varchar(16) NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL,
  `umbral_alarma` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`st_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensortemperatura`
--

LOCK TABLES `sensortemperatura` WRITE;
/*!40000 ALTER TABLE `sensortemperatura` DISABLE KEYS */;
INSERT INTO `sensortemperatura` VALUES (1,'A1','Ubicación 1',0,0),(2,'A2','Ubicación 2',0,0),(3,'A3','Ubicación 3',0,0),(4,'A4','Ubicación 4',0,0),(5,'A5','Ubicación 5',0,0),(6,'A6','Ubicación 6',0,0),(7,'A7','Ubicación 7',0,0),(8,'A8','Ubicación 8',0,0),(9,'A9','Ubicación 9',0,0),(10,'A10','Ubicación 10',0,0),(11,'A11','Ubicación 11',0,0),(12,'A12','Ubicación 12',0,0),(13,'A13','Ubicación 13',0,0),(14,'A14','Ubicación 14',0,0),(15,'A15','Ubicación 15',0,0),(16,'A16','Ubicación 16',0,0);
/*!40000 ALTER TABLE `sensortemperatura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subnodo`
--

DROP TABLE IF EXISTS `subnodo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subnodo` (
  `sn_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`sn_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subnodo`
--

LOCK TABLES `subnodo` WRITE;
/*!40000 ALTER TABLE `subnodo` DISABLE KEYS */;
INSERT INTO `subnodo` VALUES (1,'Area');
/*!40000 ALTER TABLE `subnodo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13 16:15:59

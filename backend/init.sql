-- Tabla usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `cedula` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rol` enum('admin','instructor','aprendiz','coordinador') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cedula`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla aprendices
CREATE TABLE IF NOT EXISTS `aprendices` (
  `id_aprendices` int NOT NULL AUTO_INCREMENT,
  `documento` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_documento` enum('CC','TI','CE','PASAPORTE') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nombres` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apellidos` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `face_descriptor` json DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aprendices`),
  UNIQUE KEY `documento` (`documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla formaciones (CÓDIGO como PK)
CREATE TABLE IF NOT EXISTS `formaciones` (
  `codigo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jornada` enum('mañana','tarde','noche','mixta') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`codigo`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla formaciones_aprendices (RELACIÓN CON CÓDIGO)
CREATE TABLE IF NOT EXISTS `formaciones_aprendices` (
  `id_relacion` int NOT NULL AUTO_INCREMENT,
  `fk_codigo_formacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_aprendiz` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_relacion`),
  UNIQUE KEY `unique_formacion_aprendiz` (`id_aprendiz`),
  KEY `fk_formacion_codigo_aprendiz` (`fk_codigo_formacion`),
  CONSTRAINT `fk_aprendiz` FOREIGN KEY (`id_aprendiz`) REFERENCES `aprendices` (`id_aprendices`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_formacion_codigo_aprendiz` FOREIGN KEY (`fk_codigo_formacion`) REFERENCES `formaciones` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla asistencias (CON FK A CÓDIGO)
CREATE TABLE IF NOT EXISTS `asistencias` (
  `id_asistencias` int NOT NULL AUTO_INCREMENT,
  `fk_codigo_formacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fk_aprendiz` int DEFAULT NULL,
  `presente` tinyint(1) DEFAULT NULL,
  `hora_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `documento` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fk_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_asistencias`),
  KEY `fk_aprendiz` (`fk_aprendiz`),
  KEY `fk_usuario` (`fk_usuario`),
  KEY `fk_formacion_codigo_asistencia` (`fk_codigo_formacion`),
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`fk_aprendiz`) REFERENCES `aprendices` (`id_aprendices`),
  CONSTRAINT `asistencias_ibfk_usuario` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_formacion_codigo_asistencia` FOREIGN KEY (`fk_codigo_formacion`) REFERENCES `formaciones` (`codigo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla logs_auditoria
CREATE TABLE IF NOT EXISTS `logs_auditoria` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `fk_usuario` int DEFAULT NULL,
  `accion` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tabla_afectada` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `registro_id` int DEFAULT NULL,
  `detalles` text COLLATE utf8mb4_general_ci,
  `ip_address` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `fk_usuario` (`fk_usuario`),
  CONSTRAINT `logs_auditoria_ibfk_1` FOREIGN KEY (`fk_usuario`) REFERENCES `usuarios` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Mano a Mano — esquema SQL

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `authtoken_token`;

CREATE TABLE IF NOT EXISTS `causa_voluntariado` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo` varchar(32) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `causa_voluntariado_codigo_uniq` (`codigo`),
  UNIQUE KEY `causa_voluntariado_nombre_uniq` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tipo_actividad` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo` varchar(32) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tipo_actividad_codigo_uniq` (`codigo`),
  UNIQUE KEY `tipo_actividad_nombre_uniq` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `perfil_usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rol` ENUM('VOL','ORG') NOT NULL DEFAULT 'VOL',
  `telefono` varchar(40) NOT NULL DEFAULT '',
  `intereses_causas` varchar(255) NOT NULL DEFAULT '',
  `disponibilidad_resumen` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `perfil_usuario_user_id_uniq` (`user_id`),
  CONSTRAINT `perfil_usuario_user_id_fk`
    FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `organizacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre_publico` varchar(200) NOT NULL,
  `descripcion` longtext NOT NULL,
  `email_contacto` varchar(254) NOT NULL,
  `telefono` varchar(40) NOT NULL DEFAULT '',
  `sitio_web` varchar(200) NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `propietario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_organizacion_propietario` (`propietario_id`),
  CONSTRAINT `organizacion_propietario_id_fk`
    FOREIGN KEY (`propietario_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `oportunidad_voluntariado` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `descripcion` longtext NOT NULL,
  `ubicacion` varchar(200) NOT NULL,
  `disponibilidad` varchar(200) NOT NULL,
  `requisitos` longtext NOT NULL,
  `cupos` int unsigned NOT NULL DEFAULT 1,
  `fecha_actividad` date DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `imagen_data` longblob DEFAULT NULL,
  `imagen_tipo` varchar(64) NOT NULL DEFAULT '',
  `imagen_nombre` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `organizacion_id` bigint NOT NULL,
  `causa_id` bigint NOT NULL,
  `tipo_actividad_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `oportunidad_voluntariado_organizacion_id_fk` (`organizacion_id`),
  KEY `oportunidad_voluntariado_causa_id_fk` (`causa_id`),
  KEY `oportunidad_voluntariado_tipo_actividad_id_fk` (`tipo_actividad_id`),
  CONSTRAINT `oportunidad_voluntariado_organizacion_id_fk`
    FOREIGN KEY (`organizacion_id`) REFERENCES `organizacion` (`id`) ON DELETE CASCADE,
  CONSTRAINT `oportunidad_voluntariado_causa_id_fk`
    FOREIGN KEY (`causa_id`) REFERENCES `causa_voluntariado` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `oportunidad_voluntariado_tipo_actividad_id_fk`
    FOREIGN KEY (`tipo_actividad_id`) REFERENCES `tipo_actividad` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `postulacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado` ENUM('PEN','ACE','REC','CAN') NOT NULL DEFAULT 'PEN',
  `comentario` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `oportunidad_id` bigint NOT NULL,
  `voluntario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_postulacion_voluntario_oportunidad` (`voluntario_id`, `oportunidad_id`),
  KEY `postulacion_oportunidad_id_fk` (`oportunidad_id`),
  CONSTRAINT `postulacion_voluntario_id_fk`
    FOREIGN KEY (`voluntario_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `postulacion_oportunidad_id_fk`
    FOREIGN KEY (`oportunidad_id`) REFERENCES `oportunidad_voluntariado` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mensaje` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cuerpo` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `destinatario_id` bigint NOT NULL,
  `oportunidad_id` bigint DEFAULT NULL,
  `remitente_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mensaje_destinatario_id_fk` (`destinatario_id`),
  KEY `mensaje_oportunidad_id_fk` (`oportunidad_id`),
  KEY `mensaje_remitente_id_fk` (`remitente_id`),
  CONSTRAINT `mensaje_destinatario_id_fk`
    FOREIGN KEY (`destinatario_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensaje_oportunidad_id_fk`
    FOREIGN KEY (`oportunidad_id`) REFERENCES `oportunidad_voluntariado` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mensaje_remitente_id_fk`
    FOREIGN KEY (`remitente_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
-- =============================================================================
-- Mano a mano — esquema MySQL 8 (tablas de negocio)
-- EV2 Sprint 1 · Referencia documental / auditoría de FK y tipos
--
-- PREREQUISITO: existir la tabla `auth_user` (migraciones Django: manage.py migrate)
-- Charset alineado a Django por defecto en MySQL.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- perfil_usuario
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `perfil_usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rol` varchar(3) NOT NULL,
  `telefono` varchar(40) NOT NULL,
  `intereses_causas` varchar(255) NOT NULL,
  `disponibilidad_resumen` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `perfil_usuario_user_id_uniq` (`user_id`),
  CONSTRAINT `perfil_usuario_user_id_fk`
    FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- organizacion
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `organizacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre_publico` varchar(200) NOT NULL,
  `descripcion` longtext NOT NULL,
  `email_contacto` varchar(254) NOT NULL,
  `telefono` varchar(40) NOT NULL,
  `sitio_web` varchar(200) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `propietario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organizacion_propietario_id_uniq` (`propietario_id`),
  CONSTRAINT `organizacion_propietario_id_fk`
    FOREIGN KEY (`propietario_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- oportunidad_voluntariado
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `oportunidad_voluntariado` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `descripcion` longtext NOT NULL,
  `ubicacion` varchar(200) NOT NULL,
  `causa` varchar(120) NOT NULL,
  `tipo_actividad` varchar(120) NOT NULL,
  `disponibilidad` varchar(200) NOT NULL,
  `requisitos` longtext NOT NULL,
  `cupos` int unsigned NOT NULL,
  `fecha_actividad` date DEFAULT NULL,
  `activa` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `organizacion_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `oportunidad_voluntariado_org_idx` (`organizacion_id`),
  CONSTRAINT `oportunidad_voluntariado_organizacion_id_fk`
    FOREIGN KEY (`organizacion_id`) REFERENCES `organizacion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- postulacion
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `postulacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estado` varchar(3) NOT NULL,
  `comentario` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `oportunidad_id` bigint NOT NULL,
  `voluntario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_postulacion_voluntario_oportunidad` (`voluntario_id`,`oportunidad_id`),
  KEY `postulacion_oportunidad_id_fk` (`oportunidad_id`),
  CONSTRAINT `postulacion_voluntario_id_fk`
    FOREIGN KEY (`voluntario_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `postulacion_oportunidad_id_fk`
    FOREIGN KEY (`oportunidad_id`) REFERENCES `oportunidad_voluntariado` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- mensaje
-- -----------------------------------------------------------------------------
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

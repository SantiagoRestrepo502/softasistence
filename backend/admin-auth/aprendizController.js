// backend/src/controllers/aprendizController.js
const Aprendiz = require("../models/Aprendiz");
const { validationResult } = require("express-validator");

class AprendizController {
  // POST /api/aprendices
  async crearAprendiz(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // **CAMPOS AJUSTADOS a la tabla APRENDICES (sin fecha_nacimiento ni direccion)**
      const { documento, tipo_documento, nombres, apellidos, email, telefono } =
        req.body;

      // 1. Verificar si el documento ya existe
      const aprendizExistente = await Aprendiz.findByDocumento(documento);

      if (aprendizExistente) {
        return res.status(400).json({
          success: false,
          error: "El documento ya está registrado",
        });
      }

      // 2. Crear aprendiz
      const nuevoId = await Aprendiz.create({
        documento,
        tipo_documento,
        nombres,
        apellidos,
        email,
        telefono,
        activo: true,
      });

      // 3. Recuperar el objeto completo para la respuesta
      const nuevoAprendiz = await Aprendiz.findByPk(nuevoId);

      res.status(201).json({
        success: true,
        message: "Aprendiz creado exitosamente",
        data: nuevoAprendiz,
      });
    } catch (error) {
      console.error("Error en crearAprendiz:", error);
      const isDuplicateKeyError = error.code === "ER_DUP_ENTRY";

      res.status(isDuplicateKeyError ? 400 : 500).json({
        success: false,
        error: isDuplicateKeyError
          ? "El documento ya está registrado"
          : "Error al crear aprendiz",
      });
    }
  }

  // GET /api/aprendices (con paginación y filtros)
  async listarAprendices(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        activo = "true",
        formacion_id,
      } = req.query;

      const { count, rows } = await Aprendiz.findAndCountAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        activo,
        formacion_id,
      });

      res.json({
        success: true,
        data: {
          aprendices: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error en listarAprendices:", error);
      res.status(500).json({
        success: false,
        error: "Error al listar aprendices",
      });
    }
  }

  // GET /api/aprendices/:id
  async obtenerAprendiz(req, res) {
    try {
      const { id } = req.params;

      // Incluye relaciones (Formaciones) gracias al método findByPk modificado
      const aprendiz = await Aprendiz.findByPk(id);

      if (!aprendiz) {
        return res.status(404).json({
          success: false,
          error: "Aprendiz no encontrado",
        });
      }

      res.json({
        success: true,
        data: aprendiz,
      });
    } catch (error) {
      console.error("Error en obtenerAprendiz:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener aprendiz",
      });
    }
  }

  // PUT /api/aprendices/:id
  async actualizarAprendiz(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const aprendizExistente = await Aprendiz.findByPk(id);

      if (!aprendizExistente) {
        return res.status(404).json({
          success: false,
          error: "Aprendiz no encontrado",
        });
      }

      // **CAMPOS AJUSTADOS (sin fecha_nacimiento ni direccion)**
      const { nombres, apellidos, email, telefono, activo } = req.body;

      // El método update solo actualizará los campos que se envíen
      const dataToUpdate = { nombres, apellidos, email, telefono, activo };

      await Aprendiz.update(id, dataToUpdate);

      // Recuperar el objeto actualizado para la respuesta
      const aprendizActualizado = await Aprendiz.findByPk(id);

      res.json({
        success: true,
        message: "Aprendiz actualizado exitosamente",
        data: aprendizActualizado,
      });
    } catch (error) {
      console.error("Error en actualizarAprendiz:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar aprendiz",
      });
    }
  }

  // DELETE /api/aprendices/:id
  async eliminarAprendiz(req, res) {
    try {
      const { id } = req.params;

      const aprendiz = await Aprendiz.findByPk(id);

      if (!aprendiz) {
        return res.status(404).json({
          success: false,
          error: "Aprendiz no encontrado",
        });
      }

      // 1. Verificar si tiene asistencias registradas
      const tieneAsistencias = await Aprendiz.checkAsistencias(id);

      if (tieneAsistencias) {
        return res.status(400).json({
          success: false,
          error:
            "No se puede eliminar un aprendiz con asistencias registradas. Desactívalo en su lugar.",
        });
      }

      // 2. Eliminar relaciones con formaciones
      await Aprendiz.removeFormacionRelation(id);

      // 3. Eliminar aprendiz
      await Aprendiz.delete(id);

      res.json({
        success: true,
        message: "Aprendiz eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en eliminarAprendiz:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar aprendiz",
      });
    }
  }
}

module.exports = new AprendizController();

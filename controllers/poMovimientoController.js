const db = require("../config/db");

// Obtener el último movimiento de cada neumático instalado en una placa, filtrando por USUARIO_SUPER si se envía
const listarUltimosMovimientosPorPlaca = async (req, res) => {
    try {
        const { placa } = req.params;
        const { usuario_super } = req.query;
        if (!placa || placa.trim() === "") {
            return res.status(400).json({ error: "La placa es requerida" });
        }
        const placaTrim = placa.trim();
        let query = `
      SELECT m.*
      FROM SPEED400AT.NEU_MOVIMIENTO m
      INNER JOIN (
        SELECT CODIGO, POSICION_NEU, MAX(FECHA_MOVIMIENTO) AS FECHA_MAX
        FROM SPEED400AT.NEU_MOVIMIENTO
        WHERE TRIM(PLACA) = ?`;
        const params = [placaTrim];
        if (usuario_super) {
            query += ` AND TRIM(USUARIO_SUPER) = ?`;
            params.push(usuario_super.trim());
        }
        query += `
        GROUP BY CODIGO, POSICION_NEU
      ) ult
        ON m.CODIGO = ult.CODIGO
        AND m.POSICION_NEU = ult.POSICION_NEU
        AND m.FECHA_MOVIMIENTO = ult.FECHA_MAX
      WHERE TRIM(m.PLACA) = ?`;
        params.push(placaTrim);
        if (usuario_super) {
            query += ` AND TRIM(m.USUARIO_SUPER) = ?`;
            params.push(usuario_super.trim());
        }
        query += `
      ORDER BY m.POSICION_NEU`;
        const result = await db.query(query, params);
        res.json(result);
    } catch (error) {
        console.error("Error al obtener últimos movimientos de neumáticos:", error);
        res.status(500).json({ error: "Error al obtener últimos movimientos de neumáticos" });
    }
};

// Obtener el último movimiento de cada posición de un neumático por su código, filtrando por USUARIO_SUPER si se envía
const obtenerUltimosMovimientosPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { usuario_super } = req.query;
        if (!codigo || codigo.trim() === "") {
            return res.status(400).json({ error: "El código es requerido" });
        }
        const codigoTrim = codigo.trim();
        let query = `
      SELECT m.*
      FROM SPEED400AT.NEU_MOVIMIENTO m
      INNER JOIN (
        SELECT POSICION_NEU, MAX(FECHA_MOVIMIENTO) AS FECHA_MAX
        FROM SPEED400AT.NEU_MOVIMIENTO
        WHERE TRIM(CODIGO) = ?`;
        const params = [codigoTrim];
        if (usuario_super) {
            query += ` AND TRIM(USUARIO_SUPER) = ?`;
            params.push(usuario_super.trim());
        }
        query += `
        GROUP BY POSICION_NEU
      ) ult
        ON m.POSICION_NEU = ult.POSICION_NEU
        AND m.FECHA_MOVIMIENTO = ult.FECHA_MAX
      WHERE TRIM(m.CODIGO) = ?`;
        params.push(codigoTrim);
        if (usuario_super) {
            query += ` AND TRIM(m.USUARIO_SUPER) = ?`;
            params.push(usuario_super.trim());
        }
        query += `
      ORDER BY m.FECHA_MOVIMIENTO DESC`;
        const result = await db.query(query, params);
        res.json(result);
    } catch (error) {
        console.error("Error al obtener últimos movimientos por código:", error);
        res.status(500).json({ error: "Error al obtener últimos movimientos por código" });
    }
};

// Obtener el historial completo de movimientos de un neumático por su código
const obtenerHistorialMovimientosPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { usuario_super } = req.query;
        if (!codigo || codigo.trim() === "") {
            return res.status(400).json({ error: "El código es requerido" });
        }
        const codigoTrim = codigo.trim();
        let query = `
            SELECT ID_MOVIMIENTO, CODIGO, POSICION_NEU, TIPO_MOVIMIENTO, FECHA_MOVIMIENTO, KILOMETRO, PLACA, USUARIO_SUPER
            FROM SPEED400AT.NEU_MOVIMIENTO
            WHERE TRIM(CODIGO) = ?`;
        const params = [codigoTrim];
        if (usuario_super) {
            query += ` AND TRIM(USUARIO_SUPER) = ?`;
            params.push(usuario_super.trim());
        }
        query += `
            ORDER BY FECHA_MOVIMIENTO ASC`;
        const result = await db.query(query, params);
        res.json(result);
    } catch (error) {
        console.error("Error al obtener historial de movimientos por código:", error);
        res.status(500).json({ error: "Error al obtener historial de movimientos por código" });
    }
};

module.exports = {
    listarUltimosMovimientosPorPlaca,
    obtenerUltimosMovimientosPorCodigo,
    obtenerHistorialMovimientosPorCodigo,
};

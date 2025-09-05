const db = require("../config/db");

const listarNeumaticosAsignados = async (req, res) => {
    try {
        const { placa } = req.params;

        if (!placa || placa.trim() === "") {
            return res.status(400).json({ error: "La placa es requerida" });
        }

        // Hacemos el TRIM de la placa en el backend para evitar problemas con el parámetro en DB2
        const placaTrim = placa.trim();
        const query = `SELECT * FROM SPEED400AT.NEU_ASIGNADO WHERE TRIM(PLACA) = ?`;

        const result = await db.query(query, [placaTrim]);

        // Detectar si el resultado es un array, o si viene en result.rows o result.recordset
        let data = result;
        if (result && typeof result === 'object') {
            if (Array.isArray(result)) {
                data = result;
            } else if (Array.isArray(result.rows)) {
                data = result.rows;
            } else if (Array.isArray(result.recordset)) {
                data = result.recordset;
            } else {
                // Si es un solo objeto, lo envolvemos en array
                data = [result];
            }
        }
        res.json(data);
    } catch (error) {
        console.error("❌ Error al consultar NEU_ASIGNADO:", error);
        res.status(500).json({ error: error.message || "Error al obtener neumáticos asignados" });
    }
};

const listarNeumaticosAsignadosPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;

        if (!codigo || codigo.trim() === "") {
            return res.status(400).json({ error: "El código del neumático es requerido" });
        }

        // Hacemos el TRIM del código en el backend para evitar problemas con el parámetro en DB2
        const codigoTrim = codigo.trim();
        const query = `SELECT * FROM SPEED400AT.NEU_ASIGNADO WHERE TRIM(CODIGO) = ?`;

        const result = await db.query(query, [codigoTrim]);

        // Detectar si el resultado es un array, o si viene en result.rows o result.recordset
        let data = result;
        if (result && typeof result === 'object') {
            if (Array.isArray(result)) {
                data = result;
            } else if (Array.isArray(result.rows)) {
                data = result.rows;
            } else if (Array.isArray(result.recordset)) {
                data = result.recordset;
            } else {
                // Si es un solo objeto, lo envolvemos en array
                data = [result];
            }
        }
        res.json(data);
    } catch (error) {
        console.error("❌ Error al consultar NEU_ASIGNADO por código:", error);
        res.status(500).json({ error: error.message || "Error al obtener neumáticos asignados por código" });
    }
};

const eliminarAsignacion = async (req, res) => {
    const { id } = req.params;

    // Validar que el ID venga y sea un número
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        // Ejecutamos el DELETE
        const result = await db.query(
            'DELETE FROM SPEED400AT.NEU_ASIGNADO WHERE ID_ASIGNADO = ?',
            [id]
        );

        // Si no se afectó ninguna fila, el registro no existía
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Asignación no encontrada' });
        }

        // Éxito
        res.json({ mensaje: 'Asignación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar asignación:', error);
        res.status(500).json({ error: 'Error al eliminar asignación' });
    }
};

const listaUltimoMovPlaca = async (req, res) => {
    try {
        const { placa } = req.params;
        if (!placa || placa.trim() === "") {
            return res.status(400).json({ error: "La placa es requerida" });
        }
        const placaTrim = placa.trim();
        let query = `
            SELECT m.*
            FROM SPEED400AT.NEU_MOVIMIENTO m
            INNER JOIN (
                SELECT POSICION_NEU, MAX(FECHA_MOVIMIENTO) AS FECHA_MAX
                FROM SPEED400AT.NEU_MOVIMIENTO
                WHERE TRIM(PLACA) = ?
                GROUP BY POSICION_NEU
            ) ult
                ON m.POSICION_NEU = ult.POSICION_NEU
                AND m.FECHA_MOVIMIENTO = ult.FECHA_MAX
            WHERE TRIM(m.PLACA) = ?
              AND (UPPER(TRIM(m.TIPO_MOVIMIENTO)) <> 'BAJA DEFINITIVA' AND UPPER(TRIM(m.TIPO_MOVIMIENTO)) <> 'RECUPERADO')
            ORDER BY m.POSICION_NEU`;
        const params = [placaTrim, placaTrim];
        const result = await db.query(query, params);
        res.json(Array.isArray(result) ? result : (result.rows || result.recordset || [result]));
    } catch (error) {
        console.error("Error al obtener últimos movimientos por placa:", error);
        res.status(500).json({ error: "Error al obtener últimos movimientos por placa" });
    }
};

module.exports = {
    listarNeumaticosAsignados,
    listarNeumaticosAsignadosPorCodigo,
    eliminarAsignacion,
    listaUltimoMovPlaca,
};

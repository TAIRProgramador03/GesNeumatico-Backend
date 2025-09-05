const db = require("../config/db");

const asignarNeumatico = async (req, res) => {
    // Validar sesión y usuario autenticado
    if (!req.session.user || !req.session.user.usuario) {
        return res.status(401).json({ mensaje: "No autenticado" });
    }
    // Log para depuración: mostrar el payload recibido
    console.log('Payload recibido en asignarNeumatico:', JSON.stringify(req.body, null, 2));
    // Permitir objeto o array
    const data = Array.isArray(req.body) ? req.body : [req.body];
    const UsuarioCrea = req.session.user.usuario.trim().toUpperCase();
    const resultados = [];
    for (const [i, item] of data.entries()) {
        const {
            CodigoNeumatico,
            Remanente,
            PresionAire,
            TorqueAplicado,
            Placa,
            Posicion,
            Odometro,
            FechaRegistro
        } = item;
        // Validación básica
        if (!CodigoNeumatico || !Remanente || !PresionAire || !TorqueAplicado || !Placa || !Posicion || !Odometro || !FechaRegistro) {
            resultados.push({
                index: i,
                error: "Faltan campos obligatorios (incluya FechaRegistro en formato YYYY-MM-DD)."
            });
            continue;
        }
        if (!/^[\d]{4}-[\d]{2}-[\d]{2}$/.test(FechaRegistro)) {
            resultados.push({
                index: i,
                error: "El campo FechaRegistro debe tener formato YYYY-MM-DD."
            });
            continue;
        }
        const query = `
            CALL SPEED400AT.SP_ASIGNAR_NEUMATICO(
                ${CodigoNeumatico},
                ${Remanente},
                ${PresionAire},
                ${TorqueAplicado},
                '${Placa}',
                '${Posicion}',
                ${Odometro},
                '${UsuarioCrea}',
                DATE('${FechaRegistro}')
            )
        `;
        try {
            await db.query(query);
            resultados.push({ index: i, mensaje: "Neumático asignado correctamente." });
        } catch (error) {
            const errorMsg = JSON.stringify(error);
            if (errorMsg.includes("ya se encuentra asignado a otro vehículo o posición")) {
                resultados.push({
                    index: i,
                    error: "El neumático ya está asignado a otro vehículo o posición.",
                    detalle: "El neumático ya se encuentra asignado a otro vehículo o posición."
                });
            } else {
                resultados.push({
                    index: i,
                    error: "Error al asignar neumático.",
                    detalle: error.message
                });
            }
        }
    }
    // Si solo era un objeto, mantener respuesta simple
    if (!Array.isArray(req.body)) {
        const r = resultados[0];
        if (r.error) {
            return res.status(400).json(r);
        }
        return res.status(200).json(r);
    }
    // Si era array, devolver todos los resultados
    res.status(207).json({ resultados });
};

module.exports = { asignarNeumatico };

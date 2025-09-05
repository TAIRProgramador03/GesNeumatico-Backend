const db = require('../config/db');

const getPoNeumaticos = async (req, res) => {
    // Validar sesión y usuario
    if (!req.session.user || !req.session.user.usuario) {
        return res.status(401).json({ mensaje: 'No autenticado' });
    }
    try {
        // Obtener usuario y perfiles desde la sesión
        const usuario = req.session.user?.usuario;
        const perfiles = req.session.user?.perfiles?.map(p => p.codigo) || [];

        let query = 'SELECT * FROM SPEED400AT.PO_NEUMATICO';
        let params = [];

        // Si el usuario NO tiene perfil 005 (OPERACIONES), filtra por USUARIO_SUPER
        if (!perfiles.includes('005')) {
            query += ' WHERE USUARIO_SUPER = ?';
            params.push(usuario);
        }

        const result = await db.query(query, params);

        // Normalización de los datos
        const datosNormalizados = result.map((neumatico) => ({
            ...neumatico,
            CODIGO: neumatico.CODIGO ? String(neumatico.CODIGO) : '', // Asegurar que CODIGO sea una cadena
            MARCA: neumatico.MARCA || '', // Asegurar que MARCA no sea nulo
            DISEÑO: neumatico.DISEÑO || '', // Asegurar que DISEÑO no sea nulo
            REMANENTE: neumatico.REMANENTE || '', // Asegurar que REMANENTE no sea nulo
            MEDIDA: neumatico.MEDIDA || '', // Asegurar que MEDIDA no sea nulo
            FECHA_FABRICACION_COD: neumatico.FECHA_FABRICACION_COD || '', // Asegurar que FECHA no sea nulo
            ESTADO: neumatico.ESTADO || '', // Asegurar que ESTADO no sea nulo
            PROYECTO: neumatico.PROYECTO || '', // Asegurar que PROYECTO no sea nulo
        }));

        res.json(datosNormalizados);
    } catch (error) {
        console.error('Error al obtener los neumáticos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los neumáticos' });
    }
};

const actualizarNeumatico = async (req, res) => {
    const { codigo } = req.params;
    const nuevosDatos = req.body;

    try {
        //console.log(`Actualizando neumático con código: ${codigo}`);

        // Convertir codigo a número (MUY IMPORTANTE)
        const codigoNumerico = parseInt(codigo, 10);
        if (isNaN(codigoNumerico)) {
            return res.status(400).json({ error: 'Código de neumático inválido' });
        }

        // 1. Obtener el registro actual desde la base de datos
        const [result] = await db.query(
            'SELECT * FROM SPEED400AT.PO_NEUMATICO WHERE CODIGO = ?',
            [codigoNumerico] // Usar el código numérico
        );

        if (!result || result.length === 0) {
            //console.log(`Neumático con código ${codigo} no encontrado`);
            return res.status(404).json({ error: 'Neumático no encontrado' });
        }

        const actual = result[0];
        //console.log('Datos actuales:', actual);
        //console.log('Nuevos datos:', nuevosDatos);

        // 2. Mantener los valores actuales si ya existen, usar los nuevos si están en la request
        const actualizado = {
            MARCA: nuevosDatos.MARCA !== undefined ? nuevosDatos.MARCA : actual.MARCA,
            MEDIDA: nuevosDatos.MEDIDA !== undefined ? nuevosDatos.MEDIDA : actual.MEDIDA,
            DISEÑO: nuevosDatos.DISEÑO !== undefined ? nuevosDatos.DISEÑO : actual.DISEÑO, // Corregido a DISEÑO
            REMANENTE: nuevosDatos.REMANENTE !== undefined ? nuevosDatos.REMANENTE : actual.REMANENTE,
            PR: nuevosDatos.PR !== undefined ? nuevosDatos.PR : actual.PR,
            CARGA: nuevosDatos.CARGA !== undefined ? nuevosDatos.CARGA : actual.CARGA,
            VELOCIDAD: nuevosDatos.VELOCIDAD !== undefined ? nuevosDatos.VELOCIDAD : actual.VELOCIDAD,
            RQ: nuevosDatos.RQ !== undefined ? nuevosDatos.RQ : actual.RQ,
            OC: nuevosDatos.OC !== undefined ? nuevosDatos.OC : actual.OC,
            PROYECTO: nuevosDatos.PROYECTO !== undefined ? nuevosDatos.PROYECTO : actual.PROYECTO,
            COSTO: nuevosDatos.COSTO !== undefined ? nuevosDatos.COSTO : actual.COSTO,
            PROVEEDOR: nuevosDatos.PROVEEDOR !== undefined ? nuevosDatos.PROVEEDOR : actual.PROVEEDOR,
            FECHA: nuevosDatos.FECHA !== undefined ? nuevosDatos.FECHA : actual.FECHA,
            USUARIO_SUPER: nuevosDatos.USUARIO_SUPER !== undefined ? nuevosDatos.USUARIO_SUPER : actual.USUARIO_SUPER,
            ESTADO: nuevosDatos.ESTADO !== undefined ? nuevosDatos.ESTADO : actual.ESTADO, // Añadido ESTADO
            ESTADO_ASIGNACION: nuevosDatos.ESTADO_ASIGNACION !== undefined ? nuevosDatos.ESTADO_ASIGNACION : actual.ESTADO_ASIGNACION, // Añadido ESTADO_ASIGNACION
            KILOMETRAJE: nuevosDatos.KILOMETRAJE !== undefined ? nuevosDatos.KILOMETRAJE : actual.KILOMETRAJE,  // Añadido KILOMETRAJE
        };

        //console.log('Datos actualizados:', actualizado);

        // 3. Ejecutar la actualización
        const query = `
            UPDATE SPEED400AT.PO_NEUMATICO SET
                MARCA = ?, MEDIDA = ?, DISEÑO = ?, REMANENTE = ?, PR = ?, CARGA = ?,
                VELOCIDAD = ?, RQ = ?, OC = ?, PROYECTO = ?, COSTO = ?, PROVEEDOR = ?,
                FECHA = ?, USUARIO_SUPER = ?, ESTADO = ?, ESTADO_ASIGNACION = ?, KILOMETRAJE = ?
            WHERE CODIGO = ?
        `;

        const params = [
            actualizado.MARCA, actualizado.MEDIDA, actualizado.DISEÑO, actualizado.REMANENTE,
            actualizado.PR, actualizado.CARGA, actualizado.VELOCIDAD, actualizado.RQ,
            actualizado.OC, actualizado.PROYECTO, actualizado.COSTO, actualizado.PROVEEDOR,
            actualizado.FECHA, actualizado.USUARIO_SUPER, actualizado.ESTADO, actualizado.ESTADO_ASIGNACION, actualizado.KILOMETRAJE,
            codigoNumerico // Usar el código numérico
        ];

        // console.log('Query:', query);
        // console.log('Params:', params);

        await db.query(query, params);

        res.status(200).json({ message: 'Neumático actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar neumático:', error);
        res.status(500).json({ error: 'Error al actualizar neumático' });
    }
};


const eliminarNeumatico = async (req, res) => {
    const { codigo } = req.params;
    // Validar que sea número
    const codigoNum = parseInt(codigo, 10);
    if (isNaN(codigoNum)) {
        return res.status(400).json({ error: 'Código inválido' });
    }

    try {
        // Ejecuta el DELETE. Con ODBC, db.query devuelve un número con filas afectadas
        const filasAfectadas = await db.query(
            'DELETE FROM SPEED400AT.PO_NEUMATICO WHERE CODIGO = ?',
            [codigoNum]
        );

        if (!filasAfectadas) {
            // Si 0, no eliminó nada → no existía ese código
            return res.status(404).json({ mensaje: 'Neumático no encontrado' });
        }

        // Si >=1, todo OK
        return res.json({ mensaje: 'Neumático eliminado correctamente' });

    } catch (error) {
        console.error('Error al eliminar neumático:', error);
        return res.status(500).json({ error: 'Error al eliminar neumático' });
    }
};

const contarProyectosNeumatico = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT COUNT(DISTINCT PROYECTO) AS cantidad FROM SPEED400AT.PO_NEUMATICO'
        );
        // Imprime el resultado para ver su estructura
        //console.log('Resultado de contar proyectos:', result);

        // Si result es un array de objetos
        const cantidad = Array.isArray(result) && result.length > 0
            ? (result[0].cantidad || result[0].CANTIDAD)
            : 0;

        res.json({ cantidad });
    } catch (error) {
        console.error('Error al contar proyectos:', error);
        res.status(500).json({ error: 'Error al contar proyectos' });
    }
};

const contarNeumaticos = async (req, res) => {
    // Validar sesión y usuario
    if (!req.session.user || !req.session.user.usuario) {
        return res.status(401).json({ mensaje: 'No autenticado' });
    }
    try {
        const usuario = req.session.user?.usuario;
        const perfiles = req.session.user?.perfiles?.map(p => p.codigo) || [];

        let query = 'SELECT COUNT(*) AS cantidad FROM SPEED400AT.PO_NEUMATICO';
        let params = [];

        // Si NO es OPERACIONES (005), filtra por USUARIO_SUPER
        if (!perfiles.includes('005')) {
            query += ' WHERE USUARIO_SUPER = ?';
            params.push(usuario);
        }

        const result = await db.query(query, params);
        const cantidad = Array.isArray(result) && result.length > 0
            ? (result[0].cantidad || result[0].CANTIDAD)
            : 0;

        res.json({ cantidad });
    } catch (error) {
        console.error('Error al contar neumáticos:', error);
        res.status(500).json({ error: 'Error al contar neumáticos' });
    }
};

const contarNeumaticosAsignados = async (req, res) => {
    // Validar sesión y usuario
    if (!req.session.user || !req.session.user.usuario) {
        return res.status(401).json({ mensaje: 'No autenticado' });
    }
    try {
        const usuario = req.session.user?.usuario;
        const perfiles = req.session.user?.perfiles?.map(p => p.codigo) || [];

        let query = "SELECT COUNT(*) AS cantidad FROM SPEED400AT.PO_NEUMATICO WHERE TIPO_MOVIMIENTO = 'ASIGNADO'";
        let params = [];

        // Si NO es OPERACIONES (005), filtra por USUARIO_SUPER
        if (!perfiles.includes('005')) {
            query += ' AND USUARIO_SUPER = ?';
            params.push(usuario);
        }

        const result = await db.query(query, params);
        const cantidad = Array.isArray(result) && result.length > 0
            ? (result[0].cantidad || result[0].CANTIDAD)
            : 0;
        res.json({ cantidad });
    } catch (error) {
        console.error('Error al contar neumáticos asignados:', error);
        res.status(500).json({ error: 'Error al contar neumáticos asignados' });
    }
};

const contarNeumaticosDisponibles = async (req, res) => {
    // Validar sesión y usuario
    if (!req.session.user || !req.session.user.usuario) {
        return res.status(401).json({ mensaje: 'No autenticado' });
    }
    try {
        const usuario = req.session.user?.usuario;
        const perfiles = req.session.user?.perfiles?.map(p => p.codigo) || [];

        let query = "SELECT COUNT(*) AS cantidad FROM SPEED400AT.PO_NEUMATICO WHERE TIPO_MOVIMIENTO = 'DISPONIBLE'";
        let params = [];

        // Si NO es OPERACIONES (005), filtra por USUARIO_SUPER
        if (!perfiles.includes('005')) {
            query += ' AND USUARIO_SUPER = ?';
            params.push(usuario);
        }

        const result = await db.query(query, params);
        const cantidad = Array.isArray(result) && result.length > 0
            ? (result[0].cantidad || result[0].CANTIDAD)
            : 0;
        res.json({ cantidad });
    } catch (error) {
        console.error('Error al contar neumáticos disponibles:', error);
        res.status(500).json({ error: 'Error al contar neumáticos disponibles' });
    }
};



module.exports = {
    getPoNeumaticos,
    actualizarNeumatico,
    eliminarNeumatico,
    contarProyectosNeumatico,
    contarNeumaticos,
    contarNeumaticosAsignados,
    contarNeumaticosDisponibles
};
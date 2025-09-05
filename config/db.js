const odbc = require('odbc');
require('dotenv').config();

const dbConfig = {
    DSN: process.env.DB_DSN,
    system: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

const db = {
    connection: null,

    connect: async () => {
        try {
            const connStr = `DSN=${dbConfig.DSN};UID=${dbConfig.user};PWD=${dbConfig.password};System=${dbConfig.system};charset=utf8`;
            db.connection = await odbc.connect(connStr);
            console.log('✅ Conectado a DB2 vía ODBC correctamente');
        } catch (err) {
            console.error('❌ Error de conexión ODBC:', err);
        }
    },

    query: async (sql, params = []) => {
        if (!db.connection) await db.connect();
        return db.connection.query(sql, params);
    },

    close: async () => {
        if (db.connection) {
            await db.connection.close();
            db.connection = null;
            console.log('🔌 Conexión cerrada.');
        }
    }
};

module.exports = db;

const { pool } = require('./db');

async function compareDBs() {
    try {
        console.log('=== INFORMACIÓN DE CONEXIÓN ===\n');

        // 1. Mostrar qué DB está usando la app
        const [dbInfo] = await pool.query('SELECT DATABASE() as current_db');
        console.log(`Base de datos conectada: ${dbInfo[0].current_db}`);

        // 2. Contar formaciones en esta DB
        const [count] = await pool.query('SELECT COUNT(*) as total FROM formaciones');
        console.log(`Total formaciones en ${dbInfo[0].current_db}: ${count[0].total}`);

        // 3. Listar todas las bases de datos disponibles
        console.log('\n=== BASES DE DATOS DISPONIBLES ===\n');
        const [dbs] = await pool.query('SHOW DATABASES');
        dbs.forEach(db => {
            const dbName = db.Database || db.database;
            console.log(`- ${dbName}`);
        });

        console.log('\n=== INSTRUCCIONES ===');
        console.log('1. Verifica en qué base de datos estás ejecutando el SELECT en MySQL');
        console.log('2. Si la DB correcta NO es "asistencia", necesitas actualizar el archivo .env');
        console.log('3. En .env, cambia la línea: MYSQL_DATABASE=nombre_correcto');

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}

compareDBs();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function freshConnection() {
    // Crear una conexión NUEVA (no pool) para evitar caché
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'asistencia'
    });

    console.log('=== CONEXIÓN NUEVA (NO POOL) ===\n');

    const [count] = await connection.query('SELECT COUNT(*) as total FROM formaciones');
    console.log(`Total formaciones: ${count[0].total}`);

    const [rows] = await connection.query(`
    SELECT codigo, nombre, jornada 
    FROM formaciones 
    ORDER BY created_at DESC 
    LIMIT 10
  `);

    console.log('\nPrimeras 10 formaciones:\n');
    rows.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.codigo} - ${row.nombre} (${row.jornada})`);
    });

    await connection.end();
    process.exit(0);
}

freshConnection().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

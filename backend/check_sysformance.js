const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSysformance() {
    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: 'sysformance_schema' // Explicitly check this DB
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to sysformance_schema');

        const [rows] = await connection.query('SELECT COUNT(*) as count FROM formaciones');
        console.log('Formaciones count in sysformance_schema:', rows[0].count);

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSysformance();

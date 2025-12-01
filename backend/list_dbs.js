const { pool } = require('./db');

async function listDatabases() {
    try {
        const [rows] = await pool.query('SHOW DATABASES');
        console.log('Databases found:');
        rows.forEach(row => console.log(`- ${row.Database}`));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listDatabases();

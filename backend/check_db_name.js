const { pool } = require('./db');

async function checkCurrentDB() {
    try {
        const [rows] = await pool.query('SELECT DATABASE() as dbName');
        console.log('Connected to database:', rows[0].dbName);

        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCurrentDB();

require('dotenv').config();
const { createPool } = require('mysql2/promise');

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function describeTable() {
    try {
        const [rows] = await pool.query('DESCRIBE aprendices');
        console.log('--- APRENDICES TABLE SCHEMA ---');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

describeTable();

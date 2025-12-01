const { pool } = require('./db');

async function checkTable() {
    try {
        const [rows] = await pool.query('DESCRIBE asistencias');
        console.log('\n=== ESTRUCTURA DE LA TABLA ASISTENCIAS ===\n');
        rows.forEach(col => {
            console.log(`${col.Field.padEnd(20)} | ${col.Type.padEnd(15)} | Null: ${col.Null.padEnd(3)} | Key: ${col.Key || '-'}`);
        });
        console.log('\n' + '='.repeat(70));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTable();

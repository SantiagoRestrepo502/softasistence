const { pool } = require('./db');

async function showCodes() {
    const [codes] = await pool.query('SELECT codigo, nombre FROM formaciones ORDER BY created_at DESC LIMIT 10');
    console.log('\n=== FORMACIONES EN LA BASE DE DATOS "asistencia" ===\n');
    console.log('Total encontradas:', codes.length);
    console.log('\nLista:');
    codes.forEach((row, idx) => {
        console.log(`${idx + 1}. ${row.codigo} - ${row.nombre}`);
    });
    console.log('\n');
    process.exit(0);
}

showCodes().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

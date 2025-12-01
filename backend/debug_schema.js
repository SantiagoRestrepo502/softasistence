const { pool } = require('./db');

async function checkSchema() {
    try {
        console.log('--- FORMACIONES ---');
        const [formacionesCols] = await pool.query('DESCRIBE formaciones');
        formacionesCols.forEach(c => console.log(`${c.Field} : ${c.Type}`));

        console.log('\n--- FORMACIONES_APRENDICES ---');
        const [faCols] = await pool.query('DESCRIBE formaciones_aprendices');
        faCols.forEach(c => console.log(`${c.Field} : ${c.Type}`));

        console.log('\n--- ASISTENCIAS ---');
        const [asistenciasCols] = await pool.query('DESCRIBE asistencias');
        asistenciasCols.forEach(c => console.log(`${c.Field} : ${c.Type}`));

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();

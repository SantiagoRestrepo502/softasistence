const { pool } = require('./db');
const fs = require('fs');

async function checkSchema() {
    try {
        const [formacionesCols] = await pool.query('DESCRIBE formaciones');
        const [faCols] = await pool.query('DESCRIBE formaciones_aprendices');
        const [asistenciasCols] = await pool.query('DESCRIBE asistencias');

        const schema = {
            formaciones: formacionesCols,
            formaciones_aprendices: faCols,
            asistencias: asistenciasCols
        };

        fs.writeFileSync('schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema written to schema.json');
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();

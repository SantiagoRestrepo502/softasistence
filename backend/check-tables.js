const { pool } = require('./db');

async function checkTables() {
    try {
        console.log('=== Verificando estructura de tablas ===\n');

        // Verificar tabla aprendices
        console.log('Tabla APRENDICES:');
        const [aprendicesDesc] = await pool.query('DESCRIBE aprendices');
        console.table(aprendicesDesc);

        // Verificar tabla formaciones
        console.log('\nTabla FORMACIONES:');
        const [formacionesDesc] = await pool.query('DESCRIBE formaciones');
        console.table(formacionesDesc);

        // Verificar si existe tabla intermedia
        console.log('\nBuscando tabla aprendiz_formacion...');
        try {
            const [intermediateDesc] = await pool.query('DESCRIBE aprendiz_formacion');
            console.log('✅ Tabla aprendiz_formacion EXISTE:');
            console.table(intermediateDesc);
        } catch (err) {
            console.log('❌ Tabla aprendiz_formacion NO EXISTE');
        }

        // Mostrar datos de ejemplo
        console.log('\n=== Datos de ejemplo ===\n');
        const [aprendices] = await pool.query('SELECT * FROM aprendices LIMIT 2');
        console.log('Aprendices:');
        console.table(aprendices);

        const [formaciones] = await pool.query('SELECT * FROM formaciones LIMIT 2');
        console.log('\nFormaciones:');
        console.table(formaciones);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkTables();

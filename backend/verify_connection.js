const { pool } = require('./db');

async function verifyConnection() {
    try {
        console.log('=== CONFIGURACIÓN DE CONEXIÓN (desde .env) ===\n');
        console.log(`Host: ${process.env.MYSQL_HOST || 'localhost'}`);

        // Mostrar códigos existentes
        const [codes] = await pool.query('SELECT codigo FROM formaciones ORDER BY created_at DESC LIMIT 5');
        console.log('\nPrimeros 5 códigos:');
        codes.forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${row.codigo}`);
        });

        console.log('\n=== PREGUNTA PARA EL USUARIO ===');
        console.log('¿Ves códigos como "2873477", "2926116" en la lista de arriba?');
        console.log('Si NO los ves, significa que tu cliente MySQL está conectado a otro servidor/puerto.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error('Código:', error.code);
        process.exit(1);
    }
}

verifyConnection();

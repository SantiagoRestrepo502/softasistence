const { pool } = require('./db');

async function seedAndVerify() {
    try {
        console.log('--- PRE-CHECK ---');
        const [preCount] = await pool.query('SELECT COUNT(*) as count FROM formaciones');
        console.log('Formaciones count before seed:', preCount[0].count);

        const testCode = 'TEST-2025';

        // Insert test data
        console.log('\n--- SEEDING ---');
        try {
            await pool.query(
                `INSERT INTO formaciones (codigo, nombre, jornada, fecha_inicio, activo) 
         VALUES (?, 'Formación de Prueba', 'mañana', CURDATE(), 1)`,
                [testCode]
            );
            console.log(`Inserted formation with code: ${testCode}`);
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                console.log(`Formation ${testCode} already exists.`);
            } else {
                throw e;
            }
        }

        // Verify
        console.log('\n--- VERIFICATION ---');
        const [rows] = await pool.query(
            `SELECT f.codigo, f.nombre, f.jornada 
       FROM formaciones f 
       WHERE f.codigo = ?`,
            [testCode]
        );
        console.log('Retrieved row:', rows[0]);

        if (rows.length > 0 && rows[0].codigo === testCode) {
            console.log('SUCCESS: Data inserted and retrieved correctly using new schema.');
        } else {
            console.log('FAILURE: Could not retrieve inserted data.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedAndVerify();

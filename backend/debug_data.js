const { pool } = require('./db');

async function checkData() {
    try {
        console.log('Checking formaciones count...');
        const [count] = await pool.query('SELECT COUNT(*) as count FROM formaciones');
        console.log('Total formaciones:', count[0].count);

        console.log('\nRunning getAllFormaciones query...');
        const query = `
      SELECT f.codigo, f.nombre, f.jornada, 
             f.fecha_inicio, f.fecha_fin, f.activo,
             f.created_at as fecha_creacion,
             COUNT(DISTINCT fa.id_aprendiz) as total_aprendices
      FROM formaciones f
      LEFT JOIN formaciones_aprendices fa ON f.codigo = fa.fk_codigo_formacion
      WHERE 1=1
      GROUP BY f.codigo ORDER BY f.created_at DESC
    `;
        const [rows] = await pool.query(query);
        console.log('Query result count:', rows.length);
        if (rows.length > 0) {
            console.log('First row:', rows[0]);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
}

checkData();

const { pool } = require('./db');

async function testGetAllFormaciones() {
    try {
        console.log('=== QUERY EXACTA USADA POR getAllFormaciones() ===\n');

        const query = `
      SELECT f.codigo, f.nombre, f.jornada, 
             f.fecha_inicio, f.fecha_fin, f.activo,
             f.created_at as fecha_creacion,
             COUNT(DISTINCT fa.id_aprendiz) as total_aprendices
      FROM formaciones f
      LEFT JOIN formaciones_aprendices fa ON f.codigo = fa.fk_codigo_formacion
      WHERE 1=1
      GROUP BY f.codigo
      ORDER BY f.created_at DESC
    `;

        console.log(query);
        console.log('\n=== EJECUTANDO QUERY ===\n');

        const [rows] = await pool.query(query);

        console.log(`Total de formaciones encontradas: ${rows.length}\n`);

        if (rows.length > 0) {
            console.log('=== COLUMNAS DEVUELTAS ===');
            console.log(Object.keys(rows[0]).join(', '));

            console.log('\n=== PRIMERAS 5 FORMACIONES ===\n');
            rows.slice(0, 5).forEach((row, idx) => {
                console.log(`${idx + 1}. Código: ${row.codigo}`);
                console.log(`   Nombre: ${row.nombre}`);
                console.log(`   Jornada: ${row.jornada}`);
                console.log(`   Activo: ${row.activo}`);
                console.log(`   Total Aprendices: ${row.total_aprendices}`);
                console.log(`   Fecha Creación: ${row.fecha_creacion}`);
                console.log('');
            });
        } else {
            console.log('⚠️ No se encontraron formaciones en la base de datos.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Código:', error.code);
        console.error('SQL State:', error.sqlState);
        process.exit(1);
    }
}

testGetAllFormaciones();

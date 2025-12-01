
const { pool } = require('./db');

async function test() {
    try {
        console.log('Testing connection...');
        const [rows] = await pool.query('SELECT 1 as val');
        console.log('Connection OK:', rows);

        console.log('Testing SELECT * FROM formaciones...');
        const [f] = await pool.query('SELECT * FROM formaciones LIMIT 1');
        console.log('Formaciones OK:', f);

        console.log('Testing specific query...');
        const query = `
      SELECT f.codigo, f.nombre, f.jornada, 
             f.fecha_inicio, f.fecha_fin, f.activo,
             f.created_at as fecha_creacion,
             0 as total_aprendices
      FROM formaciones f
      WHERE 1=1
      ORDER BY f.created_at DESC
    `;
        const [q] = await pool.query(query);
        console.log('Query OK, rows:', q.length);

    } catch (err) {
        console.error('ERROR:', err.message);
        console.error('CODE:', err.code);
        console.error('SQL:', err.sql);
    } finally {
        process.exit();
    }
}

test();

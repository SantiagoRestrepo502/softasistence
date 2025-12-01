const { pool } = require('./db');

async function migrate() {
    try {
        console.log('Iniciando migración de base de datos...');

        // 1. Verificar si la columna ya existe
        const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'asistencias' 
      AND COLUMN_NAME = 'documento'
    `);

        if (columns.length > 0) {
            console.log('✅ La columna "documento" ya existe en la tabla "asistencias".');
        } else {
            // 2. Agregar la columna si no existe
            console.log('⚠️ La columna "documento" no existe. Agregándola...');
            await pool.query(`
        ALTER TABLE asistencias
        ADD COLUMN documento VARCHAR(20) NULL AFTER rol;
      `);
            console.log('✅ Columna "documento" agregada exitosamente.');
        }

        console.log('Migración completada.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();

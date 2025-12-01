const { pool } = require('./db');

async function fixSchema() {
    try {
        console.log('🔧 Iniciando reparación de esquema de base de datos...');

        // Lista de columnas que necesitamos en 'asistencias'
        const columnsNeeded = [
            { name: 'jornada', type: 'VARCHAR(50) NULL' },
            { name: 'ficha', type: 'VARCHAR(50) NULL' },
            { name: 'nombre_formacion', type: 'VARCHAR(100) NULL' },
            { name: 'rol', type: 'VARCHAR(20) DEFAULT "aprendiz"' },
            { name: 'documento', type: 'VARCHAR(20) NULL' },
            { name: 'fecha_creacion', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
        ];

        // Obtener columnas actuales
        const [currentColumns] = await pool.query(`DESCRIBE asistencias`);
        const existingColumnNames = currentColumns.map(c => c.Field);

        for (const col of columnsNeeded) {
            if (!existingColumnNames.includes(col.name)) {
                console.log(`   ➕ Agregando columna faltante: ${col.name}`);
                try {
                    await pool.query(`ALTER TABLE asistencias ADD COLUMN ${col.name} ${col.type}`);
                } catch (e) {
                    console.error(`   ❌ Error agregando ${col.name}:`, e.message);
                }
            } else {
                console.log(`   ✅ Columna ${col.name} ya existe.`);
            }
        }

        console.log('🏁 Reparación finalizada.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

fixSchema();

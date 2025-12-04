const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de conexión MySQL
const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'asistencia'
};

// Configuración del usuario admin
const adminUser = {
    cedula: 1117499559,
    nombre: 'Wilfer',
    apellido: 'Administrador',
    email: 'admin@sena.edu.co',
    password: 'admin1234',
    rol: 'admin',
    activo: 1
};

async function createAdminUser() {
    let connection;
    try {
        console.log('\n🚀 Iniciando creación de usuario administrador...\n');

        // Conectar a la base de datos
        console.log('🔗 Conectando a MySQL...');
        console.log(`   Host: ${dbConfig.host}`);
        console.log(`   Puerto: ${dbConfig.port}`);
        console.log(`   Base de datos: ${dbConfig.database}`);

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión exitosa con la base de datos\n');

        // Generar hash de contraseña con bcrypt
        console.log('🔐 Generando hash de contraseña con bcrypt...');
        const passwordHash = await bcrypt.hash(adminUser.password, 10);
        console.log('✅ Hash generado exitosamente\n');

        // Eliminar usuario existente si existe
        console.log('🗑️  Verificando si existe usuario previo...');
        const deleteQuery = 'DELETE FROM usuarios WHERE email = ? OR cedula = ?';
        const deleteResult = await connection.execute(deleteQuery, [adminUser.email, adminUser.cedula]);
        if (deleteResult[0].affectedRows > 0) {
            console.log(`✅ Se eliminó ${deleteResult[0].affectedRows} usuario(s) previo(s)\n`);
        } else {
            console.log('ℹ️  No había usuario previo\n');
        }

        // Insertar nuevo usuario administrador
        console.log('📝 Creando nuevo usuario administrador...');
        const insertQuery = `INSERT INTO usuarios (cedula, nombre, apellido, email, password_hash, rol, activo) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertResult = await connection.execute(insertQuery, [
            adminUser.cedula,
            adminUser.nombre,
            adminUser.apellido,
            adminUser.email,
            passwordHash,
            adminUser.rol,
            adminUser.activo
        ]);

        if (insertResult[0].affectedRows === 1) {
            console.log('✅ Usuario creado exitosamente!\n');
        } else {
            throw new Error('No se pudo crear el usuario');
        }

        // Verificar el usuario creado
        console.log('🔍 Verificando usuario en la base de datos...');
        const verifyQuery = 'SELECT cedula, nombre, apellido, email, rol, activo FROM usuarios WHERE email = ?';
        const [usuarios] = await connection.execute(verifyQuery, [adminUser.email]);

        if (usuarios.length > 0) {
            const usuario = usuarios[0];
            console.table(usuario);
        }

        // Mostrar resumen
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('✅ USUARIO ADMINISTRADOR CREADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('\n📋 CREDENCIALES DE ACCESO:');
        console.log(`   Email:      ${adminUser.email}`);
        console.log(`   Contraseña: ${adminUser.password}`);
        console.log(`   Rol:        ${adminUser.rol}`);
        console.log(`   Cédula:     ${adminUser.cedula}`);
        console.log('\n🌐 Inicia sesión en: http://localhost:5173 (o tu URL configurada)');
        console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login!');
        console.log('═══════════════════════════════════════════════════════════\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verifica que MySQL esté ejecutándose en puerto 3306');
        console.log('   2. Verifica que la base de datos "asistencia" existe');
        console.log('   3. Verifica que la tabla "usuarios" existe');
        console.log('   4. Verifica las credenciales en el archivo .env\n');
        console.log('Detalles del error:');
        console.error(error);
        process.exit(1);
    } finally {
        // Cerrar la conexión
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada\n');
        }
    }
}

// Ejecutar
createAdminUser();

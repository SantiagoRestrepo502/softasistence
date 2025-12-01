const mysql = require('mysql2/promise');

async function testPort(port) {
    const config = {
        host: '127.0.0.1',
        port: port,
        user: 'root',
        password: '',
        database: 'asistencia',
        connectTimeout: 2000 // 2s timeout
    };

    console.log(`Testing port ${port}...`);
    try {
        const connection = await mysql.createConnection(config);
        console.log(`✅ SUCCESS! MySQL found on port ${port}`);
        await connection.end();
        return true;
    } catch (error) {
        console.log(`❌ Port ${port} failed: ${error.code || error.message}`);
        return false;
    }
}

async function runScan() {
    const ports = [3006, 3306, 3307, 3308];
    console.log('Scanning ports:', ports);

    for (const port of ports) {
        const success = await testPort(port);
        if (success) break;
    }
}

runScan();

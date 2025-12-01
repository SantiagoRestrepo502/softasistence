const { pool } = require('./db');
const fs = require('fs');

async function inspect() {
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    try {
        log('\n--- DESCRIBE formaciones_aprendices ---');
        const [desc] = await pool.query('DESCRIBE formaciones_aprendices');
        log(JSON.stringify(desc, null, 2));

        fs.writeFileSync('junction_info.txt', output);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

inspect();

const { pool } = require('./db');
const fs = require('fs');

async function inspect() {
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    try {
        log('--- TABLES ---');
        const [tables] = await pool.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        log(JSON.stringify(tableNames, null, 2));

        if (tableNames.includes('formaciones')) {
            log('\n--- DESCRIBE formaciones ---');
            const [formaciones] = await pool.query('DESCRIBE formaciones');
            log(JSON.stringify(formaciones, null, 2));
        }

        if (tableNames.includes('aprendices')) {
            log('\n--- DESCRIBE aprendices ---');
            const [aprendices] = await pool.query('DESCRIBE aprendices');
            log(JSON.stringify(aprendices, null, 2));
        }

        const junction = tableNames.find(t => (t.includes('aprendiz') && t.includes('formacion')) || (t.includes('formacion') && t.includes('aprendiz')));

        if (junction) {
            log(`\n--- DESCRIBE ${junction} ---`);
            const [desc] = await pool.query(`DESCRIBE ${junction}`);
            log(JSON.stringify(desc, null, 2));
        } else {
            log('\nNo obvious junction table found.');
        }

        fs.writeFileSync('schema_info.txt', output);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

inspect();

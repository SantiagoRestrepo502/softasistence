const { pool } = require('./db');

async function inspect() {
    try {
        console.log('--- TABLES ---');
        const [tables] = await pool.query('SHOW TABLES');
        console.log(tables.map(t => Object.values(t)[0]));

        console.log('\n--- DESCRIBE formaciones ---');
        try {
            const [formaciones] = await pool.query('DESCRIBE formaciones');
            console.log(formaciones);
        } catch (e) { console.log('Table formaciones not found'); }

        console.log('\n--- DESCRIBE aprendices ---');
        try {
            const [aprendices] = await pool.query('DESCRIBE aprendices');
            console.log(aprendices);
        } catch (e) { console.log('Table aprendices not found'); }

        console.log('\n--- FIND JUNCTION TABLE ---');
        const [allTables] = await pool.query('SHOW TABLES');
        const tableNames = allTables.map(t => Object.values(t)[0]);
        const junction = tableNames.find(t => t.includes('aprendiz') && t.includes('formacion'));

        if (junction) {
            console.log(`\n--- DESCRIBE ${junction} ---`);
            const [desc] = await pool.query(`DESCRIBE ${junction}`);
            console.log(desc);
        } else {
            console.log('\nNo obvious junction table found (containing both "aprendiz" and "formacion")');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

inspect();

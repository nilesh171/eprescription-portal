const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    console.log('Connecting to MySQL server...');
    
    // Connect WITHOUT specifying a database first
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    console.log('Connected! Creating database and tables...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons to run statements one by one
    const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        try {
            await connection.query(statement);
            console.log('OK:', statement.substring(0, 60).replace(/\n/g, ' '), '...');
        } catch (err) {
            console.error('Error on statement:', statement.substring(0, 60));
            console.error(err.message);
        }
    }

    console.log('\n✅ Database initialized successfully!');
    await connection.end();
}

initializeDatabase().catch(err => {
    console.error('❌ Initialization failed:', err.message);
    process.exit(1);
});

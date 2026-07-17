require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server.');

        await connection.query('CREATE DATABASE IF NOT EXISTS assessment_db;');
        console.log('Database assessment_db created or exists.');

        await connection.query('USE assessment_db;');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
                priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await connection.query(createTableQuery);
        console.log('Table tasks created or exists.');

        await connection.end();
        console.log('Database initialization completed.');
    } catch (err) {
        console.error('Error setting up DB:', err);
    }
}
setup();

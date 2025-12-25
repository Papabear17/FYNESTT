const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: '', // Assuming default empty password for root on new install, user might need to change this if they set one
    multipleStatements: true
};

const NEW_USER_CONFIG = {
    user: 'fynest_user',
    password: 'fynest_password',
    database: 'fynest_db'
};

const DATA_FILE = path.join(__dirname, 'data', 'products.json');

async function setup() {
    console.log("Starting Database Setup...");

    let connection;
    try {
        // 1. Connect to MySQL Server (Root)
        try {
            connection = await mysql.createConnection(DB_CONFIG);
            console.log("Connected to MySQL Server as root.");
        } catch (e) {
            console.error("\n❌ FAILED TO CONNECT TO MYSQL.");
            console.error("Please make sure:");
            console.error("1. MySQL Server is running.");
            console.error("2. You might have set a password for 'root'. Code assumes empty password.");
            console.error("Error details:", e.message);
            return;
        }

        // 2. Create Database and User
        const initSql = `
            CREATE DATABASE IF NOT EXISTS ${NEW_USER_CONFIG.database};
            CREATE USER IF NOT EXISTS '${NEW_USER_CONFIG.user}'@'localhost' IDENTIFIED BY '${NEW_USER_CONFIG.password}';
            GRANT ALL PRIVILEGES ON ${NEW_USER_CONFIG.database}.* TO '${NEW_USER_CONFIG.user}'@'localhost';
            FLUSH PRIVILEGES;
        `;

        await connection.query(initSql);
        console.log(`✅ Database '${NEW_USER_CONFIG.database}' and User '${NEW_USER_CONFIG.user}' created.`);

        await connection.end();

        // 3. Connect as New User to Create Table
        connection = await mysql.createConnection({
            host: 'localhost',
            ...NEW_USER_CONFIG
        });
        console.log("Connected as new user.");

        const createTableSql = `
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                price INT,
                stock INT DEFAULT 0,
                isNew BOOLEAN DEFAULT FALSE,
                featured BOOLEAN DEFAULT FALSE,
                image TEXT,
                colorStory TEXT,
                season VARCHAR(50),
                coverImage MEDIUMTEXT,
                gallery MEDIUMTEXT,
                shortDescription TEXT,
                description TEXT,
                tags TEXT,
                sales INT DEFAULT 0
            );
        `;
        await connection.query(createTableSql);
        console.log("✅ Table 'products' created.");

        // 4. Migrate Data from JSON
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE, 'utf8');
            const products = JSON.parse(rawData);

            if (products.length > 0) {
                console.log(`Migrating ${products.length} products...`);
                for (const p of products) {
                    // Check if exists
                    const [rows] = await connection.query("SELECT id FROM products WHERE id = ?", [p.id]);
                    if (rows.length === 0) {
                        const sql = `
                            INSERT INTO products (
                                id, name, category, price, stock, isNew, featured, image,
                                colorStory, season, coverImage, gallery, shortDescription,
                                description, tags, sales
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;

                        // Handle array conversions for text fields
                        const galleryStr = Array.isArray(p.gallery) ? p.gallery.join(', ') : (p.gallery || '');
                        const tagsStr = Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '');

                        await connection.query(sql, [
                            p.id, p.name, p.category, p.price, p.stock || 0, p.isNew || false, p.featured || false, p.image || '',
                            p.colorStory || '', p.season || '', p.coverImage || '', galleryStr, p.shortDescription || '',
                            p.description || '', tagsStr, p.sales || 0
                        ]);
                    }
                }
                console.log("✅ Data migration complete.");
            } else {
                console.log("No data in JSON to migrate.");
            }
        }

    } catch (err) {
        console.error("Setup failed:", err);
    } finally {
        if (connection) await connection.end();
    }
}

setup();

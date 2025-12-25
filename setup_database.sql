-- FYNEST Database Setup Script
-- Jalankan script ini di MySQL/phpMyAdmin

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS fynest_db;
USE fynest_db;

-- 2. Buat User (opsional, skip jika sudah ada)
CREATE USER IF NOT EXISTS 'fynest_user'@'localhost' IDENTIFIED BY 'fynest_password';
GRANT ALL PRIVILEGES ON fynest_db.* TO 'fynest_user'@'localhost';
FLUSH PRIVILEGES;

-- 3. Buat Tabel Products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price INT DEFAULT 0,
    stock INT DEFAULT 0,
    isNew BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    image TEXT,
    colorStory VARCHAR(100),
    season VARCHAR(50),
    coverImage TEXT,
    gallery TEXT,
    shortDescription TEXT,
    description TEXT,
    tags TEXT,
    sales INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Insert Sample Data (Produk Contoh Luxury Streetwear)
INSERT INTO products (id, name, category, price, stock, isNew, featured, image, colorStory, season, coverImage, gallery, shortDescription, description, tags) VALUES
('midnight-void-tee', 'Midnight Void Tee', 'Essentials', 450000, 15, TRUE, TRUE, 
 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600', 
 'Deep Noir', 'AW 24/25', 
 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600',
 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600',
 'Premium cotton tee dengan siluet oversized yang sempurna.',
 'Dibuat dari 100% cotton fleece 330gsm yang kokoh namun lembut. Potongan oversized memberikan siluet santai namun tetap berstruktur. Perfect untuk daily wear dengan sentuhan luxury.',
 'Signature, Essentials, Cotton'),

('obsidian-hoodie', 'Obsidian Hoodie', 'Outerwear', 850000, 8, TRUE, TRUE,
 'https://images.pexels.com/photos/7148439/pexels-photo-7148439.jpeg?auto=compress&cs=tinysrgb&w=600',
 'Charcoal Black', 'AW 24/25',
 'https://images.pexels.com/photos/7148439/pexels-photo-7148439.jpeg?auto=compress&cs=tinysrgb&w=600',
 'https://images.pexels.com/photos/7148439/pexels-photo-7148439.jpeg?auto=compress&cs=tinysrgb&w=600',
 'Hoodie premium dengan detail minimalis yang elegan.',
 'Crafted from heavyweight French terry fabric. Featuring ribbed cuffs and hem for superior fit. The perfect layering piece for any season.',
 'Outerwear, Premium, Hoodie'),

('eclipse-cargo-pants', 'Eclipse Cargo Pants', 'Bottoms', 750000, 12, FALSE, FALSE,
 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
 'Midnight Grey', 'AW 24/25',
 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600',
 'Cargo pants dengan utility pockets dan tailored fit.',
 'Constructed from durable ripstop fabric with reinforced stitching. Multiple cargo pockets provide both function and style. Tapered leg for modern silhouette.',
 'Bottoms, Cargo, Utility');

-- Selesai!
SELECT 'Database fynest_db berhasil dibuat!' AS status;

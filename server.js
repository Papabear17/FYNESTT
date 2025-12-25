const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config.js');

const app = express();
const PORT = CONFIG.PORT; // Use centralized config
const DATA_FILE = path.join(__dirname, 'products.json');
const SETTINGS_FILE = path.join(__dirname, 'site_settings.json');

// Middleware - CORS configuration to allow Live Server
app.use(cors({
    origin: '*', // Allow all origins (including Live Server port 5500)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for Base64 images
app.use(express.static(path.join(__dirname)));

// --- HELPERS ---
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Create default file if missing
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return [];
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing data:", err);
        return false;
    }
};

const readSettings = () => {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            return {};
        }
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading settings:", err);
        return {};
    }
};

const writeSettings = (data) => {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Error writing settings:", err);
        return false;
    }
};

// --- API ENDPOINTS ---

// GET Settings
app.get('/api/settings', (req, res) => {
    const settings = readSettings();
    res.json(settings);
});

// POST Settings
app.post('/api/settings', (req, res) => {
    const settings = req.body;
    if (writeSettings(settings)) {
        res.json({ message: "Settings saved", settings });
    } else {
        res.status(500).json({ error: "Failed to save settings" });
    }
});

// GET All Products
app.get('/api/products', (req, res) => {
    const products = readData();
    res.json(products);
});

// POST Add Product
app.post('/api/products', (req, res) => {
    const products = readData();
    const p = req.body;

    // Generate ID
    const newId = products.length > 0 ? Math.max(...products.map(x => parseInt(x.id) || 0)) + 1 : 1;

    const newProduct = {
        ...p,
        id: newId.toString(),
        stock: parseInt(p.stock) || 0,
        price: parseInt(p.price) || 0,
        isNew: !!p.isNew,
        featured: !!p.featured,
        sales: 0
    };

    products.push(newProduct);

    if (writeData(products)) {
        res.status(201).json(newProduct);
    } else {
        res.status(500).json({ error: "Failed to save product" });
    }
});

// PUT Update Product
app.put('/api/products/:id', (req, res) => {
    let products = readData();
    const id = req.params.id;
    const p = req.body;

    const index = products.findIndex(x => x.id.toString() === id.toString());
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    products[index] = {
        ...products[index],
        ...p,
        id: id // Ensure ID doesn't change
    };

    if (writeData(products)) {
        res.json(products[index]);
    } else {
        res.status(500).json({ error: "Failed to update product" });
    }
});

// DELETE Product
app.delete('/api/products/:id', (req, res) => {
    let products = readData();
    const id = req.params.id;

    const initialLength = products.length;
    products = products.filter(x => x.id.toString() !== id.toString());

    if (products.length === initialLength) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (writeData(products)) {
        res.json({ message: "Product deleted successfully" });
    } else {
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// GET Categories
app.get('/api/categories', (req, res) => {
    try {
        const catPath = path.join(__dirname, 'data', 'categories.json');
        if (fs.existsSync(catPath)) {
            const catData = fs.readFileSync(catPath, 'utf8');
            res.json(JSON.parse(catData));
        } else {
            // Default categories
            res.json([
                { "id": "all", "name": "All Collection" },
                { "id": "t-shirts", "name": "T-Shirts" },
                { "id": "outerwear", "name": "Outerwear" }
            ]);
        }
    } catch (e) {
        res.status(500).send("Error reading categories");
    }
});

app.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
    console.log(`Storage: ${DATA_FILE}`);
});

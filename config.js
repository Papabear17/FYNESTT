// CENTRAL CONFIGURATION
// Single source of truth for all API connections
const CONFIG = {
    PORT: 3001,
    HOST: 'localhost',
    get API_BASE() {
        return `http://${this.HOST}:${this.PORT}`;
    },
    get API_PRODUCTS() {
        return `${this.API_BASE}/api/products`;
    },
    get API_CATEGORIES() {
        return `${this.API_BASE}/api/categories`;
    },
    get API_SETTINGS() {
        return `${this.API_BASE}/api/settings`;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

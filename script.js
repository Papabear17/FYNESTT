// FYNEST CORE LOGIC

// State
let products = [];
let categories = [];
let activeCategory = 'all';
let wishlist = JSON.parse(localStorage.getItem('fynest_wishlist')) || [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const filterContainer = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Promise.all([fetchProducts(), fetchCategories(), fetchSettings()]);

    renderFilters();
    renderProducts(products);
    renderLookbook(products);
    setupSearch();
    setupFAQ(); // Added FAQ setup
    initThreeJS();

    // ==== DYNAMIC SITE CONFIG ====
    const siteConfig = JSON.parse(localStorage.getItem("fynest_site_config"));
    if (siteConfig) {
      if (siteConfig.title) document.querySelector(".hero-title").innerHTML = siteConfig.title.replace(/\n/g, "<br>");
      if (siteConfig.subtitle) document.querySelector(".hero-subtitle").textContent = siteConfig.subtitle;
      if (siteConfig.btnText) document.querySelector(".hero-buttons .primary-btn").textContent = siteConfig.btnText;
    }

    // ==== PROMO BANNER (POLISHED) ====
    const promos = JSON.parse(localStorage.getItem("fynest_promos")) || [];
    if (promos.length > 0) {
      const p = promos[0];
      const promoBar = document.createElement("div");
      promoBar.id = "topPromoBar";
      promoBar.style.cssText = `
        background: linear-gradient(90deg, #d4a76a, #ffe0b2);
        color: #1a1a1a;
        padding: 12px;
        text-align: center;
        font-weight: 600;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        transform: translateY(-100%);
        transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      `;
      promoBar.innerHTML = `
        <span>⚡ FLASH DEAL: Get <strong>${p.discount}</strong> with code <span style="background:#000; color:#fff; padding:3px 8px; border-radius:4px; font-family:monospace; letter-spacing:1px;">${p.code}</span></span>
        <button onclick="document.getElementById('topPromoBar').style.transform='translateY(-100%)'; setTimeout(()=>{document.querySelector('.navbar').style.top='0'}, 300)" style="background:none; border:none; color:#000; font-weight:bold; cursor:pointer; font-size:1.2rem;">&times;</button>
      `;
      document.body.prepend(promoBar);

      // Animate in
      setTimeout(() => {
        promoBar.style.transform = "translateY(0)";
        document.querySelector(".navbar").style.top = promoBar.offsetHeight + "px";
        document.querySelector(".navbar").style.transition = "top 0.3s";
      }, 500);
    }
  } catch (error) {
    console.error("Initialization failed:", error);
    productGrid.innerHTML = '<p style="text-align:center;">Failed to load data. Please try again.</p>';
  }
});

// --- DATA FETCHING ---
// Use centralized configuration with fallback
const API_BASE = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE) ? CONFIG.API_BASE : 'http://localhost:3001';

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error('Network response was not ok');
    products = await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    // Fallback or empty
  }
}

async function fetchCategories() {
  try {
    const response = await fetch('data/categories.json');
    categories = await response.json();
    // Ensure 'all' is there if not in JSON
    if (!categories.find(c => c.id === 'all')) {
      categories.unshift({ id: 'all', name: 'All Collection' });
    }
  } catch (error) {
    // Fallback default
    categories = [
      { id: 'all', name: 'All Collection' },
      { id: 't-shirts', name: 'T-Shirts' },
      { id: 'outerwear', "name": 'Outerwear' }
    ];
  }
}

async function fetchSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (res.ok) {
      const settings = await res.json();
      applyTheme(settings);
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
}

function applyTheme(settings) {
  const root = document.documentElement;

  if (settings.colors) {
    if (settings.colors.background) root.style.setProperty('--bg-color', settings.colors.background);
    if (settings.colors.text) root.style.setProperty('--text-color', settings.colors.text);
    if (settings.colors.accent) root.style.setProperty('--accent-color', settings.colors.accent);
    if (settings.colors.secondary) root.style.setProperty('--secondary-color', settings.colors.secondary);
  }

  if (settings.fonts) {
    if (settings.fonts.heading) root.style.setProperty('--font-heading', settings.fonts.heading);
    if (settings.fonts.body) root.style.setProperty('--font-body', settings.fonts.body);
  }

  if (settings.hero) {
    const titleEl = document.querySelector(".hero-title");
    const subEl = document.querySelector(".hero-subtitle");
    const btnEl = document.querySelector(".hero-buttons .primary-btn");

    if (titleEl && settings.hero.title) titleEl.innerHTML = settings.hero.title.replace(/\n/g, "<br>");
    if (subEl && settings.hero.subtitle) subEl.textContent = settings.hero.subtitle;
    // Note: Button text might be hard to change generically if there are multiple, but targeting specific one works
  }
}

// --- RENDERING ---
function renderProducts(data) {
  productGrid.innerHTML = '';

  if (data.length === 0) {
    productGrid.innerHTML = '<p class="loading-spinner">No products found matching your criteria.</p>';
    return;
  }

  data.forEach(product => {
    const isWishlisted = wishlist.includes(product.id);
    const stock = Number(product.stock) || 0;
    const isSoldOut = stock === 0;
    const isLowStock = stock > 0 && stock < 5;

    const card = document.createElement('article');
    card.className = `product-card ${isSoldOut ? 'sold-out' : ''}`;
    card.onclick = () => openModal(product);

    card.innerHTML = `
            <div class="card-badge-container">
                ${product.isNew ? '<span class="badge badge-new">New</span>' : ''}
                ${isSoldOut ? '<span class="badge" style="background:#ff4444; color:white;">SOLD OUT</span>' : (isLowStock ? '<span class="badge badge-low-stock">Low Stock</span>' : '')}
            </div>
            <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
                <svg viewBox="0 0 24 24">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </button>
            <div class="product-image">
                <img src="${product.image}" loading="lazy" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <span class="product-price">IDR ${product.price.toLocaleString('id-ID')}</span>
            </div>
        `;
    productGrid.appendChild(card);
  });
}

function renderFilters() {
  filterContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat.id === activeCategory ? 'filter-active' : ''}`;
    btn.textContent = cat.name;
    btn.onclick = () => filterByCategory(cat.id);
    filterContainer.appendChild(btn);
  });
}

// --- LOGIC ---
function filterByCategory(categoryId) {
  activeCategory = categoryId;

  // Update visual buttons
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(b => {
    b.classList.toggle('filter-active', b.textContent === categories.find(c => c.id === categoryId).name);
  });

  // Filter logic
  let filtered = products;
  if (categoryId !== 'all') {
    filtered = products.filter(p => p.category.toLowerCase() === categoryId.toLowerCase());
  }

  // Also respect search if any
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  renderProducts(filtered);
}

function setupSearch() {
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = e.target.value.toLowerCase();
      const filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      });
      renderProducts(filtered);
    }, 300); // 300ms debounce
  });
}


// --- NAVIGATION & UI LOGIC ---

function navigateTo(pageId) {
  // Hide all pages
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
  // Show target
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  // Update nav state
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Scroll to top
  window.scrollTo(0, 0);
}

function setupFAQ() {
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('active');
    });
  });

  // FAQ Search
  const searchInput = document.getElementById('faqSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.faq-item').forEach(item => {
        const txt = item.innerText.toLowerCase();
        item.style.display = txt.includes(term) ? 'block' : 'none';
      });
    });
  }
}

// --- LOOKBOOK & GALLERY LOGIC ---

function renderLookbook(data) {
  const grid = document.getElementById('lookbookGrid');
  if (!grid) return;

  grid.innerHTML = '';

  // Simple Masonry-like structure using CSS columns (handled in CSS)
  // We just dump items in, CSS does the layout

  data.forEach(product => {
    // Determine size class for variety (pseudo-random based on id length or similar)
    const isLarge = Math.random() > 0.7;

    const item = document.createElement('div');
    item.className = `lookbook-item ${isLarge ? 'large' : ''}`;
    item.onclick = () => openModal(product);

    item.innerHTML = `
      <img src="${product.coverImage || product.image}" loading="lazy" alt="${product.name}">
      <div class="lookbook-overlay">
        <h3>${product.name}</h3>
        <p>${product.category}</p>
      </div>
    `;

    grid.appendChild(item);
  });
}

// Gallery State
let currentGallery = [];
let currentSlideIndex = 0;

function updateGalleryView() {
  const img = document.getElementById('modalImage');
  if (!img) return;

  // Set main image
  const src = currentGallery[currentSlideIndex];
  img.src = src;

  // Update thumbs active state
  document.querySelectorAll('.thumb-item').forEach((thumb, idx) => {
    if (idx === currentSlideIndex) thumb.classList.add('active');
    else thumb.classList.remove('active');
  });
}

function nextSlide(e) {
  if (e) e.stopPropagation();
  currentSlideIndex = (currentSlideIndex + 1) % currentGallery.length;
  updateGalleryView();
}

function prevSlide(e) {
  if (e) e.stopPropagation();
  currentSlideIndex = (currentSlideIndex - 1 + currentGallery.length) % currentGallery.length;
  updateGalleryView();
}

// Expose to global
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;


// --- MODAL LOGIC (UPDATED) ---
function openModal(product) {
  // 1. Setup Gallery Data
  currentGallery = [];
  if (product.coverImage) currentGallery.push(product.coverImage);
  if (product.image && !currentGallery.includes(product.image)) currentGallery.push(product.image); // Fallback main image
  if (product.gallery && Array.isArray(product.gallery)) {
    product.gallery.forEach(url => {
      if (!currentGallery.includes(url)) currentGallery.push(url);
    });
  }

  // Fallback if empty
  if (currentGallery.length === 0) currentGallery.push('https://via.placeholder.com/400x600?text=No+Image');

  currentSlideIndex = 0;

  // 2. Render Thumbs
  const thumbContainer = document.getElementById('modalThumbs');
  if (thumbContainer) {
    thumbContainer.innerHTML = '';
    if (currentGallery.length > 1) {
      currentGallery.forEach((url, idx) => {
        const thumb = document.createElement('img');
        thumb.className = 'thumb-item';
        thumb.src = url;
        thumb.onclick = (e) => {
          e.stopPropagation();
          currentSlideIndex = idx;
          updateGalleryView();
        };
        thumbContainer.appendChild(thumb);
      });
    }
  }

  // 3. Initial View Update
  updateGalleryView();

  const cat = document.getElementById('modalCategory');
  if (cat) cat.textContent = product.category;

  const title = document.getElementById('modalTitle');
  if (title) title.textContent = product.name;

  const price = document.getElementById('modalPrice');
  if (price) price.textContent = `IDR ${product.price.toLocaleString('id-ID')}`;

  const desc = document.getElementById('modalDesc');
  if (desc) desc.textContent = product.description || "Designed for the bold. Premium quality materials tailored for a modern fit.";

  // Link buy button
  const btnBuy = document.querySelector('#productModal .modal-actions a');
  if (btnBuy) {
    btnBuy.href = product.link || 'https://vt.tiktok.com/ZSPfAKQNU/?page=Mall';
  }

  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(e) {
  if (!e || e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Make functions global for HTML onclick access
window.navigateTo = navigateTo;
window.closeModal = closeModal;
window.openModal = openModal;
// window.toggleWishlist is already assigned


// --- THREE.JS MANNEQUIN ANIMATION (Retained) ---
// --- THREE.JS MANNEQUIN ANIMATION (OR IMAGE REPLACEMENT) ---
function initThreeJS() {
  const container = document.getElementById('logo3DContainer');
  if (!container) return;

  // CHECK FOR ADMIN UPLOADED IMAGE REPLACEMENT
  const saved3DImage = localStorage.getItem("wili_3d_model_v1");
  if (saved3DImage && saved3DImage.trim() !== "") {
    // Determine if it's a URL or Base64 (both handled by src)
    container.innerHTML = `<img src="${saved3DImage}" alt="Brand Identity" style="width:100%; height:100%; object-fit:contain; animation: float 6s ease-in-out infinite;">`;
    // Add float animation keyframes via JS or assume it's in CSS (we'll add inline or rely on global)
    return; // Skip Three.js initialization
  }

  // Fallback to Three.js if no image provided
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('mannequinCanvas'), alpha: true, antialias: true });

  renderer.setSize(container.clientWidth, container.clientHeight);

  // Create a metallic aesthetic shape
  const geometry = new THREE.IcosahedronGeometry(1.5, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0xe4b98f,
    metalness: 0.9,
    roughness: 0.1,
    wireframe: true
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 2, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  camera.position.z = 4;

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

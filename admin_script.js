// ADMIN DASHBOARD LOGIC + SIMPLE LOGIN
// Detect environment: Use localhost if opening file directly, otherwise use relative path
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
const API_URL = `${API_BASE}/api/products`;
const ADMIN_AUTH_KEY = "wili_admin_auth_v1";
const ADMIN_USERNAME = "wili";
const ADMIN_PASSWORD = "wiliam";
const STORAGE_KEY_3D_MODEL = "wili_3d_model_v1";

// --- HELPERS (Copied/Restored for Admin Independence) ---
function formatIDR(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
}

// --- API HELPERS ---
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Gagal memuat data dari server. Pastikan server (node server.js) berjalan!");
    return [];
  }
}

async function createProduct(product) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Failed to create product");
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Gagal menambah produk.");
  }
}

async function updateProduct(id, product) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error("Failed to update product");
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Gagal mengupdate produk.");
  }
}

async function deleteProduct(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return true;
  } catch (err) {
    console.error(err);
    alert("Gagal menghapus produk.");
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("productForm");
  const formTitle = document.getElementById("formTitle");
  const tableBody = document.getElementById("productTableBody");
  const searchInput = document.getElementById("searchInput");
  const btnSeed = document.getElementById("btnSeed"); // Will be disabled or re-purposed
  if (btnSeed) btnSeed.style.display = 'none'; // Hide seed button as it's localstorage specific

  const btnReset = document.getElementById("btnReset");
  const coverFileInput = document.getElementById("fieldCoverFile");
  const galleryFilesInput = document.getElementById("fieldGalleryFiles");
  const field3DModelImage = document.getElementById("field3DModelImage");
  const field3DModelFile = document.getElementById("field3DModelFile");
  const btnRemove3D = document.getElementById("btnRemove3D");
  const loginOverlay = document.getElementById("loginOverlay");
  const loginForm = document.getElementById("loginForm");
  const btnLogout = document.getElementById("btnLogout");

  // ==== AUTH HELPERS ====
  function isAuthenticated() {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
    } catch {
      return false;
    }
  }

  function setAuthenticated(value) {
    try {
      if (value) {
        localStorage.setItem(ADMIN_AUTH_KEY, "true");
      } else {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      }
    } catch {
      // ignore
    }
  }

  function updateAuthUI() {
    const authed = isAuthenticated();
    if (authed) {
      loginOverlay.classList.add("hidden");
    } else {
      loginOverlay.classList.remove("hidden");
    }
  }

  // Inisialisasi UI auth
  updateAuthUI();

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      updateAuthUI();
      renderTable(); // Load data after login
    } else {
      alert("Username atau password salah. Gunakan kredensial demo yang tertera.");
    }
  });

  btnLogout?.addEventListener("click", () => {
    const ok = confirm("Logout dari Admin Atelier?");
    if (!ok) return;
    setAuthenticated(false);
    updateAuthUI();
  });

  async function renderTable(filter = "") {
    if (!isAuthenticated()) {
      return;
    }

    const products = await loadProducts(); // ASYNC Call
    const query = filter.trim().toLowerCase();
    tableBody.innerHTML = "";

    const filtered = !query
      ? products
      : products.filter((p) => {
        const haystack =
          (p.name || "") +
          " " +
          (p.category || "") +
          " " +
          (p.colorStory || "") +
          " " +
          (p.season || "");
        return haystack.toLowerCase().includes(query);
      });

    if (!filtered.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.style.color = "#a0a0ad";
      td.textContent =
        "Belum ada look yang cocok dengan filter.";
      tr.appendChild(td);
      tableBody.appendChild(tr);
      return;
    }

    filtered.forEach((p) => {
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.textContent = p.name || "Untitled Look";

      const tdCat = document.createElement("td");
      tdCat.textContent = p.category || "—";

      const tdPrice = document.createElement("td");
      tdPrice.textContent = formatIDR ? formatIDR(p.price) : p.price;

      const tdSeason = document.createElement("td");
      tdSeason.textContent = p.season || "—";

      const tdFeatured = document.createElement("td");
      if (p.featured) {
        const span = document.createElement("span");
        span.className = "pill-mini";
        span.textContent = "FEATURED";
        tdFeatured.appendChild(span);
      } else {
        tdFeatured.textContent = "-";
      }

      const tdActions = document.createElement("td");
      const wrap = document.createElement("div");
      wrap.className = "table-actions";

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.className = "btn-icon";
      btnEdit.textContent = "Edit";
      btnEdit.addEventListener("click", () => {
        populateForm(p);
      });

      const btnDelete = document.createElement("button");
      btnDelete.type = "button";
      btnDelete.className = "btn-icon danger";
      btnDelete.textContent = "Del";
      btnDelete.addEventListener("click", async () => {
        const ok = confirm(
          `Hapus look "${p.name || "Untitled"}"? Tindakan ini tidak bisa di-undo.`
        );
        if (!ok) return;

        await deleteProduct(p.id); // ASYNC Call
        renderTable(searchInput.value || "");
      });

      wrap.appendChild(btnEdit);
      wrap.appendChild(btnDelete);
      tdActions.appendChild(wrap);

      tr.appendChild(tdName);
      tr.appendChild(tdCat);
      tr.appendChild(tdPrice);
      tr.appendChild(tdSeason);
      tr.appendChild(tdFeatured);
      tr.appendChild(tdActions);

      tableBody.appendChild(tr);
    });
  }

  function generateId(name) {
    const slug = (name || "look")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug + "-" + Math.random().toString(36).slice(2, 6);
  }

  function parseList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function populateForm(p) {
    formTitle.textContent = "Edit Look";
    document.getElementById("fieldId").value = p.id || "";
    document.getElementById("fieldName").value = p.name || "";
    document.getElementById("fieldCategory").value = p.category || "";
    document.getElementById("fieldPrice").value = p.price ?? "";
    document.getElementById("fieldStock").value = p.stock ?? 0;
    document.getElementById("fieldColorStory").value = p.colorStory || "";
    document.getElementById("fieldSeason").value = p.season || "";
    // Note: File inputs cannot be pre-populated for security reasons
    // coverImage and gallery are stored but not displayed in file inputs
    document.getElementById("fieldShortDescription").value =
      p.shortDescription || "";
    document.getElementById("fieldDescription").value = p.description || "";
    document.getElementById("fieldTags").value = (p.tags || []).join(", ");
    document.getElementById("fieldFeatured").checked = !!p.featured;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    form.reset();
    document.getElementById("fieldId").value = "";
    formTitle.textContent = "Create Look";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const idField = document.getElementById("fieldId");
    const name = document.getElementById("fieldName").value.trim();
    const category = document.getElementById("fieldCategory").value.trim();
    const price = parseInt(document.getElementById("fieldPrice").value, 10) || 0;
    const stock = parseInt(document.getElementById("fieldStock").value, 10) || 0;
    const colorStory = document.getElementById("fieldColorStory").value.trim();
    const season = document.getElementById("fieldSeason").value.trim();

    // Use stored image data from file uploads (set by file input handlers)
    const coverImage = window.uploadedCoverImage || "";
    const gallery = window.uploadedGalleryImages || [];

    const shortDescription = document
      .getElementById("fieldShortDescription")
      .value.trim();
    const description = document
      .getElementById("fieldDescription")
      .value.trim();
    const tags = parseList(document.getElementById("fieldTags").value || "");
    const featured = document.getElementById("fieldFeatured").checked;

    if (!name) {
      alert("Nama look wajib diisi.");
      return;
    }

    const payload = {
      name,
      category,
      price,
      stock,
      colorStory,
      season,
      coverImage,
      image: coverImage, // Ensure main image is also set for homepage compatibility
      gallery,
      shortDescription,
      description,
      tags,
      featured
    };

    if (idField.value) {
      // Update
      await updateProduct(idField.value, { ...payload, id: idField.value });
    } else {
      // Create
      // Enable client-side ID generation if desired, or let server handle it. 
      // Server is configured to accept ID. We'll generate it here to keep consistency.
      const id = generateId(name);
      await createProduct({ ...payload, id });
    }

    renderTable(searchInput.value || "");
    resetForm();
  });

  btnReset.addEventListener("click", () => {
    resetForm();
  });

  // Upload cover image lewat File Explorer
  coverFileInput?.addEventListener("change", (event) => {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (!result || typeof result !== "string") return;
      // Store globally for form submission
      window.uploadedCoverImage = result;
      console.log("Cover image uploaded successfully");
    };
    reader.readAsDataURL(file);
  });

  // Upload multiple gallery images
  galleryFilesInput?.addEventListener("change", (event) => {
    const input = event.target;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const urls = [];
    let remaining = files.length;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === "string") {
          urls.push(reader.result);
        }
        remaining -= 1;
        if (remaining === 0) {
          // Store globally for form submission
          window.uploadedGalleryImages = urls;
          console.log(`${urls.length} gallery images uploaded successfully`);
        }
      };
      reader.readAsDataURL(file);
    });
  });

  searchInput.addEventListener("input", () => {
    renderTable(searchInput.value || "");
  });

  // ==== 3D MODEL IMAGE MANAGEMENT (Still LocalStorage) ====
  function get3DModelImage() {
    try {
      return localStorage.getItem(STORAGE_KEY_3D_MODEL) || "";
    } catch {
      return "";
    }
  }

  function set3DModelImage(url) {
    try {
      if (url && url.trim()) {
        localStorage.setItem(STORAGE_KEY_3D_MODEL, url.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_3D_MODEL);
      }
    } catch {
      // ignore
    }
  }

  const saved3DImage = get3DModelImage();
  if (field3DModelImage && saved3DImage) {
    field3DModelImage.value = saved3DImage;
  }

  field3DModelFile?.addEventListener("change", (event) => {
    const input = event.target;
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (!result || typeof result !== "string") return;
      if (field3DModelImage) {
        field3DModelImage.value = result;
      }
      set3DModelImage(result);
      alert("Foto 3D model berhasil di-upload!");
    };
    reader.readAsDataURL(file);
  });

  field3DModelImage?.addEventListener("blur", () => {
    const url = field3DModelImage.value.trim();
    set3DModelImage(url);
    if (url) alert("URL foto 3D model tersimpan!");
  });

  btnRemove3D?.addEventListener("click", () => {
    const ok = confirm("Hapus foto 3D model dan kembali ke manekin 3D default?");
    if (!ok) return;
    set3DModelImage("");
    if (field3DModelImage) field3DModelImage.value = "";
    if (field3DModelFile) field3DModelFile.value = "";
    alert("Foto 3D model dihapus.");
  });

  // ==== DASHBOARD STATS LOGIC ====
  async function updateDashboardStats() {
    const products = await loadProducts();

    // 1. Total Products
    document.getElementById("statTotalProducts").textContent = products.length;

    // 2. Asset Value (Sum of prices)
    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    document.getElementById("statAssetValue").textContent = formatIDR(totalValue);

    // 3. Active Promos
    const promos = JSON.parse(localStorage.getItem("fynest_promos")) || [];
    document.getElementById("statActivePromos").textContent = promos.length;
  }

  // ==== SITE CONFIG LOGIC ====
  const CONFIG_KEY = "fynest_site_config";
  const cfgForm = document.getElementById("siteConfigForm");

  function loadSiteConfig() {
    const config = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    document.getElementById("cfgHeroTitle").value = config.title || "REDEFINE YOUR STYLE";
    document.getElementById("cfgHeroSubtitle").value = config.subtitle || "Premium streetwear for the modern individual.";
    document.getElementById("cfgHeroBtn").value = config.btnText || "SHOP NOW";
  }

  cfgForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const config = {
      title: document.getElementById("cfgHeroTitle").value,
      subtitle: document.getElementById("cfgHeroSubtitle").value,
      btnText: document.getElementById("cfgHeroBtn").value
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    alert("Website Banner Updated!");
  });

  document.getElementById("resetBanner").addEventListener("click", () => {
    localStorage.removeItem(CONFIG_KEY);
    loadSiteConfig();
    alert("Banner reset to default.");
  });

  // ==== PROMO MANAGER LOGIC ====
  const PROMO_KEY = "fynest_promos";
  const promoForm = document.getElementById("promoForm");
  const promoList = document.getElementById("promoList");

  function loadPromos() {
    const promos = JSON.parse(localStorage.getItem(PROMO_KEY)) || [];
    promoList.innerHTML = "";
    document.getElementById("statActivePromos").textContent = promos.length;

    promos.forEach((promo, index) => {
      const div = document.createElement("div");
      div.className = "promo-item";
      div.innerHTML = `
        <div class="promo-info">
          <strong>${promo.code}</strong>
          <span>${promo.discount}</span>
        </div>
        <button class="btn-icon danger" onclick="deletePromo(${index})">X</button>
      `;
      promoList.appendChild(div);
    });
  }

  window.deletePromo = function (index) {
    const promos = JSON.parse(localStorage.getItem(PROMO_KEY)) || [];
    promos.splice(index, 1);
    localStorage.setItem(PROMO_KEY, JSON.stringify(promos));
    loadPromos();
  };

  promoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("promoCode").value.trim().toUpperCase();
    const discount = document.getElementById("promoDiscount").value.trim();
    if (!code || !discount) return;

    const promos = JSON.parse(localStorage.getItem(PROMO_KEY)) || [];
    promos.push({ code, discount });
    localStorage.setItem(PROMO_KEY, JSON.stringify(promos));

    document.getElementById("promoCode").value = "";
    document.getElementById("promoDiscount").value = "";
    loadPromos();
  });

  // Initial Logic Load
  if (isAuthenticated()) {
    renderTable();
    updateDashboardStats(); // Load stats
    loadSiteConfig();       // Load config
    loadPromos();           // Load promos
  }
});

// DETAIL PAGE LOGIC

// Reuse util from script.js: getStoredProducts, formatIDR, STORAGE_KEY

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getQueryParam("id");
  const products = getStoredProducts ? getStoredProducts() : [];
  const product = products.find((p) => p.id === id) || products[0];

  if (!product) {
    alert("Produk tidak ditemukan. Kembali ke halaman utama.");
    window.location.href = "index.html";
    return;
  }

  hydrateDetail(product);
});

function hydrateDetail(p) {
  const pillSeason = document.getElementById("pillSeason");
  const categoryLabel = document.getElementById("categoryLabel");
  const lookTitle = document.getElementById("lookTitle");
  const lookPrice = document.getElementById("lookPrice");
  const metaColor = document.getElementById("metaColor");
  const metaSeason = document.getElementById("metaSeason");
  const metaFeatured = document.getElementById("metaFeatured");
  const description = document.getElementById("description");
  const tagRow = document.getElementById("tagRow");
  const primaryMedia = document.getElementById("primaryMedia");
  const thumbRow = document.getElementById("thumbRow");

  if (pillSeason) pillSeason.textContent = p.season || "—";
  if (categoryLabel) categoryLabel.textContent = p.category || "LOOK";
  if (lookTitle) lookTitle.textContent = p.name || "Untitled Look";
  if (lookPrice) lookPrice.textContent = formatIDR ? formatIDR(p.price) : p.price;
  if (metaColor) metaColor.textContent = p.colorStory || "—";
  if (metaSeason) metaSeason.textContent = p.season || "—";
  if (metaFeatured) metaFeatured.textContent = p.featured ? "Signature" : "Collection";
  if (description)
    description.textContent =
      p.description ||
      "Deskripsi look belum diisi. Lengkapi dari Admin Dashboard untuk narasi yang lebih kuat.";

  // Tags
  if (tagRow) {
    tagRow.innerHTML = "";
    const tags = Array.isArray(p.tags) ? p.tags : [];
    if (!tags.length && p.category) tags.push(p.category);
    if (!tags.length) tags.push("Atelier");

    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagRow.appendChild(span);
    });
  }

  // Media & Gallery
  const gallery = Array.isArray(p.gallery) ? p.gallery.filter(Boolean) : [];
  const allImages = p.coverImage ? [p.coverImage, ...gallery] : gallery;

  if (primaryMedia) {
    primaryMedia.innerHTML = "";
    if (allImages.length) {
      const img = document.createElement("img");
      img.src = allImages[0];
      img.alt = p.name || "Look Image";
      primaryMedia.appendChild(img);
    } else {
      primaryMedia.innerHTML =
        '<span style="font-size:0.9rem;color:#9c9aa3;">Belum ada foto untuk look ini.</span>';
    }

    if (p.featured) {
      const badge = document.createElement("span");
      badge.className = "badge-featured";
      badge.textContent = "SIGNATURE LOOK";
      primaryMedia.appendChild(badge);
    }
  }

  if (thumbRow) {
    thumbRow.innerHTML = "";
    if (allImages.length <= 1) {
      thumbRow.style.display = "none";
    } else {
      thumbRow.style.display = "flex";
      allImages.forEach((src, idx) => {
        const thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = "thumb" + (idx === 0 ? " active" : "");
        thumb.innerHTML = `<img src="${src}" alt="Look thumbnail ${idx + 1}" />`;
        thumb.addEventListener("click", () => {
          // Ganti gambar utama
          if (!primaryMedia) return;
          primaryMedia.querySelector("img").src = src;
          // aktif state
          thumbRow
            .querySelectorAll(".thumb")
            .forEach((el) => el.classList.remove("active"));
          thumb.classList.add("active");
        });
        thumbRow.appendChild(thumb);
      });
    }
  }

}



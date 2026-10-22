const products = [
  { id: "olive-trousers", name: "Olive pleated trousers", category: "Clothing", condition: "Good use", price: 620, image: "02fa1d8e-8ff7-4c83-990d-0ea89fcca7fb.jpg", description: "A relaxed pair of olive trousers with a lovely, easy drape. A little lived-in and ready for everyday plans." },
  { id: "quilted-vest", name: "Quilted black vest", category: "Clothing", condition: "Like new", price: 480, image: "1bfddfa1-6bbd-4499-9a9f-09cf276d7d1d.jpg", description: "A lightweight quilted layer with a neat collar and roomy pockets. Easy to throw on when the day gets breezy." },
  { id: "black-blazer", name: "Everyday black blazer", category: "Clothing", condition: "Good use", price: 750, image: "1cfe0259-9701-4b64-8354-168381ab36d5.jpg", description: "A classic dark blazer with a soft, broken-in feel. Wear it over a tee or dress it up for a night out." },
  { id: "blue-duffel", name: "Blue weekend duffel", category: "Bags", condition: "Good use", price: 390, image: "2b89b531-377e-4613-879f-302b56bda38d.jpg", description: "A roomy blue-and-black duffel ready for weekend trips, gym days, or a little overpacking." },
  { id: "wide-leg-pants", name: "Black wide-leg pants", category: "Clothing", condition: "Fair well", price: 350, image: "55bf51b0-95d2-40e3-8aa3-160fe7cf5229.jpg", description: "Comfy wide-leg black pants with plenty of life left. Please check the photos for a small hem detail." },
  { id: "graphic-hoodie", name: "Vintage graphic zip hoodie", category: "Clothing", condition: "Good use", price: 540, image: "567e8719-3043-4db7-ad7b-28e9e01620e8.jpg", description: "A cozy dark zip-up with embroidered lettering and a lived-in vintage feel. One of a kind." },
  { id: "gray-slipons", name: "Gray perforated slip-ons", category: "Shoes", condition: "Fair well", price: 420, image: "5a7aca84-c8c6-4935-a305-05a015c93be3.jpg", description: "Easy slip-ons in a versatile gray. Pre-loved with visible wear, shown honestly in the photos." },
  { id: "khaki-shorts", name: "Khaki cargo shorts", category: "Clothing", condition: "Good use", price: 320, image: "694b7b1e-df90-48fe-b55e-348767d2e812.jpg", description: "Classic khaki shorts with practical pockets. A laid-back staple for sunny-day errands." },
  { id: "red-hoodie", name: "Deep red zip hoodie", category: "Clothing", condition: "Like new", price: 590, image: "76bb293f-fb34-44c3-81f8-83c447a7c478.jpg", description: "A bold red hooded layer with a full zip and a comfortable fit. Brightens up a rainy-day outfit." },
  { id: "gray-vans", name: "Gray canvas slip-ons", category: "Shoes", condition: "Good use", price: 520, image: "79feb988-b1ea-4f48-ad98-48b09b881e17.jpg", description: "A classic gray canvas pair with everyday wear. Take a close look at the pictures for the exact condition." },
  { id: "hiking-shoes", name: "Brown trail sneakers", category: "Shoes", condition: "Good use", price: 680, image: "82bd2577-b253-4752-9bfd-85be2d088616.jpg", description: "Sturdy brown trail sneakers with plenty of adventures behind them and more ahead." },
  { id: "patterned-sling", name: "Patterned everyday sling", category: "Bags", condition: "Good use", price: 450, image: "87129929-d4dc-4989-b759-af8b5d8fb184.jpg", description: "A playful patterned crossbody bag with a comfortable strap and handy front pocket." },
  { id: "brown-trousers", name: "Soft brown trousers", category: "Clothing", condition: "Good use", price: 470, image: "d1541e63-6c01-4663-8bf4-db841352f577.jpg", description: "Soft brown trousers with a relaxed silhouette. Pair them with your favorite tucked-in tee." },
  { id: "denim-shirt", name: "Oversized denim shirt", category: "Clothing", condition: "Good use", price: 720, image: "e772c44c-fd1f-403d-8d51-2767cd24b714.jpg", description: "A roomy denim button-up that works as a shirt or an easy light layer. A great closet staple." },
  { id: "black-hoodie", name: "Black laurel hoodie", category: "Clothing", condition: "Good use", price: 560, image: "e9d19103-b58f-4f64-8b77-5ce8b15e2c06.jpg", description: "A classic black hoodie with embroidered laurel details on the hood. Warm, comfortable, and distinctive." }
];

const STORAGE = { user: "bruce-demo-user", cart: "bruce-demo-cart", favorites: "bruce-demo-favorites", listings: "bruce-demo-listings", feedback: "bruce-demo-feedback", orders: "thrift-ko-yan-demo-orders" };
const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
};
const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    showToast("Couldn't save that in this browser. Please try again.");
    return false;
  }
};

let currentUser = readStored(STORAGE.user, null);
let cart = readStored(STORAGE.cart, []);
let favorites = readStored(STORAGE.favorites, []);
let ownListings = readStored(STORAGE.listings, []);
let orders = readStored(STORAGE.orders, []);
if (!Array.isArray(orders)) orders = [];
let activeCategory = "All finds";
let authMode = "login";
let pendingAction = "";
let tawadApplied = false;
let selectedRating = 0;
let toastTimer;
let pendingCancelOrder = "";
let chatHasWelcomed = false;

const money = (amount) => `₱${Number(amount || 0).toLocaleString("en-PH")}`;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const allProducts = () => [...ownListings, ...products];
const byId = (id) => allProducts().find((product) => product.id === id);

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function openOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  const focusable = overlay.querySelector("input, textarea, button");
  if (focusable) setTimeout(() => focusable.focus(), 120);
}

function closeOverlay(overlay) {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".overlay.open") && !document.querySelector(".cart-drawer.open")) document.body.classList.remove("no-scroll");
}

function showAuth(mode = "login", action = "") {
  authMode = mode;
  pendingAction = action;
  updateAuthMode();
  document.getElementById("auth-error").textContent = "";
  openOverlay("auth-overlay");
}

function updateAuthMode() {
  const isRegister = authMode === "register";
  document.querySelectorAll(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === authMode));
  document.querySelectorAll(".register-field").forEach((field) => { field.hidden = !isRegister; });
  const nameField = document.getElementById("auth-name");
  const termsField = document.getElementById("auth-terms");
  nameField.required = isRegister;
  termsField.required = isRegister;
  document.getElementById("auth-title").innerHTML = isRegister ? "Make room for <em>good finds.</em>" : "Good to have you <em>here.</em>";
  document.getElementById("auth-submit-label").textContent = isRegister ? "Create account" : "Log in";
  document.getElementById("auth-password").autocomplete = isRegister ? "new-password" : "current-password";
  document.getElementById("auth-error").textContent = "";
}

function renderProducts() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const visible = allProducts().filter((product) => {
    const categoryMatch = activeCategory === "All finds" || product.category === activeCategory;
    const queryMatch = !query || `${product.name} ${product.category} ${product.condition} ${product.description}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
  const grid = document.getElementById("shop-grid");
  grid.innerHTML = visible.map((product, index) => {
    const saved = favorites.includes(product.id);
    const badge = product.condition === "Like new" ? "A lovely find" : product.condition === "Fair well" ? "Loved & lived-in" : index < 2 ? "Just found" : "Pre-loved";
    return `<article class="product-card" data-product="${escapeHTML(product.id)}">
      <div class="product-image" data-action="details" data-id="${escapeHTML(product.id)}">
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
        <span class="product-badge">${badge}</span>
        <button class="favorite-button${saved ? " active" : ""}" data-action="favorite" data-id="${escapeHTML(product.id)}" aria-label="${saved ? "Remove from" : "Add to"} favorites">${saved ? "♥" : "♡"}</button>
        <button class="quick-add" data-action="add-cart" data-id="${escapeHTML(product.id)}">Add to bag <span>＋</span></button>
      </div>
      <div class="product-info" data-action="details" data-id="${escapeHTML(product.id)}">
        <div class="product-meta"><span>${escapeHTML(product.category.toUpperCase())}</span><span class="condition-pill">${escapeHTML(product.condition)}</span></div>
        <span class="product-name">${escapeHTML(product.name)}</span><div class="product-price">${money(product.price)}</div>
      </div>
    </article>`;
  }).join("");
  document.querySelector(".no-results").hidden = visible.length > 0;
  document.querySelectorAll(".category-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.category === activeCategory));
}

function renderCart() {
  cart = cart.filter((entry) => byId(entry.id) && entry.quantity > 0);
  const count = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  document.querySelectorAll(".bag-count, .mobile-bag-count").forEach((element) => { element.textContent = count; });
  document.querySelector(".drawer-count").textContent = `(${count})`;
  document.getElementById("cart-items").innerHTML = cart.map((entry) => {
    const product = byId(entry.id);
    return `<article class="cart-item"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}"><div><h3>${escapeHTML(product.name)}</h3><p>${escapeHTML(product.condition)} · Qty ${entry.quantity}</p><strong>${money(product.price * entry.quantity)}</strong></div><button class="remove-item" data-action="remove-cart" data-id="${escapeHTML(product.id)}" aria-label="Remove ${escapeHTML(product.name)}">×</button></article>`;
  }).join("");
  const subtotal = cart.reduce((sum, entry) => sum + byId(entry.id).price * entry.quantity, 0);
  const tawad = tawadApplied && subtotal ? Math.round(subtotal * 0.08) : 0;
  const shipping = subtotal ? 65 : 0;
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-tawad").textContent = `− ${money(tawad)}`;
  document.getElementById("cart-total").textContent = money(subtotal - tawad + shipping);
  document.getElementById("checkout-total").textContent = money(subtotal - tawad + shipping);
  document.getElementById("cart-summary").classList.toggle("hidden", count === 0);
  document.getElementById("cart-empty").classList.toggle("visible", count === 0);
  document.querySelector(".cart-empty").style.display = count ? "none" : "flex";
  document.getElementById("tawad-button").classList.toggle("applied", tawadApplied);
  document.getElementById("tawad-button").textContent = tawadApplied ? "Tawad applied ✓" : "Apply tawad";
  writeStored(STORAGE.cart, cart);
}

function openCart() {
  renderCart();
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
  document.getElementById("drawer-scrim").classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
  document.getElementById("drawer-scrim").classList.remove("open");
  if (!document.querySelector(".overlay.open")) document.body.classList.remove("no-scroll");
}

function requireUser(action) {
  if (!currentUser) {
    showAuth("login", action);
    return false;
  }
  return true;
}

function addToCart(id) {
  const product = byId(id);
  if (!product) return;
  const existing = cart.find((entry) => entry.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  writeStored(STORAGE.cart, cart);
  renderCart();
  showToast(`${product.name} is in your bag.`);
}

function showProductDetails(id) {
  const product = byId(id);
  if (!product) return;
  document.getElementById("product-detail").innerHTML = `<div class="product-detail-layout"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}"><div class="product-detail-copy"><span class="eyebrow">${escapeHTML(product.category.toUpperCase())} · ${escapeHTML(product.condition.toUpperCase())}</span><h2 id="product-dialog-title">${escapeHTML(product.name)}</h2><p class="product-detail-price">${money(product.price)}</p><p>${escapeHTML(product.description)}</p><p>✳ One of a kind — when it's gone, it's gone.</p><button class="button button-dark button-full" data-action="add-cart" data-id="${escapeHTML(product.id)}">Add to bag <span>＋</span></button></div></div>`;
  openOverlay("product-overlay");
}

function openListing() {
  if (!requireUser("sell")) return;
  document.getElementById("listing-error").textContent = "";
  document.getElementById("listing-form").reset();
  document.getElementById("listing-preview").innerHTML = "";
  openOverlay("listing-overlay");
}

function runPendingAction() {
  const action = pendingAction;
  pendingAction = "";
  if (action === "sell") openListing();
  if (action === "cart") openCart();
  if (action === "checkout") {
    openCart();
    showToast("Add a lovely find to your bag before checking out.");
  }
}

document.getElementById("auth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const name = String(formData.get("name") || "").trim();
  const error = document.getElementById("auth-error");
  error.textContent = "";
  if (!email || !password) {
    error.textContent = "Please enter your email and password.";
    return;
  }
  if (password.length < 6) {
    error.textContent = "Use at least 6 characters for your password.";
    return;
  }
  if (authMode === "register") {
    if (!name) {
      error.textContent = "Please add your name.";
      return;
    }
    if (!document.getElementById("auth-terms").checked) {
      error.textContent = "Please agree to the terms to create an account.";
      return;
    }
    currentUser = { name, email };
  } else {
    currentUser = readStored(STORAGE.user, null);
    if (!currentUser || currentUser.email !== email) currentUser = { name: email.split("@")[0], email };
  }
  if (!writeStored(STORAGE.user, currentUser)) return;
  closeOverlay(document.getElementById("auth-overlay"));
  showToast(`Welcome${currentUser.name ? `, ${currentUser.name.split(" ")[0]}` : ""}! You're in.`);
  renderAccountButton();
  runPendingAction();
});

document.getElementById("listing-photo").addEventListener("change", (event) => {
  const file = event.currentTarget.files[0];
  const preview = document.getElementById("listing-preview");
  preview.innerHTML = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    document.getElementById("listing-error").textContent = "Please choose an image file.";
    event.currentTarget.value = "";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    document.getElementById("listing-error").textContent = "Please choose an image smaller than 8 MB.";
    event.currentTarget.value = "";
    return;
  }
  const image = document.createElement("img");
  image.alt = "Listing photo preview";
  image.src = URL.createObjectURL(file);
  preview.append(image);
  document.getElementById("listing-error").textContent = "";
});

document.getElementById("listing-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("name")).trim();
  const price = Number(data.get("price"));
  const description = String(data.get("description")).trim();
  const error = document.getElementById("listing-error");
  if (!name || !Number.isFinite(price) || price <= 0 || !description) {
    error.textContent = "Please complete each required field with a valid price.";
    return;
  }
  const imageFile = data.get("photo");
  const createListing = (image) => {
    const listing = {
      id: `listing-${Date.now()}`,
      name,
      price,
      category: "Clothing",
      condition: String(data.get("condition")),
      description,
      image: image || products[0].image,
      seller: currentUser.name
    };
    const updated = [listing, ...ownListings];
    if (!writeStored(STORAGE.listings, updated)) return;
    ownListings = updated;
    closeOverlay(document.getElementById("listing-overlay"));
    renderProducts();
    showToast("Your gem is listed! Thanks for sharing it.");
  };
  if (imageFile instanceof File && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        error.textContent = "We couldn't read that photo. Please try another image.";
        return;
      }
      createListing(reader.result);
    };
    reader.onerror = () => { error.textContent = "We couldn't read that photo. Please try another image."; };
    reader.readAsDataURL(imageFile);
  } else {
    createListing("");
  }
});

document.getElementById("checkout-button").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your bag is empty. Find a little something first.");
    return;
  }
  closeCart();
  openOverlay("checkout-overlay");
});

document.getElementById("checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length) {
    closeOverlay(document.getElementById("checkout-overlay"));
    showToast("Your bag is empty. Add a find before checkout.");
    return;
  }
  const orderNumber = `TKY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const subtotal = cart.reduce((sum, entry) => sum + byId(entry.id).price * entry.quantity, 0);
  const discount = tawadApplied ? Math.round(subtotal * 0.08) : 0;
  const order = {
    id: orderNumber,
    placedAt: new Date().toISOString(),
    status: "active",
    total: subtotal - discount + (subtotal ? 65 : 0),
    items: cart.map((entry) => {
      const product = byId(entry.id);
      return { name: product.name, quantity: entry.quantity };
    })
  };
  const updatedOrders = [...orders, order];
  if (!writeStored(STORAGE.orders, updatedOrders)) return;
  orders = updatedOrders;
  cart = [];
  tawadApplied = false;
  writeStored(STORAGE.cart, cart);
  renderCart();
  closeOverlay(document.getElementById("checkout-overlay"));
  event.currentTarget.reset();
  showToast(`Order ${orderNumber} placed! Thank you for supporting secondhand shopping.`);
  appendChatMessage(`Your demo order ${orderNumber} is saved in this browser. Open “My orders / cancel” in chat to view or cancel it.`, "bot");
});

document.querySelectorAll(".rating-select button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedRating = Number(button.dataset.rating);
    document.querySelectorAll(".rating-select button").forEach((star) => {
      const selected = Number(star.dataset.rating) <= selectedRating;
      star.classList.toggle("selected", selected);
      star.textContent = selected ? "★" : "☆";
    });
  });
});

document.getElementById("feedback-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!requireUser("feedback")) return;
  if (!selectedRating) {
    showToast("Choose a star rating before sending your note.");
    return;
  }
  const feedback = readStored(STORAGE.feedback, []);
  feedback.push({ rating: selectedRating, message: document.getElementById("feedback-message").value.trim(), date: new Date().toISOString() });
  if (!writeStored(STORAGE.feedback, feedback)) return;
  event.currentTarget.reset();
  selectedRating = 0;
  document.querySelectorAll(".rating-select button").forEach((star) => { star.classList.remove("selected"); star.textContent = "☆"; });
  showToast("Thank you for sharing a little love!");
});

document.addEventListener("click", (event) => {
  const tab = event.target.closest(".auth-tab");
  if (tab) {
    authMode = tab.dataset.tab;
    updateAuthMode();
    return;
  }
  const close = event.target.closest("[data-close]");
  if (close) {
    const overlay = close.closest(".overlay");
    if (overlay) closeOverlay(overlay);
    else closeCart();
    return;
  }
  if (event.target.classList.contains("overlay")) {
    closeOverlay(event.target);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const { action, id } = actionButton.dataset;
    if (action === "sell") openListing();
    if (action === "cart") {
      if (requireUser("cart")) openCart();
    }
    if (action === "shop-more") document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    if (action === "add-cart") {
      if (requireUser("cart")) {
        addToCart(id);
        if (actionButton.closest(".product-dialog")) closeOverlay(document.getElementById("product-overlay"));
        else openCart();
      }
    }
    if (action === "details") {
      if (requireUser("details")) showProductDetails(id);
    }
    if (action === "favorite") {
      if (requireUser("favorites")) {
        favorites = favorites.includes(id) ? favorites.filter((favorite) => favorite !== id) : [...favorites, id];
        writeStored(STORAGE.favorites, favorites);
        renderProducts();
        showToast(favorites.includes(id) ? "Saved to your favorite finds." : "Removed from your favorites.");
      }
    }
    if (action === "remove-cart") {
      cart = cart.filter((entry) => entry.id !== id);
      if (!cart.length) tawadApplied = false;
      writeStored(STORAGE.cart, cart);
      renderCart();
    }
    return;
  }
  const category = event.target.closest(".category-tab");
  if (category) {
    activeCategory = category.dataset.category;
    renderProducts();
  }
  if (event.target.id === "tawad-button") {
    if (!cart.length) return;
    tawadApplied = !tawadApplied;
    renderCart();
    if (tawadApplied) showToast("Tawad applied — 8% off your finds!");
  }
  if (event.target.closest(".avatar-button")) {
    if (currentUser) {
      const shouldSignOut = window.confirm(`Hi ${currentUser.name || currentUser.email}! Log out?`);
      if (shouldSignOut) {
        currentUser = null;
        localStorage.removeItem(STORAGE.user);
        renderAccountButton();
        showToast("You've been logged out.");
      }
    } else showAuth("login");
  }
});

function renderAccountButton() {
  const button = document.querySelector(".avatar-button");
  button.textContent = currentUser ? escapeHTML((currentUser.name || currentUser.email).slice(0, 1).toUpperCase()) : "♡";
  button.setAttribute("aria-label", currentUser ? `Account for ${currentUser.name || currentUser.email}` : "Log in");
  button.title = currentUser ? `Signed in as ${currentUser.name || currentUser.email} — click to log out` : "Log in or create account";
}

document.getElementById("search-input").addEventListener("input", renderProducts);
document.querySelector(".search-toggle").addEventListener("click", () => {
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => document.getElementById("search-input").focus(), 350);
});
document.getElementById("drawer-scrim").addEventListener("click", closeCart);
const chatPanel = document.getElementById("chat-panel");
const chatMessages = document.getElementById("chat-messages");

function appendChatMessage(message, sender = "bot", content = null) {
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${sender}`;
  bubble.textContent = message;
  if (content) bubble.append(content);
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showChatOrders() {
  const activeOrders = orders.filter((order) => order.status === "active");
  const previousOrders = orders.filter((order) => order.status === "cancelled");
  if (!orders.length) {
    appendChatMessage("There are no demo orders in this browser yet. Place a demo order at checkout and it will appear here with a cancellation option.");
    return;
  }
  const list = document.createElement("div");
  list.className = "chat-orders";
  orders.slice().reverse().forEach((order) => {
    const item = document.createElement("div");
    item.className = "chat-order";
    const title = document.createElement("strong");
    title.textContent = order.id;
    const details = document.createElement("span");
    const status = order.status === "cancelled" ? "Cancelled" : "Active · demo order";
    details.textContent = `${status} · ${money(order.total)}`;
    item.append(title, details);
    if (order.status === "active") {
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.dataset.chatAction = "cancel";
      cancelButton.dataset.orderId = order.id;
      cancelButton.textContent = "Cancel this order";
      item.append(cancelButton);
    }
    list.append(item);
  });
  const summary = activeOrders.length
    ? `You have ${activeOrders.length} active demo order${activeOrders.length === 1 ? "" : "s"}. Choose one below to cancel it.`
    : `You have no active demo orders. ${previousOrders.length ? "Your cancelled orders are listed here." : ""}`;
  appendChatMessage(summary, "bot", list);
}

function requestOrderCancellation(orderId) {
  const order = orders.find((entry) => entry.id === orderId && entry.status === "active");
  if (!order) {
    appendChatMessage("I couldn't find that active order. Open “My orders / cancel” again to refresh the list.");
    return;
  }
  pendingCancelOrder = order.id;
  const actions = document.createElement("div");
  actions.className = "chat-confirm-actions";
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.dataset.chatAction = "confirm-cancel";
  confirm.dataset.orderId = order.id;
  confirm.textContent = "Yes, cancel it";
  const keep = document.createElement("button");
  keep.type = "button";
  keep.dataset.chatAction = "keep-order";
  keep.textContent = "Keep order";
  actions.append(confirm, keep);
  appendChatMessage(`Cancel demo order ${order.id}? This will mark it as cancelled in this browser.`, "bot", actions);
}

function confirmOrderCancellation(orderId) {
  if (!pendingCancelOrder || pendingCancelOrder !== orderId) return;
  const updatedOrders = orders.map((order) => order.id === orderId && order.status === "active"
    ? { ...order, status: "cancelled", cancelledAt: new Date().toISOString() }
    : order);
  if (updatedOrders.every((order, index) => order.status === orders[index].status)) {
    pendingCancelOrder = "";
    appendChatMessage("That order is no longer active. Refresh the order list to see its latest status.");
    return;
  }
  if (!writeStored(STORAGE.orders, updatedOrders)) return;
  orders = updatedOrders;
  pendingCancelOrder = "";
  appendChatMessage(`Demo order ${orderId} has been cancelled in this browser. No server order was updated.`);
  showChatOrders();
}

function handleChatAction(action, orderId = "") {
  if (action === "shipping") appendChatMessage("The demo checkout has a flat ₱65 shipping fee for addresses in the Philippines. No actual shipment will be processed.");
  if (action === "returns") appendChatMessage("Every item is pre-loved and one of a kind. This demo site does not have a live returns system, so please contact the shop with any questions about an item's condition before ordering.");
  if (action === "orders") showChatOrders();
  if (action === "cancel") requestOrderCancellation(orderId);
  if (action === "confirm-cancel") confirmOrderCancellation(orderId);
  if (action === "keep-order") {
    pendingCancelOrder = "";
    appendChatMessage("Okay, your order has not been cancelled.");
  }
}

document.getElementById("chat-launcher").addEventListener("click", () => {
  const isOpen = chatPanel.hidden;
  chatPanel.hidden = !isOpen;
  document.getElementById("chat-launcher").setAttribute("aria-expanded", String(isOpen));
  if (isOpen && !chatHasWelcomed) {
    appendChatMessage("Hi! I'm the Thrift Ko Yan shop assistant. I can help with shipping, returns, and viewing or cancelling a demo order.");
    chatHasWelcomed = true;
  }
  if (isOpen) document.getElementById("chat-input").focus();
});
document.getElementById("chat-close").addEventListener("click", () => {
  chatPanel.hidden = true;
  document.getElementById("chat-launcher").setAttribute("aria-expanded", "false");
  document.getElementById("chat-launcher").focus();
});
document.getElementById("chat-quick-actions").addEventListener("click", (event) => {
  const button = event.target.closest("[data-chat-action]");
  if (button) handleChatAction(button.dataset.chatAction, button.dataset.orderId);
});
chatMessages.addEventListener("click", (event) => {
  const button = event.target.closest("[data-chat-action]");
  if (button) handleChatAction(button.dataset.chatAction, button.dataset.orderId);
});
document.getElementById("chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;
  appendChatMessage(message, "user");
  input.value = "";
  const question = message.toLowerCase();
  if (question.includes("cancel") || question.includes("order") || question.includes("kansela") || question.includes("kanselahin")) {
    handleChatAction("orders");
  } else if (question.includes("ship") || question.includes("delivery") || question.includes("deliver")) {
    handleChatAction("shipping");
  } else if (question.includes("return") || question.includes("exchange") || question.includes("refund")) {
    handleChatAction("returns");
  } else if (question.includes("shop") || question.includes("item") || question.includes("product") || question.includes("find")) {
    appendChatMessage("Browse all of our pre-loved finds in the Shop section. Each item is one of a kind—open a listing to see its details.");
  } else {
    appendChatMessage("Thanks for your question! I'm a demo shop assistant. Try “Shipping,” “Returns,” or “My orders / cancel” above.");
  }
});
document.querySelector(".menu-toggle").addEventListener("click", () => document.querySelector(".main-nav").classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => document.querySelector(".main-nav").classList.remove("open")));
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("search-input").focus(), 350);
  }
  if (event.key === "Escape") {
    document.querySelectorAll(".overlay.open").forEach((overlay) => closeOverlay(overlay));
    closeCart();
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
renderAccountButton();
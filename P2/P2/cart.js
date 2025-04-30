// cart.js

function addToCart(productId) {
    if (!checkAuth()) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll("#cart-count").forEach(el => {
        el.textContent = totalItems;
    });
}

function loadUserCart(username) {
    const userCarts = JSON.parse(localStorage.getItem("userCarts")) || {};
    const cart = userCarts[username] || [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function saveUserCart(username) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const userCarts = JSON.parse(localStorage.getItem("userCarts")) || {};
    userCarts[username] = cart;
    localStorage.setItem("userCarts", JSON.stringify(userCarts));
}
// cart.js
document.addEventListener("DOMContentLoaded", function() {
    // Verificar si hay usuario logueado
    const usuario = JSON.parse(localStorage.getItem("currentUser"));
    const cartIcon = document.getElementById("cart-icon");

    if (!usuario) {
        if (cartIcon) cartIcon.style.display = "none";
        return;
    }
    
    if (cartIcon) {
        cartIcon.style.display = "flex";
        cartIcon.addEventListener("click", function() {
            window.location.href = "carrito.html";
        });
    }
    
    updateCartCount();
});

function addToCart(productId) {
    const usuario = JSON.parse(localStorage.getItem("currentUser"));
    
    if (!usuario) {
        alert("Debes iniciar sesión para añadir productos al carrito");
        window.location.href = "login.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    
    // Guardar carrito para el usuario actual
    saveUserCart(usuario.nombre);
    
    alert("Producto añadido al carrito");
}

// Función para guardar el carrito del usuario
function saveUserCart(username) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const userCarts = JSON.parse(localStorage.getItem("userCarts")) || {};
    userCarts[username] = cart;
    localStorage.setItem("userCarts", JSON.stringify(userCarts));
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById("cart-count");
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}
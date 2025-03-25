// cart.js
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar contador del carrito
    updateCartCount();
    
    // Manejar clic en el icono del carrito
    document.getElementById('cart-icon')?.addEventListener('click', function() {
        window.location.href = 'carrito.html';
    });
});

// Función para añadir producto al carrito
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Buscar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Producto añadido al carrito');
}

// Actualizar el contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}
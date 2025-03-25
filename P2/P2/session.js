// session.js
document.addEventListener("DOMContentLoaded", function() {
    const userNameSpan = document.getElementById("user-name");
    const logoutButton = document.getElementById("logout");
    const loginLink = document.getElementById("login-link");
    const cartIcon = document.getElementById("cart-icon");

    const usuario = JSON.parse(localStorage.getItem("currentUser"));

    if (usuario) {
        userNameSpan.textContent = `Bienvenido, ${usuario.nombre_real}`; // Mostrar el nombre real
        loginLink.style.display = "none"; // Ocultar el enlace de login
        logoutButton.style.display = "inline-block"; // Mostrar el botón de logout
        cartIcon.style.display = "flex";

        //Cargar carrito del usuario
        loadUserCart(usuario.nombre);
    } else {
        cartIcon.style.display = "none";
    }


    logoutButton.addEventListener("click", function() {
        // Guardar carrito andes de cerrara la sesion
        const usuario = JSON.parse(localStorage.getItem("currentUser"));
        if (usuario) {
            saveUserCart(usuario.nombre);
        }

        localStorage.removeItem("currentUser"); // Eliminar el usuario del localStorage
        window.location.href = "index.html"; // Recargar la página
    });
});

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

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll("#cart-count");
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}
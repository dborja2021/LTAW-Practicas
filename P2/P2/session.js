//session.js

document.addEventListener("DOMContentLoaded", function() {
    const userNameSpan = document.getElementById("user-name");
    const logoutButton = document.getElementById("logout");
    const loginLink = document.getElementById("login-link");
    const cartIcon = document.getElementById("cart-icon");

    const usuario = JSON.parse(localStorage.getItem("currentUser"));

    if (usuario) {
        userNameSpan.textContent = `Bienvenido, ${usuario.nombre_real}`;
        loginLink.style.display = "none";
        logoutButton.style.display = "inline-block";
        cartIcon.style.display = "flex";
        loadUserCart(usuario.nombre);
    } else {
        cartIcon.style.display = "none";
    }

    logoutButton?.addEventListener("click", function() {
        if (usuario) saveUserCart(usuario.nombre);
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
});

// Nueva función centralizada
function checkAuth() {
    const usuario = JSON.parse(localStorage.getItem("currentUser"));
    if (!usuario) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}
// session.js
document.addEventListener("DOMContentLoaded", function() {
    const userNameSpan = document.getElementById("user-name");
    const logoutButton = document.getElementById("logout");
    const loginLink = document.getElementById("login-link");

    const usuario = JSON.parse(localStorage.getItem("usuario")); // Obtener el usuario del localStorage

    if (usuario) {
        userNameSpan.textContent = `Bienvenido, ${usuario.nombre_real}`; // Mostrar el nombre real
        loginLink.style.display = "none"; // Ocultar el enlace de login
        logoutButton.style.display = "inline-block"; // Mostrar el botón de logout
    }

    logoutButton.addEventListener("click", function() {
        localStorage.removeItem("usuario"); // Eliminar el usuario del localStorage
        window.location.reload(); // Recargar la página
    });
});
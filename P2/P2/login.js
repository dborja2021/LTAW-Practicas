// login.js
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/tienda.json")
        .then(response => response.json())
        .then(data => {
            const usuario = data.usuarios.find(user => 
                user.nombre === username && user.password === password);

            if (usuario) {
                // Guardar usuario actual
                localStorage.setItem("currentUser", JSON.stringify(usuario));
                
                // Cargar carrito del usuario
                const userCarts = JSON.parse(localStorage.getItem("userCarts")) || {};
                const cart = userCarts[usuario.nombre] || [];
                localStorage.setItem("cart", JSON.stringify(cart));
                
                window.location.href = "index.html";
            } else {
                document.getElementById("error").style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("error").textContent = "Error al cargar los datos";
            document.getElementById("error").style.display = "block";
        });
});
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe

    // Obtener el nombre de usuario y la contraseña
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Cargar el archivo tienda.json
    fetch("/tienda.json")
        .then(response => response.json())
        .then(data => {
            // Buscar el usuario en el array de usuarios
            const usuario = data.usuarios.find(user => user.nombre === username && user.password === password);

            if (usuario) {
                // Si el usuario existe y la contraseña coincide
                console.log("Usuario encontrado:", usuario);
                localStorage.setItem("usuario", JSON.stringify(usuario)); // Guardar el usuario en localStorage
                window.location.href = "index.html"; // Redirigir a la página principal
            } else {
                // Si el usuario no existe o la contraseña no coincide
                console.log("Usuario o contraseña incorrectos");
                document.getElementById("error").style.display = "block"; // Mostrar mensaje de error
            }
        })
        .catch(error => {
            console.error("Error al cargar los datos:", error);
            document.getElementById("error").textContent = "Error al cargar los datos. Inténtalo de nuevo.";
            document.getElementById("error").style.display = "block";
        });
});
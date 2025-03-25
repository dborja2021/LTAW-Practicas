const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8001;
const PUBLIC_DIR = __dirname;
const FICHERO_JSON = path.join(__dirname, "tienda.json");

// Mapeo de tipos MIME
const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".js": "application/javascript",
    ".json": "application/json"
};

// Leer el archivo JSON con los productos
const tienda_json = fs.readFileSync(FICHERO_JSON, "utf8");
const tienda = JSON.parse(tienda_json);

// Servidor HTTP
const server = http.createServer((req, res) => {
    // Manejar la ruta /tienda.json
    if (req.url === "/tienda.json") {
        fs.readFile(FICHERO_JSON, (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Error interno del servidor");
            } else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(data);
            }
        });
        return;
    }
    if (req.url === "/carrito.html") {
        const filePath = path.join(PUBLIC_DIR, "carrito.html");
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<h1>500 Internal Server Error</h1>");
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(content);
            }
        });
        return;
    }

    // Manejar la ruta /productos
    if (req.url === "/productos") {
        // Generar HTML dinámico para mostrar los productos
        let html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Listado de Productos</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1 {
                        color: #333;
                    }
                    .producto {
                        border: 1px solid #ccc;
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                    }
                    .producto h2 {
                        margin: 0;
                        color: #555;
                    }
                    .producto p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <h1>Listado de Productos</h1>
        `;

        tienda.producto.forEach((producto) => {
            html += `
                <div class="producto">
                    <h2>${producto.nombreProducto}</h2>
                    <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                    <p><strong>Precio:</strong> ${producto.precio} €</p>
                    <p><strong>Stock:</strong> ${producto.stock} unidades</p>
                </div>
            `;
        });

        html += `
            </body>
            </html>
        `;

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
        return;
    }

    // Manejar la página de producto (producto.html con parámetros)
    if (req.url === "/producto.html" || req.url.startsWith("/producto.html?")) {
        const filePath = path.join(PUBLIC_DIR, "producto.html");
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === "ENOENT") {
                    const errorPage = path.join(PUBLIC_DIR, "404.html");
                    fs.readFile(errorPage, (error, errorContent) => {
                        res.writeHead(404, { "Content-Type": "text/html" });
                        res.end(errorContent || "<h1>404 Not Found</h1>");
                    });
                } else {
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end("<h1>500 Internal Server Error</h1>");
                }
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(content);
            }
        });
        return;
    }

    // Manejar otras rutas (archivos estáticos)
    let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || "application/octet-stream";

    // Verificar si la solicitud es para un archivo (no directorio)
    if (extname) {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === "ENOENT") {
                    const errorPage = path.join(PUBLIC_DIR, "404.html");
                    fs.readFile(errorPage, (error, errorContent) => {
                        res.writeHead(404, { "Content-Type": "text/html" });
                        res.end(errorContent || "<h1>404 Not Found</h1>");
                    });
                } else {
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end("<h1>500 Internal Server Error</h1>");
                }
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content);
            }
        });
    } else {
        // Si no es un archivo, servir 404
        const errorPage = path.join(PUBLIC_DIR, "404.html");
        fs.readFile(errorPage, (error, errorContent) => {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(errorContent || "<h1>404 Not Found</h1>");
        });
    }
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
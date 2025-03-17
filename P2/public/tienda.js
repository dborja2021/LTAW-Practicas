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
};

// Leer el archivo JSON con los productos
const tienda_json = fs.readFileSync(FICHERO_JSON, "utf8");
const tienda = JSON.parse(tienda_json);

// Servidor HTTP
const server = http.createServer((req, res) => {
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

        // Recorrer la lista de productos y agregarlos al HTML
        tienda.productos.forEach((producto) => {
            html += `
                <div class="producto">
                    <h2>${producto.nombre}</h2>
                    <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                    <p><strong>Precio:</strong> ${producto.precio} €</p>
                    <p><strong>Stock:</strong> ${producto.stock} unidades</p>
                </div>
            `;
        });

        // Cerrar el HTML
        html += `
            </body>
            </html>
        `;

        // Enviar la respuesta con el HTML generado
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
    } else {
        // Manejar otras rutas (archivos estáticos)
        let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
        const extname = path.extname(filePath);
        const contentType = mimeTypes[extname] || "application/octet-stream";

        // Verificar si el archivo solicitado existe
        fs.readFile(filePath, (err, content) => {
            if (err) {
                // Si el archivo no se encuentra, servir 404.html
                if (err.code === "ENOENT") {
                    const errorPage = path.join(PUBLIC_DIR, "404.html");
                    fs.readFile(errorPage, (error, errorContent) => {
                        res.writeHead(404, { "Content-Type": "text/html" });
                        res.end(errorContent || "<h1>404 Not Found</h1>");
                    });
                } else {
                    // Si hubo otro error (por ejemplo, error de servidor)
                    res.writeHead(500, { "Content-Type": "text/html" });
                    res.end("<h1>500 Internal Server Error</h1>");
                }
            } else {
                // Si el archivo existe, enviarlo con el tipo MIME correcto
                res.writeHead(200, { "Content-Type": contentType });
                res.end(content);
            }
        });
    }
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
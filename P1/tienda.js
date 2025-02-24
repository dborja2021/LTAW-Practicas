const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8001;
const PUBLIC_DIR = path.join(__dirname, "public");

// Mapeo de tipos MIME
const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
};

// Servidor HTTP
const server = http.createServer((req, res) => {
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
});

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

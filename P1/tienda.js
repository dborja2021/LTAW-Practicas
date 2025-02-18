const http = require('http');
const fs = require('fs'); // Importar el módulo fs para leer archivos
const path = require('path'); // Importar el módulo path para manejar rutas de archivos

const PUERTO = 8080;

//-- Ruta al archivo HTML de la página principal
const pagina_main = path.join(__dirname, 'index.html');

//-- Ruta al archivo HTML de la página de error
const pagina_error = path.join(__dirname, '404.html');

const server = http.createServer((req, res) => {
    console.log("Petición recibida!");

    //-- Valores de la respuesta por defecto
    let code = 200;
    let code_msg = "OK";
    let filePath = pagina_main;

    //-- Analizar el recurso
    //-- Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log(url.pathname);

    //-- Cualquier recurso que no sea la página principal
    //-- genera un error
    if (url.pathname != '/') {
        code = 404;
        code_msg = "Not Found";
        filePath = pagina_error;
    }

    //-- Leer el archivo HTML correspondiente
    fs.readFile(filePath, (err, data) => {
        if (err) {
            //-- Si hay un error al leer el archivo, responder con un error 500
            res.statusCode = 500;
            res.statusMessage = "Internal Server Error";
            res.setHeader('Content-Type', 'text/plain');
            res.end("Error interno del servidor al leer el archivo.");
            return;
        }

        //-- Generar la respuesta con el contenido del archivo
        res.statusCode = code;
        res.statusMessage = code_msg;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
});

server.listen(PUERTO);

console.log("Ejemplo 7. Escuchando en puerto: " + PUERTO);
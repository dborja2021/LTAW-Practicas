//-- Crear una variable con la estructura definida
//-- en un fichero JSON

const fs = require('fs');

//-- Npmbre del fichero JSON a leer
const FICHERO_JSON = "tienda.json"

//-- Leer el fichero JSON
const  tienda_json = fs.readFileSync(FICHERO_JSON, 'utf8');

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Incrementar el stock de todos los productos en 1 unidad
tienda.productos.forEach((producto) => {
  producto.stock = (parseInt(producto.stock) + 1).toString(); // Incrementar y convertir a cadena
});

//-- Convertir la estructura tienda a formato JSON
const updated_tienda_json = JSON.stringify(tienda, null, 2);

//-- Guardar el fichero JSON con los cambios
fs.writeFileSync(FICHERO_JSON, updated_tienda_json, 'utf8');

console.log("El stock de todos los productos ha sido incrementado en 1 unidad y guardado en tienda.json.");
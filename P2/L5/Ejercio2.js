//-- Crear una variable con la estructura definida
//-- en un fichero JSON

const fs = require('fs');

//-- Npmbre del fichero JSON a leer
const FICHERO_JSON = "tienda.json"

//-- Leer el fichero JSON
const  tienda_json = fs.readFileSync(FICHERO_JSON, 'utf8');

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Mostrar numero de usuarios registrados
console.log("Usuarios registrados: " + tienda.usuarios.length);

//-- Recorrer el array de usuarios
tienda.usuarios.forEach((element, index)=>{
  console.log("Usuario " + (index + 1) + ": " + element["nombre"]);
});

//-- Mostrar numero de productos
console.log("\nProductos en la tienda: " + tienda.productos.length);

//-- Recorrer el array de productos
tienda.productos.forEach((element, index)=>{
  console.log("Producto " + (index + 1) + ": " + element["nombre"]);
});

//-- Mostrar numero de pedidos
console.log("\nPedidos pendientes: " + tienda.pedidos.length);

//-- Mostrar detalles de los pedidos
console.log("Detalles de los pedidos:");

tienda.pedidos.forEach((pedido, index) => {
  console.log("\nPedido " + (index + 1) + ":");
  console.log("  Usuario: " + pedido.nombre_usuario);
  console.log("  Dirección de envío: " + pedido.direccion);
  console.log("  Tarjeta: " + pedido.tarjeta);
  console.log("  Productos comprados:");
  
  //-- Recorrer la lista de productos del pedido
  pedido.productos.forEach((producto, i) => {
    console.log("    " + (i + 1) + ". " + producto);
  });
});
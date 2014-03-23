node-api-rest + mongodb + redis + shopping cart
===============================================

RESTful API for CRUD with Node.js, Express, MongoDB and mongoose.js
Shopping cart with redis and mongodb. Time to expire.
Whats hot now service with redis. Time to expire.

You need install node.js, MongoDB and redis.

To run
* $ npm install
* start mongo server
* start redis server
* $ server.js

You can read a complete tutorial in 
http://speakinbytes.com/2014/03/api-rest-con-node-js-express-mongodb-y-moongose-js/

<h3> Tecnologías 
<p>

* Node.js RESTful API with express.
* MongoDB and mongoose
* redis

<h2> El proyecto. Temática: Tienda de camisetas

<h3>Fase 1: 
<p>
* Crear una API RESTful que responda a los casos CRUD.
* La base de datos utilizadas será MongoDB.
      
<h4> Rutas:
<p>
* GET /tshirts - muestra una lista con todas las camisetas
* GET /tshirt/:id - muestra los detalles de una camiseta
* POST /tshirt - crea una camiseta
* -- body: model (obligatorio), colour, price, summary, images, size, style (sólo permite: Casual, Alternative, Vintage)
* PUT /tshirt/:id - modifica una camiseta
* -- body: model (obligatorio), colour, price, summary, images, size, style (sólo permite: Casual, Alternative, Vintage)
* DELETE /tshirt/:id - elimina una camiseta
    
<h4> Importante: Arrancar mongoDB en un terminal.

<h3>Fase 2: 
<p>
* Crear un carro de la compra con varias líneas de pedido.
* Las líneas de pedido se almacernarán en redis con tiempo de expiración
* Se crea un nuevo pedido en MongoDB
      
<h4> Rutas:
<p>
* POST /addproduct - crea una línea de pedido
* -- body: id (camiseta), amount (nº de unidades)
* GET /seecart - muestra el carrito
* DELETE /deleteproduct/:id - Borra una linea de pedido
* --id es el id del producto que se elimina
* POST /closecart - Guarda el pedido en MongoDB
* GET /listofclosedcarts - Muestra los pedidos cerrados
    
<h4> Importante: 
<p>
* tener arrancado MongoDB en un terminal.
* tener arrancado redis en otro terminal.

<h3>Fase 3: 
<p>
* Crear un servicio what's hot now
* Se guardan en redis los artículos visitados (GET /tshirt/:id) con tiempo de expiración de 1 min.
* Se crea un servicio que devuelva las camisetas "calientes"
      
<h4> Rutas:
<p>
* GET /tshirt/:id - acceder a ver los detalles de una camiseta
* GET /hots - muestra las "camisetas calientes"
    
<h4> Importante: 
<p>
* tener arrancado MongoDB en un terminal.
* tener arrancado redis en otro terminal.
* tener camisetas creadas a las que poder acceder







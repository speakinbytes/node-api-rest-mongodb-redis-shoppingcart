// Incluímos las dependencias que vamos a usar,
// importamos Express
// con http creamos el servidor que posteriormente escuchará en el puerto 3000
var express = require("express"),
    app     = express(),
    http    = require("http"),
    server  = http.createServer(app),
    path    = require('path'),
    log     = require('./libs/log')(module),
    config  = require('./libs/config');
    mongoose = require("mongoose");

// Configuramos la app para que pueda realizar métodos REST
// con bodyParser() permitimos que pueda parsear JSON
// con methodOverride() nos permite implementar y personalizar métodos HTTP
// app.router nos permite crear rutas personalizadas
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.use(function(req, res, next){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});

routes = require('./routes/tshirts')(app);
routes = require('./routes/karts')(app);

// Conexión
mongoose.connect('mongodb://localhost/tshirts', function(err, res) {
  if(err) {
    console.log('ERROR: connecting to Database. ' + err);
  } else {
        console.log('Connected to Database');
        server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
            var addr = server.address();
            console.log("Node start at ", addr.address + ":" + addr.port);
        });
  }
});

// petición GET del root que sólo muestre "Hello world!"
app.get('/', function(req, res) {
  res.send("Hello world!");
});

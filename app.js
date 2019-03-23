// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


//Inicializar variables
var app = express();

// body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//conexion a la DB
mongoose.connection.openUri('mongodb://localhost:27017/escuelaDB', { useNewUrlParser: true }, ( err, res) => {
 if ( err ) throw err;
 console.log('Base de Datos: \x1b[32m%s\x1b[0m', 'online');
})

mongoose.set('useCreateIndex', true);

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3001, () =>{
console.log('express server puerto 3001: \x1b[32m%s\x1b[0m', 'online');

});
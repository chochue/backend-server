var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) =>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al bucar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: {
                    message: 'No existe un usuario en la base de datos'
                }
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: {
                    message: 'No existe un usuario en la base de datos'
                }
            });
        }

        //Crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED ,{ expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

   
});

module.exports = app;
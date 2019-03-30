var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();



var Usuario = require('../models/usuario');


// ==================================
// OBTENER TODOS LOS USUARIOS
// ==================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Usuario.find({}, 'nombre email img role academia ')
    .skip(desde)
    .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Usuarios',
                        errors: err
                    });
                }

                Usuario.collection.countDocuments({}, (err, conteo)=>{
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                })
                
            })



});

// ==================================
// ACTUALIZAR  USUARIOS
// ==================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al bucar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuarios con el id' + id + 'no existe',
                errors: {
                    message: 'No existe un usuario en la base de datos'
                }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
            usuario.academia = body.academia;
            usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });

});


// ==================================
// CREAR UN NUEVO USUARIO
// ==================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        academia: body.academia,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error all crear Usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});


// ==================================
// ELIMINAR UN  USUARIO
// ==================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{
     var id = req.params.id;
     Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
     });
});


module.exports = app;
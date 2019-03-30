var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Academia = require('../models/academia');

// ==================================
// OBTENER TODAS LAS ACADEMIAS
// ==================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Academia.find({}, 'nombre img')
        .populate('usuario', 'nombre academia email')
        .skip(desde)
        .limit(2)
        .exec(
            (err, academias) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Academias',
                        errors: err
                    });
                }

                Academia.collection.countDocuments({}, (err, conteo)=>{

                
                res.status(200).json({
                    ok: true,
                    academias: academias,
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

    Academia.findById(id, (err, academia) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al bucar academia',
                errors: err
            });
        }
        if (!academia) {
            return res.status(400).json({
                ok: false,
                mensaje: 'la academia con el id' + id + 'no existe',
                errors: {
                    message: 'No existe una academia en la base de datos'
                }
            });
        }
        academia.nombre = body.nombre;
        academia.usuario = req.usuario._id;
            

        academia.save((err, academiaGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la academia',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                academia: academiaGuardado
            });
        });

    });

});



// ==================================
// CREAR UNA NUEVA ACADEMIA
// ==================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var academia = new Academia({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    academia.save((err, academiaGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error all crear la Academia',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            academia: academiaGuardado
        });
    });
});


// ==================================
// ELIMINAR UN  USUARIO
// ==================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{
    var id = req.params.id;
    Academia.findByIdAndRemove(id, (err, academiaBorrado)=>{
       if (err) {
           return res.status(500).json({
               ok: false,
               mensaje: 'Error al borrar la Academia',
               errors: err
           });
       }
       if (!academiaBorrado) {
           return res.status(400).json({
               ok: false,
               mensaje: 'No existe la academia',
               errors: err
           });
       }
       res.status(200).json({
           ok: true,
           academia: academiaBorrado
       });
    });
});

module.exports = app;
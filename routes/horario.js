var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();
var Horario = require('../models/horario');

// ==================================
// OBTENER TODAS LOS HORARIOS
// ==================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde); 

    Horario.find({})
        .populate('usuario', 'nombre email academia')
        .skip(desde)
        .limit(2)
        .exec(
            (err, horarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando Horarios',
                        errors: err
                    });
                }

Horario.collection.countDocuments({}, (err, conteo)=>{
    res.status(200).json({
        ok: true,
        horarios: horarios,
        total: conteo
    });
})

                
            })

});

// ==================================
// ACTUALIZAR  HORARIOS
// ==================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Horario.findById(id, (err, horario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al bucar horario',
                errors: err
            });
        }
        if (!horario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'la horario con el id' + id + 'no existe',
                errors: {
                    message: 'No existe una horario en la base de datos'
                }
            });
        }
        horario.horario = body.horario;
        horario.usuario = req.usuario._id;
            

        horario.save((err, horarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar la horario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                horario: horarioGuardado
            });
        });

    });

});



// ==================================
// CREAR UN NUEVO HORARIO
// ==================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var horario = new Horario({
        horario: body.horario,
        usuario: req.usuario._id
    });

    horario.save((err, horarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error all crear la Horario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            horario: horarioGuardado
        });
    });
});


// ==================================
// ELIMINAR UN HORARIO
// ==================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) =>{
    var id = req.params.id;
    Horario.findByIdAndRemove(id, (err, horarioBorrado)=>{
       if (err) {
           return res.status(500).json({
               ok: false,
               mensaje: 'Error al borrar la Horario',
               errors: err
           });
       }
       if (!horarioBorrado) {
           return res.status(400).json({
               ok: false,
               mensaje: 'No existe la horario',
               errors: err
           });
       }
       res.status(200).json({
           ok: true,
           horario: horarioBorrado
       });
    });
});

module.exports = app;
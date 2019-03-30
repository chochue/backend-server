const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const Usuario = require('../models/usuario');
const Academia = require('../models/academia');

app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['usuarios', 'academias'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extensión no valida',
            errors: {
                message: 'Los archivos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciona nada',
            errors: {
                message: 'debe seleccionar una imagen'
            }
        });
    }

    // Obtener nombe del archivo

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1].toLowerCase();
    //solo estas extensiones aceptamos

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extensión no valida',
            errors: {
                message: 'Los archivos permitidos son ' + extensionesValidas.join(', ')
            }
        });
    }

    //nombre de archivo personalizado

    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    //mover el archivo temporal a un path

    var path = `./uploads/${ tipo }/${ nombreArchivo }`;



    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    })


});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if ( !usuario ){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe ',
                    errors: { message: 'Usuario no existe'}
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizado ',
                    usuario:  usuarioActualizado
                });
            })

        });
    }
    if (tipo === 'academias') {
        Academia.findById(id, (err, academia) => {

            if ( !academia ){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Academia no existe ',
                    errors: { message: 'Academia no existe'}
                });
            }

            var pathViejo = './uploads/academias/' + academia.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            
            academia.img = nombreArchivo;

            academia.save((err, academiaActualizado) => {

    
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Academia Actualizado ',
                    usuario:  academiaActualizado
                });
            })

        });
    }
}

module.exports = app;
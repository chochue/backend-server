var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//====================
// Autenticación Google
//=====================
async function verify(token){
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) =>{

var token = req.body.token;

var googleUser = await verify( token )
    .catch(e =>{
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no valido'
        });
    });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) =>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al bucar usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usuar su email y password'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED ,{ expiresIn: 14400 })
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                   
                });
            }
        }
        else {
            // El usuario no existe.. hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED ,{ expiresIn: 14400 })
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    mensaje: 'usuario logeado',
                    id: usuarioDB._id
                  
                });
            });

        }


    });



   /*  res.status(200).json({
        ok: true,
        mensaje: 'Ok',
        google: googleUser
    }); */
} )



//====================
// Autenticación Normal
//=====================
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
    })
   
});



module.exports = app;
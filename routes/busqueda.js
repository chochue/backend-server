var express = require('express');

var app = express();

let Horario = require('../models/horario');
let Academia = require('../models/academia');
let Usuario = require('../models/usuario');


//=======================
// Busqueda por coleccion
//========================

app.get('/coleccion/:tabla/:busqueda', ( req, res ) => {
    let busqueda = req.params.busqueda;
    let regex = new RegExp( busqueda, 'i');
    let tabla = req.params.tabla;

    let promesa;

    switch ( tabla){
        case 'usuarios':
            promesa =  buscarUsuarios(regex);
        break
        case 'academias':
            promesa =  buscarAcademias(regex);
        break
        case 'horarios':
            promesa =  buscarHorarios(regex);
        break

        default: 
        return res.status(400).json({
            ok: false,
            mensaje: 'los datos no se encuentran',
            error: { message: 'tipo de datos no valido'}
        });
    }

    promesa.then ( data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

//=======================
// Busqueda general
//========================
app.get('/todo/:busqueda', ( req, res, next ) => {
   
   let busqueda = req.params.busqueda;
   let regex = new RegExp( busqueda, 'i');
   

Promise.all( [
    buscarHorarios(regex), 
    buscarAcademias(regex),
    buscarUsuarios(regex)])
    .then( respuestas =>{

        res.status(200).json({
            ok: true,
            horarios: respuestas[0],
            academias: respuestas[1],
            Usuarios: respuestas[2]
        });

    })


      
});


function buscarHorarios( regex ) {
    
    return new Promise (( resolve, reject) =>{
        Horario.find({ horario: regex})
            .populate('usuario', 'nombre email')
            .exec((err, horarios)=>{

            if (err ){
                reject('Error al cargar los horarios', err);
            }else{
                resolve (horarios);
            }
            
             
                 });

    });

}

function buscarAcademias( regex ) {
    
    return new Promise (( resolve, reject) =>{
        Academia.find({ nombre: regex})
        .populate('usuario', 'nombre email')
        .exec((err, academias)=>{

            if (err ){
                reject('Error al cargar las academias', err);
            }else{
                resolve (academias);
            }
            
             
                 });

    });

}


function buscarUsuarios( regex ) {
    
    return new Promise (( resolve, reject) =>{
        Usuario.find({},'nombre email role academia')
                .or([ { 'nombre': regex}, {'email': regex}])
                .exec( (err, usuarios)=>{

                    if (err ){
                        reject('Error al cargar usuarios', err);
                    }else{
                        resolve (usuarios);
                    }

                })

    });

}


module.exports = app;
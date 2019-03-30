var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var academiaSchema = new Schema({
    nombre:  { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    img:  { type: String, required: false },
    usuario: {type: Schema.Types.ObjectId, ref:'Usuario'},
},{collection:'academias'});

academiaSchema.plugin( uniqueValidator, {message: '{PATH} no puede haber dos academias con el mismo nombre'} );
module.exports = mongoose.model('Academia', academiaSchema);
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var horarioSchema = new Schema({
    horario: { type: String, required: [true, 'El horario es necesario'] },
    usuario: {type: Schema.Types.ObjectId, ref:'Usuario'},
},{collection:'horarios'});

module.exports = mongoose.model('Horario', horarioSchema);
//importamos nuestras librerías
//para el manejo de los esquemas
var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

//Definimos nuestro esquema
var Visitas = new Schema({  
  ip: { type: String },
  fecha: { type: Date, default: Date.now },
  so: { type: String },
  url: { type: String }
});

//construimos un modelo para crear las colecciones
module.exports = mongoose.model('Visitas', Visitas);
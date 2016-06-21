var mongoose = require('mongoose'),  
    Schema   = mongoose.Schema;

var Visitas = new Schema({  
  ip: { type: String },
  fecha: { type: Date, default: Date.now },
  so: { type: String },
  url: { type: String }
});

module.exports = mongoose.model('Visitas', Visitas);
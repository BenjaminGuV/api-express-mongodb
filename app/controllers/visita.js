//importamos nuestras librerías
var mongoose     = require('mongoose');  
var VisitasModel = mongoose.model('Visitas');
var parser       = require('ua-parser-js');

//libreria para obtener la ip publica
const publicIp = require('public-ip');

var ip_publica = null;

// peticion GET
exports.findAllVisita = function(req, res) {  

    console.log('GET /visita');

    //busca todos nuestro registro que hay en vistas
    VisitasModel.find(function(err, contador) {
    	if(err) res.send(500, err.message);

        res.status(200).jsonp(contador);
    });

};

// peticion POST
exports.addVisita = function(req, res) {  
    console.log('POST');
    console.log(req.body);

    //obtenemos los datos del navegador
	var navegador = parser(req.headers['user-agent']);
	var tiempo  = new Date();

	publicIp.v4().then(ip => {

		//var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

		if ( typeof req.body.url == "undefined" ) {
			fullUrl = "-";
		}else{
			fullUrl = req.body.url;
		}

		//creamos el objeto del modelo vista
		var contador = new VisitasModel({
	        ip:    ip,
	        fecha: tiempo,
	        so:  navegador.os.name,
	        url:   fullUrl
	    });

		//guardamos los datos en la tabla
	    contador.save(function(err, contador) {
	        if(err) return res.status(500).send( err.message );
	     	res.status(200).jsonp(contador);
	    });
	});

};
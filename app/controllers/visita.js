var mongoose     = require('mongoose');  
var VisitasModel = mongoose.model('Visitas');
var parser       = require('ua-parser-js');


const publicIp = require('public-ip');

var ip_publica = null;

exports.findAllVisita = function(req, res) {  

    console.log('GET /visita');

    VisitasModel.find(function(err, contador) {
    	if(err) res.send(500, err.message);

        res.status(200).jsonp(contador);
    });

};

exports.addVisita = function(req, res) {  
    console.log('POST');
    console.log(req.body);

    /*var contador = new VisitasModel({
        ip:    req.body.ip,
        fecha:     req.body.fecha,
        so:  req.body.so,
        url:   req.body.url
    });

    contador.save(function(err, contador) {
        if(err) return res.status(500).send( err.message );
     	res.status(200).jsonp(contador);
    });*/

	var navegador = parser(req.headers['user-agent']);
	var tiempo  = new Date();

	publicIp.v4().then(ip => {

		//var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

		if ( typeof req.body.url == "undefined" ) {
			fullUrl = "-";
		}else{
			fullUrl = req.body.url;
		}

		var contador = new VisitasModel({
	        ip:    ip,
	        fecha: tiempo,
	        so:  navegador.os.name,
	        url:   fullUrl
	    });

	    contador.save(function(err, contador) {
	        if(err) return res.status(500).send( err.message );
	     	res.status(200).jsonp(contador);
	    });
	});

};
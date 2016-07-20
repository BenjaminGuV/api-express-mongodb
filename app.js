//configuracion de puertos y mongo
var config_base = require('./config.dev.js');

//declarando todas las librerias
var express = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    methodOverride = require("method-override"),
    querystring    = require('querystring')
    mongoose       = require('mongoose'),
    server         = app.listen(config_base.puerto),
    http           = require('http'),
    url            = require('url'),
    io             = require('socket.io').listen(server);


var url_cliente = "";
var g_header_so = "";

//configuracion de la aplicacion
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

//importar modelos y controladores
var models            = require('./app/models/visita')(app, mongoose);
var visitasController = require('./app/controllers/visita');

//declarando rutas de express
var router = express.Router();

//peticion inicial de la aplicacion GET /
router.get('/', function(req, res) {
    res.send("¡Ok!");
});

app.use(router);

//es necesario declar esta ruta para que la aplicacion encuentre
//el archivo socket.io/socket.io.js
app.use(express.static("public"));

var rutasVisitas = express.Router();

// api request GET y POST
rutasVisitas.route('/visita')
    .get(visitasController.findAllVisita)
    .post(visitasController.addVisita);

//agregar una ruta api a las peticiones de api/visita
app.use('/api', rutasVisitas);


//conexion a la base de datos
mongoose.connect(config_base.conexion_mongo, function(err, res) {
    if (err) {
        console.log('ERROR: connecting to Database. ' + err);
    }
});

//comienza el servicio Node
server.listen(config_base.puerto, function() {
    console.log("Node server running on http://localhost:" + config_base.puerto );
});

//empieza el socket io
io.on('connection', function(socket) {
    g_header_so = socket.handshake.headers;
    url_cliente = socket.handshake.query.name;

    console.log( "identificador de cliente", socket.id );

    sendVisita(function(data) {
        console.log('Send locations to client ' + socket.id);
    });

    socket.emit('conexion', { bandera: 'true' });

});

//funciones adicionales
//envia un post a la api
function sendVisita(callback) {
    var api_host = 'localhost';


    if ( typeof url_cliente == "undefined" || url_cliente == "" ) {
        url_cliente = "N/D"
    }

    if ( typeof g_header_so['user-agent'] == "undefined" || g_header_so['user-agent'] == "" ) {
        g_header_so['user-agent'] = "N/D"
    }


    var post_data = querystring.stringify({
        'url': url_cliente,
        'so': g_header_so['user-agent']
    });

    var options = {
        hostname: api_host,
        port: config_base.puerto,
        path: '/api/visita',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data),
            'user-agent': g_header_so['user-agent']
        }
    };

    var req = http.request(options, function(res) {
        //console.log('-----------------------------------------');
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        var output = '';

        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            if (callback != undefined) {
                callback(obj);
            }
        });
    });

    req.write(post_data);

    req.on('error', function(e) {
        callback({
            url: "/"
        });
        console.log('problem with request: ' + e.message);
    });

    req.end();
}
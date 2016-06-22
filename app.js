//declarando todas las librerias
var express = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    methodOverride = require("method-override"),
    querystring    = require('querystring')
    mongoose       = require('mongoose'),
    server         = app.listen(3000),
    http           = require('http'),
    url            = require('url'),
    io             = require('socket.io').listen(server);

var url_cliente = "";

//configuracion de la aplicacion
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

//importar modelos y controladores
var models            = require('./app/models/visita')(app, mongoose);
var visitasController = require('./app/controllers/visita');

var router = express.Router();

router.get('/', function(req, res) {
    res.send("¡Ok!");
});

app.use(router);

app.use(express.static("public"));

var rutasVisitas = express.Router();

rutasVisitas.route('/visita')
    .get(visitasController.findAllVisita)
    .post(visitasController.addVisita);

app.use('/api', rutasVisitas);


//conexion a la base de datos
mongoose.connect('mongodb://192.168.59.103:27017/test', function(err, res) {
    if (err) {
        console.log('ERROR: connecting to Database. ' + err);
    }
});

server.listen(3000, function() {
    console.log("Node server running on http://localhost:3000");
});


io.on('connection', function(socket) {

    url_cliente = socket.handshake.query.name;

    sendVisita(function(data) {
        console.log('Send locations to client ' + socket.id);
    });

    socket.emit('conexion', { bandera: 'true' });

});

//funciones adicionales
//envia un post a la api
function sendVisita(callback) {
    var api_host = 'localhost';
    var post_data = querystring.stringify({
        'url': url_cliente
    });
    var options = {
        hostname: api_host,
        port: 3000,
        path: '/api/visita',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
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
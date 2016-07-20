    var mocha = require('mocha');
    var io    = require('socket.io-client');

    describe("conexion", function () {

        var server,
            options ={
                transports: ['websocket'],
                'force new connection': true
            };

        var con_client = [];
        //conexiones de los usuarios simulados
        var num_client = 10;

        beforeEach(function (done) {
            // start the server
            // dirección de archivo a testear
            server = require('../app').server;

            done();

        });

        it("conexion de clientes", function (done) {
            //emulacion de clientes
            for (var i = num_client; i >= 0; i--) {
                con_client[i] = io.connect("http://localhost:3000", options);

                con_client[i].once("connection", function () {
                    con_client.disconnect();
                });
            };

            //tiempo limite de ejecución de la prueba
            //colocar un tiempo menor al de ejecución por parte
            //del comando
            //cmd: mocha --timeout 15000
            setTimeout(done, 10000);

        });
        
    });
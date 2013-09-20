(function () {
    var socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function (e) {
        socket.send('hola');
    };

    socket.onmessage = function (e) {
        console.log(e.data);
    };
})();

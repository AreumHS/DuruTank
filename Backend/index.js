const express = require('express');
const { json } = require('stream/consumers');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/'));

app.get('/control', function(req,res){
    res.render('control.html');
});




io.on('connection', (socket) => {
    socket.on('login', (data) => {
        console.log(data.type + ' connected to server');

        socket.type = data.type;
    });

    socket.on('input', (data) => {
        console.log('Controller input val : ' + JSON.stringify(data));

        socket.broadcast.emit('input', data);
    })

    socket.on('disconnect', () => {
        console.log(socket.type + " is now disconnected");
    });
});


server.listen(8081, function(){ console.log("Server Open : Port 8081") })

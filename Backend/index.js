const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.engine('html', require('ejs').renderFile);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/'));

app.get('/', function(req,res){
    res.render('control.html');
});

io.on('connection', (socket) => {
    console.log("[ something logged in. ]");

    socket.on('login', (data) => {
        console.log(data.type + ' connected to server');
        socket.type = data.type;
    });

    socket.on('coninput', (data) => {
        console.log('Controller input val : ' + JSON.stringify(data));
        socket.broadcast.emit('input', data);
    })

    socket.on('phoneinput', (data) => {
        console.log('Controller input val : ' + JSON.stringify(data));
        socket.broadcast.emit('input', data);
    })

    socket.on('disconnect', () => {
        console.log(socket.type + " is now disconnected");
    });
});

http.listen(8081, () => console.log("server opened at 8081 -> 30001"));
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

function digit(tmp){
    if(tmp.length == 1) return "00"+tmp;
    if(tmp.length == 2) return "0"+tmp;
    if(tmp.length == 3) return tmp.toString();
}


io.on('connection', (socket) => {
    console.log("[ something logged in. ]");

    socket.on('login', (data) => {
        console.log(data.type + ' connected to server');
        socket.type = data.type;
    });

    socket.on('coninput', (data) => {
        //console.log('Controller input val : ' + JSON.stringify(data));
        let abxy = data.ka.toString() + data.kb.toString() + data.kx.toString() + data.ky.toString();
        let wasd = data.dw.toString() + data.da.toString() + data.ds.toString() + data.dd.toString();
        let trig = data.l1.toString() + data.l2.toString() + data.r1.toString() + data.r2.toString();

        let lx = digit((data.lx*100+100).toFixed().toString());
        let ly = digit((data.ly*100+100).toFixed().toString());
        let rx = digit((data.rx*100+100).toFixed().toString());
        let ry = digit((data.ry*100+100).toFixed().toString());

            console.log((data.lx*100+100).toString());
        
            console.log((data.ly*100+100).toString());
        
            console.log((data.rx*100+100).toString());
        
            console.log((data.ry*100+100).toString());
        
        }*/
        let querystr = abxy + wasd + trig + " " + lx + " " + ly + " " + rx + " " + ry;
        console.log(querystr);
        socket.broadcast.emit('coninput', querystr);
    })

    socket.on('phoneinput', (data) => {
        //console.log('phone input val : ' + JSON.stringify(data));
        //var bitmap = new Buffer(data, 'base64');
        //socket.broadcast.emit('phoneinput', data);
    })

    socket.on('disconnect', () => {
        console.log(socket.type + " is now disconnected");
    });
});


http.listen(8081, () => console.log("server opened at 8081 -> 30001"));


//////////////////////// 카메라 파트 //////////////////////

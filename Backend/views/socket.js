// websocket connect
var socket = io();
socket.emit("login", {
  type : "controller"
});

socket.on('phoneinput', (data) => {
  var bitmap = new Image();
  var htmlCanvas = document.getElementById('remote');
  var ctx = htmlCanvas.getContext("2d");
  bitmap.onload = function(){
    ctx.drawImage(bitmap,0,0);
  }

  bitmap.src = "data:image/png;base64,"+data;
});
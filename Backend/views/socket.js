// websocket connect
var socket = io();
socket.emit("login", {
  type : "controller"
});
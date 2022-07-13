package com.example.rctankprocess

import android.util.Log
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

class SocketApplication {
    companion object {
        private lateinit var socket : Socket
        fun get(): Socket {
            try{
                socket = IO.socket("http://192.168.0.2:30001");
            } catch( e : URISyntaxException ){
                Log. v("SocketIO", "error connecting to socket");
            }
            return socket
        }
    }
}
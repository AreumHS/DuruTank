package com.example.rctankprocess

import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import io.socket.client.Socket
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    lateinit var mSocket: Socket
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        mSocket = SocketApplication.get()
        mSocket.connect()
        mSocket.emit("login", JSONObject("{\"type\": \"smartphone\"}"));

        val edittext: EditText = findViewById<EditText>(R.id.edittext)
        val sendbutton: Button = findViewById(R.id.sendbutton)
        sendbutton.setOnClickListener{
            mSocket.emit("login", "smartphone");
            Log.v("SocketIO", edittext.text.toString())
        }

        //mSocket.on("get message", onMessage)
//        mSocket.connect()
    }

    /*var onMessage = Emitter.Listener { args ->
        val sendtext: TextView = findViewById(R.id.sendtext) as TextView
        val obj = JSONObject(args[0].toString())
        val a = sendtext.text.toString()
        Log.d("main activity", obj.toString())
        Thread(object : Runnable{
            override fun run() {
                runOnUiThread(Runnable {
                    kotlin.run {
                        sendtext.text = a + "\n" + obj.get("name") + ": " + obj.get("message")
                    }
                })
            }
        }).start()
    }*/
}
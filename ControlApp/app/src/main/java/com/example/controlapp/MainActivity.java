package com.example.controlapp;

import androidx.appcompat.app.AppCompatActivity;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.os.Bundle;
import org.json.JSONObject;
import android.Manifest;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

import com.hoho.android.usbserial.driver.UsbSerialDriver;
import com.hoho.android.usbserial.driver.UsbSerialPort;
import com.hoho.android.usbserial.driver.UsbSerialProber;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final String ACTION_USB_PERMISSION = "com.android.example.USB_PERMISSION";
    private final BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {

        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    UsbDevice device = (UsbDevice)intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);

                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        if(device != null){
                            //call method to set up device communication
                        }
                    }
                    else {
                        Log.d("asdf", "permission denied for device " + device);
                    }
                }
            }
        }
    };

    private Socket mSocket;
    {
        try{
            mSocket = IO.socket("http://192.168.0.2:30001");
        } catch(URISyntaxException e) {}
    }

    UsbSerialPort port;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 아두이노 연결 - 권한
        UsbManager mUsbManager = (UsbManager) getSystemService(Context.USB_SERVICE);
        PendingIntent mPermissionIntent = PendingIntent.getBroadcast(this, 0, new Intent(ACTION_USB_PERMISSION), 0);
        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        registerReceiver(mUsbReceiver, filter);

        // 웹소켓 연결
        mSocket.connect();

        // Find all available drivers from attached devices.
        UsbManager manager = (UsbManager) getSystemService(Context.USB_SERVICE);
        List<UsbSerialDriver> availableDrivers = UsbSerialProber.getDefaultProber().findAllDrivers(manager);
        if (availableDrivers.isEmpty()) {
            Toast myToast = Toast.makeText(this.getApplicationContext(),"드라이버가 없습니다.", Toast.LENGTH_SHORT);
            myToast.show();
            return;
        }

        // Open a connection to the first available driver.
        UsbSerialDriver driver = availableDrivers.get(0);
        UsbDeviceConnection connection = manager.openDevice(driver.getDevice());

        if (connection == null) {
            mUsbManager.requestPermission(driver.getDevice(), mPermissionIntent);

            Toast myToast = Toast.makeText(this.getApplicationContext(),"연결가능한 기기가 없습니다.", Toast.LENGTH_SHORT);
            myToast.show();
            return;
        }

        port = driver.getPorts().get(0); // Most devices have just one port (port 0)
        try{
            port.open(connection);
            port.setParameters(115200, 8, UsbSerialPort.STOPBITS_1, UsbSerialPort.PARITY_NONE);
            Toast myToast = Toast.makeText(this.getApplicationContext(),"연결 성공.", Toast.LENGTH_SHORT);
            myToast.show();

            port.write("000000000000 100 100 100 100".getBytes(), 100);
        }catch(Exception e) {
            Toast myToast = Toast.makeText(this.getApplicationContext(),"연결 실패.", Toast.LENGTH_SHORT);
            myToast.show();
        }

        mSocket.on("coninput", onNewMessage);
    }

    private Emitter.Listener onNewMessage = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            JSONObject data = (JSONObject) args[0];
            Toast myToast = Toast.makeText(this.getApplicationContext(),"연결 성공.", Toast.LENGTH_SHORT);
            myToast.show();
            try {
                port.write(data.toString().getBytes(),100);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    };
}
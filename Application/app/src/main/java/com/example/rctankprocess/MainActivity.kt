package com.example.rctankprocess

import android.Manifest
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import io.socket.client.Socket
import io.socket.emitter.Emitter
import org.json.JSONObject


class MainActivity : AppCompatActivity(){
    lateinit var mSocket: Socket
    //lateinit var port : ;
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        //val startBtn : Button = findViewById<Button>(R.id.btn_start)
        //val textureView: TextureView = findViewById<TextureView>(R.id.texture)
        //assert(textureView != null)


        mSocket = SocketApplication.get()
        mSocket.connect()
        mSocket.emit("login", JSONObject("{\"type\": \"smartphone\"}"));

        //val edittext: EditText = findViewById<EditText>(R.id.edittext)
        Log.i("received","test")
        mSocket.on("coninput", onMessageReceived);

        // 카메라 파트
        /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_DENIED) {
                val permission = arrayOf(Manifest.permission.CAMERA)
                requestPermissions(permission, 1122)
            }
            else { setFragment() }
        }
        else{ setFragment() }
        */

        val permission_list = arrayOf<String>(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        ActivityCompat.requestPermissions(this@MainActivity, permission_list, 1);

        val sendbutton: Button = findViewById(R.id.btn_start)
        sendbutton.setOnClickListener{

            val tv : TextView = findViewById<TextView>(R.id.textView);
            tv.setText("아시발 ㅋㅋ");

        }

        if (isBluetoothSupport()) {   // 블루투스 지원 체크
            if(repository.isBluetoothEnabled()){ // 블루투스 활성화 체크
                //Progress Bar
                setInProgress(true)
                //디바이스 스캔 시작
                scanDevice()
            }else{
                // 블루투스를 지원하지만 비활성 상태인 경우
                // 블루투스를 활성 상태로 바꾸기 위해 사용자 동의 요청
                _requestBleOn.value = Event(true)
            }
        }else{ //블루투스 지원 불가
            //Toast Massage
            Util.showNotification("Bluetooth is not supported.")
        }

    }


    private val onMessageReceived = Emitter.Listener { args ->
        // 전달받은 데이터는 아래와 같이 추출할 수 있습니다.
        //val receivedData = args[0] as JSONObject
        Log.v("received", args[0].toString());
        // your code...
    }


    /*var onMessage = Emitter.Listener { args ->
        mSocket.emit("phoneinput", "smartphone")
        Log.d("main activity","값 받아옴")
        /*
        val sendtext: TextView = findViewById(R.id.sendtext) as TextView
        val obj = JSONObject(args[0].toString())
        val a = sendtext.text.toString()
        Log.d("main activity", obj.toString())
        Thread(object : Runnable{
            override fun run() {
                runOnUiThread(Runnable {
                    kotlin.run {
                        sendtext.text = a /*+ "\n" + obj.get("name") + ": " + obj.get("message")*/
                    }
                })
            }
        }).start()**/
    }*/

    // 카메라 파트
    /*
    var previewHeight = 0;
    var previewWidth = 0;
    var sensorOrientation = 0;
    //TODO fragment which show llive footage from camera
    protected fun setFragment() {
        val manager =
            getSystemService(Context.CAMERA_SERVICE) as CameraManager
        var cameraId: String? = null
        try {
            cameraId = manager.cameraIdList[0]
        } catch (e: CameraAccessException) {
            e.printStackTrace()
        }
        val fragment: Fragment
        val camera2Fragment = CameraConnectionFragment.newInstance(
            object :
                CameraConnectionFragment.ConnectionCallback {
                override fun onPreviewSizeChosen(size: Size?, rotation: Int) {
                    previewHeight = size!!.height
                    previewWidth = size.width
                    sensorOrientation = rotation - getScreenOrientation()
                }
            },
            this,
            R.layout.camera_fragment,
            Size(452, 226)
        )
        camera2Fragment.setCamera(cameraId)
        fragment = camera2Fragment
        fragmentManager.beginTransaction().replace(R.id.container, fragment).commit()
    }
    protected fun getScreenOrientation(): Int {
        return when (windowManager.defaultDisplay.rotation) {
            Surface.ROTATION_270 -> 270
            Surface.ROTATION_180 -> 180
            Surface.ROTATION_90 -> 90
            else -> 0
        }
    }

    //TODO getting frames of live camera footage and passing them to model
    private var isProcessingFrame = false
    private val yuvBytes = arrayOfNulls<ByteArray>(3)
    private var rgbBytes: IntArray? = null
    private var yRowStride = 0
    private var postInferenceCallback: Runnable? = null
    private var imageConverter: Runnable? = null
    private lateinit var rgbFrameBitmap: Bitmap
    override fun onImageAvailable(reader: ImageReader) {
        // We need wait until we have some size from onPreviewSizeChosen
        if (previewWidth == 0 || previewHeight == 0) {
            return
        }
        if (rgbBytes == null) {
            rgbBytes = IntArray(previewWidth * previewHeight)
        }
        try {
            val image = reader.acquireLatestImage() ?: return
            if (isProcessingFrame) {
                image.close()
                return
            }
            isProcessingFrame = true
            val planes = image.planes
            fillBytes(planes, yuvBytes)
            yRowStride = planes[0].rowStride
            val uvRowStride = planes[1].rowStride
            val uvPixelStride = planes[1].pixelStride
            imageConverter = Runnable {
                ImageUtils.convertYUV420ToARGB8888(
                    yuvBytes[0]!!,
                    yuvBytes[1]!!,
                    yuvBytes[2]!!,
                    previewWidth,
                    previewHeight,
                    yRowStride,
                    uvRowStride,
                    uvPixelStride,
                    rgbBytes!!
                )
            }
            postInferenceCallback = Runnable {
                image.close()
                isProcessingFrame = false
            }
            processImage()
        } catch (e: Exception) {
            return
        }
    }


    private fun processImage() {
        imageConverter!!.run()
        rgbFrameBitmap = Bitmap.createBitmap(previewWidth, previewHeight, Bitmap.Config.ARGB_8888)
        rgbFrameBitmap?.setPixels(rgbBytes, 0, previewWidth, 0, 0, previewWidth, previewHeight)
        postInferenceCallback!!.run()

        //Log.d("TEST", rgbBytes.contentToString())
        mSocket.emit("phoneinput", bitmapToString(rgbFrameBitmap))
    }

    protected fun fillBytes(
        planes: Array<Image.Plane>,
        yuvBytes: Array<ByteArray?>
    ) {
        // Because of the variable row stride it's not possible to know in
        // advance the actual necessary dimensions of the yuv planes.
        for (i in planes.indices) {
            val buffer = planes[i].buffer
            if (yuvBytes[i] == null) {
                yuvBytes[i] = ByteArray(buffer.capacity())
            }
            buffer[yuvBytes[i]]
        }
    }

    fun bitmapToString(bitmap: Bitmap): String {
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
        val bytes = stream.toByteArray()
        return Base64.getEncoder().encodeToString(bytes)
    }

    //TODO rotate image if image captured on sumsong devices
    //Most phone cameras are landscape, meaning if you take the photo in portrait, the resulting photos will be rotated 90 degrees.
    fun rotateBitmap(input: Bitmap): Bitmap? {
        Log.d("trySensor", sensorOrientation.toString() + "     " + getScreenOrientation())
        val rotationMatrix = Matrix()
        rotationMatrix.setRotate(sensorOrientation.toFloat())
        return Bitmap.createBitmap(input, 0, 0, input.width, input.height, rotationMatrix, true)
    }

    override fun onDestroy() { super.onDestroy() }

     */
}
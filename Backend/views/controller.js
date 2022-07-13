"use strict";

var conn = {};

let qs = function(s,p){
    if(p){ return p.querySelector(s); }
    return document.querySelector(s);
}

function clamp(x, y) {
    let m = Math.sqrt(x*x + y*y);
    if(m > 1){ x /= m; y /= m; }
    return [x, y];
}


function updateUI() {
    let mapping = ['ka','kb','kx','ky','l1','r1','l2','r2',-1,-1,-1,-1,'dw','ds','da','dd',-1];
    let gp = navigator.getGamepads()[0];
    let tmp = {};
      
    if (!gp || !gp.connected) return; 
     
    for (let i=0; i<gp.buttons.length; i++) {
        if(mapping[i] == -1) continue;
        
        let button = gp.buttons[i];
        let nowbutton = qs('#'+mapping[i]);

        if (button.pressed) {
            nowbutton.classList.add("pressed");
            tmp[mapping[i]] = 1;
        } else {
            nowbutton.classList.remove("pressed");
            tmp[mapping[i]] = 0;
        }
    }

     
      
    // left joystick
    let lposX = gp.axes[0];
    let lposY = gp.axes[1];
    let lpointer = qs("#leftjoystick .pointer");

    let lX, lY;
    [lX, lY] = clamp(lposX, lposY);
    lpointer.style.left = (lX + 1) / 2 * 100 + '%';
    lpointer.style.top = (lY + 1) / 2 * 100 + '%';

    tmp['lx'] = lposX.toFixed(2);
    tmp['ly'] = lposY.toFixed(2);

    //let lStr = lposX.toFixed(2) + ',' + lposY.toFixed(2);
    //qs("#leftjoystick .stickpos").innerHTML = lStr;

    // right joystick
    let rposX = gp.axes[2];
    let rposY = gp.axes[3];
    let rpointer = qs("#rightjoystick .pointer");

    let rX, rY;
    [rX, rY] = clamp(rposX, rposY);
    rpointer.style.left = (rX + 1) / 2 * 100 + '%';
    rpointer.style.top = (rY + 1) / 2 * 100 + '%';

    tmp['rx'] = rposX.toFixed(2);
    tmp['ry'] = rposY.toFixed(2);

    //let rStr = rposX.toFixed(2) + ',' + rposY.toFixed(2);
    //qs("#rightjoystick .stickpos").innerHTML = rStr;


    if(JSON.stringify(tmp) !== JSON.stringify(conn)){
        conn = tmp;
        socket.emit("coninput", conn);
    }
}

function onFrame() {
    updateUI();
    requestAnimationFrame(onFrame);
}

window.addEventListener('load', () => { if( !!(navigator.getGamepads) ){ requestAnimationFrame(onFrame); } });

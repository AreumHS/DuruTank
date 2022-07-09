"use strict";

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
    let mapping = ['akey','bkey','xkey','ykey','l1','r1','l2','r2',-1,-1,-1,-1,'wdir','sdir','adir','ddir',-1];

    let gp = navigator.getGamepads()[0];
      
    if (!gp || !gp.connected) return; 
     
    for (let i=0; i<gp.buttons.length; i++) {
        if(mapping[i] == -1) continue;
        
        let button = gp.buttons[i];
        let nowbutton = qs('#'+mapping[i]);

        if (button.pressed) {
            nowbutton.classList.add("pressed");
        } else {
            nowbutton.classList.remove("pressed");
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

    let lStr = lposX.toFixed(2) + ',' + lposY.toFixed(2);
    qs("#leftjoystick .stickpos").innerHTML = lStr;

    // right joystick
    let rposX = gp.axes[2];
    let rposY = gp.axes[3];
    let rpointer = qs("#rightjoystick .pointer");

    let rX, rY;
    [rX, rY] = clamp(rposX, rposY);
    rpointer.style.left = (rX + 1) / 2 * 100 + '%';
    rpointer.style.top = (rY + 1) / 2 * 100 + '%';

    let rStr = rposX.toFixed(2) + ',' + rposY.toFixed(2);
    qs("#rightjoystick .stickpos").innerHTML = rStr;
}

function onFrame() {
    updateUI();
    requestAnimationFrame(onFrame);
}

window.addEventListener('load', () => { if( !!(navigator.getGamepads) ){ requestAnimationFrame(onFrame); } });

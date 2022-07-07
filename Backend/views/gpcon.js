/**
 * Main
 */
 (function () {
    "use strict";

    // Imports
    let template = htmlLib.template;
    let qs = htmlLib.qs;

    // Currently visible controller
    let currentVisibleController = null;

    /**
     * Show a certain controller
     */
    function showController(n) {

        n = n | 0;

        console.log("Selecting gamepad " + n);

        let gamepads = document.querySelectorAll("#gamepad-container .gamepad");

        for (let i = 0; i < gamepads.length; i++) {
            let gp = gamepads[i];
            let index = gp.getAttribute("data-gamepad-index");

            index = index | 0;

            if (index == n) {
                gp.classList.remove('nodisp');
            } else {
                gp.classList.add('nodisp');
            }
        }

        currentVisibleController = n;
    }

    /**
     * Reconstruct the UI for the current gamepads
     */
    function rebuildUI() {

        // Handle gamepad selector button clicks
        function onButtonClick(ev) {
            let b = ev.currentTarget;
            let gpIndex = b.getAttribute('data-gamepad-index');

            showController(gpIndex);
        }

        let gp = navigator.getGamepads();

        let bbbox = qs("#button-bar-box");
        bbbox.innerHTML = '';

        let gpContainer = qs("#gamepad-container");
        gpContainer.innerHTML = '';

        let haveControllers = false, curControllerVisible = false, firstController = null;

        // For each controller, generate a button from the
        // button template, set up a click handler, and append
        // it to the button box
        for (let i = 0; i < gp.length; i++) {

            // Chrome has null controllers in the array
            // sometimes when nothing's plugged in there--ignore
            // them
            if (!gp[i] || !gp[i].connected) { continue; }

            let gpIndex = gp[i].index;

            // Clone the selector button
            let button = template("#template-button",
                {
                    "id": "button-" + gpIndex,
                    "data-gamepad-index": gpIndex,
                    "value": gpIndex
                });

            bbbox.appendChild(button);

            // Add the selector click listener
            button.addEventListener('click', onButtonClick);

            // Clone the main holder
            let gamepad = template("#template-gamepad",
                {
                    "id": "gamepad-" + gpIndex,
                    "data-gamepad-index": gpIndex
                });

            gpContainer.appendChild(gamepad);

            qs(".gamepad-title", gamepad).innerHTML = "Gamepad " + gpIndex;
            qs(".gamepad-id", gamepad).innerHTML = gp[i].id;

            let mapping = gp[i].mapping;
            qs(".gamepad-mapping", gamepad).innerHTML = "mapping: " + (mapping && mapping !== ''? mapping: "[<i>unspecified</i>]");

            // Add the buttons for this gamepad
            let j;
            let buttonBox = qs(".gamepad-buttons-box", gamepad)

            for (j = 0; j < gp[i].buttons.length; j++) {
                let buttonContainer = template("#template-gamepad-button-container",
                    {
                        "id": "gamepad-" + gpIndex + "-button-container-" + j
                    });

                    qs(".gamepad-button", buttonContainer).setAttribute("id", "gamepad-" + gpIndex + "-button-" + j);
                    qs(".gamepad-button-label", buttonContainer).innerHTML = j;

                buttonBox.appendChild(buttonContainer);
            }

            // Add the axes for this gamepad
            let axesBox = qs(".gamepad-axes-box", gamepad);
            let axesBoxCount = ((gp[i].axes.length + 1) / 2)|0; // Round up (e.g. 3 axes is 2 boxes)

            for (j = 0; j < axesBoxCount; j++) {
                let axisPairContainer = template("#template-gamepad-axis-pair-container",
                    {
                        "id": "gamepad-" + gpIndex + "-axis-pair-container-" + j
                    });

                qs(".gamepad-axis-pair", axisPairContainer).setAttribute("id", "gamepad-" + gpIndex + "-axispair-" + j);

                let pairLabel;

                // If we're on the last box and the number of axes is odd, just put one label on there
                if (j == axesBoxCount - 1 && gp[i].axes.length % 2 == 1) {
                    pairLabel = j*2;
                } else {
                    pairLabel = (j*2) + "," + ((j*2)+1);
                }
                qs(".gamepad-axis-pair-label", axisPairContainer).innerHTML = pairLabel;

                axesBox.appendChild(axisPairContainer);
            }

            // And remember that we have controllers now
            haveControllers = true;

            if (i == currentVisibleController) {
                curControllerVisible = true;
            }

            if (firstController === null) {
                firstController = i;
            }
        }

        // Show or hide the "plug in a controller" prompt as
        // necessary
        if (haveControllers) {
            qs("#prompt").classList.add("nodisp");
            qs("#main").classList.remove("nodisp");
        } else {
            qs("#prompt").classList.remove("nodisp");
            qs("#main").classList.add("nodisp");
        }

        if (curControllerVisible) {
            showController(currentVisibleController);
        } else {
            currentVisibleController = firstController;
            showController(firstController);
        }
    }

    /**
     * Update the UI components based on gamepad values
     */
     function updateUI() {

        let gamepads = navigator.getGamepads();
        let mapping = ['akey','bkey','xkey','ykey','l1','r1','l2','r2',-1,-1,-1,-1,'wdir','sdir','adir','ddir',-1];

        // For each controller, show all the button and axis information
        for (let i = 0; i < gamepads.length; i++) {
            let gp = gamepads[i];
            let j;

            if (!gp || !gp.connected) { continue; }

            let gpElem = qs("#gamepad-" + i);
            
            // Show button values
            let buttonBox = qs(".gamepad-buttons-box", gpElem);

            for (j = 0; j < gp.buttons.length; j++) {
                let buttonElem = qs("#gamepad-" + i + "-button-" + j, buttonBox)
                let button = gp.buttons[j];

                // Put the value in there
                buttonElem.innerHTML = button.value;

                if(mapping[j] == -1) continue;
                let nowbutton = qs('#'+mapping[j]);

                // Change color if pressed or not
                if (button.pressed) {
                    nowbutton.classList.add("pressed");
                } else {
                    nowbutton.classList.remove("pressed");
                }
            }

            
            
            // Show joystick moves
            let lposX = gp.axes[0];
            let lposY = gp.axes[1];
            let lpointer = qs("#leftjoystick .pointer");

            let lX, lY;
            [lX, lY] = gpLib.clamp(lposX, lposY);
            lpointer.style.left = (lX + 1) / 2 * 100 + '%';
            lpointer.style.top = (lY + 1) / 2 * 100 + '%';

            let lStr = lposX.toFixed(2) + ',' + lposY.toFixed(2);
            qs("#leftjoystick .stickpos").innerHTML = lStr;


            let rposX = gp.axes[2];
            let rposY = gp.axes[3];
            let rpointer = qs("#rightjoystick .pointer");

            let rX, rY;
            [rX, rY] = gpLib.clamp(rposX, rposY);
            rpointer.style.left = (rX + 1) / 2 * 100 + '%';
            rpointer.style.top = (rY + 1) / 2 * 100 + '%';

            let rStr = rposX.toFixed(2) + ',' + rposY.toFixed(2);
            qs("#rightjoystick .stickpos").innerHTML = rStr;
        }
     }

    /**
     * Render a frame
     */
    function onFrame() {
        let conCheck = gpLib.testForConnections();

        // Check for connection or disconnection
        if (conCheck) {
            console.log(conCheck + " new connections");

            // And reconstruct the UI if it happened
            rebuildUI();
        }

        // Update all the UI elements
        updateUI();

        requestAnimationFrame(onFrame);
    }

    /**
     * onload handler
     */
    function onLoad() {
        if (gpLib.supportsGamepads()) {
            rebuildUI();
            requestAnimationFrame(onFrame);
        } else {
            qs("#sol").classList.remove("nodisp");
        }
    }

    // Initialization code
    window.addEventListener('load', onLoad);
}());
Footer

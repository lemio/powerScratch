/*
@title PowerScratch:    Control high voltage devices using scratch.
@author:                Geert Roumen
@website:               
@source:                Based on: https://github.com/LLK/scratchx/blob/master/picoExtension.js

*/
(function(ext) {
    var device = null;
    var rawData = null;
    var stat = false;

    var inputArray = [];
/*
To display the incoming string in the console

@input
buffer (An ArrayBuffer object)
*/
    function arrayBufferToString(buffer) {
        var arr = new Uint8Array(buffer);
        var str = String.fromCharCode.apply(String, arr);
        if (/[\u0080-\uffff]/.test(str)) {
            throw new Error("this string seems to contain (still encoded) multibytes");
        }
        return str;
    }
/*
Process incoming data
*/
    function processData() {
        var bytes = new Uint8Array(rawData);
        console.log("recieved: ", arrayBufferToString(bytes));
    }
/*
Function to append two buffer objects to one buffer
*/
    function appendBuffer(buffer1, buffer2) {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(new Uint8Array(buffer1), 0);
        tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
        return tmp.buffer;
    }
/*
Function that executes when the plugin is loaded and tries to connect to the powerScratch
*/
    // 
    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        potentialDevices[0] = (dev);

        if (!device) {
            tryNextDevice();
        }
    }

    var poller = null;
    var watchdog = null;
    /*
    Try to connect to a device
    */
    function tryNextDevice() {
        // If potentialDevices is empty, device will be undefined.
        // That will get us back here next time a device is connected.
        console.log(potentialDevices);
        device = potentialDevices[0]; //.shift();
        console.log(device);
        if (!device) return;

        device.open({
            bitRate: 57600
        }, function() {
            //When succeeded connecting to the device
            device.set_receive_handler(function(data) {
                //Set a recieve handler
                console.log("RecieveHandler")
                rawData = new Uint8Array(data);
                
                processData();
            });
            /*
            poller = setInterval(function() {
                
                
            }, 50);*/
        });
    };
/*
Function that triggers when the device is removed
*/
    ext._deviceRemoved = function(dev) {
        if (device != dev) return;
        if (poller) poller = clearInterval(poller);
        device = null;
    };
/*
Function that triggers when the website is closed
*/
    ext._shutdown = function() {
        if (device) device.close();
        if (poller) poller = clearInterval(poller);
        device = null;
    };
/*
Function to send the status to the webview
*/
    ext._getStatus = function() {
        if (!device) return {
            status: 1,
            msg: 'PowerScratch disconnected'
        };
        if (watchdog) return {
            status: 1,
            msg: 'Probing for PowerScratch'
        };
        return {
            status: 2,
            msg: 'PowerScratch connected'
        };
    }
/*
Function to convert 4 bytes to one Unsigned Long
*/
    function toUint(b1, b2, b3, b4) {
        var code = 0;
        code += b1 * Math.pow(2, 24);
        code += b2 * Math.pow(2, 16);
        code += b3 * Math.pow(2, 8);
        code += b4;
        return code;
    }
/*
Function to convert one unsigned long to 4 bytes
*/
    function toBytesInt32(num) {
        arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
        view = new DataView(arr);
        view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
        return arr;
    }
/*
Set the 'code' and type of the remote
*/
    ext.setRemote = function(type, code) {
        var type_code = 0;
        switch (type) {
            case "KaKu":
                type_code = 0;
                break;
            case "Blokker":
                type_code = 1;
                break;
            case "Action":
                type_code = 2;
                break;
        }
        //'T',type_code
        code_bytes = new Uint8Array(toBytesInt32(code));
        console.log(code_bytes[0]);
        console.log(toUint(code_bytes[0], code_bytes[1], code_bytes[2], code_bytes[3]));
        var pingOn = new Uint8Array([84, type_code, code_bytes[0], code_bytes[1], code_bytes[2], code_bytes[3], 10]);
        device.send(pingOn.buffer);
        console.log(pingOn);
    }
/*
Set the state of the reciever (on/off)
*/
    ext.setState = function(name, val) {
        stat = (val == "on") ? 1 : 0;
        name = name - 1;

        console.log(name);
        //'S','0'+name,'0'+stat,'\n'
        var pingOn = new Uint8Array([83, 48 + name, 48 + stat, 10]);
        device.send(pingOn.buffer);
    }
    var descriptor = {
        blocks: [
            [' ', 'Turn switch %n %m.state', 'setState', 1, 'on'],
            [' ', 'Set remote of %m.type to code %n', 'setRemote', 'KaKu', 20231262]
        ],
        menus: {
            state: ['on', 'off'],
            type: ['KaKu', 'Action', 'Blokker', 'Elro']
        },
        url: ''
    };
    ScratchExtensions.register('powerScratch', descriptor, ext, {
        type: 'serial'
    });
})({});
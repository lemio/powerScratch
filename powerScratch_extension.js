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
    var type = 0;
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
    function send_kaku(adress,state){
        var pingOn = new Uint8Array([83, 48 + adress, 48 + state, 10]);
        device.send(pingOn.buffer);
    }
    function send_FHT_7901(adress,state){
        console.log(" send_FHT_7901");
        lookup = [[ 16762193
                ,   16762196],
                [   16765265,
                    16765268
                ],[ 16766033
                ,   16766036
                ],[ 16766225
                ,   16766228
                ],[ 16766273
                ,   16766276
                ]];/*
        Aon = 16762196      FFC554  1100010101010100
        Aoff = 16762193     FFC551  1100010101010001
        Bon = 16765268      FFD154  1101000101010100
        Boff = 16765265     FFD151  1101000101010001
        Con = 16766036      FFD454  
        Coff = 16766033     FFD451
        Don = 16766228      FFD514
        Doff = 16766225     FFD511
        Eon = 16766276      FFD544
        Eoff = 16766273     FFD541
        */
        sendRaw(lookup[adress][state],24)
    }
    sendRaw = function (code,bit){
        console.log("send",code)
        code_bytes = new Uint8Array(toBytesInt32(code));
        console.log(code_bytes);
        var pingOn = new Uint8Array([82, bit, code_bytes[0], code_bytes[1], code_bytes[2], code_bytes[3], 10]);
        device.send(pingOn.buffer);

    }
    function stringToTypeCode(type_name){
        /*switch (type) {
            case "KaKu":
                return 0;
                break;
            case "Diamant (FHT-7901)":
                return 1;
                break;
            case "Action":
                return 2;
                break;
        }*/
        return 1;
    }
   /* ext.setRemote = function(_type, code) {
        type= _type;
        var type_code = stringToTypeCode(type);
        
        //'T',type_code
        code_bytes = new Uint8Array(toBytesInt32(code));
        console.log(code_bytes[0]);
        console.log(toUint(code_bytes[0], code_bytes[1], code_bytes[2], code_bytes[3]));
        var pingOn = new Uint8Array([84, type_code, code_bytes[0], code_bytes[1], code_bytes[2], code_bytes[3], 10]);
        device.send(pingOn.buffer);
        console.log(pingOn);
    }*/

/*
Set the state of the reciever (on/off)
*/
    ext.setState = function(name, val) {
/*
        stat = (val == "on") ? 1 : 0;
        name = name.charCodeAt(0) - "A".charCodeAt(0);
        switch (type){
            case "Diamant (FHT-7901)":*/
                console.log("set diamant ",name,stat)
                send_FHT_7901(name,stat);
            /*break;
            case "KaKu":
                console.log("set KAKU ",name,stat)
                send_kaku(name,stat);
            break;
        }
        //'S','0'+name,'0'+stat,'\n'
        */
    }
    var descriptor = {
        blocks: [
            [' ', 'Turn switch %m.alpha %m.state', 'setState', "A", 'on'],
            //[' ', 'Set remote of %m.type to code %n', 'setRemote', 'Diamant (FHT-7901)', 20231262]
        ],
        menus: {
            state: ['on', 'off'],
            alpha: ['A','B','C','D','E'],
            type: ['Diamant (FHT-7901)','KaKu', 'Action', 'Blokker', 'Elro']
        },
        url: 'http://www.codekids.nl/powerscratch/'
    };
    ScratchExtensions.register('powerScratch', descriptor, ext, {
        type: 'serial'
    });
})({});
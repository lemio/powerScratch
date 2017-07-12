/*
@title PowerScratch:    Control high voltage devices using scratch.
@author:                Geert Roumen
@website:
@source:                Based on: https://github.com/LLK/scratchx/blob/master/picoExtension.js

This code sends a message to an arduino connected to a 433Mhz sender, to control a FHT_7901 reciever.

*/
(function(ext) {
    var device = null;
    var rawData = null;
    var stat = false;
    var type = 0;
    var inputArray = [];
    var current_channel = 0;
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
/*
 SETTING | CHANNEL | ON/OFF
F    F    D/C  4/5  5    4/1
1111 1111 1101 0100 0101 0100
0111 1111 1101 0100 0101 0100
0111 1111 1101 0100 0101 0100
0111 1111 1100 0101 0101 0100

011111111100010101010100
011111111100010101010001
*/
/*
Setting is the physical DIP switch in the back
Channel is the channel A-E on the remote (the physcial DIP switch in the receiver)
State is a boolean value (if the revceiver should be on or off)
*/
/*
function makeCode(setting,channel,state){
  if (state == 1){
    stateByte = 0x54;
  }else{
    stateByte = 0x51;
  }
  if (channel == 0){
    channelByte = 0xD4;
  }
  if (channel == 1){
    channelByte = 0xC5;
  }
  if (setting == )
  settingByte = 0xFF
  0x010000*settingByte+0x000100*channelByte+0x000001*stateByte
}*/
    function send_FHT_7901(channel,adress,state){

        lookup = [[[ 16762193
                ,   16762196],
                [   16765265,
                    16765268
                ],[ 16766033
                ,   16766036
                ],[ 16766225
                ,   16766228
                
                ],[ 16766273
                ,   16766276
              ]],
[//	on		off
/*A*/	[8373585, 8373588],
/*B*/	[8376657, 8376660],
/*C*/	[8377425, 8377428],
/*D*/	[8377617, 8377620],
/*E*/	[8377665, 8377668]
]];

        console.log(" send_FHT_7901" , channel ,adress, state, lookup[channel][adress][state]);
            if (lookup[channel][adress][state] == undefined){
                console.log("unable to send message to this adress, adress unavailable");
            }else{
                sendRaw(lookup[channel][adress][state],24)
            }

    }
    sendRaw = function (code,bit){
        console.log("send",code)
        code_bytes = new Uint8Array(toBytesInt32(code));
        console.log(code_bytes);
        var pingOn = new Uint8Array([82, bit, code_bytes[0], code_bytes[1], code_bytes[2], code_bytes[3], 10]);
        device.send(pingOn.buffer);

    }
    ext.setChannel = function (channel){
      current_channel = Number(channel.charAt(7));
    }
    ext.setState = function(name, val) {

        stat = (val == "on") ? 1 : 0;
        name = name.charCodeAt(0) - "A".charCodeAt(0);
        console.log("set diamant ",name,stat);
        send_FHT_7901(current_channel,name,stat);
    }
    var descriptor = {
        blocks: [
            [' ', 'Turn switch %m.alpha %m.state', 'setState', "A", 'on'],
            [' ', 'Set channel to %m.channel', 'setChannel', "CHANNEL0"]
        ],
        menus: {
            state: ['on', 'off'],
            alpha: ['A','B','C','D','E'],
            channel: ["CHANNEL0","CHANNEL1"],
            type: ['Diamant (FHT-7901)','KaKu', 'Action', 'Blokker', 'Elro']
        },
        url: 'http://www.codekids.nl/powerscratch/'
    };
    ScratchExtensions.register('powerScratch', descriptor, ext, {
        type: 'serial'
    });
})({});

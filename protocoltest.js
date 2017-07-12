/*
Setting is the physical DIP switch in the back
Channel is the channel A-E on the remote (the physcial DIP switch in the receiver)
State is a boolean value (if the revceiver should be on or off)
*/
lookup = [ 16762193,
         16762196,
         16765265,
         16765268,
         16766033,
         16766036,
         16766225,
         16766228,
         16766273,
         16766276
        ];
        String.prototype.splice = function(idx, rem, str) {
            return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
        };
        groups = 5;
array = lookup.map((x) => x.toString(2).splice(groups-1,0," ").splice(groups*2-1,0," ").splice(groups*3-1,0," ").splice(groups*4-1,0," ").splice(groups*5-1,0," ").splice(groups*6-1,0," ").splice(groups*7-1,0," ").splice(groups*8,0," "))

console.log(array);


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
  //if (setting == )
  settingByte = 0xFF
  0x010000*settingByte+0x000100*channelByte+0x000001*stateByte
}
    function send_FHT_7901(adress,state){


        console.log(" send_FHT_7901" , adress, state, lookup[adress][state]);
            if (lookup[adress][state] == undefined){
                console.log("unable to send message to this adress, adress unavailable");
            }else{
                sendRaw(lookup[adress][state],24)
            }

    }

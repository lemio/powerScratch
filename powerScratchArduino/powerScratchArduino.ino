#include <RCSwitch.h>
RCSwitch mySwitch = RCSwitch();
#include <NewRemoteTransmitter.h>
const byte SEND_PIN = 11;//USE THE MOSI PIN AS OUTPUT

NewRemoteTransmitter transmitter(0, SEND_PIN, 260, 3);;
const byte SET_TYPE = 'T';
const byte SET_SWITCH = 'S';//83
const byte SET_RAW = 'R';
const byte END_MSG = '\n';
const byte TYPE_KAKU = 0;
const byte TYPE_BLOKKER = 1;
const byte TYPE_ACTION = 2;
const byte TYPE_ELRO = 3;
const byte TYPE__ = 3;
const byte RECIEVING_TYPE = 1;
const byte RECIEVING_SWITCH = 2;
const byte RECIEVING_RAW = 3;
byte type = TYPE_KAKU;
int i = 0;
byte serialBuffer[6];
byte serialStatus = 0;
unsigned long code = 0;
void setup() {
  Serial.begin(57600);
  mySwitch.enableTransmit(SEND_PIN);
}

void loop() {

  /*
     5522773
     5522772
  */

  //mySwitch.send(5522772,24)
  while (Serial.available()) {
    byte readByte = Serial.read();
 
    
    //When the message is finished (got a newline character)
    if (readByte == END_MSG) {
      switch (serialStatus) {
        case RECIEVING_TYPE:
          code = 0;
          code += serialBuffer[1] * pow(2, 24);
          code += serialBuffer[2] * pow(2, 16);
          code += serialBuffer[3] * pow(2, 8);
          code += serialBuffer[4];

          //code = *(2^24) + serialBuffer[2]*(2^16) + serialBuffer[3]*(2^8) + serialBuffer[4];
          if (serialBuffer[0] == TYPE_KAKU) {
            transmitter.setAdress(code);
            Serial.print("KAKU with code [");
            Serial.print(serialBuffer[1]);
            Serial.print(",");
            Serial.print(serialBuffer[2]);
            Serial.print(",");
            Serial.print(serialBuffer[3]);
            Serial.print(",");
            Serial.print(serialBuffer[4]);
            Serial.print("] ");
            Serial.print(code);
          } else if (serialBuffer[0] == TYPE_KAKU) {

          } else if (serialBuffer[0] == TYPE_KAKU) {

          } else if (serialBuffer[0] == TYPE_KAKU) {

          } else if (serialBuffer[0] == TYPE_KAKU) {

          }
          break;
        case RECIEVING_RAW:
          {
          unsigned long raw = 0;
          raw += serialBuffer[1] * pow(2, 24);
          raw += serialBuffer[2] * pow(2, 16);
          raw += serialBuffer[3] * pow(2, 8);
          raw += serialBuffer[4];

          //code = *(2^24) + serialBuffer[2]*(2^16) + serialBuffer[3]*(2^8) + serialBuffer[4];
          mySwitch.send(raw, serialBuffer[0]);
          Serial.print("send RAW with code [");
          Serial.print(serialBuffer[1]);
          Serial.print(",");
          Serial.print(serialBuffer[2]);
          Serial.print(",");
          Serial.print(serialBuffer[3]);
          Serial.print(",");
          Serial.print(serialBuffer[4]);
          Serial.print("] ");
          Serial.print(raw);
      }
        break;
        case RECIEVING_SWITCH:
          digitalWrite(13, serialBuffer[1] == '1');
          if (type == TYPE_KAKU) {
            Serial.print(serialBuffer[0] - '0');
            Serial.print(" to ");
            Serial.println(serialBuffer[1] - '0');
            transmitter.sendUnit(serialBuffer[0] - '0', serialBuffer[1] - '0');
          }
          break;
      }
      serialStatus = 0;
      i = 0;
    }else{
         if (serialStatus != 0) {
      serialBuffer[i] = readByte;
      i++;
    }else{
    switch(readByte){
      case SET_TYPE:
        Serial.print("Set device type ");
        serialStatus = RECIEVING_TYPE;
      break;
      case SET_SWITCH:
        Serial.print("Set switch ");
        serialStatus = RECIEVING_SWITCH;
      break;
      case SET_RAW:
        Serial.print("Send RAW message ");
        serialStatus = RECIEVING_RAW;
      break;
      }
    }
    }
  }
}

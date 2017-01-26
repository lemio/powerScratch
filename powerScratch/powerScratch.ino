/*
@title PowerScratch:    Control high voltage devices using scratch.
@author:                Geert Roumen
@website:               
@source:               

*/
#include <NewRemoteTransmitter.h>
NewRemoteTransmitter transmitter(0, 4, 260, 3);; 
const byte SET_TYPE = 'T';
const byte SET_SWITCH = 'S';//83
const byte END_MSG = '\n';
const byte TYPE_KAKU = 0;
const byte TYPE_BLOKKER = 1;
const byte TYPE_ACTION = 2;
const byte TYPE_ELRO = 3;
const byte TYPE__ = 3;
const byte RECIEVING_TYPE = 1;
const byte RECIEVING_SWITCH = 2;
byte type = TYPE_KAKU;
int i=0;
byte serialBuffer[6];
byte serialStatus = -1;
unsigned long code = 0;

void setup() {
  pinMode(18,OUTPUT);
  pinMode(21,OUTPUT);
  pinMode(2,OUTPUT);
  pinMode(3,OUTPUT);
  pinMode(4,OUTPUT);
  pinMode(13,OUTPUT);
  digitalWrite(18,LOW);
  digitalWrite(21,HIGH);
  digitalWrite(2,LOW);
  digitalWrite(3,HIGH);
  Serial.begin(57600);
}

void loop() {
  while (Serial.available()) {
        byte readByte = Serial.read();
        if (serialStatus == RECIEVING_TYPE){
          serialBuffer[i] = readByte;
          i++;
        }
        if (serialStatus == RECIEVING_SWITCH){
           serialBuffer[i] = readByte;
           i++;
        }
        //When the message is finished (got a newline character)
        if (readByte == END_MSG){
          switch(serialStatus){
              case RECIEVING_TYPE:
              code = 0;
              code += serialBuffer[1]*pow(2,24);
              code += serialBuffer[2]*pow(2,16);
              code += serialBuffer[3]*pow(2,8);
              code += serialBuffer[4];

                //code = *(2^24) + serialBuffer[2]*(2^16) + serialBuffer[3]*(2^8) + serialBuffer[4];
                if (serialBuffer[0] == TYPE_KAKU){
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
                  }else if (serialBuffer[0] == TYPE_KAKU){
                             
                  }else if (serialBuffer[0] == TYPE_KAKU){
                             
                  }else if (serialBuffer[0] == TYPE_KAKU){
                             
                  }else if (serialBuffer[0] == TYPE_KAKU){
                             
                  }
              break;
              case RECIEVING_SWITCH:
              digitalWrite(13,serialBuffer[1]=='1');
                if (type== TYPE_KAKU){
                    Serial.print(serialBuffer[0]-'0');
                    Serial.print(" to ");
                    Serial.println(serialBuffer[1] -'0');
                    transmitter.sendUnit(serialBuffer[0]-'0',serialBuffer[1]-'0');
                  }
              break;
            }
          serialStatus = -1;  
          i = 0;
        }
        if (readByte == SET_TYPE){
          Serial.print("Set device type ");
          serialStatus = RECIEVING_TYPE;
        }
        if (readByte == SET_SWITCH){
          Serial.print("Set switch ");
          serialStatus = RECIEVING_SWITCH;
        }
  }
}

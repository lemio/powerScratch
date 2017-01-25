# Powerscratch
A tool that gives the power of 230V to scratch

## How to use powerscratch

Program the Arduino

Solder/make the connection to a 433Mhz module

(Check your unique code off your reciever (this can be done by using a reciever and [this sketch], or ask your teacher/supplier))

Go to:

http://scratchx.org/?url=https://lemio.github.io/powerScratch/powerScratch_extension.js

And start playing, let us see where you come up with; controlling karts, vacuum cleaners, your coffee machine, traffic lights...

## Protocol description


| Function      | ASCII         | Dec   |
| ------------- |:-------------:| -----:|
| Set type      | 'S'           | 83    |
| Set reciever  | 'T'           | 84    |
| End message   | '\n'          | 84    |


|SET_TYPE|TYPE|C0|C1|C2|C3|END_MESSAGE|
|:-      |:-  |:-|:-|:-|:-|:-         |
|'S'     |0   |..|..|..|..|'\n'       |

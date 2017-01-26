# Powerscratch
A tool that gives the power of 230V to scratch

## How to use powerscratch

Program the Arduino

Solder/make the connection to a 433Mhz module

(Check your unique code of your remote (this can be done by using a reciever and [this sketch], or ask your teacher/supplier))

Go to:

http://scratchx.org/?url=https://lemio.github.io/powerScratch/powerScratch_extension.js

And start playing, let us see where you come up with; controlling karts, vacuum cleaners, your coffee machine, traffic lights...

## Protocol description

### Pre-defined bytes

| Function      | ASCII         | Dec   | Description |
| ------------- |:-------------:| -----:|:---|
| Set reciever  | 'S'           | 83    |Set the status of a certain switch|
| Set type      | 'T'           | 84    |Set the type and code to use when switching|
| End message   | '\n'          | 84    |end a message|

### Sending messages to recievers

|SET_RECIEVER|CHANNEL|STATE|END_MESSAGE|
|:---    |:---  |:---|:--         |
|'S'     |'0'   |'1' |'\n'       |

#### Channel
This is the channel on the remote usually (0,1,2,3)

#### State
The state of the remoteSwitch (0,1)

### Setting the type and code of the 'virtual' remote

|SET_TYPE|TYPE|C0|C1|C2|C3|END_MESSAGE|
|:---      |:---  |:---|:----|:---|:---|:---         |
|'T'     |0   |..|..|..|..|'\n'       |

#### Type
This is the code of the type that is being used

| Code | Type | URL |
|:---|:---|:---|
|0|KlikAanKlikuit|[Gamma.nl](https://www.gamma.nl/assortiment/klikaanklikuit-schakelset-apa3-1500r/p/B364802?q=fh_location%3d%2f%2fcatalog01%2fnl_NL%2f%24s%3dklikaanklikuit%2fcategories%3C%7bcatalog01_catverlichting%7d%2ffh_item_type%3E%7bproduct%7d%26fh_start_index%3d0%26fh_view_size%3d20%26fh_refview%3dsearch%26fh_lister_pos%3d1%26date_time%3d20170125T000000%26fh_modification%3d%26fh_sort%3d-online_status%252C-%2524r1%26fh_secondid%3db_product_b021364802)

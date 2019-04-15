<h1 align="center">
	<img width="250" src="docs/icon_128.png" alt="BitsyLED">
</h1>
<h1 align="center">
	BitsyLED
</h1>
<p align="center">
	A minimal firmware and configurator to drive RGB leds.
</h1>

---


# Introduction

BitsyLED is a minimal firmware to drive RGB LED's (WS2811, WS2812, NeoPixels, etc). It's designed for anything RC but also can be used f

BitsyLED is currently in development many things may change however the current version is usable.

# Status

ALPHA - Use in production with caution.


# Installation

The alpha version 


## Why another OSD?

There are plenty of OSD options out there but I needed an OSD that was easy to maintain but still had all the features that I wanted. That's why I created BitsyOSD - a minimal configuration OSD that works right of the "box" (yes, there is a box that you can print on your 3D printer).

The OSD itself has a fixed layout that provides all essential information and only requires configuration of the GPS. 

BitsyOSD supports the standard NEMA GPS as well DJI's Naza protocol.

BitsyOSD also supports no GPS and displays GPS unrelated values - making BitsyOSD a all around solution.


## Features

Currently BitsyOSD implements the following values in a fixed layout that is configurable and can be easily adapted to your needs:

* Speed 
* Altitude (ASL, AGL)
* Heading (AGH, BGH)
* Simple Variometer
* Traveled Distance
* Home Heading Indicator 
* Home Distance
* Flight Timer
* GPS Statuses
* GPS Coordinates
* Battery 1 Voltage Monitoring
* Battery 2 Voltage Monitoring
* Low Battery Alerts
* RSSI (*)
* New in 1.4: No GPS Mode - enables a super minimal OSD mode

**Please be aware that BitsyOSD doesn't have any outside configuration possibilities and all setup needs to be done via the code base**

![Screen1](https://github.com/FPVTools/BitsyOSD/blob/master/docs/00123333.jpg)
![Screen2](https://github.com/FPVTools/BitsyOSD/blob/master/docs/bitsyosd-main-screen.png)


## Hardware Requirements

You need a MinimOSD (duh!) and a GPS. Currently BitsyOSD supports any NEMA compatible GPS and the DJI Naza GPS.

I highly recommend to get the Micro MinimOSD Hardware which contains better filtering and additional inputs for Battery monitoring in a very compact size.

![Image](http://static.rcgroups.net/forums/attachments/1/4/2/1/t7471848-198-thumb-1-15-2015_6-43-50_am.jpg?d=1421342036)

Get them from ReadyToFlyQuads (http://www.readytoflyquads.com/micro-minimosd).

If you have a DJI Naza Controller, you can use an Y-Cable to split the cable from the Naza GPS and directly connect it to the MinimOSD.


## Get Started

You don't need to be an code expert but I assume that you have the following things ready to go:

* Arduino IDE installed on your computer
* NodeJS installed
* GIT installed
* MinimOSD hardware
* USB FTDI TTL serial adapter
* GPS Module and connection cable

Next you need to download this project. Navigate to a directory where you want to keep the BitsyOSD code and clone the project via git.

```shell
git clone https://github.com/FPVTools/BitsyOSD
````

A quick hint: Connect the MinimOSD to a TV if you want to see whats going on with your MinimOSD during the setup process.


### Install Libraries

BitsyOSD is using several libraries that need to be installed to your Arduino IDE. Copy and paste all of the libraries found in ```libraries/``` to your Arduino's IDE libraries folder and restart the Arduino IDE. 

Learn more how to install libraries in Arduino at [http://arduino.cc/en/Guide/Libraries]


### Upload the font

BitsyOSD is using a custom font that needs to be uploaded to the MinimOSD. The entire font upload process is outside of the main code base to keep the size small. 

**Note: You need to redo this process if the font set changes in future firmware updates**

Connect the MinimOSD via the USB FTDI TTL serial adapter to your computer and upload the file ```font/fontupload/fontupload.ino``` via the Arduino IDE to the MinimOSD. If you have a screen connected, you should be able to see the current font set on it.

Open a command console and navigate to the folder ```font/```. Execute the following command and follow the on-screen instructions.

```shell
node uploadfont.js
```

This process may take some time and you should see the new font set on your display if you have a screen connected.

![Font](https://github.com/FPVTools/BitsyOSD/blob/master/docs/bitsyosd-font-upload.jpg)

### Upload the firmware

Make sure the MinimOSD is connected to your computer via the USB FTDI TTL serial adapter. Open the file ```BitsyOSD/BitsyOSD.ino``` and click ```Upload``` in the Arduino IDE.

If you installed the libraries as well uploaded the font correctly, you now have a working MinimOSD with BitsyOSD. 

## Breakout Board

This project also includes the break-out board schematics for Eagle. The break-out board follows the standard flight controller size of 32x32mm and routes all necessary hook up points to one header.

![Board](https://github.com/FPVTools/BitsyOSD/blob/master/docs/bitsyosd-pcb-board.png)

Go to the board directory to learn more.

## License

Copyright (c) 2017.  All rights reserved.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>

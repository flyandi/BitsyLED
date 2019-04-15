<h1 align="center">
	<img width="250" src="docs/bitsyled@2x.png" alt="BitsyLED">
	<br />
	BitsyLED 
</h1>
<p align="center">
	A minimal firmware and configurator to drive RGB LED's
</p>

---

# Introduction

BitsyLED is a minimal firmware to drive RGB LED's (WS2811, WS2812, NeoPixels, etc). It's designed for anything RC but also can be used for other projects including Christmas lights, Lego's, or even your real car.

BitsyLED is divided into two parts: The Firmware and the Configurator. 


## Firmware

The firmware is designed for the BitsyLED board but also can be run on any arduino compatible board.

The default firmware configuration is setup for the BitsyLED board which sports a 16bit ATTINY84 that supports up to 5 selectable configurations. Each configuration can have 3 data strands with up to 10 LED's per strand. 

The firmware can be reconfigured as needed.

## Configurator

The configurator is a visual tool that allows easy setup of LED's and supports various effects such blinking, strobe and pulsing.

It allows to setup different selectable ranges which can be controlled via an PWM RC signal, a 10k Analog Potentiometer or based on Time (TBD).

<img src="docs/screen_1.png">

The configurator is available currently only as unpacked Chrome extension that needs to be installed manually. Check the release tab for the files.



## Status

ALPHA - Use in production with caution.

We are still in the process of finalizing many aspects of this project but it is generally usable.


# Installation

Follow the installation notes for installing an unpacked Chrome application.

You will find the latest release in the release tab.


## License

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

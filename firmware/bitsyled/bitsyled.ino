/**
   ___  _ __           __   _______ 
  / _ )(_) /____ __ __/ /  / __/ _ \
 / _  / / __(_-</ // / /__/ _// // /
/____/_/\__/___/\_, /____/___/____/ 
               /___/                


BitsyLED - A minimalistic firmware for driving and controlling RGB LED's

Designed for RC Cars, Multicopters, Airplanes, UGV's and anything in between

Learn more at http://github.com/flyandi/BitysLED

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

**/

/**
 * @todo rewrite data structure to support muxing of different ranges
 */

/**
 * @imports
 */

#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
#include <EEPROM.h>
#include <avr/power.h>
#include <avr/io.h>
#include <avr/boot.h>
#include <avr/interrupt.h>
#include <avr/pgmspace.h>
#include <MemoryFree.h>

/**
 * @version
 */
#define VERSION 100

/**
 * @board configuration
 */
#define BOARD 0x02          // BitsyLED
//#define BOARD 0x04        // Arduino
//#define BOARD 0x05        // ESP32, ESP8266

/**
 * @firmware flags
 */
#define ENABLE_LIVE_CHANNEL


/** 
 * @led configuration
 */
#define NUM_RANGES 5
#define NUM_STRANDS 3
#define NUM_LEDS 10
#define OTHER_PIN 1     
#define LEFT_PIN 2
#define RIGHT_PIN 10

/**
 * @rc configuration
 */
#define RC_PIN 3

/**
 * @serial configuration
 */
#define RX_PIN 0    // dual use pin on boot up
#define TX_PIN 1
#define SERIAL_COMMAND_STATUS 0x01
#define SERIAL_COMMAND_UPDATE 0xFF
#define SERIAL_COMMAND_CHANNEL 0x03
#define SERIAL_COMMAND_MARKER 0x04
#define SERIAL_COMMAND_DONE 0x05

/**
 * @constants
 */
#define SERIAL_BUFFER 25
#define SERIAL_TIMEOUT 500
#define MODE_SERIAL 0
#define MODE_RUN 1
#define PATTERN_OFF 0
#define PATTERN_SOLID 1
#define PATTERN_BLINK 2
#define PATTERN_STROBE 3
#define PATTERN_PULSE 4
#define SPEED_FASTEST 50
#define SPEED_FASTER 150
#define SPEED_FAST 250
#define SPEED_NORMAL 500
#define SPEED_SLOW 750
#define SPEED_MORESLOW 1000
#define SPEED_SLOWEST 1500
#define MODE_RC 0
#define MODE_ANALOG 1
#define MODE_TIMER 2
#define SAFE_CHANNEL 100



/**
 * @globals
 */
uint8_t serial_action = false;
uint8_t mode = MODE_SERIAL;
uint8_t flash = false;
uint16_t channel;
uint16_t channel_a;
uint16_t timers_c[7] = {SPEED_FASTEST, SPEED_FASTER, SPEED_FAST, SPEED_NORMAL, SPEED_SLOW, SPEED_MORESLOW, SPEED_SLOWEST};
uint16_t timers_s[7] = {0, 0, 0, 0, 0, 0};
uint32_t timers_t[7] = {0, 0, 0, 0, 0, 0};
uint8_t header_size = 0;
uint8_t header_mode = MODE_RC;
uint8_t header_num_leds = 0;
uint8_t header_num_ranges = 0;
uint8_t header_num_strands = 0;
uint8_t range = 0;
uint16_t range_size = 0;
uint8_t strands_l[NUM_STRANDS][NUM_LEDS];
uint8_t range_a = 0;
uint8_t ranges_l[NUM_RANGES][3]; // min, max

/**
 * @classes
 */
// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
//   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)
Adafruit_NeoPixel strands_a[NUM_STRANDS] = {
  Adafruit_NeoPixel(NUM_LEDS, LEFT_PIN, NEO_GRB + NEO_KHZ400),
  Adafruit_NeoPixel(NUM_LEDS, RIGHT_PIN, NEO_GRB + NEO_KHZ400),
  Adafruit_NeoPixel(NUM_LEDS, OTHER_PIN, NEO_GRB + NEO_KHZ400) 
};

SoftwareSerial serial(RX_PIN, TX_PIN);


/**
 * @byteToWord
 */
union batow {
  byte a[2];
  uint16_t w;
};


/**
 * @bex
 * Extracts bits from little as big endian
 */
uint8_t bexd(uint16_t n, uint8_t o, uint8_t l, uint8_t d) {
  uint8_t v = 0;
  uint8_t ob = d - o;
  for (uint8_t b=ob; b > (ob-l); b--) v = ( v << 1 ) | ( 0x0001 & ( n >> (b-1) ) );
  return v;
}
// 16 bit
uint8_t bexw(uint16_t n, uint8_t o, uint8_t l) {return bexd(n, o, l, 16);}
// 8 bit
uint8_t bexb(uint8_t n, uint8_t o, uint8_t l) {return bexd(n, o, l, 8);}


/**
 * @prepare_led
 * Bit
 * 0      Active / Yes/No
 * 1      Mirror   Inverted
 * 2..4   Speed 
 * 5..7   Pattern
 */
uint8_t prepare_led(uint16_t n) {
  return((bexw(n, 12, 3) & 7) << 5) | ((bexw(n, 9, 3) & 7) << 2) | (((bexw(n, 15, 1) == 1 ? 1 : 0) & 7) << 1 ) | ((0 & 7) << 0);
} 


/**
 * @led_address
 */
uint16_t led_address(uint8_t n, uint8_t l) {
  return header_size + (range * range_size) + (n * header_num_strands) + (l * 2);
}

/**
 * @process_led
 */
void process_led(uint8_t n, uint8_t l) {

  uint8_t pattern = bexb(strands_l[n][l], 3, 3);
  uint8_t cl[3] = {0, 0, 0};

  if(pattern > PATTERN_OFF) { 
    uint8_t ca = 1;
    
    if(pattern > PATTERN_SOLID) {

      uint8_t speed = bexb(strands_l[n][l], 0, 3);
      uint8_t mirror = bexb(strands_l[n][l], 6, 1);
      ca = (!mirror && timers_s[speed]) || (mirror && !timers_s[speed]) ? 1 : 0;
      
      if(pattern == PATTERN_STROBE) {
        if(ca) {
          ca = !timers_s[0];
        }
      }
    }

    if(ca) {
      batow c;
      uint16_t addr = led_address(n, l);
      c.a[0] = EEPROM.read(addr);
      c.a[1] = EEPROM.read(addr + 1);
      cl[0] = map(bexw(c.w, 0, 3), 0, 7, 0, 255); // r
      cl[1] = map(bexw(c.w, 3, 3), 0, 7, 0, 255); // g
      cl[2] = map(bexw(c.w, 6, 3), 0, 7, 0, 255); // b
    }
  }

  strands_a[n].setPixelColor(l, cl[0], cl[1], cl[2]);
}



/**
 * @recover
 * @todo overflow protection
 */
void recover() {

  // header
  // hz=3 + (ranges * 4) + (strands)
  header_num_leds = EEPROM.read(0);
  header_num_ranges = EEPROM.read(1);
  header_num_strands = EEPROM.read(2); 
  header_mode = EEPROM.read(3); 
  header_size = 4 + (2 * header_num_ranges) + header_num_strands;

  // ranges
  range_size = header_num_leds * header_num_strands * 2;

  uint8_t n, l, a;
  batow c;
  for(n = 0; n < header_num_ranges; n++) {
    for(l = 0; l < 2; l++) {
      a = 4 + (2 * n) + l;
      ranges_l[n][l] = EEPROM.read(a);
    }
  }

  mux_range();
}


/**
 * @mux_range
 */
void mux_range() {

  // process leds
  uint8_t n, l;
  uint16_t address;
 

  for(n = 0; n < header_num_strands; n++) {
    for(l = 0; l < header_num_leds; l++) {
      address = led_address(n, l);
      batow c;
      c.a[0] = EEPROM.read(address);
      c.a[1] = EEPROM.read(address + 1);
      strands_l[n][l] = prepare_led(c.w);
    }
  }
}



/*
Protocol:
..command
byte    command: update
..header
byte    <count(leds)>       rem: led my be dictated by firmware
byte    <count(ranges)>     rem: ranges may be dictated by firmware
byte    <count(strands)>    rem: strands may be dictated by firmware
byte    <mode>  
.. ranges
byte    <min>
byte    <max>
..strands
byte    <pin>
..leds
struct  <led[0..n]>
led =   <r, g, b, mirror, pattern, speed>
*/

void begin_update() {

  uint32_t timeout = millis();
  uint8_t wait = 1, i, a, b;
  uint16_t address = 0;
   

  while(wait) {
    a = serial.available();
    if(a > 0) {
      while(serial.available()) {
        b = serial.read();
        EEPROM.write(address, b);
        address++;
        timeout = millis();
      }
      if(serial.available() == 0) {
        serial.write(SERIAL_COMMAND_MARKER); // send maker that we read the buffer
      }
    } else {
      wait = millis() - timeout < SERIAL_TIMEOUT;
    }
  }
  uint8_t r[3] = {SERIAL_COMMAND_DONE, lowByte(address), highByte(address)};
  serial.write(r, 3);

  recover();
}

/**
 * @void read_serial 
 */
void read_serial() {

  if(serial_action) return;
  serial_action = true; // lock
 
  uint8_t cmd = serial.read();

  if(cmd == SERIAL_COMMAND_STATUS) { 
    send_status();
  } else if(cmd == SERIAL_COMMAND_CHANNEL) { 
    send_channel();
  } else if(cmd == SERIAL_COMMAND_UPDATE) {
    begin_update();
  }

  serial_action = false;
}



/**
 * @void read_channel 
 */
void read_channel() {
  uint16_t c = pulseIn(RC_PIN, HIGH, 25000);
  if(c + SAFE_CHANNEL > channel || c - SAFE_CHANNEL < channel) {
    channel = c;
    process_ranges();
  }
}

/**
 * @void process_Ranged
 * @todo mux
 */
void process_ranges() {
  uint8_t n;
  
  for(n = 0; n < header_num_ranges; n++) {
    ranges_l[n][2] = (channel >= (ranges_l[n][0] * 10) && channel <= (ranges_l[n][1] * 10));
    if(ranges_l[n][2] && range != n) {
      range = n;
      mux_range();
    }
  }

  range_a = false;
  for(n = 0; n < header_num_ranges; n++) {
    if(ranges_l[n][2]) range_a = true;
  }

  if(!range_a) {
      for(n = 0; n < NUM_STRANDS; n++) {
      strands_a[n].clear();
    }
  }

}

/**
 * @void send_status
 * Sends status information about the board
 * 0    byte      Command
 * 1    byte      Board 
 * 2    byte      Version (LB)
 * 3    byte      Version (HB)
 * 4    byte      Free Memory (LB)
 * 5    byte      Free Memory (HB)
 * 6    byte      Number Ranges supported
 * 7    byte      Number Strands supported / range
 * 8    byte      Nu  mber Leds supported / strand
 * 9    byte      Reserved /0
 * 10   byte      Reserved /0
 * 11   byte      Reserved /0
 * 12   byte      Reserved /0
 */
void send_status() { 
  int m = freeMemory();
  byte data[12] = {SERIAL_COMMAND_STATUS, BOARD, lowByte(VERSION), highByte(VERSION), lowByte(m), highByte(m), NUM_RANGES, NUM_STRANDS, NUM_LEDS, 0, 0, 0};
  serial.write(data, 12);
}

/**
 * @void send_channel
 * Sends channel information (rc signal, or pin)
 * 0    byte      Command
 * 1    byte      low byte of channel
 * 2    byte      high byte of channel
 */
void send_channel() { 
  byte data[3] = {SERIAL_COMMAND_CHANNEL, lowByte(channel), highByte(channel)};
  serial.write(data, 3);
}


/**
 * @setup
 */
void setup() { 
  // always start with remote configuration
  serial.begin(9600);
  pinMode(RC_PIN, INPUT);
  for(uint8_t n = 0; n < NUM_STRANDS; n++) {
    strands_a[n].begin();
    strands_a[n].setBrightness(100);
  }
  recover();
  delay(5);
}
  


/**
 * @loop
 */
void loop() { 

  uint8_t n, l;

  if (serial.available()) {
    read_serial();
  } else {

    read_channel();
  
    for(n = 0; n < 7; n++) {
      if(millis() - timers_c[n] > timers_t[n]) {
        timers_s[n] = !timers_s[n];
        timers_t[n] = millis();
      }
    }

    if(range_a) {
      for(n = 0; n < NUM_STRANDS; n++) {
        for(l = 0; l < NUM_LEDS; l++) {
          process_led(n, l);
        }
      }
    }
  
    for(n = 0; n < NUM_STRANDS; n++) {
      strands_a[n].show();
    }

    // live channel update
    #ifdef ENABLE_LIVE_CHANNEL
      if(!serial_action && timers_s[6] && channel_a != channel) {
        send_channel();
        channel_a = channel;
      }
    #endif

  
  }
  
  delay(15); // save timer
}

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
 * @todo introduce curves for variable patterns, and better pulse support
 */

/**
   @imports
*/

#define _SS_MAX_RX_BUFF 32
#include "config.h"
#include <EEPROM.h>
#include <SoftwareSerial.h>
#include "bitsyled_ws2812.h"

// @version
#define VERSION 103


// @serial configuration
#define SERIAL_COMMAND_STATUS 0
#define SERIAL_COMMAND_UPDATE 1
#define SERIAL_COMMAND_CHANNEL 2
#define SERIAL_COMMAND_MARKER 3
#define SERIAL_COMMAND_DONE 4


// @constants
#define SERIAL_TIMEOUT 1000
#define NUM_SPEEDS 7
#define MODE_RC 0
#define MODE_ANALOG 1
#define MODE_TIMER 2
#define MODE_ALWAYS 3
#define SAFE_CHANNEL 100
#define HEADER_OFFSET 4


// @patterns
#define PATTERN_CURVE_STEPS 5
#define PATTERN_CURVE_RANGE 5
#define PATTERN_OFF 0
#define PATTERN_SOLID 1
#define PATTERN_BLINK 2
#define PATTERN_STROBE 3
#define PATTERN_PULSE 4


/**
   @globals
*/
uint8_t serial_action = false;
uint8_t range_mode = MODE_RC;
cRGB color;
#ifdef USE_SOFT_SERIAL
  SoftwareSerial serial(SERIAL_RX_PIN, SERIAL_TX_PIN);
#else
  HardwareSerial &serial = Serial;
#endif;

// @strands
// @todo because of memory limit, I will keep this static until a future rewrite
#ifdef BOARD_BITSYLED
  WS2812 strands_a[NUM_STRANDS] = {
    WS2812(2), // left
    WS2812(3), // right
    #ifdef ENABLE_LOCAL_DEV 
      WS2812(10)  // other
    #else
      WS2812(1)   // other
    #endif
  };
#endif

#ifdef BOARD_ARDUINO
  WS2812 strands_a[NUM_STRANDS] = {
    WS2812(10), // left
    WS2812(11), // right
    WS2812(12)  // other
  };
#endif

#ifdef USE_STATUS_LED
  bool status_led_b = false;
#endif



// @header
uint8_t header_size;

// @range
uint16_t range_size = 0;
uint8_t range_a = 0;
uint8_t ranges_l[NUM_RANGES][2]; // min, max

// @channel
uint16_t channel = 0;
uint16_t channel_a = 0;

// @timers
uint16_t timers_c[NUM_SPEEDS] = {50, 150, 250, 500, 750, 1000, 1500};
uint32_t timers_t[NUM_SPEEDS];
uint16_t timers_p[NUM_SPEEDS];
uint8_t timers_s = 0;

// @timers for MODE_TIMER
uint32_t timers_tt = 0;
uint8_t timers_tr = 0;

// @curves
uint8_t pulse_curve[PATTERN_CURVE_STEPS] = {0, 1, 2, 3, 4};


/**
   @byteToWord
*/
union batow {
  byte a[2];
  uint16_t w;
};


/**
   @bex
   Extracts bits from little as big endian
*/
uint8_t bexd(uint16_t n, uint8_t o, uint8_t l, uint8_t d) {
  uint8_t v = 0;
  uint8_t ob = d - o;
  for (uint8_t b = ob; b > (ob - l); b--) v = ( v << 1 ) | ( 0x0001 & ( n >> (b - 1) ) );
  return v;
}
// 16 bit
uint8_t bexw(uint16_t n, uint8_t o, uint8_t l) {
  return bexd(n, o, l, 16);
}
// 8 bit
uint8_t bexb(uint8_t n, uint8_t o, uint8_t l) {
  return bexd(n, o, l, 8);
}


/**
   @status_led
   - Turns of when in program
   - Flash super fast when in serial operation
   - Flash within 1.5s when idle
 */
void status_led(bool operation) {
  // status led
  #ifdef USE_STATUS_LED
    if(range_a > 0) {
      digitalWrite(PIN_STATUS_LED, 0); 
    } else if(operation) {
      status_led_b != status_led_b;
      digitalWrite(PIN_STATUS_LED, status_led_b); 
    } else {
      digitalWrite(PIN_STATUS_LED, bitRead(timers_s, 6)); 
    }
  #endif
}


/**
   @prepare_led
   Bit
   0      Active / Yes/No
   1      Mirror   Inverted
   2..4   Speed
   5..7   Pattern
*/
uint8_t prepare_led(uint16_t n) {
  return ((bexw(n, 12, 3) & 7) << 5) | ((bexw(n, 9, 3) & 7) << 2) | (((bexw(n, 15, 1) == 1 ? 1 : 0) & 7) << 1 ) | ((0 & 7) << 0);
}


/**
   @led_address
*/
uint16_t led_address(uint8_t n, uint8_t l, uint8_t r) {
  return header_size + (r * range_size) + (n * NUM_LEDS * 2) + (l * 2);
}

/**
   @clear_all
*/
void clear_all() {
  uint8_t n;
  for (n = 0; n < NUM_STRANDS; n++) {
    strands_a[n].clear();
  }
}


/**
   @process_led
*/
void process_led(uint8_t n, uint8_t l) {
  
  uint8_t d = strands_a[n].get_data(l);
  uint8_t pattern = bexb(d, 3, 3);
  uint8_t speed, mirror;
 
  color.r = 0;
  color.g = 0;
  color.b = 0;

  if (pattern > PATTERN_OFF) {
    uint8_t ca = 1;

    if (pattern > PATTERN_SOLID) {

      speed = bexb(d, 0, 3);
      mirror  = bexb(d, 6, 1);

      uint8_t sb = bitRead(timers_s, speed);

      ca = (!mirror && sb) || (mirror && !sb) ? 1 : 0;
      
      if (pattern == PATTERN_STROBE) {
        if (ca) {
          ca = !bitRead(timers_s, 0);
        }
      } else if (pattern == PATTERN_PULSE) {
          ca = ca == 1 ? 2 : 3;
      }
    }


    if (ca > 0) {
      batow c;
      uint16_t addr = led_address(n, l, strands_a[n].get_range(l));

      c.a[0] = EEPROM.read(addr);
      c.a[1] = EEPROM.read(addr + 1);
      color.r  = map(bexw(c.w, 0, 3), 0, 7, 0, 255); // r
      color.g = map(bexw(c.w, 3, 3), 0, 7, 0, 255); // g
      color.b = map(bexw(c.w, 6, 3), 0, 7, 0, 255); // b 

      if(pattern == PATTERN_PULSE) {

        // get position
        uint16_t t = timers_p[speed];
        uint8_t d = map(t, 0, timers_c[speed], 0, PATTERN_CURVE_STEPS - 1);
        uint8_t p = pulse_curve[ca == 3 ? PATTERN_CURVE_STEPS - d - 1 : d];
    
        color.r = map(p, 0, PATTERN_CURVE_RANGE, 0, color.r);
        color.g = map(p, 0, PATTERN_CURVE_RANGE, 0, color.g);
        color.b = map(p, 0, PATTERN_CURVE_RANGE, 0, color.b);
      

      }
    }
  }
  strands_a[n].set_color(l, color);
}



/**
   @recover
*/
void recover() {

  clear_all();
  channel = 0; // reset channel

  // header
  // 3 bytes each
#ifndef STATIC_HEADER
  num_leds = EEPROM.read(0);
  num_ranges = EEPROM.read(1);
  num_strands = EEPROM.read(2);
#endif
  range_mode = EEPROM.read(3);
  header_size = HEADER_OFFSET + (2 * NUM_RANGES) + NUM_STRANDS;
  // 4 + (2 * 5) + 3
  range_size = NUM_LEDS * NUM_STRANDS * 2;

  uint8_t n, l, a;
  for (n = 0; n < NUM_RANGES; n++) {
    for (l = 0; l < 2; l++) {
      a = HEADER_OFFSET + (2 * n) + l;
      ranges_l[n][l] = EEPROM.read(a);
    }
  }
}


/**
   @void mux_ranges
*/
void mux_ranges() {
  uint8_t r, n, l, b, cr, cd;
  uint16_t address;
  batow c;

  range_a = 0;

  for (r = 0; r < NUM_RANGES; r++) {

    if(range_mode == MODE_TIMER) {
      b = r == timers_tr;
    } else {
      b = (range_mode == MODE_ALWAYS) || (channel >= (ranges_l[r][0] * 10) && channel <= (ranges_l[r][1] * 10));
    }
    if(b) range_a++;

    // mux range
    for (n = 0; n < NUM_STRANDS; n++) {
      for (l = 0; l < NUM_LEDS; l++) {
        cr = strands_a[n].get_range(l);
        cd = strands_a[n].get_data(l);
        address = led_address(n, l, r);
       
        c.a[0] = EEPROM.read(address);
        c.a[1] = EEPROM.read(address + 1);

        if(b && c.w > 0) {
          strands_a[n].set_data(l, prepare_led(c.w));
          strands_a[n].set_range(l, r);
        } else if(cr == r) {
          strands_a[n].set_data(l, 0);
        }
      }
    }
  }


  if (range_a == 0) clear_all();
}

/**
 * @identify_strand
 * Easily identify the strand
 */
void identify_strand() {
  clear_all();
  color.r = 0;
  color.g = 255;
  color.b = 0;
  for(uint8_t n = 0; n < NUM_STRANDS; n++) {
    strands_a[n].set_color(0, color);
    strands_a[n].sync();
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

  identify_strand();

  while (wait) {
    a = serial.available();
    if (a > 0) {
      while (serial.available()) {
        b = serial.read();
        EEPROM.write(address, b);
        timeout = millis();
        address++;
      }
      if (serial.available() == 0) {
        serial.write(SERIAL_COMMAND_MARKER); // send maker that we read the buffer
      }
    } else {
      wait = millis() - timeout < SERIAL_TIMEOUT;
    }
    status_led(true);
  }
  uint8_t r[3] = {SERIAL_COMMAND_DONE, lowByte(address), highByte(address)};

  serial.write(r, 3);
  
  recover();
}

/**
   @void read_serial
*/
void read_serial() {

  if (serial_action) return;
  serial_action = true; // lock

  uint8_t cmd = serial.read();

  if (cmd == SERIAL_COMMAND_STATUS) {
    send_status();
  } else if (cmd == SERIAL_COMMAND_CHANNEL) {
    send_channel();
  } else if (cmd == SERIAL_COMMAND_UPDATE) {
    begin_update();
  }

  serial_action = false;
}



/**
   @void read_channel
*/
void read_channel() {

  if (range_mode == MODE_TIMER) {
    batow ba;
    ba.a[0] = ranges_l[timers_tr][0];
    ba.a[1] = ranges_l[timers_tr][1];
    if(millis() - (ba.w * 1000) > timers_tt) {
      timers_tt = millis();
      timers_tr++;
      if(timers_tr >= NUM_RANGES) timers_tr = 0;
      return mux_ranges();
    }
  }

  uint16_t c = 0;
  
  if (range_mode == MODE_ANALOG) {
    c = analogRead(PIN_INPUT);
  } else if (range_mode == MODE_RC) {
    c = pulseIn(PIN_INPUT, HIGH, 25000);
  } 
  
  if ((range_mode == MODE_ALWAYS) || (c + SAFE_CHANNEL > channel || c - SAFE_CHANNEL < channel)) {
    channel = c;
    mux_ranges(); 
  }
}

/**
   @void send_status
   Sends status information about the board
   0    byte      Command
   1    byte      Board
   2    byte      Version (LB)
   3    byte      Version (HB)
   4    byte      n/a
   5    byte      n/a
   6    byte      Number Ranges supported
   7    byte      Number Strands supported / range
   8    byte      Nu  mber Leds supported / strand
   9    byte      Reserved /0
   10   byte      Reserved /0
   11   byte      Reserved /0
   12   byte      Reserved /0
*/
void send_status() {
  byte data[12] = {SERIAL_COMMAND_STATUS, BOARD, lowByte(VERSION), highByte(VERSION), 0, 0, NUM_RANGES, NUM_STRANDS, NUM_LEDS, 0, 0, 0};
  serial.write(data, 12);
}

/**
   @void send_channel
   Sends channel information (rc signal, or pin)
   0    byte      Command
   1    byte      low byte of channel
   2    byte      high byte of channel
*/
void send_channel() {
  byte data[3] = {SERIAL_COMMAND_CHANNEL, lowByte(channel), highByte(channel)};
  serial.write(data, 3);
}


/**
   @setup
*/
void setup() {
  // boot operation
  identify_strand();
  // recover
  delay(2000);

  pinMode(PIN_INPUT, INPUT);
  serial.begin(SERIAL_BAUD_RATE);
  recover();

  #ifdef USE_STATUS_LED
    pinMode(PIN_STATUS_LED, OUTPUT);
  #endif;
}

/**
   @loop
*/
void loop() {

  uint8_t n, l;
  
  if (serial.available()) {
    read_serial();
  } else  {

    read_channel();

    for (n = 0; n < NUM_SPEEDS; n++) {
      uint32_t t = millis();
      if ((t - timers_t[n]) >= timers_c[n]) {
        bitWrite(timers_s, n, !bitRead(timers_s, n));
        timers_t[n] = t;
      }
      timers_p[n] = t - timers_t[n];
    }

    if (range_a) {
      for (n = 0; n < NUM_STRANDS; n++) {
        for (l = 0; l < NUM_LEDS; l++) {
          process_led(n, l);
        }
      }

      for (n = 0; n < NUM_STRANDS; n++) {
        strands_a[n].sync();
      }
    }

    // live channel update
    #ifdef ENABLE_LIVE_CHANNEL
    if (!serial_action && bitRead(timers_s, 6) && channel_a != channel) {
      send_channel();
      channel_a = channel;
    }
    #endif

    status_led(false);
  }

  delay(15); // save timer
}

/**
     ___  _ __           __   _______ 
    / _ )(_) /____ __ __/ /  / __/ _ \
   / _  / / __(_-</ // / /__/ _// // /
  /____/_/\__/___/\_, /____/___/____/ 
                 /___/                
  
  
  Lightweight WS2811/WS2812/WS2812B RGB Library
  Original by Matthias Riegler (https://github.com/cpldcpu/light_ws2812)
  License: GNU GPL v2 (see License.txt)
  
  Modified for BitsyLED
*/

#ifndef WS2812_H_
#define WS2812_H_

#include <avr/interrupt.h>
#include <avr/io.h>
#include <Arduino.h>
#include "config.h"
#include "bitsyled_crgb.h"

// If you want to use the setColorOrder functions, enable this line
#define RGB_ORDER_ON_RUNTIME

#ifdef RGB_ORDER_ON_RUNTIME	
	#define OFFSET_R(r) r+offsetRed
	#define OFFSET_G(g) g+offsetGreen
	#define OFFSET_B(b) b+offsetBlue
  
#else
// CHANGE YOUR STATIC RGB ORDER HERE
	#define OFFSET_R(r) r+1
	#define OFFSET_G(g) g	
	#define OFFSET_B(b) b+2	
#endif

class WS2812 {
public: 
	WS2812(uint8_t pin);
	~WS2812();
	
	#ifndef ARDUINO
	void begin(const volatile uint8_t* port, volatile uint8_t* reg, uint8_t pin);
	#else
	void begin(uint8_t pin);
	#endif
	
  uint8_t set_color(uint8_t index, cRGB px_value);
  void set_data(uint8_t index, uint8_t data);
  uint8_t get_data(uint8_t index);
  void set_range(uint8_t index, uint8_t range);
  uint8_t get_range(uint8_t index);

  void clear();
	void sync();
	
#ifdef RGB_ORDER_ON_RUNTIME	
	void setColorOrderRGB();
	void setColorOrderGRB();
	void setColorOrderBRG();
#endif

private:
	uint8_t pixels[NUM_LEDS * 3];
  uint8_t datas[NUM_LEDS];
  uint8_t ranges[NUM_LEDS];

#ifdef RGB_ORDER_ON_RUNTIME	
	uint8_t offsetRed;
	uint8_t offsetGreen;
	uint8_t offsetBlue;
#endif	

	void ws2812_sendarray_mask(uint8_t *array,uint16_t length, uint8_t pinmask,uint8_t *port, uint8_t *portreg);
  
	const volatile uint8_t *ws2812_port;
	volatile uint8_t *ws2812_port_reg;
	uint8_t pinMask; 
};



#endif /* WS2812_H_ */

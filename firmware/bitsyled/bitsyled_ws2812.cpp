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
  Supports only AVR/Arduino
*/

/**
 * @imports
 */
#include "bitsyled_ws2812.h"
#include "config.h"

/**
 * @WS2812
 */
WS2812::WS2812(uint8_t pin) {
	#ifdef RGB_ORDER_ON_RUNTIME	
		offsetGreen = 0;
		offsetRed = 1;
		offsetBlue = 2;
	#endif
  pinMask = digitalPinToBitMask(pin);
  ws2812_port = portOutputRegister(digitalPinToPort(pin));
  ws2812_port_reg = portModeRegister(digitalPinToPort(pin));
}


/**
 * @set_range
 */
void WS2812::set_range(uint8_t index, uint8_t r) {
  ranges[index] = r;
}

/**
 * @get_range
 */
uint8_t WS2812::get_range(uint8_t index) {
  uint8_t d = 0;
  if(index < NUM_LEDS) {
    d = ranges[index];
  } 
  return d;
}

/**
 * @set_data
 */
void WS2812::set_data(uint8_t index, uint8_t d) {
  datas[index] = d;
}

/**
 * @get_data
 */
uint8_t WS2812::get_data(uint8_t index) {
  uint8_t d = 0;
	if(index < NUM_LEDS) {
    d = datas[index];
	} 
  return d;
}

/**
 * @set_crgb_at
 */
uint8_t WS2812::set_color(uint8_t index, cRGB c) {
  if(index < NUM_LEDS) {
    uint8_t tmp;
    tmp = index * 3;
    pixels[OFFSET_R(tmp)] = c.r;
    pixels[OFFSET_G(tmp)] = c.g;
    pixels[OFFSET_B(tmp)] = c.b;   
    return 0;
  } 
  return 1;
}


/**
 * @clear
 */
void WS2812::clear(){
  cRGB c;
  c.r = 0;
  c.g = 0;
  c.b = 0;
  for(uint8_t n = 0; n < NUM_LEDS; n++) {
    set_color(n, c);
  }
  sync();
}

/**
 * @sync
 */
void WS2812::sync() {
	*ws2812_port_reg |= pinMask; // Enable DDR
	ws2812_sendarray_mask(pixels,3*NUM_LEDS,pinMask,(uint8_t*) ws2812_port,(uint8_t*) ws2812_port_reg );	
}


#ifdef RGB_ORDER_ON_RUNTIME	
void WS2812::setColorOrderGRB() { // Default color order
	offsetGreen = 0;
	offsetRed = 1;
	offsetBlue = 2;
}

void WS2812::setColorOrderRGB() {
	offsetRed = 0;
	offsetGreen = 1;
	offsetBlue = 2;
}

void WS2812::setColorOrderBRG() {
	offsetBlue = 0;
	offsetRed = 1;
	offsetGreen = 2;
}
#endif

WS2812::~WS2812() {
	free(pixels);
  free(datas);
}

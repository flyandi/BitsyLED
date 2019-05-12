/**
     ___  _ __           __   _______ 
    / _ )(_) /____ __ __/ /  / __/ _ \
   / _  / / __(_-</ // / /__/ _// // /
  /____/_/\__/___/\_, /____/___/____/ 
                 /___/                
  
  
  Configuration
*/
#ifndef CONFIG_H_
#define CONFIG_H_


// Target board
#define BOARD_BITSYLED
//#define BOARD_ARDUINO
//#define BOARD_ESP

// Firmware flags
#define ENABLE_LIVE_CHANNEL
//#define ENABLE_LOCAL_DEV // Easier to dev this way


/**
 * BITSYLED BOARD
*/
#ifdef BOARD_BITSYLED
  #define BOARD 0x02              // BitsyLED  
  #define STATIC_HEADER           // Ignores header from serial
  #define USE_SOFT_SERIAL         // Use software serial
  #define SERIAL_BAUD_RATE 9600   
  #define USE_STATUS_LED          // Supported since 1.2 board
  
  #ifdef ENABLE_LOCAL_DEV
    #define SERIAL_RX_PIN 0     
    #define SERIAL_TX_PIN 1 
    #define PIN_INPUT 9
  #else
    #define SERIAL_RX_PIN 5           
    #define SERIAL_TX_PIN 6
    #define PIN_INPUT 0
  #endif
  
  // board configs
  #define PIN_STATUS_LED 7
  #define NUM_RANGES 5
  #define NUM_STRANDS 3
  #define NUM_LEDS 10

#endif

/**
 * ARDUINO
*/
#ifdef BOARD_ARDUINO
  #define BOARD 0x04              // Arduino  
  #define STATIC_HEADER           // Ignores header from serial
  #define SERIAL_BAUD_RATE 9600
  #define USE_STATUS_LED
  
  // board configs
  #define PIN_INPUT 9
  #define PIN_STATUS_LED 13
  #define NUM_RANGES 6
  #define NUM_STRANDS 3
  #define NUM_LEDS 25
#endif


#ifdef BOARD_ESP
#define NOT_SUPPORTED_YET
#endif;*/ 


#endif /* CONFIG_H_ */

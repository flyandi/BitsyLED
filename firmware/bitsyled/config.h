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
#define BITSYLED
//#define ARDUINO
//#define ESP

// Firmware flags
#define ENABLE_LIVE_CHANNEL
//#define ENABLE_LOCAL_DEV


/*
#ifdef ARDUINO
#define BOARD 0x04
#endif;

#ifdef ESP
#define BOARD 0x04
#endif;*/ 

/**
   @board configuration
*/
#ifdef BITSYLED
#define BOARD 0x02          // BitsyLED  
#define STATIC_HEADER       // Ignores header from serial
#define SERIAL_BAUD_RATE 9600

#ifdef ENABLE_LOCAL_DEV
  #define SERIAL_RX_PIN 0       
  #define SERIAL_TX_PIN 1 
#else
  #define SERIAL_RX_PIN 5           
  #define SERIAL_TX_PIN 6
#endif


// board configs
#define PIN_INPUT 0
#define NUM_RANGES 5
#define NUM_STRANDS 3
#define NUM_LEDS 10

#endif



#endif /* CONFIG_H_ */

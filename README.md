# rpio-rtttl-piezo
Plays Nokia ringtones on a piezo speaker over a Raspberry Pi's GPIO pin with PWM.

Compatible with Raspberry Pi Models A, B (revisions 1.0 and 2.0), A+, B+, 2, 3, Zero.

This script **requires root privileges** to access the hardware PWM clocks. See node-rpio in further reading below for more details. Hardware PWM is only available on the following pins:

 * Raspberry Pi 26-pin models: pin 12
 * Raspberry Pi 40-pin models: pins 12, 32, 33, 35


# Install

```console
$ npm install git+https://github.com/nochecksum/rpio-rtttl-piezo.git
```

# Basic usage

You should always specify an output pin (using physical hardware numbering):

```js
var piezo = require('rpio-rtttl-piezo');

piezo.play({
  pwmOutputPin: 32
});
```

## Specify a ringtone

Use the RTTTL format to provide a melody for playback:

```js
var piezo = require('rpio-rtttl-piezo');

piezo.play({
  pwmOutputPin: 32,
  rtttl: 'BTTF:d=16,o=5,b=200:4g.,p,4c.,p,2f#.,p,g.,p,a.,p,8g,p,8e,p,8c,p,4f#,p,g.,p,a.,p,8g.,p,8d.,p,8g.,p,8d.6,p,4d.6,p,4c#6,p,b.,p,c#.6,p,2d.6'
});
```

## Repeat

Repeat the melody 4 times:

```js
var piezo = require('rpio-rtttl-piezo');

piezo.play({
  pwmOutputPin: 32,
  repeat: 4
});
```

## Playback octave

Shift the melody up 3 octaves. This is useful to move a melody's frequency into the most efficient dynamic range (loudest) for your piezo speaker. Check your datasheet for details.

```js
var piezo = require('rpio-rtttl-piezo');

piezo.play({
  pwmOutputPin: 32,
  rtttl: 'GSTQ:d=4,o=6,b=100:p,8f5,16p,8p,16p,8f.5,32p,p,e5,32p,8a5,16p,8p,16p,8a.5,a5',
  freqMultiplier: 3
});
```

## Volume (duty cycle)

A note is played by generating a square wave with PWM. The duty cycle describes how long each period of the square wave should be active, thus how loud it will sound.

Good values are 2 (loudest), 8, 16, 32, 64.

```js
var piezo = require('rpio-rtttl-piezo');

piezo.play({
  pwmOutputPin: 32,
  dutyCycle: 32
});
```

# Further reading

 * [node-rpio](https://github.com/jperkin/node-rpio) dependency for GPIO / PWM
 * [rtttl-parse](https://www.npmjs.com/package/rtttl-parse) dependency for parsing RTTTL Nokia ringtone format
 * [Ring Tone Text Transfer Language (RTTTL)](https://en.wikipedia.org/wiki/Ring_Tone_Transfer_Language) on Wikipedia describes the format
 * [PICAXE RTTTL downloads page](http://www.picaxe.com/RTTTL-Ringtones-for-Tune-Command/) has 11,000 tunes available in ZIPs

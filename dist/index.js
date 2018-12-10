/*!
 * rpio-rtttl-piezo
 * Copyright(c) 2018 NoChecksum
 * MIT Licensed
 */

'use strict';


/**
 * Module dependencies
 */

var rpio = require('rpio');
var rtttlParse = require('rtttl-parse');
var objectAssign = require('object-assign');


/**
 * Constructor
 */

var RpioRtttlPiezo = function () {};


// Initiate GPIO output
rpio.init({
	gpiomem: false
});


/**
 * play(opts)
 * Begin playback on specified PWM pin with desired options
 */
RpioRtttlPiezo.prototype.play = function(opts) {
	// Merge defaults and user options
	var defaults = {
		pwmOutputPin: 32,
		pwmClockDivider: 16,
		pwmClockFreq: 1.2e6,
		rtttl: 'Default:d=16,o=6,b=200:d,d#,e,f,f#',
		repeat: 1,
		dutyCycle: 2,
		freqMultiplier: 3,
		repeatDelay: 250,
		playbackCounter: 0,
		noteCounter: 0
	};
	opts = objectAssign(defaults, opts);

	// Parse RTTTL to playable notes
	opts.tune = rtttlParse.parse(opts.rtttl);

	rpio.open(opts.pwmOutputPin, rpio.PWM);
	rpio.pwmSetClockDivider(opts.pwmClockDivider);

	// Begin playback
	this.playNextNote(opts);
};

/**
 * playNextNote(opts)
 * Continues playback of previously called play()
 */
RpioRtttlPiezo.prototype.playNextNote = function(playable) {
	var _this = this;
	// Are we within melody repeat loop?
	if (playable.playbackCounter < playable.repeat) {
		// Are we within notes of melody?
		if (playable.noteCounter < playable.tune.melody.length) {

			// Get next note and calculate desired output frequency
			var note = playable.tune.melody[playable.noteCounter];
			var freq = parseInt(note.frequency * playable.freqMultiplier);

			// Is a sound desired?
			if (freq) {
				// Set PWM range based on clock frequency, and PWM data based on duty cycle
				rpio.pwmSetRange(playable.pwmOutputPin, playable.pwmClockFreq/freq);
				rpio.pwmSetData(playable.pwmOutputPin, (playable.pwmClockFreq/freq)/playable.dutyCycle);
			} else {
				// Silence
				rpio.pwmSetData(playable.pwmOutputPin, 0);
			}

			// Prepare for next note in melody sequence
			playable.noteCounter++;
			setTimeout(function(){ _this.playNextNote(playable); }, note.duration);
		} else {
			// End of melody, set silence
			rpio.pwmSetData(playable.pwmOutputPin, 0);

			// Prepare for playback repeat
			playable.noteCounter = 0;
			playable.playbackCounter++;
			setTimeout(function(){ _this.playNextNote(playable); }, playable.repeatDelay);
		}
	} else {
		// End of playback, set silence
		rpio.pwmSetData(playable.pwmOutputPin, 0);
	}
};

module.exports = new RpioRtttlPiezo();

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
		repeat: 2,
		dutyCycle: 32,
		freqMultiplier: 3,
		playbackCounter: 0
	};
	opts = objectAssign(defaults, opts);

	// Parse RTTTL to playable notes
	opts.tune = rtttlParse.parse(opts.rtttl);

	// Initiate GPIO output
	rpio.init({
		gpiomem: false
	});
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
	var noteCounter = playable.playbackCounter%playable.repeat;
	if (noteCounter < playable.tune.melody.length) {
		var note = playable.tune.melody[noteCounter];
		var freq = parseInt(note.frequency * playable.freqMultiplier);

		if (freq) {
			rpio.pwmSetRange(playable.pwmOutputPin, playable.pwmClockFreq/freq);
			rpio.pwmSetData(playable.pwmOutputPin, (playable.pwmClockFreq/freq)/playable.dutyCycle);
		} else {
			rpio.pwmSetData(playable.pwmOutputPin, 0);
		}
	} else {
		rpio.pwmSetData(playable.pwmOutputPin, 0);
	}

	playable.playbackCounter++;
	if (playable.playbackCounter < playable.tune.melody.length*playable.repeat) {
		var _this = this;
		setTimeout(function(){ _this.playNextNote(playable); }, note.duration);
	} else {
		setTimeout(function(){ rpio.pwmSetData(playable.pwmOutputPin, 0); }, note.duration);
	}
};

module.exports = new RpioRtttlPiezo();
import * as tslib_1 from "tslib";
import { MidiClass } from "../core/type/Midi";
import { deepMerge, omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { isArray, isNumber } from "../core/util/TypeCheck";
import { Instrument } from "./Instrument";
import { Synth } from "./Synth";
import { assert, warn } from "../core/util/Debug";
/**
 * PolySynth handles voice creation and allocation for any
 * instruments passed in as the second paramter. PolySynth is
 * not a synthesizer by itself, it merely manages voices of
 * one of the other types of synths, allowing any of the
 * monophonic synthesizers to be polyphonic.
 *
 * @example
 * import { PolySynth } from "tone";
 * const synth = new PolySynth().toDestination();
 * // set the attributes across all the voices using 'set'
 * synth.set({ detune: -1200 });
 * // play a chord
 * synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
 * @category Instrument
 */
var PolySynth = /** @class */ (function (_super) {
    tslib_1.__extends(PolySynth, _super);
    function PolySynth() {
        var _this = _super.call(this, optionsFromArguments(PolySynth.getDefaults(), arguments, ["voice", "options"])) || this;
        _this.name = "PolySynth";
        /**
         * The voices which are not currently in use
         */
        _this._availableVoices = [];
        /**
         * The currently active voices
         */
        _this._activeVoices = [];
        /**
         * All of the allocated voices for this synth.
         */
        _this._voices = [];
        /**
         * The GC timeout. Held so that it could be cancelled when the node is disposed.
         */
        _this._gcTimeout = -1;
        /**
         * A moving average of the number of active voices
         */
        _this._averageActiveVoices = 0;
        var options = optionsFromArguments(PolySynth.getDefaults(), arguments, ["voice", "options"]);
        // check against the old API (pre 14.3.0)
        assert(!isNumber(options.voice), "DEPRECATED: The polyphony count is no longer the first argument.");
        var defaults = options.voice.getDefaults();
        _this.options = Object.assign(defaults, options.options);
        _this.voice = options.voice;
        _this.maxPolyphony = options.maxPolyphony;
        // create the first voice
        _this._dummyVoice = _this._getNextAvailableVoice();
        // remove it from the voices list
        var index = _this._voices.indexOf(_this._dummyVoice);
        _this._voices.splice(index, 1);
        // kick off the GC interval
        _this._gcTimeout = _this.context.setInterval(_this._collectGarbage.bind(_this), 1);
        return _this;
    }
    PolySynth.getDefaults = function () {
        return Object.assign(Instrument.getDefaults(), {
            maxPolyphony: 32,
            options: {},
            voice: Synth,
        });
    };
    Object.defineProperty(PolySynth.prototype, "activeVoices", {
        /**
         * The number of active voices.
         */
        get: function () {
            return this._activeVoices.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Invoked when the source is done making sound, so that it can be
     * readded to the pool of available voices
     */
    PolySynth.prototype._makeVoiceAvailable = function (voice) {
        this._availableVoices.push(voice);
        // remove the midi note from 'active voices'
        var activeVoiceIndex = this._activeVoices.findIndex(function (e) { return e.voice === voice; });
        this._activeVoices.splice(activeVoiceIndex, 1);
    };
    /**
     * Get an available voice from the pool of available voices.
     * If one is not available and the maxPolyphony limit is reached,
     * steal a voice, otherwise return null.
     */
    PolySynth.prototype._getNextAvailableVoice = function () {
        // if there are available voices, return the first one
        if (this._availableVoices.length) {
            return this._availableVoices.shift();
        }
        else if (this._voices.length < this.maxPolyphony) {
            // otherwise if there is still more maxPolyphony, make a new voice
            var voice = new this.voice(Object.assign(this.options, {
                context: this.context,
                onsilence: this._makeVoiceAvailable.bind(this),
            }));
            voice.connect(this.output);
            this._voices.push(voice);
            return voice;
        }
        else {
            warn("Max polyphony exceeded. Note dropped.");
        }
    };
    /**
     * Occasionally check if there are any allocated voices which can be cleaned up.
     */
    PolySynth.prototype._collectGarbage = function () {
        this._averageActiveVoices = Math.max(this._averageActiveVoices * 0.95, this.activeVoices);
        if (this._availableVoices.length && this._voices.length > Math.ceil(this._averageActiveVoices + 1)) {
            // take off an available note
            var firstAvail = this._availableVoices.shift();
            var index = this._voices.indexOf(firstAvail);
            this._voices.splice(index, 1);
            if (!this.context.isOffline) {
                firstAvail.dispose();
            }
        }
    };
    /**
     * Internal method which triggers the attack
     */
    PolySynth.prototype._triggerAttack = function (notes, time, velocity) {
        var _this = this;
        notes.forEach(function (note) {
            var midiNote = new MidiClass(_this.context, note).toMidi();
            var voice = _this._getNextAvailableVoice();
            if (voice) {
                voice.triggerAttack(note, time, velocity);
                _this._activeVoices.push({
                    midi: midiNote, voice: voice, released: false,
                });
                _this.log("triggerAttack", note, time);
            }
        });
    };
    /**
     * Internal method which triggers the release
     */
    PolySynth.prototype._triggerRelease = function (notes, time) {
        var _this = this;
        notes.forEach(function (note) {
            var midiNote = new MidiClass(_this.context, note).toMidi();
            var event = _this._activeVoices.find(function (_a) {
                var midi = _a.midi, released = _a.released;
                return midi === midiNote && !released;
            });
            if (event) {
                // trigger release on that note
                event.voice.triggerRelease(time);
                // mark it as released
                event.released = true;
                _this.log("triggerRelease", note, time);
            }
        });
    };
    /**
     * Schedule the attack/release events. If the time is in the future, then it should set a timeout
     * to wait for just-in-time scheduling
     */
    PolySynth.prototype._scheduleEvent = function (type, notes, time, velocity) {
        var _this = this;
        assert(!this.disposed, "Synth was already disposed");
        // if the notes are greater than this amount of time in the future, they should be scheduled with setTimeout
        if (time <= this.now()) {
            // do it immediately
            if (type === "attack") {
                this._triggerAttack(notes, time, velocity);
            }
            else {
                this._triggerRelease(notes, time);
            }
        }
        else {
            // schedule it to start in the future
            this.context.setTimeout(function () {
                _this._scheduleEvent(type, notes, time, velocity);
            }, time - this.now());
        }
    };
    /**
     * Trigger the attack portion of the note
     * @param  notes The notes to play. Accepts a single Frequency or an array of frequencies.
     * @param  time  The start time of the note.
     * @param velocity The velocity of the note.
     * @example
     * import { FMSynth, now, PolySynth } from "tone";
     * const synth = new PolySynth(FMSynth).toDestination();
     * // trigger a chord immediately with a velocity of 0.2
     * synth.triggerAttack(["Ab3", "C4", "F5"], now(), 0.2);
     */
    PolySynth.prototype.triggerAttack = function (notes, time, velocity) {
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        var computedTime = this.toSeconds(time);
        this._scheduleEvent("attack", notes, computedTime, velocity);
        return this;
    };
    /**
     * Trigger the release of the note. Unlike monophonic instruments,
     * a note (or array of notes) needs to be passed in as the first argument.
     * @param  notes The notes to play. Accepts a single Frequency or an array of frequencies.
     * @param  time  When the release will be triggered.
     * @example
     * @example
     * import { AMSynth, PolySynth } from "tone";
     * const poly = new PolySynth(AMSynth).toDestination();
     * poly.triggerAttack(["Ab3", "C4", "F5"]);
     * // trigger the release of the given notes.
     * poly.triggerRelease(["Ab3", "C4"], "+1");
     * poly.triggerRelease("F5", "+3");
     */
    PolySynth.prototype.triggerRelease = function (notes, time) {
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        var computedTime = this.toSeconds(time);
        this._scheduleEvent("release", notes, computedTime);
        return this;
    };
    /**
     * Trigger the attack and release after the specified duration
     * @param  notes The notes to play. Accepts a single  Frequency or an array of frequencies.
     * @param  duration the duration of the note
     * @param  time  if no time is given, defaults to now
     * @param  velocity the velocity of the attack (0-1)
     * @example
     * import { AMSynth, PolySynth } from "tone";
     * const poly = new PolySynth(AMSynth).toDestination();
     * // can pass in an array of durations as well
     * poly.triggerAttackRelease(["Eb3", "G4", "Bb4", "D5"], [4, 3, 2, 1]);
     */
    PolySynth.prototype.triggerAttackRelease = function (notes, duration, time, velocity) {
        var computedTime = this.toSeconds(time);
        this.triggerAttack(notes, computedTime, velocity);
        if (isArray(duration)) {
            assert(isArray(notes), "If the duration is an array, the notes must also be an array");
            notes = notes;
            for (var i = 0; i < notes.length; i++) {
                var d = duration[Math.min(i, duration.length - 1)];
                var durationSeconds = this.toSeconds(d);
                assert(durationSeconds > 0, "The duration must be greater than 0");
                this.triggerRelease(notes[i], computedTime + durationSeconds);
            }
        }
        else {
            var durationSeconds = this.toSeconds(duration);
            assert(durationSeconds > 0, "The duration must be greater than 0");
            this.triggerRelease(notes, computedTime + durationSeconds);
        }
        return this;
    };
    PolySynth.prototype.sync = function () {
        this._syncMethod("triggerAttack", 1);
        this._syncMethod("triggerRelease", 1);
        return this;
    };
    /**
     * Set a member/attribute of the voices
     * @example
     * import { PolySynth } from "tone";
     * const poly = new PolySynth().toDestination();
     * // set all of the voices using an options object for the synth type
     * poly.set({
     * 	envelope: {
     * 		attack: 0.25
     * 	}
     * });
     * poly.triggerAttackRelease("Bb3", 0.2);
     */
    PolySynth.prototype.set = function (options) {
        // remove options which are controlled by the PolySynth
        var sanitizedOptions = omitFromObject(options, ["onsilence", "context"]);
        // store all of the options
        this.options = deepMerge(this.options, sanitizedOptions);
        this._voices.forEach(function (voice) { return voice.set(sanitizedOptions); });
        this._dummyVoice.set(sanitizedOptions);
        return this;
    };
    PolySynth.prototype.get = function () {
        return this._dummyVoice.get();
    };
    /**
     * Trigger the release portion of all the currently active voices immediately.
     * Useful for silencing the synth.
     */
    PolySynth.prototype.releaseAll = function () {
        var now = this.now();
        this._activeVoices.forEach(function (_a) {
            var voice = _a.voice;
            voice.triggerRelease(now);
        });
        this._activeVoices = [];
        return this;
    };
    PolySynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._dummyVoice.dispose();
        this._voices.forEach(function (v) { return v.dispose(); });
        this._activeVoices = [];
        this._availableVoices = [];
        this.context.clearInterval(this._gcTimeout);
        return this;
    };
    return PolySynth;
}(Instrument));
export { PolySynth };
//# sourceMappingURL=PolySynth.js.map
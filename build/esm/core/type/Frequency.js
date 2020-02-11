import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { intervalToFrequencyRatio, mtof } from "./Conversions";
import { ftom, getA4, setA4 } from "./Conversions";
import { TimeClass } from "./Time";
/**
 * Frequency is a primitive type for encoding Frequency values.
 * Eventually all time values are evaluated to hertz using the `eval` method.
 * @example
 * import { Frequency } from "tone";
 * Frequency("C3"); // 261
 * Frequency(38, "midi");
 * Frequency("C3").transpose(4);
 * @category Unit
 */
var FrequencyClass = /** @class */ (function (_super) {
    tslib_1.__extends(FrequencyClass, _super);
    function FrequencyClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Frequency";
        _this.defaultUnits = "hz";
        return _this;
    }
    Object.defineProperty(FrequencyClass, "A4", {
        /**
         * The [concert tuning pitch](https://en.wikipedia.org/wiki/Concert_pitch) which is used
         * to generate all the other pitch values from notes. A4's values in Hertz.
         */
        get: function () {
            return getA4();
        },
        set: function (freq) {
            setA4(freq);
        },
        enumerable: true,
        configurable: true
    });
    //-------------------------------------
    // 	AUGMENT BASE EXPRESSIONS
    //-------------------------------------
    FrequencyClass.prototype._getExpressions = function () {
        return Object.assign({}, _super.prototype._getExpressions.call(this), {
            midi: {
                regexp: /^(\d+(?:\.\d+)?midi)/,
                method: function (value) {
                    if (this.defaultUnits === "midi") {
                        return value;
                    }
                    else {
                        return FrequencyClass.mtof(value);
                    }
                },
            },
            note: {
                regexp: /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
                method: function (pitch, octave) {
                    var index = noteToScaleIndex[pitch.toLowerCase()];
                    var noteNumber = index + (parseInt(octave, 10) + 1) * 12;
                    if (this.defaultUnits === "midi") {
                        return noteNumber;
                    }
                    else {
                        return FrequencyClass.mtof(noteNumber);
                    }
                },
            },
            tr: {
                regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
                method: function (m, q, s) {
                    var total = 1;
                    if (m && m !== "0") {
                        total *= this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
                    }
                    if (q && q !== "0") {
                        total *= this._beatsToUnits(parseFloat(q));
                    }
                    if (s && s !== "0") {
                        total *= this._beatsToUnits(parseFloat(s) / 4);
                    }
                    return total;
                },
            },
        });
    };
    //-------------------------------------
    // 	EXPRESSIONS
    //-------------------------------------
    /**
     * Transposes the frequency by the given number of semitones.
     * @return  A new transposed frequency
     * @example
     * import { Frequency } from "tone";
     * Frequency("A4").transpose(3); // "C5"
     */
    FrequencyClass.prototype.transpose = function (interval) {
        return new FrequencyClass(this.context, this.valueOf() * intervalToFrequencyRatio(interval));
    };
    /**
     * Takes an array of semitone intervals and returns
     * an array of frequencies transposed by those intervals.
     * @return  Returns an array of Frequencies
     * @example
     * import { Frequency } from "tone";
     * Frequency("A4").harmonize([0, 3, 7]); // ["A4", "C5", "E5"]
     */
    FrequencyClass.prototype.harmonize = function (intervals) {
        var _this = this;
        return intervals.map(function (interval) {
            return _this.transpose(interval);
        });
    };
    //-------------------------------------
    // 	UNIT CONVERSIONS
    //-------------------------------------
    /**
     * Return the value of the frequency as a MIDI note
     * @example
     * import { Frequency } from "tone";
     * Frequency("C4").toMidi(); // 60
     */
    FrequencyClass.prototype.toMidi = function () {
        return ftom(this.valueOf());
    };
    /**
     * Return the value of the frequency in Scientific Pitch Notation
     * @example
     * import { Frequency } from "tone";
     * Frequency(69, "midi").toNote(); // "A4"
     */
    FrequencyClass.prototype.toNote = function () {
        var freq = this.toFrequency();
        var log = Math.log2(freq / FrequencyClass.A4);
        var noteNumber = Math.round(12 * log) + 57;
        var octave = Math.floor(noteNumber / 12);
        if (octave < 0) {
            noteNumber += -12 * octave;
        }
        var noteName = scaleIndexToNote[noteNumber % 12];
        return noteName + octave.toString();
    };
    /**
     * Return the duration of one cycle in seconds.
     */
    FrequencyClass.prototype.toSeconds = function () {
        return 1 / _super.prototype.toSeconds.call(this);
    };
    /**
     * Return the duration of one cycle in ticks
     */
    FrequencyClass.prototype.toTicks = function () {
        var quarterTime = this._beatsToUnits(1);
        var quarters = this.valueOf() / quarterTime;
        return Math.floor(quarters * this._getPPQ());
    };
    //-------------------------------------
    // 	UNIT CONVERSIONS HELPERS
    //-------------------------------------
    /**
     * With no arguments, return 0
     */
    FrequencyClass.prototype._noArg = function () {
        return 0;
    };
    /**
     * Returns the value of a frequency in the current units
     */
    FrequencyClass.prototype._frequencyToUnits = function (freq) {
        return freq;
    };
    /**
     * Returns the value of a tick in the current time units
     */
    FrequencyClass.prototype._ticksToUnits = function (ticks) {
        return 1 / ((ticks * 60) / (this._getBpm() * this._getPPQ()));
    };
    /**
     * Return the value of the beats in the current units
     */
    FrequencyClass.prototype._beatsToUnits = function (beats) {
        return 1 / _super.prototype._beatsToUnits.call(this, beats);
    };
    /**
     * Returns the value of a second in the current units
     */
    FrequencyClass.prototype._secondsToUnits = function (seconds) {
        return 1 / seconds;
    };
    /**
     * Convert a MIDI note to frequency value.
     * @param  midi The midi number to convert.
     * @return The corresponding frequency value
     */
    FrequencyClass.mtof = function (midi) {
        return mtof(midi);
    };
    /**
     * Convert a frequency value to a MIDI note.
     * @param frequency The value to frequency value to convert.
     */
    FrequencyClass.ftom = function (frequency) {
        return ftom(frequency);
    };
    return FrequencyClass;
}(TimeClass));
export { FrequencyClass };
//-------------------------------------
// 	FREQUENCY CONVERSIONS
//-------------------------------------
/**
 * Note to scale index.
 * @hidden
 */
var noteToScaleIndex = {
    cbb: -2, cb: -1, c: 0, "c#": 1, cx: 2,
    dbb: 0, db: 1, d: 2, "d#": 3, dx: 4,
    ebb: 2, eb: 3, e: 4, "e#": 5, ex: 6,
    fbb: 3, fb: 4, f: 5, "f#": 6, fx: 7,
    gbb: 5, gb: 6, g: 7, "g#": 8, gx: 9,
    abb: 7, ab: 8, a: 9, "a#": 10, ax: 11,
    bbb: 9, bb: 10, b: 11, "b#": 12, bx: 13,
};
/**
 * scale index to note (sharps)
 * @hidden
 */
var scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/**
 * Convert a value into a FrequencyClass object.
 * @category Unit
 */
export function Frequency(value, units) {
    return new FrequencyClass(getContext(), value, units);
}
//# sourceMappingURL=Frequency.js.map
import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { ftom, mtof } from "./Conversions";
import { FrequencyClass } from "./Frequency";
/**
 * Midi is a primitive type for encoding Time values.
 * Midi can be constructed with or without the `new` keyword. Midi can be passed
 * into the parameter of any method which takes time as an argument.
 * @category Unit
 */
var MidiClass = /** @class */ (function (_super) {
    tslib_1.__extends(MidiClass, _super);
    function MidiClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "MidiClass";
        _this.defaultUnits = "midi";
        return _this;
    }
    /**
     * Returns the value of a frequency in the current units
     */
    MidiClass.prototype._frequencyToUnits = function (freq) {
        return ftom(_super.prototype._frequencyToUnits.call(this, freq));
    };
    /**
     * Returns the value of a tick in the current time units
     */
    MidiClass.prototype._ticksToUnits = function (ticks) {
        return ftom(_super.prototype._ticksToUnits.call(this, ticks));
    };
    /**
     * Return the value of the beats in the current units
     */
    MidiClass.prototype._beatsToUnits = function (beats) {
        return ftom(_super.prototype._beatsToUnits.call(this, beats));
    };
    /**
     * Returns the value of a second in the current units
     */
    MidiClass.prototype._secondsToUnits = function (seconds) {
        return ftom(_super.prototype._secondsToUnits.call(this, seconds));
    };
    /**
     * Return the value of the frequency as a MIDI note
     * @example
     * import { Midi } from "tone";
     * Midi(60).toMidi(); // 60
     */
    MidiClass.prototype.toMidi = function () {
        return this.valueOf();
    };
    /**
     * Return the value of the frequency as a MIDI note
     * @example
     * import { Midi } from "tone";
     * Midi(60).toFrequency(); // 261.6255653005986
     */
    MidiClass.prototype.toFrequency = function () {
        return mtof(this.toMidi());
    };
    /**
     * Transposes the frequency by the given number of semitones.
     * @return A new transposed MidiClass
     * @example
     * import { Midi } from "tone";
     * Midi("A4").transpose(3); // "C5"
     */
    MidiClass.prototype.transpose = function (interval) {
        return new MidiClass(this.context, this.toMidi() + interval);
    };
    return MidiClass;
}(FrequencyClass));
export { MidiClass };
/**
 * Convert a value into a FrequencyClass object.
 * @category Unit
 */
export function Midi(value, units) {
    return new MidiClass(getContext(), value, units);
}
//# sourceMappingURL=Midi.js.map
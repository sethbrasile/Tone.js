import * as tslib_1 from "tslib";
import { FrequencyClass } from "../core/type/Frequency";
import { optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
import { Instrument } from "../instrument/Instrument";
import { timeRange } from "../core/util/Decorator";
/**
 * Abstract base class for other monophonic instruments to extend.
 */
var Monophonic = /** @class */ (function (_super) {
    tslib_1.__extends(Monophonic, _super);
    function Monophonic() {
        var _this = _super.call(this, optionsFromArguments(Monophonic.getDefaults(), arguments)) || this;
        var options = optionsFromArguments(Monophonic.getDefaults(), arguments);
        _this.portamento = options.portamento;
        _this.onsilence = options.onsilence;
        return _this;
    }
    Monophonic.getDefaults = function () {
        return Object.assign(Instrument.getDefaults(), {
            detune: 0,
            onsilence: noOp,
            portamento: 0,
        });
    };
    /**
     * Trigger the attack of the note optionally with a given velocity.
     * @param  note The note to trigger.
     * @param  time When the note should start.
     * @param  velocity The velocity scaler determines how "loud" the note will be triggered.
     * @example
     * import { Synth } from "tone";
     * const synth = new Synth().toDestination();
     * // trigger the note a half second from now at half velocity
     * synth.triggerAttack("C4", "+0.5", 0.5);
     */
    Monophonic.prototype.triggerAttack = function (note, time, velocity) {
        if (velocity === void 0) { velocity = 1; }
        this.log("triggerAttack", note, time, velocity);
        var seconds = this.toSeconds(time);
        this._triggerEnvelopeAttack(seconds, velocity);
        this.setNote(note, seconds);
        return this;
    };
    /**
     * Trigger the release portion of the envelope
     * @param  time If no time is given, the release happens immediatly
     * @example
     * import { Synth } from "tone";
     * const synth = new Synth().toDestination();
     * synth.triggerAttack("C4");
     * // trigger the release a second from now
     * synth.triggerRelease("+1");
     */
    Monophonic.prototype.triggerRelease = function (time) {
        this.log("triggerRelease", time);
        var seconds = this.toSeconds(time);
        this._triggerEnvelopeRelease(seconds);
        return this;
    };
    /**
     * Set the note at the given time. If no time is given, the note
     * will set immediately.
     * @param note The note to change to.
     * @param  time The time when the note should be set.
     * @example
     * import { Synth } from "tone";
     * const synth = new Synth().toDestination();
     * synth.triggerAttack("C4");
     * // change to F#6 in one quarter note from now.
     * synth.setNote("F#6", "+4n");
     */
    Monophonic.prototype.setNote = function (note, time) {
        var computedTime = this.toSeconds(time);
        var computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
        if (this.portamento > 0 && this.getLevelAtTime(computedTime) > 0.05) {
            var portTime = this.toSeconds(this.portamento);
            this.frequency.exponentialRampTo(computedFrequency, portTime, computedTime);
        }
        else {
            this.frequency.setValueAtTime(computedFrequency, computedTime);
        }
        return this;
    };
    tslib_1.__decorate([
        timeRange(0)
    ], Monophonic.prototype, "portamento", void 0);
    return Monophonic;
}(Instrument));
export { Monophonic };
//# sourceMappingURL=Monophonic.js.map
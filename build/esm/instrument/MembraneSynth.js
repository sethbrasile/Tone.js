import * as tslib_1 from "tslib";
import { FrequencyClass } from "../core/type/Frequency";
import { deepMerge, optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { Monophonic } from "./Monophonic";
import { Synth } from "./Synth";
import { range, timeRange } from "../core/util/Decorator";
/**
 * MembraneSynth makes kick and tom sounds using a single oscillator
 * with an amplitude envelope and frequency ramp. A Tone.OmniOscillator
 * is routed through a Tone.AmplitudeEnvelope to the output. The drum
 * quality of the sound comes from the frequency envelope applied
 * during MembraneSynth.triggerAttack(note). The frequency envelope
 * starts at <code>note * .octaves</code> and ramps to <code>note</code>
 * over the duration of <code>.pitchDecay</code>.
 * @example
 * import { MembraneSynth } from "tone";
 * const synth = new MembraneSynth().toDestination();
 * synth.triggerAttackRelease("C2", "8n");
 * @category Instrument
 */
var MembraneSynth = /** @class */ (function (_super) {
    tslib_1.__extends(MembraneSynth, _super);
    function MembraneSynth() {
        var _this = _super.call(this, optionsFromArguments(MembraneSynth.getDefaults(), arguments)) || this;
        _this.name = "MembraneSynth";
        /**
         * Portamento is ignored in this synth. use pitch decay instead.
         */
        _this.portamento = 0;
        var options = optionsFromArguments(MembraneSynth.getDefaults(), arguments);
        _this.pitchDecay = options.pitchDecay;
        _this.octaves = options.octaves;
        readOnly(_this, ["oscillator", "envelope"]);
        return _this;
    }
    MembraneSynth.getDefaults = function () {
        return deepMerge(Monophonic.getDefaults(), Synth.getDefaults(), {
            envelope: {
                attack: 0.001,
                attackCurve: "exponential",
                decay: 0.4,
                release: 1.4,
                sustain: 0.01,
            },
            octaves: 10,
            oscillator: {
                type: "sine",
            },
            pitchDecay: 0.05,
        });
    };
    MembraneSynth.prototype.setNote = function (note, time) {
        var seconds = this.toSeconds(time);
        var hertz = this.toFrequency(note instanceof FrequencyClass ? note.toFrequency() : note);
        var maxNote = hertz * this.octaves;
        this.oscillator.frequency.setValueAtTime(maxNote, seconds);
        this.oscillator.frequency.exponentialRampToValueAtTime(hertz, seconds + this.toSeconds(this.pitchDecay));
        return this;
    };
    MembraneSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        return this;
    };
    tslib_1.__decorate([
        range(0)
    ], MembraneSynth.prototype, "octaves", void 0);
    tslib_1.__decorate([
        timeRange(0)
    ], MembraneSynth.prototype, "pitchDecay", void 0);
    return MembraneSynth;
}(Synth));
export { MembraneSynth };
//# sourceMappingURL=MembraneSynth.js.map
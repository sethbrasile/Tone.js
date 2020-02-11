import * as tslib_1 from "tslib";
import { LowpassCombFilter } from "../component/filter/LowpassCombFilter";
import { deepMerge } from "../core/util/Defaults";
import { optionsFromArguments } from "../core/util/Defaults";
import { Noise } from "../source/Noise";
import { Instrument } from "./Instrument";
/**
 * Karplus-String string synthesis.
 * @example
 * import { PluckSynth } from "tone";
 * const plucky = new PluckSynth().toDestination();
 * plucky.triggerAttack("C4", "+0.5");
 * plucky.triggerAttack("C3", "+1");
 * plucky.triggerAttack("C2", "+1.5");
 * plucky.triggerAttack("C1", "+2");
 * @category Instrument
 */
var PluckSynth = /** @class */ (function (_super) {
    tslib_1.__extends(PluckSynth, _super);
    function PluckSynth() {
        var _this = _super.call(this, optionsFromArguments(PluckSynth.getDefaults(), arguments)) || this;
        _this.name = "PluckSynth";
        var options = optionsFromArguments(PluckSynth.getDefaults(), arguments);
        _this._noise = new Noise({
            context: _this.context,
            type: "pink"
        });
        _this.attackNoise = options.attackNoise;
        _this._lfcf = new LowpassCombFilter({
            context: _this.context,
            dampening: options.dampening,
            resonance: options.resonance,
        });
        _this.resonance = options.resonance;
        _this.release = options.release;
        _this._noise.connect(_this._lfcf);
        _this._lfcf.connect(_this.output);
        return _this;
    }
    PluckSynth.getDefaults = function () {
        return deepMerge(Instrument.getDefaults(), {
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.7,
            release: 1,
        });
    };
    Object.defineProperty(PluckSynth.prototype, "dampening", {
        /**
         * The dampening control. i.e. the lowpass filter frequency of the comb filter
         * @min 0
         * @max 7000
         */
        get: function () {
            return this._lfcf.dampening;
        },
        set: function (fq) {
            this._lfcf.dampening = fq;
        },
        enumerable: true,
        configurable: true
    });
    PluckSynth.prototype.triggerAttack = function (note, time) {
        var freq = this.toFrequency(note);
        time = this.toSeconds(time);
        var delayAmount = 1 / freq;
        this._lfcf.delayTime.setValueAtTime(delayAmount, time);
        this._noise.start(time);
        this._noise.stop(time + delayAmount * this.attackNoise);
        this._lfcf.resonance.cancelScheduledValues(time);
        this._lfcf.resonance.setValueAtTime(this.resonance, time);
        return this;
    };
    /**
     * Ramp down the [[resonance]] to 0 over the duration of the release time.
     */
    PluckSynth.prototype.triggerRelease = function (time) {
        this._lfcf.resonance.linearRampTo(0, this.release, time);
        return this;
    };
    PluckSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._noise.dispose();
        this._lfcf.dispose();
        return this;
    };
    return PluckSynth;
}(Instrument));
export { PluckSynth };
//# sourceMappingURL=PluckSynth.js.map
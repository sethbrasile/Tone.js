import * as tslib_1 from "tslib";
import { StereoEffect } from "./StereoEffect";
import { optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { Signal } from "../signal/Signal";
import { LowpassCombFilter } from "../component/filter/LowpassCombFilter";
/**
 * An array of comb filter delay values from Freeverb implementation
 */
var combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];
/**
 * An array of allpass filter frequency values from Freeverb implementation
 */
var allpassFilterFrequencies = [225, 556, 441, 341];
/**
 * Freeverb is a reverb based on [Freeverb](https://ccrma.stanford.edu/~jos/pasp/Freeverb.html).
 * Read more on reverb on [Sound On Sound](https://web.archive.org/web/20160404083902/http://www.soundonsound.com:80/sos/feb01/articles/synthsecrets.asp).
 * Freeverb is now implemented with an AudioWorkletNode which may result on performance degradation on some platforms
 * @example
 * import { Freeverb, NoiseSynth } from "tone";
 * const freeverb = new Freeverb().toDestination();
 * freeverb.dampening = 1000;
 * // routing synth through the reverb
 * const synth = new NoiseSynth().connect(freeverb);
 * synth.triggerAttackRelease(0.05);
 * @category Effect
 */
var Freeverb = /** @class */ (function (_super) {
    tslib_1.__extends(Freeverb, _super);
    function Freeverb() {
        var _this = _super.call(this, optionsFromArguments(Freeverb.getDefaults(), arguments, ["roomSize", "dampening"])) || this;
        _this.name = "Freeverb";
        /**
         * the comb filters
         */
        _this._combFilters = [];
        /**
         * the allpass filters on the left
         */
        _this._allpassFiltersL = [];
        /**
         * the allpass filters on the right
         */
        _this._allpassFiltersR = [];
        var options = optionsFromArguments(Freeverb.getDefaults(), arguments, ["roomSize", "dampening"]);
        _this.roomSize = new Signal({
            context: _this.context,
            value: options.roomSize,
            units: "normalRange",
        });
        // make the allpass filters on the right
        _this._allpassFiltersL = allpassFilterFrequencies.map(function (freq) {
            var allpassL = _this.context.createBiquadFilter();
            allpassL.type = "allpass";
            allpassL.frequency.value = freq;
            return allpassL;
        });
        // make the allpass filters on the left
        _this._allpassFiltersR = allpassFilterFrequencies.map(function (freq) {
            var allpassR = _this.context.createBiquadFilter();
            allpassR.type = "allpass";
            allpassR.frequency.value = freq;
            return allpassR;
        });
        // make the comb filters
        _this._combFilters = combFilterTunings.map(function (delayTime, index) {
            var lfpf = new LowpassCombFilter({
                context: _this.context,
                dampening: options.dampening,
                delayTime: delayTime,
            });
            if (index < combFilterTunings.length / 2) {
                _this.connectEffectLeft.apply(_this, tslib_1.__spread([lfpf], _this._allpassFiltersL));
            }
            else {
                _this.connectEffectRight.apply(_this, tslib_1.__spread([lfpf], _this._allpassFiltersR));
            }
            _this.roomSize.connect(lfpf.resonance);
            return lfpf;
        });
        readOnly(_this, ["roomSize"]);
        return _this;
    }
    Freeverb.getDefaults = function () {
        return Object.assign(StereoEffect.getDefaults(), {
            roomSize: 0.7,
            dampening: 3000
        });
    };
    Object.defineProperty(Freeverb.prototype, "dampening", {
        /**
         * The amount of dampening of the reverberant signal.
         */
        get: function () {
            return this._combFilters[0].dampening;
        },
        set: function (d) {
            this._combFilters.forEach(function (c) { return c.dampening = d; });
        },
        enumerable: true,
        configurable: true
    });
    Freeverb.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._allpassFiltersL.forEach(function (al) { return al.disconnect(); });
        this._allpassFiltersR.forEach(function (ar) { return ar.disconnect(); });
        this._combFilters.forEach(function (cf) { return cf.dispose(); });
        this.roomSize.dispose();
        return this;
    };
    return Freeverb;
}(StereoEffect));
export { Freeverb };
//# sourceMappingURL=Freeverb.js.map
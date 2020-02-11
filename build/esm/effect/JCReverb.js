import * as tslib_1 from "tslib";
import { StereoEffect } from "./StereoEffect";
import { optionsFromArguments } from "../core/util/Defaults";
import { Scale } from "../signal/Scale";
import { Signal } from "../signal/Signal";
import { FeedbackCombFilter } from "../component/filter/FeedbackCombFilter";
import { readOnly } from "../core/util/Interface";
/**
 * an array of the comb filter delay time values
 */
var combFilterDelayTimes = [1687 / 25000, 1601 / 25000, 2053 / 25000, 2251 / 25000];
/**
 * the resonances of each of the comb filters
 */
var combFilterResonances = [0.773, 0.802, 0.753, 0.733];
/**
 * the allpass filter frequencies
 */
var allpassFilterFreqs = [347, 113, 37];
/**
 * JCReverb is a simple [Schroeder Reverberator](https://ccrma.stanford.edu/~jos/pasp/Schroeder_Reverberators.html)
 * tuned by John Chowning in 1970.
 * It is made up of three allpass filters and four [[FeedbackCombFilter]].
 * JCReverb is now implemented with an AudioWorkletNode which may result on performance degradation on some platforms
 *
 * @example
 * import { DuoSynth, FeedbackDelay, JCReverb } from "tone";
 * const reverb = new JCReverb(0.4).toDestination();
 * const delay = new FeedbackDelay(0.5);
 * // connecting the synth to reverb through delay
 * const synth = new DuoSynth().chain(delay, reverb);
 * synth.triggerAttackRelease("A4", "8n");
 *
 * @category Effect
 */
var JCReverb = /** @class */ (function (_super) {
    tslib_1.__extends(JCReverb, _super);
    function JCReverb() {
        var _this = _super.call(this, optionsFromArguments(JCReverb.getDefaults(), arguments, ["roomSize"])) || this;
        _this.name = "JCReverb";
        /**
         * a series of allpass filters
         */
        _this._allpassFilters = [];
        /**
         * parallel feedback comb filters
         */
        _this._feedbackCombFilters = [];
        var options = optionsFromArguments(JCReverb.getDefaults(), arguments, ["roomSize"]);
        _this.roomSize = new Signal({
            context: _this.context,
            value: options.roomSize,
            units: "normalRange",
        });
        _this._scaleRoomSize = new Scale({
            context: _this.context,
            min: -0.733,
            max: 0.197,
        });
        // make the allpass filters
        _this._allpassFilters = allpassFilterFreqs.map(function (freq) {
            var allpass = _this.context.createBiquadFilter();
            allpass.type = "allpass";
            allpass.frequency.value = freq;
            return allpass;
        });
        // and the comb filters
        _this._feedbackCombFilters = combFilterDelayTimes.map(function (delayTime, index) {
            var fbcf = new FeedbackCombFilter({
                context: _this.context,
                delayTime: delayTime,
            });
            _this._scaleRoomSize.connect(fbcf.resonance);
            fbcf.resonance.value = combFilterResonances[index];
            if (index < combFilterDelayTimes.length / 2) {
                _this.connectEffectLeft.apply(_this, tslib_1.__spread(_this._allpassFilters, [fbcf]));
            }
            else {
                _this.connectEffectRight.apply(_this, tslib_1.__spread(_this._allpassFilters, [fbcf]));
            }
            return fbcf;
        });
        // chain the allpass filters together
        _this.roomSize.connect(_this._scaleRoomSize);
        readOnly(_this, ["roomSize"]);
        return _this;
    }
    JCReverb.getDefaults = function () {
        return Object.assign(StereoEffect.getDefaults(), {
            roomSize: 0.5,
        });
    };
    JCReverb.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._allpassFilters.forEach(function (apf) { return apf.disconnect(); });
        this._feedbackCombFilters.forEach(function (fbcf) { return fbcf.dispose(); });
        this.roomSize.dispose();
        this._scaleRoomSize.dispose();
        return this;
    };
    return JCReverb;
}(StereoEffect));
export { JCReverb };
//# sourceMappingURL=JCReverb.js.map
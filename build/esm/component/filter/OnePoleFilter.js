import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Gain } from "../../core/context/Gain";
/**
 * A one pole filter with 6db-per-octave rolloff. Either "highpass" or "lowpass".
 * Note that changing the type or frequency may result in a discontinuity which
 * can sound like a click or pop.
 * References:
 * * http://www.earlevel.com/main/2012/12/15/a-one-pole-filter/
 * * http://www.dspguide.com/ch19/2.htm
 * * https://github.com/vitaliy-bobrov/js-rocks/blob/master/src/app/audio/effects/one-pole-filters.ts
 * @category Component
 */
var OnePoleFilter = /** @class */ (function (_super) {
    tslib_1.__extends(OnePoleFilter, _super);
    function OnePoleFilter() {
        var _this = _super.call(this, optionsFromArguments(OnePoleFilter.getDefaults(), arguments, ["frequency", "type"])) || this;
        _this.name = "OnePoleFilter";
        var options = optionsFromArguments(OnePoleFilter.getDefaults(), arguments, ["frequency", "type"]);
        _this._frequency = options.frequency;
        _this._type = options.type;
        _this.input = new Gain({ context: _this.context });
        _this.output = new Gain({ context: _this.context });
        _this._createFilter();
        return _this;
    }
    OnePoleFilter.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            frequency: 880,
            type: "lowpass"
        });
    };
    /**
     * Create a filter and dispose the old one
     */
    OnePoleFilter.prototype._createFilter = function () {
        var _this = this;
        var oldFilter = this._filter;
        var freq = this.toFrequency(this._frequency);
        var t = 1 / (2 * Math.PI * freq);
        if (this._type === "lowpass") {
            var a0 = 1 / (t * this.context.sampleRate);
            var b1 = a0 - 1;
            this._filter = this.context.createIIRFilter([a0, 0], [1, b1]);
        }
        else {
            var b1 = 1 / (t * this.context.sampleRate) - 1;
            this._filter = this.context.createIIRFilter([1, -1], [1, b1]);
        }
        this.input.chain(this._filter, this.output);
        if (oldFilter) {
            // dispose it on the next block
            this.context.setTimeout(function () {
                if (!_this.disposed) {
                    _this.input.disconnect(oldFilter);
                    oldFilter.disconnect();
                }
            }, this.blockTime);
        }
    };
    Object.defineProperty(OnePoleFilter.prototype, "frequency", {
        /**
         * The frequency value.
         */
        get: function () {
            return this._frequency;
        },
        set: function (fq) {
            this._frequency = fq;
            this._createFilter();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OnePoleFilter.prototype, "type", {
        /**
         * The OnePole Filter type, either "highpass" or "lowpass"
         */
        get: function () {
            return this._type;
        },
        set: function (t) {
            this._type = t;
            this._createFilter();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the frequency response curve. This curve represents how the filter
     * responses to frequencies between 20hz-20khz.
     * @param  len The number of values to return
     * @return The frequency response curve between 20-20kHz
     */
    OnePoleFilter.prototype.getFrequencyResponse = function (len) {
        if (len === void 0) { len = 128; }
        var freqValues = new Float32Array(len);
        for (var i = 0; i < len; i++) {
            var norm = Math.pow(i / len, 2);
            var freq = norm * (20000 - 20) + 20;
            freqValues[i] = freq;
        }
        var magValues = new Float32Array(len);
        var phaseValues = new Float32Array(len);
        this._filter.getFrequencyResponse(freqValues, magValues, phaseValues);
        return magValues;
    };
    OnePoleFilter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.input.dispose();
        this.output.dispose();
        this._filter.disconnect();
        return this;
    };
    return OnePoleFilter;
}(ToneAudioNode));
export { OnePoleFilter };
//# sourceMappingURL=OnePoleFilter.js.map
import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { connectSeries, ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly, writable } from "../../core/util/Interface";
import { isNumber } from "../../core/util/TypeCheck";
import { Signal } from "../../signal/Signal";
import { assert } from "../../core/util/Debug";
/**
 * Tone.Filter is a filter which allows for all of the same native methods
 * as the [BiquadFilterNode](http://webaudio.github.io/web-audio-api/#the-biquadfilternode-interface).
 * Tone.Filter has the added ability to set the filter rolloff at -12
 * (default), -24 and -48.
 * @example
 * import { Filter, Noise } from "tone";
 *
 * const filter = new Filter(1500, "highpass").toDestination();
 * filter.frequency.rampTo(20000, 10);
 * const noise = new Noise().connect(filter).start();
 * @category Component
 */
var Filter = /** @class */ (function (_super) {
    tslib_1.__extends(Filter, _super);
    function Filter() {
        var _this = _super.call(this, optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"])) || this;
        _this.name = "Filter";
        _this.input = new Gain({ context: _this.context });
        _this.output = new Gain({ context: _this.context });
        _this._filters = [];
        var options = optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]);
        _this._filters = [];
        _this.Q = new Signal({
            context: _this.context,
            units: "positive",
            value: options.Q,
        });
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: options.frequency,
        });
        _this.detune = new Signal({
            context: _this.context,
            units: "cents",
            value: options.detune,
        });
        _this.gain = new Signal({
            context: _this.context,
            units: "decibels",
            value: options.gain,
        });
        _this._type = options.type;
        _this.rolloff = options.rolloff;
        readOnly(_this, ["detune", "frequency", "gain", "Q"]);
        return _this;
    }
    Filter.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            Q: 1,
            detune: 0,
            frequency: 350,
            gain: 0,
            rolloff: -12,
            type: "lowpass",
        });
    };
    Object.defineProperty(Filter.prototype, "type", {
        /**
         * The type of the filter. Types: "lowpass", "highpass",
         * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking".
         */
        get: function () {
            return this._type;
        },
        set: function (type) {
            var types = ["lowpass", "highpass", "bandpass",
                "lowshelf", "highshelf", "notch", "allpass", "peaking"];
            assert(types.indexOf(type) !== -1, "Invalid filter type: " + type);
            this._type = type;
            this._filters.forEach(function (filter) { return filter.type = type; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Filter.prototype, "rolloff", {
        /**
         * The rolloff of the filter which is the drop in db
         * per octave. Implemented internally by cascading filters.
         * Only accepts the values -12, -24, -48 and -96.
         */
        get: function () {
            return this._rolloff;
        },
        set: function (rolloff) {
            var rolloffNum = isNumber(rolloff) ? rolloff : parseInt(rolloff, 10);
            var possibilities = [-12, -24, -48, -96];
            var cascadingCount = possibilities.indexOf(rolloffNum);
            // check the rolloff is valid
            assert(cascadingCount !== -1, "rolloff can only be " + possibilities.join(", "));
            cascadingCount += 1;
            this._rolloff = rolloffNum;
            this.input.disconnect();
            this._filters.forEach(function (filter) { return filter.disconnect(); });
            this._filters = new Array(cascadingCount);
            for (var count = 0; count < cascadingCount; count++) {
                var filter = this.context.createBiquadFilter();
                filter.type = this._type;
                this.frequency.connect(filter.frequency);
                this.detune.connect(filter.detune);
                this.Q.connect(filter.Q);
                this.gain.connect(filter.gain);
                this._filters[count] = filter;
            }
            this._internalChannels = this._filters;
            connectSeries.apply(void 0, tslib_1.__spread([this.input], this._internalChannels, [this.output]));
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
    Filter.prototype.getFrequencyResponse = function (len) {
        var _this = this;
        if (len === void 0) { len = 128; }
        // start with all 1s
        var totalResponse = new Float32Array(len).map(function () { return 1; });
        var freqValues = new Float32Array(len);
        for (var i = 0; i < len; i++) {
            var norm = Math.pow(i / len, 2);
            var freq = norm * (20000 - 20) + 20;
            freqValues[i] = freq;
        }
        var magValues = new Float32Array(len);
        var phaseValues = new Float32Array(len);
        this._filters.forEach(function () {
            var filterClone = _this.context.createBiquadFilter();
            filterClone.type = _this._type;
            filterClone.Q.value = _this.Q.value;
            filterClone.frequency.value = _this.frequency.value;
            filterClone.gain.value = _this.gain.value;
            filterClone.getFrequencyResponse(freqValues, magValues, phaseValues);
            magValues.forEach(function (val, i) {
                totalResponse[i] *= val;
            });
        });
        return totalResponse;
    };
    /**
     * Clean up.
     */
    Filter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._filters.forEach(function (filter) {
            filter.disconnect();
        });
        writable(this, ["detune", "frequency", "gain", "Q"]);
        this.frequency.dispose();
        this.Q.dispose();
        this.detune.dispose();
        this.gain.dispose();
        return this;
    };
    return Filter;
}(ToneAudioNode));
export { Filter };
//# sourceMappingURL=Filter.js.map
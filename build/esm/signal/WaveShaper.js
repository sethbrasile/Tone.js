import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../core/util/Defaults";
import { isArray, isFunction } from "../core/util/TypeCheck";
import { assert } from "../core/util/Debug";
import { Signal } from "./Signal";
import { SignalOperator } from "./SignalOperator";
/**
 * Wraps the native Web Audio API
 * [WaveShaperNode](http://webaudio.github.io/web-audio-api/#the-waveshapernode-interface).
 *
 * @example
 * import { Oscillator, Signal, WaveShaper } from "tone";
 * const osc = new Oscillator().toDestination().start();
 * // multiply the output of the signal by 2 using the waveshaper's function
 * const timesTwo = new WaveShaper((val) => val * 2, 2048).connect(osc.frequency);
 * const signal = new Signal(440).connect(timesTwo);
 * @category Signal
 */
var WaveShaper = /** @class */ (function (_super) {
    tslib_1.__extends(WaveShaper, _super);
    function WaveShaper() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(WaveShaper.getDefaults(), arguments, ["mapping", "length"]))) || this;
        _this.name = "WaveShaper";
        /**
         * the waveshaper node
         */
        _this._shaper = _this.context.createWaveShaper();
        /**
         * The input to the waveshaper node.
         */
        _this.input = _this._shaper;
        /**
         * The output from the waveshaper node
         */
        _this.output = _this._shaper;
        var options = optionsFromArguments(WaveShaper.getDefaults(), arguments, ["mapping", "length"]);
        if (isArray(options.mapping) || options.mapping instanceof Float32Array) {
            _this.curve = Float32Array.from(options.mapping);
        }
        else if (isFunction(options.mapping)) {
            _this.setMap(options.mapping, options.length);
        }
        return _this;
    }
    WaveShaper.getDefaults = function () {
        return Object.assign(Signal.getDefaults(), {
            length: 1024,
        });
    };
    /**
     * Uses a mapping function to set the value of the curve.
     * @param mapping The function used to define the values.
     *                The mapping function take two arguments:
     *                the first is the value at the current position
     *                which goes from -1 to 1 over the number of elements
     *                in the curve array. The second argument is the array position.
     * @example
     * import { WaveShaper } from "tone";
     * const shaper = new WaveShaper();
     * // map the input signal from [-1, 1] to [0, 10]
     * shaper.setMap((val, index) => (val + 1) * 5);
     */
    WaveShaper.prototype.setMap = function (mapping, length) {
        if (length === void 0) { length = 1024; }
        var array = new Float32Array(length);
        for (var i = 0, len = length; i < len; i++) {
            var normalized = (i / (len - 1)) * 2 - 1;
            array[i] = mapping(normalized, i);
        }
        this.curve = array;
        return this;
    };
    Object.defineProperty(WaveShaper.prototype, "curve", {
        /**
         * The array to set as the waveshaper curve. For linear curves
         * array length does not make much difference, but for complex curves
         * longer arrays will provide smoother interpolation.
         */
        get: function () {
            return this._shaper.curve;
        },
        set: function (mapping) {
            this._shaper.curve = mapping;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WaveShaper.prototype, "oversample", {
        /**
         * Specifies what type of oversampling (if any) should be used when
         * applying the shaping curve. Can either be "none", "2x" or "4x".
         */
        get: function () {
            return this._shaper.oversample;
        },
        set: function (oversampling) {
            var isOverSampleType = ["none", "2x", "4x"].some(function (str) { return str.includes(oversampling); });
            assert(isOverSampleType, "oversampling must be either 'none', '2x', or '4x'");
            this._shaper.oversample = oversampling;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up.
     */
    WaveShaper.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._shaper.disconnect();
        return this;
    };
    return WaveShaper;
}(SignalOperator));
export { WaveShaper };
//# sourceMappingURL=WaveShaper.js.map
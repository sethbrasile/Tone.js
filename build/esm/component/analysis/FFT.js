import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { dbToGain } from "../../core/type/Conversions";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase } from "./MeterBase";
/**
 * Get the current frequency data of the connected audio source using a fast Fourier transform.
 * @category Component
 */
var FFT = /** @class */ (function (_super) {
    tslib_1.__extends(FFT, _super);
    function FFT() {
        var _this = _super.call(this, optionsFromArguments(FFT.getDefaults(), arguments, ["size"])) || this;
        _this.name = "FFT";
        var options = optionsFromArguments(FFT.getDefaults(), arguments, ["size"]);
        _this.normalRange = options.normalRange;
        _this._analyser.type = "fft";
        _this.size = options.size;
        return _this;
    }
    FFT.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            normalRange: false,
            size: 1024,
            smoothing: 0.8,
        });
    };
    /**
     * Gets the current frequency data from the connected audio source.
     * Returns the frequency data of length [[size]] as a Float32Array of decibel values.
     */
    FFT.prototype.getValue = function () {
        var _this = this;
        var values = this._analyser.getValue();
        return values.map(function (v) { return _this.normalRange ? dbToGain(v) : v; });
    };
    Object.defineProperty(FFT.prototype, "size", {
        /**
         * The size of analysis. This must be a power of two in the range 16 to 16384.
         * Determines the size of the array returned by [[getValue]] (i.e. the number of
         * frequency bins). Large FFT sizes may be costly to compute.
         */
        get: function () {
            return this._analyser.size;
        },
        set: function (size) {
            this._analyser.size = size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FFT.prototype, "smoothing", {
        /**
         * 0 represents no time averaging with the last analysis frame.
         */
        get: function () {
            return this._analyser.smoothing;
        },
        set: function (val) {
            this._analyser.smoothing = val;
        },
        enumerable: true,
        configurable: true
    });
    return FFT;
}(MeterBase));
export { FFT };
//# sourceMappingURL=FFT.js.map
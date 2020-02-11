import * as tslib_1 from "tslib";
import { gainToDb } from "../../core/type/Conversions";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase } from "./MeterBase";
import { warn } from "../../core/util/Debug";
import { Analyser } from "./Analyser";
/**
 * Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
 * of an input signal. It can also get the raw value of the input signal.
 *
 * @example
 * import { Meter, UserMedia } from "tone";
 * const meter = new Meter();
 * const mic = new UserMedia();
 * mic.open();
 * // connect mic to the meter
 * mic.connect(meter);
 * // the current level of the mic
 * const level = meter.getValue();
 * @category Component
 */
var Meter = /** @class */ (function (_super) {
    tslib_1.__extends(Meter, _super);
    function Meter() {
        var _this = _super.call(this, optionsFromArguments(Meter.getDefaults(), arguments, ["smoothing"])) || this;
        _this.name = "Meter";
        /**
         * The previous frame's value
         */
        _this._rms = 0;
        var options = optionsFromArguments(Meter.getDefaults(), arguments, ["smoothing"]);
        _this.input = _this.output = _this._analyser = new Analyser({
            context: _this.context,
            size: 256,
            type: "waveform",
            channels: options.channels,
        });
        _this.smoothing = options.smoothing,
            _this.normalRange = options.normalRange;
        return _this;
    }
    Meter.getDefaults = function () {
        return Object.assign(MeterBase.getDefaults(), {
            smoothing: 0.8,
            normalRange: false,
            channels: 1,
        });
    };
    /**
     * Use [[getValue]] instead. For the previous getValue behavior, use DCMeter.
     * @deprecated
     */
    Meter.prototype.getLevel = function () {
        warn("'getLevel' has been changed to 'getValue'");
        return this.getValue();
    };
    /**
     * Get the current value of the incoming signal.
     * Output is in decibels when [[normalRange]] is `false`.
     * If [[channels]] = 1, then the output is a single number
     * representing the value of the input signal. When [[channels]] > 1,
     * then each channel is returned as a value in a number array.
     */
    Meter.prototype.getValue = function () {
        var _this = this;
        var aValues = this._analyser.getValue();
        var channelValues = this.channels === 1 ? [aValues] : aValues;
        var vals = channelValues.map(function (values) {
            var totalSquared = values.reduce(function (total, current) { return total + current * current; }, 0);
            var rms = Math.sqrt(totalSquared / values.length);
            // the rms can only fall at the rate of the smoothing
            // but can jump up instantly
            _this._rms = Math.max(rms, _this._rms * _this.smoothing);
            return _this.normalRange ? _this._rms : gainToDb(_this._rms);
        });
        if (this.channels === 1) {
            return vals[0];
        }
        else {
            return vals;
        }
    };
    Object.defineProperty(Meter.prototype, "channels", {
        /**
         * The number of channels of analysis.
         */
        get: function () {
            return this._analyser.channels;
        },
        enumerable: true,
        configurable: true
    });
    Meter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._analyser.dispose();
        return this;
    };
    return Meter;
}(MeterBase));
export { Meter };
//# sourceMappingURL=Meter.js.map
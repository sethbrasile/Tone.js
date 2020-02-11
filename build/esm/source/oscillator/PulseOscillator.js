import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { WaveShaper } from "../../signal/WaveShaper";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { generateWaveform } from "./OscillatorInterface";
/**
 * PulseOscillator is an oscillator with control over pulse width,
 * also known as the duty cycle. At 50% duty cycle (width = 0) the wave is
 * a square wave.
 * [Read more](https://wigglewave.wordpress.com/2014/08/16/pulse-waveforms-and-harmonics/).
 * ```
 *    width = -0.25        width = 0.0          width = 0.25
 *
 *   +-----+            +-------+       +    +-------+     +-+
 *   |     |            |       |       |            |     |
 *   |     |            |       |       |            |     |
 * +-+     +-------+    +       +-------+            +-----+
 *
 *
 *    width = -0.5                              width = 0.5
 *
 *     +---+                                 +-------+   +---+
 *     |   |                                         |   |
 *     |   |                                         |   |
 * +---+   +-------+                                 +---+
 *
 *
 *    width = -0.75                             width = 0.75
 *
 *       +-+                                 +-------+ +-----+
 *       | |                                         | |
 *       | |                                         | |
 * +-----+ +-------+                                 +-+
 * ```
 * @example
 * import { PulseOscillator } from "tone";
 * const pulse = new PulseOscillator("E5", 0.4).toDestination().start();
 * @category Source
 */
var PulseOscillator = /** @class */ (function (_super) {
    tslib_1.__extends(PulseOscillator, _super);
    function PulseOscillator() {
        var _this = _super.call(this, optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"])) || this;
        _this.name = "PulseOscillator";
        /**
         * gate the width amount
         */
        _this._widthGate = new Gain({
            context: _this.context,
            gain: 0,
        });
        /**
         * Threshold the signal to turn it into a square
         */
        _this._thresh = new WaveShaper({
            context: _this.context,
            mapping: function (val) { return val <= 0 ? -1 : 1; },
        });
        var options = optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]);
        _this.width = new Signal({
            context: _this.context,
            units: "audioRange",
            value: options.width,
        });
        _this._sawtooth = new Oscillator({
            context: _this.context,
            detune: options.detune,
            frequency: options.frequency,
            onstop: function () { return _this.onstop(_this); },
            phase: options.phase,
            type: "sawtooth",
        });
        _this.frequency = _this._sawtooth.frequency;
        _this.detune = _this._sawtooth.detune;
        // connections
        _this._sawtooth.chain(_this._thresh, _this.output);
        _this.width.chain(_this._widthGate, _this._thresh);
        readOnly(_this, ["width", "frequency", "detune"]);
        return _this;
    }
    PulseOscillator.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            detune: 0,
            frequency: 440,
            phase: 0,
            type: "pulse",
            width: 0.2,
        });
    };
    /**
     * start the oscillator
     */
    PulseOscillator.prototype._start = function (time) {
        time = this.toSeconds(time);
        this._sawtooth.start(time);
        this._widthGate.gain.setValueAtTime(1, time);
    };
    /**
     * stop the oscillator
     */
    PulseOscillator.prototype._stop = function (time) {
        time = this.toSeconds(time);
        this._sawtooth.stop(time);
        // the width is still connected to the output.
        // that needs to be stopped also
        this._widthGate.gain.cancelScheduledValues(time);
        this._widthGate.gain.setValueAtTime(0, time);
    };
    PulseOscillator.prototype._restart = function (time) {
        this._sawtooth.restart(time);
        this._widthGate.gain.cancelScheduledValues(time);
        this._widthGate.gain.setValueAtTime(1, time);
    };
    Object.defineProperty(PulseOscillator.prototype, "phase", {
        /**
         * The phase of the oscillator in degrees.
         */
        get: function () {
            return this._sawtooth.phase;
        },
        set: function (phase) {
            this._sawtooth.phase = phase;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PulseOscillator.prototype, "type", {
        /**
         * The type of the oscillator. Always returns "pulse".
         */
        get: function () {
            return "pulse";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PulseOscillator.prototype, "baseType", {
        /**
         * The baseType of the oscillator. Always returns "pulse".
         */
        get: function () {
            return "pulse";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PulseOscillator.prototype, "partials", {
        /**
         * The partials of the waveform. Cannot set partials for this waveform type
         */
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PulseOscillator.prototype, "partialCount", {
        /**
         * No partials for this waveform type.
         */
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    PulseOscillator.prototype.asArray = function (length) {
        if (length === void 0) { length = 1024; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, generateWaveform(this, length)];
            });
        });
    };
    /**
     * Clean up method.
     */
    PulseOscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._sawtooth.dispose();
        this.width.dispose();
        this._widthGate.dispose();
        this._thresh.dispose();
        return this;
    };
    return PulseOscillator;
}(Source));
export { PulseOscillator };
//# sourceMappingURL=PulseOscillator.js.map
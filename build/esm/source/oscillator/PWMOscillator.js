import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Multiply } from "../../signal/Multiply";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { generateWaveform } from "./OscillatorInterface";
import { PulseOscillator } from "./PulseOscillator";
/**
 * PWMOscillator modulates the width of a Tone.PulseOscillator
 * at the modulationFrequency. This has the effect of continuously
 * changing the timbre of the oscillator by altering the harmonics
 * generated.
 * @example
 * import { PWMOscillator } from "tone";
 * const pwm = new PWMOscillator("Ab3", 0.3).toDestination().start();
 * @category Source
 */
var PWMOscillator = /** @class */ (function (_super) {
    tslib_1.__extends(PWMOscillator, _super);
    function PWMOscillator() {
        var _this = _super.call(this, optionsFromArguments(PWMOscillator.getDefaults(), arguments, ["frequency", "modulationFrequency"])) || this;
        _this.name = "PWMOscillator";
        _this.sourceType = "pwm";
        /**
         * Scale the oscillator so it doesn't go silent
         * at the extreme values.
         */
        _this._scale = new Multiply({
            context: _this.context,
            value: 2,
        });
        var options = optionsFromArguments(PWMOscillator.getDefaults(), arguments, ["frequency", "modulationFrequency"]);
        _this._pulse = new PulseOscillator({
            context: _this.context,
            frequency: options.modulationFrequency,
        });
        // change the pulse oscillator type
        // @ts-ignore
        _this._pulse._sawtooth.type = "sine";
        _this.modulationFrequency = _this._pulse.frequency;
        _this._modulator = new Oscillator({
            context: _this.context,
            detune: options.detune,
            frequency: options.frequency,
            onstop: function () { return _this.onstop(_this); },
            phase: options.phase,
        });
        _this.frequency = _this._modulator.frequency;
        _this.detune = _this._modulator.detune;
        // connections
        _this._modulator.chain(_this._scale, _this._pulse.width);
        _this._pulse.connect(_this.output);
        readOnly(_this, ["modulationFrequency", "frequency", "detune"]);
        return _this;
    }
    PWMOscillator.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            detune: 0,
            frequency: 440,
            modulationFrequency: 0.4,
            phase: 0,
            type: "pwm",
        });
    };
    /**
     * start the oscillator
     */
    PWMOscillator.prototype._start = function (time) {
        time = this.toSeconds(time);
        this._modulator.start(time);
        this._pulse.start(time);
    };
    /**
     * stop the oscillator
     */
    PWMOscillator.prototype._stop = function (time) {
        time = this.toSeconds(time);
        this._modulator.stop(time);
        this._pulse.stop(time);
    };
    /**
     * restart the oscillator
     */
    PWMOscillator.prototype._restart = function (time) {
        this._modulator.restart(time);
        this._pulse.restart(time);
    };
    Object.defineProperty(PWMOscillator.prototype, "type", {
        /**
         * The type of the oscillator. Always returns "pwm".
         */
        get: function () {
            return "pwm";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PWMOscillator.prototype, "baseType", {
        /**
         * The baseType of the oscillator. Always returns "pwm".
         */
        get: function () {
            return "pwm";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PWMOscillator.prototype, "partials", {
        /**
         * The partials of the waveform. Cannot set partials for this waveform type
         */
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PWMOscillator.prototype, "partialCount", {
        /**
         * No partials for this waveform type.
         */
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PWMOscillator.prototype, "phase", {
        /**
         * The phase of the oscillator in degrees.
         */
        get: function () {
            return this._modulator.phase;
        },
        set: function (phase) {
            this._modulator.phase = phase;
        },
        enumerable: true,
        configurable: true
    });
    PWMOscillator.prototype.asArray = function (length) {
        if (length === void 0) { length = 1024; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, generateWaveform(this, length)];
            });
        });
    };
    /**
     * Clean up.
     */
    PWMOscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._pulse.dispose();
        this._scale.dispose();
        this._modulator.dispose();
        return this;
    };
    return PWMOscillator;
}(Source));
export { PWMOscillator };
//# sourceMappingURL=PWMOscillator.js.map
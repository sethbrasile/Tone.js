import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { isNumber, isString } from "../../core/util/TypeCheck";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { AMOscillator } from "./AMOscillator";
import { FatOscillator } from "./FatOscillator";
import { FMOscillator } from "./FMOscillator";
import { Oscillator } from "./Oscillator";
import { generateWaveform } from "./OscillatorInterface";
import { PulseOscillator } from "./PulseOscillator";
import { PWMOscillator } from "./PWMOscillator";
var OmniOscillatorSourceMap = {
    am: AMOscillator,
    fat: FatOscillator,
    fm: FMOscillator,
    oscillator: Oscillator,
    pulse: PulseOscillator,
    pwm: PWMOscillator,
};
/**
 * OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
 * Tone.PWMOscillator, Tone.FMOscillator, Tone.AMOscillator, and Tone.FatOscillator
 * into one class. The oscillator class can be changed by setting the `type`.
 * `omniOsc.type = "pwm"` will set it to the Tone.PWMOscillator. Prefixing
 * any of the basic types ("sine", "square4", etc.) with "fm", "am", or "fat"
 * will use the FMOscillator, AMOscillator or FatOscillator respectively.
 * For example: `omniOsc.type = "fatsawtooth"` will create set the oscillator
 * to a FatOscillator of type "sawtooth".
 * @example
 * import { OmniOscillator } from "tone";
 * const omniOsc = new OmniOscillator("C#4", "pwm");
 * @category Source
 */
var OmniOscillator = /** @class */ (function (_super) {
    tslib_1.__extends(OmniOscillator, _super);
    function OmniOscillator() {
        var _this = _super.call(this, optionsFromArguments(OmniOscillator.getDefaults(), arguments, ["frequency", "type"])) || this;
        _this.name = "OmniOscillator";
        var options = optionsFromArguments(OmniOscillator.getDefaults(), arguments, ["frequency", "type"]);
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
        readOnly(_this, ["frequency", "detune"]);
        // set the options
        _this.set(options);
        return _this;
    }
    OmniOscillator.getDefaults = function () {
        return Object.assign(Oscillator.getDefaults(), FMOscillator.getDefaults(), AMOscillator.getDefaults(), FatOscillator.getDefaults(), PulseOscillator.getDefaults(), PWMOscillator.getDefaults());
    };
    /**
     * start the oscillator
     */
    OmniOscillator.prototype._start = function (time) {
        this._oscillator.start(time);
    };
    /**
     * start the oscillator
     */
    OmniOscillator.prototype._stop = function (time) {
        this._oscillator.stop(time);
    };
    OmniOscillator.prototype._restart = function (time) {
        this._oscillator.restart(time);
        return this;
    };
    Object.defineProperty(OmniOscillator.prototype, "type", {
        /**
         * The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. Or
         * prefix the basic types with "fm", "am", or "fat" to use the FMOscillator, AMOscillator or FatOscillator
         * types. The oscillator could also be set to "pwm" or "pulse". All of the parameters of the
         * oscillator's class are accessible when the oscillator is set to that type, but throws an error
         * when it's not.
         * @example
         * import { OmniOscillator } from "tone";
         * const omniOsc = new OmniOscillator().toDestination().start();
         * omniOsc.type = "pwm";
         * // modulationFrequency is parameter which is available
         * // only when the type is "pwm".
         * omniOsc.modulationFrequency.value = 0.5;
         * @example
         * import { OmniOscillator } from "tone";
         * const omniOsc = new OmniOscillator().toDestination().start();
         * // an square wave frequency modulated by a sawtooth
         * omniOsc.type = "fmsquare";
         * omniOsc.modulationType = "sawtooth";
         */
        get: function () {
            var _this = this;
            var prefix = "";
            if (["am", "fm", "fat"].some(function (p) { return _this._sourceType === p; })) {
                prefix = this._sourceType;
            }
            return prefix + this._oscillator.type;
        },
        set: function (type) {
            if (type.substr(0, 2) === "fm") {
                this._createNewOscillator("fm");
                this._oscillator = this._oscillator;
                this._oscillator.type = type.substr(2);
            }
            else if (type.substr(0, 2) === "am") {
                this._createNewOscillator("am");
                this._oscillator = this._oscillator;
                this._oscillator.type = type.substr(2);
            }
            else if (type.substr(0, 3) === "fat") {
                this._createNewOscillator("fat");
                this._oscillator = this._oscillator;
                this._oscillator.type = type.substr(3);
            }
            else if (type === "pwm") {
                this._createNewOscillator("pwm");
                this._oscillator = this._oscillator;
            }
            else if (type === "pulse") {
                this._createNewOscillator("pulse");
            }
            else {
                this._createNewOscillator("oscillator");
                this._oscillator = this._oscillator;
                this._oscillator.type = type;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "partials", {
        /**
         * The value is an empty array when the type is not "custom".
         * This is not available on "pwm" and "pulse" oscillator types.
         * See [[Oscillator.partials]]
         */
        get: function () {
            return this._oscillator.partials;
        },
        set: function (partials) {
            if (!this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm")) {
                this._oscillator.partials = partials;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "partialCount", {
        get: function () {
            return this._oscillator.partialCount;
        },
        set: function (partialCount) {
            if (!this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm")) {
                this._oscillator.partialCount = partialCount;
            }
        },
        enumerable: true,
        configurable: true
    });
    OmniOscillator.prototype.set = function (props) {
        // make sure the type is set first
        if (Reflect.has(props, "type") && props.type) {
            this.type = props.type;
        }
        // then set the rest
        _super.prototype.set.call(this, props);
        return this;
    };
    /**
     * connect the oscillator to the frequency and detune signals
     */
    OmniOscillator.prototype._createNewOscillator = function (oscType) {
        var _this = this;
        if (oscType !== this._sourceType) {
            this._sourceType = oscType;
            var OscConstructor = OmniOscillatorSourceMap[oscType];
            // short delay to avoid clicks on the change
            var now = this.now();
            if (this._oscillator) {
                var oldOsc_1 = this._oscillator;
                oldOsc_1.stop(now);
                // dispose the old one
                this.context.setTimeout(function () { return oldOsc_1.dispose(); }, this.blockTime);
            }
            this._oscillator = new OscConstructor({
                context: this.context,
            });
            this.frequency.connect(this._oscillator.frequency);
            this.detune.connect(this._oscillator.detune);
            this._oscillator.connect(this.output);
            this._oscillator.onstop = function () { return _this.onstop(_this); };
            if (this.state === "started") {
                this._oscillator.start(now);
            }
        }
    };
    Object.defineProperty(OmniOscillator.prototype, "phase", {
        get: function () {
            return this._oscillator.phase;
        },
        set: function (phase) {
            this._oscillator.phase = phase;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "sourceType", {
        /**
         * The source type of the oscillator.
         * @example
         * import { OmniOscillator } from "tone";
         * const omniOsc = new OmniOscillator(440, "fmsquare");
         * console.log(omniOsc.sourceType); // 'fm'
         */
        get: function () {
            return this._sourceType;
        },
        set: function (sType) {
            // the basetype defaults to sine
            var baseType = "sine";
            if (this._oscillator.type !== "pwm" && this._oscillator.type !== "pulse") {
                baseType = this._oscillator.type;
            }
            // set the type
            if (sType === "fm") {
                this.type = "fm" + baseType;
            }
            else if (sType === "am") {
                this.type = "am" + baseType;
            }
            else if (sType === "fat") {
                this.type = "fat" + baseType;
            }
            else if (sType === "oscillator") {
                this.type = baseType;
            }
            else if (sType === "pulse") {
                this.type = "pulse";
            }
            else if (sType === "pwm") {
                this.type = "pwm";
            }
        },
        enumerable: true,
        configurable: true
    });
    OmniOscillator.prototype._getOscType = function (osc, sourceType) {
        return osc instanceof OmniOscillatorSourceMap[sourceType];
    };
    Object.defineProperty(OmniOscillator.prototype, "baseType", {
        /**
         * The base type of the oscillator. See [[Oscillator.baseType]]
         * @example
         * import { OmniOscillator } from "tone";
         * const omniOsc = new OmniOscillator(440, "fmsquare4");
         * omniOsc.sourceType; // 'fm'
         * omniOsc.baseType; // 'square'
         * omniOsc.partialCount; // 4
         */
        get: function () {
            return this._oscillator.baseType;
        },
        set: function (baseType) {
            if (!this._getOscType(this._oscillator, "pulse") &&
                !this._getOscType(this._oscillator, "pwm") &&
                baseType !== "pulse" && baseType !== "pwm") {
                this._oscillator.baseType = baseType;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "width", {
        /**
         * The width of the oscillator when sourceType === "pulse".
         * See [[PWMOscillator.width]]
         * @example
         * import { OmniOscillator } from "tone";
         * const omniOsc = new OmniOscillator(440, "pulse");
         * // can access the width attribute only if type === "pulse"
         * omniOsc.width.value = 0.2;
         */
        get: function () {
            if (this._getOscType(this._oscillator, "pulse")) {
                return this._oscillator.width;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "count", {
        /**
         * The number of detuned oscillators when sourceType === "fat".
         * See [[FatOscillator.count]]
         */
        get: function () {
            if (this._getOscType(this._oscillator, "fat")) {
                return this._oscillator.count;
            }
            else {
                return undefined;
            }
        },
        set: function (count) {
            if (this._getOscType(this._oscillator, "fat") && isNumber(count)) {
                this._oscillator.count = count;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "spread", {
        /**
         * The detune spread between the oscillators when sourceType === "fat".
         * See [[FatOscillator.count]]
         */
        get: function () {
            if (this._getOscType(this._oscillator, "fat")) {
                return this._oscillator.spread;
            }
            else {
                return undefined;
            }
        },
        set: function (spread) {
            if (this._getOscType(this._oscillator, "fat") && isNumber(spread)) {
                this._oscillator.spread = spread;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "modulationType", {
        /**
         * The type of the modulator oscillator. Only if the oscillator is set to "am" or "fm" types.
         * See [[AMOscillator]] or [[FMOscillator]]
         */
        get: function () {
            if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) {
                return this._oscillator.modulationType;
            }
            else {
                return undefined;
            }
        },
        set: function (mType) {
            if ((this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) && isString(mType)) {
                this._oscillator.modulationType = mType;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "modulationIndex", {
        /**
         * The modulation index when the sourceType === "fm"
         * See [[FMOscillator]].
         */
        get: function () {
            if (this._getOscType(this._oscillator, "fm")) {
                return this._oscillator.modulationIndex;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "harmonicity", {
        /**
         * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
         * See [[AMOscillator]] or [[FMOscillator]]
         */
        get: function () {
            if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) {
                return this._oscillator.harmonicity;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OmniOscillator.prototype, "modulationFrequency", {
        /**
         * The modulationFrequency Signal of the oscillator when sourceType === "pwm"
         * see [[PWMOscillator]]
         * @min 0.1
         * @max 5
         */
        get: function () {
            if (this._getOscType(this._oscillator, "pwm")) {
                return this._oscillator.modulationFrequency;
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    OmniOscillator.prototype.asArray = function (length) {
        if (length === void 0) { length = 1024; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, generateWaveform(this, length)];
            });
        });
    };
    OmniOscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.detune.dispose();
        this.frequency.dispose();
        this._oscillator.dispose();
        return this;
    };
    return OmniOscillator;
}(Source));
export { OmniOscillator };
//# sourceMappingURL=OmniOscillator.js.map
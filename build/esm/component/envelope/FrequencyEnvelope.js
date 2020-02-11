import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Envelope } from "./Envelope";
import { Scale } from "../../signal/Scale";
import { Pow } from "../../signal/Pow";
import { assertRange } from "../../core/util/Debug";
/**
 * FrequencyEnvelope is an [[Envelope]] which ramps between [[baseFrequency]]
 * and [[octaves]]. It can also have an optional [[exponent]] to adjust the curve
 * which it ramps.
 * @example
 * import { FrequencyEnvelope, Oscillator } from "tone";
 * const oscillator = new Oscillator().toDestination().start();
 * const freqEnv = new FrequencyEnvelope({
 * 	attack: 0.2,
 * 	baseFrequency: "C2",
 * 	octaves: 4
 * });
 * freqEnv.connect(oscillator.frequency);
 * freqEnv.triggerAttack();
 */
var FrequencyEnvelope = /** @class */ (function (_super) {
    tslib_1.__extends(FrequencyEnvelope, _super);
    function FrequencyEnvelope() {
        var _this = _super.call(this, optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"])) || this;
        _this.name = "FrequencyEnvelope";
        var options = optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
        _this._octaves = options.octaves;
        _this._baseFrequency = _this.toFrequency(options.baseFrequency);
        _this._exponent = _this.input = new Pow({
            context: _this.context,
            value: options.exponent
        });
        _this._scale = _this.output = new Scale({
            context: _this.context,
            min: _this._baseFrequency,
            max: _this._baseFrequency * Math.pow(2, _this._octaves),
        });
        _this._sig.chain(_this._exponent, _this._scale);
        return _this;
    }
    FrequencyEnvelope.getDefaults = function () {
        return Object.assign(Envelope.getDefaults(), {
            baseFrequency: 200,
            exponent: 1,
            octaves: 4,
        });
    };
    Object.defineProperty(FrequencyEnvelope.prototype, "baseFrequency", {
        /**
         * The envelope's minimum output value. This is the value which it
         * starts at.
         */
        get: function () {
            return this._baseFrequency;
        },
        set: function (min) {
            var freq = this.toFrequency(min);
            assertRange(freq, 0);
            this._baseFrequency = freq;
            this._scale.min = this._baseFrequency;
            // update the max value when the min changes
            this.octaves = this._octaves;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FrequencyEnvelope.prototype, "octaves", {
        /**
         * The number of octaves above the baseFrequency that the
         * envelope will scale to.
         */
        get: function () {
            return this._octaves;
        },
        set: function (octaves) {
            assertRange(octaves, 0);
            this._octaves = octaves;
            this._scale.max = this._baseFrequency * Math.pow(2, octaves);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FrequencyEnvelope.prototype, "exponent", {
        /**
         * The envelope's exponent value.
         */
        get: function () {
            return this._exponent.value;
        },
        set: function (exponent) {
            this._exponent.value = exponent;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up
     */
    FrequencyEnvelope.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._exponent.dispose();
        this._scale.dispose();
        return this;
    };
    return FrequencyEnvelope;
}(Envelope));
export { FrequencyEnvelope };
//# sourceMappingURL=FrequencyEnvelope.js.map
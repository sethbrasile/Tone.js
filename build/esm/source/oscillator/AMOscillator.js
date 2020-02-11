import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { AudioToGain } from "../../signal/AudioToGain";
import { Multiply } from "../../signal/Multiply";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { generateWaveform } from "./OscillatorInterface";
/**
 * An amplitude modulated oscillator node. It is implemented with
 * two oscillators, one which modulators the other's amplitude
 * through a gain node.
 * ```
 *    +-------------+       +----------+
 *    | Carrier Osc +>------> GainNode |
 *    +-------------+       |          +--->Output
 *                      +---> gain     |
 * +---------------+    |   +----------+
 * | Modulator Osc +>---+
 * +---------------+
 * ```
 *
 * @example
 * import { AMOscillator } from "tone";
 * // a sine oscillator amplitude-modulated by a square wave
 * const amOsc = new AMOscillator("Ab3", "sine", "square").toDestination().start().stop("+5");
 * // schedule a series of notes
 * amOsc.frequency.setValueAtTime("F3", "+0.25");
 * amOsc.frequency.setValueAtTime("C4", "+0.5");
 * amOsc.frequency.setValueAtTime("Bb3", "+1");
 * // schedule harmonicity changes along with those notes
 * amOsc.harmonicity.setValueAtTime(0.5, "+0.25");
 * amOsc.harmonicity.setValueAtTime(1, "+1");
 * amOsc.harmonicity.linearRampTo(1.1, 2, "+1");
 * // fade it out all the way at the end
 * amOsc.volume.exponentialRampTo(-Infinity, 3, "+2,");
 * @category Source
 */
var AMOscillator = /** @class */ (function (_super) {
    tslib_1.__extends(AMOscillator, _super);
    function AMOscillator() {
        var _this = _super.call(this, optionsFromArguments(AMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"])) || this;
        _this.name = "AMOscillator";
        /**
         * convert the -1,1 output to 0,1
         */
        _this._modulationScale = new AudioToGain({ context: _this.context });
        /**
         * the node where the modulation happens
         */
        _this._modulationNode = new Gain({
            context: _this.context,
        });
        var options = optionsFromArguments(AMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
        _this._carrier = new Oscillator({
            context: _this.context,
            detune: options.detune,
            frequency: options.frequency,
            onstop: function () { return _this.onstop(_this); },
            phase: options.phase,
            type: options.type,
        });
        _this.frequency = _this._carrier.frequency,
            _this.detune = _this._carrier.detune;
        _this._modulator = new Oscillator({
            context: _this.context,
            phase: options.phase,
            type: options.modulationType,
        });
        _this.harmonicity = new Multiply({
            context: _this.context,
            units: "positive",
            value: options.harmonicity,
        });
        // connections
        _this.frequency.chain(_this.harmonicity, _this._modulator.frequency);
        _this._modulator.chain(_this._modulationScale, _this._modulationNode.gain);
        _this._carrier.chain(_this._modulationNode, _this.output);
        readOnly(_this, ["frequency", "detune", "harmonicity"]);
        return _this;
    }
    AMOscillator.getDefaults = function () {
        return Object.assign(Oscillator.getDefaults(), {
            harmonicity: 1,
            modulationType: "square",
        });
    };
    /**
     * start the oscillator
     */
    AMOscillator.prototype._start = function (time) {
        this._modulator.start(time);
        this._carrier.start(time);
    };
    /**
     * stop the oscillator
     */
    AMOscillator.prototype._stop = function (time) {
        this._modulator.stop(time);
        this._carrier.stop(time);
    };
    AMOscillator.prototype._restart = function (time) {
        this._modulator.restart(time);
        this._carrier.restart(time);
    };
    Object.defineProperty(AMOscillator.prototype, "type", {
        /**
         * The type of the carrier oscillator
         */
        get: function () {
            return this._carrier.type;
        },
        set: function (type) {
            this._carrier.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMOscillator.prototype, "baseType", {
        get: function () {
            return this._carrier.baseType;
        },
        set: function (baseType) {
            this._carrier.baseType = baseType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMOscillator.prototype, "partialCount", {
        get: function () {
            return this._carrier.partialCount;
        },
        set: function (partialCount) {
            this._carrier.partialCount = partialCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMOscillator.prototype, "modulationType", {
        /**
         * The type of the modulator oscillator
         */
        get: function () {
            return this._modulator.type;
        },
        set: function (type) {
            this._modulator.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMOscillator.prototype, "phase", {
        get: function () {
            return this._carrier.phase;
        },
        set: function (phase) {
            this._carrier.phase = phase;
            this._modulator.phase = phase;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMOscillator.prototype, "partials", {
        get: function () {
            return this._carrier.partials;
        },
        set: function (partials) {
            this._carrier.partials = partials;
        },
        enumerable: true,
        configurable: true
    });
    AMOscillator.prototype.asArray = function (length) {
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
    AMOscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.frequency.dispose();
        this.detune.dispose();
        this.harmonicity.dispose();
        this._carrier.dispose();
        this._modulator.dispose();
        this._modulationNode.dispose();
        this._modulationScale.dispose();
        return this;
    };
    return AMOscillator;
}(Source));
export { AMOscillator };
//# sourceMappingURL=AMOscillator.js.map
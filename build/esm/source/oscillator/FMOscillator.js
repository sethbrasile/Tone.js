import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { Multiply } from "../../signal/Multiply";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { generateWaveform } from "./OscillatorInterface";
/**
 * FMOscillator implements a frequency modulation synthesis
 * ```
 *                                              +-------------+
 * +---------------+        +-------------+     | Carrier Osc |
 * | Modulator Osc +>-------> GainNode    |     |             +--->Output
 * +---------------+        |             +>----> frequency   |
 *                       +--> gain        |     +-------------+
 *                       |  +-------------+
 * +-----------------+   |
 * | modulationIndex +>--+
 * +-----------------+
 * ```
 *
 * @example
 * import { FMOscillator } from "tone";
 * // a sine oscillator frequency-modulated by a square wave
 * const fmOsc = new FMOscillator("Ab3", "sine", "square").toDestination().start();
 * @category Source
 */
var FMOscillator = /** @class */ (function (_super) {
    tslib_1.__extends(FMOscillator, _super);
    function FMOscillator() {
        var _this = _super.call(this, optionsFromArguments(FMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"])) || this;
        _this.name = "FMOscillator";
        /**
         * the node where the modulation happens
         */
        _this._modulationNode = new Gain({
            context: _this.context,
            gain: 0,
        });
        var options = optionsFromArguments(FMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
        _this._carrier = new Oscillator({
            context: _this.context,
            detune: options.detune,
            frequency: 0,
            onstop: function () { return _this.onstop(_this); },
            phase: options.phase,
            type: options.type,
        });
        _this.detune = _this._carrier.detune;
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: options.frequency,
        });
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
        _this.modulationIndex = new Multiply({
            context: _this.context,
            units: "positive",
            value: options.modulationIndex,
        });
        // connections
        _this.frequency.connect(_this._carrier.frequency);
        _this.frequency.chain(_this.harmonicity, _this._modulator.frequency);
        _this.frequency.chain(_this.modulationIndex, _this._modulationNode);
        _this._modulator.connect(_this._modulationNode.gain);
        _this._modulationNode.connect(_this._carrier.frequency);
        _this._carrier.connect(_this.output);
        _this.detune.connect(_this._modulator.detune);
        readOnly(_this, ["modulationIndex", "frequency", "detune", "harmonicity"]);
        return _this;
    }
    FMOscillator.getDefaults = function () {
        return Object.assign(Oscillator.getDefaults(), {
            harmonicity: 1,
            modulationIndex: 2,
            modulationType: "square",
        });
    };
    /**
     * start the oscillator
     */
    FMOscillator.prototype._start = function (time) {
        this._modulator.start(time);
        this._carrier.start(time);
    };
    /**
     * stop the oscillator
     */
    FMOscillator.prototype._stop = function (time) {
        this._modulator.stop(time);
        this._carrier.stop(time);
    };
    FMOscillator.prototype._restart = function (time) {
        this._modulator.restart(time);
        this._carrier.restart(time);
        return this;
    };
    Object.defineProperty(FMOscillator.prototype, "type", {
        get: function () {
            return this._carrier.type;
        },
        set: function (type) {
            this._carrier.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FMOscillator.prototype, "baseType", {
        get: function () {
            return this._carrier.baseType;
        },
        set: function (baseType) {
            this._carrier.baseType = baseType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FMOscillator.prototype, "partialCount", {
        get: function () {
            return this._carrier.partialCount;
        },
        set: function (partialCount) {
            this._carrier.partialCount = partialCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FMOscillator.prototype, "modulationType", {
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
    Object.defineProperty(FMOscillator.prototype, "phase", {
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
    Object.defineProperty(FMOscillator.prototype, "partials", {
        get: function () {
            return this._carrier.partials;
        },
        set: function (partials) {
            this._carrier.partials = partials;
        },
        enumerable: true,
        configurable: true
    });
    FMOscillator.prototype.asArray = function (length) {
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
    FMOscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.frequency.dispose();
        this.harmonicity.dispose();
        this._carrier.dispose();
        this._modulator.dispose();
        this._modulationNode.dispose();
        this.modulationIndex.dispose();
        return this;
    };
    return FMOscillator;
}(Source));
export { FMOscillator };
//# sourceMappingURL=FMOscillator.js.map
import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../../core/util/Defaults";
import { noOp, readOnly } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { Oscillator } from "./Oscillator";
import { generateWaveform } from "./OscillatorInterface";
import { assertRange } from "../../core/util/Debug";
/**
 * FatOscillator is an array of oscillators with detune spread between the oscillators
 * @example
 * import { FatOscillator } from "tone";
 * const fatOsc = new FatOscillator("Ab3", "sawtooth", 40).toDestination().start();
 * @category Source
 */
var FatOscillator = /** @class */ (function (_super) {
    tslib_1.__extends(FatOscillator, _super);
    function FatOscillator() {
        var _this = _super.call(this, optionsFromArguments(FatOscillator.getDefaults(), arguments, ["frequency", "type", "spread"])) || this;
        _this.name = "FatOscillator";
        /**
         * The array of oscillators
         */
        _this._oscillators = [];
        var options = optionsFromArguments(FatOscillator.getDefaults(), arguments, ["frequency", "type", "spread"]);
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
        _this._spread = options.spread;
        _this._type = options.type;
        _this._phase = options.phase;
        _this._partials = options.partials;
        _this._partialCount = options.partialCount;
        // set the count initially
        _this.count = options.count;
        readOnly(_this, ["frequency", "detune"]);
        return _this;
    }
    FatOscillator.getDefaults = function () {
        return Object.assign(Oscillator.getDefaults(), {
            count: 3,
            spread: 20,
            type: "sawtooth",
        });
    };
    /**
     * start the oscillator
     */
    FatOscillator.prototype._start = function (time) {
        time = this.toSeconds(time);
        this._forEach(function (osc) { return osc.start(time); });
    };
    /**
     * stop the oscillator
     */
    FatOscillator.prototype._stop = function (time) {
        time = this.toSeconds(time);
        this._forEach(function (osc) { return osc.stop(time); });
    };
    FatOscillator.prototype._restart = function (time) {
        this._forEach(function (osc) { return osc.restart(time); });
    };
    /**
     * Iterate over all of the oscillators
     */
    FatOscillator.prototype._forEach = function (iterator) {
        for (var i = 0; i < this._oscillators.length; i++) {
            iterator(this._oscillators[i], i);
        }
    };
    Object.defineProperty(FatOscillator.prototype, "type", {
        /**
         * The type of the oscillator
         */
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._type = type;
            this._forEach(function (osc) { return osc.type = type; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatOscillator.prototype, "spread", {
        /**
         * The detune spread between the oscillators. If "count" is
         * set to 3 oscillators and the "spread" is set to 40,
         * the three oscillators would be detuned like this: [-20, 0, 20]
         * for a total detune spread of 40 cents.
         * @example
         * import { FatOscillator } from "tone";
         * const fatOsc = new FatOscillator().toDestination().start();
         * fatOsc.spread = 70;
         */
        get: function () {
            return this._spread;
        },
        set: function (spread) {
            this._spread = spread;
            if (this._oscillators.length > 1) {
                var start_1 = -spread / 2;
                var step_1 = spread / (this._oscillators.length - 1);
                this._forEach(function (osc, i) { return osc.detune.value = start_1 + step_1 * i; });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatOscillator.prototype, "count", {
        /**
         * The number of detuned oscillators. Must be an integer greater than 1.
         * @example
         * import { FatOscillator } from "tone";
         * const fatOsc = new FatOscillator("C#3", "sawtooth").toDestination().start();
         * // use 4 sawtooth oscillators
         * fatOsc.count = 4;
         */
        get: function () {
            return this._oscillators.length;
        },
        set: function (count) {
            var _this = this;
            assertRange(count, 1);
            if (this._oscillators.length !== count) {
                // dispose the previous oscillators
                this._forEach(function (osc) { return osc.dispose(); });
                this._oscillators = [];
                for (var i = 0; i < count; i++) {
                    var osc = new Oscillator({
                        context: this.context,
                        volume: -6 - count * 1.1,
                        type: this._type,
                        phase: this._phase + (i / count) * 360,
                        partialCount: this._partialCount,
                        onstop: i === 0 ? function () { return _this.onstop(_this); } : noOp,
                    });
                    if (this.type === "custom") {
                        osc.partials = this._partials;
                    }
                    this.frequency.connect(osc.frequency);
                    this.detune.connect(osc.detune);
                    osc.detune.overridden = false;
                    osc.connect(this.output);
                    this._oscillators[i] = osc;
                }
                // set the spread
                this.spread = this._spread;
                if (this.state === "started") {
                    this._forEach(function (osc) { return osc.start(); });
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatOscillator.prototype, "phase", {
        get: function () {
            return this._phase;
        },
        set: function (phase) {
            this._phase = phase;
            this._forEach(function (osc) { return osc.phase = phase; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatOscillator.prototype, "baseType", {
        get: function () {
            return this._oscillators[0].baseType;
        },
        set: function (baseType) {
            this._forEach(function (osc) { return osc.baseType = baseType; });
            this._type = this._oscillators[0].type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatOscillator.prototype, "partials", {
        get: function () {
            return this._oscillators[0].partials;
        },
        set: function (partials) {
            this._partials = partials;
            this._partialCount = this._partials.length;
            if (partials.length) {
                this._type = "custom";
                this._forEach(function (osc) { return osc.partials = partials; });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FatOscillator.prototype, "partialCount", {
        get: function () {
            return this._oscillators[0].partialCount;
        },
        set: function (partialCount) {
            this._partialCount = partialCount;
            this._forEach(function (osc) { return osc.partialCount = partialCount; });
            this._type = this._oscillators[0].type;
        },
        enumerable: true,
        configurable: true
    });
    FatOscillator.prototype.asArray = function (length) {
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
    FatOscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.frequency.dispose();
        this.detune.dispose();
        this._forEach(function (osc) { return osc.dispose(); });
        return this;
    };
    return FatOscillator;
}(Source));
export { FatOscillator };
//# sourceMappingURL=FatOscillator.js.map
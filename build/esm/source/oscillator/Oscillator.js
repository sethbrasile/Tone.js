import * as tslib_1 from "tslib";
import { deepEquals, optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { isDefined } from "../../core/util/TypeCheck";
import { Signal } from "../../signal/Signal";
import { Source } from "../Source";
import { generateWaveform } from "./OscillatorInterface";
import { ToneOscillatorNode } from "./ToneOscillatorNode";
import { assertRange } from "../../core/util/Debug";
import { clamp } from "../../core/util/Math";
/**
 * Oscillator supports a number of features including
 * phase rotation, multiple oscillator types (see Oscillator.type),
 * and Transport syncing (see Oscillator.syncFrequency).
 *
 * @example
 * import { Oscillator } from "tone";
 * // make and start a 440hz sine tone
 * const osc = new Oscillator(440, "sine").toDestination().start();
 * @category Source
 */
var Oscillator = /** @class */ (function (_super) {
    tslib_1.__extends(Oscillator, _super);
    function Oscillator() {
        var _this = _super.call(this, optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"])) || this;
        _this.name = "Oscillator";
        /**
         * the main oscillator
         */
        _this._oscillator = null;
        var options = optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]);
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: options.frequency,
        });
        readOnly(_this, "frequency");
        _this.detune = new Signal({
            context: _this.context,
            units: "cents",
            value: options.detune,
        });
        readOnly(_this, "detune");
        _this._partials = options.partials;
        _this._partialCount = options.partialCount;
        _this._type = options.type;
        if (options.partialCount && options.type !== "custom") {
            _this._type = _this.baseType + options.partialCount.toString();
        }
        _this.phase = options.phase;
        return _this;
    }
    Oscillator.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            detune: 0,
            frequency: 440,
            partialCount: 0,
            partials: [],
            phase: 0,
            type: "sine",
        });
    };
    /**
     * start the oscillator
     */
    Oscillator.prototype._start = function (time) {
        var _this = this;
        var computedTime = this.toSeconds(time);
        // new oscillator with previous values
        var oscillator = new ToneOscillatorNode({
            context: this.context,
            onended: function () { return _this.onstop(_this); },
        });
        this._oscillator = oscillator;
        if (this._wave) {
            this._oscillator.setPeriodicWave(this._wave);
        }
        else {
            this._oscillator.type = this._type;
        }
        // connect the control signal to the oscillator frequency & detune
        this._oscillator.connect(this.output);
        this.frequency.connect(this._oscillator.frequency);
        this.detune.connect(this._oscillator.detune);
        // start the oscillator
        this._oscillator.start(computedTime);
    };
    /**
     * stop the oscillator
     */
    Oscillator.prototype._stop = function (time) {
        var computedTime = this.toSeconds(time);
        if (this._oscillator) {
            this._oscillator.stop(computedTime);
        }
    };
    /**
     * Restart the oscillator. Does not stop the oscillator, but instead
     * just cancels any scheduled 'stop' from being invoked.
     */
    Oscillator.prototype._restart = function (time) {
        var computedTime = this.toSeconds(time);
        this.log("restart", computedTime);
        if (this._oscillator) {
            this._oscillator.cancelStop();
        }
        this._state.cancel(computedTime);
        return this;
    };
    /**
     * Sync the signal to the Transport's bpm. Any changes to the transports bpm,
     * will also affect the oscillators frequency.
     * @example
     * import { Oscillator, Transport } from "tone";
     * const osc = new Oscillator().toDestination().start();
     * osc.frequency.value = 440;
     * // the ratio between the bpm and the frequency will be maintained
     * osc.syncFrequency();
     * // double the tempo
     * Transport.bpm.value *= 2;
     * // the frequency of the oscillator is doubled to 880
     */
    Oscillator.prototype.syncFrequency = function () {
        this.context.transport.syncSignal(this.frequency);
        return this;
    };
    /**
     * Unsync the oscillator's frequency from the Transport.
     * See Oscillator.syncFrequency
     */
    Oscillator.prototype.unsyncFrequency = function () {
        this.context.transport.unsyncSignal(this.frequency);
        return this;
    };
    /**
     * Get a cached periodic wave. Avoids having to recompute
     * the oscillator values when they have already been computed
     * with the same values.
     */
    Oscillator.prototype._getCachedPeriodicWave = function () {
        var _this = this;
        if (this._type === "custom") {
            var oscProps = Oscillator._periodicWaveCache.find(function (description) {
                return description.phase === _this._phase &&
                    deepEquals(description.partials, _this._partials);
            });
            return oscProps;
        }
        else {
            var oscProps = Oscillator._periodicWaveCache.find(function (description) {
                return description.type === _this._type &&
                    description.phase === _this._phase;
            });
            this._partialCount = oscProps ? oscProps.partialCount : this._partialCount;
            return oscProps;
        }
    };
    Object.defineProperty(Oscillator.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._type = type;
            var isBasicType = ["sine", "square", "sawtooth", "triangle"].indexOf(type) !== -1;
            if (this._phase === 0 && isBasicType) {
                this._wave = undefined;
                this._partialCount = 0;
                // just go with the basic approach
                if (this._oscillator !== null) {
                    // already tested that it's a basic type
                    this._oscillator.type = type;
                }
            }
            else {
                // first check if the value is cached
                var cache = this._getCachedPeriodicWave();
                if (isDefined(cache)) {
                    var partials = cache.partials, wave = cache.wave;
                    this._wave = wave;
                    this._partials = partials;
                    if (this._oscillator !== null) {
                        this._oscillator.setPeriodicWave(this._wave);
                    }
                }
                else {
                    var _a = tslib_1.__read(this._getRealImaginary(type, this._phase), 2), real = _a[0], imag = _a[1];
                    var periodicWave = this.context.createPeriodicWave(real, imag);
                    this._wave = periodicWave;
                    if (this._oscillator !== null) {
                        this._oscillator.setPeriodicWave(this._wave);
                    }
                    // set the cache
                    Oscillator._periodicWaveCache.push({
                        imag: imag,
                        partialCount: this._partialCount,
                        partials: this._partials,
                        phase: this._phase,
                        real: real,
                        type: this._type,
                        wave: this._wave,
                    });
                    if (Oscillator._periodicWaveCache.length > 100) {
                        Oscillator._periodicWaveCache.shift();
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Oscillator.prototype, "baseType", {
        get: function () {
            return this._type.replace(this.partialCount.toString(), "");
        },
        set: function (baseType) {
            if (this.partialCount && this._type !== "custom" && baseType !== "custom") {
                this.type = baseType + this.partialCount;
            }
            else {
                this.type = baseType;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Oscillator.prototype, "partialCount", {
        get: function () {
            return this._partialCount;
        },
        set: function (p) {
            assertRange(p, 0);
            var type = this._type;
            var partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
            if (partial) {
                type = partial[1];
            }
            if (this._type !== "custom") {
                if (p === 0) {
                    this.type = type;
                }
                else {
                    this.type = type + p.toString();
                }
            }
            else {
                // extend or shorten the partials array
                var fullPartials_1 = new Float32Array(p);
                // copy over the partials array
                this._partials.forEach(function (v, i) { return fullPartials_1[i] = v; });
                this._partials = Array.from(fullPartials_1);
                this.type = this._type;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the real and imaginary components based
     * on the oscillator type.
     * @returns [real: Float32Array, imaginary: Float32Array]
     */
    Oscillator.prototype._getRealImaginary = function (type, phase) {
        var fftSize = 4096;
        var periodicWaveSize = fftSize / 2;
        var real = new Float32Array(periodicWaveSize);
        var imag = new Float32Array(periodicWaveSize);
        var partialCount = 1;
        if (type === "custom") {
            partialCount = this._partials.length + 1;
            this._partialCount = this._partials.length;
            periodicWaveSize = partialCount;
            // if the partial count is 0, don't bother doing any computation
            if (this._partials.length === 0) {
                return [real, imag];
            }
        }
        else {
            var partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(type);
            if (partial) {
                partialCount = parseInt(partial[2], 10) + 1;
                this._partialCount = parseInt(partial[2], 10);
                type = partial[1];
                partialCount = Math.max(partialCount, 2);
                periodicWaveSize = partialCount;
            }
            else {
                this._partialCount = 0;
            }
            this._partials = [];
        }
        for (var n = 1; n < periodicWaveSize; ++n) {
            var piFactor = 2 / (n * Math.PI);
            var b = void 0;
            switch (type) {
                case "sine":
                    b = (n <= partialCount) ? 1 : 0;
                    this._partials[n - 1] = b;
                    break;
                case "square":
                    b = (n & 1) ? 2 * piFactor : 0;
                    this._partials[n - 1] = b;
                    break;
                case "sawtooth":
                    b = piFactor * ((n & 1) ? 1 : -1);
                    this._partials[n - 1] = b;
                    break;
                case "triangle":
                    if (n & 1) {
                        b = 2 * (piFactor * piFactor) * ((((n - 1) >> 1) & 1) ? -1 : 1);
                    }
                    else {
                        b = 0;
                    }
                    this._partials[n - 1] = b;
                    break;
                case "custom":
                    b = this._partials[n - 1];
                    break;
                default:
                    throw new TypeError("Oscillator: invalid type: " + type);
            }
            if (b !== 0) {
                real[n] = -b * Math.sin(phase * n);
                imag[n] = b * Math.cos(phase * n);
            }
            else {
                real[n] = 0;
                imag[n] = 0;
            }
        }
        return [real, imag];
    };
    /**
     * Compute the inverse FFT for a given phase.
     */
    Oscillator.prototype._inverseFFT = function (real, imag, phase) {
        var sum = 0;
        var len = real.length;
        for (var i = 0; i < len; i++) {
            sum += real[i] * Math.cos(i * phase) + imag[i] * Math.sin(i * phase);
        }
        return sum;
    };
    /**
     * Returns the initial value of the oscillator when stopped.
     * E.g. a "sine" oscillator with phase = 90 would return an initial value of -1.
     */
    Oscillator.prototype.getInitialValue = function () {
        var _a = tslib_1.__read(this._getRealImaginary(this._type, 0), 2), real = _a[0], imag = _a[1];
        var maxValue = 0;
        var twoPi = Math.PI * 2;
        var testPositions = 32;
        // check for peaks in 16 places
        for (var i = 0; i < testPositions; i++) {
            maxValue = Math.max(this._inverseFFT(real, imag, (i / testPositions) * twoPi), maxValue);
        }
        return clamp(-this._inverseFFT(real, imag, this._phase) / maxValue, -1, 1);
    };
    Object.defineProperty(Oscillator.prototype, "partials", {
        get: function () {
            return this._partials.slice(0, this.partialCount);
        },
        set: function (partials) {
            this._partials = partials;
            this._partialCount = this._partials.length;
            if (partials.length) {
                this.type = "custom";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Oscillator.prototype, "phase", {
        get: function () {
            return this._phase * (180 / Math.PI);
        },
        set: function (phase) {
            this._phase = phase * Math.PI / 180;
            // reset the type
            this.type = this._type;
        },
        enumerable: true,
        configurable: true
    });
    Oscillator.prototype.asArray = function (length) {
        if (length === void 0) { length = 1024; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, generateWaveform(this, length)];
            });
        });
    };
    Oscillator.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._oscillator !== null) {
            this._oscillator.dispose();
        }
        this._wave = undefined;
        this.frequency.dispose();
        this.detune.dispose();
        return this;
    };
    /**
     * Cache the periodic waves to avoid having to redo computations
     */
    Oscillator._periodicWaveCache = [];
    return Oscillator;
}(Source));
export { Oscillator };
//# sourceMappingURL=Oscillator.js.map
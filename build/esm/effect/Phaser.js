import * as tslib_1 from "tslib";
import { StereoEffect } from "./StereoEffect";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFO } from "../source/oscillator/LFO";
import { Signal } from "../signal/Signal";
import { readOnly } from "../core/util/Interface";
/**
 * Phaser is a phaser effect. Phasers work by changing the phase
 * of different frequency components of an incoming signal. Read more on
 * [Wikipedia](https://en.wikipedia.org/wiki/Phaser_(effect)).
 * Inspiration for this phaser comes from [Tuna.js](https://github.com/Dinahmoe/tuna/).
 * @example
 * import { FMSynth, Phaser } from "tone";
 * const phaser = new Phaser({
 * 	frequency: 15,
 * 	octaves: 5,
 * 	baseFrequency: 1000
 * }).toDestination();
 * const synth = new FMSynth().connect(phaser);
 * synth.triggerAttackRelease("E3", "2n");
 * @category Effect
 */
var Phaser = /** @class */ (function (_super) {
    tslib_1.__extends(Phaser, _super);
    function Phaser() {
        var _this = _super.call(this, optionsFromArguments(Phaser.getDefaults(), arguments, ["frequency", "octaves", "baseFrequency"])) || this;
        _this.name = "Phaser";
        var options = optionsFromArguments(Phaser.getDefaults(), arguments, ["frequency", "octaves", "baseFrequency"]);
        _this._lfoL = new LFO({
            context: _this.context,
            frequency: options.frequency,
            min: 0,
            max: 1
        });
        _this._lfoR = new LFO({
            context: _this.context,
            frequency: options.frequency,
            min: 0,
            max: 1,
            phase: 180,
        });
        _this._baseFrequency = _this.toFrequency(options.baseFrequency);
        _this._octaves = options.octaves;
        _this.Q = new Signal({
            context: _this.context,
            value: options.Q,
            units: "positive",
        });
        _this._filtersL = _this._makeFilters(options.stages, _this._lfoL);
        _this._filtersR = _this._makeFilters(options.stages, _this._lfoR);
        _this.frequency = _this._lfoL.frequency;
        _this.frequency.value = options.frequency;
        // connect them up
        _this.connectEffectLeft.apply(_this, tslib_1.__spread(_this._filtersL));
        _this.connectEffectRight.apply(_this, tslib_1.__spread(_this._filtersR));
        // control the frequency with one LFO
        _this._lfoL.frequency.connect(_this._lfoR.frequency);
        // set the options
        _this.baseFrequency = options.baseFrequency;
        _this.octaves = options.octaves;
        // start the lfo
        _this._lfoL.start();
        _this._lfoR.start();
        readOnly(_this, ["frequency", "Q"]);
        return _this;
    }
    Phaser.getDefaults = function () {
        return Object.assign(StereoEffect.getDefaults(), {
            frequency: 0.5,
            octaves: 3,
            stages: 10,
            Q: 10,
            baseFrequency: 350,
        });
    };
    Phaser.prototype._makeFilters = function (stages, connectToFreq) {
        var filters = [];
        // make all the filters
        for (var i = 0; i < stages; i++) {
            var filter = this.context.createBiquadFilter();
            filter.type = "allpass";
            this.Q.connect(filter.Q);
            connectToFreq.connect(filter.frequency);
            filters.push(filter);
        }
        return filters;
    };
    Object.defineProperty(Phaser.prototype, "octaves", {
        /**
         * The number of octaves the phase goes above the baseFrequency
         */
        get: function () {
            return this._octaves;
        },
        set: function (octaves) {
            this._octaves = octaves;
            var max = this._baseFrequency * Math.pow(2, octaves);
            this._lfoL.max = max;
            this._lfoR.max = max;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Phaser.prototype, "baseFrequency", {
        /**
         * The the base frequency of the filters.
         */
        get: function () {
            return this._baseFrequency;
        },
        set: function (freq) {
            this._baseFrequency = this.toFrequency(freq);
            this._lfoL.min = this._baseFrequency;
            this._lfoR.min = this._baseFrequency;
            this.octaves = this._octaves;
        },
        enumerable: true,
        configurable: true
    });
    Phaser.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.Q.dispose();
        this._lfoL.dispose();
        this._lfoR.dispose();
        this._filtersL.forEach(function (f) { return f.disconnect(); });
        this._filtersR.forEach(function (f) { return f.disconnect(); });
        this.frequency.dispose();
        return this;
    };
    return Phaser;
}(StereoEffect));
export { Phaser };
//# sourceMappingURL=Phaser.js.map
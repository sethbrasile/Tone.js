import * as tslib_1 from "tslib";
import { Envelope } from "../component/envelope/Envelope";
import { Filter } from "../component/filter/Filter";
import { Gain } from "../core/context/Gain";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { deepMerge, omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
import { Multiply } from "../signal/Multiply";
import { Scale } from "../signal/Scale";
import { Signal } from "../signal/Signal";
import { FMOscillator } from "../source/oscillator/FMOscillator";
import { Monophonic } from "./Monophonic";
/**
 * Inharmonic ratio of frequencies based on the Roland TR-808
 * Taken from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
 */
var inharmRatios = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];
/**
 * A highly inharmonic and spectrally complex source with a highpass filter
 * and amplitude envelope which is good for making metallophone sounds.
 * Based on CymbalSynth by [@polyrhythmatic](https://github.com/polyrhythmatic).
 * Inspiration from [Sound on Sound](https://shorturl.at/rSZ12).
 * @category Instrument
 */
var MetalSynth = /** @class */ (function (_super) {
    tslib_1.__extends(MetalSynth, _super);
    function MetalSynth() {
        var _this = _super.call(this, optionsFromArguments(MetalSynth.getDefaults(), arguments)) || this;
        _this.name = "MetalSynth";
        /**
         * The array of FMOscillators
         */
        _this._oscillators = [];
        /**
         * The frequency multipliers
         */
        _this._freqMultipliers = [];
        var options = optionsFromArguments(MetalSynth.getDefaults(), arguments);
        _this.detune = new Signal({
            context: _this.context,
            units: "cents",
            value: options.detune,
        });
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
        });
        _this._amplitude = new Gain({
            context: _this.context,
            gain: 0,
        }).connect(_this.output);
        _this._highpass = new Filter({
            // Q: -3.0102999566398125,
            Q: 0,
            context: _this.context,
            type: "highpass",
        }).connect(_this._amplitude);
        for (var i = 0; i < inharmRatios.length; i++) {
            var osc = new FMOscillator({
                context: _this.context,
                harmonicity: options.harmonicity,
                modulationIndex: options.modulationIndex,
                modulationType: "square",
                onstop: i === 0 ? function () { return _this.onsilence(_this); } : noOp,
                type: "square",
            });
            osc.connect(_this._highpass);
            _this._oscillators[i] = osc;
            var mult = new Multiply({
                context: _this.context,
                value: inharmRatios[i],
            });
            _this._freqMultipliers[i] = mult;
            _this.frequency.chain(mult, osc.frequency);
            _this.detune.connect(osc.detune);
        }
        _this._filterFreqScaler = new Scale({
            context: _this.context,
            max: 7000,
            min: _this.toFrequency(options.resonance),
        });
        _this.envelope = new Envelope({
            attack: options.envelope.attack,
            attackCurve: "linear",
            context: _this.context,
            decay: options.envelope.decay,
            release: options.envelope.release,
            sustain: 0,
        });
        _this.envelope.chain(_this._filterFreqScaler, _this._highpass.frequency);
        _this.envelope.connect(_this._amplitude.gain);
        // set the octaves
        _this._octaves = options.octaves;
        _this.octaves = options.octaves;
        return _this;
    }
    MetalSynth.getDefaults = function () {
        return deepMerge(Monophonic.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.001,
                decay: 1.4,
                release: 0.2,
            }),
            harmonicity: 5.1,
            modulationIndex: 32,
            octaves: 1.5,
            resonance: 4000,
        });
    };
    /**
     * Trigger the attack.
     * @param time When the attack should be triggered.
     * @param velocity The velocity that the envelope should be triggered at.
     */
    MetalSynth.prototype._triggerEnvelopeAttack = function (time, velocity) {
        var _this = this;
        if (velocity === void 0) { velocity = 1; }
        this.envelope.triggerAttack(time, velocity);
        this._oscillators.forEach(function (osc) { return osc.start(time); });
        if (this.envelope.sustain === 0) {
            this._oscillators.forEach(function (osc) {
                osc.stop(time + _this.toSeconds(_this.envelope.attack) + _this.toSeconds(_this.envelope.decay));
            });
        }
        return this;
    };
    /**
     * Trigger the release of the envelope.
     * @param time When the release should be triggered.
     */
    MetalSynth.prototype._triggerEnvelopeRelease = function (time) {
        var _this = this;
        this.envelope.triggerRelease(time);
        this._oscillators.forEach(function (osc) { return osc.stop(time + _this.toSeconds(_this.envelope.release)); });
        return this;
    };
    MetalSynth.prototype.getLevelAtTime = function (time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    };
    Object.defineProperty(MetalSynth.prototype, "modulationIndex", {
        /**
         * The modulationIndex of the oscillators which make up the source.
         * see [[FMOscillator.modulationIndex]]
         * @min 1
         * @max 100
         */
        get: function () {
            return this._oscillators[0].modulationIndex.value;
        },
        set: function (val) {
            this._oscillators.forEach(function (osc) { return (osc.modulationIndex.value = val); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetalSynth.prototype, "harmonicity", {
        /**
         * The harmonicity of the oscillators which make up the source.
         * see Tone.FMOscillator.harmonicity
         * @min 0.1
         * @max 10
         */
        get: function () {
            return this._oscillators[0].harmonicity.value;
        },
        set: function (val) {
            this._oscillators.forEach(function (osc) { return (osc.harmonicity.value = val); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetalSynth.prototype, "resonance", {
        /**
         * The lower level of the highpass filter which is attached to the envelope.
         * This value should be between [0, 7000]
         * @min 0
         * @max 7000
         */
        get: function () {
            return this._filterFreqScaler.min;
        },
        set: function (val) {
            this._filterFreqScaler.min = this.toFrequency(val);
            this.octaves = this._octaves;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MetalSynth.prototype, "octaves", {
        /**
         * The number of octaves above the "resonance" frequency
         * that the filter ramps during the attack/decay envelope
         * @min 0
         * @max 8
         */
        get: function () {
            return this._octaves;
        },
        set: function (val) {
            this._octaves = val;
            this._filterFreqScaler.max = this._filterFreqScaler.min * Math.pow(2, val);
        },
        enumerable: true,
        configurable: true
    });
    MetalSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._oscillators.forEach(function (osc) { return osc.dispose(); });
        this._freqMultipliers.forEach(function (freqMult) { return freqMult.dispose(); });
        this.frequency.dispose();
        this.detune.dispose();
        this._filterFreqScaler.dispose();
        this._amplitude.dispose();
        this.envelope.dispose();
        this._highpass.dispose();
        return this;
    };
    return MetalSynth;
}(Monophonic));
export { MetalSynth };
//# sourceMappingURL=MetalSynth.js.map
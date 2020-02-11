import * as tslib_1 from "tslib";
import { Monophonic } from "./Monophonic";
import { MonoSynth } from "./MonoSynth";
import { Signal } from "../signal/Signal";
import { readOnly } from "../core/util/Interface";
import { LFO } from "../source/oscillator/LFO";
import { Gain, } from "../core/context/Gain";
import { Multiply } from "../signal/Multiply";
import { deepMerge, omitFromObject, optionsFromArguments } from "../core/util/Defaults";
/**
 * DuoSynth is a monophonic synth composed of two [[MonoSynths]] run in parallel with control over the
 * frequency ratio between the two voices and vibrato effect.
 * @example
 * import { DuoSynth } from "tone";
 * const duoSynth = new DuoSynth().toDestination();
 * duoSynth.triggerAttackRelease("C4", "2n");
 * @category Instrument
 */
var DuoSynth = /** @class */ (function (_super) {
    tslib_1.__extends(DuoSynth, _super);
    function DuoSynth() {
        var _this = _super.call(this, optionsFromArguments(DuoSynth.getDefaults(), arguments)) || this;
        _this.name = "DuoSynth";
        var options = optionsFromArguments(DuoSynth.getDefaults(), arguments);
        _this.voice0 = new MonoSynth(Object.assign(options.voice0, {
            context: _this.context,
            onsilence: function () { return _this.onsilence(_this); }
        }));
        _this.voice1 = new MonoSynth(Object.assign(options.voice1, {
            context: _this.context,
        }));
        _this.harmonicity = new Multiply({
            context: _this.context,
            units: "positive",
            value: options.harmonicity,
        });
        _this._vibrato = new LFO({
            frequency: options.vibratoRate,
            context: _this.context,
            min: -50,
            max: 50
        });
        // start the vibrato immediately
        _this._vibrato.start();
        _this.vibratoRate = _this._vibrato.frequency;
        _this._vibratoGain = new Gain({
            context: _this.context,
            units: "normalRange",
            gain: options.vibratoAmount
        });
        _this.vibratoAmount = _this._vibratoGain.gain;
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: 440
        });
        _this.detune = new Signal({
            context: _this.context,
            units: "cents",
            value: options.detune
        });
        // control the two voices frequency
        _this.frequency.connect(_this.voice0.frequency);
        _this.frequency.chain(_this.harmonicity, _this.voice1.frequency);
        _this._vibrato.connect(_this._vibratoGain);
        _this._vibratoGain.fan(_this.voice0.detune, _this.voice1.detune);
        _this.detune.fan(_this.voice0.detune, _this.voice1.detune);
        _this.voice0.connect(_this.output);
        _this.voice1.connect(_this.output);
        readOnly(_this, ["voice0", "voice1", "frequency", "vibratoAmount", "vibratoRate"]);
        return _this;
    }
    DuoSynth.prototype.getLevelAtTime = function (time) {
        time = this.toSeconds(time);
        return this.voice0.envelope.getValueAtTime(time) + this.voice1.envelope.getValueAtTime(time);
    };
    DuoSynth.getDefaults = function () {
        return deepMerge(Monophonic.getDefaults(), {
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 1.5,
            voice0: deepMerge(omitFromObject(MonoSynth.getDefaults(), Object.keys(Monophonic.getDefaults())), {
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                }
            }),
            voice1: deepMerge(omitFromObject(MonoSynth.getDefaults(), Object.keys(Monophonic.getDefaults())), {
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                }
            }),
        });
    };
    /**
     * Trigger the attack portion of the note
     */
    DuoSynth.prototype._triggerEnvelopeAttack = function (time, velocity) {
        // @ts-ignore
        this.voice0._triggerEnvelopeAttack(time, velocity);
        // @ts-ignore
        this.voice1._triggerEnvelopeAttack(time, velocity);
    };
    /**
     * Trigger the release portion of the note
     */
    DuoSynth.prototype._triggerEnvelopeRelease = function (time) {
        // @ts-ignore
        this.voice0._triggerEnvelopeRelease(time);
        // @ts-ignore
        this.voice1._triggerEnvelopeRelease(time);
        return this;
    };
    DuoSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.voice0.dispose();
        this.voice1.dispose();
        this.frequency.dispose();
        this.detune.dispose();
        this._vibrato.dispose();
        this.vibratoRate.dispose();
        this._vibratoGain.dispose();
        this.harmonicity.dispose();
        return this;
    };
    return DuoSynth;
}(Monophonic));
export { DuoSynth };
//# sourceMappingURL=DuoSynth.js.map
import * as tslib_1 from "tslib";
import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { Envelope } from "../component/envelope/Envelope";
import { Filter } from "../component/filter/Filter";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { Monophonic } from "../instrument/Monophonic";
import { OmniOscillator } from "../source/oscillator/OmniOscillator";
import { Source } from "../source/Source";
import { FrequencyEnvelope } from "../component/envelope/FrequencyEnvelope";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
/**
 * MonoSynth is composed of one `oscillator`, one `filter`, and two `envelopes`.
 * The amplitude of the Oscillator and the cutoff frequency of the
 * Filter are controlled by Envelopes.
 * <img src="https://docs.google.com/drawings/d/1gaY1DF9_Hzkodqf8JI1Cg2VZfwSElpFQfI94IQwad38/pub?w=924&h=240">
 * @example
 * import { MonoSynth } from "tone";
 * const synth = new MonoSynth({
 * 	oscillator: {
 * 		type: "square"
 * 	},
 * 	envelope: {
 * 		attack: 0.1
 * 	}
 * }).toDestination();
 * synth.triggerAttackRelease("C4", "8n");
 * @category Instrument
 */
var MonoSynth = /** @class */ (function (_super) {
    tslib_1.__extends(MonoSynth, _super);
    function MonoSynth() {
        var _this = _super.call(this, optionsFromArguments(MonoSynth.getDefaults(), arguments)) || this;
        _this.name = "MonoSynth";
        var options = optionsFromArguments(MonoSynth.getDefaults(), arguments);
        _this.oscillator = new OmniOscillator(Object.assign(options.oscillator, {
            context: _this.context,
            detune: options.detune,
            onstop: function () { return _this.onsilence(_this); },
        }));
        _this.frequency = _this.oscillator.frequency;
        _this.detune = _this.oscillator.detune;
        _this.filter = new Filter(Object.assign(options.filter, { context: _this.context }));
        _this.filterEnvelope = new FrequencyEnvelope(Object.assign(options.filterEnvelope, { context: _this.context }));
        _this.envelope = new AmplitudeEnvelope(Object.assign(options.envelope, { context: _this.context }));
        // connect the oscillators to the output
        _this.oscillator.chain(_this.filter, _this.envelope, _this.output);
        // connect the filter envelope
        _this.filterEnvelope.connect(_this.filter.frequency);
        readOnly(_this, ["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"]);
        return _this;
    }
    MonoSynth.getDefaults = function () {
        return Object.assign(Monophonic.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.005,
                decay: 0.1,
                release: 1,
                sustain: 0.9,
            }),
            filter: Object.assign(omitFromObject(Filter.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                Q: 1,
                rolloff: -12,
                type: "lowpass",
            }),
            filterEnvelope: Object.assign(omitFromObject(FrequencyEnvelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.6,
                baseFrequency: 200,
                decay: 0.2,
                exponent: 2,
                octaves: 3,
                release: 2,
                sustain: 0.5,
            }),
            oscillator: Object.assign(omitFromObject(OmniOscillator.getDefaults(), Object.keys(Source.getDefaults())), {
                type: "sawtooth",
            }),
        });
    };
    /**
     * start the attack portion of the envelope
     * @param time the time the attack should start
     * @param velocity the velocity of the note (0-1)
     */
    MonoSynth.prototype._triggerEnvelopeAttack = function (time, velocity) {
        if (velocity === void 0) { velocity = 1; }
        this.envelope.triggerAttack(time, velocity);
        this.filterEnvelope.triggerAttack(time);
        this.oscillator.start(time);
        if (this.envelope.sustain === 0) {
            var computedAttack = this.toSeconds(this.envelope.attack);
            var computedDecay = this.toSeconds(this.envelope.decay);
            this.oscillator.stop(time + computedAttack + computedDecay);
        }
    };
    /**
     * start the release portion of the envelope
     * @param time the time the release should start
     */
    MonoSynth.prototype._triggerEnvelopeRelease = function (time) {
        this.envelope.triggerRelease(time);
        this.filterEnvelope.triggerRelease(time);
        this.oscillator.stop(time + this.toSeconds(this.envelope.release));
    };
    MonoSynth.prototype.getLevelAtTime = function (time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    };
    MonoSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.oscillator.dispose();
        this.envelope.dispose();
        this.filterEnvelope.dispose();
        this.filter.dispose();
        return this;
    };
    return MonoSynth;
}(Monophonic));
export { MonoSynth };
//# sourceMappingURL=MonoSynth.js.map
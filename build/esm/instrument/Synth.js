import * as tslib_1 from "tslib";
import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { Envelope } from "../component/envelope/Envelope";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { OmniOscillator } from "../source/oscillator/OmniOscillator";
import { Source } from "../source/Source";
import { Monophonic } from "./Monophonic";
/**
 * Synth is composed simply of a {@link OmniOscillator} routed through an {@link AmplitudeEnvelope}.
 * ```
 * +----------------+   +-------------------+
 * | OmniOscillator +>--> AmplitudeEnvelope +>--> Output
 * +----------------+   +-------------------+
 * ```
 * @example
 * import { Synth } from "tone";
 * const synth = new Synth().toDestination();
 * synth.triggerAttackRelease("C4", "8n");
 * @category Instrument
 */
var Synth = /** @class */ (function (_super) {
    tslib_1.__extends(Synth, _super);
    function Synth() {
        var _this = _super.call(this, optionsFromArguments(Synth.getDefaults(), arguments)) || this;
        _this.name = "Synth";
        var options = optionsFromArguments(Synth.getDefaults(), arguments);
        _this.oscillator = new OmniOscillator(Object.assign({
            context: _this.context,
            detune: options.detune,
            onstop: function () { return _this.onsilence(_this); },
        }, options.oscillator));
        _this.frequency = _this.oscillator.frequency;
        _this.detune = _this.oscillator.detune;
        _this.envelope = new AmplitudeEnvelope(Object.assign({
            context: _this.context,
        }, options.envelope));
        // connect the oscillators to the output
        _this.oscillator.chain(_this.envelope, _this.output);
        readOnly(_this, ["oscillator", "frequency", "detune", "envelope"]);
        return _this;
    }
    Synth.getDefaults = function () {
        return Object.assign(Monophonic.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.005,
                decay: 0.1,
                release: 1,
                sustain: 0.3,
            }),
            oscillator: Object.assign(omitFromObject(OmniOscillator.getDefaults(), tslib_1.__spread(Object.keys(Source.getDefaults()), ["frequency", "detune"])), {
                type: "triangle",
            }),
        });
    };
    /**
     * start the attack portion of the envelope
     * @param time the time the attack should start
     * @param velocity the velocity of the note (0-1)
     */
    Synth.prototype._triggerEnvelopeAttack = function (time, velocity) {
        // the envelopes
        this.envelope.triggerAttack(time, velocity);
        this.oscillator.start(time);
        // if there is no release portion, stop the oscillator
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
    Synth.prototype._triggerEnvelopeRelease = function (time) {
        this.envelope.triggerRelease(time);
        this.oscillator.stop(time + this.toSeconds(this.envelope.release));
    };
    Synth.prototype.getLevelAtTime = function (time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    };
    /**
     * clean up
     */
    Synth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.oscillator.dispose();
        this.envelope.dispose();
        return this;
    };
    return Synth;
}(Monophonic));
export { Synth };
//# sourceMappingURL=Synth.js.map
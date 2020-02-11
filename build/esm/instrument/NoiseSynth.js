import * as tslib_1 from "tslib";
import { AmplitudeEnvelope } from "../component/envelope/AmplitudeEnvelope";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { Noise } from "../source/Noise";
import { Instrument } from "./Instrument";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { Envelope } from "../component/envelope/Envelope";
import { Source } from "../source/Source";
/**
 * Tone.NoiseSynth is composed of [[Noise]] through an [[AmplitudeEnvelope]].
 * ```
 * +-------+   +-------------------+
 * | Noise +>--> AmplitudeEnvelope +>--> Output
 * +-------+   +-------------------+
 * ```
 * @example
 * import { NoiseSynth } from "tone";
 * const noiseSynth = new NoiseSynth().toDestination();
 * noiseSynth.triggerAttackRelease("8n", 0.05);
 * @category Instrument
 */
var NoiseSynth = /** @class */ (function (_super) {
    tslib_1.__extends(NoiseSynth, _super);
    function NoiseSynth() {
        var _this = _super.call(this, optionsFromArguments(NoiseSynth.getDefaults(), arguments)) || this;
        _this.name = "NoiseSynth";
        var options = optionsFromArguments(NoiseSynth.getDefaults(), arguments);
        _this.noise = new Noise(Object.assign({
            context: _this.context,
        }, options.noise));
        _this.envelope = new AmplitudeEnvelope(Object.assign({
            context: _this.context,
        }, options.envelope));
        // connect the noise to the output
        _this.noise.chain(_this.envelope, _this.output);
        return _this;
    }
    NoiseSynth.getDefaults = function () {
        return Object.assign(Instrument.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                decay: 0.1,
                sustain: 0.0,
            }),
            noise: Object.assign(omitFromObject(Noise.getDefaults(), Object.keys(Source.getDefaults())), {
                type: "white",
            }),
        });
    };
    /**
     * Start the attack portion of the envelopes. Unlike other
     * instruments, Tone.NoiseSynth doesn't have a note.
     * @example
     * import { NoiseSynth } from "tone";
     * const noiseSynth = new NoiseSynth().toDestination();
     * noiseSynth.triggerAttack();
     */
    NoiseSynth.prototype.triggerAttack = function (time, velocity) {
        if (velocity === void 0) { velocity = 1; }
        time = this.toSeconds(time);
        // the envelopes
        this.envelope.triggerAttack(time, velocity);
        // start the noise
        this.noise.start(time);
        if (this.envelope.sustain === 0) {
            this.noise.stop(time + this.toSeconds(this.envelope.attack) + this.toSeconds(this.envelope.decay));
        }
        return this;
    };
    /**
     * Start the release portion of the envelopes.
     */
    NoiseSynth.prototype.triggerRelease = function (time) {
        time = this.toSeconds(time);
        this.envelope.triggerRelease(time);
        this.noise.stop(time + this.toSeconds(this.envelope.release));
        return this;
    };
    NoiseSynth.prototype.sync = function () {
        this._syncMethod("triggerAttack", 0);
        this._syncMethod("triggerRelease", 0);
        return this;
    };
    NoiseSynth.prototype.triggerAttackRelease = function (duration, time, velocity) {
        if (velocity === void 0) { velocity = 1; }
        time = this.toSeconds(time);
        duration = this.toSeconds(duration);
        this.triggerAttack(time, velocity);
        this.triggerRelease(time + duration);
        return this;
    };
    NoiseSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.noise.dispose();
        this.envelope.dispose();
        return this;
    };
    return NoiseSynth;
}(Instrument));
export { NoiseSynth };
//# sourceMappingURL=NoiseSynth.js.map
import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Envelope } from "./Envelope";
/**
 * AmplitudeEnvelope is a Tone.Envelope connected to a gain node.
 * Unlike Tone.Envelope, which outputs the envelope's value, AmplitudeEnvelope accepts
 * an audio signal as the input and will apply the envelope to the amplitude
 * of the signal.
 * Read more about ADSR Envelopes on [Wikipedia](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope).
 *
 * @example
 * import { AmplitudeEnvelope, Oscillator } from "tone";
 * const ampEnv = new AmplitudeEnvelope({
 * 	attack: 0.1,
 * 	decay: 0.2,
 * 	sustain: 1.0,
 * 	release: 0.8
 * }).toDestination();
 * // create an oscillator and connect it
 * const osc = new Oscillator().connect(ampEnv).start();
 * // trigger the envelopes attack and release "8t" apart
 * ampEnv.triggerAttackRelease("8t");
 * @category Component
 */
var AmplitudeEnvelope = /** @class */ (function (_super) {
    tslib_1.__extends(AmplitudeEnvelope, _super);
    function AmplitudeEnvelope() {
        var _this = _super.call(this, optionsFromArguments(AmplitudeEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"])) || this;
        _this.name = "AmplitudeEnvelope";
        _this._gainNode = new Gain({
            context: _this.context,
            gain: 0,
        });
        _this.output = _this._gainNode;
        _this.input = _this._gainNode;
        _this._sig.connect(_this._gainNode.gain);
        _this.output = _this._gainNode;
        _this.input = _this._gainNode;
        return _this;
    }
    /**
     * Clean up
     */
    AmplitudeEnvelope.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._gainNode.dispose();
        return this;
    };
    return AmplitudeEnvelope;
}(Envelope));
export { AmplitudeEnvelope };
//# sourceMappingURL=AmplitudeEnvelope.js.map
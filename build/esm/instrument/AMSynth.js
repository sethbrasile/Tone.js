import * as tslib_1 from "tslib";
import { AudioToGain } from "../signal/AudioToGain";
import { optionsFromArguments } from "../core/util/Defaults";
import { ModulationSynth } from "./ModulationSynth";
/**
 * AMSynth uses the output of one Tone.Synth to modulate the
 * amplitude of another Tone.Synth. The harmonicity (the ratio between
 * the two signals) affects the timbre of the output signal greatly.
 * Read more about Amplitude Modulation Synthesis on
 * [SoundOnSound](https://web.archive.org/web/20160404103653/http://www.soundonsound.com:80/sos/mar00/articles/synthsecrets.htm).
 *
 * @example
 * import { AMSynth } from "tone";
 * const synth = new AMSynth().toDestination();
 * synth.triggerAttackRelease("C4", "4n");
 *
 * @category Instrument
 */
var AMSynth = /** @class */ (function (_super) {
    tslib_1.__extends(AMSynth, _super);
    function AMSynth() {
        var _this = _super.call(this, optionsFromArguments(AMSynth.getDefaults(), arguments)) || this;
        _this.name = "AMSynth";
        _this._modulationScale = new AudioToGain({
            context: _this.context,
        });
        // control the two voices frequency
        _this.frequency.connect(_this._carrier.frequency);
        _this.frequency.chain(_this.harmonicity, _this._modulator.frequency);
        _this.detune.fan(_this._carrier.detune, _this._modulator.detune);
        _this._modulator.chain(_this._modulationScale, _this._modulationNode.gain);
        _this._carrier.chain(_this._modulationNode, _this.output);
        return _this;
    }
    AMSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._modulationScale.dispose();
        return this;
    };
    return AMSynth;
}(ModulationSynth));
export { AMSynth };
//# sourceMappingURL=AMSynth.js.map
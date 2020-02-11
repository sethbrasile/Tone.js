import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../core/util/Defaults";
import { Multiply } from "../signal/Multiply";
import { ModulationSynth } from "./ModulationSynth";
/**
 * FMSynth is composed of two Tone.Synths where one Tone.Synth modulates
 * the frequency of a second Tone.Synth. A lot of spectral content
 * can be explored using the modulationIndex parameter. Read more about
 * frequency modulation synthesis on Sound On Sound: [Part 1](https://web.archive.org/web/20160403123704/http://www.soundonsound.com/sos/apr00/articles/synthsecrets.htm), [Part 2](https://web.archive.org/web/20160403115835/http://www.soundonsound.com/sos/may00/articles/synth.htm).
 *
 * @example
 * import { FMSynth } from "tone";
 * const fmSynth = new FMSynth().toDestination();
 * fmSynth.triggerAttackRelease("C5", "4n");
 *
 * @category Instrument
 */
var FMSynth = /** @class */ (function (_super) {
    tslib_1.__extends(FMSynth, _super);
    function FMSynth() {
        var _this = _super.call(this, optionsFromArguments(FMSynth.getDefaults(), arguments)) || this;
        _this.name = "FMSynth";
        var options = optionsFromArguments(FMSynth.getDefaults(), arguments);
        _this.modulationIndex = new Multiply({
            context: _this.context,
            value: options.modulationIndex,
        });
        // control the two voices frequency
        _this.frequency.connect(_this._carrier.frequency);
        _this.frequency.chain(_this.harmonicity, _this._modulator.frequency);
        _this.frequency.chain(_this.modulationIndex, _this._modulationNode);
        _this.detune.fan(_this._carrier.detune, _this._modulator.detune);
        _this._modulator.connect(_this._modulationNode.gain);
        _this._modulationNode.connect(_this._carrier.frequency);
        _this._carrier.connect(_this.output);
        return _this;
    }
    FMSynth.getDefaults = function () {
        return Object.assign(ModulationSynth.getDefaults(), {
            modulationIndex: 10,
        });
    };
    FMSynth.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.modulationIndex.dispose();
        return this;
    };
    return FMSynth;
}(ModulationSynth));
export { FMSynth };
//# sourceMappingURL=FMSynth.js.map
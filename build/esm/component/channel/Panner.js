import * as tslib_1 from "tslib";
import { Param } from "../../core/context/Param";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
/**
 * Panner is an equal power Left/Right Panner. It is a wrapper around the StereoPannerNode.
 * @example
 * import { Oscillator, Panner } from "tone";
 * // pan the input signal hard right.
 * const panner = new Panner(1).toDestination();
 * const osc = new Oscillator().connect(panner).start();
 * @category Component
 */
var Panner = /** @class */ (function (_super) {
    tslib_1.__extends(Panner, _super);
    function Panner() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Panner.getDefaults(), arguments, ["pan"]))) || this;
        _this.name = "Panner";
        /**
         * the panner node
         */
        _this._panner = _this.context.createStereoPanner();
        _this.input = _this._panner;
        _this.output = _this._panner;
        var options = optionsFromArguments(Panner.getDefaults(), arguments, ["pan"]);
        _this.pan = new Param({
            context: _this.context,
            param: _this._panner.pan,
            value: options.pan,
            minValue: -1,
            maxValue: 1,
        });
        // this is necessary for standardized-audio-context
        // doesn't make any difference for the native AudioContext
        // https://github.com/chrisguttandin/standardized-audio-context/issues/647
        _this._panner.channelCount = options.channelCount;
        _this._panner.channelCountMode = "explicit";
        // initial value
        readOnly(_this, "pan");
        return _this;
    }
    Panner.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            pan: 0,
            channelCount: 1,
        });
    };
    Panner.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._panner.disconnect();
        this.pan.dispose();
        return this;
    };
    return Panner;
}(ToneAudioNode));
export { Panner };
//# sourceMappingURL=Panner.js.map
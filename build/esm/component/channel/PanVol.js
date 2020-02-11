import * as tslib_1 from "tslib";
import { readOnly } from "../../core/util/Interface";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Panner } from "./Panner";
import { Volume } from "./Volume";
/**
 * PanVol is a Tone.Panner and Tone.Volume in one.
 * @example
 * import { Oscillator, PanVol } from "tone";
 * // pan the incoming signal left and drop the volume
 * const panVol = new PanVol(-0.25, -12).toDestination();
 * const osc = new Oscillator().connect(panVol).start();
 * @category Component
 */
var PanVol = /** @class */ (function (_super) {
    tslib_1.__extends(PanVol, _super);
    function PanVol() {
        var _this = _super.call(this, optionsFromArguments(PanVol.getDefaults(), arguments, ["pan", "volume"])) || this;
        _this.name = "PanVol";
        var options = optionsFromArguments(PanVol.getDefaults(), arguments, ["pan", "volume"]);
        _this._panner = _this.input = new Panner({
            context: _this.context,
            pan: options.pan,
        });
        _this.pan = _this._panner.pan;
        _this._volume = _this.output = new Volume({
            context: _this.context,
            volume: options.volume,
        });
        _this.volume = _this._volume.volume;
        // connections
        _this._panner.connect(_this._volume);
        _this.mute = options.mute;
        readOnly(_this, ["pan", "volume"]);
        return _this;
    }
    PanVol.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            pan: 0,
            volume: 0,
        });
    };
    Object.defineProperty(PanVol.prototype, "mute", {
        /**
         * Mute/unmute the volume
         */
        get: function () {
            return this._volume.mute;
        },
        set: function (mute) {
            this._volume.mute = mute;
        },
        enumerable: true,
        configurable: true
    });
    PanVol.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._panner.dispose();
        this.pan.dispose();
        this._volume.dispose();
        this.volume.dispose();
        return this;
    };
    return PanVol;
}(ToneAudioNode));
export { PanVol };
//# sourceMappingURL=PanVol.js.map
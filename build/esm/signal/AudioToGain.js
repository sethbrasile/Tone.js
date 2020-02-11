import * as tslib_1 from "tslib";
import { SignalOperator } from "./SignalOperator";
import { WaveShaper } from "./WaveShaper";
/**
 * AudioToGain converts an input in AudioRange [-1,1] to NormalRange [0,1].
 * See {@link GainToAudio}.
 * @category Signal
 */
var AudioToGain = /** @class */ (function (_super) {
    tslib_1.__extends(AudioToGain, _super);
    function AudioToGain() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "AudioToGain";
        /**
         * The node which converts the audio ranges
         */
        _this._norm = new WaveShaper({
            context: _this.context,
            mapping: function (x) { return (x + 1) / 2; },
        });
        /**
         * The AudioRange input [-1, 1]
         */
        _this.input = _this._norm;
        /**
         * The GainRange output [0, 1]
         */
        _this.output = _this._norm;
        return _this;
    }
    /**
     * clean up
     */
    AudioToGain.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._norm.dispose();
        return this;
    };
    return AudioToGain;
}(SignalOperator));
export { AudioToGain };
//# sourceMappingURL=AudioToGain.js.map
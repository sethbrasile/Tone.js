import * as tslib_1 from "tslib";
import { SignalOperator } from "./SignalOperator";
import { WaveShaper } from "./WaveShaper";
/**
 * GainToAudio converts an input in NormalRange [0,1] to AudioRange [-1,1].
 * See {@link AudioToGain}.
 * @category Signal
 */
var GainToAudio = /** @class */ (function (_super) {
    tslib_1.__extends(GainToAudio, _super);
    function GainToAudio() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "GainToAudio";
        /**
         * The node which converts the audio ranges
         */
        _this._norm = new WaveShaper({
            context: _this.context,
            mapping: function (x) { return Math.abs(x) * 2 - 1; },
        });
        /**
         * The NormalRange input [0, 1]
         */
        _this.input = _this._norm;
        /**
         * The AudioRange output [-1, 1]
         */
        _this.output = _this._norm;
        return _this;
    }
    /**
     * clean up
     */
    GainToAudio.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._norm.dispose();
        return this;
    };
    return GainToAudio;
}(SignalOperator));
export { GainToAudio };
//# sourceMappingURL=GainToAudio.js.map
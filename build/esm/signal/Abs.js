import * as tslib_1 from "tslib";
import { SignalOperator } from "./SignalOperator";
import { WaveShaper } from "./WaveShaper";
/**
 * Return the absolute value of an incoming signal.
 *
 * @example
 * import { Abs, Signal } from "tone";
 * const signal = new Signal(-1);
 * const abs = new Abs();
 * signal.connect(abs);
 * // the output of abs is 1.
 * @category Signal
 */
var Abs = /** @class */ (function (_super) {
    tslib_1.__extends(Abs, _super);
    function Abs() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Abs";
        /**
         * The node which converts the audio ranges
         */
        _this._abs = new WaveShaper({
            context: _this.context,
            mapping: function (val) {
                if (Math.abs(val) < 0.001) {
                    return 0;
                }
                else {
                    return Math.abs(val);
                }
            },
        });
        /**
         * The AudioRange input [-1, 1]
         */
        _this.input = _this._abs;
        /**
         * The output range [0, 1]
         */
        _this.output = _this._abs;
        return _this;
    }
    /**
     * clean up
     */
    Abs.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._abs.dispose();
        return this;
    };
    return Abs;
}(SignalOperator));
export { Abs };
//# sourceMappingURL=Abs.js.map
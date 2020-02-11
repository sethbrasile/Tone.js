import * as tslib_1 from "tslib";
import { SignalOperator } from "./SignalOperator";
import { Multiply } from "./Multiply";
import { WaveShaper } from "./WaveShaper";
import { optionsFromArguments } from "../core/util/Defaults";
/**
 * GreaterThanZero outputs 1 when the input is strictly greater than zero
 * @example
 * import { GreaterThanZero, Signal } from "tone";
 * const gt0 = new GreaterThanZero();
 * const sig = new Signal(0.01).connect(gt0);
 * // the output of gt0 is 1.
 * sig.value = 0;
 * // the output of gt0 is 0.
 */
var GreaterThanZero = /** @class */ (function (_super) {
    tslib_1.__extends(GreaterThanZero, _super);
    function GreaterThanZero() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(GreaterThanZero.getDefaults(), arguments))) || this;
        _this.name = "GreaterThanZero";
        _this._thresh = _this.output = new WaveShaper({
            context: _this.context,
            length: 127,
            mapping: function (val) {
                if (val <= 0) {
                    return 0;
                }
                else {
                    return 1;
                }
            },
        });
        _this._scale = _this.input = new Multiply({
            context: _this.context,
            value: 10000
        });
        // connections
        _this._scale.connect(_this._thresh);
        return _this;
    }
    GreaterThanZero.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._scale.dispose();
        this._thresh.dispose();
        return this;
    };
    return GreaterThanZero;
}(SignalOperator));
export { GreaterThanZero };
//# sourceMappingURL=GreaterThanZero.js.map
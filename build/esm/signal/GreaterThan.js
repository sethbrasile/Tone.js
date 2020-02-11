import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../core/util/Defaults";
import { Subtract } from "./Subtract";
import { Signal } from "./Signal";
import { GreaterThanZero } from "./GreaterThanZero";
import { readOnly } from "../core/util/Interface";
/**
 * Output 1 if the signal is greater than the value, otherwise outputs 0.
 * can compare two signals or a signal and a number.
 *
 * @example
 * import { GreaterThan, Signal } from "tone";
 * const gt = new GreaterThan(2);
 * const sig = new Signal(4).connect(gt);
 * // output of gt is equal 1.
 */
var GreaterThan = /** @class */ (function (_super) {
    tslib_1.__extends(GreaterThan, _super);
    function GreaterThan() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(GreaterThan.getDefaults(), arguments, ["value"]))) || this;
        _this.name = "GreaterThan";
        _this.override = false;
        var options = optionsFromArguments(GreaterThan.getDefaults(), arguments, ["value"]);
        _this._subtract = _this.input = new Subtract({
            context: _this.context,
            value: options.value
        });
        _this._gtz = _this.output = new GreaterThanZero({ context: _this.context });
        _this.comparator = _this._param = _this._subtract.subtrahend;
        readOnly(_this, "comparator");
        // connect
        _this._subtract.connect(_this._gtz);
        return _this;
    }
    GreaterThan.getDefaults = function () {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    };
    GreaterThan.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._gtz.dispose();
        this._subtract.dispose();
        this.comparator.dispose();
        return this;
    };
    return GreaterThan;
}(Signal));
export { GreaterThan };
//# sourceMappingURL=GreaterThan.js.map
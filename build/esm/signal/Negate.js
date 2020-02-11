import * as tslib_1 from "tslib";
import { Multiply } from "./Multiply";
import { SignalOperator } from "./SignalOperator";
/**
 * Negate the incoming signal. i.e. an input signal of 10 will output -10
 *
 * @example
 * import { Negate, Signal } from "tone";
 * const neg = new Negate();
 * const sig = new Signal(-2).connect(neg);
 * // output of neg is positive 2.
 * @category Signal
 */
var Negate = /** @class */ (function (_super) {
    tslib_1.__extends(Negate, _super);
    function Negate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Negate";
        /**
         * negation is done by multiplying by -1
         */
        _this._multiply = new Multiply({
            context: _this.context,
            value: -1,
        });
        /**
         * The input and output are equal to the multiply node
         */
        _this.input = _this._multiply;
        _this.output = _this._multiply;
        return _this;
    }
    /**
     * clean up
     * @returns {Negate} this
     */
    Negate.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._multiply.dispose();
        return this;
    };
    return Negate;
}(SignalOperator));
export { Negate };
//# sourceMappingURL=Negate.js.map
import * as tslib_1 from "tslib";
import { Gain } from "../core/context/Gain";
import { optionsFromArguments } from "../core/util/Defaults";
import { Signal } from "./Signal";
/**
 * Multiply two incoming signals. Or, if a number is given in the constructor,
 * multiplies the incoming signal by that value.
 *
 * @example
 * import { Multiply, Signal } from "tone";
 * // multiply two signals
 * const mult = new Multiply();
 * const sigA = new Signal(3);
 * const sigB = new Signal(4);
 * sigA.connect(mult);
 * sigB.connect(mult.factor);
 * // output of mult is 12.
 * @example
 * import { Multiply, Signal } from "tone";
 * // multiply a signal and a number
 * const mult = new Multiply(10);
 * const sig = new Signal(2).connect(mult);
 * // the output of mult is 20.
 * @category Signal
 */
var Multiply = /** @class */ (function (_super) {
    tslib_1.__extends(Multiply, _super);
    function Multiply() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Multiply.getDefaults(), arguments, ["value"]))) || this;
        _this.name = "Multiply";
        /**
         * Indicates if the value should be overridden on connection
         */
        _this.override = false;
        var options = optionsFromArguments(Multiply.getDefaults(), arguments, ["value"]);
        _this._mult = _this.input = _this.output = new Gain({
            context: _this.context,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        _this.factor = _this._param = _this._mult.gain;
        _this.factor.setValueAtTime(options.value, 0);
        return _this;
    }
    Multiply.getDefaults = function () {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    };
    Multiply.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._mult.dispose();
        return this;
    };
    return Multiply;
}(Signal));
export { Multiply };
//# sourceMappingURL=Multiply.js.map
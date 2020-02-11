import * as tslib_1 from "tslib";
import { WaveShaper } from "./WaveShaper";
import { optionsFromArguments } from "../core/util/Defaults";
import { SignalOperator } from "./SignalOperator";
/**
 * Pow applies an exponent to the incoming signal. The incoming signal must be AudioRange [-1, 1]
 *
 * @example
 * import { Pow, Signal } from "tone";
 * const pow = new Pow(2);
 * const sig = new Signal(0.5).connect(pow);
 * // output of pow is 0.25.
 * @category Signal
 */
var Pow = /** @class */ (function (_super) {
    tslib_1.__extends(Pow, _super);
    function Pow() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Pow.getDefaults(), arguments, ["value"]))) || this;
        _this.name = "Pow";
        var options = optionsFromArguments(Pow.getDefaults(), arguments, ["value"]);
        _this._exponentScaler = _this.input = _this.output = new WaveShaper({
            context: _this.context,
            mapping: _this._expFunc(options.value),
            length: 8192,
        });
        _this._exponent = options.value;
        return _this;
    }
    Pow.getDefaults = function () {
        return Object.assign(SignalOperator.getDefaults(), {
            value: 1,
        });
    };
    /**
     * the function which maps the waveshaper
     * @param exponent exponent value
     */
    Pow.prototype._expFunc = function (exponent) {
        return function (val) {
            return Math.pow(Math.abs(val), exponent);
        };
    };
    Object.defineProperty(Pow.prototype, "value", {
        /**
         * The value of the exponent.
         */
        get: function () {
            return this._exponent;
        },
        set: function (exponent) {
            this._exponent = exponent;
            this._exponentScaler.setMap(this._expFunc(this._exponent));
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up.
     */
    Pow.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._exponentScaler.dispose();
        return this;
    };
    return Pow;
}(SignalOperator));
export { Pow };
//# sourceMappingURL=Pow.js.map
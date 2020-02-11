import * as tslib_1 from "tslib";
import { Scale } from "./Scale";
import { optionsFromArguments } from "../core/util/Defaults";
import { Pow } from "./Pow";
/**
 * Performs an exponential scaling on an input signal.
 * Scales a NormalRange value [0,1] exponentially
 * to the output range of outputMin to outputMax.
 * @example
 * import { ScaleExp, Signal } from "tone";
 * const scaleExp = new ScaleExp(0, 100, 2);
 * const signal = new Signal(0.5).connect(scaleExp);
 */
var ScaleExp = /** @class */ (function (_super) {
    tslib_1.__extends(ScaleExp, _super);
    function ScaleExp() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(ScaleExp.getDefaults(), arguments, ["min", "max", "exponent"]))) || this;
        _this.name = "ScaleExp";
        var options = optionsFromArguments(ScaleExp.getDefaults(), arguments, ["min", "max", "exponent"]);
        _this.input = _this._exp = new Pow({
            context: _this.context,
            value: options.exponent,
        });
        _this._exp.connect(_this._mult);
        return _this;
    }
    ScaleExp.getDefaults = function () {
        return Object.assign(Scale.getDefaults(), {
            exponent: 1,
        });
    };
    Object.defineProperty(ScaleExp.prototype, "exponent", {
        /**
         * Instead of interpolating linearly between the [[min]] and
         * [[max]] values, setting the exponent will interpolate between
         * the two values with an exponential curve.
         */
        get: function () {
            return this._exp.value;
        },
        set: function (exp) {
            this._exp.value = exp;
        },
        enumerable: true,
        configurable: true
    });
    ScaleExp.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._exp.dispose();
        return this;
    };
    return ScaleExp;
}(Scale));
export { ScaleExp };
//# sourceMappingURL=ScaleExp.js.map
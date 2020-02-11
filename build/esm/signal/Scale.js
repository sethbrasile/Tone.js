import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../core/util/Defaults";
import { Add } from "./Add";
import { Multiply } from "./Multiply";
import { SignalOperator } from "./SignalOperator";
/**
 * Performs a linear scaling on an input signal.
 * Scales a NormalRange input to between
 * outputMin and outputMax.
 *
 * @example
 * import { Scale, Signal } from "tone";
 * const scale = new Scale(50, 100);
 * const signal = new Signal(0.5).connect(scale);
 * // the output of scale equals 75
 * @category Signal
 */
var Scale = /** @class */ (function (_super) {
    tslib_1.__extends(Scale, _super);
    function Scale() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"]))) || this;
        _this.name = "Scale";
        var options = optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"]);
        _this._mult = _this.input = new Multiply({
            context: _this.context,
            value: options.max - options.min,
        });
        _this._add = _this.output = new Add({
            context: _this.context,
            value: options.min,
        });
        _this._min = options.min;
        _this._max = options.max;
        _this.input.connect(_this.output);
        return _this;
    }
    Scale.getDefaults = function () {
        return Object.assign(SignalOperator.getDefaults(), {
            max: 1,
            min: 0,
        });
    };
    Object.defineProperty(Scale.prototype, "min", {
        /**
         * The minimum output value. This number is output when the value input value is 0.
         */
        get: function () {
            return this._min;
        },
        set: function (min) {
            this._min = min;
            this._setRange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scale.prototype, "max", {
        /**
         * The maximum output value. This number is output when the value input value is 1.
         */
        get: function () {
            return this._max;
        },
        set: function (max) {
            this._max = max;
            this._setRange();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * set the values
     */
    Scale.prototype._setRange = function () {
        this._add.value = this._min;
        this._mult.value = this._max - this._min;
    };
    Scale.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._add.dispose();
        this._mult.dispose();
        return this;
    };
    return Scale;
}(SignalOperator));
export { Scale };
//# sourceMappingURL=Scale.js.map
import * as tslib_1 from "tslib";
import { connectSeries } from "../core/context/ToneAudioNode";
import { Gain } from "../core/context/Gain";
import { optionsFromArguments } from "../core/util/Defaults";
import { Negate } from "../signal/Negate";
import { Signal } from "../signal/Signal";
/**
 * Subtract the signal connected to the input is subtracted from the signal connected
 * The subtrahend.
 *
 * @example
 * import { Signal, Subtract } from "tone";
 * // subtract a scalar from a signal
 * const sub = new Subtract(1);
 * const sig = new Signal(4).connect(sub);
 * // the output of sub is 3.
 * @example
 * import { Signal, Subtract } from "tone";
 * // subtract two signals
 * const sub = new Subtract();
 * const sigA = new Signal(10);
 * const sigB = new Signal(2.5);
 * sigA.connect(sub);
 * sigB.connect(sub.subtrahend);
 * // output of sub is 7.5
 * @category Signal
 */
var Subtract = /** @class */ (function (_super) {
    tslib_1.__extends(Subtract, _super);
    function Subtract() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Subtract.getDefaults(), arguments, ["value"]))) || this;
        _this.override = false;
        _this.name = "Subtract";
        /**
         * the summing node
         */
        _this._sum = new Gain({ context: _this.context });
        _this.input = _this._sum;
        _this.output = _this._sum;
        /**
         * Negate the input of the second input before connecting it to the summing node.
         */
        _this._neg = new Negate({ context: _this.context });
        /**
         * The value which is subtracted from the main signal
         */
        _this.subtrahend = _this._param;
        connectSeries(_this._constantSource, _this._neg, _this._sum);
        return _this;
    }
    Subtract.getDefaults = function () {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    };
    Subtract.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._neg.dispose();
        this._sum.dispose();
        return this;
    };
    return Subtract;
}(Signal));
export { Subtract };
//# sourceMappingURL=Subtract.js.map
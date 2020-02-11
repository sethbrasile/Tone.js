import * as tslib_1 from "tslib";
import { connectSeries } from "../core/context/ToneAudioNode";
import { Gain } from "../core/context/Gain";
import { optionsFromArguments } from "../core/util/Defaults";
import { Signal } from "./Signal";
/**
 * Add a signal and a number or two signals. When no value is
 * passed into the constructor, Tone.Add will sum input and `addend`
 * If a value is passed into the constructor, the it will be added to the input.
 *
 * @example
 * import { Add, Signal } from "tone";
 * const signal = new Signal(2);
 * // add a signal and a scalar
 * const add = new Add(2);
 * signal.connect(add);
 * // the output of add equals 4
 * @example
 * import { Add, Signal } from "tone";
 * // Add two signal inputs
 * const add = new Add();
 * const sig0 = new Signal(3).connect(add);
 * const sig1 = new Signal(4).connect(add.addend);
 * // the output of add equals 7.
 * @category Signal
 */
var Add = /** @class */ (function (_super) {
    tslib_1.__extends(Add, _super);
    function Add() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Add.getDefaults(), arguments, ["value"]))) || this;
        _this.override = false;
        _this.name = "Add";
        /**
         * the summing node
         */
        _this._sum = new Gain({ context: _this.context });
        _this.input = _this._sum;
        _this.output = _this._sum;
        /**
         * The value which is added to the input signal
         */
        _this.addend = _this._param;
        connectSeries(_this._constantSource, _this._sum);
        return _this;
    }
    Add.getDefaults = function () {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    };
    Add.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._sum.dispose();
        return this;
    };
    return Add;
}(Signal));
export { Add };
//# sourceMappingURL=Add.js.map
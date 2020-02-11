import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { connectSeries, ToneAudioNode } from "../../core/context/ToneAudioNode";
/**
 * PhaseShiftAllpass is an very efficient implementation of a Hilbert Transform
 * using two Allpass filter banks whose outputs have a phase difference of 90°.
 * Here the `offset90` phase is offset by +90° in relation to `output`.
 * Coefficients and structure was developed by Olli Niemitalo.
 * For more details see: http://yehar.com/blog/?p=368
 * @category Component
 */
var PhaseShiftAllpass = /** @class */ (function (_super) {
    tslib_1.__extends(PhaseShiftAllpass, _super);
    function PhaseShiftAllpass(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "PhaseShiftAllpass";
        _this.input = new Gain({ context: _this.context });
        /**
         * The phase shifted output
         */
        _this.output = new Gain({ context: _this.context });
        /**
         * The PhaseShifted allpass output
         */
        _this.offset90 = new Gain({ context: _this.context });
        var allpassBank1Values = [0.6923878, 0.9360654322959, 0.9882295226860, 0.9987488452737];
        var allpassBank2Values = [0.4021921162426, 0.8561710882420, 0.9722909545651, 0.9952884791278];
        _this._bank0 = _this._createAllPassFilterBank(allpassBank1Values);
        _this._bank1 = _this._createAllPassFilterBank(allpassBank2Values);
        _this._oneSampleDelay = _this.context.createIIRFilter([0.0, 1.0], [1.0, 0.0]);
        // connect Allpass filter banks
        connectSeries.apply(void 0, tslib_1.__spread([_this.input], _this._bank0, [_this._oneSampleDelay, _this.output]));
        connectSeries.apply(void 0, tslib_1.__spread([_this.input], _this._bank1, [_this.offset90]));
        return _this;
    }
    /**
     * Create all of the IIR filters from an array of values using the coefficient calculation.
     */
    PhaseShiftAllpass.prototype._createAllPassFilterBank = function (bankValues) {
        var _this = this;
        var nodes = bankValues.map(function (value) {
            var coefficients = [[value * value, 0, -1], [1, 0, -(value * value)]];
            return _this.context.createIIRFilter(coefficients[0], coefficients[1]);
        });
        return nodes;
    };
    PhaseShiftAllpass.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.input.dispose();
        this.output.dispose();
        this.offset90.dispose();
        this._bank0.forEach(function (f) { return f.disconnect(); });
        this._bank1.forEach(function (f) { return f.disconnect(); });
        this._oneSampleDelay.disconnect();
        return this;
    };
    return PhaseShiftAllpass;
}(ToneAudioNode));
export { PhaseShiftAllpass };
//# sourceMappingURL=PhaseShiftAllpass.js.map
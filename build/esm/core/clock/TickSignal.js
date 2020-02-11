import * as tslib_1 from "tslib";
import { Signal } from "../../signal/Signal";
import { optionsFromArguments } from "../util/Defaults";
import { TickParam } from "./TickParam";
/**
 * TickSignal extends Tone.Signal, but adds the capability
 * to calculate the number of elapsed ticks. exponential and target curves
 * are approximated with multiple linear ramps.
 *
 * Thank you Bruno Dias, H. Sofia Pinto, and David M. Matos,
 * for your [WAC paper](https://smartech.gatech.edu/bitstream/handle/1853/54588/WAC2016-49.pdf)
 * describing integrating timing functions for tempo calculations.
 */
var TickSignal = /** @class */ (function (_super) {
    tslib_1.__extends(TickSignal, _super);
    function TickSignal() {
        var _this = _super.call(this, optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"])) || this;
        _this.name = "TickSignal";
        var options = optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]);
        _this.input = _this._param = new TickParam({
            context: _this.context,
            convert: options.convert,
            multiplier: options.multiplier,
            param: _this._constantSource.offset,
            units: options.units,
            value: options.value,
        });
        return _this;
    }
    TickSignal.getDefaults = function () {
        return Object.assign(Signal.getDefaults(), {
            multiplier: 1,
            units: "hertz",
            value: 1,
        });
    };
    TickSignal.prototype.ticksToTime = function (ticks, when) {
        return this._param.ticksToTime(ticks, when);
    };
    TickSignal.prototype.timeToTicks = function (duration, when) {
        return this._param.timeToTicks(duration, when);
    };
    TickSignal.prototype.getTimeOfTick = function (tick) {
        return this._param.getTimeOfTick(tick);
    };
    TickSignal.prototype.getDurationOfTicks = function (ticks, time) {
        return this._param.getDurationOfTicks(ticks, time);
    };
    TickSignal.prototype.getTicksAtTime = function (time) {
        return this._param.getTicksAtTime(time);
    };
    Object.defineProperty(TickSignal.prototype, "multiplier", {
        /**
         * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
         */
        get: function () {
            return this._param.multiplier;
        },
        set: function (m) {
            this._param.multiplier = m;
        },
        enumerable: true,
        configurable: true
    });
    TickSignal.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._param.dispose();
        return this;
    };
    return TickSignal;
}(Signal));
export { TickSignal };
//# sourceMappingURL=TickSignal.js.map
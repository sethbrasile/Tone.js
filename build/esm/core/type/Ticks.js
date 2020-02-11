import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { TransportTimeClass } from "./TransportTime";
/**
 * Ticks is a primitive type for encoding Time values.
 * Ticks can be constructed with or without the `new` keyword. Ticks can be passed
 * into the parameter of any method which takes time as an argument.
 * @example
 * import { Ticks } from "tone";
 * const t = Ticks("4n"); // a quarter note as ticks
 * @category Unit
 */
var TicksClass = /** @class */ (function (_super) {
    tslib_1.__extends(TicksClass, _super);
    function TicksClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Ticks";
        _this.defaultUnits = "i";
        return _this;
    }
    /**
     * Get the current time in the given units
     */
    TicksClass.prototype._now = function () {
        return this.context.transport.ticks;
    };
    /**
     * Return the value of the beats in the current units
     */
    TicksClass.prototype._beatsToUnits = function (beats) {
        return this._getPPQ() * beats;
    };
    /**
     * Returns the value of a second in the current units
     */
    TicksClass.prototype._secondsToUnits = function (seconds) {
        return Math.floor(seconds / (60 / this._getBpm()) * this._getPPQ());
    };
    /**
     * Returns the value of a tick in the current time units
     */
    TicksClass.prototype._ticksToUnits = function (ticks) {
        return ticks;
    };
    /**
     * Return the time in ticks
     */
    TicksClass.prototype.toTicks = function () {
        return this.valueOf();
    };
    /**
     * Return the time in seconds
     */
    TicksClass.prototype.toSeconds = function () {
        return (this.valueOf() / this._getPPQ()) * (60 / this._getBpm());
    };
    return TicksClass;
}(TransportTimeClass));
export { TicksClass };
/**
 * Convert a time representation to ticks
 * @category Unit
 */
export function Ticks(value, units) {
    return new TicksClass(getContext(), value, units);
}
//# sourceMappingURL=Ticks.js.map
import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { ftom } from "./Conversions";
import { TimeBaseClass } from "./TimeBase";
/**
 * TimeClass is a primitive type for encoding and decoding Time values.
 * TimeClass can be passed into the parameter of any method which takes time as an argument.
 * @param  val    The time value.
 * @param  units  The units of the value.
 * @example
 * import { Time } from "tone";
 * const time = Time("4n"); // a quarter note
 * @category Unit
 */
var TimeClass = /** @class */ (function (_super) {
    tslib_1.__extends(TimeClass, _super);
    function TimeClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "TimeClass";
        return _this;
    }
    TimeClass.prototype._getExpressions = function () {
        var _this = this;
        return Object.assign(_super.prototype._getExpressions.call(this), {
            now: {
                method: function (capture) {
                    return _this._now() + new _this.constructor(_this.context, capture).valueOf();
                },
                regexp: /^\+(.+)/,
            },
            quantize: {
                method: function (capture) {
                    var quantTo = new TimeClass(_this.context, capture).valueOf();
                    return _this._secondsToUnits(_this.context.transport.nextSubdivision(quantTo));
                },
                regexp: /^@(.+)/,
            },
        });
    };
    /**
     * Quantize the time by the given subdivision. Optionally add a
     * percentage which will move the time value towards the ideal
     * quantized value by that percentage.
     * @param  subdiv    The subdivision to quantize to
     * @param  percent  Move the time value towards the quantized value by a percentage.
     * @example
     * import { Time } from "tone";
     * Time(21).quantize(2); // returns 22
     * Time(0.6).quantize("4n", 0.5); // returns 0.55
     */
    TimeClass.prototype.quantize = function (subdiv, percent) {
        if (percent === void 0) { percent = 1; }
        var subdivision = new this.constructor(this.context, subdiv).valueOf();
        var value = this.valueOf();
        var multiple = Math.round(value / subdivision);
        var ideal = multiple * subdivision;
        var diff = ideal - value;
        return value + diff * percent;
    };
    //-------------------------------------
    // CONVERSIONS
    //-------------------------------------
    /**
     * Convert a Time to Notation. The notation values are will be the
     * closest representation between 1m to 128th note.
     * @return {Notation}
     * @example
     * import { Time } from "tone";
     * // if the Transport is at 120bpm:
     * Time(2).toNotation(); // returns "1m"
     */
    TimeClass.prototype.toNotation = function () {
        var _this = this;
        var time = this.toSeconds();
        var testNotations = ["1m"];
        for (var power = 1; power < 9; power++) {
            var subdiv = Math.pow(2, power);
            testNotations.push(subdiv + "n.");
            testNotations.push(subdiv + "n");
            testNotations.push(subdiv + "t");
        }
        testNotations.push("0");
        // find the closets notation representation
        var closest = testNotations[0];
        var closestSeconds = new TimeClass(this.context, testNotations[0]).toSeconds();
        testNotations.forEach(function (notation) {
            var notationSeconds = new TimeClass(_this.context, notation).toSeconds();
            if (Math.abs(notationSeconds - time) < Math.abs(closestSeconds - time)) {
                closest = notation;
                closestSeconds = notationSeconds;
            }
        });
        return closest;
    };
    /**
     * Return the time encoded as Bars:Beats:Sixteenths.
     */
    TimeClass.prototype.toBarsBeatsSixteenths = function () {
        var quarterTime = this._beatsToUnits(1);
        var quarters = this.valueOf() / quarterTime;
        quarters = parseFloat(quarters.toFixed(4));
        var measures = Math.floor(quarters / this._getTimeSignature());
        var sixteenths = (quarters % 1) * 4;
        quarters = Math.floor(quarters) % this._getTimeSignature();
        var sixteenthString = sixteenths.toString();
        if (sixteenthString.length > 3) {
            // the additional parseFloat removes insignificant trailing zeroes
            sixteenths = parseFloat(parseFloat(sixteenthString).toFixed(3));
        }
        var progress = [measures, quarters, sixteenths];
        return progress.join(":");
    };
    /**
     * Return the time in ticks.
     */
    TimeClass.prototype.toTicks = function () {
        var quarterTime = this._beatsToUnits(1);
        var quarters = this.valueOf() / quarterTime;
        return Math.round(quarters * this._getPPQ());
    };
    /**
     * Return the time in seconds.
     */
    TimeClass.prototype.toSeconds = function () {
        return this.valueOf();
    };
    /**
     * Return the value as a midi note.
     */
    TimeClass.prototype.toMidi = function () {
        return ftom(this.toFrequency());
    };
    TimeClass.prototype._now = function () {
        return this.context.now();
    };
    return TimeClass;
}(TimeBaseClass));
export { TimeClass };
/**
 * Create a TimeClass from a time string or number.
 * @param value A value which reprsents time
 * @param units The value's units if they can't be inferred by the value.
 * @category Unit
 */
export function Time(value, units) {
    return new TimeClass(getContext(), value, units);
}
//# sourceMappingURL=Time.js.map
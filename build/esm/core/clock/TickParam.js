import * as tslib_1 from "tslib";
import { Param } from "../context/Param";
import { optionsFromArguments } from "../util/Defaults";
import { Timeline } from "../util/Timeline";
import { isUndef } from "../util/TypeCheck";
/**
 * A Param class just for computing ticks. Similar to the [[Param]] class,
 * but offers conversion to BPM values as well as ability to compute tick
 * duration and elapsed ticks
 */
var TickParam = /** @class */ (function (_super) {
    tslib_1.__extends(TickParam, _super);
    function TickParam() {
        var _this = _super.call(this, optionsFromArguments(TickParam.getDefaults(), arguments, ["value"])) || this;
        _this.name = "TickParam";
        /**
         * The timeline which tracks all of the automations.
         */
        _this._events = new Timeline(Infinity);
        /**
         * The internal holder for the multiplier value
         */
        _this._multiplier = 1;
        var options = optionsFromArguments(TickParam.getDefaults(), arguments, ["value"]);
        // set the multiplier
        _this._multiplier = options.multiplier;
        // clear the ticks from the beginning
        _this._events.cancel(0);
        // set an initial event
        _this._events.add({
            ticks: 0,
            time: 0,
            type: "setValueAtTime",
            value: _this._fromType(options.value),
        });
        _this.setValueAtTime(options.value, 0);
        return _this;
    }
    TickParam.getDefaults = function () {
        return Object.assign(Param.getDefaults(), {
            multiplier: 1,
            units: "hertz",
            value: 1,
        });
    };
    TickParam.prototype.setTargetAtTime = function (value, time, constant) {
        // approximate it with multiple linear ramps
        time = this.toSeconds(time);
        this.setRampPoint(time);
        var computedValue = this._fromType(value);
        // start from previously scheduled value
        var prevEvent = this._events.get(time);
        var segments = Math.round(Math.max(1 / constant, 1));
        for (var i = 0; i <= segments; i++) {
            var segTime = constant * i + time;
            var rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, computedValue, constant, segTime);
            this.linearRampToValueAtTime(this._toType(rampVal), segTime);
        }
        return this;
    };
    TickParam.prototype.setValueAtTime = function (value, time) {
        var computedTime = this.toSeconds(time);
        _super.prototype.setValueAtTime.call(this, value, time);
        var event = this._events.get(computedTime);
        var previousEvent = this._events.previousEvent(event);
        var ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
        event.ticks = Math.max(ticksUntilTime, 0);
        return this;
    };
    TickParam.prototype.linearRampToValueAtTime = function (value, time) {
        var computedTime = this.toSeconds(time);
        _super.prototype.linearRampToValueAtTime.call(this, value, time);
        var event = this._events.get(computedTime);
        var previousEvent = this._events.previousEvent(event);
        var ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
        event.ticks = Math.max(ticksUntilTime, 0);
        return this;
    };
    TickParam.prototype.exponentialRampToValueAtTime = function (value, time) {
        // aproximate it with multiple linear ramps
        time = this.toSeconds(time);
        var computedVal = this._fromType(value);
        // start from previously scheduled value
        var prevEvent = this._events.get(time);
        // approx 10 segments per second
        var segments = Math.round(Math.max((time - prevEvent.time) * 10, 1));
        var segmentDur = ((time - prevEvent.time) / segments);
        for (var i = 0; i <= segments; i++) {
            var segTime = segmentDur * i + prevEvent.time;
            var rampVal = this._exponentialInterpolate(prevEvent.time, prevEvent.value, time, computedVal, segTime);
            this.linearRampToValueAtTime(this._toType(rampVal), segTime);
        }
        return this;
    };
    /**
     * Returns the tick value at the time. Takes into account
     * any automation curves scheduled on the signal.
     * @param  event The time to get the tick count at
     * @return The number of ticks which have elapsed at the time given any automations.
     */
    TickParam.prototype._getTicksUntilEvent = function (event, time) {
        if (event === null) {
            event = {
                ticks: 0,
                time: 0,
                type: "setValueAtTime",
                value: 0,
            };
        }
        else if (isUndef(event.ticks)) {
            var previousEvent = this._events.previousEvent(event);
            event.ticks = this._getTicksUntilEvent(previousEvent, event.time);
        }
        var val0 = this._fromType(this.getValueAtTime(event.time));
        var val1 = this._fromType(this.getValueAtTime(time));
        // if it's right on the line, take the previous value
        var onTheLineEvent = this._events.get(time);
        if (onTheLineEvent && onTheLineEvent.time === time && onTheLineEvent.type === "setValueAtTime") {
            val1 = this._fromType(this.getValueAtTime(time - this.sampleTime));
        }
        return 0.5 * (time - event.time) * (val0 + val1) + event.ticks;
    };
    /**
     * Returns the tick value at the time. Takes into account
     * any automation curves scheduled on the signal.
     * @param  time The time to get the tick count at
     * @return The number of ticks which have elapsed at the time given any automations.
     */
    TickParam.prototype.getTicksAtTime = function (time) {
        var computedTime = this.toSeconds(time);
        var event = this._events.get(computedTime);
        return Math.max(this._getTicksUntilEvent(event, computedTime), 0);
    };
    /**
     * Return the elapsed time of the number of ticks from the given time
     * @param ticks The number of ticks to calculate
     * @param  time The time to get the next tick from
     * @return The duration of the number of ticks from the given time in seconds
     */
    TickParam.prototype.getDurationOfTicks = function (ticks, time) {
        var computedTime = this.toSeconds(time);
        var currentTick = this.getTicksAtTime(time);
        return this.getTimeOfTick(currentTick + ticks) - computedTime;
    };
    /**
     * Given a tick, returns the time that tick occurs at.
     * @return The time that the tick occurs.
     */
    TickParam.prototype.getTimeOfTick = function (tick) {
        var before = this._events.get(tick, "ticks");
        var after = this._events.getAfter(tick, "ticks");
        if (before && before.ticks === tick) {
            return before.time;
        }
        else if (before && after &&
            after.type === "linearRampToValueAtTime" &&
            before.value !== after.value) {
            var val0 = this._fromType(this.getValueAtTime(before.time));
            var val1 = this._fromType(this.getValueAtTime(after.time));
            var delta = (val1 - val0) / (after.time - before.time);
            var k = Math.sqrt(Math.pow(val0, 2) - 2 * delta * (before.ticks - tick));
            var sol1 = (-val0 + k) / delta;
            var sol2 = (-val0 - k) / delta;
            return (sol1 > 0 ? sol1 : sol2) + before.time;
        }
        else if (before) {
            if (before.value === 0) {
                return Infinity;
            }
            else {
                return before.time + (tick - before.ticks) / before.value;
            }
        }
        else {
            return tick / this._initialValue;
        }
    };
    /**
     * Convert some number of ticks their the duration in seconds accounting
     * for any automation curves starting at the given time.
     * @param  ticks The number of ticks to convert to seconds.
     * @param  when  When along the automation timeline to convert the ticks.
     * @return The duration in seconds of the ticks.
     */
    TickParam.prototype.ticksToTime = function (ticks, when) {
        return this.getDurationOfTicks(ticks, when);
    };
    /**
     * The inverse of [[ticksToTime]]. Convert a duration in
     * seconds to the corresponding number of ticks accounting for any
     * automation curves starting at the given time.
     * @param  duration The time interval to convert to ticks.
     * @param  when When along the automation timeline to convert the ticks.
     * @return The duration in ticks.
     */
    TickParam.prototype.timeToTicks = function (duration, when) {
        var computedTime = this.toSeconds(when);
        var computedDuration = this.toSeconds(duration);
        var startTicks = this.getTicksAtTime(computedTime);
        var endTicks = this.getTicksAtTime(computedTime + computedDuration);
        return endTicks - startTicks;
    };
    /**
     * Convert from the type when the unit value is BPM
     */
    TickParam.prototype._fromType = function (val) {
        if (this.units === "bpm" && this.multiplier) {
            return 1 / (60 / val / this.multiplier);
        }
        else {
            return _super.prototype._fromType.call(this, val);
        }
    };
    /**
     * Special case of type conversion where the units === "bpm"
     */
    TickParam.prototype._toType = function (val) {
        if (this.units === "bpm" && this.multiplier) {
            return (val / this.multiplier) * 60;
        }
        else {
            return _super.prototype._toType.call(this, val);
        }
    };
    Object.defineProperty(TickParam.prototype, "multiplier", {
        /**
         * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
         */
        get: function () {
            return this._multiplier;
        },
        set: function (m) {
            // get and reset the current value with the new multiplier
            // might be necessary to clear all the previous values
            var currentVal = this.value;
            this._multiplier = m;
            this.cancelScheduledValues(0);
            this.setValueAtTime(currentVal, 0);
        },
        enumerable: true,
        configurable: true
    });
    return TickParam;
}(Param));
export { TickParam };
//# sourceMappingURL=TickParam.js.map
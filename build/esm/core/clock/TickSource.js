import * as tslib_1 from "tslib";
import { ToneWithContext } from "../context/ToneWithContext";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { StateTimeline } from "../util/StateTimeline";
import { Timeline } from "../util/Timeline";
import { isDefined } from "../util/TypeCheck";
import { TickSignal } from "./TickSignal";
/**
 * Uses [TickSignal](TickSignal) to track elapsed ticks with complex automation curves.
 */
var TickSource = /** @class */ (function (_super) {
    tslib_1.__extends(TickSource, _super);
    function TickSource() {
        var _this = _super.call(this, optionsFromArguments(TickSource.getDefaults(), arguments, ["frequency"])) || this;
        _this.name = "TickSource";
        /**
         * The state timeline
         */
        _this._state = new StateTimeline();
        /**
         * The offset values of the ticks
         */
        _this._tickOffset = new Timeline();
        var options = optionsFromArguments(TickSource.getDefaults(), arguments, ["frequency"]);
        _this.frequency = new TickSignal({
            context: _this.context,
            units: options.units,
            value: options.frequency,
        });
        readOnly(_this, "frequency");
        // set the initial state
        _this._state.setStateAtTime("stopped", 0);
        // add the first event
        _this.setTicksAtTime(0, 0);
        return _this;
    }
    TickSource.getDefaults = function () {
        return Object.assign({
            frequency: 1,
            units: "hertz",
        }, ToneWithContext.getDefaults());
    };
    Object.defineProperty(TickSource.prototype, "state", {
        /**
         * Returns the playback state of the source, either "started", "stopped" or "paused".
         */
        get: function () {
            return this.getStateAtTime(this.now());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the clock at the given time. Optionally pass in an offset
     * of where to start the tick counter from.
     * @param  time    The time the clock should start
     * @param offset The number of ticks to start the source at
     */
    TickSource.prototype.start = function (time, offset) {
        var computedTime = this.toSeconds(time);
        if (this._state.getValueAtTime(computedTime) !== "started") {
            this._state.setStateAtTime("started", computedTime);
            if (isDefined(offset)) {
                this.setTicksAtTime(offset, computedTime);
            }
        }
        return this;
    };
    /**
     * Stop the clock. Stopping the clock resets the tick counter to 0.
     * @param time The time when the clock should stop.
     */
    TickSource.prototype.stop = function (time) {
        var computedTime = this.toSeconds(time);
        // cancel the previous stop
        if (this._state.getValueAtTime(computedTime) === "stopped") {
            var event_1 = this._state.get(computedTime);
            if (event_1 && event_1.time > 0) {
                this._tickOffset.cancel(event_1.time);
                this._state.cancel(event_1.time);
            }
        }
        this._state.cancel(computedTime);
        this._state.setStateAtTime("stopped", computedTime);
        this.setTicksAtTime(0, computedTime);
        return this;
    };
    /**
     * Pause the clock. Pausing does not reset the tick counter.
     * @param time The time when the clock should stop.
     */
    TickSource.prototype.pause = function (time) {
        var computedTime = this.toSeconds(time);
        if (this._state.getValueAtTime(computedTime) === "started") {
            this._state.setStateAtTime("paused", computedTime);
        }
        return this;
    };
    /**
     * Cancel start/stop/pause and setTickAtTime events scheduled after the given time.
     * @param time When to clear the events after
     */
    TickSource.prototype.cancel = function (time) {
        time = this.toSeconds(time);
        this._state.cancel(time);
        this._tickOffset.cancel(time);
        return this;
    };
    /**
     * Get the elapsed ticks at the given time
     * @param  time  When to get the tick value
     * @return The number of ticks
     */
    TickSource.prototype.getTicksAtTime = function (time) {
        var _this = this;
        var computedTime = this.toSeconds(time);
        var stopEvent = this._state.getLastState("stopped", computedTime);
        // this event allows forEachBetween to iterate until the current time
        var tmpEvent = { state: "paused", time: computedTime };
        this._state.add(tmpEvent);
        // keep track of the previous offset event
        var lastState = stopEvent;
        var elapsedTicks = 0;
        // iterate through all the events since the last stop
        this._state.forEachBetween(stopEvent.time, computedTime + this.sampleTime, function (e) {
            var periodStartTime = lastState.time;
            // if there is an offset event in this period use that
            var offsetEvent = _this._tickOffset.get(e.time);
            if (offsetEvent && offsetEvent.time >= lastState.time) {
                elapsedTicks = offsetEvent.ticks;
                periodStartTime = offsetEvent.time;
            }
            if (lastState.state === "started" && e.state !== "started") {
                elapsedTicks += _this.frequency.getTicksAtTime(e.time) - _this.frequency.getTicksAtTime(periodStartTime);
            }
            lastState = e;
        });
        // remove the temporary event
        this._state.remove(tmpEvent);
        // return the ticks
        return elapsedTicks;
    };
    Object.defineProperty(TickSource.prototype, "ticks", {
        /**
         * The number of times the callback was invoked. Starts counting at 0
         * and increments after the callback was invoked. Returns -1 when stopped.
         */
        get: function () {
            return this.getTicksAtTime(this.now());
        },
        set: function (t) {
            this.setTicksAtTime(t, this.now());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TickSource.prototype, "seconds", {
        /**
         * The time since ticks=0 that the TickSource has been running. Accounts
         * for tempo curves
         */
        get: function () {
            return this.getSecondsAtTime(this.now());
        },
        set: function (s) {
            var now = this.now();
            var ticks = this.frequency.timeToTicks(s, now);
            this.setTicksAtTime(ticks, now);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Return the elapsed seconds at the given time.
     * @param  time  When to get the elapsed seconds
     * @return  The number of elapsed seconds
     */
    TickSource.prototype.getSecondsAtTime = function (time) {
        var _this = this;
        time = this.toSeconds(time);
        var stopEvent = this._state.getLastState("stopped", time);
        // this event allows forEachBetween to iterate until the current time
        var tmpEvent = { state: "paused", time: time };
        this._state.add(tmpEvent);
        // keep track of the previous offset event
        var lastState = stopEvent;
        var elapsedSeconds = 0;
        // iterate through all the events since the last stop
        this._state.forEachBetween(stopEvent.time, time + this.sampleTime, function (e) {
            var periodStartTime = lastState.time;
            // if there is an offset event in this period use that
            var offsetEvent = _this._tickOffset.get(e.time);
            if (offsetEvent && offsetEvent.time >= lastState.time) {
                elapsedSeconds = offsetEvent.seconds;
                periodStartTime = offsetEvent.time;
            }
            if (lastState.state === "started" && e.state !== "started") {
                elapsedSeconds += e.time - periodStartTime;
            }
            lastState = e;
        });
        // remove the temporary event
        this._state.remove(tmpEvent);
        // return the ticks
        return elapsedSeconds;
    };
    /**
     * Set the clock's ticks at the given time.
     * @param  ticks The tick value to set
     * @param  time  When to set the tick value
     */
    TickSource.prototype.setTicksAtTime = function (ticks, time) {
        time = this.toSeconds(time);
        this._tickOffset.cancel(time);
        this._tickOffset.add({
            seconds: this.frequency.getDurationOfTicks(ticks, time),
            ticks: ticks,
            time: time,
        });
        return this;
    };
    /**
     * Returns the scheduled state at the given time.
     * @param  time  The time to query.
     */
    TickSource.prototype.getStateAtTime = function (time) {
        time = this.toSeconds(time);
        return this._state.getValueAtTime(time);
    };
    /**
     * Get the time of the given tick. The second argument
     * is when to test before. Since ticks can be set (with setTicksAtTime)
     * there may be multiple times for a given tick value.
     * @param  tick The tick number.
     * @param  before When to measure the tick value from.
     * @return The time of the tick
     */
    TickSource.prototype.getTimeOfTick = function (tick, before) {
        if (before === void 0) { before = this.now(); }
        var offset = this._tickOffset.get(before);
        var event = this._state.get(before);
        var startTime = Math.max(offset.time, event.time);
        var absoluteTicks = this.frequency.getTicksAtTime(startTime) + tick - offset.ticks;
        return this.frequency.getTimeOfTick(absoluteTicks);
    };
    /**
     * Invoke the callback event at all scheduled ticks between the
     * start time and the end time
     * @param  startTime  The beginning of the search range
     * @param  endTime    The end of the search range
     * @param  callback   The callback to invoke with each tick
     */
    TickSource.prototype.forEachTickBetween = function (startTime, endTime, callback) {
        var _this = this;
        // only iterate through the sections where it is "started"
        var lastStateEvent = this._state.get(startTime);
        this._state.forEachBetween(startTime, endTime, function (event) {
            if (lastStateEvent && lastStateEvent.state === "started" && event.state !== "started") {
                _this.forEachTickBetween(Math.max(lastStateEvent.time, startTime), event.time - _this.sampleTime, callback);
            }
            lastStateEvent = event;
        });
        var error = null;
        if (lastStateEvent && lastStateEvent.state === "started") {
            var maxStartTime = Math.max(lastStateEvent.time, startTime);
            // figure out the difference between the frequency ticks and the
            var startTicks = this.frequency.getTicksAtTime(maxStartTime);
            var ticksAtStart = this.frequency.getTicksAtTime(lastStateEvent.time);
            var diff = startTicks - ticksAtStart;
            var offset = Math.ceil(diff) - diff;
            var nextTickTime = this.frequency.getTimeOfTick(startTicks + offset);
            while (nextTickTime < endTime) {
                try {
                    callback(nextTickTime, Math.round(this.getTicksAtTime(nextTickTime)));
                }
                catch (e) {
                    error = e;
                    break;
                }
                nextTickTime += this.frequency.getDurationOfTicks(1, nextTickTime);
            }
        }
        if (error) {
            throw error;
        }
        return this;
    };
    /**
     * Clean up
     */
    TickSource.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._state.dispose();
        this._tickOffset.dispose();
        this.frequency.dispose();
        return this;
    };
    return TickSource;
}(ToneWithContext));
export { TickSource };
//# sourceMappingURL=TickSource.js.map
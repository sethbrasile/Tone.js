import * as tslib_1 from "tslib";
import { ToneWithContext } from "../context/ToneWithContext";
import { optionsFromArguments } from "../util/Defaults";
import { Emitter } from "../util/Emitter";
import { noOp, readOnly } from "../util/Interface";
import { StateTimeline } from "../util/StateTimeline";
import { TickSource } from "./TickSource";
import { assertContextRunning } from "../util/Debug";
/**
 * A sample accurate clock which provides a callback at the given rate.
 * While the callback is not sample-accurate (it is still susceptible to
 * loose JS timing), the time passed in as the argument to the callback
 * is precise. For most applications, it is better to use Tone.Transport
 * instead of the Clock by itself since you can synchronize multiple callbacks.
 * @example
 * import { Clock } from "tone";
 * // the callback will be invoked approximately once a second
 * // and will print the time exactly once a second apart.
 * const clock = new Clock(time => {
 * 	console.log(time);
 * }, 1);
 * clock.start();
 * @category Core
 */
var Clock = /** @class */ (function (_super) {
    tslib_1.__extends(Clock, _super);
    function Clock() {
        var _this = _super.call(this, optionsFromArguments(Clock.getDefaults(), arguments, ["callback", "frequency"])) || this;
        _this.name = "Clock";
        /**
         * The callback function to invoke at the scheduled tick.
         */
        _this.callback = noOp;
        /**
         * The last time the loop callback was invoked
         */
        _this._lastUpdate = 0;
        /**
         * Keep track of the playback state
         */
        _this._state = new StateTimeline("stopped");
        /**
         * Context bound reference to the _loop method
         * This is necessary to remove the event in the end.
         */
        _this._boundLoop = _this._loop.bind(_this);
        var options = optionsFromArguments(Clock.getDefaults(), arguments, ["callback", "frequency"]);
        _this.callback = options.callback;
        _this._tickSource = new TickSource({
            context: _this.context,
            frequency: options.frequency,
            units: options.units,
        });
        _this._lastUpdate = 0;
        _this.frequency = _this._tickSource.frequency;
        readOnly(_this, "frequency");
        // add an initial state
        _this._state.setStateAtTime("stopped", 0);
        // bind a callback to the worker thread
        _this.context.on("tick", _this._boundLoop);
        return _this;
    }
    Clock.getDefaults = function () {
        return Object.assign(ToneWithContext.getDefaults(), {
            callback: noOp,
            frequency: 1,
            units: "hertz",
        });
    };
    Object.defineProperty(Clock.prototype, "state", {
        /**
         * Returns the playback state of the source, either "started", "stopped" or "paused".
         */
        get: function () {
            return this._state.getValueAtTime(this.now());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the clock at the given time. Optionally pass in an offset
     * of where to start the tick counter from.
     * @param  time    The time the clock should start
     * @param offset  Where the tick counter starts counting from.
     */
    Clock.prototype.start = function (time, offset) {
        // make sure the context is running
        assertContextRunning(this.context);
        // start the loop
        var computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        if (this._state.getValueAtTime(computedTime) !== "started") {
            this._state.setStateAtTime("started", computedTime);
            this._tickSource.start(computedTime, offset);
            if (computedTime < this._lastUpdate) {
                this.emit("start", computedTime, offset);
            }
        }
        return this;
    };
    /**
     * Stop the clock. Stopping the clock resets the tick counter to 0.
     * @param time The time when the clock should stop.
     * @example
     * import { Clock } from "tone";
     * const clock = new Clock(time => {
     * 	console.log(time);
     * }, 1);
     * clock.start();
     * // stop the clock after 10 seconds
     * clock.stop("+10");
     */
    Clock.prototype.stop = function (time) {
        var computedTime = this.toSeconds(time);
        this.log("stop", computedTime);
        this._state.cancel(computedTime);
        this._state.setStateAtTime("stopped", computedTime);
        this._tickSource.stop(computedTime);
        if (computedTime < this._lastUpdate) {
            this.emit("stop", computedTime);
        }
        return this;
    };
    /**
     * Pause the clock. Pausing does not reset the tick counter.
     * @param time The time when the clock should stop.
     */
    Clock.prototype.pause = function (time) {
        var computedTime = this.toSeconds(time);
        if (this._state.getValueAtTime(computedTime) === "started") {
            this._state.setStateAtTime("paused", computedTime);
            this._tickSource.pause(computedTime);
            if (computedTime < this._lastUpdate) {
                this.emit("pause", computedTime);
            }
        }
        return this;
    };
    Object.defineProperty(Clock.prototype, "ticks", {
        /**
         * The number of times the callback was invoked. Starts counting at 0
         * and increments after the callback was invoked.
         */
        get: function () {
            return Math.ceil(this.getTicksAtTime(this.now()));
        },
        set: function (t) {
            this._tickSource.ticks = t;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Clock.prototype, "seconds", {
        /**
         * The time since ticks=0 that the Clock has been running. Accounts for tempo curves
         */
        get: function () {
            return this._tickSource.seconds;
        },
        set: function (s) {
            this._tickSource.seconds = s;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Return the elapsed seconds at the given time.
     * @param  time  When to get the elapsed seconds
     * @return  The number of elapsed seconds
     */
    Clock.prototype.getSecondsAtTime = function (time) {
        return this._tickSource.getSecondsAtTime(time);
    };
    /**
     * Set the clock's ticks at the given time.
     * @param  ticks The tick value to set
     * @param  time  When to set the tick value
     */
    Clock.prototype.setTicksAtTime = function (ticks, time) {
        this._tickSource.setTicksAtTime(ticks, time);
        return this;
    };
    /**
     * Get the time of the given tick. The second argument
     * is when to test before. Since ticks can be set (with setTicksAtTime)
     * there may be multiple times for a given tick value.
     * @param  tick The tick number.
     * @param  before When to measure the tick value from.
     * @return The time of the tick
     */
    Clock.prototype.getTimeOfTick = function (tick, before) {
        if (before === void 0) { before = this.now(); }
        return this._tickSource.getTimeOfTick(tick, before);
    };
    /**
     * Get the clock's ticks at the given time.
     * @param  time  When to get the tick value
     * @return The tick value at the given time.
     */
    Clock.prototype.getTicksAtTime = function (time) {
        return this._tickSource.getTicksAtTime(time);
    };
    /**
     * Get the time of the next tick
     * @param  offset The tick number.
     */
    Clock.prototype.nextTickTime = function (offset, when) {
        var computedTime = this.toSeconds(when);
        var currentTick = this.getTicksAtTime(computedTime);
        return this._tickSource.getTimeOfTick(currentTick + offset, computedTime);
    };
    /**
     * The scheduling loop.
     */
    Clock.prototype._loop = function () {
        var _this = this;
        var startTime = this._lastUpdate;
        var endTime = this.now();
        this._lastUpdate = endTime;
        this.log("loop", startTime, endTime);
        if (startTime !== endTime) {
            // the state change events
            this._state.forEachBetween(startTime, endTime, function (e) {
                switch (e.state) {
                    case "started":
                        var offset = _this._tickSource.getTicksAtTime(e.time);
                        _this.emit("start", e.time, offset);
                        break;
                    case "stopped":
                        if (e.time !== 0) {
                            _this.emit("stop", e.time);
                        }
                        break;
                    case "paused":
                        _this.emit("pause", e.time);
                        break;
                }
            });
            // the tick callbacks
            this._tickSource.forEachTickBetween(startTime, endTime, function (time, ticks) {
                _this.callback(time, ticks);
            });
        }
    };
    /**
     * Returns the scheduled state at the given time.
     * @param  time  The time to query.
     * @return  The name of the state input in setStateAtTime.
     * @example
     * import { Clock } from "tone";
     * const clock = new Clock();
     * clock.start("+0.1");
     * clock.getStateAtTime("+0.1"); // returns "started"
     */
    Clock.prototype.getStateAtTime = function (time) {
        var computedTime = this.toSeconds(time);
        return this._state.getValueAtTime(computedTime);
    };
    /**
     * Clean up
     */
    Clock.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.context.off("tick", this._boundLoop);
        this._tickSource.dispose();
        this._state.dispose();
        return this;
    };
    return Clock;
}(ToneWithContext));
export { Clock };
Emitter.mixin(Clock);
//# sourceMappingURL=Clock.js.map
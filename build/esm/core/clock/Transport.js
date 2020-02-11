import * as tslib_1 from "tslib";
import { TimeClass } from "../../core/type/Time";
import { TimelineValue } from "../../core/util/TimelineValue";
import { onContextClose, onContextInit } from "../context/ContextInitialization";
import { Gain } from "../context/Gain";
import { ToneWithContext } from "../context/ToneWithContext";
import { TicksClass } from "../type/Ticks";
import { TransportTimeClass } from "../type/TransportTime";
import { optionsFromArguments } from "../util/Defaults";
import { Emitter } from "../util/Emitter";
import { readOnly, writable } from "../util/Interface";
import { IntervalTimeline } from "../util/IntervalTimeline";
import { Timeline } from "../util/Timeline";
import { isArray, isDefined } from "../util/TypeCheck";
import { Clock } from "./Clock";
import { TransportEvent } from "./TransportEvent";
import { TransportRepeatEvent } from "./TransportRepeatEvent";
/**
 * Transport for timing musical events.
 * Supports tempo curves and time changes. Unlike browser-based timing (setInterval, requestAnimationFrame)
 * Transport timing events pass in the exact time of the scheduled event
 * in the argument of the callback function. Pass that time value to the object
 * you're scheduling. <br><br>
 * A single transport is created for you when the library is initialized.
 * <br><br>
 * The transport emits the events: "start", "stop", "pause", and "loop" which are
 * called with the time of that event as the argument.
 *
 * @example
 * import { Oscillator, Transport } from "tone";
 * const osc = new Oscillator().toDestination();
 * // repeated event every 8th note
 * Transport.scheduleRepeat((time) => {
 * 	// use the callback time to schedule events
 * 	osc.start(time).stop(time + 0.1);
 * }, "8n");
 * // transport must be started before it starts invoking events
 * Transport.start();
 * @category Core
 */
var Transport = /** @class */ (function (_super) {
    tslib_1.__extends(Transport, _super);
    function Transport() {
        var _this = _super.call(this, optionsFromArguments(Transport.getDefaults(), arguments)) || this;
        _this.name = "Transport";
        //-------------------------------------
        // 	LOOPING
        //-------------------------------------
        /**
         * If the transport loops or not.
         */
        _this._loop = new TimelineValue(false);
        /**
         * The loop start position in ticks
         */
        _this._loopStart = 0;
        /**
         * The loop end position in ticks
         */
        _this._loopEnd = 0;
        //-------------------------------------
        // 	TIMELINE EVENTS
        //-------------------------------------
        /**
         * All the events in an object to keep track by ID
         */
        _this._scheduledEvents = {};
        /**
         * The scheduled events.
         */
        _this._timeline = new Timeline();
        /**
         * Repeated events
         */
        _this._repeatedEvents = new IntervalTimeline();
        /**
         * All of the synced Signals
         */
        _this._syncedSignals = [];
        /**
         * The swing amount
         */
        _this._swingAmount = 0;
        var options = optionsFromArguments(Transport.getDefaults(), arguments);
        // CLOCK/TEMPO
        _this._ppq = options.ppq;
        _this._clock = new Clock({
            callback: _this._processTick.bind(_this),
            context: _this.context,
            frequency: 0,
            units: "bpm",
        });
        _this._bindClockEvents();
        _this.bpm = _this._clock.frequency;
        _this._clock.frequency.multiplier = options.ppq;
        _this.bpm.setValueAtTime(options.bpm, 0);
        readOnly(_this, "bpm");
        _this._timeSignature = options.timeSignature;
        // SWING
        _this._swingTicks = options.ppq / 2; // 8n
        return _this;
    }
    Transport.getDefaults = function () {
        return Object.assign(ToneWithContext.getDefaults(), {
            bpm: 120,
            loopEnd: "4m",
            loopStart: 0,
            ppq: 192,
            swing: 0,
            swingSubdivision: "8n",
            timeSignature: 4,
        });
    };
    //-------------------------------------
    // 	TICKS
    //-------------------------------------
    /**
     * called on every tick
     * @param  tickTime clock relative tick time
     */
    Transport.prototype._processTick = function (tickTime, ticks) {
        // handle swing
        if (this._swingAmount > 0 &&
            ticks % this._ppq !== 0 && // not on a downbeat
            ticks % (this._swingTicks * 2) !== 0) {
            // add some swing
            var progress = (ticks % (this._swingTicks * 2)) / (this._swingTicks * 2);
            var amount = Math.sin((progress) * Math.PI) * this._swingAmount;
            tickTime += new TicksClass(this.context, this._swingTicks * 2 / 3).toSeconds() * amount;
        }
        // do the loop test
        if (this._loop.get(tickTime)) {
            if (ticks >= this._loopEnd) {
                this.emit("loopEnd", tickTime);
                this._clock.setTicksAtTime(this._loopStart, tickTime);
                ticks = this._loopStart;
                this.emit("loopStart", tickTime, this._clock.getSecondsAtTime(tickTime));
                this.emit("loop", tickTime);
            }
        }
        // invoke the timeline events scheduled on this tick
        this._timeline.forEachAtTime(ticks, function (event) { return event.invoke(tickTime); });
    };
    //-------------------------------------
    // 	SCHEDULABLE EVENTS
    //-------------------------------------
    /**
     * Schedule an event along the timeline.
     * @param callback The callback to be invoked at the time.
     * @param time The time to invoke the callback at.
     * @return The id of the event which can be used for canceling the event.
     * @example
     * import { Transport } from "tone";
     * // schedule an event on the 16th measure
     * Transport.schedule((time) => {
     * 	// invoked on measure 16
     * 	console.log("measure 16!");
     * }, "16:0:0");
     */
    Transport.prototype.schedule = function (callback, time) {
        var event = new TransportEvent(this, {
            callback: callback,
            time: new TransportTimeClass(this.context, time).toTicks(),
        });
        return this._addEvent(event, this._timeline);
    };
    /**
     * Schedule a repeated event along the timeline. The event will fire
     * at the `interval` starting at the `startTime` and for the specified
     * `duration`.
     * @param  callback   The callback to invoke.
     * @param  interval   The duration between successive callbacks. Must be a positive number.
     * @param  startTime  When along the timeline the events should start being invoked.
     * @param  duration How long the event should repeat.
     * @return  The ID of the scheduled event. Use this to cancel the event.
     * @example
     * import { Oscillator, Transport } from "tone";
     * const osc = new Oscillator().toDestination().start();
     * // a callback invoked every eighth note after the first measure
     * Transport.scheduleRepeat((time) => {
     * 	osc.start(time).stop(time + 0.1);
     * }, "8n", "1m");
     */
    Transport.prototype.scheduleRepeat = function (callback, interval, startTime, duration) {
        if (duration === void 0) { duration = Infinity; }
        var event = new TransportRepeatEvent(this, {
            callback: callback,
            duration: new TimeClass(this.context, duration).toTicks(),
            interval: new TimeClass(this.context, interval).toTicks(),
            time: new TransportTimeClass(this.context, startTime).toTicks(),
        });
        // kick it off if the Transport is started
        // @ts-ignore
        return this._addEvent(event, this._repeatedEvents);
    };
    /**
     * Schedule an event that will be removed after it is invoked.
     * @param callback The callback to invoke once.
     * @param time The time the callback should be invoked.
     * @returns The ID of the scheduled event.
     */
    Transport.prototype.scheduleOnce = function (callback, time) {
        var event = new TransportEvent(this, {
            callback: callback,
            once: true,
            time: new TransportTimeClass(this.context, time).toTicks(),
        });
        return this._addEvent(event, this._timeline);
    };
    /**
     * Clear the passed in event id from the timeline
     * @param eventId The id of the event.
     */
    Transport.prototype.clear = function (eventId) {
        if (this._scheduledEvents.hasOwnProperty(eventId)) {
            var item = this._scheduledEvents[eventId.toString()];
            item.timeline.remove(item.event);
            item.event.dispose();
            delete this._scheduledEvents[eventId.toString()];
        }
        return this;
    };
    /**
     * Add an event to the correct timeline. Keep track of the
     * timeline it was added to.
     * @returns the event id which was just added
     */
    Transport.prototype._addEvent = function (event, timeline) {
        this._scheduledEvents[event.id.toString()] = {
            event: event,
            timeline: timeline,
        };
        timeline.add(event);
        return event.id;
    };
    /**
     * Remove scheduled events from the timeline after
     * the given time. Repeated events will be removed
     * if their startTime is after the given time
     * @param after Clear all events after this time.
     */
    Transport.prototype.cancel = function (after) {
        var _this = this;
        if (after === void 0) { after = 0; }
        var computedAfter = this.toTicks(after);
        this._timeline.forEachFrom(computedAfter, function (event) { return _this.clear(event.id); });
        this._repeatedEvents.forEachFrom(computedAfter, function (event) { return _this.clear(event.id); });
        return this;
    };
    //-------------------------------------
    // 	START/STOP/PAUSE
    //-------------------------------------
    /**
     * Bind start/stop/pause events from the clock and emit them.
     */
    Transport.prototype._bindClockEvents = function () {
        var _this = this;
        this._clock.on("start", function (time, offset) {
            offset = new TicksClass(_this.context, offset).toSeconds();
            _this.emit("start", time, offset);
        });
        this._clock.on("stop", function (time) {
            _this.emit("stop", time);
        });
        this._clock.on("pause", function (time) {
            _this.emit("pause", time);
        });
    };
    Object.defineProperty(Transport.prototype, "state", {
        /**
         * Returns the playback state of the source, either "started", "stopped", or "paused"
         */
        get: function () {
            return this._clock.getStateAtTime(this.now());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the transport and all sources synced to the transport.
     * @param  time The time when the transport should start.
     * @param  offset The timeline offset to start the transport.
     * @example
     * import { Transport } from "tone";
     * // start the transport in one second starting at beginning of the 5th measure.
     * Transport.start("+1", "4:0:0");
     */
    Transport.prototype.start = function (time, offset) {
        var offsetTicks;
        if (isDefined(offset)) {
            offsetTicks = this.toTicks(offset);
        }
        // start the clock
        this._clock.start(time, offsetTicks);
        return this;
    };
    /**
     * Stop the transport and all sources synced to the transport.
     * @param time The time when the transport should stop.
     * @example
     * import { Transport } from "tone";
     * Transport.stop();
     */
    Transport.prototype.stop = function (time) {
        this._clock.stop(time);
        return this;
    };
    /**
     * Pause the transport and all sources synced to the transport.
     */
    Transport.prototype.pause = function (time) {
        this._clock.pause(time);
        return this;
    };
    /**
     * Toggle the current state of the transport. If it is
     * started, it will stop it, otherwise it will start the Transport.
     * @param  time The time of the event
     */
    Transport.prototype.toggle = function (time) {
        time = this.toSeconds(time);
        if (this._clock.getStateAtTime(time) !== "started") {
            this.start(time);
        }
        else {
            this.stop(time);
        }
        return this;
    };
    Object.defineProperty(Transport.prototype, "timeSignature", {
        //-------------------------------------
        // 	SETTERS/GETTERS
        //-------------------------------------
        /**
         * The time signature as just the numerator over 4.
         * For example 4/4 would be just 4 and 6/8 would be 3.
         * @example
         * import { Transport } from "tone";
         * // common time
         * Transport.timeSignature = 4;
         * // 7/8
         * Transport.timeSignature = [7, 8];
         * // this will be reduced to a single number
         * Transport.timeSignature; // returns 3.5
         */
        get: function () {
            return this._timeSignature;
        },
        set: function (timeSig) {
            if (isArray(timeSig)) {
                timeSig = (timeSig[0] / timeSig[1]) * 4;
            }
            this._timeSignature = timeSig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "loopStart", {
        /**
         * When the Transport.loop = true, this is the starting position of the loop.
         */
        get: function () {
            return new TimeClass(this.context, this._loopStart, "i").toSeconds();
        },
        set: function (startPosition) {
            this._loopStart = this.toTicks(startPosition);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "loopEnd", {
        /**
         * When the Transport.loop = true, this is the ending position of the loop.
         */
        get: function () {
            return new TimeClass(this.context, this._loopEnd, "i").toSeconds();
        },
        set: function (endPosition) {
            this._loopEnd = this.toTicks(endPosition);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "loop", {
        /**
         * If the transport loops or not.
         */
        get: function () {
            return this._loop.get(this.now());
        },
        set: function (loop) {
            this._loop.set(loop, this.now());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Set the loop start and stop at the same time.
     * @example
     * import { Transport } from "tone";
     * // loop over the first measure
     * Transport.setLoopPoints(0, "1m");
     * Transport.loop = true;
     */
    Transport.prototype.setLoopPoints = function (startPosition, endPosition) {
        this.loopStart = startPosition;
        this.loopEnd = endPosition;
        return this;
    };
    Object.defineProperty(Transport.prototype, "swing", {
        /**
         * The swing value. Between 0-1 where 1 equal to the note + half the subdivision.
         */
        get: function () {
            return this._swingAmount;
        },
        set: function (amount) {
            // scale the values to a normal range
            this._swingAmount = amount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "swingSubdivision", {
        /**
         * Set the subdivision which the swing will be applied to.
         * The default value is an 8th note. Value must be less
         * than a quarter note.
         */
        get: function () {
            return new TicksClass(this.context, this._swingTicks).toNotation();
        },
        set: function (subdivision) {
            this._swingTicks = this.toTicks(subdivision);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "position", {
        /**
         * The Transport's position in Bars:Beats:Sixteenths.
         * Setting the value will jump to that position right away.
         */
        get: function () {
            var now = this.now();
            var ticks = this._clock.getTicksAtTime(now);
            return new TicksClass(this.context, ticks).toBarsBeatsSixteenths();
        },
        set: function (progress) {
            var ticks = this.toTicks(progress);
            this.ticks = ticks;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "seconds", {
        /**
         * The Transport's position in seconds
         * Setting the value will jump to that position right away.
         */
        get: function () {
            return this._clock.seconds;
        },
        set: function (s) {
            var now = this.now();
            var ticks = this._clock.frequency.timeToTicks(s, now);
            this.ticks = ticks;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "progress", {
        /**
         * The Transport's loop position as a normalized value. Always
         * returns 0 if the transport if loop is not true.
         */
        get: function () {
            if (this.loop) {
                var now = this.now();
                var ticks = this._clock.getTicksAtTime(now);
                return (ticks - this._loopStart) / (this._loopEnd - this._loopStart);
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Transport.prototype, "ticks", {
        /**
         * The transports current tick position.
         */
        get: function () {
            return this._clock.ticks;
        },
        set: function (t) {
            if (this._clock.ticks !== t) {
                var now = this.now();
                // stop everything synced to the transport
                if (this.state === "started") {
                    var ticks = this._clock.getTicksAtTime(now);
                    // schedule to start on the next tick, #573
                    var time = this._clock.getTimeOfTick(Math.ceil(ticks));
                    this.emit("stop", time);
                    this._clock.setTicksAtTime(t, time);
                    // restart it with the new time
                    this.emit("start", time, this._clock.getSecondsAtTime(time));
                }
                else {
                    this._clock.setTicksAtTime(t, now);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the clock's ticks at the given time.
     * @param  time  When to get the tick value
     * @return The tick value at the given time.
     */
    Transport.prototype.getTicksAtTime = function (time) {
        return Math.round(this._clock.getTicksAtTime(time));
    };
    /**
     * Return the elapsed seconds at the given time.
     * @param  time  When to get the elapsed seconds
     * @return  The number of elapsed seconds
     */
    Transport.prototype.getSecondsAtTime = function (time) {
        return this._clock.getSecondsAtTime(time);
    };
    Object.defineProperty(Transport.prototype, "PPQ", {
        /**
         * Pulses Per Quarter note. This is the smallest resolution
         * the Transport timing supports. This should be set once
         * on initialization and not set again. Changing this value
         * after other objects have been created can cause problems.
         */
        get: function () {
            return this._clock.frequency.multiplier;
        },
        set: function (ppq) {
            this._clock.frequency.multiplier = ppq;
        },
        enumerable: true,
        configurable: true
    });
    //-------------------------------------
    // 	SYNCING
    //-------------------------------------
    /**
     * Returns the time aligned to the next subdivision
     * of the Transport. If the Transport is not started,
     * it will return 0.
     * Note: this will not work precisely during tempo ramps.
     * @param  subdivision  The subdivision to quantize to
     * @return  The context time of the next subdivision.
     * @example
     * import { Transport } from "tone";
     * // the transport must be started, otherwise returns 0
     * Transport.start();
     * Transport.nextSubdivision("4n");
     */
    Transport.prototype.nextSubdivision = function (subdivision) {
        subdivision = this.toTicks(subdivision);
        if (this.state !== "started") {
            // if the transport's not started, return 0
            return 0;
        }
        else {
            var now = this.now();
            // the remainder of the current ticks and the subdivision
            var transportPos = this.getTicksAtTime(now);
            var remainingTicks = subdivision - transportPos % subdivision;
            return this._clock.nextTickTime(remainingTicks, now);
        }
    };
    /**
     * Attaches the signal to the tempo control signal so that
     * any changes in the tempo will change the signal in the same
     * ratio.
     *
     * @param signal
     * @param ratio Optionally pass in the ratio between the two signals.
     * 			Otherwise it will be computed based on their current values.
     */
    Transport.prototype.syncSignal = function (signal, ratio) {
        if (!ratio) {
            // get the sync ratio
            var now = this.now();
            if (signal.getValueAtTime(now) !== 0) {
                var bpm = this.bpm.getValueAtTime(now);
                var computedFreq = 1 / (60 / bpm / this.PPQ);
                ratio = signal.getValueAtTime(now) / computedFreq;
            }
            else {
                ratio = 0;
            }
        }
        var ratioSignal = new Gain(ratio);
        // @ts-ignore
        this.bpm.connect(ratioSignal);
        // @ts-ignore
        ratioSignal.connect(signal._param);
        this._syncedSignals.push({
            initial: signal.value,
            ratio: ratioSignal,
            signal: signal,
        });
        signal.value = 0;
        return this;
    };
    /**
     * Unsyncs a previously synced signal from the transport's control.
     * See Transport.syncSignal.
     */
    Transport.prototype.unsyncSignal = function (signal) {
        for (var i = this._syncedSignals.length - 1; i >= 0; i--) {
            var syncedSignal = this._syncedSignals[i];
            if (syncedSignal.signal === signal) {
                syncedSignal.ratio.dispose();
                syncedSignal.signal.value = syncedSignal.initial;
                this._syncedSignals.splice(i, 1);
            }
        }
        return this;
    };
    /**
     * Clean up.
     */
    Transport.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._clock.dispose();
        writable(this, "bpm");
        this._timeline.dispose();
        this._repeatedEvents.dispose();
        return this;
    };
    return Transport;
}(ToneWithContext));
export { Transport };
Emitter.mixin(Transport);
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(function (context) {
    context.transport = new Transport({ context: context });
});
onContextClose(function (context) {
    context.transport.dispose();
});
//# sourceMappingURL=Transport.js.map
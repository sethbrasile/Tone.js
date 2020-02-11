import * as tslib_1 from "tslib";
import "../core/clock/Transport";
import { ToneWithContext } from "../core/context/ToneWithContext";
import { TicksClass } from "../core/type/Ticks";
import { defaultArg, optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
import { StateTimeline } from "../core/util/StateTimeline";
import { isBoolean, isNumber } from "../core/util/TypeCheck";
/**
 * ToneEvent abstracts away this.context.transport.schedule and provides a schedulable
 * callback for a single or repeatable events along the timeline.
 *
 * @example
 * import { PolySynth, Sequence, ToneEvent, Transport } from "tone";
 *
 * const synth = new PolySynth().toDestination();
 * const chordEvent = new ToneEvent(((time, chord) => {
 * 	// the chord as well as the exact time of the event
 * 	// are passed in as arguments to the callback function
 * 	synth.triggerAttackRelease(chord, 0.5, time);
 * }), ["D4", "E4", "F4"]);
 * // start the chord at the beginning of the transport timeline
 * chordEvent.start();
 * // loop it every measure for 8 measures
 * chordEvent.loop = 8;
 * chordEvent.loopEnd = "1m";
 * @category Event
 */
var ToneEvent = /** @class */ (function (_super) {
    tslib_1.__extends(ToneEvent, _super);
    function ToneEvent() {
        var _this = _super.call(this, optionsFromArguments(ToneEvent.getDefaults(), arguments, ["callback", "value"])) || this;
        _this.name = "ToneEvent";
        /**
         * Tracks the scheduled events
         */
        _this._state = new StateTimeline("stopped");
        /**
         * A delay time from when the event is scheduled to start
         */
        _this._startOffset = 0;
        var options = optionsFromArguments(ToneEvent.getDefaults(), arguments, ["callback", "value"]);
        _this._loop = options.loop;
        _this.callback = options.callback;
        _this.value = options.value;
        _this._loopStart = _this.toTicks(options.loopStart);
        _this._loopEnd = _this.toTicks(options.loopEnd);
        _this._playbackRate = options.playbackRate;
        _this._probability = options.probability;
        _this._humanize = options.humanize;
        _this.mute = options.mute;
        _this._playbackRate = options.playbackRate;
        _this._state.increasing = true;
        // schedule the events for the first time
        _this._rescheduleEvents();
        return _this;
    }
    ToneEvent.getDefaults = function () {
        return Object.assign(ToneWithContext.getDefaults(), {
            callback: noOp,
            humanize: false,
            loop: false,
            loopEnd: "1m",
            loopStart: 0,
            mute: false,
            playbackRate: 1,
            probability: 1,
            value: null,
        });
    };
    /**
     * Reschedule all of the events along the timeline
     * with the updated values.
     * @param after Only reschedules events after the given time.
     */
    ToneEvent.prototype._rescheduleEvents = function (after) {
        var _this = this;
        if (after === void 0) { after = -1; }
        // if no argument is given, schedules all of the events
        this._state.forEachFrom(after, function (event) {
            var duration;
            if (event.state === "started") {
                if (event.id !== -1) {
                    _this.context.transport.clear(event.id);
                }
                var startTick = event.time + Math.round(_this.startOffset / _this._playbackRate);
                if (_this._loop === true || isNumber(_this._loop) && _this._loop > 1) {
                    duration = Infinity;
                    if (isNumber(_this._loop)) {
                        duration = (_this._loop) * _this._getLoopDuration();
                    }
                    var nextEvent = _this._state.getAfter(startTick);
                    if (nextEvent !== null) {
                        duration = Math.min(duration, nextEvent.time - startTick);
                    }
                    if (duration !== Infinity) {
                        // schedule a stop since it's finite duration
                        _this._state.setStateAtTime("stopped", startTick + duration + 1, { id: -1 });
                        duration = new TicksClass(_this.context, duration);
                    }
                    var interval = new TicksClass(_this.context, _this._getLoopDuration());
                    event.id = _this.context.transport.scheduleRepeat(_this._tick.bind(_this), interval, new TicksClass(_this.context, startTick), duration);
                }
                else {
                    event.id = _this.context.transport.schedule(_this._tick.bind(_this), new TicksClass(_this.context, startTick));
                }
            }
        });
    };
    Object.defineProperty(ToneEvent.prototype, "state", {
        /**
         * Returns the playback state of the note, either "started" or "stopped".
         */
        get: function () {
            return this._state.getValueAtTime(this.context.transport.ticks);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "startOffset", {
        /**
         * The start from the scheduled start time.
         */
        get: function () {
            return this._startOffset;
        },
        set: function (offset) {
            this._startOffset = offset;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "probability", {
        /**
         * The probability of the notes being triggered.
         */
        get: function () {
            return this._probability;
        },
        set: function (prob) {
            this._probability = prob;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "humanize", {
        /**
         * If set to true, will apply small random variation
         * to the callback time. If the value is given as a time, it will randomize
         * by that amount.
         * @example
         * import { ToneEvent } from "tone";
         * const event = new ToneEvent();
         * event.humanize = true;
         */
        get: function () {
            return this._humanize;
        },
        set: function (variation) {
            this._humanize = variation;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the note at the given time.
     * @param  time  When the event should start.
     */
    ToneEvent.prototype.start = function (time) {
        var ticks = this.toTicks(time);
        if (this._state.getValueAtTime(ticks) === "stopped") {
            this._state.add({
                id: -1,
                state: "started",
                time: ticks,
            });
            this._rescheduleEvents(ticks);
        }
        return this;
    };
    /**
     * Stop the Event at the given time.
     * @param  time  When the event should stop.
     */
    ToneEvent.prototype.stop = function (time) {
        this.cancel(time);
        var ticks = this.toTicks(time);
        if (this._state.getValueAtTime(ticks) === "started") {
            this._state.setStateAtTime("stopped", ticks, { id: -1 });
            var previousEvent = this._state.getBefore(ticks);
            var reschedulTime = ticks;
            if (previousEvent !== null) {
                reschedulTime = previousEvent.time;
            }
            this._rescheduleEvents(reschedulTime);
        }
        return this;
    };
    /**
     * Cancel all scheduled events greater than or equal to the given time
     * @param  time  The time after which events will be cancel.
     */
    ToneEvent.prototype.cancel = function (time) {
        var _this = this;
        time = defaultArg(time, -Infinity);
        var ticks = this.toTicks(time);
        this._state.forEachFrom(ticks, function (event) {
            _this.context.transport.clear(event.id);
        });
        this._state.cancel(ticks);
        return this;
    };
    /**
     * The callback function invoker. Also
     * checks if the Event is done playing
     * @param  time  The time of the event in seconds
     */
    ToneEvent.prototype._tick = function (time) {
        var ticks = this.context.transport.getTicksAtTime(time);
        if (!this.mute && this._state.getValueAtTime(ticks) === "started") {
            if (this.probability < 1 && Math.random() > this.probability) {
                return;
            }
            if (this.humanize) {
                var variation = 0.02;
                if (!isBoolean(this.humanize)) {
                    variation = this.toSeconds(this.humanize);
                }
                time += (Math.random() * 2 - 1) * variation;
            }
            this.callback(time, this.value);
        }
    };
    /**
     * Get the duration of the loop.
     */
    ToneEvent.prototype._getLoopDuration = function () {
        return Math.round((this._loopEnd - this._loopStart) / this._playbackRate);
    };
    Object.defineProperty(ToneEvent.prototype, "loop", {
        /**
         * If the note should loop or not
         * between ToneEvent.loopStart and
         * ToneEvent.loopEnd. If set to true,
         * the event will loop indefinitely,
         * if set to a number greater than 1
         * it will play a specific number of
         * times, if set to false, 0 or 1, the
         * part will only play once.
         */
        get: function () {
            return this._loop;
        },
        set: function (loop) {
            this._loop = loop;
            this._rescheduleEvents();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "playbackRate", {
        /**
         * The playback rate of the note. Defaults to 1.
         * @example
         * import { ToneEvent } from "tone";
         * const note = new ToneEvent();
         * note.loop = true;
         * // repeat the note twice as fast
         * note.playbackRate = 2;
         */
        get: function () {
            return this._playbackRate;
        },
        set: function (rate) {
            this._playbackRate = rate;
            this._rescheduleEvents();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "loopEnd", {
        /**
         * The loopEnd point is the time the event will loop
         * if ToneEvent.loop is true.
         */
        get: function () {
            return new TicksClass(this.context, this._loopEnd).toSeconds();
        },
        set: function (loopEnd) {
            this._loopEnd = this.toTicks(loopEnd);
            if (this._loop) {
                this._rescheduleEvents();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "loopStart", {
        /**
         * The time when the loop should start.
         */
        get: function () {
            return new TicksClass(this.context, this._loopStart).toSeconds();
        },
        set: function (loopStart) {
            this._loopStart = this.toTicks(loopStart);
            if (this._loop) {
                this._rescheduleEvents();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneEvent.prototype, "progress", {
        /**
         * The current progress of the loop interval.
         * Returns 0 if the event is not started yet or
         * it is not set to loop.
         */
        get: function () {
            if (this._loop) {
                var ticks = this.context.transport.ticks;
                var lastEvent = this._state.get(ticks);
                if (lastEvent !== null && lastEvent.state === "started") {
                    var loopDuration = this._getLoopDuration();
                    var progress = (ticks - lastEvent.time) % loopDuration;
                    return progress / loopDuration;
                }
                else {
                    return 0;
                }
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    ToneEvent.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.cancel();
        this._state.dispose();
        return this;
    };
    return ToneEvent;
}(ToneWithContext));
export { ToneEvent };
//# sourceMappingURL=ToneEvent.js.map
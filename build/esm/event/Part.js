import * as tslib_1 from "tslib";
import { TicksClass } from "../core/type/Ticks";
import { TransportTimeClass } from "../core/type/TransportTime";
import { defaultArg, optionsFromArguments } from "../core/util/Defaults";
import { StateTimeline } from "../core/util/StateTimeline";
import { isArray, isDefined, isObject, isUndef } from "../core/util/TypeCheck";
import { ToneEvent } from "./ToneEvent";
/**
 * Part is a collection ToneEvents which can be started/stopped and looped as a single unit.
 *
 * @example
 * import { Part, Synth } from "tone";
 * const synth = new Synth().toDestination();
 * const part = new Part(((time, note) => {
 * 	// the notes given as the second element in the array
 * 	// will be passed in as the second argument
 * 	synth.triggerAttackRelease(note, "8n", time);
 * }), [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]);
 * @example
 * import { Part, Synth } from "tone";
 * const synth = new Synth().toDestination();
 * // use an array of objects as long as the object has a "time" attribute
 * const part = new Part(((time, value) => {
 * 	// the value is an object which contains both the note and the velocity
 * 	synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
 * }), [{ time: 0, note: "C3", velocity: 0.9 },
 * 	{ time: "0:2", note: "C4", velocity: 0.5 }
 * ]).start(0);
 * @category Event
 */
var Part = /** @class */ (function (_super) {
    tslib_1.__extends(Part, _super);
    function Part() {
        var _this = _super.call(this, optionsFromArguments(Part.getDefaults(), arguments, ["callback", "events"])) || this;
        _this.name = "Part";
        /**
         * Tracks the scheduled events
         */
        _this._state = new StateTimeline("stopped");
        /**
         * The events that belong to this part
         */
        _this._events = new Set();
        var options = optionsFromArguments(Part.getDefaults(), arguments, ["callback", "events"]);
        // make sure things are assigned in the right order
        _this._state.increasing = true;
        // add the events
        options.events.forEach(function (event) {
            if (isArray(event)) {
                _this.add(event[0], event[1]);
            }
            else {
                _this.add(event);
            }
        });
        return _this;
    }
    Part.getDefaults = function () {
        return Object.assign(ToneEvent.getDefaults(), {
            events: [],
        });
    };
    /**
     * Start the part at the given time.
     * @param  time    When to start the part.
     * @param  offset  The offset from the start of the part to begin playing at.
     */
    Part.prototype.start = function (time, offset) {
        var _this = this;
        var ticks = this.toTicks(time);
        if (this._state.getValueAtTime(ticks) !== "started") {
            offset = defaultArg(offset, this._loop ? this._loopStart : 0);
            if (this._loop) {
                offset = defaultArg(offset, this._loopStart);
            }
            else {
                offset = defaultArg(offset, 0);
            }
            var computedOffset_1 = this.toTicks(offset);
            this._state.add({
                id: -1,
                offset: computedOffset_1,
                state: "started",
                time: ticks,
            });
            this._forEach(function (event) {
                _this._startNote(event, ticks, computedOffset_1);
            });
        }
        return this;
    };
    /**
     * Start the event in the given event at the correct time given
     * the ticks and offset and looping.
     * @param  event
     * @param  ticks
     * @param  offset
     */
    Part.prototype._startNote = function (event, ticks, offset) {
        ticks -= offset;
        if (this._loop) {
            if (event.startOffset >= this._loopStart && event.startOffset < this._loopEnd) {
                if (event.startOffset < offset) {
                    // start it on the next loop
                    ticks += this._getLoopDuration();
                }
                event.start(new TicksClass(this.context, ticks));
            }
            else if (event.startOffset < this._loopStart && event.startOffset >= offset) {
                event.loop = false;
                event.start(new TicksClass(this.context, ticks));
            }
        }
        else if (event.startOffset >= offset) {
            event.start(new TicksClass(this.context, ticks));
        }
    };
    Object.defineProperty(Part.prototype, "startOffset", {
        get: function () {
            return this._startOffset;
        },
        set: function (offset) {
            var _this = this;
            this._startOffset = offset;
            this._forEach(function (event) {
                event.startOffset += _this._startOffset;
            });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Stop the part at the given time.
     * @param  time  When to stop the part.
     */
    Part.prototype.stop = function (time) {
        var ticks = this.toTicks(time);
        this._state.cancel(ticks);
        this._state.setStateAtTime("stopped", ticks);
        this._forEach(function (event) {
            event.stop(time);
        });
        return this;
    };
    /**
     * Get/Set an Event's value at the given time.
     * If a value is passed in and no event exists at
     * the given time, one will be created with that value.
     * If two events are at the same time, the first one will
     * be returned.
     * @example
     * import { Part } from "tone";
     * const part = new Part();
     * part.at("1m"); // returns the part at the first measure
     * part.at("2m", "C2"); // set the value at "2m" to C2.
     * // if an event didn't exist at that time, it will be created.
     * @param time The time of the event to get or set.
     * @param value If a value is passed in, the value of the event at the given time will be set to it.
     */
    Part.prototype.at = function (time, value) {
        var timeInTicks = new TransportTimeClass(this.context, time).toTicks();
        var tickTime = new TicksClass(this.context, 1).toSeconds();
        var iterator = this._events.values();
        var result = iterator.next();
        while (!result.done) {
            var event_1 = result.value;
            if (Math.abs(timeInTicks - event_1.startOffset) < tickTime) {
                if (isDefined(value)) {
                    event_1.value = value;
                }
                return event_1;
            }
            result = iterator.next();
        }
        // if there was no event at that time, create one
        if (isDefined(value)) {
            this.add(time, value);
            // return the new event
            return this.at(time);
        }
        else {
            return null;
        }
    };
    Part.prototype.add = function (time, value) {
        // extract the parameters
        if (time instanceof Object && Reflect.has(time, "time")) {
            value = time;
            time = value.time;
        }
        var ticks = this.toTicks(time);
        var event;
        if (value instanceof ToneEvent) {
            event = value;
            event.callback = this._tick.bind(this);
        }
        else {
            event = new ToneEvent({
                callback: this._tick.bind(this),
                context: this.context,
                value: value,
            });
        }
        // the start offset
        event.startOffset = ticks;
        // initialize the values
        event.set({
            humanize: this.humanize,
            loop: this.loop,
            loopEnd: this.loopEnd,
            loopStart: this.loopStart,
            playbackRate: this.playbackRate,
            probability: this.probability,
        });
        this._events.add(event);
        // start the note if it should be played right now
        this._restartEvent(event);
        return this;
    };
    /**
     * Restart the given event
     */
    Part.prototype._restartEvent = function (event) {
        var _this = this;
        this._state.forEach(function (stateEvent) {
            if (stateEvent.state === "started") {
                _this._startNote(event, stateEvent.time, stateEvent.offset);
            }
            else {
                // stop the note
                event.stop(new TicksClass(_this.context, stateEvent.time));
            }
        });
    };
    Part.prototype.remove = function (time, value) {
        var _this = this;
        // extract the parameters
        if (isObject(time) && time.hasOwnProperty("time")) {
            value = time;
            time = value.time;
        }
        time = this.toTicks(time);
        this._events.forEach(function (event) {
            if (event.startOffset === time) {
                if (isUndef(value) || (isDefined(value) && event.value === value)) {
                    _this._events.delete(event);
                    event.dispose();
                }
            }
        });
        return this;
    };
    /**
     * Remove all of the notes from the group.
     */
    Part.prototype.clear = function () {
        this._forEach(function (event) { return event.dispose(); });
        this._events.clear();
        return this;
    };
    /**
     * Cancel scheduled state change events: i.e. "start" and "stop".
     * @param after The time after which to cancel the scheduled events.
     */
    Part.prototype.cancel = function (after) {
        this._forEach(function (event) { return event.cancel(after); });
        this._state.cancel(this.toTicks(after));
        return this;
    };
    /**
     * Iterate over all of the events
     */
    Part.prototype._forEach = function (callback) {
        if (this._events) {
            this._events.forEach(function (event) {
                if (event instanceof Part) {
                    event._forEach(callback);
                }
                else {
                    callback(event);
                }
            });
        }
        return this;
    };
    /**
     * Set the attribute of all of the events
     * @param  attr  the attribute to set
     * @param  value      The value to set it to
     */
    Part.prototype._setAll = function (attr, value) {
        this._forEach(function (event) {
            event[attr] = value;
        });
    };
    /**
     * Internal tick method
     * @param  time  The time of the event in seconds
     */
    Part.prototype._tick = function (time, value) {
        if (!this.mute) {
            this.callback(time, value);
        }
    };
    /**
     * Determine if the event should be currently looping
     * given the loop boundries of this Part.
     * @param  event  The event to test
     */
    Part.prototype._testLoopBoundries = function (event) {
        if (this._loop && (event.startOffset < this._loopStart || event.startOffset >= this._loopEnd)) {
            event.cancel(0);
        }
        else if (event.state === "stopped") {
            // reschedule it if it's stopped
            this._restartEvent(event);
        }
    };
    Object.defineProperty(Part.prototype, "probability", {
        get: function () {
            return this._probability;
        },
        set: function (prob) {
            this._probability = prob;
            this._setAll("probability", prob);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Part.prototype, "humanize", {
        get: function () {
            return this._humanize;
        },
        set: function (variation) {
            this._humanize = variation;
            this._setAll("humanize", variation);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Part.prototype, "loop", {
        /**
         * If the part should loop or not
         * between Part.loopStart and
         * Part.loopEnd. If set to true,
         * the part will loop indefinitely,
         * if set to a number greater than 1
         * it will play a specific number of
         * times, if set to false, 0 or 1, the
         * part will only play once.
         * @example
         * import { Part } from "tone";
         * const part = new Part();
         * // loop the part 8 times
         * part.loop = 8;
         */
        get: function () {
            return this._loop;
        },
        set: function (loop) {
            var _this = this;
            this._loop = loop;
            this._forEach(function (event) {
                event.loopStart = _this.loopStart;
                event.loopEnd = _this.loopEnd;
                event.loop = loop;
                _this._testLoopBoundries(event);
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Part.prototype, "loopEnd", {
        /**
         * The loopEnd point determines when it will
         * loop if Part.loop is true.
         */
        get: function () {
            return new TicksClass(this.context, this._loopEnd).toSeconds();
        },
        set: function (loopEnd) {
            var _this = this;
            this._loopEnd = this.toTicks(loopEnd);
            if (this._loop) {
                this._forEach(function (event) {
                    event.loopEnd = loopEnd;
                    _this._testLoopBoundries(event);
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Part.prototype, "loopStart", {
        /**
         * The loopStart point determines when it will
         * loop if Part.loop is true.
         */
        get: function () {
            return new TicksClass(this.context, this._loopStart).toSeconds();
        },
        set: function (loopStart) {
            var _this = this;
            this._loopStart = this.toTicks(loopStart);
            if (this._loop) {
                this._forEach(function (event) {
                    event.loopStart = _this.loopStart;
                    _this._testLoopBoundries(event);
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Part.prototype, "playbackRate", {
        /**
         * The playback rate of the part
         */
        get: function () {
            return this._playbackRate;
        },
        set: function (rate) {
            this._playbackRate = rate;
            this._setAll("playbackRate", rate);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Part.prototype, "length", {
        /**
         * The number of scheduled notes in the part.
         */
        get: function () {
            return this._events.size;
        },
        enumerable: true,
        configurable: true
    });
    Part.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.clear();
        return this;
    };
    return Part;
}(ToneEvent));
export { Part };
//# sourceMappingURL=Part.js.map
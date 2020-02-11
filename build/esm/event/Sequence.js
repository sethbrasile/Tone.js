import * as tslib_1 from "tslib";
import { TicksClass } from "../core/type/Ticks";
import { omitFromObject, optionsFromArguments } from "../core/util/Defaults";
import { isArray, isString } from "../core/util/TypeCheck";
import { Part } from "./Part";
import { ToneEvent } from "./ToneEvent";
/**
 * A sequence is an alternate notation of a part. Instead
 * of passing in an array of [time, event] pairs, pass
 * in an array of events which will be spaced at the
 * given subdivision. Sub-arrays will subdivide that beat
 * by the number of items are in the array.
 * Sequence notation inspiration from [Tidal](http://yaxu.org/tidal/)
 * @example
 * import { Sequence, Synth, Transport } from "tone";
 * const synth = new Synth().toDestination();
 * const seq = new Sequence((time, note) => {
 * 	synth.triggerAttackRelease(note, 0.1, time);
 * 	// subdivisions are given as subarrays
 * }, ["C4", ["E4", "D4", "E4"], "G4", ["A4", "G4"]]).start(0);
 * Transport.start();
 * @category Event
 */
var Sequence = /** @class */ (function (_super) {
    tslib_1.__extends(Sequence, _super);
    function Sequence() {
        var _this = _super.call(this, optionsFromArguments(Sequence.getDefaults(), arguments, ["callback", "events", "subdivision"])) || this;
        _this.name = "Sequence";
        /**
         * The object responsible for scheduling all of the events
         */
        _this._part = new Part({
            callback: _this._seqCallback.bind(_this),
            context: _this.context,
        });
        /**
         * private reference to all of the sequence proxies
         */
        _this._events = [];
        /**
         * The proxied array
         */
        _this._eventsArray = [];
        var options = optionsFromArguments(Sequence.getDefaults(), arguments, ["callback", "events", "subdivision"]);
        _this._subdivision = _this.toTicks(options.subdivision);
        _this.events = options.events;
        // set all of the values
        _this.loop = options.loop;
        _this.loopStart = options.loopStart;
        _this.loopEnd = options.loopEnd;
        _this.playbackRate = options.playbackRate;
        _this.probability = options.probability;
        _this.humanize = options.humanize;
        _this.mute = options.mute;
        _this.playbackRate = options.playbackRate;
        return _this;
    }
    Sequence.getDefaults = function () {
        return Object.assign(omitFromObject(ToneEvent.getDefaults(), ["value"]), {
            events: [],
            loop: true,
            loopEnd: 0,
            loopStart: 0,
            subdivision: "8n",
        });
    };
    /**
     * The internal callback for when an event is invoked
     */
    Sequence.prototype._seqCallback = function (time, value) {
        if (value !== null) {
            this.callback(time, value);
        }
    };
    Object.defineProperty(Sequence.prototype, "events", {
        /**
         * The sequence
         */
        get: function () {
            return this._events;
        },
        set: function (s) {
            this.clear();
            this._eventsArray = s;
            this._events = this._createSequence(this._eventsArray);
            this._eventsUpdated();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the part at the given time.
     * @param  time    When to start the part.
     * @param  offset  The offset index to start at
     */
    Sequence.prototype.start = function (time, offset) {
        this._part.start(time, offset ? this._indexTime(offset) : offset);
        return this;
    };
    /**
     * Stop the part at the given time.
     * @param  time  When to stop the part.
     */
    Sequence.prototype.stop = function (time) {
        this._part.stop(time);
        return this;
    };
    Object.defineProperty(Sequence.prototype, "subdivision", {
        /**
         * The subdivision of the sequence. This can only be
         * set in the constructor. The subdivision is the
         * interval between successive steps.
         */
        get: function () {
            return new TicksClass(this.context, this._subdivision).toSeconds();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create a sequence proxy which can be monitored to create subsequences
     */
    Sequence.prototype._createSequence = function (array) {
        var _this = this;
        return new Proxy(array, {
            get: function (target, property) {
                // property is index in this case
                return target[property];
            },
            set: function (target, property, value) {
                if (isString(property) && isFinite(parseInt(property, 10))) {
                    if (isArray(value)) {
                        target[property] = _this._createSequence(value);
                    }
                    else {
                        target[property] = value;
                    }
                }
                else {
                    target[property] = value;
                }
                _this._eventsUpdated();
                // return true to accept the changes
                return true;
            },
        });
    };
    /**
     * When the sequence has changed, all of the events need to be recreated
     */
    Sequence.prototype._eventsUpdated = function () {
        this._part.clear();
        this._rescheduleSequence(this._eventsArray, this._subdivision, this.startOffset);
        // update the loopEnd
        this.loopEnd = this.loopEnd;
    };
    /**
     * reschedule all of the events that need to be rescheduled
     */
    Sequence.prototype._rescheduleSequence = function (sequence, subdivision, startOffset) {
        var _this = this;
        sequence.forEach(function (value, index) {
            var eventOffset = index * (subdivision) + startOffset;
            if (isArray(value)) {
                _this._rescheduleSequence(value, subdivision / value.length, eventOffset);
            }
            else {
                var startTime = new TicksClass(_this.context, eventOffset, "i").toSeconds();
                _this._part.add(startTime, value);
            }
        });
    };
    /**
     * Get the time of the index given the Sequence's subdivision
     * @param  index
     * @return The time of that index
     */
    Sequence.prototype._indexTime = function (index) {
        return new TicksClass(this.context, index * (this._subdivision) + this.startOffset).toSeconds();
    };
    /**
     * Clear all of the events
     */
    Sequence.prototype.clear = function () {
        this._part.clear();
        return this;
    };
    Sequence.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._part.dispose();
        return this;
    };
    Object.defineProperty(Sequence.prototype, "loop", {
        //-------------------------------------
        // PROXY CALLS
        //-------------------------------------
        get: function () {
            return this._part.loop;
        },
        set: function (l) {
            this._part.loop = l;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "loopStart", {
        /**
         * The index at which the sequence should start looping
         */
        get: function () {
            return this._loopStart;
        },
        set: function (index) {
            this._loopStart = index;
            this._part.loopStart = this._indexTime(index);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "loopEnd", {
        /**
         * The index at which the sequence should end looping
         */
        get: function () {
            return this._loopEnd;
        },
        set: function (index) {
            this._loopEnd = index;
            if (index === 0) {
                this._part.loopEnd = this._indexTime(this._eventsArray.length);
            }
            else {
                this._part.loopEnd = this._indexTime(index);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "startOffset", {
        get: function () {
            return this._part.startOffset;
        },
        set: function (start) {
            this._part.startOffset = start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "playbackRate", {
        get: function () {
            return this._part.playbackRate;
        },
        set: function (rate) {
            this._part.playbackRate = rate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "probability", {
        get: function () {
            return this._part.probability;
        },
        set: function (prob) {
            this._part.probability = prob;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "progress", {
        get: function () {
            return this._part.progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "humanize", {
        get: function () {
            return this._part.humanize;
        },
        set: function (variation) {
            this._part.humanize = variation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sequence.prototype, "length", {
        /**
         * The number of scheduled events
         */
        get: function () {
            return this._part.length;
        },
        enumerable: true,
        configurable: true
    });
    return Sequence;
}(ToneEvent));
export { Sequence };
//# sourceMappingURL=Sequence.js.map
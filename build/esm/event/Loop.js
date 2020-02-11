import * as tslib_1 from "tslib";
import { ToneEvent } from "./ToneEvent";
import { ToneWithContext } from "../core/context/ToneWithContext";
import { optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
/**
 * Loop creates a looped callback at the
 * specified interval. The callback can be
 * started, stopped and scheduled along
 * the Transport's timeline.
 * @example
 * import { Loop, Transport } from "tone";
 * const loop = new Loop((time) => {
 * 	// triggered every eighth note.
 * 	console.log(time);
 * }, "8n").start(0);
 * Transport.start();
 * @category Event
 */
var Loop = /** @class */ (function (_super) {
    tslib_1.__extends(Loop, _super);
    function Loop() {
        var _this = _super.call(this, optionsFromArguments(Loop.getDefaults(), arguments, ["callback", "interval"])) || this;
        _this.name = "Loop";
        var options = optionsFromArguments(Loop.getDefaults(), arguments, ["callback", "interval"]);
        _this._event = new ToneEvent({
            context: _this.context,
            callback: _this._tick.bind(_this),
            loop: true,
            loopEnd: options.interval,
            playbackRate: options.playbackRate,
            probability: options.probability
        });
        _this.callback = options.callback;
        // set the iterations
        _this.iterations = options.iterations;
        return _this;
    }
    Loop.getDefaults = function () {
        return Object.assign(ToneWithContext.getDefaults(), {
            interval: "4n",
            callback: noOp,
            playbackRate: 1,
            iterations: Infinity,
            probability: 1,
            mute: false,
            humanize: false
        });
    };
    /**
     * Start the loop at the specified time along the Transport's timeline.
     * @param  time  When to start the Loop.
     */
    Loop.prototype.start = function (time) {
        this._event.start(time);
        return this;
    };
    /**
     * Stop the loop at the given time.
     * @param  time  When to stop the Loop.
     */
    Loop.prototype.stop = function (time) {
        this._event.stop(time);
        return this;
    };
    /**
     * Cancel all scheduled events greater than or equal to the given time
     * @param  time  The time after which events will be cancel.
     */
    Loop.prototype.cancel = function (time) {
        this._event.cancel(time);
        return this;
    };
    /**
     * Internal function called when the notes should be called
     * @param time  The time the event occurs
     */
    Loop.prototype._tick = function (time) {
        this.callback(time);
    };
    Object.defineProperty(Loop.prototype, "state", {
        /**
         * The state of the Loop, either started or stopped.
         */
        get: function () {
            return this._event.state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "progress", {
        /**
         * The progress of the loop as a value between 0-1. 0, when the loop is stopped or done iterating.
         */
        get: function () {
            return this._event.progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "interval", {
        /**
         * The time between successive callbacks.
         * @example
         * import { Loop, Transport } from "tone";
         * const loop = new Loop();
         * loop.interval = "8n"; // loop every 8n
         */
        get: function () {
            return this._event.loopEnd;
        },
        set: function (interval) {
            this._event.loopEnd = interval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "playbackRate", {
        /**
         * The playback rate of the loop. The normal playback rate is 1 (no change).
         * A `playbackRate` of 2 would be twice as fast.
         */
        get: function () {
            return this._event.playbackRate;
        },
        set: function (rate) {
            this._event.playbackRate = rate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "humanize", {
        /**
         * Random variation +/-0.01s to the scheduled time.
         * Or give it a time value which it will randomize by.
         */
        get: function () {
            return this._event.humanize;
        },
        set: function (variation) {
            this._event.humanize = variation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "probability", {
        /**
         * The probably of the callback being invoked.
         */
        get: function () {
            return this._event.probability;
        },
        set: function (prob) {
            this._event.probability = prob;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "mute", {
        /**
         * Muting the Loop means that no callbacks are invoked.
         */
        get: function () {
            return this._event.mute;
        },
        set: function (mute) {
            this._event.mute = mute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Loop.prototype, "iterations", {
        /**
         * The number of iterations of the loop. The default value is `Infinity` (loop forever).
         */
        get: function () {
            if (this._event.loop === true) {
                return Infinity;
            }
            else {
                return this._event.loop;
            }
        },
        set: function (iters) {
            if (iters === Infinity) {
                this._event.loop = true;
            }
            else {
                this._event.loop = iters;
            }
        },
        enumerable: true,
        configurable: true
    });
    Loop.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._event.dispose();
        return this;
    };
    return Loop;
}(ToneWithContext));
export { Loop };
//# sourceMappingURL=Loop.js.map
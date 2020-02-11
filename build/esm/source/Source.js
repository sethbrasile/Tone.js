import * as tslib_1 from "tslib";
import { Volume } from "../component/channel/Volume";
import "../core/context/Destination";
import "../core/clock/Transport";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { defaultArg } from "../core/util/Defaults";
import { noOp, readOnly } from "../core/util/Interface";
import { StateTimeline } from "../core/util/StateTimeline";
import { isDefined, isUndef } from "../core/util/TypeCheck";
import { assert, assertContextRunning } from "../core/util/Debug";
import { GT } from "../core/util/Math";
/**
 * Base class for sources.
 * start/stop of this.context.transport.
 *
 * ```
 * // Multiple state change events can be chained together,
 * // but must be set in the correct order and with ascending times
 * // OK
 * state.start().stop("+0.2");
 * // OK
 * state.start().stop("+0.2").start("+0.4").stop("+0.7")
 * // BAD
 * state.stop("+0.2").start();
 * // BAD
 * state.start("+0.3").stop("+0.2");
 * ```
 */
var Source = /** @class */ (function (_super) {
    tslib_1.__extends(Source, _super);
    function Source(options) {
        var _this = _super.call(this, options) || this;
        /**
         * Sources have no inputs
         */
        _this.input = undefined;
        /**
         * Keep track of the scheduled state.
         */
        _this._state = new StateTimeline("stopped");
        /**
         * The synced `start` callback function from the transport
         */
        _this._synced = false;
        /**
         * Keep track of all of the scheduled event ids
         */
        _this._scheduled = [];
        /**
         * Placeholder functions for syncing/unsyncing to transport
         */
        _this._syncedStart = noOp;
        _this._syncedStop = noOp;
        _this._state.memory = 100;
        _this._state.increasing = true;
        _this._volume = _this.output = new Volume({
            context: _this.context,
            mute: options.mute,
            volume: options.volume,
        });
        _this.volume = _this._volume.volume;
        readOnly(_this, "volume");
        _this.onstop = options.onstop;
        return _this;
    }
    Source.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            onstop: noOp,
            volume: 0,
        });
    };
    Object.defineProperty(Source.prototype, "state", {
        /**
         * Returns the playback state of the source, either "started" or "stopped".
         * @example
         * import { Player } from "tone";
         * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3", () => {
         * 	player.start();
         * 	console.log(player.state);
         * }).toDestination();
         */
        get: function () {
            if (this._synced) {
                if (this.context.transport.state === "started") {
                    return this._state.getValueAtTime(this.context.transport.seconds);
                }
                else {
                    return "stopped";
                }
            }
            else {
                return this._state.getValueAtTime(this.now());
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Source.prototype, "mute", {
        /**
         * Mute the output.
         * @example
         * import { Oscillator } from "tone";
         * const osc = new Oscillator().toDestination().start();
         * // mute the output
         * osc.mute = true;
         */
        get: function () {
            return this._volume.mute;
        },
        set: function (mute) {
            this._volume.mute = mute;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Ensure that the scheduled time is not before the current time.
     * Should only be used when scheduled unsynced.
     */
    Source.prototype._clampToCurrentTime = function (time) {
        if (this._synced) {
            return time;
        }
        else {
            return Math.max(time, this.context.currentTime);
        }
    };
    /**
     * Start the source at the specified time. If no time is given,
     * start the source now.
     * @param  time When the source should be started.
     * @example
     * import { Oscillator } from "tone";
     * const source = new Oscillator().toDestination();
     * source.start("+0.5"); // starts the source 0.5 seconds from now
     */
    Source.prototype.start = function (time, offset, duration) {
        var _this = this;
        var computedTime = isUndef(time) && this._synced ? this.context.transport.seconds : this.toSeconds(time);
        computedTime = this._clampToCurrentTime(computedTime);
        // if it's started, stop it and restart it
        if (this._state.getValueAtTime(computedTime) === "started") {
            // time should be strictly greater than the previous start time
            assert(GT(computedTime, this._state.get(computedTime).time), "Start time must be strictly greater than previous start time");
            this._state.cancel(computedTime);
            this._state.setStateAtTime("started", computedTime);
            this.log("restart", computedTime);
            this.restart(computedTime, offset, duration);
        }
        else {
            this.log("start", computedTime);
            this._state.setStateAtTime("started", computedTime);
            if (this._synced) {
                // add the offset time to the event
                var event_1 = this._state.get(computedTime);
                if (event_1) {
                    event_1.offset = this.toSeconds(defaultArg(offset, 0));
                    event_1.duration = duration ? this.toSeconds(duration) : undefined;
                }
                var sched = this.context.transport.schedule(function (t) {
                    _this._start(t, offset, duration);
                }, computedTime);
                this._scheduled.push(sched);
                // if it's already started
                if (this.context.transport.state === "started") {
                    this._syncedStart(this.now(), this.context.transport.seconds);
                }
            }
            else {
                this._start(computedTime, offset, duration);
            }
            assertContextRunning(this.context);
        }
        return this;
    };
    /**
     * Stop the source at the specified time. If no time is given,
     * stop the source now.
     * @param  time When the source should be stopped.
     * @example
     * import { Oscillator } from "tone";
     * const source = new Oscillator().toDestination();
     * source.start();
     * source.stop("+0.5"); // stops the source 0.5 seconds from now
     */
    Source.prototype.stop = function (time) {
        var computedTime = isUndef(time) && this._synced ? this.context.transport.seconds : this.toSeconds(time);
        computedTime = this._clampToCurrentTime(computedTime);
        if (this._state.getValueAtTime(computedTime) === "started" || isDefined(this._state.getNextState("started", computedTime))) {
            this.log("stop", computedTime);
            if (!this._synced) {
                this._stop(computedTime);
            }
            else {
                var sched = this.context.transport.schedule(this._stop.bind(this), computedTime);
                this._scheduled.push(sched);
            }
            this._state.cancel(computedTime);
            this._state.setStateAtTime("stopped", computedTime);
        }
        return this;
    };
    /**
     * Restart the source.
     */
    Source.prototype.restart = function (time, offset, duration) {
        time = this.toSeconds(time);
        if (this._state.getValueAtTime(time) === "started") {
            this._state.cancel(time);
            this._restart(time, offset, duration);
        }
        return this;
    };
    /**
     * Sync the source to the Transport so that all subsequent
     * calls to `start` and `stop` are synced to the TransportTime
     * instead of the AudioContext time.
     *
     * @example
     * import { Oscillator, Transport } from "tone";
     * const osc = new Oscillator().toDestination();
     * // sync the source so that it plays between 0 and 0.3 on the Transport's timeline
     * osc.sync().start(0).stop(0.3);
     * // start the transport.
     * Transport.start();
     * // set it to loop once a second
     * Transport.loop = true;
     * Transport.loopEnd = 1;
     */
    Source.prototype.sync = function () {
        var _this = this;
        if (!this._synced) {
            this._synced = true;
            this._syncedStart = function (time, offset) {
                if (offset > 0) {
                    // get the playback state at that time
                    var stateEvent = _this._state.get(offset);
                    // listen for start events which may occur in the middle of the sync'ed time
                    if (stateEvent && stateEvent.state === "started" && stateEvent.time !== offset) {
                        // get the offset
                        var startOffset = offset - _this.toSeconds(stateEvent.time);
                        var duration = void 0;
                        if (stateEvent.duration) {
                            duration = _this.toSeconds(stateEvent.duration) - startOffset;
                        }
                        _this._start(time, _this.toSeconds(stateEvent.offset) + startOffset, duration);
                    }
                }
            };
            this._syncedStop = function (time) {
                var seconds = _this.context.transport.getSecondsAtTime(Math.max(time - _this.sampleTime, 0));
                if (_this._state.getValueAtTime(seconds) === "started") {
                    _this._stop(time);
                }
            };
            this.context.transport.on("start", this._syncedStart);
            this.context.transport.on("loopStart", this._syncedStart);
            this.context.transport.on("stop", this._syncedStop);
            this.context.transport.on("pause", this._syncedStop);
            this.context.transport.on("loopEnd", this._syncedStop);
        }
        return this;
    };
    /**
     * Unsync the source to the Transport. See Source.sync
     */
    Source.prototype.unsync = function () {
        var _this = this;
        if (this._synced) {
            this.context.transport.off("stop", this._syncedStop);
            this.context.transport.off("pause", this._syncedStop);
            this.context.transport.off("loopEnd", this._syncedStop);
            this.context.transport.off("start", this._syncedStart);
            this.context.transport.off("loopStart", this._syncedStart);
        }
        this._synced = false;
        // clear all of the scheduled ids
        this._scheduled.forEach(function (id) { return _this.context.transport.clear(id); });
        this._scheduled = [];
        this._state.cancel(0);
        return this;
    };
    /**
     * Clean up.
     */
    Source.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.onstop = noOp;
        this.unsync();
        this._volume.dispose();
        this._state.dispose();
        return this;
    };
    return Source;
}(ToneAudioNode));
export { Source };
//# sourceMappingURL=Source.js.map
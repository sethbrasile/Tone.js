import * as tslib_1 from "tslib";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { defaultArg, optionsFromArguments } from "../../core/util/Defaults";
import { noOp } from "../../core/util/Interface";
import { isUndef } from "../../core/util/TypeCheck";
import { Source } from "../Source";
import { ToneBufferSource } from "./ToneBufferSource";
import { assertRange } from "../../core/util/Debug";
import { timeRange } from "../../core/util/Decorator";
/**
 * Player is an audio file player with start, loop, and stop functions.
 * @example
 * import { Player } from "tone";
 * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3").toDestination();
 * // play as soon as the buffer is loaded
 * player.autostart = true;
 * @category Source
 */
var Player = /** @class */ (function (_super) {
    tslib_1.__extends(Player, _super);
    function Player() {
        var _this = _super.call(this, optionsFromArguments(Player.getDefaults(), arguments, ["url", "onload"])) || this;
        _this.name = "Player";
        /**
         * All of the active buffer source nodes
         */
        _this._activeSources = new Set();
        var options = optionsFromArguments(Player.getDefaults(), arguments, ["url", "onload"]);
        _this._buffer = new ToneAudioBuffer({
            onload: _this._onload.bind(_this, options.onload),
            onerror: options.onerror,
            reverse: options.reverse,
            url: options.url,
        });
        _this.autostart = options.autostart;
        _this._loop = options.loop;
        _this._loopStart = options.loopStart;
        _this._loopEnd = options.loopEnd;
        _this._playbackRate = options.playbackRate;
        _this.fadeIn = options.fadeIn;
        _this.fadeOut = options.fadeOut;
        return _this;
    }
    Player.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            autostart: false,
            fadeIn: 0,
            fadeOut: 0,
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            onload: noOp,
            onerror: noOp,
            playbackRate: 1,
            reverse: false,
        });
    };
    /**
     * Load the audio file as an audio buffer.
     * Decodes the audio asynchronously and invokes
     * the callback once the audio buffer loads.
     * Note: this does not need to be called if a url
     * was passed in to the constructor. Only use this
     * if you want to manually load a new url.
     * @param url The url of the buffer to load. Filetype support depends on the browser.
     */
    Player.prototype.load = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._buffer.load(url)];
                    case 1:
                        _a.sent();
                        this._onload();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Internal callback when the buffer is loaded.
     */
    Player.prototype._onload = function (callback) {
        if (callback === void 0) { callback = noOp; }
        callback();
        if (this.autostart) {
            this.start();
        }
    };
    /**
     * Internal callback when the buffer is done playing.
     */
    Player.prototype._onSourceEnd = function (source) {
        // invoke the onstop function
        this.onstop(this);
        // delete the source from the active sources
        this._activeSources.delete(source);
        if (this._activeSources.size === 0 && !this._synced &&
            this._state.getValueAtTime(this.now()) === "started") {
            this._state.setStateAtTime("stopped", this.now());
        }
    };
    /**
     * Play the buffer at the given startTime. Optionally add an offset
     * and/or duration which will play the buffer from a position
     * within the buffer for the given duration.
     *
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
     */
    Player.prototype.start = function (time, offset, duration) {
        _super.prototype.start.call(this, time, offset, duration);
        return this;
    };
    /**
     * Internal start method
     */
    Player.prototype._start = function (startTime, offset, duration) {
        // if it's a loop the default offset is the loopStart point
        if (this._loop) {
            offset = defaultArg(offset, this._loopStart);
        }
        else {
            // otherwise the default offset is 0
            offset = defaultArg(offset, 0);
        }
        // compute the values in seconds
        var computedOffset = this.toSeconds(offset);
        // if it's synced, it should factor in the playback rate for computing the offset
        if (this._synced) {
            computedOffset *= this._playbackRate;
        }
        // compute the duration which is either the passed in duration of the buffer.duration - offset
        var origDuration = duration;
        duration = defaultArg(duration, Math.max(this._buffer.duration - computedOffset, 0));
        var computedDuration = this.toSeconds(duration);
        // scale it by the playback rate
        computedDuration = computedDuration / this._playbackRate;
        // get the start time
        startTime = this.toSeconds(startTime);
        // make the source
        var source = new ToneBufferSource({
            url: this._buffer,
            context: this.context,
            fadeIn: this.fadeIn,
            fadeOut: this.fadeOut,
            loop: this._loop,
            loopEnd: this._loopEnd,
            loopStart: this._loopStart,
            onended: this._onSourceEnd.bind(this),
            playbackRate: this._playbackRate,
        }).connect(this.output);
        // set the looping properties
        if (!this._loop && !this._synced) {
            // cancel the previous stop
            this._state.cancel(startTime + computedDuration);
            // if it's not looping, set the state change at the end of the sample
            this._state.setStateAtTime("stopped", startTime + computedDuration, {
                implicitEnd: true,
            });
        }
        // add it to the array of active sources
        this._activeSources.add(source);
        // start it
        if (this._loop && isUndef(origDuration)) {
            source.start(startTime, computedOffset);
        }
        else {
            // subtract the fade out time
            source.start(startTime, computedOffset, computedDuration - this.toSeconds(this.fadeOut));
        }
    };
    /**
     * Stop playback.
     */
    Player.prototype._stop = function (time) {
        var computedTime = this.toSeconds(time);
        this._activeSources.forEach(function (source) { return source.stop(computedTime); });
    };
    /**
     * Stop and then restart the player from the beginning (or offset)
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given,
     * 					it will default to the full length of the sample (minus any offset)
     */
    Player.prototype.restart = function (time, offset, duration) {
        _super.prototype.restart.call(this, time, offset, duration);
        return this;
    };
    Player.prototype._restart = function (time, offset, duration) {
        this._stop(time);
        this._start(time, offset, duration);
    };
    /**
     * Seek to a specific time in the player's buffer. If the
     * source is no longer playing at that time, it will stop.
     * @param offset The time to seek to.
     * @param when The time for the seek event to occur.
     * @example
     * import { Player } from "tone";
     * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3", () => {
     * 	player.start();
     * 	// seek to the offset in 1 second from now
     * 	player.seek(0.4, "+1");
     * }).toDestination();
     */
    Player.prototype.seek = function (offset, when) {
        var computedTime = this.toSeconds(when);
        if (this._state.getValueAtTime(computedTime) === "started") {
            var computedOffset = this.toSeconds(offset);
            // if it's currently playing, stop it
            this._stop(computedTime);
            // restart it at the given time
            this._start(computedTime, computedOffset);
        }
        return this;
    };
    /**
     * Set the loop start and end. Will only loop if loop is set to true.
     * @param loopStart The loop start time
     * @param loopEnd The loop end time
     * @example
     * import { Player } from "tone";
     * const player = new Player("https://tonejs.github.io/examples/audio/FWDL.mp3").toDestination();
     * // loop between the given points
     * player.setLoopPoints(0.2, 0.3);
     * player.loop = true;
     * player.autostart = true;
     */
    Player.prototype.setLoopPoints = function (loopStart, loopEnd) {
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        return this;
    };
    Object.defineProperty(Player.prototype, "loopStart", {
        /**
         * If loop is true, the loop will start at this position.
         */
        get: function () {
            return this._loopStart;
        },
        set: function (loopStart) {
            this._loopStart = loopStart;
            if (this.buffer.loaded) {
                assertRange(this.toSeconds(loopStart), 0, this.buffer.duration);
            }
            // get the current source
            this._activeSources.forEach(function (source) {
                source.loopStart = loopStart;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "loopEnd", {
        /**
         * If loop is true, the loop will end at this position.
         */
        get: function () {
            return this._loopEnd;
        },
        set: function (loopEnd) {
            this._loopEnd = loopEnd;
            if (this.buffer.loaded) {
                assertRange(this.toSeconds(loopEnd), 0, this.buffer.duration);
            }
            // get the current source
            this._activeSources.forEach(function (source) {
                source.loopEnd = loopEnd;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "buffer", {
        /**
         * The audio buffer belonging to the player.
         */
        get: function () {
            return this._buffer;
        },
        set: function (buffer) {
            this._buffer.set(buffer);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "loop", {
        /**
         * If the buffer should loop once it's over.
         */
        get: function () {
            return this._loop;
        },
        set: function (loop) {
            // if no change, do nothing
            if (this._loop === loop) {
                return;
            }
            this._loop = loop;
            // set the loop of all of the sources
            this._activeSources.forEach(function (source) {
                source.loop = loop;
            });
            if (loop) {
                // remove the next stopEvent
                var stopEvent = this._state.getNextState("stopped", this.now());
                if (stopEvent) {
                    this._state.cancel(stopEvent.time);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "playbackRate", {
        /**
         * The playback speed. 1 is normal speed. This is not a signal because
         * Safari and iOS currently don't support playbackRate as a signal.
         */
        get: function () {
            return this._playbackRate;
        },
        set: function (rate) {
            this._playbackRate = rate;
            var now = this.now();
            // cancel the stop event since it's at a different time now
            var stopEvent = this._state.getNextState("stopped", now);
            if (stopEvent && stopEvent.implicitEnd) {
                this._state.cancel(stopEvent.time);
                this._activeSources.forEach(function (source) { return source.cancelStop(); });
            }
            // set all the sources
            this._activeSources.forEach(function (source) {
                source.playbackRate.setValueAtTime(rate, now);
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "reverse", {
        /**
         * The direction the buffer should play in
         */
        get: function () {
            return this._buffer.reverse;
        },
        set: function (rev) {
            this._buffer.reverse = rev;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "loaded", {
        /**
         * If the buffer is loaded
         */
        get: function () {
            return this._buffer.loaded;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        // disconnect all of the players
        this._activeSources.forEach(function (source) { return source.dispose(); });
        this._activeSources.clear();
        this._buffer.dispose();
        return this;
    };
    tslib_1.__decorate([
        timeRange(0)
    ], Player.prototype, "fadeIn", void 0);
    tslib_1.__decorate([
        timeRange(0)
    ], Player.prototype, "fadeOut", void 0);
    return Player;
}(Source));
export { Player };
//# sourceMappingURL=Player.js.map
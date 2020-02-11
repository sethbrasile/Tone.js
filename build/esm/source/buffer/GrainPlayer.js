import * as tslib_1 from "tslib";
import { Source } from "../Source";
import { noOp } from "../../core/util/Interface";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { defaultArg, optionsFromArguments } from "../../core/util/Defaults";
import { Clock } from "../../core/clock/Clock";
import { ToneBufferSource } from "./ToneBufferSource";
import { intervalToFrequencyRatio } from "../../core/type/Conversions";
import { assertRange } from "../../core/util/Debug";
/**
 * GrainPlayer implements [granular synthesis](https://en.wikipedia.org/wiki/Granular_synthesis).
 * Granular Synthesis enables you to adjust pitch and playback rate independently. The grainSize is the
 * amount of time each small chunk of audio is played for and the overlap is the
 * amount of crossfading transition time between successive grains.
 * @category Source
 */
var GrainPlayer = /** @class */ (function (_super) {
    tslib_1.__extends(GrainPlayer, _super);
    function GrainPlayer() {
        var _this = _super.call(this, optionsFromArguments(GrainPlayer.getDefaults(), arguments, ["url", "onload"])) || this;
        _this.name = "GrainPlayer";
        /**
         * Internal loopStart value
         */
        _this._loopStart = 0;
        /**
         * Internal loopStart value
         */
        _this._loopEnd = 0;
        /**
         * All of the currently playing BufferSources
         */
        _this._activeSources = [];
        var options = optionsFromArguments(GrainPlayer.getDefaults(), arguments, ["url", "onload"]);
        _this.buffer = new ToneAudioBuffer({
            onload: options.onload,
            onerror: options.onerror,
            reverse: options.reverse,
            url: options.url,
        });
        _this._clock = new Clock({
            context: _this.context,
            callback: _this._tick.bind(_this),
            frequency: 1 / options.grainSize
        });
        _this._playbackRate = options.playbackRate;
        _this._grainSize = options.grainSize;
        _this._overlap = options.overlap;
        _this.detune = options.detune;
        // setup
        _this.overlap = options.overlap;
        _this.loop = options.loop;
        _this.playbackRate = options.playbackRate;
        _this.grainSize = options.grainSize;
        _this.loopStart = options.loopStart;
        _this.loopEnd = options.loopEnd;
        _this.reverse = options.reverse;
        _this._clock.on("stop", _this._onstop.bind(_this));
        return _this;
    }
    GrainPlayer.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            onload: noOp,
            onerror: noOp,
            overlap: 0.1,
            grainSize: 0.2,
            playbackRate: 1,
            detune: 0,
            loop: false,
            loopStart: 0,
            loopEnd: 0,
            reverse: false
        });
    };
    /**
     * Internal start method
     */
    GrainPlayer.prototype._start = function (time, offset, duration) {
        offset = defaultArg(offset, 0);
        offset = this.toSeconds(offset);
        time = this.toSeconds(time);
        var grainSize = 1 / this._clock.frequency.getValueAtTime(time);
        this._clock.start(time, offset / grainSize);
        if (duration) {
            this.stop(time + this.toSeconds(duration));
        }
    };
    /**
     * Stop and then restart the player from the beginning (or offset)
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given,
     * 					it will default to the full length of the sample (minus any offset)
     */
    GrainPlayer.prototype.restart = function (time, offset, duration) {
        _super.prototype.restart.call(this, time, offset, duration);
        return this;
    };
    GrainPlayer.prototype._restart = function (time, offset, duration) {
        this._stop(time);
        this._start(time, offset, duration);
    };
    /**
     * Internal stop method
     */
    GrainPlayer.prototype._stop = function (time) {
        this._clock.stop(time);
    };
    /**
     * Invoked when the clock is stopped
     */
    GrainPlayer.prototype._onstop = function (time) {
        // stop the players
        this._activeSources.forEach(function (source) {
            source.fadeOut = 0;
            source.stop(time);
        });
        this.onstop(this);
    };
    /**
     * Invoked on each clock tick. scheduled a new grain at this time.
     */
    GrainPlayer.prototype._tick = function (time) {
        var _this = this;
        // check if it should stop looping
        var ticks = this._clock.getTicksAtTime(time);
        var grainSize = 1 / this._clock.frequency.getValueAtTime(time);
        var offset = ticks * grainSize;
        this.log("offset", offset);
        if (!this.loop && offset > this.buffer.duration) {
            this.stop(time);
            return;
        }
        // at the beginning of the file, the fade in should be 0
        var fadeIn = offset < this._overlap ? 0 : this._overlap;
        // create a buffer source
        var source = new ToneBufferSource({
            context: this.context,
            url: this.buffer,
            fadeIn: fadeIn,
            fadeOut: this._overlap,
            loop: this.loop,
            loopStart: this._loopStart,
            loopEnd: this._loopEnd,
            // compute the playbackRate based on the detune
            playbackRate: intervalToFrequencyRatio(this.detune / 100)
        }).connect(this.output);
        source.start(time, this._grainSize * ticks);
        source.stop(time + this._grainSize / this.playbackRate);
        // add it to the active sources
        this._activeSources.push(source);
        // remove it when it's done
        source.onended = function () {
            var index = _this._activeSources.indexOf(source);
            if (index !== -1) {
                _this._activeSources.splice(index, 1);
            }
        };
    };
    Object.defineProperty(GrainPlayer.prototype, "playbackRate", {
        /**
         * The playback rate of the sample
         */
        get: function () {
            return this._playbackRate;
        },
        set: function (rate) {
            assertRange(rate, 0.001);
            this._playbackRate = rate;
            this.grainSize = this._grainSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GrainPlayer.prototype, "loopStart", {
        /**
         * The loop start time.
         */
        get: function () {
            return this._loopStart;
        },
        set: function (time) {
            if (this.buffer.loaded) {
                assertRange(this.toSeconds(time), 0, this.buffer.duration);
            }
            this._loopStart = this.toSeconds(time);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GrainPlayer.prototype, "loopEnd", {
        /**
         * The loop end time.
         */
        get: function () {
            return this._loopEnd;
        },
        set: function (time) {
            if (this.buffer.loaded) {
                assertRange(this.toSeconds(time), 0, this.buffer.duration);
            }
            this._loopEnd = this.toSeconds(time);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GrainPlayer.prototype, "reverse", {
        /**
         * The direction the buffer should play in
         */
        get: function () {
            return this.buffer.reverse;
        },
        set: function (rev) {
            this.buffer.reverse = rev;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GrainPlayer.prototype, "grainSize", {
        /**
         * The size of each chunk of audio that the
         * buffer is chopped into and played back at.
         */
        get: function () {
            return this._grainSize;
        },
        set: function (size) {
            this._grainSize = this.toSeconds(size);
            this._clock.frequency.setValueAtTime(this._playbackRate / this._grainSize, this.now());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GrainPlayer.prototype, "overlap", {
        /**
         * The duration of the cross-fade between successive grains.
         */
        get: function () {
            return this._overlap;
        },
        set: function (time) {
            this._overlap = this.toSeconds(time);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GrainPlayer.prototype, "loaded", {
        /**
         * If all the buffer is loaded
         */
        get: function () {
            return this.buffer.loaded;
        },
        enumerable: true,
        configurable: true
    });
    GrainPlayer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.buffer.dispose();
        this._clock.dispose();
        this._activeSources.forEach(function (source) { return source.dispose(); });
        return this;
    };
    return GrainPlayer;
}(Source));
export { GrainPlayer };
//# sourceMappingURL=GrainPlayer.js.map
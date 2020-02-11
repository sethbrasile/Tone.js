import * as tslib_1 from "tslib";
import { connect } from "../../core/context/ToneAudioNode";
import { Param } from "../../core/context/Param";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { defaultArg, optionsFromArguments } from "../../core/util/Defaults";
import { noOp } from "../../core/util/Interface";
import { isDefined } from "../../core/util/TypeCheck";
import { assert } from "../../core/util/Debug";
import { OneShotSource } from "../OneShotSource";
import { EQ, GTE, LT } from "../../core/util/Math";
/**
 * Wrapper around the native BufferSourceNode.
 * @category Source
 */
var ToneBufferSource = /** @class */ (function (_super) {
    tslib_1.__extends(ToneBufferSource, _super);
    function ToneBufferSource() {
        var _this = _super.call(this, optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["url", "onload"])) || this;
        _this.name = "ToneBufferSource";
        /**
         * The oscillator
         */
        _this._source = _this.context.createBufferSource();
        _this._internalChannels = [_this._source];
        /**
         * indicators if the source has started/stopped
         */
        _this._sourceStarted = false;
        _this._sourceStopped = false;
        var options = optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["url", "onload"]);
        connect(_this._source, _this._gainNode);
        _this._source.onended = function () { return _this._stopSource(); };
        /**
         * The playbackRate of the buffer
         */
        _this.playbackRate = new Param({
            context: _this.context,
            param: _this._source.playbackRate,
            units: "positive",
            value: options.playbackRate,
        });
        // set some values initially
        _this.loop = options.loop;
        _this.loopStart = options.loopStart;
        _this.loopEnd = options.loopEnd;
        _this._buffer = new ToneAudioBuffer(options.url, options.onload, options.onerror);
        _this._internalChannels.push(_this._source);
        return _this;
    }
    ToneBufferSource.getDefaults = function () {
        return Object.assign(OneShotSource.getDefaults(), {
            url: new ToneAudioBuffer(),
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            onload: noOp,
            onerror: noOp,
            playbackRate: 1,
        });
    };
    Object.defineProperty(ToneBufferSource.prototype, "fadeIn", {
        /**
         * The fadeIn time of the amplitude envelope.
         */
        get: function () {
            return this._fadeIn;
        },
        set: function (t) {
            this._fadeIn = t;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneBufferSource.prototype, "fadeOut", {
        /**
         * The fadeOut time of the amplitude envelope.
         */
        get: function () {
            return this._fadeOut;
        },
        set: function (t) {
            this._fadeOut = t;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneBufferSource.prototype, "curve", {
        /**
         * The curve applied to the fades, either "linear" or "exponential"
         */
        get: function () {
            return this._curve;
        },
        set: function (t) {
            this._curve = t;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the buffer
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
     * @param  gain  The gain to play the buffer back at.
     */
    ToneBufferSource.prototype.start = function (time, offset, duration, gain) {
        if (gain === void 0) { gain = 1; }
        assert(this.buffer.loaded, "buffer is either not set or not loaded");
        var computedTime = this.toSeconds(time);
        // apply the gain envelope
        this._startGain(computedTime, gain);
        // if it's a loop the default offset is the loopstart point
        if (this.loop) {
            offset = defaultArg(offset, this.loopStart);
        }
        else {
            // otherwise the default offset is 0
            offset = defaultArg(offset, 0);
        }
        // make sure the offset is not less than 0
        var computedOffset = Math.max(this.toSeconds(offset), 0);
        // start the buffer source
        if (this.loop) {
            // modify the offset if it's greater than the loop time
            var loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
            var loopStart = this.toSeconds(this.loopStart);
            var loopDuration = loopEnd - loopStart;
            // move the offset back
            if (GTE(computedOffset, loopEnd)) {
                computedOffset = ((computedOffset - loopStart) % loopDuration) + loopStart;
            }
            // when the offset is very close to the duration, set it to 0
            if (EQ(computedOffset, this.buffer.duration)) {
                computedOffset = 0;
            }
        }
        // this.buffer.loaded would have return false if the AudioBuffer was undefined
        this._source.buffer = this.buffer.get();
        this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
        if (LT(computedOffset, this.buffer.duration)) {
            this._sourceStarted = true;
            this._source.start(computedTime, computedOffset);
        }
        // if a duration is given, schedule a stop
        if (isDefined(duration)) {
            var computedDur = this.toSeconds(duration);
            // make sure it's never negative
            computedDur = Math.max(computedDur, 0);
            this.stop(computedTime + computedDur);
        }
        return this;
    };
    ToneBufferSource.prototype._stopSource = function (time) {
        if (!this._sourceStopped && this._sourceStarted) {
            this._sourceStopped = true;
            this._source.stop(this.toSeconds(time));
            this._onended();
        }
    };
    Object.defineProperty(ToneBufferSource.prototype, "loopStart", {
        /**
         * If loop is true, the loop will start at this position.
         */
        get: function () {
            return this._source.loopStart;
        },
        set: function (loopStart) {
            this._source.loopStart = this.toSeconds(loopStart);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneBufferSource.prototype, "loopEnd", {
        /**
         * If loop is true, the loop will end at this position.
         */
        get: function () {
            return this._source.loopEnd;
        },
        set: function (loopEnd) {
            this._source.loopEnd = this.toSeconds(loopEnd);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneBufferSource.prototype, "buffer", {
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
    Object.defineProperty(ToneBufferSource.prototype, "loop", {
        /**
         * If the buffer should loop once it's over.
         */
        get: function () {
            return this._source.loop;
        },
        set: function (loop) {
            this._source.loop = loop;
            if (this._sourceStarted) {
                this.cancelStop();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up.
     */
    ToneBufferSource.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._source.onended = null;
        this._source.disconnect();
        this._buffer.dispose();
        this.playbackRate.dispose();
        return this;
    };
    return ToneBufferSource;
}(OneShotSource));
export { ToneBufferSource };
//# sourceMappingURL=ToneBufferSource.js.map
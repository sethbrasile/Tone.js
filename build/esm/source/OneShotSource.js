import * as tslib_1 from "tslib";
import { Gain } from "../core/context/Gain";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { noOp } from "../core/util/Interface";
import { assert } from "../core/util/Debug";
/**
 * Base class for fire-and-forget nodes
 */
var OneShotSource = /** @class */ (function (_super) {
    tslib_1.__extends(OneShotSource, _super);
    function OneShotSource(options) {
        var _this = _super.call(this, options) || this;
        /**
         * The callback to invoke after the
         * source is done playing.
         */
        _this.onended = noOp;
        /**
         * The start time
         */
        _this._startTime = -1;
        /**
         * The stop time
         */
        _this._stopTime = -1;
        /**
         * The id of the timeout
         */
        _this._timeout = -1;
        /**
         * The public output node
         */
        _this.output = new Gain({
            context: _this.context,
            gain: 0,
        });
        /**
         * The output gain node.
         */
        _this._gainNode = _this.output;
        /**
         * Get the playback state at the given time
         */
        _this.getStateAtTime = function (time) {
            var computedTime = this.toSeconds(time);
            if (this._startTime !== -1 && computedTime >= this._startTime &&
                (this._stopTime === -1 || computedTime <= this._stopTime)) {
                return "started";
            }
            else {
                return "stopped";
            }
        };
        _this._fadeIn = options.fadeIn;
        _this._fadeOut = options.fadeOut;
        _this._curve = options.curve;
        _this.onended = options.onended;
        return _this;
    }
    OneShotSource.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            curve: "linear",
            fadeIn: 0,
            fadeOut: 0,
            onended: noOp,
        });
    };
    /**
     * Start the source at the given time
     * @param  time When to start the source
     */
    OneShotSource.prototype._startGain = function (time, gain) {
        if (gain === void 0) { gain = 1; }
        assert(this._startTime === -1, "Source cannot be started more than once");
        // apply a fade in envelope
        var fadeInTime = this.toSeconds(this._fadeIn);
        // record the start time
        this._startTime = time + fadeInTime;
        this._startTime = Math.max(this._startTime, this.context.currentTime);
        // schedule the envelope
        if (fadeInTime > 0) {
            this._gainNode.gain.setValueAtTime(0, time);
            if (this._curve === "linear") {
                this._gainNode.gain.linearRampToValueAtTime(gain, time + fadeInTime);
            }
            else {
                this._gainNode.gain.exponentialApproachValueAtTime(gain, time, fadeInTime);
            }
        }
        else {
            this._gainNode.gain.setValueAtTime(gain, time);
        }
        return this;
    };
    /**
     * Stop the source node at the given time.
     * @param time When to stop the source
     */
    OneShotSource.prototype.stop = function (time) {
        this.log("stop", time);
        this._stopGain(this.toSeconds(time));
        return this;
    };
    /**
     * Stop the source at the given time
     * @param  time When to stop the source
     */
    OneShotSource.prototype._stopGain = function (time) {
        var _this = this;
        assert(this._startTime !== -1, "'start' must be called before 'stop'");
        // cancel the previous stop
        this.cancelStop();
        // the fadeOut time
        var fadeOutTime = this.toSeconds(this._fadeOut);
        // schedule the stop callback
        this._stopTime = this.toSeconds(time) + fadeOutTime;
        this._stopTime = Math.max(this._stopTime, this.context.currentTime);
        if (fadeOutTime > 0) {
            // start the fade out curve at the given time
            if (this._curve === "linear") {
                this._gainNode.gain.linearRampTo(0, fadeOutTime, time);
            }
            else {
                this._gainNode.gain.targetRampTo(0, fadeOutTime, time);
            }
        }
        else {
            // stop any ongoing ramps, and set the value to 0
            this._gainNode.gain.cancelAndHoldAtTime(time);
            this._gainNode.gain.setValueAtTime(0, time);
        }
        this.context.clearTimeout(this._timeout);
        this._timeout = this.context.setTimeout(function () {
            // allow additional time for the exponential curve to fully decay
            var additionalTail = _this._curve === "exponential" ? fadeOutTime * 2 : 0;
            _this._stopSource(_this.now() + additionalTail);
            _this._onended();
        }, this._stopTime - this.context.currentTime);
        return this;
    };
    /**
     * Invoke the onended callback
     */
    OneShotSource.prototype._onended = function () {
        var _this = this;
        if (this.onended !== noOp) {
            this.onended(this);
            // overwrite onended to make sure it only is called once
            this.onended = noOp;
            // dispose when it's ended to free up for garbage collection only in the online context
            if (!this.context.isOffline) {
                setTimeout(function () { return _this.dispose(); }, 1000);
            }
        }
    };
    Object.defineProperty(OneShotSource.prototype, "state", {
        /**
         * Get the playback state at the current time
         */
        get: function () {
            return this.getStateAtTime(this.now());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Cancel a scheduled stop event
     */
    OneShotSource.prototype.cancelStop = function () {
        this.log("cancelStop");
        assert(this._startTime !== -1, "Source is not started");
        // cancel the stop envelope
        this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime);
        this.context.clearTimeout(this._timeout);
        this._stopTime = -1;
        return this;
    };
    OneShotSource.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._gainNode.disconnect();
        return this;
    };
    return OneShotSource;
}(ToneAudioNode));
export { OneShotSource };
//# sourceMappingURL=OneShotSource.js.map
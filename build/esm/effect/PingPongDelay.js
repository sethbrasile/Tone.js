import * as tslib_1 from "tslib";
import { StereoXFeedbackEffect } from "./StereoXFeedbackEffect";
import { optionsFromArguments } from "../core/util/Defaults";
import { Delay } from "../core/context/Delay";
import { Signal } from "../signal/Signal";
import { readOnly } from "../core/util/Interface";
/**
 * PingPongDelay is a feedback delay effect where the echo is heard
 * first in one channel and next in the opposite channel. In a stereo
 * system these are the right and left channels.
 * PingPongDelay in more simplified terms is two Tone.FeedbackDelays
 * with independent delay values. Each delay is routed to one channel
 * (left or right), and the channel triggered second will always
 * trigger at the same interval after the first.
 * @example
 * import { MembraneSynth, PingPongDelay } from "tone";
 * const pingPong = new PingPongDelay("4n", 0.2).toDestination();
 * const drum = new MembraneSynth().connect(pingPong);
 * drum.triggerAttackRelease("C4", "32n");
 * @category Effect
 */
var PingPongDelay = /** @class */ (function (_super) {
    tslib_1.__extends(PingPongDelay, _super);
    function PingPongDelay() {
        var _this = _super.call(this, optionsFromArguments(PingPongDelay.getDefaults(), arguments, ["delayTime", "feedback"])) || this;
        _this.name = "PingPongDelay";
        var options = optionsFromArguments(PingPongDelay.getDefaults(), arguments, ["delayTime", "feedback"]);
        _this._leftDelay = new Delay({
            context: _this.context,
            maxDelay: options.maxDelay,
        });
        _this._rightDelay = new Delay({
            context: _this.context,
            maxDelay: options.maxDelay
        });
        _this._rightPreDelay = new Delay({
            context: _this.context,
            maxDelay: options.maxDelay
        });
        _this.delayTime = new Signal({
            context: _this.context,
            units: "time",
            value: options.delayTime,
        });
        // connect it up
        _this.connectEffectLeft(_this._leftDelay);
        _this.connectEffectRight(_this._rightPreDelay, _this._rightDelay);
        _this.delayTime.fan(_this._leftDelay.delayTime, _this._rightDelay.delayTime, _this._rightPreDelay.delayTime);
        // rearranged the feedback to be after the rightPreDelay
        _this._feedbackL.disconnect();
        _this._feedbackL.connect(_this._rightDelay);
        readOnly(_this, ["delayTime"]);
        return _this;
    }
    PingPongDelay.getDefaults = function () {
        return Object.assign(StereoXFeedbackEffect.getDefaults(), {
            delayTime: 0.25,
            maxDelay: 1
        });
    };
    PingPongDelay.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._leftDelay.dispose();
        this._rightDelay.dispose();
        this._rightPreDelay.dispose();
        this.delayTime.dispose();
        return this;
    };
    return PingPongDelay;
}(StereoXFeedbackEffect));
export { PingPongDelay };
//# sourceMappingURL=PingPongDelay.js.map
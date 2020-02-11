import * as tslib_1 from "tslib";
import { Delay } from "../core/context/Delay";
import { optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { FeedbackEffect } from "./FeedbackEffect";
/**
 * FeedbackDelay is a DelayNode in which part of output signal is fed back into the delay.
 *
 * @param delayTime The delay applied to the incoming signal.
 * @param feedback The amount of the effected signal which is fed back through the delay.
 * @example
 * import { FeedbackDelay, MembraneSynth } from "tone";
 * const feedbackDelay = new FeedbackDelay("8n", 0.5).toDestination();
 * const tom = new MembraneSynth({
 * 	octaves: 4,
 * 	pitchDecay: 0.1
 * }).connect(feedbackDelay);
 * tom.triggerAttackRelease("A2", "32n");
 * @category Effect
 */
var FeedbackDelay = /** @class */ (function (_super) {
    tslib_1.__extends(FeedbackDelay, _super);
    function FeedbackDelay() {
        var _this = _super.call(this, optionsFromArguments(FeedbackDelay.getDefaults(), arguments, ["delayTime", "feedback"])) || this;
        _this.name = "FeedbackDelay";
        var options = optionsFromArguments(FeedbackDelay.getDefaults(), arguments, ["delayTime", "feedback"]);
        _this._delayNode = new Delay({
            context: _this.context,
            delayTime: options.delayTime,
            maxDelay: options.maxDelay,
        });
        _this.delayTime = _this._delayNode.delayTime;
        // connect it up
        _this.connectEffect(_this._delayNode);
        readOnly(_this, "delayTime");
        return _this;
    }
    FeedbackDelay.getDefaults = function () {
        return Object.assign(FeedbackEffect.getDefaults(), {
            delayTime: 0.25,
            maxDelay: 1,
        });
    };
    FeedbackDelay.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._delayNode.dispose();
        this.delayTime.dispose();
        return this;
    };
    return FeedbackDelay;
}(FeedbackEffect));
export { FeedbackDelay };
//# sourceMappingURL=FeedbackDelay.js.map
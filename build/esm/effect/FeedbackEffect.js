import * as tslib_1 from "tslib";
import { Gain } from "../core/context/Gain";
import { readOnly } from "../core/util/Interface";
import { Effect } from "./Effect";
/**
 * FeedbackEffect provides a loop between an audio source and its own output.
 * This is a base-class for feedback effects.
 */
var FeedbackEffect = /** @class */ (function (_super) {
    tslib_1.__extends(FeedbackEffect, _super);
    function FeedbackEffect(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "FeedbackEffect";
        _this._feedbackGain = new Gain({
            context: _this.context,
            gain: options.feedback,
            units: "normalRange",
        });
        _this.feedback = _this._feedbackGain.gain;
        readOnly(_this, "feedback");
        // the feedback loop
        _this.effectReturn.chain(_this._feedbackGain, _this.effectSend);
        return _this;
    }
    FeedbackEffect.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            feedback: 0.125,
        });
    };
    FeedbackEffect.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._feedbackGain.dispose();
        this.feedback.dispose();
        return this;
    };
    return FeedbackEffect;
}(Effect));
export { FeedbackEffect };
//# sourceMappingURL=FeedbackEffect.js.map
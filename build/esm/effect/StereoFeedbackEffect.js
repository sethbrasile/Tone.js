import * as tslib_1 from "tslib";
import { StereoEffect } from "./StereoEffect";
import { Signal } from "../signal/Signal";
import { Gain } from "../core/context/Gain";
import { readOnly } from "../core/util/Interface";
import { Split } from "../component/channel/Split";
import { Merge } from "../component/channel/Merge";
/**
 * Just like a stereo feedback effect, but the feedback is routed from left to right
 * and right to left instead of on the same channel.
 * ```
 * +--------------------------------+ feedbackL <-----------------------------------+
 * |                                                                                |
 * +-->                          +----->        +---->                          +---+
 *      feedbackMerge +--> split        (EFFECT)       merge +--> feedbackSplit
 * +-->                          +----->        +---->                          +---+
 * |                                                                                |
 * +--------------------------------+ feedbackR <-----------------------------------+
 * ```
 */
var StereoFeedbackEffect = /** @class */ (function (_super) {
    tslib_1.__extends(StereoFeedbackEffect, _super);
    function StereoFeedbackEffect(options) {
        var _this = _super.call(this, options) || this;
        _this.feedback = new Signal({
            context: _this.context,
            value: options.feedback,
            units: "normalRange"
        });
        _this._feedbackL = new Gain({ context: _this.context });
        _this._feedbackR = new Gain({ context: _this.context });
        _this._feedbackSplit = new Split({ context: _this.context, channels: 2 });
        _this._feedbackMerge = new Merge({ context: _this.context, channels: 2 });
        _this._merge.connect(_this._feedbackSplit);
        _this._feedbackMerge.connect(_this._split);
        // the left output connected to the left input
        _this._feedbackSplit.connect(_this._feedbackL, 0, 0);
        _this._feedbackL.connect(_this._feedbackMerge, 0, 0);
        // the right output connected to the right input
        _this._feedbackSplit.connect(_this._feedbackR, 1, 0);
        _this._feedbackR.connect(_this._feedbackMerge, 0, 1);
        // the feedback control
        _this.feedback.fan(_this._feedbackL.gain, _this._feedbackR.gain);
        readOnly(_this, ["feedback"]);
        return _this;
    }
    StereoFeedbackEffect.getDefaults = function () {
        return Object.assign(StereoEffect.getDefaults(), {
            feedback: 0.5,
        });
    };
    StereoFeedbackEffect.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.feedback.dispose();
        this._feedbackL.dispose();
        this._feedbackR.dispose();
        this._feedbackSplit.dispose();
        this._feedbackMerge.dispose();
        return this;
    };
    return StereoFeedbackEffect;
}(StereoEffect));
export { StereoFeedbackEffect };
//# sourceMappingURL=StereoFeedbackEffect.js.map
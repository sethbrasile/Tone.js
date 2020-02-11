import * as tslib_1 from "tslib";
import { StereoFeedbackEffect } from "./StereoFeedbackEffect";
import { readOnly } from "../core/util/Interface";
/**
 * Just like a [[StereoFeedbackEffect]], but the feedback is routed from left to right
 * and right to left instead of on the same channel.
 * ```
 * +--------------------------------+ feedbackL <-----------------------------------+
 * |                                                                                |
 * +-->                          +----->        +---->                          +-----+
 *      feedbackMerge +--> split        (EFFECT)       merge +--> feedbackSplit     | |
 * +-->                          +----->        +---->                          +---+ |
 * |                                                                                  |
 * +--------------------------------+ feedbackR <-------------------------------------+
 * ```
 */
var StereoXFeedbackEffect = /** @class */ (function (_super) {
    tslib_1.__extends(StereoXFeedbackEffect, _super);
    function StereoXFeedbackEffect(options) {
        var _this = _super.call(this, options) || this;
        // the left output connected to the right input
        _this._feedbackL.disconnect();
        _this._feedbackL.connect(_this._feedbackMerge, 0, 1);
        // the left output connected to the right input
        _this._feedbackR.disconnect();
        _this._feedbackR.connect(_this._feedbackMerge, 0, 0);
        readOnly(_this, ["feedback"]);
        return _this;
    }
    return StereoXFeedbackEffect;
}(StereoFeedbackEffect));
export { StereoXFeedbackEffect };
//# sourceMappingURL=StereoXFeedbackEffect.js.map
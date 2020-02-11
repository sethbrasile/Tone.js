import * as tslib_1 from "tslib";
import { MidSideEffect } from "../effect/MidSideEffect";
import { Signal } from "../signal/Signal";
import { Multiply } from "../signal/Multiply";
import { Subtract } from "../signal/Subtract";
import { optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
import { connect } from "../core/context/ToneAudioNode";
/**
 * Applies a width factor to the mid/side seperation.
 * 0 is all mid and 1 is all side.
 * Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
 * ```
 * Mid *= 2*(1-width)<br>
 * Side *= 2*width
 * ```
 * @category Effect
 */
var StereoWidener = /** @class */ (function (_super) {
    tslib_1.__extends(StereoWidener, _super);
    function StereoWidener() {
        var _this = _super.call(this, optionsFromArguments(StereoWidener.getDefaults(), arguments, ["width"])) || this;
        _this.name = "StereoWidener";
        var options = optionsFromArguments(StereoWidener.getDefaults(), arguments, ["width"]);
        _this.width = new Signal({
            context: _this.context,
            value: options.width,
            units: "normalRange",
        });
        readOnly(_this, ["width"]);
        _this._twoTimesWidthMid = new Multiply({
            context: _this.context,
            value: 2,
        });
        _this._twoTimesWidthSide = new Multiply({
            context: _this.context,
            value: 2,
        });
        _this._midMult = new Multiply({ context: _this.context });
        _this._twoTimesWidthMid.connect(_this._midMult.factor);
        _this.connectEffectMid(_this._midMult);
        _this._oneMinusWidth = new Subtract({ context: _this.context });
        _this._oneMinusWidth.connect(_this._twoTimesWidthMid);
        connect(_this.context.getConstant(1), _this._oneMinusWidth);
        _this.width.connect(_this._oneMinusWidth.subtrahend);
        _this._sideMult = new Multiply({ context: _this.context });
        _this.width.connect(_this._twoTimesWidthSide);
        _this._twoTimesWidthSide.connect(_this._sideMult.factor);
        _this.connectEffectSide(_this._sideMult);
        return _this;
    }
    StereoWidener.getDefaults = function () {
        return Object.assign(MidSideEffect.getDefaults(), {
            width: 0.5,
        });
    };
    StereoWidener.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.width.dispose();
        this._midMult.dispose();
        this._sideMult.dispose();
        this._twoTimesWidthMid.dispose();
        this._twoTimesWidthSide.dispose();
        this._oneMinusWidth.dispose();
        return this;
    };
    return StereoWidener;
}(MidSideEffect));
export { StereoWidener };
//# sourceMappingURL=StereoWidener.js.map
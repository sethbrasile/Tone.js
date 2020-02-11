import * as tslib_1 from "tslib";
import { Effect } from "./Effect";
import { MidSideSplit } from "../component/channel/MidSideSplit";
import { MidSideMerge } from "../component/channel/MidSideMerge";
/**
 * Mid/Side processing separates the the 'mid' signal
 * (which comes out of both the left and the right channel)
 * and the 'side' (which only comes out of the the side channels)
 * and effects them separately before being recombined.
 * Applies a Mid/Side seperation and recombination.
 * Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
 * This is a base-class for Mid/Side Effects.
 */
var MidSideEffect = /** @class */ (function (_super) {
    tslib_1.__extends(MidSideEffect, _super);
    function MidSideEffect(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "MidSideEffect";
        _this._midSideMerge = new MidSideMerge({ context: _this.context });
        _this._midSideSplit = new MidSideSplit({ context: _this.context });
        _this._midSend = _this._midSideSplit.mid;
        _this._sideSend = _this._midSideSplit.side;
        _this._midReturn = _this._midSideMerge.mid;
        _this._sideReturn = _this._midSideMerge.side;
        // the connections
        _this.effectSend.connect(_this._midSideSplit);
        _this._midSideMerge.connect(_this.effectReturn);
        return _this;
    }
    /**
     * Connect the mid chain of the effect
     */
    MidSideEffect.prototype.connectEffectMid = function () {
        var _a;
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        (_a = this._midSend).chain.apply(_a, tslib_1.__spread(nodes, [this._midReturn]));
    };
    /**
     * Connect the side chain of the effect
     */
    MidSideEffect.prototype.connectEffectSide = function () {
        var _a;
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        (_a = this._sideSend).chain.apply(_a, tslib_1.__spread(nodes, [this._sideReturn]));
    };
    MidSideEffect.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._midSideSplit.dispose();
        this._midSideMerge.dispose();
        this._midSend.dispose();
        this._sideSend.dispose();
        this._midReturn.dispose();
        this._sideReturn.dispose();
        return this;
    };
    return MidSideEffect;
}(Effect));
export { MidSideEffect };
//# sourceMappingURL=MidSideEffect.js.map
import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { Merge } from "./Merge";
import { Add } from "../../signal/Add";
import { Multiply } from "../../signal/Multiply";
import { Subtract } from "../../signal/Subtract";
import { Gain } from "../../core/context/Gain";
import { optionsFromArguments } from "../../core/util/Defaults";
/**
 * MidSideMerge merges the mid and side signal after they've been separated by [[MidSideMerge]]
 * ```
 * Mid = (Left+Right)/sqrt(2);   // obtain mid-signal from left and right
 * Side = (Left-Right)/sqrt(2);   // obtain side-signal from left and righ
 * ```
 */
var MidSideMerge = /** @class */ (function (_super) {
    tslib_1.__extends(MidSideMerge, _super);
    function MidSideMerge() {
        var _this = _super.call(this, optionsFromArguments(MidSideMerge.getDefaults(), arguments)) || this;
        _this.name = "MidSideMerge";
        _this.mid = new Gain({ context: _this.context });
        _this.side = new Gain({ context: _this.context });
        _this._left = new Add({ context: _this.context });
        _this._leftMult = new Multiply({
            context: _this.context,
            value: Math.SQRT1_2
        });
        _this._right = new Subtract({ context: _this.context });
        _this._rightMult = new Multiply({
            context: _this.context,
            value: Math.SQRT1_2
        });
        _this._merge = _this.output = new Merge({ context: _this.context });
        _this.mid.fan(_this._left);
        _this.side.connect(_this._left.addend);
        _this.mid.connect(_this._right);
        _this.side.connect(_this._right.subtrahend);
        _this._left.connect(_this._leftMult);
        _this._right.connect(_this._rightMult);
        _this._leftMult.connect(_this._merge, 0, 0);
        _this._rightMult.connect(_this._merge, 0, 1);
        return _this;
    }
    MidSideMerge.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.mid.dispose();
        this.side.dispose();
        this._leftMult.dispose();
        this._rightMult.dispose();
        this._left.dispose();
        this._right.dispose();
        return this;
    };
    return MidSideMerge;
}(ToneAudioNode));
export { MidSideMerge };
//# sourceMappingURL=MidSideMerge.js.map
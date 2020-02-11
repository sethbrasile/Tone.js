import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { Split } from "./Split";
import { Add } from "../../signal/Add";
import { Multiply } from "../../signal/Multiply";
import { Subtract } from "../../signal/Subtract";
import { optionsFromArguments } from "../../core/util/Defaults";
/**
 * Mid/Side processing separates the the 'mid' signal (which comes out of both the left and the right channel)
 * and the 'side' (which only comes out of the the side channels).
 * ```
 * Mid = (Left+Right)/sqrt(2);   // obtain mid-signal from left and right
 * Side = (Left-Right)/sqrt(2);   // obtain side-signal from left and right
 * ```
 */
var MidSideSplit = /** @class */ (function (_super) {
    tslib_1.__extends(MidSideSplit, _super);
    function MidSideSplit() {
        var _this = _super.call(this, optionsFromArguments(MidSideSplit.getDefaults(), arguments)) || this;
        _this.name = "MidSideSplit";
        _this._split = _this.input = new Split({
            channels: 2,
            context: _this.context
        });
        _this._midAdd = new Add({ context: _this.context });
        _this.mid = new Multiply({
            context: _this.context,
            value: Math.SQRT1_2,
        });
        _this._sideSubtract = new Subtract({ context: _this.context });
        _this.side = new Multiply({
            context: _this.context,
            value: Math.SQRT1_2,
        });
        _this._split.connect(_this._midAdd, 0);
        _this._split.connect(_this._midAdd.addend, 1);
        _this._split.connect(_this._sideSubtract, 0);
        _this._split.connect(_this._sideSubtract.subtrahend, 1);
        _this._midAdd.connect(_this.mid);
        _this._sideSubtract.connect(_this.side);
        return _this;
    }
    MidSideSplit.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.mid.dispose();
        this.side.dispose();
        this._midAdd.dispose();
        this._sideSubtract.dispose();
        this._split.dispose();
        return this;
    };
    return MidSideSplit;
}(ToneAudioNode));
export { MidSideSplit };
//# sourceMappingURL=MidSideSplit.js.map
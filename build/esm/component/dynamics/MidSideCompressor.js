import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { Compressor } from "./Compressor";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MidSideSplit } from "../channel/MidSideSplit";
import { MidSideMerge } from "../channel/MidSideMerge";
import { readOnly } from "../../core/util/Interface";
/**
 * MidSideCompressor applies two different compressors to the [[mid]]
 * and [[side]] signal components of the input. See [[MidSideSplit]] and [[MidSideMerge]].
 */
var MidSideCompressor = /** @class */ (function (_super) {
    tslib_1.__extends(MidSideCompressor, _super);
    function MidSideCompressor() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(MidSideCompressor.getDefaults(), arguments))) || this;
        _this.name = "MidSideCompressor";
        var options = optionsFromArguments(MidSideCompressor.getDefaults(), arguments);
        _this._midSideSplit = _this.input = new MidSideSplit({ context: _this.context });
        _this._midSideMerge = _this.output = new MidSideMerge({ context: _this.context });
        _this.mid = new Compressor(Object.assign(options.mid, { context: _this.context }));
        _this.side = new Compressor(Object.assign(options.side, { context: _this.context }));
        _this._midSideSplit.mid.chain(_this.mid, _this._midSideMerge.mid);
        _this._midSideSplit.side.chain(_this.side, _this._midSideMerge.side);
        readOnly(_this, ["mid", "side"]);
        return _this;
    }
    MidSideCompressor.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mid: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
            side: {
                ratio: 6,
                threshold: -30,
                release: 0.25,
                attack: 0.03,
                knee: 10
            }
        });
    };
    MidSideCompressor.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.mid.dispose();
        this.side.dispose();
        this._midSideSplit.dispose();
        this._midSideMerge.dispose();
        return this;
    };
    return MidSideCompressor;
}(ToneAudioNode));
export { MidSideCompressor };
//# sourceMappingURL=MidSideCompressor.js.map
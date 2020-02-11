import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Merge } from "./Merge";
/**
 * Mono coerces the incoming mono or stereo signal into a mono signal
 * where both left and right channels have the same value. This can be useful
 * for [stereo imaging](https://en.wikipedia.org/wiki/Stereo_imaging).
 * @category Component
 */
var Mono = /** @class */ (function (_super) {
    tslib_1.__extends(Mono, _super);
    function Mono() {
        var _this = _super.call(this, optionsFromArguments(Mono.getDefaults(), arguments)) || this;
        _this.name = "Mono";
        _this.input = new Gain({ context: _this.context });
        _this._merge = _this.output = new Merge({
            channels: 2,
            context: _this.context,
        });
        _this.input.connect(_this._merge, 0, 0);
        _this.input.connect(_this._merge, 0, 1);
        return _this;
    }
    Mono.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._merge.dispose();
        this.input.dispose();
        return this;
    };
    return Mono;
}(ToneAudioNode));
export { Mono };
//# sourceMappingURL=Mono.js.map
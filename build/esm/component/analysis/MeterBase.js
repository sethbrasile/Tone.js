import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Analyser } from "./Analyser";
/**
 * The base class for Metering classes.
 */
var MeterBase = /** @class */ (function (_super) {
    tslib_1.__extends(MeterBase, _super);
    function MeterBase() {
        var _this = _super.call(this, optionsFromArguments(MeterBase.getDefaults(), arguments)) || this;
        _this.name = "MeterBase";
        _this.input = _this.output = _this._analyser = new Analyser({
            context: _this.context,
            size: 256,
            type: "waveform",
        });
        return _this;
    }
    MeterBase.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._analyser.dispose();
        return this;
    };
    return MeterBase;
}(ToneAudioNode));
export { MeterBase };
//# sourceMappingURL=MeterBase.js.map
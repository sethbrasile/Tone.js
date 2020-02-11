import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase } from "./MeterBase";
/**
 * DCMeter gets the raw value of the input signal at the current time.
 *
 * @example
 * import { DCMeter, UserMedia } from "tone";
 * const meter = new DCMeter();
 * const mic = new UserMedia();
 * mic.open();
 * // connect mic to the meter
 * mic.connect(meter);
 * // the current level of the mic
 * const level = meter.getValue();
 * @category Component
 */
var DCMeter = /** @class */ (function (_super) {
    tslib_1.__extends(DCMeter, _super);
    function DCMeter() {
        var _this = _super.call(this, optionsFromArguments(DCMeter.getDefaults(), arguments)) || this;
        _this.name = "DCMeter";
        _this._analyser.type = "waveform";
        _this._analyser.size = 256;
        return _this;
    }
    /**
     * Get the signal value of the incoming signal
     */
    DCMeter.prototype.getValue = function () {
        var value = this._analyser.getValue();
        return value[0];
    };
    return DCMeter;
}(MeterBase));
export { DCMeter };
//# sourceMappingURL=DCMeter.js.map
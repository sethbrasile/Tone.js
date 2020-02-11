import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../../core/util/Defaults";
import { MeterBase } from "./MeterBase";
/**
 * Get the current waveform data of the connected audio source.
 * @category Component
 */
var Waveform = /** @class */ (function (_super) {
    tslib_1.__extends(Waveform, _super);
    function Waveform() {
        var _this = _super.call(this, optionsFromArguments(Waveform.getDefaults(), arguments, ["size"])) || this;
        _this.name = "Waveform";
        var options = optionsFromArguments(Waveform.getDefaults(), arguments, ["size"]);
        _this._analyser.type = "waveform";
        _this.size = options.size;
        return _this;
    }
    Waveform.getDefaults = function () {
        return Object.assign(MeterBase.getDefaults(), {
            size: 1024,
        });
    };
    /**
     * Return the waveform for the current time as a Float32Array where each value in the array
     * represents a sample in the waveform.
     */
    Waveform.prototype.getValue = function () {
        return this._analyser.getValue();
    };
    Object.defineProperty(Waveform.prototype, "size", {
        /**
         * The size of analysis. This must be a power of two in the range 16 to 16384.
         * Determines the size of the array returned by [[getValue]].
         */
        get: function () {
            return this._analyser.size;
        },
        set: function (size) {
            this._analyser.size = size;
        },
        enumerable: true,
        configurable: true
    });
    return Waveform;
}(MeterBase));
export { Waveform };
//# sourceMappingURL=Waveform.js.map
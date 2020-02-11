import * as tslib_1 from "tslib";
import { Param } from "../context/Param";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { ToneAudioNode } from "./ToneAudioNode";
/**
 * A thin wrapper around the Native Web Audio GainNode.
 * The GainNode is a basic building block of the Web Audio
 * API and is useful for routing audio and adjusting gains.
 * @category Core
 */
var Gain = /** @class */ (function (_super) {
    tslib_1.__extends(Gain, _super);
    function Gain() {
        var _this = _super.call(this, optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"])) || this;
        _this.name = "Gain";
        /**
         * The wrapped GainNode.
         */
        _this._gainNode = _this.context.createGain();
        // input = output
        _this.input = _this._gainNode;
        _this.output = _this._gainNode;
        var options = optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]);
        _this.gain = new Param({
            context: _this.context,
            convert: options.convert,
            param: _this._gainNode.gain,
            units: options.units,
            value: options.gain,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        readOnly(_this, "gain");
        return _this;
    }
    Gain.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            convert: true,
            gain: 1,
            units: "gain",
        });
    };
    /**
     * Clean up.
     */
    Gain.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._gainNode.disconnect();
        this.gain.dispose();
        return this;
    };
    return Gain;
}(ToneAudioNode));
export { Gain };
//# sourceMappingURL=Gain.js.map
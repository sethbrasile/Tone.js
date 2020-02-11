import * as tslib_1 from "tslib";
import { Param } from "../context/Param";
import { optionsFromArguments } from "../util/Defaults";
import { readOnly } from "../util/Interface";
import { ToneAudioNode } from "./ToneAudioNode";
/**
 * Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface).
 * @category Core
 */
var Delay = /** @class */ (function (_super) {
    tslib_1.__extends(Delay, _super);
    function Delay() {
        var _this = _super.call(this, optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"])) || this;
        _this.name = "Delay";
        var options = optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]);
        var maxDelayInSeconds = _this.toSeconds(options.maxDelay);
        _this._maxDelay = Math.max(maxDelayInSeconds, _this.toSeconds(options.delayTime));
        _this._delayNode = _this.input = _this.output = _this.context.createDelay(maxDelayInSeconds);
        _this.delayTime = new Param({
            context: _this.context,
            param: _this._delayNode.delayTime,
            units: "time",
            value: options.delayTime,
            minValue: 0,
            maxValue: _this.maxDelay,
        });
        readOnly(_this, "delayTime");
        return _this;
    }
    Delay.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            delayTime: 0,
            maxDelay: 1,
        });
    };
    Object.defineProperty(Delay.prototype, "maxDelay", {
        /**
         * The maximum delay time. This cannot be changed after
         * the value is passed into the constructor.
         */
        get: function () {
            return this._maxDelay;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up.
     */
    Delay.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._delayNode.disconnect();
        this.delayTime.dispose();
        return this;
    };
    return Delay;
}(ToneAudioNode));
export { Delay };
//# sourceMappingURL=Delay.js.map
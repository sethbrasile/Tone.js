import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { FeedbackCombFilter } from "./FeedbackCombFilter";
import { OnePoleFilter } from "./OnePoleFilter";
/**
 * A lowpass feedback comb filter. It is similar to
 * [[FeedbackCombFilter]], but includes a lowpass filter.
 * @category Component
 */
var LowpassCombFilter = /** @class */ (function (_super) {
    tslib_1.__extends(LowpassCombFilter, _super);
    function LowpassCombFilter() {
        var _this = _super.call(this, optionsFromArguments(LowpassCombFilter.getDefaults(), arguments, ["delayTime", "resonance", "dampening"])) || this;
        _this.name = "LowpassCombFilter";
        var options = optionsFromArguments(LowpassCombFilter.getDefaults(), arguments, ["delayTime", "resonance", "dampening"]);
        _this._combFilter = _this.output = new FeedbackCombFilter({
            context: _this.context,
            delayTime: options.delayTime,
            resonance: options.resonance,
        });
        _this.delayTime = _this._combFilter.delayTime;
        _this.resonance = _this._combFilter.resonance;
        _this._lowpass = _this.input = new OnePoleFilter({
            context: _this.context,
            frequency: options.dampening,
            type: "lowpass",
        });
        // connections
        _this._lowpass.connect(_this._combFilter);
        return _this;
    }
    LowpassCombFilter.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            dampening: 3000,
            delayTime: 0.1,
            resonance: 0.5,
        });
    };
    Object.defineProperty(LowpassCombFilter.prototype, "dampening", {
        /**
         * The dampening control of the feedback
         */
        get: function () {
            return this._lowpass.frequency;
        },
        set: function (fq) {
            this._lowpass.frequency = fq;
        },
        enumerable: true,
        configurable: true
    });
    LowpassCombFilter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._combFilter.dispose();
        this._lowpass.dispose();
        return this;
    };
    return LowpassCombFilter;
}(ToneAudioNode));
export { LowpassCombFilter };
//# sourceMappingURL=LowpassCombFilter.js.map
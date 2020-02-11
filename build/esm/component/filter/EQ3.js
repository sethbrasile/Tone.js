import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly, writable } from "../../core/util/Interface";
import { MultibandSplit } from "../channel/MultibandSplit";
/**
 * EQ3 provides 3 equalizer bins: Low/Mid/High.
 * @category Component
 */
var EQ3 = /** @class */ (function (_super) {
    tslib_1.__extends(EQ3, _super);
    function EQ3() {
        var _this = _super.call(this, optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"])) || this;
        _this.name = "EQ3";
        /**
         * the output
         */
        _this.output = new Gain({ context: _this.context });
        _this._internalChannels = [];
        var options = optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]);
        _this.input = _this._multibandSplit = new MultibandSplit({
            context: _this.context,
            highFrequency: options.highFrequency,
            lowFrequency: options.lowFrequency,
        });
        _this._lowGain = new Gain({
            context: _this.context,
            gain: options.low,
            units: "decibels",
        });
        _this._midGain = new Gain({
            context: _this.context,
            gain: options.mid,
            units: "decibels",
        });
        _this._highGain = new Gain({
            context: _this.context,
            gain: options.high,
            units: "decibels",
        });
        _this.low = _this._lowGain.gain;
        _this.mid = _this._midGain.gain;
        _this.high = _this._highGain.gain;
        _this.Q = _this._multibandSplit.Q;
        _this.lowFrequency = _this._multibandSplit.lowFrequency;
        _this.highFrequency = _this._multibandSplit.highFrequency;
        // the frequency bands
        _this._multibandSplit.low.chain(_this._lowGain, _this.output);
        _this._multibandSplit.mid.chain(_this._midGain, _this.output);
        _this._multibandSplit.high.chain(_this._highGain, _this.output);
        readOnly(_this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
        _this._internalChannels = [_this._multibandSplit];
        return _this;
    }
    EQ3.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            high: 0,
            highFrequency: 2500,
            low: 0,
            lowFrequency: 400,
            mid: 0,
        });
    };
    /**
     * Clean up.
     */
    EQ3.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        writable(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
        this._multibandSplit.dispose();
        this.lowFrequency.dispose();
        this.highFrequency.dispose();
        this._lowGain.dispose();
        this._midGain.dispose();
        this._highGain.dispose();
        this.low.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.Q.dispose();
        return this;
    };
    return EQ3;
}(ToneAudioNode));
export { EQ3 };
//# sourceMappingURL=EQ3.js.map
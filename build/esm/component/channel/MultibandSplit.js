import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly, writable } from "../../core/util/Interface";
import { Signal } from "../../signal/Signal";
import { Filter } from "../filter/Filter";
/**
 * Split the incoming signal into three bands (low, mid, high)
 * with two crossover frequency controls.
 * ```
 *            +----------------------+
 *          +-> input < lowFrequency +------------------> low
 *          | +----------------------+
 *          |
 *          | +--------------------------------------+
 * input ---+-> lowFrequency < input < highFrequency +--> mid
 *          | +--------------------------------------+
 *          |
 *          | +-----------------------+
 *          +-> highFrequency < input +-----------------> high
 *            +-----------------------+
 * ```
 * @category Component
 */
var MultibandSplit = /** @class */ (function (_super) {
    tslib_1.__extends(MultibandSplit, _super);
    function MultibandSplit() {
        var _this = _super.call(this, optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"])) || this;
        _this.name = "MultibandSplit";
        /**
         * the input
         */
        _this.input = new Gain({ context: _this.context });
        /**
         * no output node, use either low, mid or high outputs
         */
        _this.output = undefined;
        /**
         * The low band.
         */
        _this.low = new Filter({
            context: _this.context,
            frequency: 0,
            type: "lowpass",
        });
        /**
         * the lower filter of the mid band
         */
        _this._lowMidFilter = new Filter({
            context: _this.context,
            frequency: 0,
            type: "highpass",
        });
        /**
         * The mid band output.
         */
        _this.mid = new Filter({
            context: _this.context,
            frequency: 0,
            type: "lowpass",
        });
        /**
         * The high band output.
         */
        _this.high = new Filter({
            context: _this.context,
            frequency: 0,
            type: "highpass",
        });
        _this._internalChannels = [_this.low, _this.mid, _this.high];
        var options = optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]);
        _this.lowFrequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: options.lowFrequency,
        });
        _this.highFrequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: options.highFrequency,
        });
        _this.Q = new Signal({
            context: _this.context,
            units: "positive",
            value: options.Q,
        });
        _this.input.fan(_this.low, _this.high);
        _this.input.chain(_this._lowMidFilter, _this.mid);
        // the frequency control signal
        _this.lowFrequency.fan(_this.low.frequency, _this._lowMidFilter.frequency);
        _this.highFrequency.fan(_this.mid.frequency, _this.high.frequency);
        // the Q value
        _this.Q.connect(_this.low.Q);
        _this.Q.connect(_this._lowMidFilter.Q);
        _this.Q.connect(_this.mid.Q);
        _this.Q.connect(_this.high.Q);
        readOnly(_this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
        return _this;
    }
    MultibandSplit.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            Q: 1,
            highFrequency: 2500,
            lowFrequency: 400,
        });
    };
    /**
     * Clean up.
     */
    MultibandSplit.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        writable(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
        this.low.dispose();
        this._lowMidFilter.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.lowFrequency.dispose();
        this.highFrequency.dispose();
        this.Q.dispose();
        return this;
    };
    return MultibandSplit;
}(ToneAudioNode));
export { MultibandSplit };
//# sourceMappingURL=MultibandSplit.js.map
import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { Compressor } from "./Compressor";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { MultibandSplit } from "../channel/MultibandSplit";
import { Gain } from "../../core/context/Gain";
/**
 * A compressor with separate controls over low/mid/high dynamics. See [[Compressor]] and [[MultibandSplit]]
 *
 * @example
 * import { MultibandCompressor } from "tone";
 * const multiband = new MultibandCompressor({
 * 	lowFrequency: 200,
 * 	highFrequency: 1300,
 * 	low: {
 * 		threshold: -12
 * 	}
 * });
 */
var MultibandCompressor = /** @class */ (function (_super) {
    tslib_1.__extends(MultibandCompressor, _super);
    function MultibandCompressor() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(MultibandCompressor.getDefaults(), arguments))) || this;
        _this.name = "MultibandCompressor";
        var options = optionsFromArguments(MultibandCompressor.getDefaults(), arguments);
        _this._splitter = _this.input = new MultibandSplit({
            context: _this.context,
            lowFrequency: options.lowFrequency,
            highFrequency: options.highFrequency
        });
        _this.lowFrequency = _this._splitter.lowFrequency;
        _this.highFrequency = _this._splitter.highFrequency;
        _this.output = new Gain({ context: _this.context });
        _this.low = new Compressor(Object.assign(options.low, { context: _this.context }));
        _this.mid = new Compressor(Object.assign(options.mid, { context: _this.context }));
        _this.high = new Compressor(Object.assign(options.high, { context: _this.context }));
        // connect the compressor
        _this._splitter.low.chain(_this.low, _this.output);
        _this._splitter.mid.chain(_this.mid, _this.output);
        _this._splitter.high.chain(_this.high, _this.output);
        readOnly(_this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
        return _this;
    }
    MultibandCompressor.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            lowFrequency: 250,
            highFrequency: 2000,
            low: {
                ratio: 6,
                threshold: -30,
                release: 0.25,
                attack: 0.03,
                knee: 10
            },
            mid: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
            high: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
        });
    };
    MultibandCompressor.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._splitter.dispose();
        this.low.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.output.dispose();
        return this;
    };
    return MultibandCompressor;
}(ToneAudioNode));
export { MultibandCompressor };
//# sourceMappingURL=MultibandCompressor.js.map
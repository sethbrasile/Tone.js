import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
/**
 * Split splits an incoming signal into the number of given channels.
 *
 * @example
 * import { Split } from "tone";
 *
 * const split = new Split();
 * // stereoSignal.connect(split);
 * @category Component
 */
var Split = /** @class */ (function (_super) {
    tslib_1.__extends(Split, _super);
    function Split() {
        var _this = _super.call(this, optionsFromArguments(Split.getDefaults(), arguments, ["channels"])) || this;
        _this.name = "Split";
        var options = optionsFromArguments(Split.getDefaults(), arguments, ["channels"]);
        _this._splitter = _this.input = _this.output = _this.context.createChannelSplitter(options.channels);
        _this._internalChannels = [_this._splitter];
        return _this;
    }
    Split.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            channels: 2,
        });
    };
    Split.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._splitter.disconnect();
        return this;
    };
    return Split;
}(ToneAudioNode));
export { Split };
//# sourceMappingURL=Split.js.map
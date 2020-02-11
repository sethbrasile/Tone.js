import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
/**
 * Merge brings multiple mono input channels into a single multichannel output channel.
 *
 * @example
 * import { Merge, Noise, Oscillator } from "tone";
 * const merge = new Merge().toDestination();
 * // routing a sine tone in the left channel
 * const osc = new Oscillator().connect(merge, 0, 0).start();
 * // and noise in the right channel
 * const noise = new Noise().connect(merge, 0, 1).start();;
 * @category Component
 */
var Merge = /** @class */ (function (_super) {
    tslib_1.__extends(Merge, _super);
    function Merge() {
        var _this = _super.call(this, optionsFromArguments(Merge.getDefaults(), arguments, ["channels"])) || this;
        _this.name = "Merge";
        var options = optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]);
        _this._merger = _this.output = _this.input = _this.context.createChannelMerger(options.channels);
        return _this;
    }
    Merge.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            channels: 2,
        });
    };
    Merge.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._merger.disconnect();
        return this;
    };
    return Merge;
}(ToneAudioNode));
export { Merge };
//# sourceMappingURL=Merge.js.map
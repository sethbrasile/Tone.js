import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
/**
 * Volume is a simple volume node, useful for creating a volume fader.
 *
 * @example
 * import { Oscillator, Volume } from "tone";
 * const vol = new Volume(-12).toDestination();
 * const osc = new Oscillator().connect(vol).start();
 * @category Component
 */
var Volume = /** @class */ (function (_super) {
    tslib_1.__extends(Volume, _super);
    function Volume() {
        var _this = _super.call(this, optionsFromArguments(Volume.getDefaults(), arguments, ["volume"])) || this;
        _this.name = "Volume";
        var options = optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]);
        _this.input = _this.output = new Gain({
            context: _this.context,
            gain: options.volume,
            units: "decibels",
        });
        _this.volume = _this.output.gain;
        readOnly(_this, "volume");
        _this._unmutedVolume = options.volume;
        // set the mute initially
        _this.mute = options.mute;
        return _this;
    }
    Volume.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            volume: 0,
        });
    };
    Object.defineProperty(Volume.prototype, "mute", {
        /**
         * Mute the output.
         * @example
         * import { Oscillator, Volume } from "tone";
         * const vol = new Volume(-12).toDestination();
         * const osc = new Oscillator().connect(vol).start();
         * // mute the output
         * vol.mute = true;
         */
        get: function () {
            return this.volume.value === -Infinity;
        },
        set: function (mute) {
            if (!this.mute && mute) {
                this._unmutedVolume = this.volume.value;
                // maybe it should ramp here?
                this.volume.value = -Infinity;
            }
            else if (this.mute && !mute) {
                this.volume.value = this._unmutedVolume;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * clean up
     */
    Volume.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.input.dispose();
        this.volume.dispose();
        return this;
    };
    return Volume;
}(ToneAudioNode));
export { Volume };
//# sourceMappingURL=Volume.js.map
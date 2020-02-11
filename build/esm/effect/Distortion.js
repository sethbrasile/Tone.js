import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../core/util/Defaults";
import { WaveShaper } from "../signal/WaveShaper";
import { Effect } from "./Effect";
/**
 * A simple distortion effect using Tone.WaveShaper.
 * Algorithm from [this stackoverflow answer](http://stackoverflow.com/a/22313408).
 *
 * @example
 * import { Distortion, FMSynth } from "tone";
 * const dist = new Distortion(0.8).toDestination();
 * const fm = new FMSynth().connect(dist);
 * fm.triggerAttackRelease("A1", "8n");
 * @category Effect
 */
var Distortion = /** @class */ (function (_super) {
    tslib_1.__extends(Distortion, _super);
    function Distortion() {
        var _this = _super.call(this, optionsFromArguments(Distortion.getDefaults(), arguments, ["distortion"])) || this;
        _this.name = "Distortion";
        var options = optionsFromArguments(Distortion.getDefaults(), arguments, ["distortion"]);
        _this._shaper = new WaveShaper({
            context: _this.context,
            length: 4096,
        });
        _this._distortion = options.distortion;
        _this.connectEffect(_this._shaper);
        _this.distortion = options.distortion;
        _this.oversample = options.oversample;
        return _this;
    }
    Distortion.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            distortion: 0.4,
            oversample: "none",
        });
    };
    Object.defineProperty(Distortion.prototype, "distortion", {
        /**
         * The amount of distortion. Nominal range is between 0 and 1.
         */
        get: function () {
            return this._distortion;
        },
        set: function (amount) {
            this._distortion = amount;
            var k = amount * 100;
            var deg = Math.PI / 180;
            this._shaper.setMap(function (x) {
                if (Math.abs(x) < 0.001) {
                    // should output 0 when input is 0
                    return 0;
                }
                else {
                    return (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Distortion.prototype, "oversample", {
        /**
         * The oversampling of the effect. Can either be "none", "2x" or "4x".
         */
        get: function () {
            return this._shaper.oversample;
        },
        set: function (oversampling) {
            this._shaper.oversample = oversampling;
        },
        enumerable: true,
        configurable: true
    });
    Distortion.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._shaper.dispose();
        return this;
    };
    return Distortion;
}(Effect));
export { Distortion };
//# sourceMappingURL=Distortion.js.map
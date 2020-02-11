import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { OnePoleFilter } from "../filter/OnePoleFilter";
import { Abs } from "../../signal/Abs";
/**
 * Follower is a simple envelope follower.
 * It's implemented by applying a lowpass filter to the absolute value of the incoming signal.
 * ```
 *          +-----+    +---------------+
 * Input +--> Abs +----> OnePoleFilter +--> Output
 *          +-----+    +---------------+
 * ```
 * @category Component
 */
var Follower = /** @class */ (function (_super) {
    tslib_1.__extends(Follower, _super);
    function Follower() {
        var _this = _super.call(this, optionsFromArguments(Follower.getDefaults(), arguments, ["smoothing"])) || this;
        _this.name = "Follower";
        var options = optionsFromArguments(Follower.getDefaults(), arguments, ["smoothing"]);
        _this._abs = _this.input = new Abs({ context: _this.context });
        _this._lowpass = _this.output = new OnePoleFilter({
            context: _this.context,
            frequency: 1 / _this.toSeconds(options.smoothing),
            type: "lowpass"
        });
        _this._abs.connect(_this._lowpass);
        _this._smoothing = options.smoothing;
        return _this;
    }
    Follower.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            smoothing: 0.05
        });
    };
    Object.defineProperty(Follower.prototype, "smoothing", {
        /**
         * The amount of time it takes a value change to arrive at the updated value.
         */
        get: function () {
            return this._smoothing;
        },
        set: function (smoothing) {
            this._smoothing = smoothing;
            this._lowpass.frequency = 1 / this.toSeconds(this.smoothing);
        },
        enumerable: true,
        configurable: true
    });
    Follower.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._abs.dispose();
        this._lowpass.dispose();
        return this;
    };
    return Follower;
}(ToneAudioNode));
export { Follower };
//# sourceMappingURL=Follower.js.map
import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Compressor } from "./Compressor";
import { readOnly } from "../../core/util/Interface";
;
/**
 * Limiter will limit the loudness of an incoming signal.
 * It is composed of a [[Compressor]] with a fast attack
 * and release and max ratio. Limiters are commonly used to safeguard against
 * signal clipping. Unlike a compressor, limiters do not provide
 * smooth gain reduction and almost completely prevent
 * additional gain above the threshold.
 *
 * @example
 * import { Limiter, Oscillator } from "tone";
 * const limiter = new Limiter(-20).toDestination();
 * const oscillator = new Oscillator().connect(limiter);
 * oscillator.start();
 */
var Limiter = /** @class */ (function (_super) {
    tslib_1.__extends(Limiter, _super);
    function Limiter() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"]))) || this;
        _this.name = "Limiter";
        var options = optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"]);
        _this._compressor = _this.input = _this.output = new Compressor({
            context: _this.context,
            ratio: 20,
            attack: 0,
            release: 0,
            threshold: options.threshold
        });
        _this.threshold = _this._compressor.threshold;
        readOnly(_this, "threshold");
        return _this;
    }
    Limiter.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            threshold: -12
        });
    };
    Object.defineProperty(Limiter.prototype, "reduction", {
        /**
         * A read-only decibel value for metering purposes, representing the current amount of gain
         * reduction that the compressor is applying to the signal.
         */
        get: function () {
            return this._compressor.reduction;
        },
        enumerable: true,
        configurable: true
    });
    Limiter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._compressor.dispose();
        this.threshold.dispose();
        return this;
    };
    return Limiter;
}(ToneAudioNode));
export { Limiter };
//# sourceMappingURL=Limiter.js.map
import * as tslib_1 from "tslib";
import { Effect } from "./Effect";
import { optionsFromArguments } from "../core/util/Defaults";
import { WaveShaper } from "../signal/WaveShaper";
/**
 * Chebyshev is a waveshaper which is good
 * for making different types of distortion sounds.
 * Note that odd orders sound very different from even ones,
 * and order = 1 is no change.
 * Read more at [music.columbia.edu](http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php).
 * @example
 * import { Chebyshev, MonoSynth } from "tone";
 * // create a new cheby
 * const cheby = new Chebyshev(50).toDestination();
 * // create a monosynth connected to our cheby
 * const synth = new MonoSynth().connect(cheby);
 * synth.triggerAttackRelease("C2", 0.4);
 * @category Effect
 */
var Chebyshev = /** @class */ (function (_super) {
    tslib_1.__extends(Chebyshev, _super);
    function Chebyshev() {
        var _this = _super.call(this, optionsFromArguments(Chebyshev.getDefaults(), arguments, ["order"])) || this;
        _this.name = "Chebyshev";
        var options = optionsFromArguments(Chebyshev.getDefaults(), arguments, ["order"]);
        _this._shaper = new WaveShaper({
            context: _this.context,
            length: 4096
        });
        _this._order = options.order;
        _this.connectEffect(_this._shaper);
        _this.order = options.order;
        _this.oversample = options.oversample;
        return _this;
    }
    Chebyshev.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            order: 1,
            oversample: "none"
        });
    };
    /**
     * get the coefficient for that degree
     * @param  x the x value
     * @param  degree
     * @param  memo memoize the computed value. this speeds up computation greatly.
     */
    Chebyshev.prototype._getCoefficient = function (x, degree, memo) {
        if (memo.has(degree)) {
            return memo.get(degree);
        }
        else if (degree === 0) {
            memo.set(degree, 0);
        }
        else if (degree === 1) {
            memo.set(degree, x);
        }
        else {
            memo.set(degree, 2 * x * this._getCoefficient(x, degree - 1, memo) - this._getCoefficient(x, degree - 2, memo));
        }
        return memo.get(degree);
    };
    Object.defineProperty(Chebyshev.prototype, "order", {
        /**
         * The order of the Chebyshev polynomial which creates the equation which is applied to the incoming
         * signal through a Tone.WaveShaper. The equations are in the form:
         * ```
         * order 2: 2x^2 + 1
         * order 3: 4x^3 + 3x
         * ```
         * @min 1
         * @max 100
         */
        get: function () {
            return this._order;
        },
        set: function (order) {
            var _this = this;
            this._order = order;
            this._shaper.setMap((function (x) {
                return _this._getCoefficient(x, order, new Map());
            }));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chebyshev.prototype, "oversample", {
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
    Chebyshev.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._shaper.dispose();
        return this;
    };
    return Chebyshev;
}(Effect));
export { Chebyshev };
//# sourceMappingURL=Chebyshev.js.map
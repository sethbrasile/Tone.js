import * as tslib_1 from "tslib";
import { Effect } from "../effect/Effect";
import { LFO } from "../source/oscillator/LFO";
import { readOnly } from "../core/util/Interface";
/**
 * Base class for LFO-based effects.
 */
var LFOEffect = /** @class */ (function (_super) {
    tslib_1.__extends(LFOEffect, _super);
    function LFOEffect(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "LFOEffect";
        _this._lfo = new LFO({
            context: _this.context,
            frequency: options.frequency,
            amplitude: options.depth,
        });
        _this.depth = _this._lfo.amplitude;
        _this.frequency = _this._lfo.frequency;
        _this.type = options.type;
        readOnly(_this, ["frequency", "depth"]);
        return _this;
    }
    LFOEffect.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            frequency: 1,
            type: "sine",
            depth: 1,
        });
    };
    /**
     * Start the effect.
     */
    LFOEffect.prototype.start = function (time) {
        this._lfo.start(time);
        return this;
    };
    /**
     * Stop the lfo
     */
    LFOEffect.prototype.stop = function (time) {
        this._lfo.stop(time);
        return this;
    };
    /**
     * Sync the filter to the transport. See [[LFO.sync]]
     */
    LFOEffect.prototype.sync = function () {
        this._lfo.sync();
        return this;
    };
    /**
     * Unsync the filter from the transport.
     */
    LFOEffect.prototype.unsync = function () {
        this._lfo.unsync();
        return this;
    };
    Object.defineProperty(LFOEffect.prototype, "type", {
        /**
         * The type of the LFO's oscillator: See [[Oscillator.type]]
         * @example
         * import { AutoFilter, Noise } from "tone";
         * const autoFilter = new AutoFilter().start().toDestination();
         * const noise = new Noise().start().connect(autoFilter);
         * autoFilter.type = "square";
         */
        get: function () {
            return this._lfo.type;
        },
        set: function (type) {
            this._lfo.type = type;
        },
        enumerable: true,
        configurable: true
    });
    LFOEffect.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._lfo.dispose();
        this.frequency.dispose();
        this.depth.dispose();
        return this;
    };
    return LFOEffect;
}(Effect));
export { LFOEffect };
//# sourceMappingURL=LFOEffect.js.map
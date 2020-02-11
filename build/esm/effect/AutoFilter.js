import * as tslib_1 from "tslib";
import { Filter } from "../component/filter/Filter";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFOEffect } from "./LFOEffect";
/**
 * AutoFilter is a Tone.Filter with a Tone.LFO connected to the filter cutoff frequency.
 * Setting the LFO rate and depth allows for control over the filter modulation rate
 * and depth.
 *
 * @example
 * import { AutoFilter, Oscillator } from "tone";
 * // create an autofilter and start it's LFO
 * const autoFilter = new AutoFilter("4n").toDestination().start();
 * // route an oscillator through the filter and start it
 * const oscillator = new Oscillator().connect(autoFilter).start();
 * @category Effect
 */
var AutoFilter = /** @class */ (function (_super) {
    tslib_1.__extends(AutoFilter, _super);
    function AutoFilter() {
        var _this = _super.call(this, optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"])) || this;
        _this.name = "AutoFilter";
        var options = optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]);
        _this.filter = new Filter(Object.assign(options.filter, {
            context: _this.context,
        }));
        // connections
        _this.connectEffect(_this.filter);
        _this._lfo.connect(_this.filter.frequency);
        _this.octaves = options.octaves;
        _this.baseFrequency = options.baseFrequency;
        return _this;
    }
    AutoFilter.getDefaults = function () {
        return Object.assign(LFOEffect.getDefaults(), {
            baseFrequency: 200,
            octaves: 2.6,
            filter: {
                type: "lowpass",
                rolloff: -12,
                Q: 1,
            }
        });
    };
    Object.defineProperty(AutoFilter.prototype, "baseFrequency", {
        /**
         * The minimum value of the filter's cutoff frequency.
         */
        get: function () {
            return this._lfo.min;
        },
        set: function (freq) {
            this._lfo.min = this.toFrequency(freq);
            // and set the max
            this.octaves = this._octaves;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoFilter.prototype, "octaves", {
        /**
         * The maximum value of the filter's cutoff frequency.
         */
        get: function () {
            return this._octaves;
        },
        set: function (oct) {
            this._octaves = oct;
            this._lfo.max = this._lfo.min * Math.pow(2, oct);
        },
        enumerable: true,
        configurable: true
    });
    AutoFilter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.filter.dispose();
        return this;
    };
    return AutoFilter;
}(LFOEffect));
export { AutoFilter };
//# sourceMappingURL=AutoFilter.js.map
import * as tslib_1 from "tslib";
import { Effect } from "./Effect";
import { Filter } from "../component/filter/Filter";
import { Follower } from "../component/analysis/Follower";
import { optionsFromArguments } from "../core/util/Defaults";
import { Gain } from "../core/context/Gain";
import { dbToGain, gainToDb } from "../core/type/Conversions";
import { ScaleExp } from "../signal/ScaleExp";
import { readOnly } from "../core/util/Interface";
/**
 * AutoWah connects a [[Follower]] to a [[Filter]].
 * The frequency of the filter, follows the input amplitude curve.
 * Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna).
 *
 * @example
 * import { AutoWah, Synth } from "tone";
 * const autoWah = new AutoWah(50, 6, -30).toDestination();
 * // initialize the synth and connect to autowah
 * const synth = new Synth().connect(autoWah);
 * // Q value influences the effect of the wah - default is 2
 * autoWah.Q.value = 6;
 * // more audible on higher notes
 * synth.triggerAttackRelease("C4", "8n");
 * @category Effect
 */
var AutoWah = /** @class */ (function (_super) {
    tslib_1.__extends(AutoWah, _super);
    function AutoWah() {
        var _this = _super.call(this, optionsFromArguments(AutoWah.getDefaults(), arguments, ["baseFrequency", "octaves", "sensitivity"])) || this;
        _this.name = "AutoWah";
        var options = optionsFromArguments(AutoWah.getDefaults(), arguments, ["baseFrequency", "octaves", "sensitivity"]);
        _this._follower = new Follower({
            context: _this.context,
            smoothing: options.follower,
        });
        _this._sweepRange = new ScaleExp({
            context: _this.context,
            min: 0,
            max: 1,
            exponent: 0.5,
        });
        _this._baseFrequency = _this.toFrequency(options.baseFrequency);
        _this._octaves = options.octaves;
        _this._inputBoost = new Gain({ context: _this.context });
        _this._bandpass = new Filter({
            context: _this.context,
            rolloff: -48,
            frequency: 0,
            Q: options.Q,
        });
        _this._peaking = new Filter({
            context: _this.context,
            type: "peaking"
        });
        _this._peaking.gain.value = options.gain;
        _this.gain = _this._peaking.gain;
        _this.Q = _this._bandpass.Q;
        // the control signal path
        _this.effectSend.chain(_this._inputBoost, _this._follower, _this._sweepRange);
        _this._sweepRange.connect(_this._bandpass.frequency);
        _this._sweepRange.connect(_this._peaking.frequency);
        // the filtered path
        _this.effectSend.chain(_this._bandpass, _this._peaking, _this.effectReturn);
        // set the initial value
        _this._setSweepRange();
        _this.sensitivity = options.sensitivity;
        readOnly(_this, ["gain", "Q"]);
        return _this;
    }
    AutoWah.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            baseFrequency: 100,
            octaves: 6,
            sensitivity: 0,
            Q: 2,
            gain: 2,
            follower: 0.2,
        });
    };
    Object.defineProperty(AutoWah.prototype, "octaves", {
        /**
         * The number of octaves that the filter will sweep above the baseFrequency.
         */
        get: function () {
            return this._octaves;
        },
        set: function (octaves) {
            this._octaves = octaves;
            this._setSweepRange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoWah.prototype, "follower", {
        /**
         * The follower's smoothing time
         */
        get: function () {
            return this._follower.smoothing;
        },
        set: function (follower) {
            this._follower.smoothing = follower;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoWah.prototype, "baseFrequency", {
        /**
         * The base frequency from which the sweep will start from.
         */
        get: function () {
            return this._baseFrequency;
        },
        set: function (baseFreq) {
            this._baseFrequency = this.toFrequency(baseFreq);
            this._setSweepRange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AutoWah.prototype, "sensitivity", {
        /**
         * The sensitivity to control how responsive to the input signal the filter is.
         */
        get: function () {
            return gainToDb(1 / this._inputBoost.gain.value);
        },
        set: function (sensitivity) {
            this._inputBoost.gain.value = 1 / dbToGain(sensitivity);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * sets the sweep range of the scaler
     */
    AutoWah.prototype._setSweepRange = function () {
        this._sweepRange.min = this._baseFrequency;
        this._sweepRange.max = Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2);
    };
    AutoWah.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._follower.dispose();
        this._sweepRange.dispose();
        this._bandpass.dispose();
        this._peaking.dispose();
        this._inputBoost.dispose();
        return this;
    };
    return AutoWah;
}(Effect));
export { AutoWah };
//# sourceMappingURL=AutoWah.js.map
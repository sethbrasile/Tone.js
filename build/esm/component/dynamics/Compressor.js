import * as tslib_1 from "tslib";
import { Param } from "../../core/context/Param";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
/**
 * Compressor is a thin wrapper around the Web Audio
 * [DynamicsCompressorNode](http://webaudio.github.io/web-audio-api/#the-dynamicscompressornode-interface).
 * Compression reduces the volume of loud sounds or amplifies quiet sounds
 * by narrowing or "compressing" an audio signal's dynamic range.
 * Read more on [Wikipedia](https://en.wikipedia.org/wiki/Dynamic_range_compression).
 * @example
 * import { Compressor } from "tone";
 * const comp = new Compressor(-30, 3);
 * @category Component
 */
var Compressor = /** @class */ (function (_super) {
    tslib_1.__extends(Compressor, _super);
    function Compressor() {
        var _this = _super.call(this, optionsFromArguments(Compressor.getDefaults(), arguments, ["threshold", "ratio"])) || this;
        _this.name = "Compressor";
        /**
         * the compressor node
         */
        _this._compressor = _this.context.createDynamicsCompressor();
        _this.input = _this._compressor;
        _this.output = _this._compressor;
        var options = optionsFromArguments(Compressor.getDefaults(), arguments, ["threshold", "ratio"]);
        _this.threshold = new Param({
            minValue: _this._compressor.threshold.minValue,
            maxValue: _this._compressor.threshold.maxValue,
            context: _this.context,
            convert: false,
            param: _this._compressor.threshold,
            units: "decibels",
            value: options.threshold,
        });
        _this.attack = new Param({
            minValue: _this._compressor.attack.minValue,
            maxValue: _this._compressor.attack.maxValue,
            context: _this.context,
            param: _this._compressor.attack,
            units: "time",
            value: options.attack,
        });
        _this.release = new Param({
            minValue: _this._compressor.release.minValue,
            maxValue: _this._compressor.release.maxValue,
            context: _this.context,
            param: _this._compressor.release,
            units: "time",
            value: options.release,
        });
        _this.knee = new Param({
            minValue: _this._compressor.knee.minValue,
            maxValue: _this._compressor.knee.maxValue,
            context: _this.context,
            convert: false,
            param: _this._compressor.knee,
            units: "decibels",
            value: options.knee,
        });
        _this.ratio = new Param({
            minValue: _this._compressor.ratio.minValue,
            maxValue: _this._compressor.ratio.maxValue,
            context: _this.context,
            convert: false,
            param: _this._compressor.ratio,
            units: "positive",
            value: options.ratio,
        });
        // set the defaults
        readOnly(_this, ["knee", "release", "attack", "ratio", "threshold"]);
        return _this;
    }
    Compressor.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            attack: 0.003,
            knee: 30,
            ratio: 12,
            release: 0.25,
            threshold: -24,
        });
    };
    Object.defineProperty(Compressor.prototype, "reduction", {
        /**
         * A read-only decibel value for metering purposes, representing the current amount of gain
         * reduction that the compressor is applying to the signal. If fed no signal the value will be 0 (no gain reduction).
         */
        get: function () {
            return this._compressor.reduction;
        },
        enumerable: true,
        configurable: true
    });
    Compressor.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._compressor.disconnect();
        this.attack.dispose();
        this.release.dispose();
        this.threshold.dispose();
        this.ratio.dispose();
        this.knee.dispose();
        return this;
    };
    return Compressor;
}(ToneAudioNode));
export { Compressor };
//# sourceMappingURL=Compressor.js.map
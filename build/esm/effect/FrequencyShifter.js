import * as tslib_1 from "tslib";
import { PhaseShiftAllpass } from "../component/filter/PhaseShiftAllpass";
import { optionsFromArguments } from "../core/util/Defaults";
import { Effect } from "../effect/Effect";
import { Add } from "../signal/Add";
import { Multiply } from "../signal/Multiply";
import { Negate } from "../signal/Negate";
import { Signal } from "../signal/Signal";
import { Oscillator } from "../source/oscillator/Oscillator";
import { ToneOscillatorNode } from "../source/oscillator/ToneOscillatorNode";
/**
 * FrequencyShifter can be used to shift all frequencies of a signal by a fixed amount.
 * The amount can be changed at audio rate and the effect is applied in real time.
 * The frequency shifting is implemented with a technique called single side band modulation using a ring modulator.
 * Note: Contrary to pitch shifting, all frequencies are shifted by the same amount,
 * destroying the harmonic relationship between them. This leads to the classic ring modulator timbre distortion.
 * The algorithm will produces some aliasing towards the high end, especially if your source material
 * contains a lot of high frequencies. Unfortunatelly the webaudio API does not support resampling
 * buffers in real time, so it is not possible to fix it properly. Depending on the use case it might
 * be an option to low pass filter your input before frequency shifting it to get ride of the aliasing.
 * You can find a very detailed description of the algorithm here: https://larzeitlin.github.io/RMFS/
 *
 * @example
 * import { FrequencyShifter, Oscillator } from "tone";
 * const input = new Oscillator(230, "sawtooth").start();
 * const shift = new FrequencyShifter(42).toDestination();
 * input.connect(shift);
 * @category Effect
 */
var FrequencyShifter = /** @class */ (function (_super) {
    tslib_1.__extends(FrequencyShifter, _super);
    function FrequencyShifter() {
        var _this = _super.call(this, optionsFromArguments(FrequencyShifter.getDefaults(), arguments, ["frequency"])) || this;
        _this.name = "FrequencyShifter";
        var options = optionsFromArguments(FrequencyShifter.getDefaults(), arguments, ["frequency"]);
        _this.frequency = new Signal({
            context: _this.context,
            units: "frequency",
            value: options.frequency,
            minValue: -_this.context.sampleRate / 2,
            maxValue: _this.context.sampleRate / 2,
        });
        _this._sine = new ToneOscillatorNode({
            context: _this.context,
            type: "sine",
        });
        _this._cosine = new Oscillator({
            context: _this.context,
            phase: -90,
            type: "sine",
        });
        _this._sineMultiply = new Multiply({ context: _this.context });
        _this._cosineMultiply = new Multiply({ context: _this.context });
        _this._negate = new Negate({ context: _this.context });
        _this._add = new Add({ context: _this.context });
        _this._phaseShifter = new PhaseShiftAllpass({ context: _this.context });
        _this.effectSend.connect(_this._phaseShifter);
        // connect the carrier frequency signal to the two oscillators
        _this.frequency.fan(_this._sine.frequency, _this._cosine.frequency);
        _this._phaseShifter.offset90.connect(_this._cosineMultiply);
        _this._cosine.connect(_this._cosineMultiply.factor);
        _this._phaseShifter.connect(_this._sineMultiply);
        _this._sine.connect(_this._sineMultiply.factor);
        _this._sineMultiply.connect(_this._negate);
        _this._cosineMultiply.connect(_this._add);
        _this._negate.connect(_this._add.addend);
        _this._add.connect(_this.effectReturn);
        // start the oscillators at the same time
        var now = _this.immediate();
        _this._sine.start(now);
        _this._cosine.start(now);
        return _this;
    }
    FrequencyShifter.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            frequency: 0,
        });
    };
    FrequencyShifter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.frequency.dispose();
        this._add.dispose();
        this._cosine.dispose();
        this._cosineMultiply.dispose();
        this._negate.dispose();
        this._phaseShifter.dispose();
        this._sine.dispose();
        this._sineMultiply.dispose();
        return this;
    };
    return FrequencyShifter;
}(Effect));
export { FrequencyShifter };
//# sourceMappingURL=FrequencyShifter.js.map
import * as tslib_1 from "tslib";
import { FeedbackEffect } from "./FeedbackEffect";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFO } from "../source/oscillator/LFO";
import { Delay } from "../core/context/Delay";
import { CrossFade } from "../component/channel/CrossFade";
import { Signal } from "../signal/Signal";
import { readOnly } from "../core/util/Interface";
import { intervalToFrequencyRatio } from "../core/type/Conversions";
/**
 * PitchShift does near-realtime pitch shifting to the incoming signal.
 * The effect is achieved by speeding up or slowing down the delayTime
 * of a DelayNode using a sawtooth wave.
 * Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf).
 * Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).
 * @category Effect
 */
var PitchShift = /** @class */ (function (_super) {
    tslib_1.__extends(PitchShift, _super);
    function PitchShift() {
        var _this = _super.call(this, optionsFromArguments(PitchShift.getDefaults(), arguments, ["pitch"])) || this;
        _this.name = "PitchShift";
        var options = optionsFromArguments(PitchShift.getDefaults(), arguments, ["pitch"]);
        _this._frequency = new Signal({ context: _this.context });
        _this._delayA = new Delay({
            maxDelay: 1,
            context: _this.context
        });
        _this._lfoA = new LFO({
            context: _this.context,
            min: 0,
            max: 0.1,
            type: "sawtooth"
        }).connect(_this._delayA.delayTime);
        _this._delayB = new Delay({
            maxDelay: 1,
            context: _this.context
        });
        _this._lfoB = new LFO({
            context: _this.context,
            min: 0,
            max: 0.1,
            type: "sawtooth",
            phase: 180
        }).connect(_this._delayB.delayTime);
        _this._crossFade = new CrossFade({ context: _this.context });
        _this._crossFadeLFO = new LFO({
            context: _this.context,
            min: 0,
            max: 1,
            type: "triangle",
            phase: 90
        }).connect(_this._crossFade.fade);
        _this._feedbackDelay = new Delay({
            delayTime: options.delayTime,
            context: _this.context,
        });
        _this.delayTime = _this._feedbackDelay.delayTime;
        readOnly(_this, "delayTime");
        _this._pitch = options.pitch;
        _this._windowSize = options.windowSize;
        // connect the two delay lines up
        _this._delayA.connect(_this._crossFade.a);
        _this._delayB.connect(_this._crossFade.b);
        // connect the frequency
        _this._frequency.fan(_this._lfoA.frequency, _this._lfoB.frequency, _this._crossFadeLFO.frequency);
        // route the input
        _this.effectSend.fan(_this._delayA, _this._delayB);
        _this._crossFade.chain(_this._feedbackDelay, _this.effectReturn);
        // start the LFOs at the same time
        var now = _this.now();
        _this._lfoA.start(now);
        _this._lfoB.start(now);
        _this._crossFadeLFO.start(now);
        // set the initial value
        _this.windowSize = _this._windowSize;
        return _this;
    }
    PitchShift.getDefaults = function () {
        return Object.assign(FeedbackEffect.getDefaults(), {
            pitch: 0,
            windowSize: 0.1,
            delayTime: 0,
            feedback: 0
        });
    };
    Object.defineProperty(PitchShift.prototype, "pitch", {
        /**
         * Repitch the incoming signal by some interval (measured in semi-tones).
         * @example
         * import { Oscillator, PitchShift } from "tone";
         * const pitchShift = new PitchShift().toDestination();
         * const osc = new Oscillator().connect(pitchShift).start().toDestination();
         * pitchShift.pitch = -12; // down one octave
         * pitchShift.pitch = 7; // up a fifth
         */
        get: function () {
            return this._pitch;
        },
        set: function (interval) {
            this._pitch = interval;
            var factor = 0;
            if (interval < 0) {
                this._lfoA.min = 0;
                this._lfoA.max = this._windowSize;
                this._lfoB.min = 0;
                this._lfoB.max = this._windowSize;
                factor = intervalToFrequencyRatio(interval - 1) + 1;
            }
            else {
                this._lfoA.min = this._windowSize;
                this._lfoA.max = 0;
                this._lfoB.min = this._windowSize;
                this._lfoB.max = 0;
                factor = intervalToFrequencyRatio(interval) - 1;
            }
            this._frequency.value = factor * (1.2 / this._windowSize);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PitchShift.prototype, "windowSize", {
        /**
         * The window size corresponds roughly to the sample length in a looping sampler.
         * Smaller values are desirable for a less noticeable delay time of the pitch shifted
         * signal, but larger values will result in smoother pitch shifting for larger intervals.
         * A nominal range of 0.03 to 0.1 is recommended.
         */
        get: function () {
            return this._windowSize;
        },
        set: function (size) {
            this._windowSize = this.toSeconds(size);
            this.pitch = this._pitch;
        },
        enumerable: true,
        configurable: true
    });
    PitchShift.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._frequency.dispose();
        this._delayA.dispose();
        this._delayB.dispose();
        this._lfoA.dispose();
        this._lfoB.dispose();
        this._crossFade.dispose();
        this._crossFadeLFO.dispose();
        this._feedbackDelay.dispose();
        return this;
    };
    return PitchShift;
}(FeedbackEffect));
export { PitchShift };
//# sourceMappingURL=PitchShift.js.map
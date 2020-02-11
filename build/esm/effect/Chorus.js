import * as tslib_1 from "tslib";
import { StereoFeedbackEffect } from "../effect/StereoFeedbackEffect";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFO } from "../source/oscillator/LFO";
import { Delay } from "../core/context/Delay";
import { readOnly } from "../core/util/Interface";
/**
 * Chorus is a stereo chorus effect composed of a left and right delay with an [[LFO]] applied to the delayTime of each channel.
 * When [[feedback]] is set to a value larger than 0, you also get Flanger-type effects.
 * Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna/blob/master/tuna.js).
 * Read more on the chorus effect on [SoundOnSound](http://www.soundonsound.com/sos/jun04/articles/synthsecrets.htm).
 *
 * @example
 * import { Chorus, PolySynth } from "tone";
 * const chorus = new Chorus(4, 2.5, 0.5);
 * const synth = new PolySynth().connect(chorus);
 * synth.triggerAttackRelease(["C3", "E3", "G3"], "8n");
 *
 * @category Effect
 */
var Chorus = /** @class */ (function (_super) {
    tslib_1.__extends(Chorus, _super);
    function Chorus() {
        var _this = _super.call(this, optionsFromArguments(Chorus.getDefaults(), arguments, ["frequency", "delayTime", "depth"])) || this;
        _this.name = "Chorus";
        var options = optionsFromArguments(Chorus.getDefaults(), arguments, ["frequency", "delayTime", "depth"]);
        _this._depth = options.depth;
        _this._delayTime = options.delayTime / 1000;
        _this._lfoL = new LFO({
            context: _this.context,
            frequency: options.frequency,
            min: 0,
            max: 1,
        });
        _this._lfoR = new LFO({
            context: _this.context,
            frequency: options.frequency,
            min: 0,
            max: 1,
            phase: 180
        });
        _this._delayNodeL = new Delay({ context: _this.context });
        _this._delayNodeR = new Delay({ context: _this.context });
        _this.frequency = _this._lfoL.frequency;
        readOnly(_this, ["frequency"]);
        // have one LFO frequency control the other
        _this._lfoL.frequency.connect(_this._lfoR.frequency);
        // connections
        _this.connectEffectLeft(_this._delayNodeL);
        _this.connectEffectRight(_this._delayNodeR);
        // lfo setup
        _this._lfoL.connect(_this._delayNodeL.delayTime);
        _this._lfoR.connect(_this._delayNodeR.delayTime);
        // set the initial values
        _this.depth = _this._depth;
        _this.type = options.type;
        _this.spread = options.spread;
        return _this;
    }
    Chorus.getDefaults = function () {
        return Object.assign(StereoFeedbackEffect.getDefaults(), {
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            type: "sine",
            spread: 180,
            feedback: 0,
            wet: 0.5,
        });
    };
    Object.defineProperty(Chorus.prototype, "depth", {
        /**
         * The depth of the effect. A depth of 1 makes the delayTime
         * modulate between 0 and 2*delayTime (centered around the delayTime).
         */
        get: function () {
            return this._depth;
        },
        set: function (depth) {
            this._depth = depth;
            var deviation = this._delayTime * depth;
            this._lfoL.min = Math.max(this._delayTime - deviation, 0);
            this._lfoL.max = this._delayTime + deviation;
            this._lfoR.min = Math.max(this._delayTime - deviation, 0);
            this._lfoR.max = this._delayTime + deviation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chorus.prototype, "delayTime", {
        /**
         * The delayTime in milliseconds of the chorus. A larger delayTime
         * will give a more pronounced effect. Nominal range a delayTime
         * is between 2 and 20ms.
         */
        get: function () {
            return this._delayTime * 1000;
        },
        set: function (delayTime) {
            this._delayTime = delayTime / 1000;
            this.depth = this._depth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chorus.prototype, "type", {
        /**
         * The oscillator type of the LFO.
         */
        get: function () {
            return this._lfoL.type;
        },
        set: function (type) {
            this._lfoL.type = type;
            this._lfoR.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chorus.prototype, "spread", {
        /**
         * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
         * When set to 180, LFO's will be panned hard left and right respectively.
         */
        get: function () {
            return this._lfoR.phase - this._lfoL.phase;
        },
        set: function (spread) {
            this._lfoL.phase = 90 - (spread / 2);
            this._lfoR.phase = (spread / 2) + 90;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Start the effect.
     */
    Chorus.prototype.start = function (time) {
        this._lfoL.start(time);
        this._lfoR.start(time);
        return this;
    };
    /**
     * Stop the lfo
     */
    Chorus.prototype.stop = function (time) {
        this._lfoL.stop(time);
        this._lfoR.stop(time);
        return this;
    };
    /**
     * Sync the filter to the transport. See [[LFO.sync]]
     */
    Chorus.prototype.sync = function () {
        this._lfoL.sync();
        this._lfoR.sync();
        return this;
    };
    /**
     * Unsync the filter from the transport.
     */
    Chorus.prototype.unsync = function () {
        this._lfoL.unsync();
        this._lfoR.unsync();
        return this;
    };
    Chorus.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._lfoL.dispose();
        this._lfoR.dispose();
        this._delayNodeL.dispose();
        this._delayNodeR.dispose();
        this.frequency.dispose();
        return this;
    };
    return Chorus;
}(StereoFeedbackEffect));
export { Chorus };
//# sourceMappingURL=Chorus.js.map
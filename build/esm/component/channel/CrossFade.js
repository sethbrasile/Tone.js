import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { connect, ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { GainToAudio } from "../../signal/GainToAudio";
import { Signal } from "../../signal/Signal";
/**
 * Tone.Crossfade provides equal power fading between two inputs.
 * More on crossfading technique [here](https://en.wikipedia.org/wiki/Fade_(audio_engineering)#Crossfading).
 * ```
 *                                             +---------+
 *                                            +> input a +>--+
 * +-----------+   +---------------------+     |         |   |
 * | 1s signal +>--> stereoPannerNode  L +>----> gain    |   |
 * +-----------+   |                     |     +---------+   |
 *               +-> pan               R +>-+                |   +--------+
 *               | +---------------------+  |                +---> output +>
 *  +------+     |                          |  +---------+   |   +--------+
 *  | fade +>----+                          | +> input b +>--+
 *  +------+                                |  |         |
 *                                          +--> gain    |
 *                                             +---------+
 * ```
 * @example
 * import { CrossFade, Oscillator } from "tone";
 * const crossFade = new CrossFade().toDestination();
 * // connect two inputs to a/b
 * const inputA = new Oscillator(440, "square").connect(crossFade.a).start();
 * const inputB = new Oscillator(440, "sine").connect(crossFade.b).start();
 * // use the fade to control the mix between the two
 * crossFade.fade.value = 0.5;
 * @category Component
 */
var CrossFade = /** @class */ (function (_super) {
    tslib_1.__extends(CrossFade, _super);
    function CrossFade() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(CrossFade.getDefaults(), arguments, ["fade"]))) || this;
        _this.name = "CrossFade";
        /**
         * The crossfading is done by a StereoPannerNode
         */
        _this._panner = _this.context.createStereoPanner();
        /**
         * Split the output of the panner node into two values used to control the gains.
         */
        _this._split = _this.context.createChannelSplitter(2);
        /**
         * Convert the fade value into an audio range value so it can be connected
         * to the panner.pan AudioParam
         */
        _this._g2a = new GainToAudio({ context: _this.context });
        /**
         * The input which is at full level when fade = 0
         */
        _this.a = new Gain({
            context: _this.context,
            gain: 0,
        });
        /**
         * The input which is at full level when fade = 1
         */
        _this.b = new Gain({
            context: _this.context,
            gain: 0,
        });
        /**
         * The output is a mix between `a` and `b` at the ratio of `fade`
         */
        _this.output = new Gain({ context: _this.context });
        _this._internalChannels = [_this.a, _this.b];
        var options = optionsFromArguments(CrossFade.getDefaults(), arguments, ["fade"]);
        _this.fade = new Signal({
            context: _this.context,
            units: "normalRange",
            value: options.fade,
        });
        readOnly(_this, "fade");
        _this.context.getConstant(1).connect(_this._panner);
        _this._panner.connect(_this._split);
        // this is necessary for standardized-audio-context
        // doesn't make any difference for the native AudioContext
        // https://github.com/chrisguttandin/standardized-audio-context/issues/647
        _this._panner.channelCount = 1;
        _this._panner.channelCountMode = "explicit";
        connect(_this._split, _this.a.gain, 0);
        connect(_this._split, _this.b.gain, 1);
        _this.fade.chain(_this._g2a, _this._panner.pan);
        _this.a.connect(_this.output);
        _this.b.connect(_this.output);
        return _this;
    }
    CrossFade.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            fade: 0.5,
        });
    };
    CrossFade.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.a.dispose();
        this.b.dispose();
        this.output.dispose();
        this.fade.dispose();
        this._g2a.dispose();
        this._panner.disconnect();
        this._split.disconnect();
        return this;
    };
    return CrossFade;
}(ToneAudioNode));
export { CrossFade };
//# sourceMappingURL=CrossFade.js.map
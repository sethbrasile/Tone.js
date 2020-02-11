import * as tslib_1 from "tslib";
import { Effect } from "./Effect";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFO } from "../source/oscillator/LFO";
import { Delay } from "../core/context/Delay";
import { readOnly } from "../core/util/Interface";
/**
 * A Vibrato effect composed of a Tone.Delay and a Tone.LFO. The LFO
 * modulates the delayTime of the delay, causing the pitch to rise and fall.
 * @category Effect
 */
var Vibrato = /** @class */ (function (_super) {
    tslib_1.__extends(Vibrato, _super);
    function Vibrato() {
        var _this = _super.call(this, optionsFromArguments(Vibrato.getDefaults(), arguments, ["frequency", "depth"])) || this;
        _this.name = "Vibrato";
        var options = optionsFromArguments(Vibrato.getDefaults(), arguments, ["frequency", "depth"]);
        _this._delayNode = new Delay({
            context: _this.context,
            delayTime: 0,
            maxDelay: options.maxDelay,
        });
        _this._lfo = new LFO({
            context: _this.context,
            type: options.type,
            min: 0,
            max: options.maxDelay,
            frequency: options.frequency,
            phase: -90 // offse the phase so the resting position is in the center
        }).start().connect(_this._delayNode.delayTime);
        _this.frequency = _this._lfo.frequency;
        _this.depth = _this._lfo.amplitude;
        _this.depth.value = options.depth;
        readOnly(_this, ["frequency", "depth"]);
        _this.effectSend.chain(_this._delayNode, _this.effectReturn);
        return _this;
    }
    Vibrato.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            maxDelay: 0.005,
            frequency: 5,
            depth: 0.1,
            type: "sine"
        });
    };
    Object.defineProperty(Vibrato.prototype, "type", {
        /**
         * Type of oscillator attached to the Vibrato.
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
    Vibrato.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._delayNode.dispose();
        this._lfo.dispose();
        this.frequency.dispose();
        this.depth.dispose();
        return this;
    };
    return Vibrato;
}(Effect));
export { Vibrato };
//# sourceMappingURL=Vibrato.js.map
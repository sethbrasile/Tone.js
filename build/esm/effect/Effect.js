import * as tslib_1 from "tslib";
import { CrossFade } from "../component/channel/CrossFade";
import { Gain } from "../core/context/Gain";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { readOnly } from "../core/util/Interface";
/**
 * Effect is the base class for effects. Connect the effect between
 * the effectSend and effectReturn GainNodes, then control the amount of
 * effect which goes to the output using the wet control.
 */
var Effect = /** @class */ (function (_super) {
    tslib_1.__extends(Effect, _super);
    function Effect(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "Effect";
        /**
         * the drywet knob to control the amount of effect
         */
        _this._dryWet = new CrossFade({ context: _this.context });
        /**
         * The wet control is how much of the effected
         * will pass through to the output. 1 = 100% effected
         * signal, 0 = 100% dry signal.
         */
        _this.wet = _this._dryWet.fade;
        /**
         * connect the effectSend to the input of hte effect
         */
        _this.effectSend = new Gain({ context: _this.context });
        /**
         * connect the output of the effect to the effectReturn
         */
        _this.effectReturn = new Gain({ context: _this.context });
        /**
         * The effect input node
         */
        _this.input = new Gain({ context: _this.context });
        /**
         * The effect output
         */
        _this.output = _this._dryWet;
        // connections
        _this.input.fan(_this._dryWet.a, _this.effectSend);
        _this.effectReturn.connect(_this._dryWet.b);
        _this.wet.setValueAtTime(options.wet, 0);
        _this._internalChannels = [_this.effectReturn, _this.effectSend];
        readOnly(_this, "wet");
        return _this;
    }
    Effect.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            wet: 1,
        });
    };
    /**
     * chains the effect in between the effectSend and effectReturn
     */
    Effect.prototype.connectEffect = function (effect) {
        // add it to the internal channels
        this._internalChannels.push(effect);
        this.effectSend.chain(effect, this.effectReturn);
        return this;
    };
    Effect.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._dryWet.dispose();
        this.effectSend.dispose();
        this.effectReturn.dispose();
        this.wet.dispose();
        return this;
    };
    return Effect;
}(ToneAudioNode));
export { Effect };
//# sourceMappingURL=Effect.js.map
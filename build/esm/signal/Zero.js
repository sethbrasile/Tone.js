import * as tslib_1 from "tslib";
import { Gain } from "../core/context/Gain";
import { connect, disconnect } from "../core/context/ToneAudioNode";
import { optionsFromArguments } from "../core/util/Defaults";
import { SignalOperator } from "./SignalOperator";
/**
 * Tone.Zero outputs 0's at audio-rate. The reason this has to be
 * it's own class is that many browsers optimize out Tone.Signal
 * with a value of 0 and will not process nodes further down the graph.
 * @category Signal
 */
var Zero = /** @class */ (function (_super) {
    tslib_1.__extends(Zero, _super);
    function Zero() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Zero.getDefaults(), arguments))) || this;
        _this.name = "Zero";
        /**
         * The gain node which connects the constant source to the output
         */
        _this._gain = new Gain({ context: _this.context });
        /**
         * Only outputs 0
         */
        _this.output = _this._gain;
        /**
         * no input node
         */
        _this.input = undefined;
        connect(_this.context.getConstant(0), _this._gain);
        return _this;
    }
    /**
     * clean up
     */
    Zero.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        disconnect(this.context.getConstant(0), this._gain);
        return this;
    };
    return Zero;
}(SignalOperator));
export { Zero };
//# sourceMappingURL=Zero.js.map
import * as tslib_1 from "tslib";
import { optionsFromArguments } from "../core/util/Defaults";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { connectSignal } from "./Signal";
/**
 * A signal operator has an input and output and modifies the signal.
 */
var SignalOperator = /** @class */ (function (_super) {
    tslib_1.__extends(SignalOperator, _super);
    function SignalOperator() {
        return _super.call(this, Object.assign(optionsFromArguments(SignalOperator.getDefaults(), arguments, ["context"]))) || this;
    }
    SignalOperator.prototype.connect = function (destination, outputNum, inputNum) {
        if (outputNum === void 0) { outputNum = 0; }
        if (inputNum === void 0) { inputNum = 0; }
        connectSignal(this, destination, outputNum, inputNum);
        return this;
    };
    return SignalOperator;
}(ToneAudioNode));
export { SignalOperator };
//# sourceMappingURL=SignalOperator.js.map
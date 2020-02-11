import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { TimeClass } from "./Time";
/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
var TransportTimeClass = /** @class */ (function (_super) {
    tslib_1.__extends(TransportTimeClass, _super);
    function TransportTimeClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "TransportTime";
        return _this;
    }
    /**
     * Return the current time in whichever context is relevant
     */
    TransportTimeClass.prototype._now = function () {
        return this.context.transport.seconds;
    };
    return TransportTimeClass;
}(TimeClass));
export { TransportTimeClass };
/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to [[Time]], but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
export function TransportTime(value, units) {
    return new TransportTimeClass(getContext(), value, units);
}
//# sourceMappingURL=TransportTime.js.map
import * as tslib_1 from "tslib";
import { Timeline } from "./Timeline";
import { Tone } from "../Tone";
/**
 * Represents a single value which is gettable and settable in a timed way
 */
var TimelineValue = /** @class */ (function (_super) {
    tslib_1.__extends(TimelineValue, _super);
    /**
     * @param initialValue The value to return if there is no scheduled values
     */
    function TimelineValue(initialValue) {
        var _this = _super.call(this) || this;
        _this.name = "TimelineValue";
        /**
         * The timeline which stores the values
         */
        _this._timeline = new Timeline({ memory: 10 });
        _this._initialValue = initialValue;
        return _this;
    }
    /**
     * Set the value at the given time
     */
    TimelineValue.prototype.set = function (value, time) {
        this._timeline.add({
            value: value, time: time
        });
        return this;
    };
    /**
     * Get the value at the given time
     */
    TimelineValue.prototype.get = function (time) {
        var event = this._timeline.get(time);
        if (event) {
            return event.value;
        }
        else {
            return this._initialValue;
        }
    };
    return TimelineValue;
}(Tone));
export { TimelineValue };
//# sourceMappingURL=TimelineValue.js.map
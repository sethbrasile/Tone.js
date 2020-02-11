import * as tslib_1 from "tslib";
import { Timeline } from "./Timeline";
import { assertRange } from "./Debug";
/**
 * A Timeline State. Provides the methods: `setStateAtTime("state", time)` and `getValueAtTime(time)`
 * @param initial The initial state of the StateTimeline.  Defaults to `undefined`
 */
var StateTimeline = /** @class */ (function (_super) {
    tslib_1.__extends(StateTimeline, _super);
    function StateTimeline(initial) {
        if (initial === void 0) { initial = "stopped"; }
        var _this = _super.call(this) || this;
        _this.name = "StateTimeline";
        _this._initial = initial;
        _this.setStateAtTime(_this._initial, 0);
        return _this;
    }
    /**
     * Returns the scheduled state scheduled before or at
     * the given time.
     * @param  time  The time to query.
     * @return  The name of the state input in setStateAtTime.
     */
    StateTimeline.prototype.getValueAtTime = function (time) {
        var event = this.get(time);
        if (event !== null) {
            return event.state;
        }
        else {
            return this._initial;
        }
    };
    /**
     * Add a state to the timeline.
     * @param  state The name of the state to set.
     * @param  time  The time to query.
     * @param options Any additional options that are needed in the timeline.
     */
    StateTimeline.prototype.setStateAtTime = function (state, time, options) {
        assertRange(time, 0);
        this.add(Object.assign({}, options, {
            state: state,
            time: time,
        }));
        return this;
    };
    /**
     * Return the event before the time with the given state
     * @param  state The state to look for
     * @param  time  When to check before
     * @return  The event with the given state before the time
     */
    StateTimeline.prototype.getLastState = function (state, time) {
        // time = this.toSeconds(time);
        var index = this._search(time);
        for (var i = index; i >= 0; i--) {
            var event_1 = this._timeline[i];
            if (event_1.state === state) {
                return event_1;
            }
        }
    };
    /**
     * Return the event after the time with the given state
     * @param  state The state to look for
     * @param  time  When to check from
     * @return  The event with the given state after the time
     */
    StateTimeline.prototype.getNextState = function (state, time) {
        // time = this.toSeconds(time);
        var index = this._search(time);
        if (index !== -1) {
            for (var i = index; i < this._timeline.length; i++) {
                var event_2 = this._timeline[i];
                if (event_2.state === state) {
                    return event_2;
                }
            }
        }
    };
    return StateTimeline;
}(Timeline));
export { StateTimeline };
//# sourceMappingURL=StateTimeline.js.map
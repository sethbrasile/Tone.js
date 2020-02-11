import * as tslib_1 from "tslib";
import { Tone } from "../Tone";
import { optionsFromArguments } from "./Defaults";
import { assert } from "./Debug";
import { EQ, GT, GTE, LT } from "./Math";
/**
 * A Timeline class for scheduling and maintaining state
 * along a timeline. All events must have a "time" property.
 * Internally, events are stored in time order for fast
 * retrieval.
 */
var Timeline = /** @class */ (function (_super) {
    tslib_1.__extends(Timeline, _super);
    function Timeline() {
        var _this = _super.call(this) || this;
        _this.name = "Timeline";
        /**
         * The array of scheduled timeline events
         */
        _this._timeline = [];
        var options = optionsFromArguments(Timeline.getDefaults(), arguments, ["memory"]);
        _this.memory = options.memory;
        _this.increasing = options.increasing;
        return _this;
    }
    Timeline.getDefaults = function () {
        return {
            memory: Infinity,
            increasing: false,
        };
    };
    Object.defineProperty(Timeline.prototype, "length", {
        /**
         * The number of items in the timeline.
         */
        get: function () {
            return this._timeline.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Insert an event object onto the timeline. Events must have a "time" attribute.
     * @param event  The event object to insert into the timeline.
     */
    Timeline.prototype.add = function (event) {
        // the event needs to have a time attribute
        assert(Reflect.has(event, "time"), "Timeline: events must have a time attribute");
        event.time = event.time.valueOf();
        if (this.increasing && this.length) {
            var lastValue = this._timeline[this.length - 1];
            assert(GTE(event.time, lastValue.time), "The time must be greater than or equal to the last scheduled time");
            this._timeline.push(event);
        }
        else {
            var index = this._search(event.time);
            this._timeline.splice(index + 1, 0, event);
        }
        // if the length is more than the memory, remove the previous ones
        if (this.length > this.memory) {
            var diff = this.length - this.memory;
            this._timeline.splice(0, diff);
        }
        return this;
    };
    /**
     * Remove an event from the timeline.
     * @param  {Object}  event  The event object to remove from the list.
     * @returns {Timeline} this
     */
    Timeline.prototype.remove = function (event) {
        var index = this._timeline.indexOf(event);
        if (index !== -1) {
            this._timeline.splice(index, 1);
        }
        return this;
    };
    /**
     * Get the nearest event whose time is less than or equal to the given time.
     * @param  time  The time to query.
     */
    Timeline.prototype.get = function (time, param) {
        if (param === void 0) { param = "time"; }
        var index = this._search(time, param);
        if (index !== -1) {
            return this._timeline[index];
        }
        else {
            return null;
        }
    };
    /**
     * Return the first event in the timeline without removing it
     * @returns {Object} The first event object
     */
    Timeline.prototype.peek = function () {
        return this._timeline[0];
    };
    /**
     * Return the first event in the timeline and remove it
     */
    Timeline.prototype.shift = function () {
        return this._timeline.shift();
    };
    /**
     * Get the event which is scheduled after the given time.
     * @param  time  The time to query.
     */
    Timeline.prototype.getAfter = function (time, param) {
        if (param === void 0) { param = "time"; }
        var index = this._search(time, param);
        if (index + 1 < this._timeline.length) {
            return this._timeline[index + 1];
        }
        else {
            return null;
        }
    };
    /**
     * Get the event before the event at the given time.
     * @param  time  The time to query.
     */
    Timeline.prototype.getBefore = function (time) {
        var len = this._timeline.length;
        // if it's after the last item, return the last item
        if (len > 0 && this._timeline[len - 1].time < time) {
            return this._timeline[len - 1];
        }
        var index = this._search(time);
        if (index - 1 >= 0) {
            return this._timeline[index - 1];
        }
        else {
            return null;
        }
    };
    /**
     * Cancel events at and after the given time
     * @param  after  The time to query.
     */
    Timeline.prototype.cancel = function (after) {
        if (this._timeline.length > 1) {
            var index = this._search(after);
            if (index >= 0) {
                if (EQ(this._timeline[index].time, after)) {
                    // get the first item with that time
                    for (var i = index; i >= 0; i--) {
                        if (EQ(this._timeline[i].time, after)) {
                            index = i;
                        }
                        else {
                            break;
                        }
                    }
                    this._timeline = this._timeline.slice(0, index);
                }
                else {
                    this._timeline = this._timeline.slice(0, index + 1);
                }
            }
            else {
                this._timeline = [];
            }
        }
        else if (this._timeline.length === 1) {
            // the first item's time
            if (GTE(this._timeline[0].time, after)) {
                this._timeline = [];
            }
        }
        return this;
    };
    /**
     * Cancel events before or equal to the given time.
     * @param  time  The time to cancel before.
     */
    Timeline.prototype.cancelBefore = function (time) {
        var index = this._search(time);
        if (index >= 0) {
            this._timeline = this._timeline.slice(index + 1);
        }
        return this;
    };
    /**
     * Returns the previous event if there is one. null otherwise
     * @param  event The event to find the previous one of
     * @return The event right before the given event
     */
    Timeline.prototype.previousEvent = function (event) {
        var index = this._timeline.indexOf(event);
        if (index > 0) {
            return this._timeline[index - 1];
        }
        else {
            return null;
        }
    };
    /**
     * Does a binary search on the timeline array and returns the
     * nearest event index whose time is after or equal to the given time.
     * If a time is searched before the first index in the timeline, -1 is returned.
     * If the time is after the end, the index of the last item is returned.
     * @param  time
     */
    Timeline.prototype._search = function (time, param) {
        if (param === void 0) { param = "time"; }
        if (this._timeline.length === 0) {
            return -1;
        }
        var beginning = 0;
        var len = this._timeline.length;
        var end = len;
        if (len > 0 && this._timeline[len - 1][param] <= time) {
            return len - 1;
        }
        while (beginning < end) {
            // calculate the midpoint for roughly equal partition
            var midPoint = Math.floor(beginning + (end - beginning) / 2);
            var event_1 = this._timeline[midPoint];
            var nextEvent = this._timeline[midPoint + 1];
            if (EQ(event_1[param], time)) {
                // choose the last one that has the same time
                for (var i = midPoint; i < this._timeline.length; i++) {
                    var testEvent = this._timeline[i];
                    if (EQ(testEvent[param], time)) {
                        midPoint = i;
                    }
                }
                return midPoint;
            }
            else if (LT(event_1[param], time) && GT(nextEvent[param], time)) {
                return midPoint;
            }
            else if (GT(event_1[param], time)) {
                // search lower
                end = midPoint;
            }
            else {
                // search upper
                beginning = midPoint + 1;
            }
        }
        return -1;
    };
    /**
     * Internal iterator. Applies extra safety checks for
     * removing items from the array.
     */
    Timeline.prototype._iterate = function (callback, lowerBound, upperBound) {
        if (lowerBound === void 0) { lowerBound = 0; }
        if (upperBound === void 0) { upperBound = this._timeline.length - 1; }
        this._timeline.slice(lowerBound, upperBound + 1).forEach(callback);
    };
    /**
     * Iterate over everything in the array
     * @param  callback The callback to invoke with every item
     */
    Timeline.prototype.forEach = function (callback) {
        this._iterate(callback);
        return this;
    };
    /**
     * Iterate over everything in the array at or before the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    Timeline.prototype.forEachBefore = function (time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        var upperBound = this._search(time);
        if (upperBound !== -1) {
            this._iterate(callback, 0, upperBound);
        }
        return this;
    };
    /**
     * Iterate over everything in the array after the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    Timeline.prototype.forEachAfter = function (time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        var lowerBound = this._search(time);
        this._iterate(callback, lowerBound + 1);
        return this;
    };
    /**
     * Iterate over everything in the array between the startTime and endTime.
     * The timerange is inclusive of the startTime, but exclusive of the endTime.
     * range = [startTime, endTime).
     * @param  startTime The time to check if items are before
     * @param  endTime The end of the test interval.
     * @param  callback The callback to invoke with every item
     */
    Timeline.prototype.forEachBetween = function (startTime, endTime, callback) {
        var lowerBound = this._search(startTime);
        var upperBound = this._search(endTime);
        if (lowerBound !== -1 && upperBound !== -1) {
            if (this._timeline[lowerBound].time !== startTime) {
                lowerBound += 1;
            }
            // exclusive of the end time
            if (this._timeline[upperBound].time === endTime) {
                upperBound -= 1;
            }
            this._iterate(callback, lowerBound, upperBound);
        }
        else if (lowerBound === -1) {
            this._iterate(callback, 0, upperBound);
        }
        return this;
    };
    /**
     * Iterate over everything in the array at or after the given time. Similar to
     * forEachAfter, but includes the item(s) at the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    Timeline.prototype.forEachFrom = function (time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        var lowerBound = this._search(time);
        // work backwards until the event time is less than time
        while (lowerBound >= 0 && this._timeline[lowerBound].time >= time) {
            lowerBound--;
        }
        this._iterate(callback, lowerBound + 1);
        return this;
    };
    /**
     * Iterate over everything in the array at the given time
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    Timeline.prototype.forEachAtTime = function (time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        var upperBound = this._search(time);
        if (upperBound !== -1) {
            this._iterate(function (event) {
                if (event.time === time) {
                    callback(event);
                }
            }, 0, upperBound);
        }
        return this;
    };
    /**
     * Clean up.
     */
    Timeline.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._timeline = [];
        return this;
    };
    return Timeline;
}(Tone));
export { Timeline };
//# sourceMappingURL=Timeline.js.map
import * as tslib_1 from "tslib";
import { dbToGain, gainToDb } from "../type/Conversions";
import { isAudioParam } from "../util/AdvancedTypeCheck";
import { optionsFromArguments } from "../util/Defaults";
import { Timeline } from "../util/Timeline";
import { isDefined } from "../util/TypeCheck";
import { ToneWithContext } from "./ToneWithContext";
import { EQ } from "../util/Math";
import { assert, assertRange } from "../util/Debug";
/**
 * Param wraps the native Web Audio's AudioParam to provide
 * additional unit conversion functionality. It also
 * serves as a base-class for classes which have a single,
 * automatable parameter.
 */
var Param = /** @class */ (function (_super) {
    tslib_1.__extends(Param, _super);
    function Param() {
        var _this = _super.call(this, optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"])) || this;
        _this.name = "Param";
        _this.overridden = false;
        /**
         * The minimum output value
         */
        _this._minOutput = 1e-7;
        var options = optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]);
        assert(isDefined(options.param) &&
            (isAudioParam(options.param) || options.param instanceof Param), "param must be an AudioParam");
        while (!isAudioParam(options.param)) {
            options.param = options.param._param;
        }
        _this._swappable = isDefined(options.swappable) ? options.swappable : false;
        if (_this._swappable) {
            _this.input = _this.context.createGain();
            // initialize
            _this._param = options.param;
            _this.input.connect(_this._param);
        }
        else {
            _this._param = _this.input = options.param;
        }
        _this._events = new Timeline(1000);
        _this._initialValue = _this._param.defaultValue;
        _this.units = options.units;
        _this.convert = options.convert;
        _this._minValue = options.minValue;
        _this._maxValue = options.maxValue;
        // if the value is defined, set it immediately
        if (isDefined(options.value) && options.value !== _this._toType(_this._initialValue)) {
            _this.setValueAtTime(options.value, 0);
        }
        return _this;
    }
    Param.getDefaults = function () {
        return Object.assign(ToneWithContext.getDefaults(), {
            convert: true,
            units: "number",
        });
    };
    Object.defineProperty(Param.prototype, "value", {
        get: function () {
            var now = this.now();
            return this.getValueAtTime(now);
        },
        set: function (value) {
            this.cancelScheduledValues(this.now());
            this.setValueAtTime(value, this.now());
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Param.prototype, "minValue", {
        get: function () {
            // if it's not the default minValue, return it
            if (isDefined(this._minValue)) {
                return this._minValue;
            }
            else if (this.units === "time" || this.units === "frequency" ||
                this.units === "normalRange" || this.units === "positive" ||
                this.units === "transportTime" || this.units === "ticks" ||
                this.units === "bpm" || this.units === "hertz" || this.units === "samples") {
                return 0;
            }
            else if (this.units === "audioRange") {
                return -1;
            }
            else if (this.units === "decibels") {
                return -Infinity;
            }
            else {
                return this._param.minValue;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Param.prototype, "maxValue", {
        get: function () {
            if (isDefined(this._maxValue)) {
                return this._maxValue;
            }
            else if (this.units === "normalRange" ||
                this.units === "audioRange") {
                return 1;
            }
            else {
                return this._param.maxValue;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Type guard based on the unit name
     */
    Param.prototype._is = function (arg, type) {
        return this.units === type;
    };
    /**
     * Make sure the value is always in the defined range
     */
    Param.prototype._assertRange = function (value) {
        if (isDefined(this.maxValue) && isDefined(this.minValue)) {
            assertRange(value, this._fromType(this.minValue), this._fromType(this.maxValue));
        }
        return value;
    };
    /**
     * Convert the given value from the type specified by Param.units
     * into the destination value (such as Gain or Frequency).
     */
    Param.prototype._fromType = function (val) {
        if (this.convert && !this.overridden) {
            if (this._is(val, "time")) {
                return this.toSeconds(val);
            }
            else if (this._is(val, "decibels")) {
                return dbToGain(val);
            }
            else if (this._is(val, "frequency")) {
                return this.toFrequency(val);
            }
            else {
                return val;
            }
        }
        else if (this.overridden) {
            // if it's overridden, should only schedule 0s
            return 0;
        }
        else {
            return val;
        }
    };
    /**
     * Convert the parameters value into the units specified by Param.units.
     */
    Param.prototype._toType = function (val) {
        if (this.convert && this.units === "decibels") {
            return gainToDb(val);
        }
        else {
            return val;
        }
    };
    //-------------------------------------
    // ABSTRACT PARAM INTERFACE
    // all docs are generated from ParamInterface.ts
    //-------------------------------------
    Param.prototype.setValueAtTime = function (value, time) {
        var computedTime = this.toSeconds(time);
        var numericValue = this._fromType(value);
        assert(isFinite(numericValue) && isFinite(computedTime), "Invalid argument(s) to setValueAtTime: " + JSON.stringify(value) + ", " + JSON.stringify(time));
        this._assertRange(numericValue);
        this.log(this.units, "setValueAtTime", value, computedTime);
        this._events.add({
            time: computedTime,
            type: "setValueAtTime",
            value: numericValue,
        });
        this._param.setValueAtTime(numericValue, computedTime);
        return this;
    };
    Param.prototype.getValueAtTime = function (time) {
        var computedTime = Math.max(this.toSeconds(time), 0);
        var after = this._events.getAfter(computedTime);
        var before = this._events.get(computedTime);
        var value = this._initialValue;
        // if it was set by
        if (before === null) {
            value = this._initialValue;
        }
        else if (before.type === "setTargetAtTime" && (after === null || after.type === "setValueAtTime")) {
            var previous = this._events.getBefore(before.time);
            var previousVal = void 0;
            if (previous === null) {
                previousVal = this._initialValue;
            }
            else {
                previousVal = previous.value;
            }
            if (before.type === "setTargetAtTime") {
                value = this._exponentialApproach(before.time, previousVal, before.value, before.constant, computedTime);
            }
        }
        else if (after === null) {
            value = before.value;
        }
        else if (after.type === "linearRampToValueAtTime" || after.type === "exponentialRampToValueAtTime") {
            var beforeValue = before.value;
            if (before.type === "setTargetAtTime") {
                var previous = this._events.getBefore(before.time);
                if (previous === null) {
                    beforeValue = this._initialValue;
                }
                else {
                    beforeValue = previous.value;
                }
            }
            if (after.type === "linearRampToValueAtTime") {
                value = this._linearInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
            }
            else {
                value = this._exponentialInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
            }
        }
        else {
            value = before.value;
        }
        return this._toType(value);
    };
    Param.prototype.setRampPoint = function (time) {
        time = this.toSeconds(time);
        var currentVal = this.getValueAtTime(time);
        this.cancelAndHoldAtTime(time);
        if (this._fromType(currentVal) === 0) {
            currentVal = this._toType(this._minOutput);
        }
        this.setValueAtTime(currentVal, time);
        return this;
    };
    Param.prototype.linearRampToValueAtTime = function (value, endTime) {
        var numericValue = this._fromType(value);
        var computedTime = this.toSeconds(endTime);
        assert(isFinite(numericValue) && isFinite(computedTime), "Invalid argument(s) to linearRampToValueAtTime: " + JSON.stringify(value) + ", " + JSON.stringify(endTime));
        this._assertRange(numericValue);
        this._events.add({
            time: computedTime,
            type: "linearRampToValueAtTime",
            value: numericValue,
        });
        this.log(this.units, "linearRampToValueAtTime", value, computedTime);
        this._param.linearRampToValueAtTime(numericValue, computedTime);
        return this;
    };
    Param.prototype.exponentialRampToValueAtTime = function (value, endTime) {
        var numericValue = this._fromType(value);
        numericValue = Math.max(this._minOutput, numericValue);
        this._assertRange(numericValue);
        var computedTime = this.toSeconds(endTime);
        assert(isFinite(numericValue) && isFinite(computedTime), "Invalid argument(s) to exponentialRampToValueAtTime: " + JSON.stringify(value) + ", " + JSON.stringify(endTime));
        // store the event
        this._events.add({
            time: computedTime,
            type: "exponentialRampToValueAtTime",
            value: numericValue,
        });
        this.log(this.units, "exponentialRampToValueAtTime", value, computedTime);
        this._param.exponentialRampToValueAtTime(numericValue, computedTime);
        return this;
    };
    Param.prototype.exponentialRampTo = function (value, rampTime, startTime) {
        startTime = this.toSeconds(startTime);
        this.setRampPoint(startTime);
        this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
        return this;
    };
    Param.prototype.linearRampTo = function (value, rampTime, startTime) {
        startTime = this.toSeconds(startTime);
        this.setRampPoint(startTime);
        this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
        return this;
    };
    Param.prototype.targetRampTo = function (value, rampTime, startTime) {
        startTime = this.toSeconds(startTime);
        this.setRampPoint(startTime);
        this.exponentialApproachValueAtTime(value, startTime, rampTime);
        return this;
    };
    Param.prototype.exponentialApproachValueAtTime = function (value, time, rampTime) {
        time = this.toSeconds(time);
        rampTime = this.toSeconds(rampTime);
        var timeConstant = Math.log(rampTime + 1) / Math.log(200);
        this.setTargetAtTime(value, time, timeConstant);
        // at 90% start a linear ramp to the final value
        this.cancelAndHoldAtTime(time + rampTime * 0.9);
        this.linearRampToValueAtTime(value, time + rampTime);
        return this;
    };
    Param.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
        var numericValue = this._fromType(value);
        // The value will never be able to approach without timeConstant > 0.
        assert(isFinite(timeConstant) && timeConstant > 0, "timeConstant must be a number greater than 0");
        var computedTime = this.toSeconds(startTime);
        this._assertRange(numericValue);
        assert(isFinite(numericValue) && isFinite(computedTime), "Invalid argument(s) to setTargetAtTime: " + JSON.stringify(value) + ", " + JSON.stringify(startTime));
        this._events.add({
            constant: timeConstant,
            time: computedTime,
            type: "setTargetAtTime",
            value: numericValue,
        });
        this.log(this.units, "setTargetAtTime", value, computedTime, timeConstant);
        this._param.setTargetAtTime(numericValue, computedTime, timeConstant);
        return this;
    };
    Param.prototype.setValueCurveAtTime = function (values, startTime, duration, scaling) {
        if (scaling === void 0) { scaling = 1; }
        duration = this.toSeconds(duration);
        startTime = this.toSeconds(startTime);
        var startingValue = this._fromType(values[0]) * scaling;
        this.setValueAtTime(this._toType(startingValue), startTime);
        var segTime = duration / (values.length - 1);
        for (var i = 1; i < values.length; i++) {
            var numericValue = this._fromType(values[i]) * scaling;
            this.linearRampToValueAtTime(this._toType(numericValue), startTime + i * segTime);
        }
        return this;
    };
    Param.prototype.cancelScheduledValues = function (time) {
        var computedTime = this.toSeconds(time);
        assert(isFinite(computedTime), "Invalid argument to cancelScheduledValues: " + JSON.stringify(time));
        this._events.cancel(computedTime);
        this._param.cancelScheduledValues(computedTime);
        this.log(this.units, "cancelScheduledValues", computedTime);
        return this;
    };
    Param.prototype.cancelAndHoldAtTime = function (time) {
        var computedTime = this.toSeconds(time);
        var valueAtTime = this._fromType(this.getValueAtTime(computedTime));
        // remove the schedule events
        assert(isFinite(computedTime), "Invalid argument to cancelAndHoldAtTime: " + JSON.stringify(time));
        this.log(this.units, "cancelAndHoldAtTime", computedTime, "value=" + valueAtTime);
        // if there is an event at the given computedTime
        // and that even is not a "set"
        var before = this._events.get(computedTime);
        var after = this._events.getAfter(computedTime);
        if (before && EQ(before.time, computedTime)) {
            // remove everything after
            if (after) {
                this._param.cancelScheduledValues(after.time);
                this._events.cancel(after.time);
            }
            else {
                this._param.cancelAndHoldAtTime(computedTime);
                this._events.cancel(computedTime + this.sampleTime);
            }
        }
        else if (after) {
            this._param.cancelScheduledValues(after.time);
            // cancel the next event(s)
            this._events.cancel(after.time);
            if (after.type === "linearRampToValueAtTime") {
                this.linearRampToValueAtTime(this._toType(valueAtTime), computedTime);
            }
            else if (after.type === "exponentialRampToValueAtTime") {
                this.exponentialRampToValueAtTime(this._toType(valueAtTime), computedTime);
            }
        }
        // set the value at the given time
        this._events.add({
            time: computedTime,
            type: "setValueAtTime",
            value: valueAtTime,
        });
        this._param.setValueAtTime(valueAtTime, computedTime);
        return this;
    };
    Param.prototype.rampTo = function (value, rampTime, startTime) {
        if (rampTime === void 0) { rampTime = 0.1; }
        if (this.units === "frequency" || this.units === "bpm" || this.units === "decibels") {
            this.exponentialRampTo(value, rampTime, startTime);
        }
        else {
            this.linearRampTo(value, rampTime, startTime);
        }
        return this;
    };
    /**
     * Apply all of the previously scheduled events to the passed in Param or AudioParam.
     * The applied values will start at the context's current time and schedule
     * all of the events which are scheduled on this Param onto the passed in param.
     */
    Param.prototype.apply = function (param) {
        var now = this.context.currentTime;
        // set the param's value at the current time and schedule everything else
        param.setValueAtTime(this.getValueAtTime(now), now);
        // if the previous event was a curve, then set the rest of it
        var previousEvent = this._events.get(now);
        if (previousEvent && previousEvent.type === "setTargetAtTime") {
            // approx it until the next event with linear ramps
            var nextEvent = this._events.getAfter(previousEvent.time);
            // or for 2 seconds if there is no event
            var endTime = nextEvent ? nextEvent.time : now + 2;
            var subdivisions = (endTime - now) / 10;
            for (var i = now; i < endTime; i += subdivisions) {
                param.linearRampToValueAtTime(this.getValueAtTime(i), i);
            }
        }
        this._events.forEachAfter(this.context.currentTime, function (event) {
            if (event.type === "cancelScheduledValues") {
                param.cancelScheduledValues(event.time);
            }
            else if (event.type === "setTargetAtTime") {
                param.setTargetAtTime(event.value, event.time, event.constant);
            }
            else {
                param[event.type](event.value, event.time);
            }
        });
        return this;
    };
    /**
     * Replace the Param's internal AudioParam. Will apply scheduled curves
     * onto the parameter and replace the connections.
     */
    Param.prototype.setParam = function (param) {
        assert(this._swappable, "The Param must be assigned as 'swappable' in the constructor");
        var input = this.input;
        input.disconnect(this._param);
        this.apply(param);
        this._param = param;
        input.connect(this._param);
        return this;
    };
    Param.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._events.dispose();
        return this;
    };
    Object.defineProperty(Param.prototype, "defaultValue", {
        get: function () {
            return this._toType(this._param.defaultValue);
        },
        enumerable: true,
        configurable: true
    });
    //-------------------------------------
    // 	AUTOMATION CURVE CALCULATIONS
    // 	MIT License, copyright (c) 2014 Jordan Santell
    //-------------------------------------
    // Calculates the the value along the curve produced by setTargetAtTime
    Param.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
        return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
    };
    // Calculates the the value along the curve produced by linearRampToValueAtTime
    Param.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
        return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
    };
    // Calculates the the value along the curve produced by exponentialRampToValueAtTime
    Param.prototype._exponentialInterpolate = function (t0, v0, t1, v1, t) {
        return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
    };
    return Param;
}(ToneWithContext));
export { Param };
//# sourceMappingURL=Param.js.map
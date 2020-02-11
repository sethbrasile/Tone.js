import * as tslib_1 from "tslib";
import { Tone } from "../Tone";
import { isDefined, isObject, isString, isUndef } from "../util/TypeCheck";
/**
 * TimeBase is a flexible encoding of time which can be evaluated to and from a string.
 */
var TimeBaseClass = /** @class */ (function (_super) {
    tslib_1.__extends(TimeBaseClass, _super);
    /**
     * @param context The context associated with the time value. Used to compute
     * Transport and context-relative timing.
     * @param  value  The time value as a number, string or object
     * @param  units  Unit values
     */
    function TimeBaseClass(context, value, units) {
        var _this = _super.call(this) || this;
        /**
         * The default units
         */
        _this.defaultUnits = "s";
        _this._val = value;
        _this._units = units;
        _this.context = context;
        _this._expressions = _this._getExpressions();
        return _this;
    }
    /**
     * All of the time encoding expressions
     */
    TimeBaseClass.prototype._getExpressions = function () {
        var _this = this;
        return {
            hz: {
                method: function (value) {
                    return _this._frequencyToUnits(parseFloat(value));
                },
                regexp: /^(\d+(?:\.\d+)?)hz$/i,
            },
            i: {
                method: function (value) {
                    return _this._ticksToUnits(parseInt(value, 10));
                },
                regexp: /^(\d+)i$/i,
            },
            m: {
                method: function (value) {
                    return _this._beatsToUnits(parseInt(value, 10) * _this._getTimeSignature());
                },
                regexp: /^(\d+)m$/i,
            },
            n: {
                method: function (value, dot) {
                    var numericValue = parseInt(value, 10);
                    var scalar = dot === "." ? 1.5 : 1;
                    if (numericValue === 1) {
                        return _this._beatsToUnits(_this._getTimeSignature()) * scalar;
                    }
                    else {
                        return _this._beatsToUnits(4 / numericValue) * scalar;
                    }
                },
                regexp: /^(\d+)n(\.?)$/i,
            },
            number: {
                method: function (value) {
                    return _this._expressions[_this.defaultUnits].method.call(_this, value);
                },
                regexp: /^(\d+(?:\.\d+)?)$/,
            },
            s: {
                method: function (value) {
                    return _this._secondsToUnits(parseFloat(value));
                },
                regexp: /^(\d+(?:\.\d+)?)s$/,
            },
            samples: {
                method: function (value) {
                    return parseInt(value, 10) / _this.context.sampleRate;
                },
                regexp: /^(\d+)samples$/,
            },
            t: {
                method: function (value) {
                    var numericValue = parseInt(value, 10);
                    return _this._beatsToUnits(8 / (Math.floor(numericValue) * 3));
                },
                regexp: /^(\d+)t$/i,
            },
            tr: {
                method: function (m, q, s) {
                    var total = 0;
                    if (m && m !== "0") {
                        total += _this._beatsToUnits(_this._getTimeSignature() * parseFloat(m));
                    }
                    if (q && q !== "0") {
                        total += _this._beatsToUnits(parseFloat(q));
                    }
                    if (s && s !== "0") {
                        total += _this._beatsToUnits(parseFloat(s) / 4);
                    }
                    return total;
                },
                regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,
            },
        };
    };
    //-------------------------------------
    // 	VALUE OF
    //-------------------------------------
    /**
     * Evaluate the time value. Returns the time in seconds.
     */
    TimeBaseClass.prototype.valueOf = function () {
        if (this._val instanceof TimeBaseClass) {
            this.fromType(this._val);
        }
        if (isUndef(this._val)) {
            return this._noArg();
        }
        else if (isString(this._val) && isUndef(this._units)) {
            for (var units in this._expressions) {
                if (this._expressions[units].regexp.test(this._val.trim())) {
                    this._units = units;
                    break;
                }
            }
        }
        else if (isObject(this._val)) {
            var total = 0;
            for (var typeName in this._val) {
                if (isDefined(this._val[typeName])) {
                    var quantity = this._val[typeName];
                    // @ts-ignore
                    var time = (new this.constructor(this.context, typeName)).valueOf() * quantity;
                    total += time;
                }
            }
            return total;
        }
        if (isDefined(this._units)) {
            var expr = this._expressions[this._units];
            var matching = this._val.toString().trim().match(expr.regexp);
            if (matching) {
                return expr.method.apply(this, matching.slice(1));
            }
            else {
                return expr.method.call(this, this._val);
            }
        }
        else if (isString(this._val)) {
            return parseFloat(this._val);
        }
        else {
            return this._val;
        }
    };
    //-------------------------------------
    // 	UNIT CONVERSIONS
    //-------------------------------------
    /**
     * Returns the value of a frequency in the current units
     */
    TimeBaseClass.prototype._frequencyToUnits = function (freq) {
        return 1 / freq;
    };
    /**
     * Return the value of the beats in the current units
     */
    TimeBaseClass.prototype._beatsToUnits = function (beats) {
        return (60 / this._getBpm()) * beats;
    };
    /**
     * Returns the value of a second in the current units
     */
    TimeBaseClass.prototype._secondsToUnits = function (seconds) {
        return seconds;
    };
    /**
     * Returns the value of a tick in the current time units
     */
    TimeBaseClass.prototype._ticksToUnits = function (ticks) {
        return (ticks * (this._beatsToUnits(1)) / this._getPPQ());
    };
    /**
     * With no arguments, return 'now'
     */
    TimeBaseClass.prototype._noArg = function () {
        return this._now();
    };
    //-------------------------------------
    // 	TEMPO CONVERSIONS
    //-------------------------------------
    /**
     * Return the bpm
     */
    TimeBaseClass.prototype._getBpm = function () {
        return this.context.transport.bpm.value;
    };
    /**
     * Return the timeSignature
     */
    TimeBaseClass.prototype._getTimeSignature = function () {
        return this.context.transport.timeSignature;
    };
    /**
     * Return the PPQ or 192 if Transport is not available
     */
    TimeBaseClass.prototype._getPPQ = function () {
        return this.context.transport.PPQ;
    };
    //-------------------------------------
    // 	CONVERSION INTERFACE
    //-------------------------------------
    /**
     * Coerce a time type into this units type.
     * @param type Any time type units
     */
    TimeBaseClass.prototype.fromType = function (type) {
        this._units = undefined;
        switch (this.defaultUnits) {
            case "s":
                this._val = type.toSeconds();
                break;
            case "i":
                this._val = type.toTicks();
                break;
            case "hz":
                this._val = type.toFrequency();
                break;
            case "midi":
                this._val = type.toMidi();
                break;
        }
        return this;
    };
    /**
     * Return the value in hertz
     */
    TimeBaseClass.prototype.toFrequency = function () {
        return 1 / this.toSeconds();
    };
    /**
     * Return the time in samples
     */
    TimeBaseClass.prototype.toSamples = function () {
        return this.toSeconds() * this.context.sampleRate;
    };
    /**
     * Return the time in milliseconds.
     */
    TimeBaseClass.prototype.toMilliseconds = function () {
        return this.toSeconds() * 1000;
    };
    return TimeBaseClass;
}(Tone));
export { TimeBaseClass };
//# sourceMappingURL=TimeBase.js.map
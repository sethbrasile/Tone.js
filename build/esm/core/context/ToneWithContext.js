import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { Tone } from "../Tone";
import { FrequencyClass } from "../type/Frequency";
import { TimeClass } from "../type/Time";
import { TransportTimeClass } from "../type/TransportTime";
import { getDefaultsFromInstance, optionsFromArguments } from "../util/Defaults";
import { isArray, isBoolean, isDefined, isNumber, isString, isUndef } from "../util/TypeCheck";
/**
 * The Base class for all nodes that have an AudioContext.
 */
var ToneWithContext = /** @class */ (function (_super) {
    tslib_1.__extends(ToneWithContext, _super);
    function ToneWithContext() {
        var _this = _super.call(this) || this;
        var options = optionsFromArguments(ToneWithContext.getDefaults(), arguments, ["context"]);
        if (_this.defaultContext) {
            _this.context = _this.defaultContext;
        }
        else {
            _this.context = options.context;
        }
        return _this;
    }
    ToneWithContext.getDefaults = function () {
        return {
            context: getContext(),
        };
    };
    /**
     * Return the current time of the Context clock plus the lookAhead.
     */
    ToneWithContext.prototype.now = function () {
        return this.context.currentTime + this.context.lookAhead;
    };
    /**
     * Return the current time of the Context clock without any lookAhead.
     */
    ToneWithContext.prototype.immediate = function () {
        return this.context.currentTime;
    };
    Object.defineProperty(ToneWithContext.prototype, "sampleTime", {
        /**
         * The duration in seconds of one sample.
         */
        get: function () {
            return 1 / this.context.sampleRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneWithContext.prototype, "blockTime", {
        /**
         * The number of seconds of 1 processing block (128 samples)
         */
        get: function () {
            return 128 / this.context.sampleRate;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Convert the incoming time to seconds
     */
    ToneWithContext.prototype.toSeconds = function (time) {
        return new TimeClass(this.context, time).toSeconds();
    };
    /**
     * Convert the input to a frequency number
     */
    ToneWithContext.prototype.toFrequency = function (freq) {
        return new FrequencyClass(this.context, freq).toFrequency();
    };
    /**
     * Convert the input time into ticks
     */
    ToneWithContext.prototype.toTicks = function (time) {
        return new TransportTimeClass(this.context, time).toTicks();
    };
    //-------------------------------------
    // 	GET/SET
    //-------------------------------------
    /**
     * Get a subset of the properties which are in the partial props
     */
    ToneWithContext.prototype._getPartialProperties = function (props) {
        var options = this.get();
        // remove attributes from the prop that are not in the partial
        Object.keys(options).forEach(function (name) {
            if (isUndef(props[name])) {
                delete options[name];
            }
        });
        return options;
    };
    /**
     * Get the object's attributes.
     * @example
     * import { Oscillator } from "tone";
     * const osc = new Oscillator();
     * console.log(osc.get());
     * // returns {"type" : "sine", "frequency" : 440, ...etc}
     */
    ToneWithContext.prototype.get = function () {
        var _this = this;
        var defaults = getDefaultsFromInstance(this);
        Object.keys(defaults).forEach(function (attribute) {
            if (Reflect.has(_this, attribute)) {
                var member = _this[attribute];
                if (isDefined(member) && isDefined(member.value) && isDefined(member.setValueAtTime)) {
                    defaults[attribute] = member.value;
                }
                else if (member instanceof ToneWithContext) {
                    defaults[attribute] = member._getPartialProperties(defaults[attribute]);
                    // otherwise make sure it's a serializable type
                }
                else if (isArray(member) || isNumber(member) || isString(member) || isBoolean(member)) {
                    defaults[attribute] = member;
                }
                else {
                    // remove all undefined and unserializable attributes
                    delete defaults[attribute];
                }
            }
        });
        return defaults;
    };
    /**
     * Set multiple properties at once with an object.
     * @example
     * import { Filter } from "tone";
     * const filter = new Filter();
     * // set values using an object
     * filter.set({
     * 	frequency: 300,
     * 	type: "highpass"
     * });
     */
    ToneWithContext.prototype.set = function (props) {
        var _this = this;
        Object.keys(props).forEach(function (attribute) {
            if (Reflect.has(_this, attribute) && isDefined(_this[attribute])) {
                if (_this[attribute] && isDefined(_this[attribute].value) && isDefined(_this[attribute].setValueAtTime)) {
                    // small optimization
                    if (_this[attribute].value !== props[attribute]) {
                        _this[attribute].value = props[attribute];
                    }
                }
                else if (_this[attribute] instanceof ToneWithContext) {
                    _this[attribute].set(props[attribute]);
                }
                else {
                    _this[attribute] = props[attribute];
                }
            }
        });
        return this;
    };
    return ToneWithContext;
}(Tone));
export { ToneWithContext };
//# sourceMappingURL=ToneWithContext.js.map
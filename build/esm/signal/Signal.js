import * as tslib_1 from "tslib";
import { Param } from "../core/context/Param";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { connect } from "../core/context/ToneAudioNode";
import { isAudioParam } from "../core/util/AdvancedTypeCheck";
import { optionsFromArguments } from "../core/util/Defaults";
import { ToneConstantSource } from "./ToneConstantSource";
/**
 * A signal is an audio-rate value. Tone.Signal is a core component of the library.
 * Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal
 * has all of the methods available to native Web Audio
 * [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface)
 * as well as additional conveniences. Read more about working with signals
 * [here](https://github.com/Tonejs/Tone.js/wiki/Signals).
 *
 * @example
 * import { Oscillator, Signal } from "tone";
 * const osc = new Oscillator().toDestination().start();
 * // a scheduleable signal which can be connected to control an AudioParam or another Signal
 * const signal = new Signal({
 * 	value: "C4",
 * 	units: "frequency"
 * }).connect(osc.frequency);
 * // the scheduled ramp controls the connected signal
 * signal.rampTo("C2", 4, "+0.5");
 * @category Signal
 */
var Signal = /** @class */ (function (_super) {
    tslib_1.__extends(Signal, _super);
    function Signal() {
        var _this = _super.call(this, optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"])) || this;
        _this.name = "Signal";
        /**
         * Indicates if the value should be overridden on connection.
         */
        _this.override = true;
        var options = optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]);
        _this.output = _this._constantSource = new ToneConstantSource({
            context: _this.context,
            convert: options.convert,
            offset: options.value,
            units: options.units,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        _this._constantSource.start(0);
        _this.input = _this._param = _this._constantSource.offset;
        return _this;
    }
    Signal.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            convert: true,
            units: "number",
            value: 0,
        });
    };
    Signal.prototype.connect = function (destination, outputNum, inputNum) {
        if (outputNum === void 0) { outputNum = 0; }
        if (inputNum === void 0) { inputNum = 0; }
        // start it only when connected to something
        connectSignal(this, destination, outputNum, inputNum);
        return this;
    };
    Signal.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._param.dispose();
        this._constantSource.dispose();
        return this;
    };
    //-------------------------------------
    // ABSTRACT PARAM INTERFACE
    // just a proxy for the ConstantSourceNode's offset AudioParam
    // all docs are generated from AbstractParam.ts
    //-------------------------------------
    Signal.prototype.setValueAtTime = function (value, time) {
        this._param.setValueAtTime(value, time);
        return this;
    };
    Signal.prototype.getValueAtTime = function (time) {
        return this._param.getValueAtTime(time);
    };
    Signal.prototype.setRampPoint = function (time) {
        this._param.setRampPoint(time);
        return this;
    };
    Signal.prototype.linearRampToValueAtTime = function (value, time) {
        this._param.linearRampToValueAtTime(value, time);
        return this;
    };
    Signal.prototype.exponentialRampToValueAtTime = function (value, time) {
        this._param.exponentialRampToValueAtTime(value, time);
        return this;
    };
    Signal.prototype.exponentialRampTo = function (value, rampTime, startTime) {
        this._param.exponentialRampTo(value, rampTime, startTime);
        return this;
    };
    Signal.prototype.linearRampTo = function (value, rampTime, startTime) {
        this._param.linearRampTo(value, rampTime, startTime);
        return this;
    };
    Signal.prototype.targetRampTo = function (value, rampTime, startTime) {
        this._param.targetRampTo(value, rampTime, startTime);
        return this;
    };
    Signal.prototype.exponentialApproachValueAtTime = function (value, time, rampTime) {
        this._param.exponentialApproachValueAtTime(value, time, rampTime);
        return this;
    };
    Signal.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
        this._param.setTargetAtTime(value, startTime, timeConstant);
        return this;
    };
    Signal.prototype.setValueCurveAtTime = function (values, startTime, duration, scaling) {
        this._param.setValueCurveAtTime(values, startTime, duration, scaling);
        return this;
    };
    Signal.prototype.cancelScheduledValues = function (time) {
        this._param.cancelScheduledValues(time);
        return this;
    };
    Signal.prototype.cancelAndHoldAtTime = function (time) {
        this._param.cancelAndHoldAtTime(time);
        return this;
    };
    Signal.prototype.rampTo = function (value, rampTime, startTime) {
        this._param.rampTo(value, rampTime, startTime);
        return this;
    };
    Object.defineProperty(Signal.prototype, "value", {
        get: function () {
            return this._param.value;
        },
        set: function (value) {
            this._param.value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "convert", {
        get: function () {
            return this._param.convert;
        },
        set: function (convert) {
            this._param.convert = convert;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "units", {
        get: function () {
            return this._param.units;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "overridden", {
        get: function () {
            return this._param.overridden;
        },
        set: function (overridden) {
            this._param.overridden = overridden;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "maxValue", {
        get: function () {
            return this._param.maxValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Signal.prototype, "minValue", {
        get: function () {
            return this._param.minValue;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * See [[Param.apply]].
     */
    Signal.prototype.apply = function (param) {
        this._param.apply(param);
        return this;
    };
    return Signal;
}(ToneAudioNode));
export { Signal };
/**
 * When connecting from a signal, it's necessary to zero out the node destination
 * node if that node is also a signal. If the destination is not 0, then the values
 * will be summed. This method insures that the output of the destination signal will
 * be the same as the source signal, making the destination signal a pass through node.
 * @param signal The output signal to connect from
 * @param destination the destination to connect to
 * @param outputNum the optional output number
 * @param inputNum the input number
 */
export function connectSignal(signal, destination, outputNum, inputNum) {
    if (destination instanceof Param || isAudioParam(destination) ||
        (destination instanceof Signal && destination.override)) {
        // cancel changes
        destination.cancelScheduledValues(0);
        // reset the value
        destination.setValueAtTime(0, 0);
        // mark the value as overridden
        if (destination instanceof Signal) {
            destination.overridden = true;
        }
    }
    connect(signal, destination, outputNum, inputNum);
}
//# sourceMappingURL=Signal.js.map
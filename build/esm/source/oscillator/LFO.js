import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { Param } from "../../core/context/Param";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { readOnly } from "../../core/util/Interface";
import { AudioToGain } from "../../signal/AudioToGain";
import { Scale } from "../../signal/Scale";
import { connectSignal, Signal } from "../../signal/Signal";
import { Zero } from "../../signal/Zero";
import { Oscillator } from "./Oscillator";
/**
 * LFO stands for low frequency oscillator. LFO produces an output signal
 * which can be attached to an AudioParam or Tone.Signal
 * in order to modulate that parameter with an oscillator. The LFO can
 * also be synced to the transport to start/stop and change when the tempo changes.
 *
 * @example
 * import { Filter, LFO, Noise } from "tone";
 * const filter = new Filter().toDestination();
 * const noise = new Noise().connect(filter).start();
 * const lfo = new LFO("4n", 400, 4000).start();
 * // have it control the filters cutoff
 * lfo.connect(filter.frequency);
 * @category Source
 */
var LFO = /** @class */ (function (_super) {
    tslib_1.__extends(LFO, _super);
    function LFO() {
        var _this = _super.call(this, optionsFromArguments(LFO.getDefaults(), arguments, ["frequency", "min", "max"])) || this;
        _this.name = "LFO";
        /**
         * The value that the LFO outputs when it's stopped
         */
        _this._stoppedValue = 0;
        /**
         * A private placeholder for the units
         */
        _this._units = "number";
        /**
         * If the input value is converted using the [[units]]
         */
        _this.convert = true;
        /**
         * Private methods borrowed from Param
         */
        // @ts-ignore
        _this._fromType = Param.prototype._fromType;
        // @ts-ignore
        _this._toType = Param.prototype._toType;
        // @ts-ignore
        _this._is = Param.prototype._is;
        // @ts-ignore
        _this._clampValue = Param.prototype._clampValue;
        var options = optionsFromArguments(LFO.getDefaults(), arguments, ["frequency", "min", "max"]);
        // @ts-ignore
        _this._oscillator = new Oscillator({
            context: _this.context,
            frequency: options.frequency,
            type: options.type,
        });
        _this.frequency = _this._oscillator.frequency;
        _this._amplitudeGain = new Gain({
            context: _this.context,
            gain: options.amplitude,
            units: "normalRange",
        });
        _this.amplitude = _this._amplitudeGain.gain;
        _this._stoppedSignal = new Signal({
            context: _this.context,
            units: "audioRange",
            value: 0,
        });
        _this._zeros = new Zero({ context: _this.context });
        _this._a2g = new AudioToGain({ context: _this.context });
        _this._scaler = _this.output = new Scale({
            context: _this.context,
            max: options.max,
            min: options.min,
        });
        _this.min = options.min;
        _this.max = options.max;
        _this.units = options.units;
        // connect it up
        _this._oscillator.chain(_this._a2g, _this._amplitudeGain, _this._scaler);
        _this._zeros.connect(_this._a2g);
        _this._stoppedSignal.connect(_this._a2g);
        readOnly(_this, ["amplitude", "frequency"]);
        _this.phase = options.phase;
        return _this;
    }
    LFO.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            amplitude: 1,
            frequency: "4n",
            max: 1,
            min: 0,
            phase: 0,
            type: "sine",
            units: "number",
        });
    };
    /**
     * Start the LFO.
     * @param time The time the LFO will start
     */
    LFO.prototype.start = function (time) {
        time = this.toSeconds(time);
        this._stoppedSignal.setValueAtTime(0, time);
        this._oscillator.start(time);
        return this;
    };
    /**
     * Stop the LFO.
     * @param  time The time the LFO will stop
     */
    LFO.prototype.stop = function (time) {
        time = this.toSeconds(time);
        this._stoppedSignal.setValueAtTime(this._stoppedValue, time);
        this._oscillator.stop(time);
        return this;
    };
    /**
     * Sync the start/stop/pause to the transport
     * and the frequency to the bpm of the transport
     * @example
     * import { LFO } from "tone";
     * const lfo = new LFO("8n");
     * lfo.sync().start(0);
     * // the rate of the LFO will always be an eighth note, even as the tempo changes
     */
    LFO.prototype.sync = function () {
        this._oscillator.sync();
        this._oscillator.syncFrequency();
        return this;
    };
    /**
     * unsync the LFO from transport control
     */
    LFO.prototype.unsync = function () {
        this._oscillator.unsync();
        this._oscillator.unsyncFrequency();
        return this;
    };
    Object.defineProperty(LFO.prototype, "min", {
        /**
         * The minimum output of the LFO.
         */
        get: function () {
            return this._toType(this._scaler.min);
        },
        set: function (min) {
            min = this._fromType(min);
            this._scaler.min = min;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LFO.prototype, "max", {
        /**
         * The maximum output of the LFO.
         */
        get: function () {
            return this._toType(this._scaler.max);
        },
        set: function (max) {
            max = this._fromType(max);
            this._scaler.max = max;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LFO.prototype, "type", {
        /**
         * The type of the oscillator: See [[Oscillator.type]]
         */
        get: function () {
            return this._oscillator.type;
        },
        set: function (type) {
            this._oscillator.type = type;
            this._stoppedValue = this._oscillator.getInitialValue();
            this._stoppedSignal.value = this._stoppedValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LFO.prototype, "phase", {
        /**
         * The phase of the LFO.
         */
        get: function () {
            return this._oscillator.phase;
        },
        set: function (phase) {
            this._oscillator.phase = phase;
            this._stoppedValue = this._oscillator.getInitialValue();
            this._stoppedSignal.value = this._stoppedValue;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LFO.prototype, "units", {
        /**
         * The output units of the LFO.
         */
        get: function () {
            return this._units;
        },
        set: function (val) {
            var currentMin = this.min;
            var currentMax = this.max;
            // convert the min and the max
            this._units = val;
            this.min = currentMin;
            this.max = currentMax;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LFO.prototype, "state", {
        /**
         * Returns the playback state of the source, either "started" or "stopped".
         */
        get: function () {
            return this._oscillator.state;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param node the destination to connect to
     * @param outputNum the optional output number
     * @param inputNum the input number
     */
    LFO.prototype.connect = function (node, outputNum, inputNum) {
        if (node instanceof Param || node instanceof Signal) {
            this.convert = node.convert;
            this.units = node.units;
        }
        connectSignal(this, node, outputNum, inputNum);
        return this;
    };
    LFO.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._oscillator.dispose();
        this._stoppedSignal.dispose();
        this._zeros.dispose();
        this._scaler.dispose();
        this._a2g.dispose();
        this._amplitudeGain.dispose();
        this.amplitude.dispose();
        return this;
    };
    return LFO;
}(ToneAudioNode));
export { LFO };
//# sourceMappingURL=LFO.js.map
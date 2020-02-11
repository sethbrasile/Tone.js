import * as tslib_1 from "tslib";
import { connect } from "../../core/context/ToneAudioNode";
import { Param } from "../../core/context/Param";
import { optionsFromArguments } from "../../core/util/Defaults";
import { OneShotSource } from "../OneShotSource";
/**
 * Wrapper around the native fire-and-forget OscillatorNode.
 * Adds the ability to reschedule the stop method.
 * ***[[Oscillator]] is better for most use-cases***
 * @category Source
 */
var ToneOscillatorNode = /** @class */ (function (_super) {
    tslib_1.__extends(ToneOscillatorNode, _super);
    function ToneOscillatorNode() {
        var _this = _super.call(this, optionsFromArguments(ToneOscillatorNode.getDefaults(), arguments, ["frequency", "type"])) || this;
        _this.name = "ToneOscillatorNode";
        /**
         * The oscillator
         */
        _this._oscillator = _this.context.createOscillator();
        _this._internalChannels = [_this._oscillator];
        var options = optionsFromArguments(ToneOscillatorNode.getDefaults(), arguments, ["frequency", "type"]);
        connect(_this._oscillator, _this._gainNode);
        _this.type = options.type;
        _this.frequency = new Param({
            context: _this.context,
            param: _this._oscillator.frequency,
            units: "frequency",
            value: options.frequency,
        });
        _this.detune = new Param({
            context: _this.context,
            param: _this._oscillator.detune,
            units: "cents",
            value: options.detune,
        });
        return _this;
    }
    ToneOscillatorNode.getDefaults = function () {
        return Object.assign(OneShotSource.getDefaults(), {
            detune: 0,
            frequency: 440,
            type: "sine",
        });
    };
    /**
     * Start the oscillator node at the given time
     * @param  time When to start the oscillator
     */
    ToneOscillatorNode.prototype.start = function (time) {
        var computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        this._oscillator.start(computedTime);
        return this;
    };
    ToneOscillatorNode.prototype._stopSource = function (time) {
        this._oscillator.stop(time);
    };
    /**
     * Sets an arbitrary custom periodic waveform given a PeriodicWave.
     * @param  periodicWave PeriodicWave should be created with context.createPeriodicWave
     */
    ToneOscillatorNode.prototype.setPeriodicWave = function (periodicWave) {
        this._oscillator.setPeriodicWave(periodicWave);
        return this;
    };
    Object.defineProperty(ToneOscillatorNode.prototype, "type", {
        /**
         * The oscillator type. Either 'sine', 'sawtooth', 'square', or 'triangle'
         */
        get: function () {
            return this._oscillator.type;
        },
        set: function (type) {
            this._oscillator.type = type;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up.
     */
    ToneOscillatorNode.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this.state === "started") {
            this.stop();
        }
        this._oscillator.disconnect();
        this.frequency.dispose();
        this.detune.dispose();
        return this;
    };
    return ToneOscillatorNode;
}(OneShotSource));
export { ToneOscillatorNode };
//# sourceMappingURL=ToneOscillatorNode.js.map
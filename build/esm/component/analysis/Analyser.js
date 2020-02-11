import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Split } from "../channel/Split";
import { Gain } from "../../core/context/Gain";
import { assert, assertRange } from "../../core/util/Debug";
/**
 * Wrapper around the native Web Audio's [AnalyserNode](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode).
 * Extracts FFT or Waveform data from the incoming signal.
 * @category Component
 */
var Analyser = /** @class */ (function (_super) {
    tslib_1.__extends(Analyser, _super);
    function Analyser() {
        var _this = _super.call(this, optionsFromArguments(Analyser.getDefaults(), arguments, ["type", "size"])) || this;
        _this.name = "Analyser";
        /**
         * The analyser node.
         */
        _this._analysers = [];
        /**
         * The buffer that the FFT data is written to
         */
        _this._buffers = [];
        var options = optionsFromArguments(Analyser.getDefaults(), arguments, ["type", "size"]);
        _this.input = _this.output = _this._gain = new Gain({ context: _this.context });
        _this._split = new Split({
            context: _this.context,
            channels: options.channels,
        });
        _this.input.connect(_this._split);
        assertRange(options.channels, 1);
        // create the analysers
        for (var channel = 0; channel < options.channels; channel++) {
            _this._analysers[channel] = _this.context.createAnalyser();
            _this._split.connect(_this._analysers[channel], channel, 0);
        }
        // set the values initially
        _this.size = options.size;
        _this.type = options.type;
        return _this;
    }
    Analyser.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            size: 1024,
            smoothing: 0.8,
            type: "fft",
            channels: 1,
        });
    };
    /**
     * Run the analysis given the current settings. If [[channels]] = 1,
     * it will return a Float32Array. If [[channels]] > 1, it will
     * return an array of Float32Arrays where each index in the array
     * represents the analysis done on a channel.
     */
    Analyser.prototype.getValue = function () {
        var _this = this;
        this._analysers.forEach(function (analyser, index) {
            var buffer = _this._buffers[index];
            if (_this._type === "fft") {
                analyser.getFloatFrequencyData(buffer);
            }
            else if (_this._type === "waveform") {
                analyser.getFloatTimeDomainData(buffer);
            }
        });
        if (this.channels === 1) {
            return this._buffers[0];
        }
        else {
            return this._buffers;
        }
    };
    Object.defineProperty(Analyser.prototype, "size", {
        /**
         * The size of analysis. This must be a power of two in the range 16 to 16384.
         */
        get: function () {
            return this._analysers[0].frequencyBinCount;
        },
        set: function (size) {
            var _this = this;
            this._analysers.forEach(function (analyser, index) {
                analyser.fftSize = size * 2;
                _this._buffers[index] = new Float32Array(size);
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Analyser.prototype, "channels", {
        /**
         * The number of channels the analyser does the analysis on. Channel
         * separation is done using [[Split]]
         */
        get: function () {
            return this._analysers.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Analyser.prototype, "type", {
        /**
         * The analysis function returned by analyser.getValue(), either "fft" or "waveform".
         */
        get: function () {
            return this._type;
        },
        set: function (type) {
            assert(type === "waveform" || type === "fft", "Analyser: invalid type: " + type);
            this._type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Analyser.prototype, "smoothing", {
        /**
         * 0 represents no time averaging with the last analysis frame.
         */
        get: function () {
            return this._analysers[0].smoothingTimeConstant;
        },
        set: function (val) {
            this._analysers.forEach(function (a) { return a.smoothingTimeConstant = val; });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clean up.
     */
    Analyser.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._analysers.forEach(function (a) { return a.disconnect(); });
        this._split.dispose();
        this._gain.dispose();
        return this;
    };
    return Analyser;
}(ToneAudioNode));
export { Analyser };
//# sourceMappingURL=Analyser.js.map
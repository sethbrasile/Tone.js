import * as tslib_1 from "tslib";
import { ToneAudioBuffer } from "../core/context/ToneAudioBuffer";
import { optionsFromArguments } from "../core/util/Defaults";
import { assert } from "../core/util/Debug";
import { Source } from "../source/Source";
import { ToneBufferSource } from "./buffer/ToneBufferSource";
/**
 * Noise is a noise generator. It uses looped noise buffers to save on performance.
 * Noise supports the noise types: "pink", "white", and "brown". Read more about
 * colors of noise on [Wikipedia](https://en.wikipedia.org/wiki/Colors_of_noise).
 *
 * @example
 * import { AutoFilter, Noise } from "tone";
 * // initialize the noise and start
 * const noise = new Noise("pink").start();
 * // make an autofilter to shape the noise
 * const autoFilter = new AutoFilter({
 * 	frequency: "8n",
 * 	baseFrequency: 200,
 * 	octaves: 8
 * }).toDestination().start();
 * // connect the noise
 * noise.connect(autoFilter);
 * // start the autofilter LFO
 * autoFilter.start();
 * @category Source
 */
var Noise = /** @class */ (function (_super) {
    tslib_1.__extends(Noise, _super);
    function Noise() {
        var _this = _super.call(this, optionsFromArguments(Noise.getDefaults(), arguments, ["type"])) || this;
        _this.name = "Noise";
        /**
         * Private reference to the source
         */
        _this._source = null;
        var options = optionsFromArguments(Noise.getDefaults(), arguments, ["type"]);
        _this._playbackRate = options.playbackRate;
        _this.type = options.type;
        _this._fadeIn = options.fadeIn;
        _this._fadeOut = options.fadeOut;
        return _this;
    }
    Noise.getDefaults = function () {
        return Object.assign(Source.getDefaults(), {
            fadeIn: 0,
            fadeOut: 0,
            playbackRate: 1,
            type: "white",
        });
    };
    Object.defineProperty(Noise.prototype, "type", {
        /**
         * The type of the noise. Can be "white", "brown", or "pink".
         * @example
         * import { Noise } from "tone";
         * const noise = new Noise().toDestination().start();
         * noise.type = "brown";
         */
        get: function () {
            return this._type;
        },
        set: function (type) {
            assert(type in _noiseBuffers, "Noise: invalid type: " + type);
            if (this._type !== type) {
                this._type = type;
                // if it's playing, stop and restart it
                if (this.state === "started") {
                    var now = this.now();
                    this._stop(now);
                    this._start(now);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Noise.prototype, "playbackRate", {
        /**
         * The playback rate of the noise. Affects
         * the "frequency" of the noise.
         */
        get: function () {
            return this._playbackRate;
        },
        set: function (rate) {
            this._playbackRate = rate;
            if (this._source) {
                this._source.playbackRate.value = rate;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * internal start method
     */
    Noise.prototype._start = function (time) {
        var _this = this;
        var buffer = _noiseBuffers[this._type];
        this._source = new ToneBufferSource({
            url: buffer,
            context: this.context,
            fadeIn: this._fadeIn,
            fadeOut: this._fadeOut,
            loop: true,
            onended: function () { return _this.onstop(_this); },
            playbackRate: this._playbackRate,
        }).connect(this.output);
        this._source.start(this.toSeconds(time), Math.random() * (buffer.duration - 0.001));
    };
    /**
     * internal stop method
     */
    Noise.prototype._stop = function (time) {
        if (this._source) {
            this._source.stop(this.toSeconds(time));
            this._source = null;
        }
    };
    Object.defineProperty(Noise.prototype, "fadeIn", {
        /**
         * The fadeIn time of the amplitude envelope.
         */
        get: function () {
            return this._fadeIn;
        },
        set: function (time) {
            this._fadeIn = time;
            if (this._source) {
                this._source.fadeIn = this._fadeIn;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Noise.prototype, "fadeOut", {
        /**
         * The fadeOut time of the amplitude envelope.
         */
        get: function () {
            return this._fadeOut;
        },
        set: function (time) {
            this._fadeOut = time;
            if (this._source) {
                this._source.fadeOut = this._fadeOut;
            }
        },
        enumerable: true,
        configurable: true
    });
    Noise.prototype._restart = function (time) {
        // TODO could be optimized by cancelling the buffer source 'stop'
        this._stop(time);
        this._start(time);
    };
    /**
     * Clean up.
     */
    Noise.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._source) {
            this._source.disconnect();
        }
        return this;
    };
    return Noise;
}(Source));
export { Noise };
//--------------------
// THE NOISE BUFFERS
//--------------------
// Noise buffer stats
var BUFFER_LENGTH = 44100 * 5;
var NUM_CHANNELS = 2;
/**
 * Cache the noise buffers
 */
var _noiseCache = {
    brown: null,
    pink: null,
    white: null,
};
/**
 * The noise arrays. Generated on initialization.
 * borrowed heavily from https://github.com/zacharydenton/noise.js
 * (c) 2013 Zach Denton (MIT)
 */
var _noiseBuffers = {
    get brown() {
        if (!_noiseCache.brown) {
            var buffer = [];
            for (var channelNum = 0; channelNum < NUM_CHANNELS; channelNum++) {
                var channel = new Float32Array(BUFFER_LENGTH);
                buffer[channelNum] = channel;
                var lastOut = 0.0;
                for (var i = 0; i < BUFFER_LENGTH; i++) {
                    var white = Math.random() * 2 - 1;
                    channel[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = channel[i];
                    channel[i] *= 3.5; // (roughly) compensate for gain
                }
            }
            _noiseCache.brown = new ToneAudioBuffer().fromArray(buffer);
        }
        return _noiseCache.brown;
    },
    get pink() {
        if (!_noiseCache.pink) {
            var buffer = [];
            for (var channelNum = 0; channelNum < NUM_CHANNELS; channelNum++) {
                var channel = new Float32Array(BUFFER_LENGTH);
                buffer[channelNum] = channel;
                var b0 = void 0, b1 = void 0, b2 = void 0, b3 = void 0, b4 = void 0, b5 = void 0, b6 = void 0;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (var i = 0; i < BUFFER_LENGTH; i++) {
                    var white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    channel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    channel[i] *= 0.11; // (roughly) compensate for gain
                    b6 = white * 0.115926;
                }
            }
            _noiseCache.pink = new ToneAudioBuffer().fromArray(buffer);
        }
        return _noiseCache.pink;
    },
    get white() {
        if (!_noiseCache.white) {
            var buffer = [];
            for (var channelNum = 0; channelNum < NUM_CHANNELS; channelNum++) {
                var channel = new Float32Array(BUFFER_LENGTH);
                buffer[channelNum] = channel;
                for (var i = 0; i < BUFFER_LENGTH; i++) {
                    channel[i] = Math.random() * 2 - 1;
                }
            }
            _noiseCache.white = new ToneAudioBuffer().fromArray(buffer);
        }
        return _noiseCache.white;
    },
};
//# sourceMappingURL=Noise.js.map
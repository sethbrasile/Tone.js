import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { ToneAudioBuffer } from "../../core/context/ToneAudioBuffer";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Gain } from "../../core/context/Gain";
import { noOp } from "../../core/util/Interface";
/**
 * Convolver is a wrapper around the Native Web Audio
 * [ConvolverNode](http://webaudio.github.io/web-audio-api/#the-convolvernode-interface).
 * Convolution is useful for reverb and filter emulation. Read more about convolution reverb on
 * [Wikipedia](https://en.wikipedia.org/wiki/Convolution_reverb).
 *
 * @example
 * import { Convolver } from "tone";
 * // initializing the convolver with an impulse response
 * const convolver = new Convolver("./path/to/ir.wav").toDestination();
 * @category Component
 */
var Convolver = /** @class */ (function (_super) {
    tslib_1.__extends(Convolver, _super);
    function Convolver() {
        var _this = _super.call(this, optionsFromArguments(Convolver.getDefaults(), arguments, ["url", "onload"])) || this;
        _this.name = "Convolver";
        /**
         * The native ConvolverNode
         */
        _this._convolver = _this.context.createConvolver();
        var options = optionsFromArguments(Convolver.getDefaults(), arguments, ["url", "onload"]);
        _this._buffer = new ToneAudioBuffer(options.url, function (buffer) {
            _this.buffer = buffer;
            options.onload();
        });
        _this.input = new Gain({ context: _this.context });
        _this.output = new Gain({ context: _this.context });
        // set if it's already loaded, set it immediately
        if (_this._buffer.loaded) {
            _this.buffer = _this._buffer;
        }
        // initially set normalization
        _this.normalize = options.normalize;
        // connect it up
        _this.input.chain(_this._convolver, _this.output);
        return _this;
    }
    Convolver.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            normalize: true,
            onload: noOp,
        });
    };
    /**
     * Load an impulse response url as an audio buffer.
     * Decodes the audio asynchronously and invokes
     * the callback once the audio buffer loads.
     * @param url The url of the buffer to load. filetype support depends on the browser.
     */
    Convolver.prototype.load = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this._buffer.load(url)];
                    case 1:
                        _a.buffer = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Convolver.prototype, "buffer", {
        /**
         * The convolver's buffer
         */
        get: function () {
            if (this._buffer.length) {
                return this._buffer;
            }
            else {
                return null;
            }
        },
        set: function (buffer) {
            if (buffer) {
                this._buffer.set(buffer);
            }
            // if it's already got a buffer, create a new one
            if (this._convolver.buffer) {
                // disconnect the old one
                this.input.disconnect();
                this._convolver.disconnect();
                // create and connect a new one
                this._convolver = this.context.createConvolver();
                this.input.connect(this._convolver);
            }
            var buff = this._buffer.get();
            this._convolver.buffer = buff ? buff : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Convolver.prototype, "normalize", {
        /**
         * The normalize property of the ConvolverNode interface is a boolean that
         * controls whether the impulse response from the buffer will be scaled by
         * an equal-power normalization when the buffer attribute is set, or not.
         */
        get: function () {
            return this._convolver.normalize;
        },
        set: function (norm) {
            this._convolver.normalize = norm;
        },
        enumerable: true,
        configurable: true
    });
    Convolver.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._buffer.dispose();
        this._convolver.disconnect();
        return this;
    };
    return Convolver;
}(ToneAudioNode));
export { Convolver };
//# sourceMappingURL=Convolver.js.map
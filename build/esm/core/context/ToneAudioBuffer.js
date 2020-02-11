import * as tslib_1 from "tslib";
import { getContext } from "../Global";
import { Tone } from "../Tone";
import { isAudioBuffer } from "../util/AdvancedTypeCheck";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";
import { isArray, isNumber, isString } from "../util/TypeCheck";
import { assert } from "../util/Debug";
/**
 * AudioBuffer loading and storage. ToneAudioBuffer is used internally by all
 * classes that make requests for audio files such as Tone.Player,
 * Tone.Sampler and Tone.Convolver.
 * Aside from load callbacks from individual buffers, ToneAudioBuffer
 * provides events which keep track of the loading progress
 * of _all_ of the buffers. These are ToneAudioBuffer.on("load" / "progress" / "error")
 * @example
 * import { ToneAudioBuffer } from "tone";
 * const buffer = new ToneAudioBuffer("https://tonejs.github.io/examples/audio/FWDL.mp3", () => {
 * 	console.log("loaded");
 * });
 * @category Core
 */
var ToneAudioBuffer = /** @class */ (function (_super) {
    tslib_1.__extends(ToneAudioBuffer, _super);
    function ToneAudioBuffer() {
        var _this = _super.call(this) || this;
        _this.name = "ToneAudioBuffer";
        /**
         * Callback when the buffer is loaded.
         */
        _this.onload = noOp;
        var options = optionsFromArguments(ToneAudioBuffer.getDefaults(), arguments, ["url", "onload", "onerror"]);
        _this.reverse = options.reverse;
        _this.onload = options.onload;
        if (options.url && isAudioBuffer(options.url) || options.url instanceof ToneAudioBuffer) {
            _this.set(options.url);
        }
        else if (isString(options.url)) {
            // initiate the download
            _this.load(options.url).catch(options.onerror);
        }
        return _this;
    }
    ToneAudioBuffer.getDefaults = function () {
        return {
            onerror: noOp,
            onload: noOp,
            reverse: false,
        };
    };
    Object.defineProperty(ToneAudioBuffer.prototype, "sampleRate", {
        /**
         * The sample rate of the AudioBuffer
         */
        get: function () {
            if (this._buffer) {
                return this._buffer.sampleRate;
            }
            else {
                return getContext().sampleRate;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Pass in an AudioBuffer or ToneAudioBuffer to set the value of this buffer.
     */
    ToneAudioBuffer.prototype.set = function (buffer) {
        var _this = this;
        if (buffer instanceof ToneAudioBuffer) {
            // if it's loaded, set it
            if (buffer.loaded) {
                this._buffer = buffer.get();
            }
            else {
                // otherwise when it's loaded, invoke it's callback
                buffer.onload = function () {
                    _this.set(buffer);
                    _this.onload(_this);
                };
            }
        }
        else {
            this._buffer = buffer;
        }
        // reverse it initially
        if (this._reversed) {
            this._reverse();
        }
        return this;
    };
    /**
     * The audio buffer stored in the object.
     */
    ToneAudioBuffer.prototype.get = function () {
        return this._buffer;
    };
    /**
     * Makes an fetch request for the selected url then decodes the file as an audio buffer.
     * Invokes the callback once the audio buffer loads.
     * @param url The url of the buffer to load. filetype support depends on the browser.
     * @returns A Promise which resolves with this ToneAudioBuffer
     */
    ToneAudioBuffer.prototype.load = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var promise, audioBuffer, e_1, index;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promise = ToneAudioBuffer.load(url);
                        ToneAudioBuffer.downloads.push(promise);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, promise];
                    case 2:
                        audioBuffer = _a.sent();
                        this.set(audioBuffer);
                        // invoke the onload method
                        this.onload(this);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        index = ToneAudioBuffer.downloads.indexOf(promise);
                        ToneAudioBuffer.downloads.splice(index, 1);
                        throw e_1;
                    case 4: return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * clean up
     */
    ToneAudioBuffer.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._buffer = undefined;
        return this;
    };
    /**
     * Set the audio buffer from the array.
     * To create a multichannel AudioBuffer, pass in a multidimensional array.
     * @param array The array to fill the audio buffer
     */
    ToneAudioBuffer.prototype.fromArray = function (array) {
        var isMultidimensional = isArray(array) && array[0].length > 0;
        var channels = isMultidimensional ? array.length : 1;
        var len = isMultidimensional ? array[0].length : array.length;
        var context = getContext();
        var buffer = context.createBuffer(channels, len, context.sampleRate);
        var multiChannelArray = !isMultidimensional && channels === 1 ?
            [array] : array;
        for (var c = 0; c < channels; c++) {
            buffer.copyToChannel(multiChannelArray[c], c);
        }
        this._buffer = buffer;
        return this;
    };
    /**
     * Sums multiple channels into 1 channel
     * @param chanNum Optionally only copy a single channel from the array.
     */
    ToneAudioBuffer.prototype.toMono = function (chanNum) {
        if (isNumber(chanNum)) {
            this.fromArray(this.toArray(chanNum));
        }
        else {
            var outputArray = new Float32Array(this.length);
            var numChannels_1 = this.numberOfChannels;
            for (var channel = 0; channel < numChannels_1; channel++) {
                var channelArray = this.toArray(channel);
                for (var i = 0; i < channelArray.length; i++) {
                    outputArray[i] += channelArray[i];
                }
            }
            // divide by the number of channels
            outputArray = outputArray.map(function (sample) { return sample / numChannels_1; });
            this.fromArray(outputArray);
        }
        return this;
    };
    /**
     * Get the buffer as an array. Single channel buffers will return a 1-dimensional
     * Float32Array, and multichannel buffers will return multidimensional arrays.
     * @param channel Optionally only copy a single channel from the array.
     */
    ToneAudioBuffer.prototype.toArray = function (channel) {
        if (isNumber(channel)) {
            return this.getChannelData(channel);
        }
        else if (this.numberOfChannels === 1) {
            return this.toArray(0);
        }
        else {
            var ret = [];
            for (var c = 0; c < this.numberOfChannels; c++) {
                ret[c] = this.getChannelData(c);
            }
            return ret;
        }
    };
    /**
     * Returns the Float32Array representing the PCM audio data for the specific channel.
     * @param  channel  The channel number to return
     * @return The audio as a TypedArray
     */
    ToneAudioBuffer.prototype.getChannelData = function (channel) {
        if (this._buffer) {
            return this._buffer.getChannelData(channel);
        }
        else {
            return new Float32Array(0);
        }
    };
    /**
     * Cut a subsection of the array and return a buffer of the
     * subsection. Does not modify the original buffer
     * @param start The time to start the slice
     * @param end The end time to slice. If none is given will default to the end of the buffer
     */
    ToneAudioBuffer.prototype.slice = function (start, end) {
        if (end === void 0) { end = this.duration; }
        var startSamples = Math.floor(start * this.sampleRate);
        var endSamples = Math.floor(end * this.sampleRate);
        assert(startSamples < endSamples, "The start time must be less than the end time");
        var length = endSamples - startSamples;
        var retBuffer = getContext().createBuffer(this.numberOfChannels, length, this.sampleRate);
        for (var channel = 0; channel < this.numberOfChannels; channel++) {
            retBuffer.copyToChannel(this.getChannelData(channel).subarray(startSamples, endSamples), channel);
        }
        return new ToneAudioBuffer(retBuffer);
    };
    /**
     * Reverse the buffer.
     */
    ToneAudioBuffer.prototype._reverse = function () {
        if (this.loaded) {
            for (var i = 0; i < this.numberOfChannels; i++) {
                this.getChannelData(i).reverse();
            }
        }
        return this;
    };
    Object.defineProperty(ToneAudioBuffer.prototype, "loaded", {
        /**
         * If the buffer is loaded or not
         */
        get: function () {
            return this.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioBuffer.prototype, "duration", {
        /**
         * The duration of the buffer in seconds.
         */
        get: function () {
            if (this._buffer) {
                return this._buffer.duration;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioBuffer.prototype, "length", {
        /**
         * The length of the buffer in samples
         */
        get: function () {
            if (this._buffer) {
                return this._buffer.length;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioBuffer.prototype, "numberOfChannels", {
        /**
         * The number of discrete audio channels. Returns 0 if no buffer is loaded.
         */
        get: function () {
            if (this._buffer) {
                return this._buffer.numberOfChannels;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToneAudioBuffer.prototype, "reverse", {
        /**
         * Reverse the buffer.
         */
        get: function () {
            return this._reversed;
        },
        set: function (rev) {
            if (this._reversed !== rev) {
                this._reversed = rev;
                this._reverse();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create a ToneAudioBuffer from the array. To create a multichannel AudioBuffer,
     * pass in a multidimensional array.
     * @param array The array to fill the audio buffer
     * @return A ToneAudioBuffer created from the array
     */
    ToneAudioBuffer.fromArray = function (array) {
        return (new ToneAudioBuffer()).fromArray(array);
    };
    /**
     * Creates a ToneAudioBuffer from a URL, returns a promise which resolves to a ToneAudioBuffer
     * @param  url The url to load.
     * @return A promise which resolves to a ToneAudioBuffer
     */
    ToneAudioBuffer.fromUrl = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var buffer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = new ToneAudioBuffer();
                        return [4 /*yield*/, buffer.load(url)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Loads a url using fetch and returns the AudioBuffer.
     */
    ToneAudioBuffer.load = function (url) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var matches, extensions, extension, extensions_1, extensions_1_1, ext, baseUrl, response, arrayBuffer, audioBuffer;
            var e_2, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        matches = url.match(/\[(.+\|?)+\]$/);
                        if (matches) {
                            extensions = matches[1].split("|");
                            extension = extensions[0];
                            try {
                                for (extensions_1 = tslib_1.__values(extensions), extensions_1_1 = extensions_1.next(); !extensions_1_1.done; extensions_1_1 = extensions_1.next()) {
                                    ext = extensions_1_1.value;
                                    if (ToneAudioBuffer.supportsType(ext)) {
                                        extension = ext;
                                        break;
                                    }
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (extensions_1_1 && !extensions_1_1.done && (_a = extensions_1.return)) _a.call(extensions_1);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            url = url.replace(matches[0], extension);
                        }
                        baseUrl = ToneAudioBuffer.baseUrl === "" || ToneAudioBuffer.baseUrl.endsWith("/") ? ToneAudioBuffer.baseUrl : ToneAudioBuffer.baseUrl + "/";
                        return [4 /*yield*/, fetch(baseUrl + url)];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("could not load url: " + url);
                        }
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        arrayBuffer = _b.sent();
                        return [4 /*yield*/, getContext().decodeAudioData(arrayBuffer)];
                    case 3:
                        audioBuffer = _b.sent();
                        return [2 /*return*/, audioBuffer];
                }
            });
        });
    };
    /**
     * Checks a url's extension to see if the current browser can play that file type.
     * @param url The url/extension to test
     * @return If the file extension can be played
     * @static
     * @example
     * import { ToneAudioBuffer } from "tone";
     * ToneAudioBuffer.supportsType("wav"); // returns true
     * ToneAudioBuffer.supportsType("path/to/file.wav"); // returns true
     */
    ToneAudioBuffer.supportsType = function (url) {
        var extensions = url.split(".");
        var extension = extensions[extensions.length - 1];
        var response = document.createElement("audio").canPlayType("audio/" + extension);
        return response !== "";
    };
    /**
     * Returns a Promise which resolves when all of the buffers have loaded
     */
    ToneAudioBuffer.loaded = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, _b, promise, e_3_1;
            var e_3, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, 6, 7]);
                        _a = tslib_1.__values(ToneAudioBuffer.downloads), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3 /*break*/, 4];
                        promise = _b.value;
                        return [4 /*yield*/, promise];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _b = _a.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    //-------------------------------------
    // STATIC METHODS
    //-------------------------------------
    /**
     * A path which is prefixed before every url.
     */
    ToneAudioBuffer.baseUrl = "";
    /**
     * All of the downloads
     */
    ToneAudioBuffer.downloads = [];
    return ToneAudioBuffer;
}(Tone));
export { ToneAudioBuffer };
//# sourceMappingURL=ToneAudioBuffer.js.map
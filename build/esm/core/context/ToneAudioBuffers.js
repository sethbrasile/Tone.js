import * as tslib_1 from "tslib";
import { Tone } from "../Tone";
import { optionsFromArguments } from "../util/Defaults";
import { noOp } from "../util/Interface";
import { isString } from "../util/TypeCheck";
import { ToneAudioBuffer } from "./ToneAudioBuffer";
import { assert } from "../util/Debug";
/**
 * A data structure for holding multiple buffers in a Map-like datastructure.
 *
 * @example
 * import { Player, ToneAudioBuffers } from "tone";
 * const pianoSamples = new ToneAudioBuffers({
 * 	C1: "https://tonejs.github.io/examples/audio/casio/C1.mp3",
 * 	C2: "https://tonejs.github.io/examples/audio/casio/C2.mp3",
 * }, () => {
 * 	const player = new Player().toDestination();
 * 	// play one of the samples when they all load
 * 	player.buffer = pianoSamples.get("C2");
 * 	player.start();
 * });
 * @example
 * import { ToneAudioBuffers } from "tone";
 * // To pass in additional parameters in the second parameter
 * const buffers = new ToneAudioBuffers({
 * 	 urls: {
 * 		 C1: "C1.mp3",
 * 		 C2: "C2.mp3",
 * 	 },
 * 	 onload: () => console.log("loaded"),
 * 	 baseUrl: "https://tonejs.github.io/examples/audio/casio/"
 * });
 * @category Core
 */
var ToneAudioBuffers = /** @class */ (function (_super) {
    tslib_1.__extends(ToneAudioBuffers, _super);
    function ToneAudioBuffers() {
        var _this = _super.call(this) || this;
        _this.name = "ToneAudioBuffers";
        /**
         * All of the buffers
         */
        _this._buffers = new Map();
        /**
         * Keep track of the number of loaded buffers
         */
        _this._loadingCount = 0;
        var options = optionsFromArguments(ToneAudioBuffers.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
        _this.baseUrl = options.baseUrl;
        // add each one
        Object.keys(options.urls).forEach(function (name) {
            _this._loadingCount++;
            var url = options.urls[name];
            _this.add(name, url, _this._bufferLoaded.bind(_this, options.onload), options.onerror);
        });
        return _this;
    }
    ToneAudioBuffers.getDefaults = function () {
        return {
            baseUrl: "",
            onerror: noOp,
            onload: noOp,
            urls: {},
        };
    };
    /**
     * True if the buffers object has a buffer by that name.
     * @param  name  The key or index of the buffer.
     */
    ToneAudioBuffers.prototype.has = function (name) {
        return this._buffers.has(name.toString());
    };
    /**
     * Get a buffer by name. If an array was loaded,
     * then use the array index.
     * @param  name  The key or index of the buffer.
     */
    ToneAudioBuffers.prototype.get = function (name) {
        assert(this.has(name), "ToneAudioBuffers has no buffer named: " + name);
        return this._buffers.get(name.toString());
    };
    /**
     * A buffer was loaded. decrement the counter.
     */
    ToneAudioBuffers.prototype._bufferLoaded = function (callback) {
        this._loadingCount--;
        if (this._loadingCount === 0 && callback) {
            callback();
        }
    };
    Object.defineProperty(ToneAudioBuffers.prototype, "loaded", {
        /**
         * If the buffers are loaded or not
         */
        get: function () {
            return Array.from(this._buffers).every(function (_a) {
                var _b = tslib_1.__read(_a, 2), _ = _b[0], buffer = _b[1];
                return buffer.loaded;
            });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add a buffer by name and url to the Buffers
     * @param  name      A unique name to give the buffer
     * @param  url  Either the url of the bufer, or a buffer which will be added with the given name.
     * @param  callback  The callback to invoke when the url is loaded.
     * @param  onerror  Invoked if the buffer can't be loaded
     */
    ToneAudioBuffers.prototype.add = function (name, url, callback, onerror) {
        if (callback === void 0) { callback = noOp; }
        if (onerror === void 0) { onerror = noOp; }
        if (isString(url)) {
            this._buffers.set(name.toString(), new ToneAudioBuffer(this.baseUrl + url, callback, onerror));
        }
        else {
            this._buffers.set(name.toString(), new ToneAudioBuffer(url, callback, onerror));
        }
        return this;
    };
    ToneAudioBuffers.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._buffers.forEach(function (buffer) { return buffer.dispose(); });
        this._buffers.clear();
        return this;
    };
    return ToneAudioBuffers;
}(Tone));
export { ToneAudioBuffers };
//# sourceMappingURL=ToneAudioBuffers.js.map
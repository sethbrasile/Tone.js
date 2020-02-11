import * as tslib_1 from "tslib";
import { createOfflineAudioContext } from "../context/AudioContext";
import { Context } from "../context/Context";
import { isOfflineAudioContext } from "../util/AdvancedTypeCheck";
import { ToneAudioBuffer } from "./ToneAudioBuffer";
/**
 * Wrapper around the OfflineAudioContext
 * @category Core
 */
var OfflineContext = /** @class */ (function (_super) {
    tslib_1.__extends(OfflineContext, _super);
    function OfflineContext() {
        var _this = _super.call(this, {
            clockSource: "offline",
            context: isOfflineAudioContext(arguments[0]) ?
                arguments[0] : createOfflineAudioContext(arguments[0], arguments[1] * arguments[2], arguments[2]),
            lookAhead: 0,
            updateInterval: isOfflineAudioContext(arguments[0]) ?
                128 / arguments[0].sampleRate : 128 / arguments[2],
        }) || this;
        _this.name = "OfflineContext";
        /**
         * An artificial clock source
         */
        _this._currentTime = 0;
        _this.isOffline = true;
        _this._duration = isOfflineAudioContext(arguments[0]) ?
            arguments[0].length / arguments[0].sampleRate : arguments[1];
        return _this;
    }
    /**
     * Override the now method to point to the internal clock time
     */
    OfflineContext.prototype.now = function () {
        return this._currentTime;
    };
    Object.defineProperty(OfflineContext.prototype, "currentTime", {
        /**
         * Same as this.now()
         */
        get: function () {
            return this._currentTime;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Render just the clock portion of the audio context.
     */
    OfflineContext.prototype._renderClock = function (asynchronous) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var index, yieldEvery;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = 0;
                        _a.label = 1;
                    case 1:
                        if (!(this._duration - this._currentTime >= 0)) return [3 /*break*/, 4];
                        // invoke all the callbacks on that time
                        this.emit("tick");
                        // increment the clock in block-sized chunks
                        this._currentTime += 128 / this.sampleRate;
                        // yield once a second of audio
                        index++;
                        yieldEvery = Math.floor(this.sampleRate / 128);
                        if (!(asynchronous && index % yieldEvery === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (done) { return setTimeout(done, 1); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Render the output of the OfflineContext
     * @param asynchronous If the clock should be rendered asynchronously, which will not block the main thread, but be slightly slower.
     */
    OfflineContext.prototype.render = function (asynchronous) {
        if (asynchronous === void 0) { asynchronous = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var buffer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.workletsAreReady()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._renderClock(asynchronous)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._context.startRendering()];
                    case 3:
                        buffer = _a.sent();
                        return [2 /*return*/, new ToneAudioBuffer(buffer)];
                }
            });
        });
    };
    /**
     * Close the context
     */
    OfflineContext.prototype.close = function () {
        return Promise.resolve();
    };
    return OfflineContext;
}(Context));
export { OfflineContext };
//# sourceMappingURL=OfflineContext.js.map
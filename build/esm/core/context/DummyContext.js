import * as tslib_1 from "tslib";
import { BaseContext } from "./BaseContext";
var DummyContext = /** @class */ (function (_super) {
    tslib_1.__extends(DummyContext, _super);
    function DummyContext() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lookAhead = 0;
        _this.latencyHint = 0;
        _this.isOffline = false;
        return _this;
    }
    //---------------------------
    // BASE AUDIO CONTEXT METHODS
    //---------------------------
    DummyContext.prototype.createAnalyser = function () {
        return {};
    };
    DummyContext.prototype.createOscillator = function () {
        return {};
    };
    DummyContext.prototype.createBufferSource = function () {
        return {};
    };
    DummyContext.prototype.createBiquadFilter = function () {
        return {};
    };
    DummyContext.prototype.createBuffer = function (_numberOfChannels, _length, _sampleRate) {
        return {};
    };
    DummyContext.prototype.createChannelMerger = function (_numberOfInputs) {
        return {};
    };
    DummyContext.prototype.createChannelSplitter = function (_numberOfOutputs) {
        return {};
    };
    DummyContext.prototype.createConstantSource = function () {
        return {};
    };
    DummyContext.prototype.createConvolver = function () {
        return {};
    };
    DummyContext.prototype.createDelay = function (_maxDelayTime) {
        return {};
    };
    DummyContext.prototype.createDynamicsCompressor = function () {
        return {};
    };
    DummyContext.prototype.createGain = function () {
        return {};
    };
    DummyContext.prototype.createIIRFilter = function (_feedForward, _feedback) {
        return {};
    };
    DummyContext.prototype.createPanner = function () {
        return {};
    };
    DummyContext.prototype.createPeriodicWave = function (_real, _imag, _constraints) {
        return {};
    };
    DummyContext.prototype.createStereoPanner = function () {
        return {};
    };
    DummyContext.prototype.createWaveShaper = function () {
        return {};
    };
    DummyContext.prototype.createMediaStreamSource = function (_stream) {
        return {};
    };
    DummyContext.prototype.decodeAudioData = function (_audioData) {
        return Promise.resolve({});
    };
    //---------------------------
    // TONE AUDIO CONTEXT METHODS
    //---------------------------
    DummyContext.prototype.createAudioWorkletNode = function (_name, _options) {
        return {};
    };
    Object.defineProperty(DummyContext.prototype, "rawContext", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    DummyContext.prototype.addAudioWorkletModule = function (_url, _name) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    DummyContext.prototype.resume = function () {
        return Promise.resolve();
    };
    DummyContext.prototype.setTimeout = function (_fn, _timeout) {
        return 0;
    };
    DummyContext.prototype.clearTimeout = function (_id) {
        return this;
    };
    DummyContext.prototype.setInterval = function (_fn, _interval) {
        return 0;
    };
    DummyContext.prototype.clearInterval = function (_id) {
        return this;
    };
    DummyContext.prototype.getConstant = function (_val) {
        return {};
    };
    Object.defineProperty(DummyContext.prototype, "currentTime", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DummyContext.prototype, "state", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DummyContext.prototype, "sampleRate", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DummyContext.prototype, "listener", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DummyContext.prototype, "transport", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DummyContext.prototype, "draw", {
        get: function () {
            return {};
        },
        set: function (_d) { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DummyContext.prototype, "destination", {
        get: function () {
            return {};
        },
        set: function (_d) { },
        enumerable: true,
        configurable: true
    });
    DummyContext.prototype.now = function () {
        return 0;
    };
    DummyContext.prototype.immediate = function () {
        return 0;
    };
    return DummyContext;
}(BaseContext));
export { DummyContext };
//# sourceMappingURL=DummyContext.js.map
import * as tslib_1 from "tslib";
import { Merge } from "../component/channel/Merge";
import { Gain } from "../core/context/Gain";
import { optionsFromArguments } from "../core/util/Defaults";
import { Noise } from "../source/Noise";
import { Effect } from "./Effect";
import { OfflineContext } from "../core/context/OfflineContext";
import { noOp } from "../core/util/Interface";
import { assertRange } from "../core/util/Debug";
/**
 * Simple convolution created with decaying noise.
 * Generates an Impulse Response Buffer
 * with Tone.Offline then feeds the IR into ConvolverNode.
 * The impulse response generation is async, so you have
 * to wait until [[ready]] resolves before it will make a sound.
 *
 * Inspiration from [ReverbGen](https://github.com/adelespinasse/reverbGen).
 * Copyright (c) 2014 Alan deLespinasse Apache 2.0 License.
 *
 * @category Effect
 */
var Reverb = /** @class */ (function (_super) {
    tslib_1.__extends(Reverb, _super);
    function Reverb() {
        var _this = _super.call(this, optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"])) || this;
        _this.name = "Reverb";
        /**
         * Convolver node
         */
        _this._convolver = _this.context.createConvolver();
        /**
         * Resolves when the reverb buffer is generated. Whenever either [[decay]]
         * or [[preDelay]] are set, you have to wait until [[ready]] resolves
         * before the IR is generated with the latest values.
         */
        _this.ready = Promise.resolve();
        var options = optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]);
        _this._decay = options.decay;
        _this._preDelay = options.preDelay;
        _this.generate();
        _this.connectEffect(_this._convolver);
        return _this;
    }
    Reverb.getDefaults = function () {
        return Object.assign(Effect.getDefaults(), {
            decay: 1.5,
            preDelay: 0.01,
        });
    };
    Object.defineProperty(Reverb.prototype, "decay", {
        /**
         * The duration of the reverb.
         */
        get: function () {
            return this._decay;
        },
        set: function (time) {
            time = this.toSeconds(time);
            assertRange(time, 0.001);
            this._decay = time;
            this.generate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reverb.prototype, "preDelay", {
        /**
         * The amount of time before the reverb is fully ramped in.
         */
        get: function () {
            return this._preDelay;
        },
        set: function (time) {
            time = this.toSeconds(time);
            assertRange(time, 0);
            this._preDelay = time;
            this.generate();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Generate the Impulse Response. Returns a promise while the IR is being generated.
     * @return Promise which returns this object.
     */
    Reverb.prototype.generate = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var previousReady, context, noiseL, noiseR, merge, gainNode, renderPromise, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        previousReady = this.ready;
                        context = new OfflineContext(2, this._decay + this._preDelay, this.context.sampleRate);
                        noiseL = new Noise({ context: context });
                        noiseR = new Noise({ context: context });
                        merge = new Merge({ context: context });
                        noiseL.connect(merge, 0, 0);
                        noiseR.connect(merge, 0, 1);
                        gainNode = new Gain({ context: context }).toDestination();
                        merge.connect(gainNode);
                        noiseL.start(0);
                        noiseR.start(0);
                        // predelay
                        gainNode.gain.setValueAtTime(0, 0);
                        gainNode.gain.setValueAtTime(1, this._preDelay);
                        // decay
                        gainNode.gain.exponentialApproachValueAtTime(0, this._preDelay, this.decay);
                        renderPromise = context.render();
                        this.ready = renderPromise.then(noOp);
                        // wait for the previous `ready` to resolve
                        return [4 /*yield*/, previousReady];
                    case 1:
                        // wait for the previous `ready` to resolve
                        _b.sent();
                        // set the buffer
                        _a = this._convolver;
                        return [4 /*yield*/, renderPromise];
                    case 2:
                        // set the buffer
                        _a.buffer = (_b.sent()).get();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    Reverb.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._convolver.disconnect();
        return this;
    };
    return Reverb;
}(Effect));
export { Reverb };
//# sourceMappingURL=Reverb.js.map
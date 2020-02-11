import * as tslib_1 from "tslib";
import { Ticker } from "../clock/Ticker";
import { isAudioContext } from "../util/AdvancedTypeCheck";
import { optionsFromArguments } from "../util/Defaults";
import { Timeline } from "../util/Timeline";
import { isDefined, isString } from "../util/TypeCheck";
import { createAudioContext, createAudioWorkletNode } from "./AudioContext";
import { closeContext, initializeContext } from "./ContextInitialization";
import { BaseContext } from "./BaseContext";
import { assert } from "../util/Debug";
/**
 * Wrapper around the native AudioContext.
 * @category Core
 */
var Context = /** @class */ (function (_super) {
    tslib_1.__extends(Context, _super);
    function Context() {
        var _this = _super.call(this) || this;
        _this.name = "Context";
        /**
         * An object containing all of the constants AudioBufferSourceNodes
         */
        _this._constants = new Map();
        /**
         * All of the setTimeout events.
         */
        _this._timeouts = new Timeline();
        /**
         * The timeout id counter
         */
        _this._timeoutIds = 0;
        /**
         * Private indicator if the context has been initialized
         */
        _this._initialized = false;
        /**
         * Indicates if the context is an OfflineAudioContext or an AudioContext
         */
        _this.isOffline = false;
        //--------------------------------------------
        // AUDIO WORKLET
        //--------------------------------------------
        /**
         * Maps a module name to promise of the addModule method
         */
        _this._workletModules = new Map();
        var options = optionsFromArguments(Context.getDefaults(), arguments, ["context"]);
        if (options.context) {
            _this._context = options.context;
        }
        else {
            _this._context = createAudioContext();
        }
        _this._latencyHint = options.latencyHint;
        _this.lookAhead = options.lookAhead;
        _this._ticker = new Ticker(_this.emit.bind(_this, "tick"), options.clockSource, options.updateInterval);
        _this.on("tick", _this._timeoutLoop.bind(_this));
        // fwd events from the context
        _this._context.onstatechange = function () {
            _this.emit("statechange", _this.state);
        };
        return _this;
    }
    Context.getDefaults = function () {
        return {
            clockSource: "worker",
            latencyHint: "interactive",
            lookAhead: 0.1,
            updateInterval: 0.05,
        };
    };
    /**
     * Finish setting up the context. **You usually do not need to do this manually.**
     */
    Context.prototype.initialize = function () {
        if (!this._initialized) {
            // add any additional modules
            initializeContext(this);
            this._initialized = true;
        }
        return this;
    };
    //---------------------------
    // BASE AUDIO CONTEXT METHODS
    //---------------------------
    Context.prototype.createAnalyser = function () {
        return this._context.createAnalyser();
    };
    Context.prototype.createOscillator = function () {
        return this._context.createOscillator();
    };
    Context.prototype.createBufferSource = function () {
        return this._context.createBufferSource();
    };
    Context.prototype.createBiquadFilter = function () {
        return this._context.createBiquadFilter();
    };
    Context.prototype.createBuffer = function (numberOfChannels, length, sampleRate) {
        return this._context.createBuffer(numberOfChannels, length, sampleRate);
    };
    Context.prototype.createChannelMerger = function (numberOfInputs) {
        return this._context.createChannelMerger(numberOfInputs);
    };
    Context.prototype.createChannelSplitter = function (numberOfOutputs) {
        return this._context.createChannelSplitter(numberOfOutputs);
    };
    Context.prototype.createConstantSource = function () {
        return this._context.createConstantSource();
    };
    Context.prototype.createConvolver = function () {
        return this._context.createConvolver();
    };
    Context.prototype.createDelay = function (maxDelayTime) {
        return this._context.createDelay(maxDelayTime);
    };
    Context.prototype.createDynamicsCompressor = function () {
        return this._context.createDynamicsCompressor();
    };
    Context.prototype.createGain = function () {
        return this._context.createGain();
    };
    Context.prototype.createIIRFilter = function (feedForward, feedback) {
        // @ts-ignore
        return this._context.createIIRFilter(feedForward, feedback);
    };
    Context.prototype.createPanner = function () {
        return this._context.createPanner();
    };
    Context.prototype.createPeriodicWave = function (real, imag, constraints) {
        return this._context.createPeriodicWave(real, imag, constraints);
    };
    Context.prototype.createStereoPanner = function () {
        return this._context.createStereoPanner();
    };
    Context.prototype.createWaveShaper = function () {
        return this._context.createWaveShaper();
    };
    Context.prototype.createMediaStreamSource = function (stream) {
        if (isAudioContext(this._context)) {
            return this._context.createMediaStreamSource(stream);
        }
        else {
            throw new Error("Only available on online audio context");
        }
    };
    Context.prototype.decodeAudioData = function (audioData) {
        return this._context.decodeAudioData(audioData);
    };
    Object.defineProperty(Context.prototype, "currentTime", {
        /**
         * The current time in seconds of the AudioContext.
         */
        get: function () {
            return this._context.currentTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "state", {
        /**
         * The current time in seconds of the AudioContext.
         */
        get: function () {
            return this._context.state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "sampleRate", {
        /**
         * The current time in seconds of the AudioContext.
         */
        get: function () {
            return this._context.sampleRate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "listener", {
        /**
         * The listener
         */
        get: function () {
            this.initialize();
            return this._listener;
        },
        set: function (l) {
            assert(!this._initialized, "The listener cannot be set after initialization.");
            this._listener = l;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "transport", {
        /**
         * There is only one Transport per Context. It is created on initialization.
         */
        get: function () {
            this.initialize();
            return this._transport;
        },
        set: function (t) {
            assert(!this._initialized, "The transport cannot be set after initialization.");
            this._transport = t;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "draw", {
        /**
         * This is the Draw object for the context which is useful for synchronizing the draw frame with the Tone.js clock.
         */
        get: function () {
            this.initialize();
            return this._draw;
        },
        set: function (d) {
            assert(!this._initialized, "Draw cannot be set after initialization.");
            this._draw = d;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "destination", {
        /**
         * A reference to the Context's destination node.
         */
        get: function () {
            this.initialize();
            return this._destination;
        },
        set: function (d) {
            assert(!this._initialized, "The destination cannot be set after initialization.");
            this._destination = d;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Create an audio worklet node from a name and options. The module
     * must first be loaded using [[addAudioWorkletModule]].
     */
    Context.prototype.createAudioWorkletNode = function (name, options) {
        return createAudioWorkletNode(this.rawContext, name, options);
    };
    /**
     * Add an AudioWorkletProcessor module
     * @param url The url of the module
     * @param name The name of the module
     */
    Context.prototype.addAudioWorkletModule = function (url, name) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(isDefined(this.rawContext.audioWorklet), "AudioWorkletNode is only available in a secure context (https or localhost)");
                        if (!this._workletModules.has(name)) {
                            this._workletModules.set(name, this.rawContext.audioWorklet.addModule(url));
                        }
                        return [4 /*yield*/, this._workletModules.get(name)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns a promise which resolves when all of the worklets have been loaded on this context
     */
    Context.prototype.workletsAreReady = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var promises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        this._workletModules.forEach(function (promise) { return promises.push(promise); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Context.prototype, "updateInterval", {
        //---------------------------
        // TICKER
        //---------------------------
        /**
         * How often the interval callback is invoked.
         * This number corresponds to how responsive the scheduling
         * can be. context.updateInterval + context.lookAhead gives you the
         * total latency between scheduling an event and hearing it.
         */
        get: function () {
            return this._ticker.updateInterval;
        },
        set: function (interval) {
            this._ticker.updateInterval = interval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "clockSource", {
        /**
         * What the source of the clock is, either "worker" (default),
         * "timeout", or "offline" (none).
         */
        get: function () {
            return this._ticker.type;
        },
        set: function (type) {
            this._ticker.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "latencyHint", {
        /**
         * The type of playback, which affects tradeoffs between audio
         * output latency and responsiveness.
         * In addition to setting the value in seconds, the latencyHint also
         * accepts the strings "interactive" (prioritizes low latency),
         * "playback" (prioritizes sustained playback), "balanced" (balances
         * latency and performance), and "fastest" (lowest latency, might glitch more often).
         * @example
         * import * as Tone from "tone";
         * // set the latencyHint to prioritize smooth playback at the expensive of latency
         * Tone.context.latencyHint = "playback";
         */
        get: function () {
            return this._latencyHint;
        },
        set: function (hint) {
            var lookAheadValue = 0;
            this._latencyHint = hint;
            if (isString(hint)) {
                switch (hint) {
                    case "interactive":
                        lookAheadValue = 0.1;
                        break;
                    case "playback":
                        lookAheadValue = 0.8;
                        break;
                    case "balanced":
                        lookAheadValue = 0.25;
                        break;
                    case "fastest":
                        lookAheadValue = 0.01;
                        break;
                }
            }
            this.lookAhead = lookAheadValue;
            this.updateInterval = lookAheadValue / 2;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "rawContext", {
        /**
         * The unwrapped AudioContext.
         */
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The current audio context time plus a short [[lookAhead]].
     */
    Context.prototype.now = function () {
        return this._context.currentTime + this.lookAhead;
    };
    /**
     * The current audio context time without the [[lookAhead]].
     * In most cases it is better to use [[now]] instead of [[immediate]] since
     * with [[now]] the [[lookAhead]] is applied equally to _all_ components including internal components,
     * to making sure that everything is scheduled in sync. Mixing [[now]] and [[immediate]]
     * can cause some timing issues. If no lookAhead is desired, you can set the [[lookAhead]] to `0`.
     */
    Context.prototype.immediate = function () {
        return this._context.currentTime;
    };
    /**
     * Starts the audio context from a suspended state. This is required
     * to initially start the AudioContext.
     */
    Context.prototype.resume = function () {
        if (this._context.state === "suspended" && isAudioContext(this._context)) {
            return this._context.resume();
        }
        else {
            return Promise.resolve();
        }
    };
    /**
     * Promise which is invoked when the context is running.
     * Tries to resume the context if it's not started.
     */
    Context.prototype.close = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isAudioContext(this._context)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._context.close()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this._initialized) {
                            closeContext(this);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a looped buffer at some constant value.
     */
    Context.prototype.getConstant = function (val) {
        if (this._constants.has(val)) {
            return this._constants.get(val);
        }
        else {
            var buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
            var arr = buffer.getChannelData(0);
            for (var i = 0; i < arr.length; i++) {
                arr[i] = val;
            }
            var constant = this._context.createBufferSource();
            constant.channelCount = 1;
            constant.channelCountMode = "explicit";
            constant.buffer = buffer;
            constant.loop = true;
            constant.start(0);
            this._constants.set(val, constant);
            return constant;
        }
    };
    /**
     * Clean up. Also closes the audio context.
     */
    Context.prototype.dispose = function () {
        var _this = this;
        _super.prototype.dispose.call(this);
        this._ticker.dispose();
        this._timeouts.dispose();
        Object.keys(this._constants).map(function (val) { return _this._constants[val].disconnect(); });
        return this;
    };
    //---------------------------
    // TIMEOUTS
    //---------------------------
    /**
     * The private loop which keeps track of the context scheduled timeouts
     * Is invoked from the clock source
     */
    Context.prototype._timeoutLoop = function () {
        var now = this.now();
        var firstEvent = this._timeouts.peek();
        while (this._timeouts.length && firstEvent && firstEvent.time <= now) {
            // invoke the callback
            firstEvent.callback();
            // shift the first event off
            this._timeouts.shift();
            // get the next one
            firstEvent = this._timeouts.peek();
        }
    };
    /**
     * A setTimeout which is guaranteed by the clock source.
     * Also runs in the offline context.
     * @param  fn       The callback to invoke
     * @param  timeout  The timeout in seconds
     * @returns ID to use when invoking Context.clearTimeout
     */
    Context.prototype.setTimeout = function (fn, timeout) {
        this._timeoutIds++;
        var now = this.now();
        this._timeouts.add({
            callback: fn,
            id: this._timeoutIds,
            time: now + timeout,
        });
        return this._timeoutIds;
    };
    /**
     * Clears a previously scheduled timeout with Tone.context.setTimeout
     * @param  id  The ID returned from setTimeout
     */
    Context.prototype.clearTimeout = function (id) {
        var _this = this;
        this._timeouts.forEach(function (event) {
            if (event.id === id) {
                _this._timeouts.remove(event);
            }
        });
        return this;
    };
    /**
     * Clear the function scheduled by [[setInterval]]
     */
    Context.prototype.clearInterval = function (id) {
        return this.clearTimeout(id);
    };
    /**
     * Adds a repeating event to the context's callback clock
     */
    Context.prototype.setInterval = function (fn, interval) {
        var _this = this;
        var id = ++this._timeoutIds;
        var intervalFn = function () {
            var now = _this.now();
            _this._timeouts.add({
                callback: function () {
                    // invoke the callback
                    fn();
                    // invoke the event to repeat it
                    intervalFn();
                },
                id: id,
                time: now + interval,
            });
        };
        // kick it off
        intervalFn();
        return id;
    };
    return Context;
}(BaseContext));
export { Context };
//# sourceMappingURL=Context.js.map
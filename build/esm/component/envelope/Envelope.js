import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { isArray, isObject, isString } from "../../core/util/TypeCheck";
import { connectSignal, Signal } from "../../signal/Signal";
import { OfflineContext } from "../../core/context/OfflineContext";
import { assert } from "../../core/util/Debug";
import { range, timeRange } from "../../core/util/Decorator";
/**
 * Envelope is an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope)
 * envelope generator. Envelope outputs a signal which
 * can be connected to an AudioParam or Tone.Signal.
 * ```
 *           /\
 *          /  \
 *         /    \
 *        /      \
 *       /        \___________
 *      /                     \
 *     /                       \
 *    /                         \
 *   /                           \
 * ```
 *
 * @example
 * import { Envelope, Gain } from "tone";
 * // an amplitude envelope
 * const gainNode = new Gain();
 * const env = new Envelope({
 * 	attack: 0.1,
 * 	decay: 0.2,
 * 	sustain: 1,
 * 	release: 0.8,
 * });
 * env.connect(gainNode.gain);
 * @category Component
 */
var Envelope = /** @class */ (function (_super) {
    tslib_1.__extends(Envelope, _super);
    function Envelope() {
        var _this = _super.call(this, optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"])) || this;
        _this.name = "Envelope";
        /**
         * the signal which is output.
         */
        _this._sig = new Signal({
            context: _this.context,
            value: 0,
        });
        /**
         * The output signal of the envelope
         */
        _this.output = _this._sig;
        /**
         * Envelope has no input
         */
        _this.input = undefined;
        var options = optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
        _this.attack = options.attack;
        _this.decay = options.decay;
        _this.sustain = options.sustain;
        _this.release = options.release;
        _this.attackCurve = options.attackCurve;
        _this.releaseCurve = options.releaseCurve;
        _this.decayCurve = options.decayCurve;
        return _this;
    }
    Envelope.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            attack: 0.01,
            attackCurve: "linear",
            decay: 0.1,
            decayCurve: "exponential",
            release: 1,
            releaseCurve: "exponential",
            sustain: 0.5,
        });
    };
    Object.defineProperty(Envelope.prototype, "value", {
        /**
         * Read the current value of the envelope. Useful for
         * synchronizing visual output to the envelope.
         */
        get: function () {
            return this.getValueAtTime(this.now());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the curve
     * @param  curve
     * @param  direction  In/Out
     * @return The curve name
     */
    Envelope.prototype._getCurve = function (curve, direction) {
        if (isString(curve)) {
            return curve;
        }
        else {
            // look up the name in the curves array
            var curveName = void 0;
            for (curveName in EnvelopeCurves) {
                if (EnvelopeCurves[curveName][direction] === curve) {
                    return curveName;
                }
            }
            // return the custom curve
            return curve;
        }
    };
    /**
     * Assign a the curve to the given name using the direction
     * @param  name
     * @param  direction In/Out
     * @param  curve
     */
    Envelope.prototype._setCurve = function (name, direction, curve) {
        // check if it's a valid type
        if (isString(curve) && Reflect.has(EnvelopeCurves, curve)) {
            var curveDef = EnvelopeCurves[curve];
            if (isObject(curveDef)) {
                if (name !== "_decayCurve") {
                    this[name] = curveDef[direction];
                }
            }
            else {
                this[name] = curveDef;
            }
        }
        else if (isArray(curve) && name !== "_decayCurve") {
            this[name] = curve;
        }
        else {
            throw new Error("Envelope: invalid curve: " + curve);
        }
    };
    Object.defineProperty(Envelope.prototype, "attackCurve", {
        /**
         * The shape of the attack.
         * Can be any of these strings:
         * * "linear"
         * * "exponential"
         * * "sine"
         * * "cosine"
         * * "bounce"
         * * "ripple"
         * * "step"
         *
         * Can also be an array which describes the curve. Values
         * in the array are evenly subdivided and linearly
         * interpolated over the duration of the attack.
         * @example
         * import { Envelope } from "tone";
         * const env = new Envelope();
         * env.attackCurve = "linear";
         * @example
         * import { Envelope } from "tone";
         * const env = new Envelope();
         * // can also be an array
         * env.attackCurve = [0, 0.2, 0.3, 0.4, 1];
         */
        get: function () {
            return this._getCurve(this._attackCurve, "In");
        },
        set: function (curve) {
            this._setCurve("_attackCurve", "In", curve);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Envelope.prototype, "releaseCurve", {
        /**
         * The shape of the release. See the attack curve types.
         * @example
         * import { Envelope } from "tone";
         * const env = new Envelope();
         * env.releaseCurve = "linear";
         */
        get: function () {
            return this._getCurve(this._releaseCurve, "Out");
        },
        set: function (curve) {
            this._setCurve("_releaseCurve", "Out", curve);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Envelope.prototype, "decayCurve", {
        /**
         * The shape of the decay either "linear" or "exponential"
         * @example
         * import { Envelope } from "tone";
         * const env = new Envelope();
         * env.decayCurve = "linear";
         */
        get: function () {
            return this._decayCurve;
        },
        set: function (curve) {
            assert(["linear", "exponential"].some(function (c) { return c === curve; }), "Invalid envelope curve: " + curve);
            this._decayCurve = curve;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Trigger the attack/decay portion of the ADSR envelope.
     * @param  time When the attack should start.
     * @param velocity The velocity of the envelope scales the vales.
     *                             number between 0-1
     * @example
     * import { AmplitudeEnvelope, Oscillator } from "tone";
     * const env = new AmplitudeEnvelope().toDestination();
     * const osc = new Oscillator().connect(env).start();
     * // trigger the attack 0.5 seconds from now with a velocity of 0.2
     * env.triggerAttack("+0.5", 0.2);
     */
    Envelope.prototype.triggerAttack = function (time, velocity) {
        if (velocity === void 0) { velocity = 1; }
        this.log("triggerAttack", time, velocity);
        time = this.toSeconds(time);
        var originalAttack = this.toSeconds(this.attack);
        var attack = originalAttack;
        var decay = this.toSeconds(this.decay);
        // check if it's not a complete attack
        var currentValue = this.getValueAtTime(time);
        if (currentValue > 0) {
            // subtract the current value from the attack time
            var attackRate = 1 / attack;
            var remainingDistance = 1 - currentValue;
            // the attack is now the remaining time
            attack = remainingDistance / attackRate;
        }
        // attack
        if (attack < this.sampleTime) {
            this._sig.cancelScheduledValues(time);
            // case where the attack time is 0 should set instantly
            this._sig.setValueAtTime(velocity, time);
        }
        else if (this._attackCurve === "linear") {
            this._sig.linearRampTo(velocity, attack, time);
        }
        else if (this._attackCurve === "exponential") {
            this._sig.targetRampTo(velocity, attack, time);
        }
        else {
            this._sig.cancelAndHoldAtTime(time);
            var curve = this._attackCurve;
            // find the starting position in the curve
            for (var i = 1; i < curve.length; i++) {
                // the starting index is between the two values
                if (curve[i - 1] <= currentValue && currentValue <= curve[i]) {
                    curve = this._attackCurve.slice(i);
                    // the first index is the current value
                    curve[0] = currentValue;
                    break;
                }
            }
            this._sig.setValueCurveAtTime(curve, time, attack, velocity);
        }
        // decay
        if (decay && this.sustain < 1) {
            var decayValue = velocity * this.sustain;
            var decayStart = time + attack;
            this.log("decay", decayStart);
            if (this._decayCurve === "linear") {
                this._sig.linearRampToValueAtTime(decayValue, decay + decayStart);
            }
            else {
                this._sig.exponentialApproachValueAtTime(decayValue, decayStart, decay);
            }
        }
        return this;
    };
    /**
     * Triggers the release of the envelope.
     * @param  time When the release portion of the envelope should start.
     * @example
     * import { AmplitudeEnvelope, Oscillator } from "tone";
     * const env = new AmplitudeEnvelope().toDestination();
     * const osc = new Oscillator().connect(env).start();
     * env.triggerAttack();
     * // trigger the release half a second after the attack
     * env.triggerRelease("+0.5");
     */
    Envelope.prototype.triggerRelease = function (time) {
        this.log("triggerRelease", time);
        time = this.toSeconds(time);
        var currentValue = this.getValueAtTime(time);
        if (currentValue > 0) {
            var release = this.toSeconds(this.release);
            if (release < this.sampleTime) {
                this._sig.setValueAtTime(0, time);
            }
            else if (this._releaseCurve === "linear") {
                this._sig.linearRampTo(0, release, time);
            }
            else if (this._releaseCurve === "exponential") {
                this._sig.targetRampTo(0, release, time);
            }
            else {
                assert(isArray(this._releaseCurve), "releaseCurve must be either 'linear', 'exponential' or an array");
                this._sig.cancelAndHoldAtTime(time);
                this._sig.setValueCurveAtTime(this._releaseCurve, time, release, currentValue);
            }
        }
        return this;
    };
    /**
     * Get the scheduled value at the given time. This will
     * return the unconverted (raw) value.
     */
    Envelope.prototype.getValueAtTime = function (time) {
        return this._sig.getValueAtTime(time);
    };
    /**
     * triggerAttackRelease is shorthand for triggerAttack, then waiting
     * some duration, then triggerRelease.
     * @param duration The duration of the sustain.
     * @param time When the attack should be triggered.
     * @param velocity The velocity of the envelope.
     * @example
     * import { AmplitudeEnvelope, Oscillator } from "tone";
     * const env = new AmplitudeEnvelope().toDestination();
     * const osc = new Oscillator().connect(env).start();
     * // trigger the release 0.5 seconds after the attack
     * env.triggerAttackRelease(0.5);
     */
    Envelope.prototype.triggerAttackRelease = function (duration, time, velocity) {
        if (velocity === void 0) { velocity = 1; }
        time = this.toSeconds(time);
        this.triggerAttack(time, velocity);
        this.triggerRelease(time + this.toSeconds(duration));
        return this;
    };
    /**
     * Cancels all scheduled envelope changes after the given time.
     */
    Envelope.prototype.cancel = function (after) {
        this._sig.cancelScheduledValues(this.toSeconds(after));
        return this;
    };
    /**
     * Connect the envelope to a destination node.
     */
    Envelope.prototype.connect = function (destination, outputNumber, inputNumber) {
        if (outputNumber === void 0) { outputNumber = 0; }
        if (inputNumber === void 0) { inputNumber = 0; }
        connectSignal(this, destination, outputNumber, inputNumber);
        return this;
    };
    /**
     * Render the envelope curve to an array of the given length.
     * Good for visualizing the envelope curve
     */
    Envelope.prototype.asArray = function (length) {
        if (length === void 0) { length = 1024; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var duration, context, attackPortion, envelopeDuration, sustainTime, totalDuration, clone, buffer;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        duration = length / this.context.sampleRate;
                        context = new OfflineContext(1, duration, this.context.sampleRate);
                        attackPortion = this.toSeconds(this.attack) + this.toSeconds(this.decay);
                        envelopeDuration = attackPortion + this.toSeconds(this.release);
                        sustainTime = envelopeDuration * 0.1;
                        totalDuration = envelopeDuration + sustainTime;
                        clone = new this.constructor(Object.assign(this.get(), {
                            attack: duration * this.toSeconds(this.attack) / totalDuration,
                            decay: duration * this.toSeconds(this.decay) / totalDuration,
                            release: duration * this.toSeconds(this.release) / totalDuration,
                            context: context
                        }));
                        clone._sig.toDestination();
                        clone.triggerAttackRelease(duration * (attackPortion + sustainTime) / totalDuration, 0);
                        return [4 /*yield*/, context.render()];
                    case 1:
                        buffer = _a.sent();
                        return [2 /*return*/, buffer.getChannelData(0)];
                }
            });
        });
    };
    Envelope.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._sig.dispose();
        return this;
    };
    tslib_1.__decorate([
        timeRange(0)
    ], Envelope.prototype, "attack", void 0);
    tslib_1.__decorate([
        timeRange(0)
    ], Envelope.prototype, "decay", void 0);
    tslib_1.__decorate([
        range(0, 1)
    ], Envelope.prototype, "sustain", void 0);
    tslib_1.__decorate([
        timeRange(0)
    ], Envelope.prototype, "release", void 0);
    return Envelope;
}(ToneAudioNode));
export { Envelope };
/**
 * Generate some complex envelope curves.
 */
var EnvelopeCurves = (function () {
    var curveLen = 128;
    var i;
    var k;
    // cosine curve
    var cosineCurve = [];
    for (i = 0; i < curveLen; i++) {
        cosineCurve[i] = Math.sin((i / (curveLen - 1)) * (Math.PI / 2));
    }
    // ripple curve
    var rippleCurve = [];
    var rippleCurveFreq = 6.4;
    for (i = 0; i < curveLen - 1; i++) {
        k = (i / (curveLen - 1));
        var sineWave = Math.sin(k * (Math.PI * 2) * rippleCurveFreq - Math.PI / 2) + 1;
        rippleCurve[i] = sineWave / 10 + k * 0.83;
    }
    rippleCurve[curveLen - 1] = 1;
    // stairs curve
    var stairsCurve = [];
    var steps = 5;
    for (i = 0; i < curveLen; i++) {
        stairsCurve[i] = Math.ceil((i / (curveLen - 1)) * steps) / steps;
    }
    // in-out easing curve
    var sineCurve = [];
    for (i = 0; i < curveLen; i++) {
        k = i / (curveLen - 1);
        sineCurve[i] = 0.5 * (1 - Math.cos(Math.PI * k));
    }
    // a bounce curve
    var bounceCurve = [];
    for (i = 0; i < curveLen; i++) {
        k = i / (curveLen - 1);
        var freq = Math.pow(k, 3) * 4 + 0.2;
        var val = Math.cos(freq * Math.PI * 2 * k);
        bounceCurve[i] = Math.abs(val * (1 - k));
    }
    /**
     * Invert a value curve to make it work for the release
     */
    function invertCurve(curve) {
        var out = new Array(curve.length);
        for (var j = 0; j < curve.length; j++) {
            out[j] = 1 - curve[j];
        }
        return out;
    }
    /**
     * reverse the curve
     */
    function reverseCurve(curve) {
        return curve.slice(0).reverse();
    }
    /**
     * attack and release curve arrays
     */
    return {
        bounce: {
            In: invertCurve(bounceCurve),
            Out: bounceCurve,
        },
        cosine: {
            In: cosineCurve,
            Out: reverseCurve(cosineCurve),
        },
        exponential: "exponential",
        linear: "linear",
        ripple: {
            In: rippleCurve,
            Out: invertCurve(rippleCurve),
        },
        sine: {
            In: sineCurve,
            Out: invertCurve(sineCurve),
        },
        step: {
            In: stairsCurve,
            Out: invertCurve(stairsCurve),
        },
    };
})();
//# sourceMappingURL=Envelope.js.map
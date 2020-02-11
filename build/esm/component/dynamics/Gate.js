import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { GreaterThan } from "../../signal/GreaterThan";
import { Gain } from "../../core/context/Gain";
import { Follower } from "../analysis/Follower";
import { optionsFromArguments } from "../../core/util/Defaults";
import { dbToGain, gainToDb } from "../../core/type/Conversions";
/**
 * Gate only passes a signal through when the incoming
 * signal exceeds a specified threshold. It uses [[Follower]] to follow the ampltiude
 * of the incoming signal and compares it to the [[threshold]] value using [[GreaterThan]].
 *
 * @example
 * import { Gate, UserMedia } from "tone";
 * const gate = new Gate(-30, 0.2).toDestination();
 * const mic = new UserMedia().connect(gate);
 * // the gate will only pass through the incoming
 * // signal when it's louder than -30db
 */
var Gate = /** @class */ (function (_super) {
    tslib_1.__extends(Gate, _super);
    function Gate() {
        var _this = _super.call(this, Object.assign(optionsFromArguments(Gate.getDefaults(), arguments, ["threshold", "smoothing"]))) || this;
        _this.name = "Gate";
        var options = optionsFromArguments(Gate.getDefaults(), arguments, ["threshold", "smoothing"]);
        _this._follower = new Follower({
            context: _this.context,
            smoothing: options.smoothing,
        });
        _this._gt = new GreaterThan({
            context: _this.context,
            value: dbToGain(options.threshold),
        });
        _this.input = new Gain({ context: _this.context });
        _this._gate = _this.output = new Gain({ context: _this.context });
        // connections
        _this.input.connect(_this._gate);
        // the control signal
        _this.input.chain(_this._follower, _this._gt, _this._gate.gain);
        return _this;
    }
    Gate.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            smoothing: 0.1,
            threshold: -40
        });
    };
    Object.defineProperty(Gate.prototype, "threshold", {
        /**
         * The threshold of the gate in decibels
         */
        get: function () {
            return gainToDb(this._gt.value);
        },
        set: function (thresh) {
            this._gt.value = dbToGain(thresh);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Gate.prototype, "smoothing", {
        /**
         * The attack/decay speed of the gate. See [[Follower.smoothing]]
         */
        get: function () {
            return this._follower.smoothing;
        },
        set: function (smoothingTime) {
            this._follower.smoothing = smoothingTime;
        },
        enumerable: true,
        configurable: true
    });
    Gate.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.input.dispose();
        this._follower.dispose();
        this._gt.dispose();
        this._gate.dispose();
        return this;
    };
    return Gate;
}(ToneAudioNode));
export { Gate };
//# sourceMappingURL=Gate.js.map
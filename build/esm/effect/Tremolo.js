import * as tslib_1 from "tslib";
import { StereoEffect } from "./StereoEffect";
import { LFO } from "../source/oscillator/LFO";
import { Gain } from "../core/context/Gain";
import { Signal } from "../signal/Signal";
import { optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
/**
 * Tremolo modulates the amplitude of an incoming signal using an [[LFO]].
 * The effect is a stereo effect where the modulation phase is inverted in each channel.
 *
 * @example
 * import { Oscillator, Tremolo } from "tone";
 * // create a tremolo and start it's LFO
 * const tremolo = new Tremolo(9, 0.75).toDestination().start();
 * // route an oscillator through the tremolo and start it
 * const oscillator = new Oscillator().connect(tremolo).start();
 *
 * @category Effect
 */
var Tremolo = /** @class */ (function (_super) {
    tslib_1.__extends(Tremolo, _super);
    function Tremolo() {
        var _this = _super.call(this, optionsFromArguments(Tremolo.getDefaults(), arguments, ["frequency", "depth"])) || this;
        _this.name = "Tremolo";
        var options = optionsFromArguments(Tremolo.getDefaults(), arguments, ["frequency", "depth"]);
        _this._lfoL = new LFO({
            context: _this.context,
            type: options.type,
            min: 1,
            max: 0,
        });
        _this._lfoR = new LFO({
            context: _this.context,
            type: options.type,
            min: 1,
            max: 0,
        });
        _this._amplitudeL = new Gain({ context: _this.context });
        _this._amplitudeR = new Gain({ context: _this.context });
        _this.frequency = new Signal({
            context: _this.context,
            value: options.frequency,
            units: "frequency",
        });
        _this.depth = new Signal({
            context: _this.context,
            value: options.depth,
            units: "normalRange",
        });
        readOnly(_this, ["frequency", "depth"]);
        _this.connectEffectLeft(_this._amplitudeL);
        _this.connectEffectRight(_this._amplitudeR);
        _this._lfoL.connect(_this._amplitudeL.gain);
        _this._lfoR.connect(_this._amplitudeR.gain);
        _this.frequency.fan(_this._lfoL.frequency, _this._lfoR.frequency);
        _this.depth.fan(_this._lfoR.amplitude, _this._lfoL.amplitude);
        _this.spread = options.spread;
        return _this;
    }
    Tremolo.getDefaults = function () {
        return Object.assign(StereoEffect.getDefaults(), {
            frequency: 10,
            type: "sine",
            depth: 0.5,
            spread: 180,
        });
    };
    /**
     * Start the tremolo.
     */
    Tremolo.prototype.start = function (time) {
        this._lfoL.start(time);
        this._lfoR.start(time);
        return this;
    };
    /**
     * Stop the tremolo.
     */
    Tremolo.prototype.stop = function (time) {
        this._lfoL.stop(time);
        this._lfoR.stop(time);
        return this;
    };
    /**
     * Sync the effect to the transport.
     */
    Tremolo.prototype.sync = function () {
        this._lfoL.sync();
        this._lfoR.sync();
        this.context.transport.syncSignal(this.frequency);
        return this;
    };
    /**
     * Unsync the filter from the transport
     */
    Tremolo.prototype.unsync = function () {
        this._lfoL.unsync();
        this._lfoR.unsync();
        this.context.transport.unsyncSignal(this.frequency);
        return this;
    };
    Object.defineProperty(Tremolo.prototype, "type", {
        /**
         * The oscillator type.
         */
        get: function () {
            return this._lfoL.type;
        },
        set: function (type) {
            this._lfoL.type = type;
            this._lfoR.type = type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tremolo.prototype, "spread", {
        /**
         * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
         * When set to 180, LFO's will be panned hard left and right respectively.
         */
        get: function () {
            return this._lfoR.phase - this._lfoL.phase; // 180
        },
        set: function (spread) {
            this._lfoL.phase = 90 - (spread / 2);
            this._lfoR.phase = (spread / 2) + 90;
        },
        enumerable: true,
        configurable: true
    });
    Tremolo.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._lfoL.dispose();
        this._lfoR.dispose();
        this._amplitudeL.dispose();
        this._amplitudeR.dispose();
        this.frequency.dispose();
        this.depth.dispose();
        return this;
    };
    return Tremolo;
}(StereoEffect));
export { Tremolo };
//# sourceMappingURL=Tremolo.js.map
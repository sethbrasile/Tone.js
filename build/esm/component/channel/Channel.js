import * as tslib_1 from "tslib";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import { Solo } from "./Solo";
import { PanVol } from "./PanVol";
import { readOnly } from "../../core/util/Interface";
import { Gain } from "../../core/context/Gain";
/**
 * Channel provides a channel strip interface with volume, pan, solo and mute controls.
 * See [[PanVol]] and [[Solo]]
 * @example
 * import { Channel } from "tone";
 * // pan the incoming signal left and drop the volume 12db
 * const channel = new Channel(-0.25, -12);
 * @category Component
 */
var Channel = /** @class */ (function (_super) {
    tslib_1.__extends(Channel, _super);
    function Channel() {
        var _this = _super.call(this, optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"])) || this;
        _this.name = "Channel";
        var options = optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]);
        _this._solo = _this.input = new Solo({
            solo: options.solo,
            context: _this.context,
        });
        _this._panVol = _this.output = new PanVol({
            context: _this.context,
            pan: options.pan,
            volume: options.volume,
            mute: options.mute,
        });
        _this.pan = _this._panVol.pan;
        _this.volume = _this._panVol.volume;
        _this._solo.connect(_this._panVol);
        readOnly(_this, ["pan", "volume"]);
        return _this;
    }
    Channel.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            pan: 0,
            volume: 0,
            mute: false,
            solo: false
        });
    };
    Object.defineProperty(Channel.prototype, "solo", {
        /**
         * Solo/unsolo the channel. Soloing is only relative to other [[Channels]] and [[Solo]] instances
         */
        get: function () {
            return this._solo.solo;
        },
        set: function (solo) {
            this._solo.solo = solo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "muted", {
        /**
         * If the current instance is muted, i.e. another instance is soloed,
         * or the channel is muted
         */
        get: function () {
            return this._solo.muted || this.mute;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Channel.prototype, "mute", {
        /**
         * Mute/unmute the volume
         */
        get: function () {
            return this._panVol.mute;
        },
        set: function (mute) {
            this._panVol.mute = mute;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the gain node belonging to the bus name. Create it if
     * it doesn't exist
     * @param name The bus name
     */
    Channel.prototype._getBus = function (name) {
        if (!Channel.buses.has(name)) {
            Channel.buses.set(name, new Gain({ context: this.context }));
        }
        return Channel.buses.get(name);
    };
    /**
     * Send audio to another channel using a string. `send` is a lot like
     * [[connect]], except it uses a string instead of an object. This can
     * be useful in large applications to decouple sections since [[send]]
     * and [[receive]] can be invoked separately in order to connect an object
     * @param name The channel name to send the audio
     * @param volume The amount of the signal to send.
     * 	Defaults to 0db, i.e. send the entire signal
     * @returns Returns the gain node of this connection.
     */
    Channel.prototype.send = function (name, volume) {
        if (volume === void 0) { volume = 0; }
        var bus = this._getBus(name);
        var sendKnob = new Gain({
            context: this.context,
            units: "decibels",
            gain: volume,
        });
        this.connect(sendKnob);
        sendKnob.connect(bus);
        return sendKnob;
    };
    /**
     * Receive audio from a channel which was connected with [[send]].
     * @param name The channel name to receive audio from.
     */
    Channel.prototype.receive = function (name) {
        var bus = this._getBus(name);
        bus.connect(this);
        return this;
    };
    Channel.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._panVol.dispose();
        this.pan.dispose();
        this.volume.dispose();
        this._solo.dispose();
        return this;
    };
    /**
     * Store the send/receive channels by name.
     */
    Channel.buses = new Map();
    return Channel;
}(ToneAudioNode));
export { Channel };
//# sourceMappingURL=Channel.js.map
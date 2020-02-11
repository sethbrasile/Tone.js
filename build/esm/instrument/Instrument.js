import * as tslib_1 from "tslib";
import { Volume } from "../component/channel/Volume";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { optionsFromArguments } from "../core/util/Defaults";
import { readOnly } from "../core/util/Interface";
/**
 * Base-class for all instruments
 */
var Instrument = /** @class */ (function (_super) {
    tslib_1.__extends(Instrument, _super);
    function Instrument() {
        var _this = _super.call(this, optionsFromArguments(Instrument.getDefaults(), arguments)) || this;
        /**
         * Keep track of all events scheduled to the transport
         * when the instrument is 'synced'
         */
        _this._scheduledEvents = [];
        /**
         * If the instrument is currently synced
         */
        _this._synced = false;
        _this._original_triggerAttack = _this.triggerAttack;
        _this._original_triggerRelease = _this.triggerRelease;
        var options = optionsFromArguments(Instrument.getDefaults(), arguments);
        _this._volume = _this.output = new Volume({
            context: _this.context,
            volume: options.volume,
        });
        _this.volume = _this._volume.volume;
        readOnly(_this, "volume");
        return _this;
    }
    Instrument.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            volume: 0,
        });
    };
    /**
     * Sync the instrument to the Transport. All subsequent calls of
     * [[triggerAttack]] and [[triggerRelease]] will be scheduled along the transport.
     * @example
     * import { FMSynth, Transport } from "tone";
     * const fmSynth = new FMSynth().toDestination();
     * fmSynth.volume.value = -6;
     * fmSynth.sync();
     * // schedule 3 notes when the transport first starts
     * fmSynth.triggerAttackRelease("C4", "8n", 0);
     * fmSynth.triggerAttackRelease("E4", "8n", "8n");
     * fmSynth.triggerAttackRelease("G4", "8n", "4n");
     * // start the transport to hear the notes
     * Transport.start();
     */
    Instrument.prototype.sync = function () {
        if (!this._synced) {
            this._synced = true;
            this._syncMethod("triggerAttack", 1);
            this._syncMethod("triggerRelease", 0);
        }
        return this;
    };
    /**
     * Wrap the given method so that it can be synchronized
     * @param method Which method to wrap and sync
     * @param  timePosition What position the time argument appears in
     */
    Instrument.prototype._syncMethod = function (method, timePosition) {
        var _this = this;
        var originalMethod = this["_original_" + method] = this[method];
        this[method] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var time = args[timePosition];
            var id = _this.context.transport.schedule(function (t) {
                args[timePosition] = t;
                originalMethod.apply(_this, args);
            }, time);
            _this._scheduledEvents.push(id);
        };
    };
    /**
     * Unsync the instrument from the Transport
     */
    Instrument.prototype.unsync = function () {
        var _this = this;
        this._scheduledEvents.forEach(function (id) { return _this.context.transport.clear(id); });
        this._scheduledEvents = [];
        if (this._synced) {
            this._synced = false;
            this.triggerAttack = this._original_triggerAttack;
            this.triggerRelease = this._original_triggerRelease;
        }
        return this;
    };
    /**
     * Trigger the attack and then the release after the duration.
     * @param  note     The note to trigger.
     * @param  duration How long the note should be held for before
     *                         triggering the release. This value must be greater than 0.
     * @param time  When the note should be triggered.
     * @param  velocity The velocity the note should be triggered at.
     * @example
     * import { Synth } from "tone";
     * const synth = new Synth().toDestination();
     * // trigger "C4" for the duration of an 8th note
     * synth.triggerAttackRelease("C4", "8n");
     */
    Instrument.prototype.triggerAttackRelease = function (note, duration, time, velocity) {
        var computedTime = this.toSeconds(time);
        var computedDuration = this.toSeconds(duration);
        this.triggerAttack(note, computedTime, velocity);
        this.triggerRelease(computedTime + computedDuration);
        return this;
    };
    /**
     * clean up
     * @returns {Instrument} this
     */
    Instrument.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._volume.dispose();
        this.unsync();
        this._scheduledEvents = [];
        return this;
    };
    return Instrument;
}(ToneAudioNode));
export { Instrument };
//# sourceMappingURL=Instrument.js.map
import * as tslib_1 from "tslib";
import { TicksClass } from "../type/Ticks";
import { TransportEvent } from "./TransportEvent";
/**
 * TransportRepeatEvent is an internal class used by Tone.Transport
 * to schedule repeat events. This class should not be instantiated directly.
 */
var TransportRepeatEvent = /** @class */ (function (_super) {
    tslib_1.__extends(TransportRepeatEvent, _super);
    /**
     * @param transport The transport object which the event belongs to
     */
    function TransportRepeatEvent(transport, opts) {
        var _this = _super.call(this, transport, opts) || this;
        /**
         * The ID of the current timeline event
         */
        _this._currentId = -1;
        /**
         * The ID of the next timeline event
         */
        _this._nextId = -1;
        /**
         * The time of the next event
         */
        _this._nextTick = _this.time;
        /**
         * a reference to the bound start method
         */
        _this._boundRestart = _this._restart.bind(_this);
        var options = Object.assign(TransportRepeatEvent.getDefaults(), opts);
        _this.duration = new TicksClass(transport.context, options.duration).valueOf();
        _this._interval = new TicksClass(transport.context, options.interval).valueOf();
        _this._nextTick = options.time;
        _this.transport.on("start", _this._boundRestart);
        _this.transport.on("loopStart", _this._boundRestart);
        _this.context = _this.transport.context;
        _this._restart();
        return _this;
    }
    TransportRepeatEvent.getDefaults = function () {
        return Object.assign({}, TransportEvent.getDefaults(), {
            duration: Infinity,
            interval: 1,
            once: false,
        });
    };
    /**
     * Invoke the callback. Returns the tick time which
     * the next event should be scheduled at.
     * @param  time  The AudioContext time in seconds of the event
     */
    TransportRepeatEvent.prototype.invoke = function (time) {
        // create more events if necessary
        this._createEvents(time);
        // call the super class
        _super.prototype.invoke.call(this, time);
    };
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    TransportRepeatEvent.prototype._createEvents = function (time) {
        // schedule the next event
        var ticks = this.transport.getTicksAtTime(time);
        if (ticks >= this.time && ticks >= this._nextTick && this._nextTick + this._interval < this.time + this.duration) {
            this._nextTick += this._interval;
            this._currentId = this._nextId;
            this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
        }
    };
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    TransportRepeatEvent.prototype._restart = function (time) {
        this.transport.clear(this._currentId);
        this.transport.clear(this._nextId);
        this._nextTick = this.time;
        var ticks = this.transport.getTicksAtTime(time);
        if (ticks > this.time) {
            this._nextTick = this.time + Math.ceil((ticks - this.time) / this._interval) * this._interval;
        }
        this._currentId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
        this._nextTick += this._interval;
        this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
    };
    /**
     * Clean up
     */
    TransportRepeatEvent.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.transport.clear(this._currentId);
        this.transport.clear(this._nextId);
        this.transport.off("start", this._boundRestart);
        this.transport.off("loopStart", this._boundRestart);
        return this;
    };
    return TransportRepeatEvent;
}(TransportEvent));
export { TransportRepeatEvent };
//# sourceMappingURL=TransportRepeatEvent.js.map
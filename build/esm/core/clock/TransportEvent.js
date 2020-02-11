import { noOp } from "../util/Interface";
/**
 * TransportEvent is an internal class used by [[Transport]]
 * to schedule events. Do no invoke this class directly, it is
 * handled from within Tone.Transport.
 */
var TransportEvent = /** @class */ (function () {
    /**
     * @param transport The transport object which the event belongs to
     */
    function TransportEvent(transport, opts) {
        /**
         * The unique id of the event
         */
        this.id = TransportEvent._eventId++;
        var options = Object.assign(TransportEvent.getDefaults(), opts);
        this.transport = transport;
        this.callback = options.callback;
        this._once = options.once;
        this.time = options.time;
    }
    TransportEvent.getDefaults = function () {
        return {
            callback: noOp,
            once: false,
            time: 0,
        };
    };
    /**
     * Invoke the event callback.
     * @param  time  The AudioContext time in seconds of the event
     */
    TransportEvent.prototype.invoke = function (time) {
        if (this.callback) {
            this.callback(time);
            if (this._once) {
                this.transport.clear(this.id);
            }
        }
    };
    /**
     * Clean up
     */
    TransportEvent.prototype.dispose = function () {
        this.callback = undefined;
        return this;
    };
    /**
     * Current ID counter
     */
    TransportEvent._eventId = 0;
    return TransportEvent;
}());
export { TransportEvent };
//# sourceMappingURL=TransportEvent.js.map
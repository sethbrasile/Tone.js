import * as tslib_1 from "tslib";
import { ToneWithContext } from "../context/ToneWithContext";
import { Timeline } from "./Timeline";
import { onContextClose, onContextInit } from "../context/ContextInitialization";
/**
 * Draw is useful for synchronizing visuals and audio events.
 * Callbacks from Tone.Transport or any of the Tone.Event classes
 * always happen _before_ the scheduled time and are not synchronized
 * to the animation frame so they are not good for triggering tightly
 * synchronized visuals and sound. Draw makes it easy to schedule
 * callbacks using the AudioContext time and uses requestAnimationFrame.
 * @example
 * import { Draw, Transport } from "tone";
 * Transport.schedule((time) => {
 *  	// use the time argument to schedule a callback with Draw
 *  	Draw.schedule(() => {
 *  		// do drawing or DOM manipulation here
 *  	}, time);
 * }, "+0.5");
 * @category Core
 */
var Draw = /** @class */ (function (_super) {
    tslib_1.__extends(Draw, _super);
    function Draw() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Draw";
        /**
         * The duration after which events are not invoked.
         */
        _this.expiration = 0.25;
        /**
         * The amount of time before the scheduled time
         * that the callback can be invoked. Default is
         * half the time of an animation frame (0.008 seconds).
         */
        _this.anticipation = 0.008;
        /**
         * All of the events.
         */
        _this._events = new Timeline();
        /**
         * The draw loop
         */
        _this._boundDrawLoop = _this._drawLoop.bind(_this);
        /**
         * The animation frame id
         */
        _this._animationFrame = -1;
        return _this;
    }
    /**
     * Schedule a function at the given time to be invoked
     * on the nearest animation frame.
     * @param  callback  Callback is invoked at the given time.
     * @param  time      The time relative to the AudioContext time to invoke the callback.
     */
    Draw.prototype.schedule = function (callback, time) {
        this._events.add({
            callback: callback,
            time: this.toSeconds(time),
        });
        // start the draw loop on the first event
        if (this._events.length === 1) {
            this._animationFrame = requestAnimationFrame(this._boundDrawLoop);
        }
        return this;
    };
    /**
     * Cancel events scheduled after the given time
     * @param  after  Time after which scheduled events will be removed from the scheduling timeline.
     */
    Draw.prototype.cancel = function (after) {
        this._events.cancel(this.toSeconds(after));
        return this;
    };
    /**
     * The draw loop
     */
    Draw.prototype._drawLoop = function () {
        var now = this.context.currentTime;
        while (this._events.length && this._events.peek().time - this.anticipation <= now) {
            var event_1 = this._events.shift();
            if (event_1 && now - event_1.time <= this.expiration) {
                event_1.callback();
            }
        }
        if (this._events.length > 0) {
            this._animationFrame = requestAnimationFrame(this._boundDrawLoop);
        }
    };
    Draw.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._events.dispose();
        cancelAnimationFrame(this._animationFrame);
        return this;
    };
    return Draw;
}(ToneWithContext));
export { Draw };
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(function (context) {
    context.draw = new Draw({ context: context });
});
onContextClose(function (context) {
    context.draw.dispose();
});
//# sourceMappingURL=Draw.js.map
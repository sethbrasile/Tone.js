import * as tslib_1 from "tslib";
import { Tone } from "../Tone";
import { isUndef } from "./TypeCheck";
/**
 * Emitter gives classes which extend it
 * the ability to listen for and emit events.
 * Inspiration and reference from Jerome Etienne's [MicroEvent](https://github.com/jeromeetienne/microevent.js).
 * MIT (c) 2011 Jerome Etienne.
 */
var Emitter = /** @class */ (function (_super) {
    tslib_1.__extends(Emitter, _super);
    function Emitter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Emitter";
        return _this;
    }
    /**
     * Bind a callback to a specific event.
     * @param  event     The name of the event to listen for.
     * @param  callback  The callback to invoke when the event is emitted
     */
    Emitter.prototype.on = function (event, callback) {
        var _this = this;
        // split the event
        var events = event.split(/\W+/);
        events.forEach(function (eventName) {
            if (isUndef(_this._events)) {
                _this._events = {};
            }
            if (!_this._events.hasOwnProperty(eventName)) {
                _this._events[eventName] = [];
            }
            _this._events[eventName].push(callback);
        });
        return this;
    };
    /**
     * Bind a callback which is only invoked once
     * @param  event     The name of the event to listen for.
     * @param  callback  The callback to invoke when the event is emitted
     */
    Emitter.prototype.once = function (event, callback) {
        var _this = this;
        var boundCallback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // invoke the callback
            callback.apply(void 0, tslib_1.__spread(args));
            // remove the event
            _this.off(event, boundCallback);
        };
        this.on(event, boundCallback);
        return this;
    };
    /**
     * Remove the event listener.
     * @param  event     The event to stop listening to.
     * @param  callback  The callback which was bound to the event with Emitter.on.
     *                   If no callback is given, all callbacks events are removed.
     */
    Emitter.prototype.off = function (event, callback) {
        var _this = this;
        var events = event.split(/\W+/);
        events.forEach(function (eventName) {
            if (isUndef(_this._events)) {
                _this._events = {};
            }
            if (_this._events.hasOwnProperty(event)) {
                if (isUndef(callback)) {
                    _this._events[event] = [];
                }
                else {
                    var eventList = _this._events[event];
                    for (var i = 0; i < eventList.length; i++) {
                        if (eventList[i] === callback) {
                            eventList.splice(i, 1);
                        }
                    }
                }
            }
        });
        return this;
    };
    /**
     * Invoke all of the callbacks bound to the event
     * with any arguments passed in.
     * @param  event  The name of the event.
     * @param args The arguments to pass to the functions listening.
     */
    Emitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this._events) {
            if (this._events.hasOwnProperty(event)) {
                var eventList = this._events[event].slice(0);
                for (var i = 0, len = eventList.length; i < len; i++) {
                    eventList[i].apply(this, args);
                }
            }
        }
        return this;
    };
    /**
     * Add Emitter functions (on/off/emit) to the object
     */
    Emitter.mixin = function (constr) {
        // instance._events = {};
        ["on", "once", "off", "emit"].forEach(function (name) {
            var property = Object.getOwnPropertyDescriptor(Emitter.prototype, name);
            Object.defineProperty(constr.prototype, name, property);
        });
    };
    /**
     * Clean up
     */
    Emitter.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._events = undefined;
        return this;
    };
    return Emitter;
}(Tone));
export { Emitter };
//# sourceMappingURL=Emitter.js.map
import * as tslib_1 from "tslib";
/**
 * Tone.js
 * @author Yotam Mann
 * @license http://opensource.org/licenses/MIT MIT License
 * @copyright 2014-2019 Yotam Mann
 */
import { version } from "../version";
import { theWindow } from "./context/AudioContext";
import { log } from "./util/Debug";
/**
 * @class  Tone is the base class of all other classes.
 * @constructor
 */
var Tone = /** @class */ (function () {
    function Tone() {
        //-------------------------------------
        // 	DEBUGGING
        //-------------------------------------
        /**
         * Set this debug flag to log all events that happen in this class.
         */
        this.debug = false;
        //-------------------------------------
        // 	DISPOSING
        //-------------------------------------
        /**
         * Indicates if the instance was disposed
         */
        this._wasDisposed = false;
    }
    /**
     * Returns all of the default options belonging to the class.
     */
    Tone.getDefaults = function () {
        return {};
    };
    /**
     * Prints the outputs to the console log for debugging purposes.
     * Prints the contents only if either the object has a property
     * called `debug` set to true, or a variable called TONE_DEBUG_CLASS
     * is set to the name of the class.
     * @example
     * import { Oscillator } from "tone";
     * const osc = new Oscillator();
     * // prints all logs originating from this oscillator
     * osc.debug = true;
     * // calls to start/stop will print in the console
     * osc.start();
     */
    Tone.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // if the object is either set to debug = true
        // or if there is a string on the Tone.global.with the class name
        if (this.debug || (theWindow && this.toString() === theWindow.TONE_DEBUG_CLASS)) {
            log.apply(void 0, tslib_1.__spread([this], args));
        }
    };
    /**
     * disconnect and dispose.
     */
    Tone.prototype.dispose = function () {
        this._wasDisposed = true;
        return this;
    };
    Object.defineProperty(Tone.prototype, "disposed", {
        /**
         * Indicates if the instance was disposed. 'Disposing' an
         * instance means that all of the Web Audio nodes that were
         * created for the instance are disconnected and freed for garbage collection.
         */
        get: function () {
            return this._wasDisposed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Convert the class to a string
     * @example
     * import { Oscillator } from "tone";
     * const osc = new Oscillator();
     * console.log(osc.toString());
     */
    Tone.prototype.toString = function () {
        return this.name;
    };
    /**
     * The version number semver
     */
    Tone.version = version;
    return Tone;
}());
export { Tone };
//# sourceMappingURL=Tone.js.map
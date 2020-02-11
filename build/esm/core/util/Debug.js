import * as tslib_1 from "tslib";
/**
 * Assert that the statement is true, otherwise invoke the error.
 * @param statement
 * @param error The message which is passed into an Error
 */
export function assert(statement, error) {
    if (!statement) {
        throw new Error(error);
    }
}
/**
 * Make sure that the given value is within the range
 */
export function assertRange(value, gte, lte) {
    if (lte === void 0) { lte = Infinity; }
    if (!(gte <= value && value <= lte)) {
        throw new RangeError("Value must be within [" + gte + ", " + lte + "], got: " + value);
    }
}
/**
 * Make sure that the given value is within the range
 */
export function assertContextRunning(context) {
    // add a warning if the context is not started
    if (!context.isOffline && context.state !== "running") {
        warn("The AudioContext is \"suspended\". Invoke Tone.start() from a user action to start the audio.");
    }
}
/**
 * The default logger is the console
 */
var defaultLogger = console;
/**
 * Set the logging interface
 */
export function setLogger(logger) {
    defaultLogger = logger;
}
/**
 * Log anything
 */
export function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    defaultLogger.log.apply(defaultLogger, tslib_1.__spread(args));
}
/**
 * Warn anything
 */
export function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    defaultLogger.warn.apply(defaultLogger, tslib_1.__spread(args));
}
//# sourceMappingURL=Debug.js.map
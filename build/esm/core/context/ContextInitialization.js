//-------------------------------------
// INITIALIZING NEW CONTEXT
//-------------------------------------
/**
 * Array of callbacks to invoke when a new context is created
 */
var notifyNewContext = [];
/**
 * Used internally to setup a new Context
 */
export function onContextInit(cb) {
    notifyNewContext.push(cb);
}
/**
 * Invoke any classes which need to also be initialized when a new context is created.
 */
export function initializeContext(ctx) {
    // add any additional modules
    notifyNewContext.forEach(function (cb) { return cb(ctx); });
}
/**
 * Array of callbacks to invoke when a new context is created
 */
var notifyCloseContext = [];
/**
 * Used internally to tear down a Context
 */
export function onContextClose(cb) {
    notifyCloseContext.push(cb);
}
export function closeContext(ctx) {
    // add any additional modules
    notifyCloseContext.forEach(function (cb) { return cb(ctx); });
}
//# sourceMappingURL=ContextInitialization.js.map
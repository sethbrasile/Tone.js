import * as tslib_1 from "tslib";
import { isAudioBuffer, isAudioNode, isAudioParam } from "./AdvancedTypeCheck";
import { isDefined, isObject, isUndef } from "./TypeCheck";
/**
 * Some objects should not be merged
 */
function noCopy(key, arg) {
    return key === "value" || isAudioParam(arg) || isAudioNode(arg) || isAudioBuffer(arg);
}
export function deepMerge(target) {
    var _a, _b;
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    if (!sources.length) {
        return target;
    }
    var source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (var key in source) {
            if (noCopy(key, source[key])) {
                target[key] = source[key];
            }
            else if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, (_a = {}, _a[key] = {}, _a));
                }
                deepMerge(target[key], source[key]);
            }
            else {
                Object.assign(target, (_b = {}, _b[key] = source[key], _b));
            }
        }
    }
    // @ts-ignore
    return deepMerge.apply(void 0, tslib_1.__spread([target], sources));
}
/**
 * Returns true if the two arrays have the same value for each of the elements
 */
export function deepEquals(arrayA, arrayB) {
    return arrayA.length === arrayB.length && arrayA.every(function (element, index) { return arrayB[index] === element; });
}
/**
 * Convert an args array into an object.
 */
export function optionsFromArguments(defaults, argsArray, keys, objKey) {
    var _a;
    if (keys === void 0) { keys = []; }
    var opts = {};
    var args = Array.from(argsArray);
    // if the first argument is an object and has an object key
    if (isObject(args[0]) && objKey && !Reflect.has(args[0], objKey)) {
        // if it's not part of the defaults
        var partOfDefaults = Object.keys(args[0]).some(function (key) { return Reflect.has(defaults, key); });
        if (!partOfDefaults) {
            // merge that key
            deepMerge(opts, (_a = {}, _a[objKey] = args[0], _a));
            // remove the obj key from the keys
            keys.splice(keys.indexOf(objKey), 1);
            // shift the first argument off
            args.shift();
        }
    }
    if (args.length === 1 && isObject(args[0])) {
        deepMerge(opts, args[0]);
    }
    else {
        for (var i = 0; i < keys.length; i++) {
            if (isDefined(args[i])) {
                opts[keys[i]] = args[i];
            }
        }
    }
    return deepMerge(defaults, opts);
}
/**
 * Return this instances default values by calling Constructor.getDefaults()
 */
export function getDefaultsFromInstance(instance) {
    return instance.constructor.getDefaults();
}
/**
 * Returns the fallback if the given object is undefined.
 * Take an array of arguments and return a formatted options object.
 */
export function defaultArg(given, fallback) {
    if (isUndef(given)) {
        return fallback;
    }
    else {
        return given;
    }
}
/**
 * Remove all of the properties belonging to omit from obj.
 */
export function omitFromObject(obj, omit) {
    omit.forEach(function (prop) {
        if (Reflect.has(obj, prop)) {
            delete obj[prop];
        }
    });
    return obj;
}
//# sourceMappingURL=Defaults.js.map
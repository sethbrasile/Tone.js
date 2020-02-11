import { isArray } from "./TypeCheck";
/**
 * Make the property not writable using `defineProperty`. Internal use only.
 */
export function readOnly(target, property) {
    if (isArray(property)) {
        property.forEach(function (str) { return readOnly(target, str); });
    }
    else {
        Object.defineProperty(target, property, {
            enumerable: true,
            writable: false,
        });
    }
}
/**
 * Make an attribute writeable. Internal use only.
 */
export function writable(target, property) {
    if (isArray(property)) {
        property.forEach(function (str) { return writable(target, str); });
    }
    else {
        Object.defineProperty(target, property, {
            writable: true,
        });
    }
}
export var noOp = function () {
    // no operation here!
};
//# sourceMappingURL=Interface.js.map
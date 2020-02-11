import * as tslib_1 from "tslib";
import * as Classes from "./classes";
import { FrequencyClass } from "./core/type/Frequency";
import { MidiClass } from "./core/type/Midi";
import { TicksClass } from "./core/type/Ticks";
import { TimeClass } from "./core/type/Time";
import { TransportTimeClass } from "./core/type/TransportTime";
import { isDefined, isFunction } from "./core/util/TypeCheck";
import { omitFromObject } from "./core/util/Defaults";
/**
 * Bind the TimeBaseClass to the context
 */
function bindTypeClass(context, type) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (type.bind.apply(type, tslib_1.__spread([void 0, context], args)))();
    };
}
/**
 * Return an object with all of the classes bound to the passed in context
 * @param context The context to bind all of the nodes to
 */
export function fromContext(context) {
    var classesWithContext = {};
    Object.keys(omitFromObject(Classes, ["Transport", "Destination", "Draw"])).map(function (key) {
        var cls = Classes[key];
        if (isDefined(cls) && isFunction(cls.getDefaults)) {
            classesWithContext[key] = /** @class */ (function (_super) {
                tslib_1.__extends(ToneFromContextNode, _super);
                function ToneFromContextNode() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Object.defineProperty(ToneFromContextNode.prototype, "defaultContext", {
                    get: function () {
                        return context;
                    },
                    enumerable: true,
                    configurable: true
                });
                return ToneFromContextNode;
            }(cls));
        }
        else {
            // otherwise just copy it over
            classesWithContext[key] = Classes[key];
        }
    });
    var toneFromContext = tslib_1.__assign({}, classesWithContext, { now: context.now.bind(context), immediate: context.immediate.bind(context), Transport: context.transport, Destination: context.destination, Listener: context.listener, Draw: context.draw, context: context, 
        // the type functions
        Midi: bindTypeClass(context, MidiClass), Time: bindTypeClass(context, TimeClass), Frequency: bindTypeClass(context, FrequencyClass), Ticks: bindTypeClass(context, TicksClass), TransportTime: bindTypeClass(context, TransportTimeClass) });
    // return the object
    return toneFromContext;
}
//# sourceMappingURL=fromContext.js.map
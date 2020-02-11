import * as tslib_1 from "tslib";
import { Loop } from "./Loop";
import { PatternGenerator } from "./PatternGenerator";
import { optionsFromArguments } from "../core/util/Defaults";
import { noOp } from "../core/util/Interface";
/**
 * Pattern arpeggiates between the given notes
 * in a number of patterns.
 * @example
 * import { Pattern } from "tone";
 * const pattern = new Pattern((time, note) => {
 * 	// the order of the notes passed in depends on the pattern
 * }, ["C2", "D4", "E5", "A6"], "upDown");
 * @category Event
 */
var Pattern = /** @class */ (function (_super) {
    tslib_1.__extends(Pattern, _super);
    function Pattern() {
        var _this = _super.call(this, optionsFromArguments(Pattern.getDefaults(), arguments, ["callback", "values", "pattern"])) || this;
        _this.name = "Pattern";
        var options = optionsFromArguments(Pattern.getDefaults(), arguments, ["callback", "values", "pattern"]);
        _this.callback = options.callback;
        _this._values = options.values;
        _this._pattern = PatternGenerator(options.values, options.pattern);
        _this._type = options.pattern;
        return _this;
    }
    Pattern.getDefaults = function () {
        return Object.assign(Loop.getDefaults(), {
            pattern: "up",
            values: [],
            callback: noOp,
        });
    };
    /**
     * Internal function called when the notes should be called
     */
    Pattern.prototype._tick = function (time) {
        var value = this._pattern.next();
        this._value = value.value;
        this.callback(time, this._value);
    };
    Object.defineProperty(Pattern.prototype, "values", {
        /**
         * The array of events.
         */
        get: function () {
            return this._values;
        },
        set: function (val) {
            this._values = val;
            // reset the pattern
            this.pattern = this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Pattern.prototype, "value", {
        /**
         * The current value of the pattern.
         */
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Pattern.prototype, "pattern", {
        /**
         * The pattern type. See Tone.CtrlPattern for the full list of patterns.
         */
        get: function () {
            return this._type;
        },
        set: function (pattern) {
            this._type = pattern;
            this._pattern = PatternGenerator(this._values, this._type);
        },
        enumerable: true,
        configurable: true
    });
    return Pattern;
}(Loop));
export { Pattern };
//# sourceMappingURL=Pattern.js.map
import * as tslib_1 from "tslib";
import { Gain } from "../../core/context/Gain";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
/**
 * Solo lets you isolate a specific audio stream. When an instance is set to `solo=true`,
 * it will mute all other instances of Solo.
 * @example
 * import { Oscillator, Solo } from "tone";
 *
 * const soloA = new Solo().toDestination();
 * const oscA = new Oscillator("C4", "sawtooth").connect(soloA);
 * const soloB = new Solo().toDestination();
 * const oscB = new Oscillator("E4", "square").connect(soloB);
 *
 * soloA.solo = true;
 * // no audio will pass through soloB
 * @category Component
 */
var Solo = /** @class */ (function (_super) {
    tslib_1.__extends(Solo, _super);
    function Solo() {
        var _this = _super.call(this, optionsFromArguments(Solo.getDefaults(), arguments, ["solo"])) || this;
        _this.name = "Solo";
        var options = optionsFromArguments(Solo.getDefaults(), arguments, ["solo"]);
        _this.input = _this.output = new Gain({
            context: _this.context,
        });
        if (!Solo._allSolos.has(_this.context)) {
            Solo._allSolos.set(_this.context, new Set());
        }
        Solo._allSolos.get(_this.context).add(_this);
        // set initially
        _this.solo = options.solo;
        return _this;
    }
    Solo.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            solo: false,
        });
    };
    Object.defineProperty(Solo.prototype, "solo", {
        /**
         * Isolates this instance and mutes all other instances of Solo.
         * Only one instance can be soloed at a time. A soloed
         * instance will report `solo=false` when another instance is soloed.
         */
        get: function () {
            return this._isSoloed();
        },
        set: function (solo) {
            if (solo) {
                this._addSolo();
            }
            else {
                this._removeSolo();
            }
            Solo._allSolos.get(this.context).forEach(function (instance) { return instance._updateSolo(); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Solo.prototype, "muted", {
        /**
         * If the current instance is muted, i.e. another instance is soloed
         */
        get: function () {
            return this.input.gain.value === 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Add this to the soloed array
     */
    Solo.prototype._addSolo = function () {
        if (!Solo._soloed.has(this.context)) {
            Solo._soloed.set(this.context, new Set());
        }
        Solo._soloed.get(this.context).add(this);
    };
    /**
     * Remove this from the soloed array
     */
    Solo.prototype._removeSolo = function () {
        if (Solo._soloed.has(this.context)) {
            Solo._soloed.get(this.context).delete(this);
        }
    };
    /**
     * Is this on the soloed array
     */
    Solo.prototype._isSoloed = function () {
        return Solo._soloed.has(this.context) && Solo._soloed.get(this.context).has(this);
    };
    /**
     * Returns true if no one is soloed
     */
    Solo.prototype._noSolos = function () {
        // either does not have any soloed added
        return !Solo._soloed.has(this.context) ||
            // or has a solo set but doesn't include any items
            (Solo._soloed.has(this.context) && Solo._soloed.get(this.context).size === 0);
    };
    /**
     * Solo the current instance and unsolo all other instances.
     */
    Solo.prototype._updateSolo = function () {
        if (this._isSoloed()) {
            this.input.gain.value = 1;
        }
        else if (this._noSolos()) {
            // no one is soloed
            this.input.gain.value = 1;
        }
        else {
            this.input.gain.value = 0;
        }
    };
    Solo.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        Solo._allSolos.get(this.context).delete(this);
        this._removeSolo();
        return this;
    };
    /**
     * Hold all of the solo'ed tracks belonging to a specific context
     */
    Solo._allSolos = new Map();
    /**
     * Hold the currently solo'ed instance(s)
     */
    Solo._soloed = new Map();
    return Solo;
}(ToneAudioNode));
export { Solo };
//# sourceMappingURL=Solo.js.map
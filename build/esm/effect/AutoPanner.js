import * as tslib_1 from "tslib";
import { Panner } from "../component/channel/Panner";
import { optionsFromArguments } from "../core/util/Defaults";
import { LFOEffect } from "./LFOEffect";
/**
 * AutoPanner is a [[Panner]] with an [[LFO]] connected to the pan amount.
 * [Related Reading](https://www.ableton.com/en/blog/autopan-chopper-effect-and-more-liveschool/).
 *
 * @example
 * import { AutoPanner, Oscillator } from "tone";
 * // create an autopanner and start it
 * const autoPanner = new AutoPanner("4n").toDestination().start();
 * // route an oscillator through the panner and start it
 * const oscillator = new Oscillator().connect(autoPanner).start();
 * @category Effect
 */
var AutoPanner = /** @class */ (function (_super) {
    tslib_1.__extends(AutoPanner, _super);
    function AutoPanner() {
        var _this = _super.call(this, optionsFromArguments(AutoPanner.getDefaults(), arguments, ["frequency"])) || this;
        _this.name = "AutoPanner";
        _this._panner = new Panner({ context: _this.context });
        // connections
        _this.connectEffect(_this._panner);
        _this._lfo.connect(_this._panner.pan);
        _this._lfo.min = -1;
        _this._lfo.max = 1;
        return _this;
    }
    AutoPanner.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._panner.dispose();
        return this;
    };
    return AutoPanner;
}(LFOEffect));
export { AutoPanner };
//# sourceMappingURL=AutoPanner.js.map
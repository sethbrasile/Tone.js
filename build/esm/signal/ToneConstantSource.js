import * as tslib_1 from "tslib";
import { connect } from "../core/context/ToneAudioNode";
import { Param } from "../core/context/Param";
import { optionsFromArguments } from "../core/util/Defaults";
import { OneShotSource } from "../source/OneShotSource";
/**
 * Wrapper around the native fire-and-forget ConstantSource.
 * Adds the ability to reschedule the stop method.
 * @category Signal
 */
var ToneConstantSource = /** @class */ (function (_super) {
    tslib_1.__extends(ToneConstantSource, _super);
    function ToneConstantSource() {
        var _this = _super.call(this, optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"])) || this;
        _this.name = "ToneConstantSource";
        /**
         * The signal generator
         */
        _this._source = _this.context.createConstantSource();
        var options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);
        connect(_this._source, _this._gainNode);
        _this.offset = new Param({
            context: _this.context,
            convert: options.convert,
            param: _this._source.offset,
            units: options.units,
            value: options.offset,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        return _this;
    }
    ToneConstantSource.getDefaults = function () {
        return Object.assign(OneShotSource.getDefaults(), {
            convert: true,
            offset: 1,
            units: "number",
        });
    };
    /**
     * Start the source node at the given time
     * @param  time When to start the source
     */
    ToneConstantSource.prototype.start = function (time) {
        var computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        this._source.start(computedTime);
        return this;
    };
    ToneConstantSource.prototype._stopSource = function (time) {
        this._source.stop(time);
    };
    ToneConstantSource.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this.state === "started") {
            this.stop();
        }
        this._source.disconnect();
        this.offset.dispose();
        return this;
    };
    return ToneConstantSource;
}(OneShotSource));
export { ToneConstantSource };
//# sourceMappingURL=ToneConstantSource.js.map
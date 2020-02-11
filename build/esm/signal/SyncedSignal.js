import * as tslib_1 from "tslib";
import { Signal } from "./Signal";
import { optionsFromArguments } from "../core/util/Defaults";
import { TransportTimeClass } from "../core/type/TransportTime";
import { ToneConstantSource } from "./ToneConstantSource";
/**
 * Adds the ability to synchronize the signal to the [[Transport]]
 */
var SyncedSignal = /** @class */ (function (_super) {
    tslib_1.__extends(SyncedSignal, _super);
    function SyncedSignal() {
        var _this = _super.call(this, optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"])) || this;
        _this.name = "SyncedSignal";
        /**
         * Don't override when something is connected to the input
         */
        _this.override = false;
        var options = optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]);
        _this._lastVal = options.value;
        _this._synced = _this.context.transport.scheduleRepeat(_this._onTick.bind(_this), "1i");
        _this._syncedCallback = _this._anchorValue.bind(_this);
        _this.context.transport.on("start", _this._syncedCallback);
        _this.context.transport.on("pause", _this._syncedCallback);
        _this.context.transport.on("stop", _this._syncedCallback);
        // disconnect the constant source from the output and replace it with another one
        _this._constantSource.disconnect();
        _this._constantSource.stop(0);
        // create a new one
        _this._constantSource = _this.output = new ToneConstantSource({
            context: _this.context,
            offset: options.value,
            units: options.units,
        }).start(0);
        _this.setValueAtTime(options.value, 0);
        return _this;
    }
    /**
     * Callback which is invoked every tick.
     */
    SyncedSignal.prototype._onTick = function (time) {
        var val = _super.prototype.getValueAtTime.call(this, this.context.transport.seconds);
        // approximate ramp curves with linear ramps
        if (this._lastVal !== val) {
            this._lastVal = val;
            this._constantSource.offset.setValueAtTime(val, time);
        }
    };
    /**
     * Anchor the value at the start and stop of the Transport
     */
    SyncedSignal.prototype._anchorValue = function (time) {
        var val = _super.prototype.getValueAtTime.call(this, this.context.transport.seconds);
        this._lastVal = val;
        this._constantSource.offset.cancelAndHoldAtTime(time);
        this._constantSource.offset.setValueAtTime(val, time);
    };
    SyncedSignal.prototype.getValueAtTime = function (time) {
        var computedTime = new TransportTimeClass(this.context, time).toSeconds();
        return _super.prototype.getValueAtTime.call(this, computedTime);
    };
    SyncedSignal.prototype.setValueAtTime = function (value, time) {
        var computedTime = new TransportTimeClass(this.context, time).toSeconds();
        _super.prototype.setValueAtTime.call(this, value, computedTime);
        return this;
    };
    SyncedSignal.prototype.linearRampToValueAtTime = function (value, time) {
        var computedTime = new TransportTimeClass(this.context, time).toSeconds();
        _super.prototype.linearRampToValueAtTime.call(this, value, computedTime);
        return this;
    };
    SyncedSignal.prototype.exponentialRampToValueAtTime = function (value, time) {
        var computedTime = new TransportTimeClass(this.context, time).toSeconds();
        _super.prototype.exponentialRampToValueAtTime.call(this, value, computedTime);
        return this;
    };
    SyncedSignal.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
        var computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        _super.prototype.setTargetAtTime.call(this, value, computedTime, timeConstant);
        return this;
    };
    SyncedSignal.prototype.cancelScheduledValues = function (startTime) {
        var computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        _super.prototype.cancelScheduledValues.call(this, computedTime);
        return this;
    };
    SyncedSignal.prototype.setValueCurveAtTime = function (values, startTime, duration, scaling) {
        var computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        duration = this.toSeconds(duration);
        _super.prototype.setValueCurveAtTime.call(this, values, computedTime, duration, scaling);
        return this;
    };
    SyncedSignal.prototype.cancelAndHoldAtTime = function (time) {
        var computedTime = new TransportTimeClass(this.context, time).toSeconds();
        _super.prototype.cancelAndHoldAtTime.call(this, computedTime);
        return this;
    };
    SyncedSignal.prototype.setRampPoint = function (time) {
        var computedTime = new TransportTimeClass(this.context, time).toSeconds();
        _super.prototype.setRampPoint.call(this, computedTime);
        return this;
    };
    SyncedSignal.prototype.exponentialRampTo = function (value, rampTime, startTime) {
        var computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        _super.prototype.exponentialRampTo.call(this, value, rampTime, computedTime);
        return this;
    };
    SyncedSignal.prototype.linearRampTo = function (value, rampTime, startTime) {
        var computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        _super.prototype.linearRampTo.call(this, value, rampTime, computedTime);
        return this;
    };
    SyncedSignal.prototype.targetRampTo = function (value, rampTime, startTime) {
        var computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        _super.prototype.targetRampTo.call(this, value, rampTime, computedTime);
        return this;
    };
    SyncedSignal.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.context.transport.clear(this._synced);
        this.context.transport.off("start", this._syncedCallback);
        this.context.transport.off("pause", this._syncedCallback);
        this.context.transport.off("stop", this._syncedCallback);
        this._constantSource.dispose();
        return this;
    };
    return SyncedSignal;
}(Signal));
export { SyncedSignal };
//# sourceMappingURL=SyncedSignal.js.map
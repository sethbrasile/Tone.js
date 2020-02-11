import * as tslib_1 from "tslib";
import { ToneAudioNode } from "./ToneAudioNode";
import { noOp } from "../util/Interface";
var ToneAudioWorklet = /** @class */ (function (_super) {
    tslib_1.__extends(ToneAudioWorklet, _super);
    function ToneAudioWorklet(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "ToneAudioWorklet";
        /**
         * The constructor options for the node
         */
        _this.workletOptions = {};
        /**
         * Callback which is invoked when there is an error in the processing
         */
        _this.onprocessorerror = noOp;
        var blobUrl = URL.createObjectURL(new Blob([_this._audioWorklet()], { type: "text/javascript" }));
        var name = _this._audioWorkletName();
        // Register the processor
        _this.context.addAudioWorkletModule(blobUrl, name).then(function () {
            // create the worklet when it's read
            if (!_this.disposed) {
                _this._worklet = _this.context.createAudioWorkletNode(name, _this.workletOptions);
                _this._worklet.onprocessorerror = _this.onprocessorerror.bind(_this);
                _this.onReady(_this._worklet);
            }
        });
        return _this;
    }
    ToneAudioWorklet.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        if (this._worklet) {
            this._worklet.disconnect();
        }
        return this;
    };
    return ToneAudioWorklet;
}(ToneAudioNode));
export { ToneAudioWorklet };
//# sourceMappingURL=ToneAudioWorklet.js.map
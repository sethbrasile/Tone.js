import * as tslib_1 from "tslib";
import { ToneAudioNode } from "./ToneAudioNode";
import { Param } from "./Param";
import { onContextClose, onContextInit } from "./ContextInitialization";
/**
 * Tone.Listener is a thin wrapper around the AudioListener. Listener combined
 * with [[Panner3D]] makes up the Web Audio API's 3D panning system. Panner3D allows you
 * to place sounds in 3D and Listener allows you to navigate the 3D sound environment from
 * a first-person perspective. There is only one listener per audio context.
 */
var Listener = /** @class */ (function (_super) {
    tslib_1.__extends(Listener, _super);
    function Listener() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "Listener";
        _this.positionX = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.positionX,
        });
        _this.positionY = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.positionY,
        });
        _this.positionZ = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.positionZ,
        });
        _this.forwardX = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.forwardX,
        });
        _this.forwardY = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.forwardY,
        });
        _this.forwardZ = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.forwardZ,
        });
        _this.upX = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.upX,
        });
        _this.upY = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.upY,
        });
        _this.upZ = new Param({
            context: _this.context,
            param: _this.context.rawContext.listener.upZ,
        });
        return _this;
    }
    Listener.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            forwardX: 0,
            forwardY: 0,
            forwardZ: -1,
            upX: 0,
            upY: 1,
            upZ: 0,
        });
    };
    Listener.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.positionX.dispose();
        this.positionY.dispose();
        this.positionZ.dispose();
        this.forwardX.dispose();
        this.forwardY.dispose();
        this.forwardZ.dispose();
        this.upX.dispose();
        this.upY.dispose();
        this.upZ.dispose();
        return this;
    };
    return Listener;
}(ToneAudioNode));
export { Listener };
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(function (context) {
    context.listener = new Listener({ context: context });
});
onContextClose(function (context) {
    context.listener.dispose();
});
//# sourceMappingURL=Listener.js.map
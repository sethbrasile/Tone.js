import * as tslib_1 from "tslib";
import { Param } from "../../core/context/Param";
import { ToneAudioNode } from "../../core/context/ToneAudioNode";
import { optionsFromArguments } from "../../core/util/Defaults";
import "../../core/context/Listener";
/**
 * A spatialized panner node which supports equalpower or HRTF panning.
 * @category Component
 */
var Panner3D = /** @class */ (function (_super) {
    tslib_1.__extends(Panner3D, _super);
    function Panner3D() {
        var _this = _super.call(this, optionsFromArguments(Panner3D.getDefaults(), arguments, ["positionX", "positionY", "positionZ"])) || this;
        _this.name = "Panner3D";
        var options = optionsFromArguments(Panner3D.getDefaults(), arguments, ["positionX", "positionY", "positionZ"]);
        _this._panner = _this.input = _this.output = _this.context.createPanner();
        // set some values
        _this.panningModel = options.panningModel;
        _this.maxDistance = options.maxDistance;
        _this.distanceModel = options.distanceModel;
        _this.coneOuterGain = options.coneOuterGain;
        _this.coneOuterAngle = options.coneOuterAngle;
        _this.coneInnerAngle = options.coneInnerAngle;
        _this.refDistance = options.refDistance;
        _this.rolloffFactor = options.rolloffFactor;
        _this.positionX = new Param({
            context: _this.context,
            param: _this._panner.positionX,
            value: options.positionX,
        });
        _this.positionY = new Param({
            context: _this.context,
            param: _this._panner.positionY,
            value: options.positionY,
        });
        _this.positionZ = new Param({
            context: _this.context,
            param: _this._panner.positionZ,
            value: options.positionZ,
        });
        _this.orientationX = new Param({
            context: _this.context,
            param: _this._panner.orientationX,
            value: options.orientationX,
        });
        _this.orientationY = new Param({
            context: _this.context,
            param: _this._panner.orientationY,
            value: options.orientationY,
        });
        _this.orientationZ = new Param({
            context: _this.context,
            param: _this._panner.orientationZ,
            value: options.orientationZ,
        });
        return _this;
    }
    Panner3D.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
            distanceModel: "inverse",
            maxDistance: 10000,
            orientationX: 0,
            orientationY: 0,
            orientationZ: 0,
            panningModel: "equalpower",
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            refDistance: 1,
            rolloffFactor: 1,
        });
    };
    /**
     * Sets the position of the source in 3d space.
     */
    Panner3D.prototype.setPosition = function (x, y, z) {
        this.positionX.value = x;
        this.positionY.value = y;
        this.positionZ.value = z;
        return this;
    };
    /**
     * Sets the orientation of the source in 3d space.
     */
    Panner3D.prototype.setOrientation = function (x, y, z) {
        this.orientationX.value = x;
        this.orientationY.value = y;
        this.orientationZ.value = z;
        return this;
    };
    Object.defineProperty(Panner3D.prototype, "panningModel", {
        /**
         * The panning model. Either "equalpower" or "HRTF".
         */
        get: function () {
            return this._panner.panningModel;
        },
        set: function (val) {
            this._panner.panningModel = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "refDistance", {
        /**
         * A reference distance for reducing volume as source move further from the listener
         */
        get: function () {
            return this._panner.refDistance;
        },
        set: function (val) {
            this._panner.refDistance = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "rolloffFactor", {
        /**
         * Describes how quickly the volume is reduced as source moves away from listener.
         */
        get: function () {
            return this._panner.rolloffFactor;
        },
        set: function (val) {
            this._panner.rolloffFactor = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "distanceModel", {
        /**
         * The distance model used by,  "linear", "inverse", or "exponential".
         */
        get: function () {
            return this._panner.distanceModel;
        },
        set: function (val) {
            this._panner.distanceModel = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "coneInnerAngle", {
        /**
         * The angle, in degrees, inside of which there will be no volume reduction
         */
        get: function () {
            return this._panner.coneInnerAngle;
        },
        set: function (val) {
            this._panner.coneInnerAngle = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "coneOuterAngle", {
        /**
         * The angle, in degrees, outside of which the volume will be reduced
         * to a constant value of coneOuterGain
         */
        get: function () {
            return this._panner.coneOuterAngle;
        },
        set: function (val) {
            this._panner.coneOuterAngle = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "coneOuterGain", {
        /**
         * The gain outside of the coneOuterAngle
         */
        get: function () {
            return this._panner.coneOuterGain;
        },
        set: function (val) {
            this._panner.coneOuterGain = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Panner3D.prototype, "maxDistance", {
        /**
         * The maximum distance between source and listener,
         * after which the volume will not be reduced any further.
         */
        get: function () {
            return this._panner.maxDistance;
        },
        set: function (val) {
            this._panner.maxDistance = val;
        },
        enumerable: true,
        configurable: true
    });
    Panner3D.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._panner.disconnect();
        this.orientationX.dispose();
        this.orientationY.dispose();
        this.orientationZ.dispose();
        this.positionX.dispose();
        this.positionY.dispose();
        this.positionZ.dispose();
        return this;
    };
    return Panner3D;
}(ToneAudioNode));
export { Panner3D };
//# sourceMappingURL=Panner3D.js.map
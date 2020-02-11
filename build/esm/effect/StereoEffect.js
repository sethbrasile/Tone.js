import * as tslib_1 from "tslib";
import { connect, connectSeries, ToneAudioNode } from "../core/context/ToneAudioNode";
import { CrossFade } from "../component/channel/CrossFade";
import { Split } from "../component/channel/Split";
import { Gain } from "../core/context/Gain";
import { Merge } from "../component/channel/Merge";
import { readOnly } from "../core/util/Interface";
/**
 * Base class for Stereo effects.
 */
var StereoEffect = /** @class */ (function (_super) {
    tslib_1.__extends(StereoEffect, _super);
    function StereoEffect(options) {
        var _this = _super.call(this, options) || this;
        _this.name = "StereoEffect";
        _this.input = new Gain({ context: _this.context });
        // force mono sources to be stereo
        _this.input.channelCount = 2;
        _this.input.channelCountMode = "explicit";
        _this._dryWet = _this.output = new CrossFade({
            context: _this.context,
            fade: options.wet
        });
        _this.wet = _this._dryWet.fade;
        _this._split = new Split({ context: _this.context, channels: 2 });
        _this._merge = new Merge({ context: _this.context, channels: 2 });
        // connections
        _this.input.connect(_this._split);
        // dry wet connections
        _this.input.connect(_this._dryWet.a);
        _this._merge.connect(_this._dryWet.b);
        readOnly(_this, ["wet"]);
        return _this;
    }
    /**
     * Connect the left part of the effect
     */
    StereoEffect.prototype.connectEffectLeft = function () {
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        this._split.connect(nodes[0], 0, 0);
        connectSeries.apply(void 0, tslib_1.__spread(nodes));
        connect(nodes[nodes.length - 1], this._merge, 0, 0);
    };
    /**
     * Connect the right part of the effect
     */
    StereoEffect.prototype.connectEffectRight = function () {
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        this._split.connect(nodes[0], 1, 0);
        connectSeries.apply(void 0, tslib_1.__spread(nodes));
        connect(nodes[nodes.length - 1], this._merge, 0, 1);
    };
    StereoEffect.getDefaults = function () {
        return Object.assign(ToneAudioNode.getDefaults(), {
            wet: 1,
        });
    };
    StereoEffect.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._dryWet.dispose();
        this._split.dispose();
        this._merge.dispose();
        return this;
    };
    return StereoEffect;
}(ToneAudioNode));
export { StereoEffect };
//# sourceMappingURL=StereoEffect.js.map